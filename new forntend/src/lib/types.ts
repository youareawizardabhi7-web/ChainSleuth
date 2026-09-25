export type Chain = "tron" | "solana" | "ethereum" | "bitcoin";

export interface TraceRequest {
  suspect_address: string;
  chain: Chain;
  max_hops: number;
  value_threshold_pct?: number;
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

  // AI / ML Forensic Intelligence Fields
  gnn_risk_score?: number | null;
  anomaly_score?: number | null;
  typology_score?: number | null;
  heuristics_score?: number | null;
  risk_category?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  explanation?: string | null;
  pmla_flag?: boolean | string | null;
}

export type TypologyFlag =
  | "peeling_chain"
  | "fan_out"
  | "zero_gas_burner"
  | "first_funder_match"
  | "dex_swap"
  | "ofac_sanctioned"
  | "bridge_hop"
  | "coinjoin_mixer"
  | "burner_wallet"
  | "deposit_consolidator"
  | "hot_wallet_sweep"
  | (string & {});

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

export interface WalletCluster {
  cluster_id: string;
  cluster_type: "vasp_sweep" | "syndicate_gas" | "layering_cell" | "smurfing_cell" | "dex_liquidity" | string;
  member_addresses: string[];
  total_volume: number;
  risk_score: number;
  dominant_entity?: string;
}

export interface CaseClustersResponse {
  case_id: string;
  clusters: WalletCluster[];
}

export interface FIRCreate {
  case_id: string;
  police_station: string;
  complainant_name: string;
  suspect_address: string;
  chain: Chain;
  loss_amount_inr: number;
  incident_summary: string;
}

export interface FIRResponse {
  fir_number: string;
  case_id: string;
  generated_at: string;
  fir_narrative: string;
  applicable_sections: string[];
}

export interface NCRPComplaintRecord {
  complaint_id?: string;
  acknowledgement_number: string;
  complainant_name: string;
  suspect_wallet_address: string;
  blockchain: Chain | string;
  category: string;
  sub_category?: string;
  transaction_hash?: string;
  loss_amount_inr?: number;
  complainant_state?: string;
  district?: string;
  incident_datetime?: string;
}

export interface NCRPBatchIngestRequest {
  complaints: NCRPComplaintRecord[];
}

export interface IngestedSummaryItem {
  acknowledgement_number: string;
  suspect_wallet_address: string;
  blockchain: string;
  case_id: string;
  status: "queued" | "traced" | "error";
  risk_score?: number;
}

export interface NCRPBatchIngestResponse {
  total_received: number;
  total_valid: number;
  ingested_cases: IngestedSummaryItem[];
  common_wallets_detected: {
    wallet_address: string;
    complaint_count: number;
    total_loss_inr: number;
  }[];
}

export interface SyndicateCorrelationItem {
  syndicate_id: string;
  syndicate_name: string;
  primary_blockchain: Chain;
  complaint_count: number;
  total_loss_inr: number;
  active_wallets: string[];
  victim_states: string[];
  risk_score: number;
  target_vasps: string[];
}

export interface NcrpCorrelationsResponse {
  total_complaints_analyzed: number;
  correlated_syndicates: SyndicateCorrelationItem[];
  common_funder_wallets: {
    funder_address: string;
    linked_complaints: number;
    blockchain: string;
  }[];
}

export interface AuditLogItem {
  id: string;
  officer: string;
  action: string;
  query: string;
  timestamp: string;
  status?: "SUCCESS" | "FLAGGED" | "BLOCKED";
}

export interface CustomWalletLabelItem {
  address: string;
  entity_name: string;
  entity_type: string;
  chain: string;
  notes?: string;
  is_verified?: boolean;
  confidence_score?: number;
}

export interface EvidenceCertResponse {
  case_id: string;
  hash: string;
  certificate_id: string;
  timestamp: string;
  officer_name: string;
  officer_badge: string;
  device_id: string;
  algorithm: string;
  certification_statement: string;
}

export interface AIReportResponse {
  case_id: string;
  generated_at: string;
  executive_summary: string;
  money_trail_analysis: string;
  syndicate_indicators: string[];
  recommended_statutory_actions: string[];
  confidence_score: number;
}
