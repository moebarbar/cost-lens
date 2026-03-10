// src/lib/connectors/base.ts
// CostLens AI — Base Connector Interface
// All provider connectors implement this interface

import { NormalizedCostRecord, AIProvider } from "@/types";

export interface ConnectorCredentials {
  apiKey?: string;
  organizationId?: string;
  projectId?: string;
  region?: string;
  [key: string]: string | undefined;
}

export interface SyncOptions {
  dateFrom: Date;
  dateTo: Date;
  fullSync?: boolean; // Re-fetch everything vs incremental
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  errors: string[];
  warnings: string[];
}

export abstract class BaseConnector {
  abstract provider: AIProvider;
  abstract displayName: string;

  protected credentials: ConnectorCredentials;
  protected orgId: string;

  constructor(credentials: ConnectorCredentials, orgId: string) {
    this.credentials = credentials;
    this.orgId = orgId;
  }

  /**
   * Validate that the provided credentials work
   */
  abstract validateCredentials(): Promise<{ valid: boolean; error?: string }>;

  /**
   * Fetch usage/cost data from the provider and return normalized records
   */
  abstract fetchUsage(options: SyncOptions): Promise<NormalizedCostRecord[]>;

  /**
   * Get the current billing period summary (for quick dashboard updates)
   */
  abstract getCurrentPeriodSummary(): Promise<{
    totalCost: number;
    recordCount: number;
    period: string;
  }>;

  /**
   * Run a full sync: fetch data, normalize, and return records for storage
   */
  async sync(options: SyncOptions): Promise<SyncResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate credentials first
      const validation = await this.validateCredentials();
      if (!validation.valid) {
        return {
          success: false,
          recordsProcessed: 0,
          recordsInserted: 0,
          errors: [`Credential validation failed: ${validation.error}`],
          warnings: [],
        };
      }

      // Fetch and normalize records
      const records = await this.fetchUsage(options);

      if (records.length === 0) {
        warnings.push("No records found for the specified date range");
      }

      return {
        success: true,
        recordsProcessed: records.length,
        recordsInserted: records.length, // Actual insert count determined by caller
        errors,
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsInserted: 0,
        errors: [error instanceof Error ? error.message : "Unknown sync error"],
        warnings,
      };
    }
  }

  /**
   * Helper: Make an authenticated API request with retry logic
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Rate limited — wait and retry
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get("retry-after") || "5");
          const waitTime = Math.min(retryAfter * 1000, 60000) * Math.pow(2, attempt);
          console.log(`Rate limited by ${this.displayName}. Waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // Server error — retry with backoff
        if (response.status >= 500) {
          const waitTime = 1000 * Math.pow(2, attempt);
          console.log(`Server error from ${this.displayName}. Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Network error");
        const waitTime = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError || new Error(`Failed to fetch from ${this.displayName} after ${maxRetries} attempts`);
  }
}
