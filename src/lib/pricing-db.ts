// src/lib/pricing-db.ts
// CostLens AI — AI Model Pricing Database
// Updated: March 2026
// This is the source of truth for calculating costs from raw token/usage data

export interface PricingEntry {
  provider: string;
  model: string;
  inputPer1kTokens: number;   // USD per 1K input tokens
  outputPer1kTokens: number;  // USD per 1K output tokens
  cachedInputPer1kTokens?: number; // Discounted cached input price
  batchInputPer1kTokens?: number;  // Batch API pricing
  batchOutputPer1kTokens?: number;
  effectiveFrom: string;      // ISO date
  notes?: string;
}

// ============================================================
// OPENAI PRICING
// ============================================================
export const OPENAI_PRICING: PricingEntry[] = [
  // GPT-4o
  { provider: "OPENAI", model: "gpt-4o", inputPer1kTokens: 0.0025, outputPer1kTokens: 0.01, cachedInputPer1kTokens: 0.00125, effectiveFrom: "2024-10-01" },
  { provider: "OPENAI", model: "gpt-4o-2024-11-20", inputPer1kTokens: 0.0025, outputPer1kTokens: 0.01, effectiveFrom: "2024-11-20" },
  
  // GPT-4o-mini
  { provider: "OPENAI", model: "gpt-4o-mini", inputPer1kTokens: 0.00015, outputPer1kTokens: 0.0006, cachedInputPer1kTokens: 0.000075, effectiveFrom: "2024-07-18" },
  
  // GPT-4 Turbo
  { provider: "OPENAI", model: "gpt-4-turbo", inputPer1kTokens: 0.01, outputPer1kTokens: 0.03, effectiveFrom: "2024-04-09" },
  
  // GPT-4
  { provider: "OPENAI", model: "gpt-4", inputPer1kTokens: 0.03, outputPer1kTokens: 0.06, effectiveFrom: "2023-03-14" },
  
  // GPT-3.5 Turbo
  { provider: "OPENAI", model: "gpt-3.5-turbo", inputPer1kTokens: 0.0005, outputPer1kTokens: 0.0015, effectiveFrom: "2024-01-25" },
  
  // o1 reasoning models
  { provider: "OPENAI", model: "o1", inputPer1kTokens: 0.015, outputPer1kTokens: 0.06, cachedInputPer1kTokens: 0.0075, effectiveFrom: "2024-12-17" },
  { provider: "OPENAI", model: "o1-mini", inputPer1kTokens: 0.003, outputPer1kTokens: 0.012, cachedInputPer1kTokens: 0.0015, effectiveFrom: "2024-09-12" },
  { provider: "OPENAI", model: "o3-mini", inputPer1kTokens: 0.0011, outputPer1kTokens: 0.0044, cachedInputPer1kTokens: 0.00055, effectiveFrom: "2025-01-31" },
  
  // Embeddings
  { provider: "OPENAI", model: "text-embedding-3-large", inputPer1kTokens: 0.00013, outputPer1kTokens: 0, effectiveFrom: "2024-01-25" },
  { provider: "OPENAI", model: "text-embedding-3-small", inputPer1kTokens: 0.00002, outputPer1kTokens: 0, effectiveFrom: "2024-01-25" },
  
  // DALL-E (per image, stored as inputPer1k for simplicity — 1 unit = 1 image)
  { provider: "OPENAI", model: "dall-e-3-hd-1024x1024", inputPer1kTokens: 80, outputPer1kTokens: 0, effectiveFrom: "2023-11-06", notes: "Per 1K images" },
  { provider: "OPENAI", model: "dall-e-3-standard-1024x1024", inputPer1kTokens: 40, outputPer1kTokens: 0, effectiveFrom: "2023-11-06", notes: "Per 1K images" },
  
  // Whisper
  { provider: "OPENAI", model: "whisper-1", inputPer1kTokens: 0.006, outputPer1kTokens: 0, effectiveFrom: "2023-03-01", notes: "Per minute of audio" },
  
  // TTS
  { provider: "OPENAI", model: "tts-1", inputPer1kTokens: 0.015, outputPer1kTokens: 0, effectiveFrom: "2023-11-06", notes: "Per 1K characters" },
  { provider: "OPENAI", model: "tts-1-hd", inputPer1kTokens: 0.03, outputPer1kTokens: 0, effectiveFrom: "2023-11-06", notes: "Per 1K characters" },
];

// ============================================================
// ANTHROPIC PRICING
// ============================================================
export const ANTHROPIC_PRICING: PricingEntry[] = [
  // Claude 4.6
  { provider: "ANTHROPIC", model: "claude-opus-4-6", inputPer1kTokens: 0.015, outputPer1kTokens: 0.075, cachedInputPer1kTokens: 0.0075, effectiveFrom: "2025-09-01" },
  { provider: "ANTHROPIC", model: "claude-sonnet-4-6", inputPer1kTokens: 0.003, outputPer1kTokens: 0.015, cachedInputPer1kTokens: 0.0015, effectiveFrom: "2025-09-01" },
  
  // Claude 3.5
  { provider: "ANTHROPIC", model: "claude-3-5-sonnet-20241022", inputPer1kTokens: 0.003, outputPer1kTokens: 0.015, cachedInputPer1kTokens: 0.0015, effectiveFrom: "2024-10-22" },
  
  // Claude 3 Opus
  { provider: "ANTHROPIC", model: "claude-3-opus-20240229", inputPer1kTokens: 0.015, outputPer1kTokens: 0.075, effectiveFrom: "2024-02-29" },
  
  // Claude 3 Haiku
  { provider: "ANTHROPIC", model: "claude-3-haiku-20240307", inputPer1kTokens: 0.00025, outputPer1kTokens: 0.00125, effectiveFrom: "2024-03-07" },
  
  // Claude Haiku 4.5
  { provider: "ANTHROPIC", model: "claude-haiku-4-5-20251001", inputPer1kTokens: 0.0008, outputPer1kTokens: 0.004, cachedInputPer1kTokens: 0.0004, effectiveFrom: "2025-10-01" },
];

// ============================================================
// GOOGLE VERTEX AI PRICING
// ============================================================
export const GOOGLE_PRICING: PricingEntry[] = [
  { provider: "GOOGLE_VERTEX", model: "gemini-2.0-flash", inputPer1kTokens: 0.0001, outputPer1kTokens: 0.0004, effectiveFrom: "2025-02-01" },
  { provider: "GOOGLE_VERTEX", model: "gemini-2.0-pro", inputPer1kTokens: 0.00125, outputPer1kTokens: 0.005, effectiveFrom: "2025-02-01" },
  { provider: "GOOGLE_VERTEX", model: "gemini-1.5-pro", inputPer1kTokens: 0.00125, outputPer1kTokens: 0.005, effectiveFrom: "2024-05-01" },
  { provider: "GOOGLE_VERTEX", model: "gemini-1.5-flash", inputPer1kTokens: 0.000075, outputPer1kTokens: 0.0003, effectiveFrom: "2024-05-01" },
];

// ============================================================
// MISTRAL PRICING
// ============================================================
export const MISTRAL_PRICING: PricingEntry[] = [
  { provider: "MISTRAL", model: "mistral-large-latest", inputPer1kTokens: 0.002, outputPer1kTokens: 0.006, effectiveFrom: "2024-11-01" },
  { provider: "MISTRAL", model: "mistral-small-latest", inputPer1kTokens: 0.0001, outputPer1kTokens: 0.0003, effectiveFrom: "2024-11-01" },
  { provider: "MISTRAL", model: "codestral-latest", inputPer1kTokens: 0.0003, outputPer1kTokens: 0.0009, effectiveFrom: "2024-11-01" },
];

// ============================================================
// ALL PRICING COMBINED
// ============================================================
export const ALL_PRICING: PricingEntry[] = [
  ...OPENAI_PRICING,
  ...ANTHROPIC_PRICING,
  ...GOOGLE_PRICING,
  ...MISTRAL_PRICING,
];

// ============================================================
// LOOKUP FUNCTIONS
// ============================================================

/**
 * Find the correct pricing for a model at a given date
 */
export function getModelPricing(
  provider: string,
  model: string,
  date: Date = new Date()
): PricingEntry | null {
  const dateStr = date.toISOString().split("T")[0];
  
  // Find matching entries, sorted by effective date descending
  const matches = ALL_PRICING
    .filter(p => 
      p.provider === provider && 
      (p.model === model || model.startsWith(p.model)) &&
      p.effectiveFrom <= dateStr
    )
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

  return matches[0] || null;
}

/**
 * Calculate cost from token counts
 */
export function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  date: Date = new Date(),
  options?: { cached?: boolean; batch?: boolean }
): number {
  const pricing = getModelPricing(provider, model, date);
  if (!pricing) return 0;

  let inputPrice = pricing.inputPer1kTokens;
  let outputPrice = pricing.outputPer1kTokens;

  if (options?.cached && pricing.cachedInputPer1kTokens) {
    inputPrice = pricing.cachedInputPer1kTokens;
  }
  if (options?.batch) {
    if (pricing.batchInputPer1kTokens) inputPrice = pricing.batchInputPer1kTokens;
    if (pricing.batchOutputPer1kTokens) outputPrice = pricing.batchOutputPer1kTokens;
  }

  const inputCost = (inputTokens / 1000) * inputPrice;
  const outputCost = (outputTokens / 1000) * outputPrice;

  return Math.round((inputCost + outputCost) * 1000000) / 1000000; // 6 decimal places
}

/**
 * Get all known models for a provider
 */
export function getProviderModels(provider: string): string[] {
  return [...new Set(
    ALL_PRICING
      .filter(p => p.provider === provider)
      .map(p => p.model)
  )];
}

/**
 * Compare cost of same task across models
 */
export function compareCosts(
  inputTokens: number,
  outputTokens: number,
  models: { provider: string; model: string }[]
): { provider: string; model: string; cost: number }[] {
  return models
    .map(m => ({
      ...m,
      cost: calculateCost(m.provider, m.model, inputTokens, outputTokens),
    }))
    .sort((a, b) => a.cost - b.cost);
}
