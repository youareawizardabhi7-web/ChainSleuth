export type Chain = "tron" | "solana" | "ethereum" | "bitcoin";

export interface TraceRequest {
  suspect_address: string;
  chain: Chain;
  max_hops: number;
  value_threshold_pct: number;
  complaint_id?: string;
}

export interface SanctionsInfo {
  sanction_date?: string;
  designation_reason?: string;
  sanctioned_entity_name?: string;
  jurisdiction?: string;
  ofac_identifier?: string;
}

export interface BridgeInfo {
  bridge_name?: string;
  source_chain?: Chain | string;
  destination_chain?: Chain | string;
  dest_chain?: Chain | string;
  tx_hash?: string;
  confidence_score?: number;
  confidence?: number;
  timestamp?: string;
}

export interface WalletNode {
  address: string;
  chain: Chain;
  riskScore: number;
  balance: number;
  firstSeen: string;
  typologyFlags: TypologyFlag[];
  isVasp?: boolean;
  sanctionsInfo?: SanctionsInfo;
  bridgeInfo?: BridgeInfo;
}

export type TypologyFlag =
  | "peeling_chain"
  | "fan_out"
  | "zero_gas_burner"
  | "first_funder_match"
  | "dex_swap"
  | "ofac_sanctioned"
  | "bridge_hop";

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
  recommendations?: string[];
  sla_cashout_alert?: string;
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

export type ClusterType =
  | "exchange_sweep"
  | "syndicate_gas_funder"
  | "laundering_typology"
  | (string & {});

export interface WalletCluster {
  cluster_id?: string;
  id?: string;
  cluster_label?: string;
  label?: string;
  name?: string;
  cluster_type: ClusterType;
  confidence: number | string;
  node_count?: number;
  address_count?: number;
  addresses: string[];
  entity_name?: string;
  entity?: string;
  summary?: string;
  description?: string;
}

export interface CaseClustersResponse {
  case_id: string;
  clusters: WalletCluster[];
  total_clusters?: number;
}

