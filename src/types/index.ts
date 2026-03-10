// src/types/index.ts
// CostLens AI — Core Types

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardOverview {
  totalSpend: number;
  totalSpendPrevPeriod: number;
  spendChange: number; // percentage
  activeTools: number;
  newToolsThisPeriod: number;
  wasteDetected: number;
  roiScore: number | null;
}

export interface SpendByProvider {
  provider: string;
  displayName: string;
  totalCost: number;
  percentage: number;
  trend: number; // percentage change
  color: string;
}

export interface SpendByTeam {
  teamId: string;
  teamName: string;
  totalCost: number;
  percentage: number;
  color: string;
  topModels: { model: string; cost: number }[];
}

export interface SpendByModel {
  provider: string;
  model: string;
  totalCost: number;
  totalTokens: number;
  avgCostPerRequest: number;
  requestCount: number;
}

export interface SpendTimeSeries {
  date: string; // ISO date
  totalCost: number;
  byProvider: Record<string, number>;
  byTeam: Record<string, number>;
}

export interface CostAnomaly {
  id: string;
  type: "spike" | "new_tool" | "unused" | "model_upgrade";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  estimatedImpact: number;
  detectedAt: string;
  provider?: string;
  team?: string;
}

// ============================================================
// Connector Types
// ============================================================

export interface ConnectorConfig {
  provider: AIProvider;
  displayName: string;
  description: string;
  icon: string;
  authType: "api_key" | "oauth" | "csv_upload";
  requiredFields: ConnectorField[];
  docsUrl: string;
}

export interface ConnectorField {
  key: string;
  label: string;
  type: "text" | "password" | "select";
  placeholder?: string;
  helpText?: string;
  required: boolean;
}

export interface ConnectorStatus {
  id: string;
  provider: AIProvider;
  status: "pending" | "active" | "error" | "disabled";
  lastSyncAt: string | null;
  lastError: string | null;
  recordCount: number;
  totalCostTracked: number;
}

// ============================================================
// Provider-Specific Raw Types
// ============================================================

// OpenAI Usage API response shape
export interface OpenAIUsageRecord {
  aggregation_timestamp: number;
  n_requests: number;
  operation: string;
  snapshot_id: string; // model name
  n_context_tokens_total: number;
  n_generated_tokens_total: number;
  organization_id: string;
  project_id?: string;
  api_key_id?: string;
  user_id?: string;
}

// Anthropic Usage API response shape
export interface AnthropicUsageRecord {
  id: string;
  type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
  workspace_id?: string;
  api_key_id?: string;
}

// Normalized record that all connectors output
export interface NormalizedCostRecord {
  provider: AIProvider;
  model: string | null;
  service: string | null;
  costUsd: number;
  usageUnit: UsageUnit | null;
  usageAmount: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  apiKeyPrefix: string | null;
  userId: string | null;
  projectTag: string | null;
  usageDate: Date;
  confidence: "CONFIRMED" | "ESTIMATED" | "UNATTRIBUTED";
}

// ============================================================
// Budget Alert Types
// ============================================================

export interface BudgetAlertConfig {
  id?: string;
  name: string;
  threshold: number;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  scope: "ORGANIZATION" | "TEAM" | "PROVIDER" | "MODEL";
  scopeFilter?: string;
  enabled: boolean;
}

export interface AlertNotification {
  alertId: string;
  alertName: string;
  currentSpend: number;
  threshold: number;
  percentUsed: number;
  period: string;
  triggeredAt: string;
}

// ============================================================
// Pricing Types
// ============================================================

export interface ModelPricing {
  provider: AIProvider;
  model: string;
  inputPricePer1k: number | null;
  outputPricePer1k: number | null;
  pricePerUnit: number | null;
  unitType: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

// ============================================================
// Enums (mirroring Prisma)
// ============================================================

export type AIProvider =
  | "OPENAI"
  | "ANTHROPIC"
  | "AWS_BEDROCK"
  | "AZURE_OPENAI"
  | "GOOGLE_VERTEX"
  | "COHERE"
  | "REPLICATE"
  | "HUGGINGFACE"
  | "MISTRAL"
  | "PERPLEXITY"
  | "CUSTOM";

export type UsageUnit =
  | "TOKENS"
  | "API_CALLS"
  | "COMPUTE_SECONDS"
  | "IMAGES"
  | "CHARACTERS"
  | "CREDITS";

// ============================================================
// Filter & Query Types
// ============================================================

export interface CostFilters {
  dateFrom?: string;
  dateTo?: string;
  providers?: AIProvider[];
  teams?: string[];
  models?: string[];
  minCost?: number;
  maxCost?: number;
  groupBy?: "day" | "week" | "month";
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================
// Provider Display Config
// ============================================================

export const PROVIDER_CONFIG: Record<AIProvider, { name: string; color: string; icon: string }> = {
  OPENAI: { name: "OpenAI", color: "#00A67E", icon: "🟢" },
  ANTHROPIC: { name: "Anthropic", color: "#D4A574", icon: "🟠" },
  AWS_BEDROCK: { name: "AWS Bedrock", color: "#FF9900", icon: "🟡" },
  AZURE_OPENAI: { name: "Azure OpenAI", color: "#0078D4", icon: "🔵" },
  GOOGLE_VERTEX: { name: "Google Vertex", color: "#4285F4", icon: "🔷" },
  COHERE: { name: "Cohere", color: "#39594D", icon: "🟩" },
  REPLICATE: { name: "Replicate", color: "#000000", icon: "⚫" },
  HUGGINGFACE: { name: "HuggingFace", color: "#FFD21E", icon: "🤗" },
  MISTRAL: { name: "Mistral", color: "#F54E42", icon: "🔴" },
  PERPLEXITY: { name: "Perplexity", color: "#20B2AA", icon: "🌊" },
  CUSTOM: { name: "Custom", color: "#888888", icon: "⚙️" },
};
