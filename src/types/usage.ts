// src/types/usage.ts
// CostLens AI — Provider Usage Response Types

export interface OpenAIModelBreakdown {
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface OpenAIDailyTrend {
  date: string; // YYYY-MM-DD
  cost: number;
  tokens: number;
}

export interface OpenAIUsageResponse {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  breakdown: OpenAIModelBreakdown[];
  dailyTrend: OpenAIDailyTrend[];
}
