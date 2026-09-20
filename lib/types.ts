export type Chain = "tron" | "solana" | "ethereum";

export interface TraceRequest {
  suspect_address: string;
  chain: Chain;
  max_hops: number;
  value_threshold_pct: number;
  complaint_id?: string;
}

export interface WalletNode {
  address: string;
  chain: Chain;
  riskScore: number;
  balance: number;
  firstSeen: string;
  typologyFlags: TypologyFlag[];
  isVasp?: boolean;
}

export type TypologyFlag =
  | "peeling_chain"
  | "fan_out"
  | "zero_gas_burner"
  | "first_funder_match"
  | "dex_swap";

export interface TransferEdge {
  txHash: string;
  from: string;
  to: string;
  value: number;
  token: string;
  timestamp: string;
}

export interface VASPAttribution {
  vasp_name: string;
  is_fiu_registered: boolean;
  confidence_score: number;
  deposit_address: string;
  hot_wallet_address: string;
  nodal_officer_email: string;
  nodal_officer_phone?: string;
}

export interface TraceResult {
  case_id: string;
  suspect_address: string;
  nodes: WalletNode[];
  edges: TransferEdge[];
  attribution: VASPAttribution | null;
  overall_risk_score: number;
  chain?: Chain;
  created_at?: string;
  status?: "active" | "pending_approval" | "frozen" | "closed";
}

export interface LegalNoticePayload {
  case_number: string;
  suspect_address: string;
  attributed_vasp: VASPAttribution;
  loss_amount_inr: number;
  flow_summary: string;
  sha256_evidence_hash: string;
}

export type UserRole =
  | "investigating_officer"
  | "supervisory_officer"
  | "vasp_nodal_officer";

export interface CaseSummary {
  case_id: string;
  suspect_address: string;
  chain: Chain;
  overall_risk_score: number;
  status: "active" | "pending_approval" | "frozen" | "closed";
  created_at: string;
  attributed_vasp_name?: string;
}
