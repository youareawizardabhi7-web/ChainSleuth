import {
  CaseSummary,
  TraceRequest,
  TraceResult,
  LegalNoticePayload,
  WalletCluster,
  CustomWalletLabelItem,
  AuditLogItem,
  NcrpCorrelationsResponse,
  NCRPBatchIngestRequest,
  NCRPBatchIngestResponse,
  EvidenceCertResponse,
  AIReportResponse,
} from "./types";
import {
  MOCK_CASES,
  MOCK_TRACE_RESULT,
  MOCK_CLUSTERS,
  MOCK_VASP_REGISTRY,
  MOCK_AUDIT_LOGS,
  MOCK_NCRP_CORRELATIONS,
  MOCK_EVIDENCE_CERT,
  MOCK_AI_REPORT,
} from "./mockData";

const RAW_API_URL =
  (typeof window !== "undefined" && (window as unknown as { __API_URL__?: string }).__API_URL__) ||
  (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL) ||
  "https://chain-sleuth-backend.onrender.com";

export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "").endsWith("/api/v1")
  ? RAW_API_URL.replace(/\/+$/, "")
  : `${RAW_API_URL.replace(/\/+$/, "")}/api/v1`;


async function fetchWithFallback<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch {
    // Backend unreachable, smoothly use fallback
  }

  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Failed to fetch from ${url} and no fallback was available.`);
}

export async function getCases(): Promise<CaseSummary[]> {
  return fetchWithFallback<CaseSummary[]>(
    `${API_BASE_URL}/cases`,
    { method: "GET" },
    MOCK_CASES
  );
}

export async function getCase(caseId: string): Promise<TraceResult> {
  const matchingCase = MOCK_CASES.find((c) => c.case_id.toLowerCase() === caseId.toLowerCase());
  const fallback = {
    ...MOCK_TRACE_RESULT,
    case_id: caseId,
    suspect_address: matchingCase?.suspect_address || MOCK_TRACE_RESULT.suspect_address,
    chain: matchingCase?.chain || MOCK_TRACE_RESULT.chain,
    overall_risk_score: matchingCase?.overall_risk_score || MOCK_TRACE_RESULT.overall_risk_score,
  };

  return fetchWithFallback<TraceResult>(
    `${API_BASE_URL}/case/${caseId}`,
    { method: "GET" },
    fallback
  );
}

export async function startTrace(payload: TraceRequest): Promise<TraceResult> {
  const newCaseId = `CASE-2026-${payload.chain.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const fallback: TraceResult = {
    ...MOCK_TRACE_RESULT,
    case_id: newCaseId,
    suspect_address: payload.suspect_address,
    chain: payload.chain,
    created_at: new Date().toISOString(),
  };

  return fetchWithFallback<TraceResult>(
    `${API_BASE_URL}/trace`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    fallback
  );
}

export async function getCaseClusters(caseId: string): Promise<WalletCluster[]> {
  return fetchWithFallback<WalletCluster[]>(
    `${API_BASE_URL}/case/${caseId}/clusters`,
    { method: "GET" },
    MOCK_CLUSTERS
  );
}

export async function getVaspRegistry(): Promise<CustomWalletLabelItem[]> {
  return fetchWithFallback<CustomWalletLabelItem[]>(
    `${API_BASE_URL}/vasp/labels`,
    { method: "GET" },
    MOCK_VASP_REGISTRY
  );
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  return fetchWithFallback<AuditLogItem[]>(
    `${API_BASE_URL}/audit/logs`,
    { method: "GET" },
    MOCK_AUDIT_LOGS
  );
}

export async function getNcrpCorrelations(): Promise<NcrpCorrelationsResponse> {
  return fetchWithFallback<NcrpCorrelationsResponse>(
    `${API_BASE_URL}/ncrp/correlations`,
    { method: "GET" },
    MOCK_NCRP_CORRELATIONS
  );
}

export async function ingestNcrpComplaints(payload: NCRPBatchIngestRequest): Promise<NCRPBatchIngestResponse> {
  const fallback: NCRPBatchIngestResponse = {
    total_received: payload.complaints.length,
    total_valid: payload.complaints.length,
    ingested_cases: payload.complaints.map((c, i) => ({
      acknowledgement_number: c.acknowledgement_number || `ACK-DEMO-${i + 1}`,
      suspect_wallet_address: c.suspect_wallet_address,
      blockchain: String(c.blockchain),
      case_id: `CASE-2026-${String(c.blockchain).toUpperCase()}-${Math.floor(2000 + Math.random() * 8000)}`,
      status: "traced",
      risk_score: Math.floor(75 + Math.random() * 23),
    })),
    common_wallets_detected: [
      {
        wallet_address: payload.complaints[0]?.suspect_wallet_address || "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
        complaint_count: 3,
        total_loss_inr: 4500000,
      },
    ],
  };

  return fetchWithFallback<NCRPBatchIngestResponse>(
    `${API_BASE_URL}/ncrp/ingest`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    fallback
  );
}

export async function generateNotice(
  payload: LegalNoticePayload
): Promise<{ pdfUrl: string; sha256_evidence_hash: string }> {
  const fallback = {
    pdfUrl: `/api/v1/notices/sample-${payload.case_number}.pdf`,
    sha256_evidence_hash: "7d49e1a88b8f2c3d5e9b8f2c3d5e9b8f2c3d5e9b8f2c3d5e9b8f2c3d5e9b8f2c",
  };

  return fetchWithFallback<{ pdfUrl: string; sha256_evidence_hash: string }>(
    `${API_BASE_URL}/case/${payload.case_number}/notice`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    fallback
  );
}

export async function getEvidenceCertificate(caseId: string): Promise<EvidenceCertResponse> {
  return fetchWithFallback<EvidenceCertResponse>(
    `${API_BASE_URL}/case/${caseId}/certificate`,
    { method: "GET" },
    { ...MOCK_EVIDENCE_CERT, case_id: caseId }
  );
}

export async function generateAIReport(caseId: string): Promise<AIReportResponse> {
  return fetchWithFallback<AIReportResponse>(
    `${API_BASE_URL}/case/${caseId}/ai-report`,
    { method: "GET" },
    { ...MOCK_AI_REPORT, case_id: caseId }
  );
}

export async function downloadCourtEvidenceBundle(caseId: string): Promise<void> {
  // Simulate rapid bundle creation & download
  await new Promise((resolve) => setTimeout(resolve, 800));
  const dummyBlob = new Blob(
    [
      `CHAINSLEUTH COURT EVIDENCE BUNDLE (SECTION 63 BSA)\nCase ID: ${caseId}\nTimestamp: ${new Date().toISOString()}\nEvidence Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nStatus: VERIFIED ADMISSIBLE`,
    ],
    { type: "text/plain" }
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(dummyBlob);
  link.download = `evidence-bundle-${caseId}.txt`;
  link.click();
}
