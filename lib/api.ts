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
  NCRPComplaint,
  NCRPIngestResponse,
  NCRPIngestRecordResult,
  SyndicateCorrelation,
  NcrpCorrelationsResponse,
  AuditLogItem,
} from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://chain-sleuth-backend.onrender.com/api/v1"
).replace(/\/+$/, "");

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// 12-Node Realistic TRON Crypto-Fraud Investigation Mock Graph
const MOCK_NODES: WalletNode[] = [
  {
    address: "TABC1234567890XYZ99887766554433",
    chain: "tron",
    riskScore: 94,
    balance: 0.0,
    firstSeen: "2026-09-20T09:00:00Z",
    typologyFlags: ["zero_gas_burner"],
  },
  {
    address: "TFUNDER00000000000000000000001",
    chain: "tron",
    riskScore: 91,
    balance: 1540.0,
    firstSeen: "2026-09-18T14:20:00Z",
    typologyFlags: ["first_funder_match"],
  },
  {
    address: "TBURNER00100100100100100100101",
    chain: "tron",
    riskScore: 88,
    balance: 0.0,
    firstSeen: "2026-09-19T11:10:00Z",
    typologyFlags: ["zero_gas_burner"],
  },
  {
    address: "TPEEL00100100100100100100100101",
    chain: "tron",
    riskScore: 85,
    balance: 12.0,
    firstSeen: "2026-09-20T09:15:00Z",
    typologyFlags: ["peeling_chain"],
  },
  {
    address: "TPEEL00200200200200200200200202",
    chain: "tron",
    riskScore: 83,
    balance: 8.5,
    firstSeen: "2026-09-20T09:22:00Z",
    typologyFlags: ["peeling_chain"],
  },
  {
    address: "TPEEL00300300300300300300300303",
    chain: "tron",
    riskScore: 86,
    balance: 5.0,
    firstSeen: "2026-09-20T09:30:00Z",
    typologyFlags: ["peeling_chain"],
  },
  {
    address: "TFANOUT00100100100100100100101",
    chain: "tron",
    riskScore: 79,
    balance: 45.0,
    firstSeen: "2026-09-20T09:40:00Z",
    typologyFlags: ["fan_out"],
  },
  {
    address: "TSMURF010010010010010010010011",
    chain: "tron",
    riskScore: 72,
    balance: 2.0,
    firstSeen: "2026-09-20T09:45:00Z",
    typologyFlags: [],
  },
  {
    address: "TSMURF020020020020020020020022",
    chain: "tron",
    riskScore: 70,
    balance: 1.5,
    firstSeen: "2026-09-20T09:46:00Z",
    typologyFlags: [],
  },
  {
    address: "TDEXSWAP001001001001001001001",
    chain: "tron",
    riskScore: 45,
    balance: 8900.0,
    firstSeen: "2026-08-01T00:00:00Z",
    typologyFlags: ["dex_swap"],
  },
  {
    address: "TCOINDCXDEPOSIT9988776655443311",
    chain: "tron",
    riskScore: 96,
    balance: 0.0,
    firstSeen: "2026-09-20T10:05:00Z",
    typologyFlags: [],
    isVasp: true,
  },
  {
    address: "TCOINDCXHOTSWEEP0000000000000000",
    chain: "tron",
    riskScore: 10,
    balance: 450000.0,
    firstSeen: "2024-01-01T00:00:00Z",
    typologyFlags: [],
    isVasp: true,
  },
];

const MOCK_EDGES: TransferEdge[] = [
  {
    txHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    from: "TFUNDER00000000000000000000001",
    to: "TABC1234567890XYZ99887766554433",
    value: 15.0,
    token: "TRX",
    timestamp: "2026-09-20T08:55:00Z",
  },
  {
    txHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    from: "TFUNDER00000000000000000000001",
    to: "TBURNER00100100100100100100101",
    value: 15.0,
    token: "TRX",
    timestamp: "2026-09-19T11:05:00Z",
  },
  {
    txHash: "0x3333333333333333333333333333333333333333333333333333333333333333",
    from: "TBURNER00100100100100100100101",
    to: "TABC1234567890XYZ99887766554433",
    value: 50000.0,
    token: "USDT",
    timestamp: "2026-09-20T09:02:00Z",
  },
  {
    txHash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    from: "TABC1234567890XYZ99887766554433",
    to: "TPEEL00100100100100100100100101",
    value: 48500.0,
    token: "USDT",
    timestamp: "2026-09-20T09:14:00Z",
  },
  {
    txHash: "0x5555555555555555555555555555555555555555555555555555555555555555",
    from: "TABC1234567890XYZ99887766554433",
    to: "TFANOUT00100100100100100100101",
    value: 15000.0,
    token: "USDT",
    timestamp: "2026-09-20T09:38:00Z",
  },
  {
    txHash: "0x6666666666666666666666666666666666666666666666666666666666666666",
    from: "TFANOUT00100100100100100100101",
    to: "TSMURF010010010010010010010011",
    value: 5000.0,
    token: "USDT",
    timestamp: "2026-09-20T09:44:00Z",
  },
  {
    txHash: "0x7777777777777777777777777777777777777777777777777777777777777777",
    from: "TFANOUT00100100100100100100101",
    to: "TSMURF020020020020020020020022",
    value: 5000.0,
    token: "USDT",
    timestamp: "2026-09-20T09:45:00Z",
  },
  {
    txHash: "0x8888888888888888888888888888888888888888888888888888888888888888",
    from: "TPEEL00100100100100100100100101",
    to: "TPEEL00200200200200200200200202",
    value: 42600.0,
    token: "USDT",
    timestamp: "2026-09-20T09:21:00Z",
  },
  {
    txHash: "0x9999999999999999999999999999999999999999999999999999999999999999",
    from: "TPEEL00200200200200200200200202",
    to: "TDEXSWAP001001001001001001001",
    value: 3500.0,
    token: "USDT",
    timestamp: "2026-09-20T09:26:00Z",
  },
  {
    txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    from: "TPEEL00200200200200200200200202",
    to: "TPEEL00300300300300300300300303",
    value: 39100.0,
    token: "USDT",
    timestamp: "2026-09-20T09:29:00Z",
  },
  {
    txHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    from: "TPEEL00300300300300300300300303",
    to: "TCOINDCXDEPOSIT9988776655443311",
    value: 36000.0,
    token: "USDT",
    timestamp: "2026-09-20T10:04:00Z",
  },
  {
    txHash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    from: "TCOINDCXDEPOSIT9988776655443311",
    to: "TCOINDCXHOTSWEEP0000000000000000",
    value: 36000.0,
    token: "USDT",
    timestamp: "2026-09-20T10:12:00Z",
  },
];

const MOCK_ATTRIBUTION: VASPAttribution = {
  vasp_name: "CoinDCX (Neblio Technologies Pvt Ltd)",
  is_fiu_registered: true,
  confidence_score: 97.8,
  deposit_address: "TCOINDCXDEPOSIT9988776655443311",
  hot_wallet_address: "TCOINDCXHOTSWEEP0000000000000000",
  nodal_officer_email: "nodal.compliance@coindcx.com",
  nodal_officer_phone: "+91-22-6900-1122",
};

export const MOCK_TRACE_RESULT: TraceResult = {
  case_id: "CS-2026-8891",
  suspect_address: "TABC1234567890XYZ99887766554433",
  nodes: MOCK_NODES,
  edges: MOCK_EDGES,
  attribution: MOCK_ATTRIBUTION,
  overall_risk_score: 94,
  chain: "tron",
  created_at: "2026-09-20T10:30:00Z",
  status: "active",
};

export const MOCK_CASES: CaseSummary[] = [
  {
    case_id: "CS-2026-8891",
    suspect_address: "TABC1234567890XYZ99887766554433",
    chain: "tron",
    overall_risk_score: 94,
    status: "active",
    created_at: "2026-09-20T10:30:00Z",
    attributed_vasp_name: "CoinDCX",
  },
  {
    case_id: "CS-2026-8892",
    suspect_address: "TX998877665544332211AABBCCDDEEFF",
    chain: "tron",
    overall_risk_score: 88,
    status: "pending_approval",
    created_at: "2026-09-20T08:15:00Z",
    attributed_vasp_name: "WazirX",
  },
  {
    case_id: "CS-2026-8893",
    suspect_address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkkkkkk",
    chain: "solana",
    overall_risk_score: 82,
    status: "pending_approval",
    created_at: "2026-09-19T14:45:00Z",
    attributed_vasp_name: "Binance",
  },
  {
    case_id: "CS-2026-8894",
    suspect_address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    chain: "ethereum",
    overall_risk_score: 79,
    status: "frozen",
    created_at: "2026-09-18T16:20:00Z",
    attributed_vasp_name: "CoinDCX",
  },
  {
    case_id: "CS-2026-8895",
    suspect_address: "TL889900112233445566778899AABBCC",
    chain: "tron",
    overall_risk_score: 65,
    status: "active",
    created_at: "2026-09-17T11:10:00Z",
    attributed_vasp_name: undefined,
  },
  {
    case_id: "CS-2026-8896",
    suspect_address: "9xZzL771239840192841029834019284",
    chain: "solana",
    overall_risk_score: 42,
    status: "closed",
    created_at: "2026-09-15T09:00:00Z",
    attributed_vasp_name: undefined,
  },
];

export async function createTrace(req: TraceRequest): Promise<TraceResult> {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      ...MOCK_TRACE_RESULT,
      suspect_address: req.suspect_address || MOCK_TRACE_RESULT.suspect_address,
      chain: req.chain || MOCK_TRACE_RESULT.chain,
    });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/trace/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Backend API Error (${res.status}): ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("[API] createTrace backend call failed:", err);
    if (!USE_MOCK_DATA) {
      throw err;
    }
    return {
      ...MOCK_TRACE_RESULT,
      suspect_address: req.suspect_address || MOCK_TRACE_RESULT.suspect_address,
      chain: req.chain || MOCK_TRACE_RESULT.chain,
    };
  }
}

export async function getCase(caseId: string): Promise<TraceResult> {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      ...MOCK_TRACE_RESULT,
      case_id: caseId,
    });
  }

  try {
    // Try primary route: /cases/{caseId}
    let res = await fetch(`${API_BASE_URL}/cases/${caseId}`);

    // If 404, try secondary route: /trace/{caseId}
    if (!res.ok && res.status === 404) {
      const secondaryRes = await fetch(`${API_BASE_URL}/trace/${caseId}`);
      if (secondaryRes.ok) {
        res = secondaryRes;
      }
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Failed to fetch case ${caseId} (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    return {
      ...data,
      chain: normalizeChain(data.chain || data.blockchain_type),
      nodes: data.nodes || [],
      edges: data.edges || [],
      attribution: data.attribution || null,
    };
  } catch (err) {
    console.error(`[API] getCase backend call failed for ${caseId}:`, err);
    if (!USE_MOCK_DATA) {
      throw err;
    }
    return {
      ...MOCK_TRACE_RESULT,
      case_id: caseId,
    };
  }
}

export function normalizeChain(rawChain?: string): Chain {
  if (!rawChain) return "tron";
  const lower = rawChain.toLowerCase();
  if (lower.includes("btc") || lower.includes("bitcoin")) return "bitcoin";
  if (lower.includes("eth") || lower.includes("ethereum")) return "ethereum";
  if (lower.includes("sol") || lower.includes("solana")) return "solana";
  if (lower.includes("tron") || lower.includes("trx")) return "tron";
  return (lower as Chain) || "tron";
}

export async function getCases(): Promise<CaseSummary[]> {
  if (USE_MOCK_DATA) {
    return Promise.resolve(MOCK_CASES);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cases/`);

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
  } catch (err) {
    console.error("[API] getCases backend call failed:", err);
    if (!USE_MOCK_DATA) {
      throw err;
    }
    return MOCK_CASES;
  }
}

export async function parseFir(complaintText: string): Promise<Partial<TraceRequest>> {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      suspect_address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
      chain: "tron",
      max_hops: 5,
      value_threshold_pct: 2.0,
      complaint_id: "FIR-2026-DELHI-402",
    });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/fir/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintText, complaint_text: complaintText }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Failed to parse FIR complaint text (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    return {
      suspect_address: data.suspect_wallet_address || data.suspect_address || "",
      chain: normalizeChain(data.blockchain_type || data.chain),
      max_hops: data.max_trace_hops || data.max_hops || 5,
      value_threshold_pct: 2.0,
      complaint_id: data.complaint_id,
    };
  } catch (err) {
    console.error("[API] parseFir backend call failed:", err);
    if (!USE_MOCK_DATA) {
      throw err;
    }
    return {
      suspect_address: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
      chain: "tron",
      max_hops: 5,
      value_threshold_pct: 2.0,
      complaint_id: "FIR-2026-DELHI-402",
    };
  }
}

export async function generateNotice(
  payload: LegalNoticePayload
): Promise<{ pdfUrl: string; sha256_evidence_hash: string }> {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      pdfUrl: "#mock-pdf-url",
      sha256_evidence_hash: payload.sha256_evidence_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/notices/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      sha256_evidence_hash: data.sha256_evidence_hash,
    };
  } catch (err) {
    console.error("[API] generateNotice backend call failed:", err);
    if (!USE_MOCK_DATA) {
      throw err;
    }
    return {
      pdfUrl: "#mock-pdf-url",
      sha256_evidence_hash: payload.sha256_evidence_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    };
  }
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

    const res = await fetch(`${API_BASE_URL}/cases/${encodeURIComponent(caseId)}/clusters`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch forensic clusters (${res.status})`);
    }

    const data = await res.json();
    const clustersList: WalletCluster[] = Array.isArray(data.clusters)
      ? data.clusters
      : Array.isArray(data)
      ? data
      : [];

    return {
      case_id: data.case_id || caseId,
      clusters: clustersList,
      total_clusters: data.total_clusters ?? clustersList.length,
    };
  } catch (err) {
    console.error("[API] getCaseClusters backend call failed:", err);
    throw new Error("Unable to retrieve forensic clusters.");
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
    throw new Error("Authentication error (401): Please log in to generate an FIR.");
  }
  if (res.status === 403) {
    throw new Error("Permission error (403): You do not have authorization to generate an FIR.");
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
    throw new Error("Backend generation failure (500): Failed to generate FIR document on server.");
  }
  if (!res.ok) {
    throw new Error(`FIR generation failed with status ${res.status}`);
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
  complaints: NCRPComplaint[]
): Promise<NCRPIngestResponse> {
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

    res = await fetch(`${API_BASE_URL}/ncrp/ingest`, {
      method: "POST",
      headers,
      body: JSON.stringify({ complaints }),
    });

    if (res.status === 404 || res.status === 405) {
      res = await fetch(`${API_BASE_URL}/ncrp/ingest`, {
        method: "POST",
        headers,
        body: JSON.stringify(complaints),
      });
    }
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

  const data = await res.json();

  const submitted_count =
    data.submitted_count ?? data.total_submitted ?? complaints.length;
  const successful_records: NCRPIngestRecordResult[] =
    data.successful_records ||
    data.successful ||
    (Array.isArray(data.results)
      ? data.results.filter((r: { status?: string; error?: string }) => r.status === "success" || !r.error)
      : []);
  const failed_records: NCRPIngestRecordResult[] =
    data.failed_records ||
    data.failed ||
    (Array.isArray(data.results)
      ? data.results.filter((r: { status?: string; error?: string }) => r.status === "failed" || r.error)
      : []);

  const successful_count =
    data.successful_count ?? data.success_count ?? successful_records.length;
  const failed_count =
    data.failed_count ?? data.error_count ?? failed_records.length;

  return {
    submitted_count,
    successful_count,
    failed_count,
    successful_records,
    failed_records,
    batch_trace_supported: !!(data.batch_trace_supported || data.can_batch_trace || data.batch_trace_url),
    message: data.message,
  };
}

export async function runNcrpBatchTrace(complaintIds: string[]): Promise<{ status: string; message?: string }> {
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
    body: JSON.stringify({ complaint_ids: complaintIds }),
  });

  if (!res.ok) {
    throw new Error(`Batch trace failed with status ${res.status}`);
  }

  return await res.json();
}

export async function getNcrpCorrelations(): Promise<NcrpCorrelationsResponse> {
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

    res = await fetch(`${API_BASE_URL}/ncrp/correlations`, {
      method: "GET",
      headers,
    });
  } catch (err) {
    console.error("[API] getNcrpCorrelations network failure:", err);
    throw new Error("Unable to retrieve NCRP correlation intelligence.");
  }

  if (res.status === 401) {
    throw new Error("Unable to retrieve NCRP correlation intelligence: Authentication required.");
  }
  if (res.status === 403) {
    throw new Error("Unable to retrieve NCRP correlation intelligence: Access denied.");
  }
  if (!res.ok) {
    throw new Error("Unable to retrieve NCRP correlation intelligence.");
  }

  const data = await res.json();
  const list: SyndicateCorrelation[] = Array.isArray(data.correlations)
    ? data.correlations
    : Array.isArray(data)
    ? data
    : [];

  return {
    correlations: list,
    total_correlations: data.total_correlations ?? list.length,
    total_victims: data.total_victims,
    total_complaints: data.total_complaints,
    total_loss_inr: data.total_loss_inr,
    message: data.message,
  };
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

export const runTrace = createTrace;
export const fetchCase = getCase;
export const fetchCases = getCases;






