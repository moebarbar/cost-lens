// src/lib/connectors/openai.ts
// CostLens AI — OpenAI Connector
// Fetches usage data from OpenAI's Usage API and normalizes it

import { BaseConnector, ConnectorCredentials, SyncOptions } from "./base";
import { NormalizedCostRecord, AIProvider } from "@/types";
import { calculateCost } from "@/lib/pricing-db";

interface OpenAIUsageBucket {
  object: string;
  input_tokens: number;
  output_tokens: number;
  num_model_requests: number;
  project_id: string | null;
  user_id: string | null;
  api_key_id: string | null;
  model: string;
  batch: boolean;
  input_cached_tokens?: number;
}

interface OpenAICostBucket {
  object: string;
  amount: {
    value: number;
    currency: string;
  };
  line_item: string | null;
  project_id: string | null;
  organization_id: string;
}

export class OpenAIConnector extends BaseConnector {
  provider: AIProvider = "OPENAI";
  displayName = "OpenAI";

  private baseUrl = "https://api.openai.com/v1";

  constructor(credentials: ConnectorCredentials, orgId: string) {
    super(credentials, orgId);
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/models`,
        {
          headers: {
            Authorization: `Bearer ${this.credentials.apiKey}`,
            ...(this.credentials.organizationId && {
              "OpenAI-Organization": this.credentials.organizationId,
            }),
          },
        }
      );

      if (response.status === 401) {
        return { valid: false, error: "Invalid API key" };
      }
      if (response.status === 403) {
        return { valid: false, error: "API key does not have usage access. Ensure it has admin permissions." };
      }
      if (!response.ok) {
        return { valid: false, error: `OpenAI returned status ${response.status}` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  async fetchUsage(options: SyncOptions): Promise<NormalizedCostRecord[]> {
    const records: NormalizedCostRecord[] = [];

    // Strategy 1: Try the Usage API (admin keys only)
    try {
      const usageRecords = await this.fetchFromUsageAPI(options);
      records.push(...usageRecords);
    } catch (error) {
      console.warn("Usage API not available, falling back to Costs API:", error);
    }

    // Strategy 2: If Usage API fails, try the Costs API
    if (records.length === 0) {
      try {
        const costRecords = await this.fetchFromCostsAPI(options);
        records.push(...costRecords);
      } catch (error) {
        console.warn("Costs API also failed:", error);
      }
    }

    return records;
  }

  /**
   * Fetch from OpenAI's /organization/usage endpoint
   * Provides granular per-model, per-key usage data
   */
  private async fetchFromUsageAPI(options: SyncOptions): Promise<NormalizedCostRecord[]> {
    const records: NormalizedCostRecord[] = [];
    const startTime = Math.floor(options.dateFrom.getTime() / 1000);
    const endTime = Math.floor(options.dateTo.getTime() / 1000);

    // Fetch completions usage
    const categories = [
      "completions",
      "embeddings",
      "images",
      "audio_speeches",
      "audio_transcriptions",
      "moderations",
    ];

    for (const category of categories) {
      let page: string | null = null;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          start_time: startTime.toString(),
          end_time: endTime.toString(),
          bucket_width: "1d",
          limit: "100",
          group_by: "model,project_id,api_key_id",
        });

        if (page) params.set("page", page);

        const url = `${this.baseUrl}/organization/usage/${category}?${params}`;

        const response = await this.fetchWithRetry(url, {
          headers: {
            Authorization: `Bearer ${this.credentials.apiKey}`,
            ...(this.credentials.organizationId && {
              "OpenAI-Organization": this.credentials.organizationId,
            }),
          },
        });

        if (!response.ok) {
          throw new Error(`Usage API returned ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const buckets: OpenAIUsageBucket[] = data.data || [];

        for (const bucket of buckets) {
          const inputTokens = bucket.input_tokens || 0;
          const outputTokens = bucket.output_tokens || 0;

          if (inputTokens === 0 && outputTokens === 0 && bucket.num_model_requests === 0) {
            continue; // Skip empty buckets
          }

          const cost = calculateCost("OPENAI", bucket.model, inputTokens, outputTokens);

          records.push({
            provider: "OPENAI",
            model: bucket.model || null,
            service: category,
            costUsd: cost,
            usageUnit: "TOKENS",
            usageAmount: inputTokens + outputTokens,
            inputTokens,
            outputTokens,
            apiKeyPrefix: bucket.api_key_id?.slice(0, 8) || null,
            userId: bucket.user_id || null,
            projectTag: bucket.project_id || null,
            usageDate: new Date(data.start_time * 1000 || options.dateFrom),
            confidence: "CONFIRMED",
          });
        }

        hasMore = data.has_more === true;
        page = data.next_page || null;
      }
    }

    return records;
  }

  /**
   * Fetch from OpenAI's /organization/costs endpoint
   * Less granular but more widely available
   */
  private async fetchFromCostsAPI(options: SyncOptions): Promise<NormalizedCostRecord[]> {
    const records: NormalizedCostRecord[] = [];
    const startTime = Math.floor(options.dateFrom.getTime() / 1000);
    const endTime = Math.floor(options.dateTo.getTime() / 1000);

    let page: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        start_time: startTime.toString(),
        end_time: endTime.toString(),
        bucket_width: "1d",
        limit: "100",
        group_by: "project_id,line_item",
      });

      if (page) params.set("page", page);

      const url = `${this.baseUrl}/organization/costs?${params}`;

      const response = await this.fetchWithRetry(url, {
        headers: {
          Authorization: `Bearer ${this.credentials.apiKey}`,
          ...(this.credentials.organizationId && {
            "OpenAI-Organization": this.credentials.organizationId,
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`Costs API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const buckets: OpenAICostBucket[] = data.data || [];

      for (const bucket of buckets) {
        if (!bucket.amount || bucket.amount.value === 0) continue;

        // Convert cents to dollars if needed
        const costUsd = bucket.amount.currency === "usd_cents"
          ? bucket.amount.value / 100
          : bucket.amount.value;

        records.push({
          provider: "OPENAI",
          model: null, // Costs API doesn't always break down by model
          service: bucket.line_item || "unknown",
          costUsd,
          usageUnit: null,
          usageAmount: null,
          inputTokens: null,
          outputTokens: null,
          apiKeyPrefix: null,
          userId: null,
          projectTag: bucket.project_id || null,
          usageDate: new Date(data.start_time * 1000 || options.dateFrom),
          confidence: "CONFIRMED",
        });
      }

      hasMore = data.has_more === true;
      page = data.next_page || null;
    }

    return records;
  }

  async getCurrentPeriodSummary(): Promise<{
    totalCost: number;
    recordCount: number;
    period: string;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await this.fetchUsage({
      dateFrom: startOfMonth,
      dateTo: now,
    });

    const totalCost = records.reduce((sum, r) => sum + r.costUsd, 0);

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      recordCount: records.length,
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    };
  }
}
