// src/lib/connectors/anthropic.ts
// CostLens AI — Anthropic Connector
// Fetches usage data from Anthropic's API and normalizes it

import { BaseConnector, ConnectorCredentials, SyncOptions } from "./base";
import { NormalizedCostRecord, AIProvider } from "@/types";
import { calculateCost } from "@/lib/pricing-db";

interface AnthropicUsageRecord {
  id: string;
  type: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  created_at: string;
  workspace_id?: string;
  api_key_id?: string;
  api_key_name?: string;
}

export class AnthropicConnector extends BaseConnector {
  provider: AIProvider = "ANTHROPIC";
  displayName = "Anthropic";

  private baseUrl = "https://api.anthropic.com";

  constructor(credentials: ConnectorCredentials, orgId: string) {
    super(credentials, orgId);
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Use a minimal API call to validate the key
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/v1/messages`,
        {
          method: "POST",
          headers: {
            "x-api-key": this.credentials.apiKey || "",
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1,
            messages: [{ role: "user", content: "hi" }],
          }),
        }
      );

      if (response.status === 401) {
        return { valid: false, error: "Invalid API key" };
      }
      if (response.status === 403) {
        return { valid: false, error: "API key does not have sufficient permissions" };
      }

      // Any non-auth error means the key is valid
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async fetchUsage(options: SyncOptions): Promise<NormalizedCostRecord[]> {
    const records: NormalizedCostRecord[] = [];

    // Strategy 1: Try the Admin API for usage data
    try {
      const usageRecords = await this.fetchFromAdminAPI(options);
      records.push(...usageRecords);
    } catch (error) {
      console.warn("Admin API not available, falling back to logs:", error);
    }

    // Strategy 2: Try the usage logs endpoint
    if (records.length === 0) {
      try {
        const logRecords = await this.fetchFromLogsAPI(options);
        records.push(...logRecords);
      } catch (error) {
        console.warn("Logs API also unavailable:", error);
      }
    }

    return records;
  }

  /**
   * Fetch from Anthropic's Admin Usage API
   * Available for organizations with admin API access
   */
  private async fetchFromAdminAPI(options: SyncOptions): Promise<NormalizedCostRecord[]> {
    const records: NormalizedCostRecord[] = [];

    const params = new URLSearchParams({
      start_date: options.dateFrom.toISOString().split("T")[0],
      end_date: options.dateTo.toISOString().split("T")[0],
      group_by: "model,api_key",
    });

    const url = `${this.baseUrl}/v1/organizations/usage?${params}`;

    const response = await this.fetchWithRetry(url, {
      headers: {
        "x-api-key": this.credentials.apiKey || "",
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      throw new Error(`Admin API returned ${response.status}`);
    }

    const data = await response.json();
    const usageEntries = data.data || data.usage || [];

    for (const entry of usageEntries) {
      const inputTokens = entry.input_tokens || 0;
      const outputTokens = entry.output_tokens || 0;

      if (inputTokens === 0 && outputTokens === 0) continue;

      const cost = calculateCost("ANTHROPIC", entry.model, inputTokens, outputTokens);

      records.push({
        provider: "ANTHROPIC",
        model: entry.model || null,
        service: "messages",
        costUsd: cost,
        usageUnit: "TOKENS",
        usageAmount: inputTokens + outputTokens,
        inputTokens,
        outputTokens,
        apiKeyPrefix: entry.api_key_id?.slice(0, 8) || entry.api_key_name?.slice(0, 8) || null,
        userId: null,
        projectTag: entry.workspace_id || null,
        usageDate: new Date(entry.date || entry.created_at || options.dateFrom),
        confidence: "CONFIRMED",
      });
    }

    return records;
  }

  /**
   * Fetch from Anthropic's message logs
   * More universally available but requires pagination
   */
  private async fetchFromLogsAPI(options: SyncOptions): Promise<NormalizedCostRecord[]> {
    const records: NormalizedCostRecord[] = [];
    let afterId: string | null = null;
    let hasMore = true;
    let pageCount = 0;
    const maxPages = 100; // Safety limit

    while (hasMore && pageCount < maxPages) {
      const params = new URLSearchParams({
        start_date: options.dateFrom.toISOString().split("T")[0],
        end_date: options.dateTo.toISOString().split("T")[0],
        limit: "100",
      });

      if (afterId) params.set("after_id", afterId);

      const url = `${this.baseUrl}/v1/messages/batches?${params}`;

      const response = await this.fetchWithRetry(url, {
        headers: {
          "x-api-key": this.credentials.apiKey || "",
          "anthropic-version": "2023-06-01",
        },
      });

      if (!response.ok) {
        throw new Error(`Logs API returned ${response.status}`);
      }

      const data = await response.json();
      const entries: AnthropicUsageRecord[] = data.data || [];

      for (const entry of entries) {
        const inputTokens = entry.input_tokens || 0;
        const outputTokens = entry.output_tokens || 0;
        const cacheTokens = (entry.cache_creation_input_tokens || 0) + (entry.cache_read_input_tokens || 0);

        const cost = calculateCost("ANTHROPIC", entry.model, inputTokens + cacheTokens, outputTokens);

        records.push({
          provider: "ANTHROPIC",
          model: entry.model || null,
          service: entry.type || "messages",
          costUsd: cost,
          usageUnit: "TOKENS",
          usageAmount: inputTokens + outputTokens + cacheTokens,
          inputTokens: inputTokens + cacheTokens,
          outputTokens,
          apiKeyPrefix: entry.api_key_id?.slice(0, 8) || null,
          userId: null,
          projectTag: entry.workspace_id || null,
          usageDate: new Date(entry.created_at),
          confidence: "CONFIRMED",
        });
      }

      hasMore = data.has_more === true;
      afterId = entries.length > 0 ? entries[entries.length - 1].id : null;
      pageCount++;
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
