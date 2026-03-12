// src/lib/validation.ts
// CostLens AI — Zod Validation Schemas
// Shared request validation for all API routes

import { z } from "zod";
import { NextResponse } from "next/server";

// ============================================================
// Enums
// ============================================================

const AIProviderEnum = z.enum([
  "OPENAI", "ANTHROPIC", "AWS_BEDROCK", "AZURE_OPENAI",
  "GOOGLE_VERTEX", "COHERE", "REPLICATE", "HUGGINGFACE",
  "MISTRAL", "PERPLEXITY", "CUSTOM",
]);

const AlertPeriodEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);
const AlertScopeEnum = z.enum(["ORGANIZATION", "TEAM", "PROVIDER", "MODEL"]);

// ============================================================
// Schemas
// ============================================================

export const costRecordSchema = z.object({
  provider: AIProviderEnum,
  model: z.string().optional(),
  service: z.string().optional(),
  costUsd: z.number().min(0, "Cost must be non-negative"),
  usageUnit: z.string().optional(),
  usageAmount: z.number().optional(),
  inputTokens: z.number().int().optional(),
  outputTokens: z.number().int().optional(),
  usageDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date format"),
  billingPeriod: z.string().optional(),
  apiKeyPrefix: z.string().max(8).optional(),
  projectTag: z.string().optional(),
});

export const costRecordsPostSchema = z.object({
  records: z.array(costRecordSchema).min(1, "At least one record is required").max(1000, "Maximum 1000 records per request"),
});

export const alertCreateSchema = z.object({
  name: z.string().min(1, "Alert name is required").max(100),
  threshold: z.number().positive("Threshold must be greater than 0"),
  period: AlertPeriodEnum,
  scope: AlertScopeEnum,
  scopeFilter: z.string().optional(),
  enabled: z.boolean().optional().default(true),
});

export const alertUpdateSchema = z.object({
  id: z.string().min(1, "Alert ID is required"),
  name: z.string().min(1).max(100).optional(),
  threshold: z.number().positive().optional(),
  period: AlertPeriodEnum.optional(),
  scope: AlertScopeEnum.optional(),
  scopeFilter: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
});

export const teamCreateSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code").optional(),
});

export const teamUpdateSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  action: z.string().optional(),
  // For team info update
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  // For API key mapping
  keyPrefix: z.string().min(3, "Key prefix must be at least 3 characters").optional(),
  keyAlias: z.string().max(50).optional(),
  provider: AIProviderEnum.optional(),
}).refine(
  (data) => {
    if (data.action === "add_api_key") {
      return !!data.keyPrefix && !!data.provider;
    }
    return true;
  },
  { message: "keyPrefix and provider are required when action is 'add_api_key'" }
);

export const connectorCreateSchema = z.object({
  provider: AIProviderEnum,
  credentials: z.record(z.string()).refine(
    (creds) => Object.keys(creds).length > 0,
    "At least one credential field is required"
  ),
});

// ============================================================
// Validation Helper
// ============================================================

/**
 * Validate request body against a Zod schema.
 * Returns parsed data on success, or a 400 NextResponse on failure.
 */
export function validateBody<T extends z.ZodSchema>(
  schema: T,
  body: unknown
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}
