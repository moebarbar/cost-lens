// src/types/index.ts
// CostLens AI — Complete TypeScript type definitions
// All types are strict (no `any`). Enums mirror prisma/schema.prisma exactly.

// ============================================================
// Enums — mirror Prisma schema exactly
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

export type AttributionConfidence =
  | "CONFIRMED"      // Direct API data with clear ownership
  | "ESTIMATED"      // Inferred from patterns or partial data
  | "UNATTRIBUTED";  // Cost is real but ownership is unknown

export type ConnectorStatusEnum =
  | "PENDING"
  | "ACTIVE"
  | "ERROR"
  | "DISABLED";

export type AlertPeriod =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

export type AlertScope =
  | "ORGANIZATION"
  | "TEAM"
  | "PROVIDER"
  | "MODEL";

export type SyncStatus =
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL";

export type Plan =
  | "FREE"
  | "PRO"
  | "BUSINESS"
  | "ENTERPRISE";

export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

// ============================================================
// API Response
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
  spendChange: number;        // percentage vs previous period
  activeTools: number;
  newToolsThisPeriod: number;
  wasteDetected: number;
  roiScore: number | null;
}

export interface SpendByProvider {
  provider: AIProvider;
  displayName: string;
  totalCost: number;
  percentage: number;
  trend: number;              // percentage change vs previous period
  color: string;              // hex color for charts
}

export interface SpendByTeam {
  teamId: string;
  teamName: string;
  totalCost: number;
  percentage: number;
  color: string;
  topModels: Array<{ model: string; cost: number }>;
}

export interface SpendByModel {
  provider: AIProvider;
  model: string;
  totalCost: number;
  totalTokens: number;
  avgCostPerRequest: number;
  requestCount: number;
}

export interface SpendTimeSeries {
  date: string;               // ISO date YYYY-MM-DD
  totalCost: number;
  byProvider: Record<AIProvider, number>;
  byTeam: Record<string, number>;
}

export interface CostAnomaly {
  id: string;
  type: "spike" | "new_tool" | "unused" | "model_upgrade";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  estimatedImpact: number;    // USD/month
  detectedAt: string;         // ISO datetime
  provider?: AIProvider;
  team?: string;
}

// ============================================================
// Connector / Credential Types
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
  options?: string[];         // for type "select"
  placeholder?: string;
  helpText?: string;
  required: boolean;
}

/** UI-facing connector status summary (no decrypted keys) */
export interface ConnectorStatus {
  id: string;
  provider: AIProvider;
  status: Lowercase<ConnectorStatusEnum>;  // "active" | "error" | "pending" | "disabled"
  lastSyncAt: string | null;
  lastError: string | null;
  recordCount: number;
  totalCostTracked: number;
}

export interface SyncLogEntry {
  id: string;
  provider: AIProvider;
  status: SyncStatus;
  recordsProcessed: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

// ============================================================
// Provider Raw API Response Types
// ============================================================

/** OpenAI /organization/usage bucket */
export interface OpenAIUsageRecord {
  aggregation_timestamp: number;
  n_requests: number;
  operation: string;
  snapshot_id: string;        // model name
  n_context_tokens_total: number;
  n_generated_tokens_total: number;
  organization_id: string;
  project_id?: string;
  api_key_id?: string;
  user_id?: string;
}

/** Anthropic Admin API usage record */
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

/** Universal normalized record — every connector maps to this format */
export interface NormalizedCostRecord {
  provider: AIProvider;
  model: string | null;
  service: string | null;
  costUsd: number;
  usageUnit: UsageUnit | null;
  usageAmount: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  apiKeyPrefix: string | null;  // first 8 chars of API key for team attribution
  userId: string | null;
  projectTag: string | null;
  usageDate: Date;
  confidence: AttributionConfidence;
}

// ============================================================
// Budget Alert Types
// ============================================================

export interface BudgetAlertConfig {
  id?: string;
  name: string;
  threshold: number;          // USD amount
  period: AlertPeriod;
  scope: AlertScope;
  scopeFilter?: string;       // team ID, provider, or model name depending on scope
  enabled: boolean;
}

export interface AlertNotification {
  alertId: string;
  alertName: string;
  currentSpend: number;
  threshold: number;
  percentUsed: number;
  period: AlertPeriod;
  triggeredAt: string;        // ISO datetime
}

// ============================================================
// Pricing Types
// ============================================================

export interface ModelPricing {
  provider: AIProvider;
  model: string;
  inputPricePer1k: number | null;
  outputPricePer1k: number | null;
  cachedInputPricePer1k: number | null;
  pricePerUnit: number | null;
  unitType: string | null;
  effectiveFrom: string;      // ISO date
  effectiveTo: string | null;
}

// ============================================================
// Filter & Pagination Types
// ============================================================

export interface CostFilters {
  dateFrom?: string;          // ISO date
  dateTo?: string;            // ISO date
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
// User & Organization Types
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  plan: Plan;
}

export interface TeamSummary {
  id: string;
  name: string;
  color: string;
  memberCount: number;
  currentMonthSpend: number;
}

// ============================================================
// Provider Display Config
// ============================================================

export const PROVIDER_CONFIG: Record<AIProvider, { name: string; color: string; icon: string }> = {
  OPENAI:        { name: "OpenAI",          color: "#00A67E", icon: "🟢" },
  ANTHROPIC:     { name: "Anthropic",       color: "#D4A574", icon: "🟠" },
  AWS_BEDROCK:   { name: "AWS Bedrock",     color: "#FF9900", icon: "🟡" },
  AZURE_OPENAI:  { name: "Azure OpenAI",    color: "#0078D4", icon: "🔵" },
  GOOGLE_VERTEX: { name: "Google Vertex",   color: "#4285F4", icon: "🔷" },
  COHERE:        { name: "Cohere",          color: "#39594D", icon: "🟩" },
  REPLICATE:     { name: "Replicate",       color: "#5C5C5C", icon: "⚫" },
  HUGGINGFACE:   { name: "HuggingFace",     color: "#FFD21E", icon: "🤗" },
  MISTRAL:       { name: "Mistral",         color: "#F54E42", icon: "🔴" },
  PERPLEXITY:    { name: "Perplexity",      color: "#20B2AA", icon: "🌊" },
  CUSTOM:        { name: "Custom",          color: "#6B7280", icon: "⚙️" },
};
