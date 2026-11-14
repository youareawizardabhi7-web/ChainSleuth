import { useAppStore } from "./store";
import {
  CaseSummary,
  Chain,
  LegalNoticePayload,
  TraceRequest,
  TraceResult,
  VASPAttribution,
  WalletNode,
  TransferEdge,
  CaseClustersResponse,
  WalletCluster,
  FIRCreate,
  FIRResponse,
  NCRPComplaintRecord,
  NCRPBatchIngestRequest,
  NCRPBatchIngestResponse,
  SyndicateCorrelationItem,
  NcrpCorrelationsResponse,
  AuditLogItem,
  AuthUser,
  AuthRoles,
  CustomWalletTagPayload,
  CustomWalletLabelItem,
  BridgeHopItem,
  CaseBridgesResponse,
  PrivacySwapperItem,
  CasePrivacyResponse,
  IntermediaryMule,
  LayeringAnalysisPath,
  LayeringAnalysisResponse,
  EvidenceCertResponse,
  AIReportResponse,
} from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://chain-sleuth-backend.onrender.com/api/v1"
).replace(/\/+$/, "");

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const storeToken = useAppStore.getState().token;
  if (storeToken) return storeToken;
  return localStorage.getItem("token") || localStorage.getItem("auth_token") || null;
}

export function getAuthHeaders(customToken?: string, contentType = "application/json"): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  const token = customToken || getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchAuthMe(token?: string): Promise<AuthUser> {
  if (!token) {
    return {
      email: "officer@chainsleuth.gov.in",
      name: "Investigating Officer",
      role: "investigating_officer",
    };
  }
  try {
    const headers = getAuthHeaders(token, "");
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      return {
        email: "officer@chainsleuth.gov.in",
        name: "Investigating Officer",
        role: "investigating_officer",
      };
    }
    return await res.json();
  } catch {
    return {
      email: "officer@chainsleuth.gov.in",
      name: "Investigating Officer",
      role: "investigating_officer",
    };
  }
}

export async function fetchAuthRoles(token?: string): Promise<AuthRoles> {
  if (!token) {
    return {
      roles: ["investigating_officer", "supervisory_officer", "vasp_nodal_officer"],
      permissions: [],
      active_role: "investigating_officer",
    };
  }
  try {
    const headers = getAuthHeaders(token, "");
    const res = await fetch(`${API_BASE_URL}/auth/roles`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      return {
        roles: ["investigating_officer", "supervisory_officer", "vasp_nodal_officer"],
        permissions: [],
        active_role: "investigating_officer",
      };
    }
    const data = await res.json();
    return {
      roles: Array.isArray(data.roles) ? data.roles : ["investigating_officer", "supervisory_officer", "vasp_nodal_officer"],
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
      active_role: data.active_role || "investigating_officer",
    };
  } catch {
    return {
      roles: ["investigating_officer", "supervisory_officer", "vasp_nodal_officer"],
      permissions: [],
      active_role: "investigating_officer",
    };
  }
}

export async function createTrace(req: TraceRequest): Promise<TraceResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/trace/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Backend API Error (${res.status}): ${errorText || res.statusText}`);
    }

    const data = await res.json();
    return {
      ...data,
      chain: normalizeChain(data.chain || data.blockchain_type),
      nodes: data.nodes || [],
      edges: data.edges || [],
      attribution: data.attribution || null,
    };
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === "TypeError" || err.message === "Failed to fetch")) {
      throw new Error(
        `Unable to reach forensic trace backend service (${API_BASE_URL}). The backend service may be starting up or experiencing network connectivity issues. Please try again.`
      );
    }
    throw err;
  }
}

export async function getCase(caseId: string): Promise<TraceResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    // Try primary route: /cases/{caseId}
    let res = await fetch(`${API_BASE_URL}/cases/${encodeURIComponent(caseId)}`, {
      headers: getAuthHeaders("", ""),
      signal: controller.signal,
    });

    // If 404, try secondary route: /trace/{caseId}
    if (!res.ok && res.status === 404) {
      const secondaryRes = await fetch(`${API_BASE_URL}/trace/${encodeURIComponent(caseId)}`, {
        headers: getAuthHeaders("", ""),
        signal: controller.signal,
      });
      if (secondaryRes.ok) {
        res = secondaryRes;
      }
    }

    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        chain: normalizeChain(data.chain || data.blockchain_type),
        nodes: data.nodes || [],
        edges: data.edges || [],
        attribution: data.attribution || null,
      };
    }

    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to load case "${caseId}" (${res.status}): ${errorText || res.statusText}`);
  } catch (err) {
    clearTimeout(timer);
    console.error(`[API] getCase failed for case ${caseId}:`, err);
    throw err;
  }
}

export function normalizeChain(rawChain?: string): Chain {
  if (!rawChain) return "tron";
  const lower = rawChain.toLowerCase();
  if (lower.includes("base")) return "base";
  if (lower.includes("btc") || lower.includes("bitcoin")) return "bitcoin";
  if (lower.includes("eth") || lower.includes("ethereum")) return "ethereum";
  if (lower.includes("sol") || lower.includes("solana")) return "solana";
  if (lower.includes("tron") || lower.includes("trx")) return "tron";
  return (lower as Chain) || "tron";
}

export async function getCases(): Promise<CaseSummary[]> {
  const res = await fetch(`${API_BASE_URL}/cases/`, {
    headers: getAuthHeaders("", ""),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch cases (${res.status}): ${errorText}`);
  }

  const rawList: Record<string, unknown>[] = await res.json();
  return rawList.map((item) => ({
    ...(item as unknown as CaseSummary),
    chain: normalizeChain((item.chain || item.blockchain_type) as string | undefined),
    attributed_vasp_name: (item.attributed_vasp_name || item.attributed_vasp) as string | undefined,
  }));
}

export async function parseFir(complaintText: string): Promise<Partial<TraceRequest>> {
  const res = await fetch(`${API_BASE_URL}/fir/parse`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ complaintText, complaint_text: complaintText }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to parse incident narrative (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    suspect_address: data.suspect_wallet_address || data.suspect_address || "",
    chain: normalizeChain(data.blockchain_type || data.chain),
    max_hops: data.max_trace_hops || data.max_hops || 5,
    value_threshold_pct: 2.0,
    complaint_id: data.complaint_id,
  };
}

export async function generateNotice(
  payload: LegalNoticePayload
): Promise<{ pdfUrl: string; sha256_evidence_hash: string }> {
  const res = await fetch(`${API_BASE_URL}/notices/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to generate legal freeze notice (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  const pdfUrl = data.pdf_url?.startsWith("http")
    ? data.pdf_url
    : `${origin}${data.pdf_url}`;

  return {
    pdfUrl,
    sha256_evidence_hash: data.sha256_evidence_hash || "",
  };
}

export async function downloadCourtEvidenceBundle(caseId: string): Promise<void> {
  let res: Response;
  try {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    res = await fetch(`${API_BASE_URL}/cases/${encodeURIComponent(caseId)}/export-bundle`, {
      method: "GET",
      headers,
    });
  } catch (err) {
    console.error("[API] downloadCourtEvidenceBundle network failure:", err);
    throw new Error("Connection error: Unable to reach backend server.");
  }

  if (res.status === 401) {
    throw new Error("Authentication error (401): Please log in again.");
  }
  if (res.status === 403) {
    throw new Error("Permission error (403): You do not have authorization to export evidence bundles.");
  }
  if (res.status === 404) {
    throw new Error("Case/evidence unavailable (404): Evidence bundle not found for this case.");
  }
  if (res.status >= 500) {
    throw new Error("Backend generation failure (500): Server error while building evidence package.");
  }
  if (!res.ok) {
    throw new Error(`Export failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Case_${caseId}_Court_Evidence_Bundle.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function getCaseClusters(caseId: string): Promise<CaseClustersResponse> {
  const emptyResponse: CaseClustersResponse = {
    case_id: caseId,
    cluster_count: 0,
    clusters: [],
  };

  try {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE_URL}/cases/${encodeURIComponent(caseId)}/clusters`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const clustersList: WalletCluster[] = Array.isArray(data.clusters)
        ? data.clusters
        : Array.isArray(data)
        ? data
        : [];

      return {
        case_id: data.case_id || caseId,
        cluster_count: typeof data.cluster_count === "number" ? data.cluster_count : clustersList.length,
        clusters: clustersList,
      };
    }
    return emptyResponse;
  } catch (err) {
    console.warn("[API] getCaseClusters lookup failed:", err);
    return emptyResponse;
  }
}

export async function createFir(payload: FIRCreate): Promise<FIRResponse> {
  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    res = await fetch(`${API_BASE_URL}/fir/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[API] createFir network failure:", err);
    throw new Error("Connection error: Unable to reach backend server.");
  }

  if (res.status === 401) {
    throw new Error("Authentication error (401): Please log in to generate an incident docket.");
  }
  if (res.status === 403) {
    throw new Error("Permission error (403): You do not have authorization to generate an incident docket.");
  }
  if (res.status === 422) {
    const errorBody = await res.json().catch(() => null);
    const detailMsg = errorBody?.detail
      ? Array.isArray(errorBody.detail)
        ? errorBody.detail.map((d: { msg?: string }) => d.msg || "").join(", ")
        : errorBody.detail
      : "";
    throw new Error(`Validation error (422): ${detailMsg || "Please check your input fields."}`);
  }
  if (res.status >= 500) {
    throw new Error("Backend generation failure (500): Failed to generate case docket document on server.");
  }
  if (!res.ok) {
    throw new Error(`Case docket generation failed with status ${res.status}`);
  }

  const data: FIRResponse = await res.json();
  return data;
}

export async function downloadFir(firId: string, pdfUrl?: string): Promise<void> {
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  const targetUrl = pdfUrl
    ? pdfUrl.startsWith("http")
      ? pdfUrl
      : `${origin}${pdfUrl}`
    : `${API_BASE_URL}/fir/${encodeURIComponent(firId)}/download`;

  if (typeof window !== "undefined") {
    window.open(targetUrl, "_blank");
  }
}

export async function ingestNcrpComplaints(
  payload: NCRPBatchIngestRequest | NCRPComplaintRecord[]
): Promise<NCRPBatchIngestResponse> {
  let res: Response;
  const bodyPayload = Array.isArray(payload) ? { complaints: payload } : payload;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    res = await fetch(`${API_BASE_URL}/ncrp/ingest`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload),
    });
  } catch (err) {
    console.error("[API] ingestNcrpComplaints network failure:", err);
    throw new Error("Connection error: Unable to reach backend server.");
  }

  if (res.status === 401) {
    throw new Error("Authentication error (401): Please log in to ingest NCRP/SAHYOG complaints.");
  }
  if (res.status === 403) {
    throw new Error("Permission error (403): You do not have permission to ingest NCRP/SAHYOG complaints.");
  }
  if (res.status === 422) {
    const errorBody = await res.json().catch(() => null);
    const detailMsg = errorBody?.detail
      ? Array.isArray(errorBody.detail)
        ? errorBody.detail.map((d: { msg?: string }) => d.msg || "").join(", ")
        : errorBody.detail
      : "";
    throw new Error(`Validation error (422): ${detailMsg || "Please check submitted complaint parameters."}`);
  }
  if (res.status >= 500) {
    throw new Error("Backend processing failure (500): Server error during NCRP complaint ingestion.");
  }
  if (!res.ok) {
    throw new Error(`NCRP Ingestion failed with status ${res.status}`);
  }

  const data: NCRPBatchIngestResponse = await res.json();
  return data;
}

export async function runNcrpBatchTrace(complaintIds: string[]): Promise<TraceResult[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}/ncrp/batch-trace`, {
    method: "POST",
    headers,
    body: JSON.stringify(complaintIds),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Batch trace failed with status ${res.status}: ${errorText || res.statusText}`);
  }

  const data: TraceResult[] = await res.json();
  return data;
}

export async function getNcrpCorrelations(): Promise<NcrpCorrelationsResponse> {
  const emptyResponse: NcrpCorrelationsResponse = {
    total_correlations: 0,
    correlations: [],
  };

  try {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const res = await fetch(`${API_BASE_URL}/ncrp/correlations`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      return emptyResponse;
    }

    const data = await res.json();
    const rawList: SyndicateCorrelationItem[] = Array.isArray(data.correlations)
      ? data.correlations
      : Array.isArray(data)
      ? data
      : [];

    return {
      total_correlations: typeof data.total_correlations === "number" ? data.total_correlations : rawList.length,
      correlations: rawList,
    };
  } catch (err) {
    console.warn("[API] getNcrpCorrelations network failure:", err);
    return emptyResponse;
  }
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  let res: Response;
  try {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    res = await fetch(`${API_BASE_URL}/audit/logs`, {
      method: "GET",
      headers,
    });
  } catch (err) {
    console.error("[API] getAuditLogs network failure:", err);
    throw new Error("Unable to retrieve supervisory audit logs.");
  }

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error(`Failed to fetch supervisory audit logs (${res.status})`);
  }

  const data = await res.json();
  const logsList: AuditLogItem[] = Array.isArray(data.logs)
    ? data.logs
    : Array.isArray(data)
    ? data
    : [];

  return logsList;
}

export async function getVaspRegistry(): Promise<CustomWalletLabelItem[]> {
  let res: Response;
  try {
    const headers = getAuthHeaders(undefined, "");
    res = await fetch(`${API_BASE_URL}/vasp/labels`, {
      method: "GET",
      headers,
    });
  } catch (err) {
    console.error("[API] getVaspRegistry network failure:", err);
    throw new Error("Unable to load VASP labels database.");
  }

  if (!res.ok) {
    throw new Error(`Unable to load VASP labels database (${res.status}).`);
  }

  const data = await res.json();
  const list = Array.isArray(data.labels)
    ? data.labels
    : Array.isArray(data.registry)
    ? data.registry
    : Array.isArray(data)
    ? data
    : [];
  return list;
}

export async function getCustomLabels(query?: string): Promise<CustomWalletLabelItem[]> {
  let res: Response;
  try {
    const headers = getAuthHeaders(undefined, "");
    const url = query
      ? `${API_BASE_URL}/vasp/labels?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/vasp/labels`;

    res = await fetch(url, {
      method: "GET",
      headers,
    });
  } catch (err) {
    console.error("[API] getCustomLabels network failure:", err);
    throw new Error("Unable to load custom wallet labels.");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch custom wallet labels (${res.status})`);
  }

  const data = await res.json();
  const labelsList: CustomWalletLabelItem[] = Array.isArray(data.labels)
    ? data.labels
    : Array.isArray(data)
    ? data
    : [];

  return labelsList;
}

export async function tagCustomWallet(payload: CustomWalletTagPayload): Promise<{ success: boolean; message?: string }> {
  let res: Response;
  try {
    const headers = getAuthHeaders(undefined, "application/json");
    res = await fetch(`${API_BASE_URL}/vasp/labels`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[API] tagCustomWallet network failure:", err);
    throw new Error("Unable to save wallet tag.");
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Unable to save wallet tag (${res.status}): ${errorText}`);
  }

  return await res.json().catch(() => ({ success: true }));
}

export async function getWalletTags(address: string): Promise<CustomWalletLabelItem[]> {
  if (!address) return [];

  // 1. Primary: Look up investigator annotations created via the internal database
  try {
    const customList = await getCustomLabels(address);
    if (Array.isArray(customList) && customList.length > 0) {
      return customList;
    }
  } catch (err) {
    console.warn("[API] getCustomLabels lookup failed:", err);
  }

  // 2. Secondary: Check VASP / Threat Intel tags endpoint for agency DB attributions
  try {
    const headers = getAuthHeaders(undefined, "");
    const res = await fetch(`${API_BASE_URL}/vasp/tags/${encodeURIComponent(address)}`, {
      method: "GET",
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      // If agency DB or threat intel identified a real entity (not a generic unattributed wallet)
      if (
        data &&
        typeof data === "object" &&
        data.source !== "unattributed" &&
        data.category !== "unattributed" &&
        (data.entity_name || data.vasp_name)
      ) {
        return [
          {
            id: data.id || data.address || address,
            address: data.address || address,
            entity_name: data.entity_name || data.vasp_name,
            entity_type: data.entity_type || data.category || "vasp",
            chain: data.chain,
            confidence: data.confidence,
            source: data.source,
            case_reference: data.case_reference,
            notes: data.notes,
            tags: Array.isArray(data.tags) ? data.tags : [],
          },
        ];
      }
    }
  } catch {
    // Fallback: no annotations found
  }

  return [];
}

export const runTrace = createTrace;
export const fetchCase = getCase;
export const fetchCases = getCases;

export async function getCaseBridges(caseId: string): Promise<CaseBridgesResponse> {
  const emptyResponse: CaseBridgesResponse = {
    case_id: caseId,
    total_bridges_detected: 0,
    bridge_hops: [],
  };

  const encodedId = encodeURIComponent(caseId);
  try {
    const headers = getAuthHeaders(undefined, "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_BASE_URL}/cases/${encodedId}/bridge-hops`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return emptyResponse;
    }

    const data = await res.json();
    const rawHops: Record<string, unknown>[] = Array.isArray(data.bridge_hops)
      ? data.bridge_hops
      : Array.isArray(data.hops)
      ? data.hops
      : Array.isArray(data)
      ? data
      : [];

    const bridge_hops: BridgeHopItem[] = rawHops.map((item) => ({
      bridge_protocol: (item.bridge_protocol as string) || (item.bridge_name as string) || (item.protocol as string) || "Bridge Protocol",
      source_chain: (item.source_chain as string) || (item.src_chain as string) || "tron",
      destination_chain: (item.destination_chain as string) || (item.dest_chain as string) || "ethereum",
      source_tx_hash: (item.source_tx_hash as string) || (item.tx_hash as string) || "",
      amount_usd: typeof item.amount_usd === "number" ? item.amount_usd : typeof item.value === "number" ? item.value : undefined,
      token: item.token as string | undefined,
      destination_wallet: (item.destination_wallet as string) || (item.dest_wallet as string) || (item.recipient_address as string) || undefined,
      destination_tx_hash: (item.destination_tx_hash as string) || (item.dest_tx_hash as string) || undefined,
    }));

    return {
      case_id: (data.case_id as string) || caseId,
      total_bridges_detected: typeof data.total_bridges_detected === "number"
        ? data.total_bridges_detected
        : typeof data.bridge_hop_count === "number"
        ? data.bridge_hop_count
        : bridge_hops.length,
      bridge_hops,
    };
  } catch (err) {
    console.warn("[API] getCaseBridges network failure:", err);
    return emptyResponse;
  }
}

export async function getCasePrivacy(caseId: string): Promise<CasePrivacyResponse> {
  const emptyResponse: CasePrivacyResponse = {
    case_id: caseId,
    privacy_swappers_detected: [],
  };

  const encodedId = encodeURIComponent(caseId);
  try {
    const headers = getAuthHeaders(undefined, "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_BASE_URL}/cases/${encodedId}/privacy-dossier`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return emptyResponse;
    }

    const data = await res.json();
    const rawSwappers: Record<string, unknown>[] = Array.isArray(data.privacy_swappers_detected)
      ? data.privacy_swappers_detected
      : Array.isArray(data.detected_swapper_hops)
      ? data.detected_swapper_hops
      : Array.isArray(data.swappers)
      ? data.swappers
      : Array.isArray(data)
      ? data
      : [];

    const privacy_swappers_detected: PrivacySwapperItem[] = rawSwappers.map((item) => ({
      service_name: (item.service_name as string) || (item.swapper_name as string) || (item.service as string) || "Instant Swapper",
      swapper_type: item.swapper_type as string | undefined,
      input_currency: (item.input_currency as string) || (item.input_asset as string) || "N/A",
      output_currency: (item.output_currency as string) || (item.output_asset as string) || "N/A",
      intercept_address: (item.intercept_address as string) || (item.deposit_address as string) || (item.address as string) || "",
      subpoena_questionnaire_ready: typeof item.subpoena_questionnaire_ready === "boolean"
        ? item.subpoena_questionnaire_ready
        : true,
    }));

    return {
      case_id: (data.case_id as string) || caseId,
      privacy_swappers_detected,
    };
  } catch (err) {
    console.warn("[API] getCasePrivacy network failure:", err);
    return emptyResponse;
  }
}

export async function getCaseLayering(caseId: string): Promise<LayeringAnalysisResponse> {
  const emptyResponse: LayeringAnalysisResponse = {
    case_id: caseId,
    classified_intermediaries: [],
    paths: [],
  };

  const encodedId = encodeURIComponent(caseId);
  try {
    const headers = getAuthHeaders(undefined, "");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_BASE_URL}/cases/${encodedId}/layering-analysis`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return emptyResponse;
    }

    const data = await res.json();
    const rawMules: Record<string, unknown>[] = Array.isArray(data.classified_intermediaries)
      ? data.classified_intermediaries
      : Array.isArray(data.intermediary_mules)
      ? data.intermediary_mules
      : Array.isArray(data.intermediaries)
      ? data.intermediaries
      : Array.isArray(data.mules)
      ? data.mules
      : [];

    const classified_intermediaries: IntermediaryMule[] = rawMules.map((item) => ({
      address: (item.address as string) || (item.wallet as string) || (item.node as string) || "",
      role: (item.role as string) || (item.classification as string) || "Intermediary Hop",
      holding_time_minutes: typeof item.holding_time_minutes === "number"
        ? item.holding_time_minutes
        : typeof item.holding_time === "number"
        ? item.holding_time
        : undefined,
    }));

    const paths: LayeringAnalysisPath[] = Array.isArray(data.paths) ? data.paths : [];

    return {
      case_id: (data.case_id as string) || caseId,
      suspect_address: data.suspect_address as string | undefined,
      total_paths_discovered: typeof data.total_paths_discovered === "number" ? data.total_paths_discovered : undefined,
      min_hop_count: typeof data.min_hop_count === "number" ? data.min_hop_count : undefined,
      max_hop_count: typeof data.max_hop_count === "number" ? data.max_hop_count : undefined,
      paths,
      classified_intermediaries,
      summary: data.summary as string | undefined,
      generated_at: data.generated_at as string | undefined,
      peeling_chain_count: typeof data.peeling_chain_count === "number" ? data.peeling_chain_count : null,
      fan_out_count: typeof data.fan_out_count === "number" ? data.fan_out_count : null,
      rapid_movement_detected: typeof data.rapid_movement_detected === "boolean" ? data.rapid_movement_detected : null,
      max_layering_depth: typeof data.max_hop_count === "number"
        ? data.max_hop_count
        : typeof data.max_layering_depth === "number"
        ? data.max_layering_depth
        : undefined,
      intermediary_mules: classified_intermediaries,
    };
  } catch (err) {
    console.warn("[API] getCaseLayering network failure:", err);
    return emptyResponse;
  }
}

export async function getCaseEvidenceCert(caseId: string): Promise<EvidenceCertResponse> {
  let res: Response;
  const encodedId = encodeURIComponent(caseId);
  try {
    const headers = getAuthHeaders(undefined, "");
    res = await fetch(`${API_BASE_URL}/cases/${encodedId}/evidence-cert`, {
      method: "GET",
      headers,
    });
  } catch (err) {
    console.error("[API] getCaseEvidenceCert network failure:", err);
    throw new Error("Connection error: Unable to reach backend server.");
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to load evidence certificate (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  return {
    certificate_type: (data.certificate_type || data.cert_type) as string | undefined,
    former_equivalent: data.former_equivalent as string | undefined,
    case_id: (data.case_id || data.caseId) as string | undefined,
    evidence_sha256_hash: (data.evidence_sha256_hash || data.sha256_hash || data.hash) as string | undefined,
    total_nodes_analyzed:
      typeof data.total_nodes_analyzed === "number"
        ? data.total_nodes_analyzed
        : typeof data.nodes_count === "number"
        ? data.nodes_count
        : undefined,
    total_transactions_traced:
      typeof data.total_transactions_traced === "number"
        ? data.total_transactions_traced
        : typeof data.transactions_count === "number"
        ? data.transactions_count
        : undefined,
    attributed_vasp:
      data.attributed_vasp !== undefined && data.attributed_vasp !== null && String(data.attributed_vasp).trim() !== ""
        ? String(data.attributed_vasp)
        : null,
  };
}

export async function generateForensicReport(caseInput: string | TraceResult): Promise<AIReportResponse> {
  let traceData: TraceResult;

  if (typeof caseInput === "string") {
    traceData = await getCase(caseInput);
  } else {
    traceData = caseInput;
  }

  let res: Response;
  try {
    const headers = getAuthHeaders(undefined, "application/json");
    res = await fetch(`${API_BASE_URL}/report/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(traceData),
    });
  } catch (err) {
    console.error("[API] generateForensicReport network failure:", err);
    throw new Error("Connection error: Unable to reach backend server.");
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to generate investigation docket (${res.status}): ${errorText || res.statusText}`);
  }

  const data = await res.json();
  return {
    case_id: (data.case_id || data.caseId) as string | undefined,
    suspect_address: (data.suspect_address || data.suspectAddress) as string | undefined,
    chain: data.chain as string | undefined,
    overall_risk_score: typeof data.overall_risk_score === "number" ? data.overall_risk_score : undefined,
    report: data.report as string | undefined,
  };
}








