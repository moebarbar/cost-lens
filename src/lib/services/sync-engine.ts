// src/lib/services/sync-engine.ts
// CostLens AI — Sync Engine
// Orchestrates data fetching from all connected providers

import { createConnector } from "@/lib/connectors/registry";
import { AIProvider, NormalizedCostRecord } from "@/types";
import { ConnectorCredentials, SyncOptions, SyncResult } from "@/lib/connectors/base";

interface ConnectorInfo {
  id: string;
  provider: AIProvider;
  credentials: ConnectorCredentials;
  lastSyncAt: Date | null;
  syncInterval: number; // seconds
}

interface SyncJobResult {
  connectorId: string;
  provider: AIProvider;
  result: SyncResult;
  records: NormalizedCostRecord[];
  duration: number; // ms
}

/**
 * Sync a single connector
 */
export async function syncConnector(
  connectorInfo: ConnectorInfo,
  orgId: string,
  options?: Partial<SyncOptions>
): Promise<SyncJobResult> {
  const startTime = Date.now();

  const connector = createConnector(
    connectorInfo.provider,
    connectorInfo.credentials,
    orgId
  );

  // Default: sync last 30 days, or from last sync date
  const now = new Date();
  const defaultFrom = connectorInfo.lastSyncAt
    ? new Date(connectorInfo.lastSyncAt.getTime() - 24 * 60 * 60 * 1000) // overlap by 1 day
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const syncOptions: SyncOptions = {
    dateFrom: options?.dateFrom || defaultFrom,
    dateTo: options?.dateTo || now,
    fullSync: options?.fullSync || false,
  };

  try {
    // Fetch records from the provider
    const records = await connector.fetchUsage(syncOptions);

    // Run the base sync for validation
    const result = await connector.sync(syncOptions);

    return {
      connectorId: connectorInfo.id,
      provider: connectorInfo.provider,
      result: { ...result, recordsProcessed: records.length },
      records,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connectorId: connectorInfo.id,
      provider: connectorInfo.provider,
      result: {
        success: false,
        recordsProcessed: 0,
        recordsInserted: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        warnings: [],
      },
      records: [],
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Sync all connectors for an organization
 */
export async function syncAllConnectors(
  connectors: ConnectorInfo[],
  orgId: string,
  options?: Partial<SyncOptions>
): Promise<SyncJobResult[]> {
  // Run all syncs in parallel (with concurrency limit)
  const CONCURRENCY = 3;
  const results: SyncJobResult[] = [];
  const queue = [...connectors];

  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(c => syncConnector(c, orgId, options))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Determine which connectors need syncing based on their sync interval
 */
export function getConnectorsNeedingSync(
  connectors: ConnectorInfo[]
): ConnectorInfo[] {
  const now = Date.now();
  return connectors.filter(c => {
    if (!c.lastSyncAt) return true; // Never synced
    const timeSinceLastSync = now - c.lastSyncAt.getTime();
    return timeSinceLastSync >= c.syncInterval * 1000;
  });
}

/**
 * Process sync results: deduplicate, attribute to teams, and prepare for storage
 */
export function processRecords(
  records: NormalizedCostRecord[],
  teamMappings: { keyPrefix: string; teamId: string }[]
): NormalizedCostRecord[] {
  // Step 1: Deduplicate (same provider + model + date + amount)
  const seen = new Set<string>();
  const unique = records.filter(r => {
    const key = `${r.provider}:${r.model}:${r.usageDate.toISOString()}:${r.costUsd}:${r.apiKeyPrefix}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Step 2: Attribute to teams based on API key mappings
  const attributed = unique.map(r => {
    if (r.apiKeyPrefix) {
      const mapping = teamMappings.find(m => m.keyPrefix === r.apiKeyPrefix);
      if (mapping) {
        return { ...r, teamId: mapping.teamId, confidence: "CONFIRMED" as const };
      }
    }
    return r;
  });

  // Step 3: Sort by date
  attributed.sort((a, b) => a.usageDate.getTime() - b.usageDate.getTime());

  return attributed;
}

/**
 * Generate a sync summary for logging/notifications
 */
export function generateSyncSummary(results: SyncJobResult[]): {
  totalRecords: number;
  totalProviders: number;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  errors: { provider: string; error: string }[];
} {
  return {
    totalRecords: results.reduce((sum, r) => sum + r.records.length, 0),
    totalProviders: results.length,
    successCount: results.filter(r => r.result.success).length,
    failureCount: results.filter(r => !r.result.success).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    errors: results
      .filter(r => !r.result.success)
      .flatMap(r =>
        r.result.errors.map(e => ({ provider: r.provider, error: e }))
      ),
  };
}
