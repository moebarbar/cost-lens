// src/hooks/use-api.ts
// CostLens AI — React hooks for all API calls
// Replaces mock data with real fetch() calls to backend routes

import { useState, useEffect, useCallback } from "react";

const API_BASE = "/api";

// ============================================================
// Generic fetch wrapper with error handling
// ============================================================

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (res.status === 401) {
      // Redirect to login
      window.location.href = "/login";
      return { success: false, error: "Unauthorized" };
    }

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Request failed (${res.status})` };
    }

    return { success: true, data: json.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

function useApiQuery<T>(endpoint: string, params?: Record<string, string>): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = params
    ? "?" + new URLSearchParams(params).toString()
    : "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiFetch<T>(`${endpoint}${queryString}`);
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || "Failed to fetch");
    }
    setLoading(false);
  }, [endpoint, queryString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================
// Dashboard Hooks
// ============================================================

export function useDashboard(period: string = "30d", groupBy: string = "day") {
  return useApiQuery<{
    overview: {
      totalSpend: number;
      totalSpendPrevPeriod: number;
      spendChange: number;
      activeTools: number;
      newToolsThisPeriod: number;
      wasteDetected: number;
      roiScore: number | null;
    };
    byProvider: Array<{
      provider: string;
      displayName: string;
      totalCost: number;
      percentage: number;
      trend: number;
      color: string;
    }>;
    byTeam: Array<{
      teamId: string;
      teamName: string;
      totalCost: number;
      percentage: number;
      color: string;
      topModels: { model: string; cost: number }[];
    }>;
    byModel: Array<{
      provider: string;
      model: string;
      totalCost: number;
      totalTokens: number;
      avgCostPerRequest: number;
      requestCount: number;
    }>;
    timeSeries: Array<{
      date: string;
      totalCost: number;
      byProvider: Record<string, number>;
    }>;
    anomalies: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      description: string;
      estimatedImpact: number;
      detectedAt: string;
    }>;
    waste: {
      totalWaste: number;
      categories: Array<{
        type: string;
        description: string;
        amount: number;
        recommendation: string;
      }>;
    };
  }>("/dashboard", { period, groupBy });
}

// ============================================================
// Cost Records Hooks
// ============================================================

export function useCostRecords(filters: {
  provider?: string;
  team?: string;
  model?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params[key] = String(value);
    }
  });

  return useApiQuery<{
    records: Array<{
      id: string;
      provider: string;
      model: string;
      costUsd: number;
      inputTokens: number;
      outputTokens: number;
      teamName: string;
      usageDate: string;
      confidence: string;
    }>;
    meta: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }>("/costs", params);
}

// ============================================================
// Connector Hooks
// ============================================================

export function useConnectors() {
  return useApiQuery<Array<{
    id: string;
    provider: string;
    status: string;
    lastSyncAt: string | null;
    lastError: string | null;
    recordCount: number;
    totalCostTracked: number;
  }>>("/connectors");
}

export async function addConnector(provider: string, credentials: Record<string, string>) {
  return apiFetch("/connectors", {
    method: "POST",
    body: JSON.stringify({ provider, credentials }),
  });
}

export async function deleteConnector(connectorId: string) {
  return apiFetch(`/connectors?id=${connectorId}`, {
    method: "DELETE",
  });
}

export async function syncConnector(provider?: string) {
  return apiFetch("/connectors/sync", {
    method: "POST",
    body: JSON.stringify({ provider, fullSync: false }),
  });
}

export async function syncAllConnectors() {
  return apiFetch("/connectors/sync", {
    method: "POST",
    body: JSON.stringify({ fullSync: false }),
  });
}

// ============================================================
// Team Hooks
// ============================================================

export function useTeams() {
  return useApiQuery<Array<{
    id: string;
    name: string;
    color: string;
    createdAt: string;
    memberCount: number;
    members: Array<{ id: string; name: string | null; email: string }>;
    apiKeys: Array<{ id: string; keyPrefix: string; keyAlias: string | null; provider: string }>;
    recordCount: number;
    currentMonthSpend: number;
    topModels?: string[];
  }>>("/teams");
}

export async function createTeam(name: string, color?: string) {
  return apiFetch("/teams", {
    method: "POST",
    body: JSON.stringify({ name, color }),
  });
}

export async function mapApiKeyToTeam(
  teamId: string,
  keyPrefix: string,
  provider: string,
  keyAlias?: string
) {
  return apiFetch("/teams", {
    method: "PUT",
    body: JSON.stringify({
      teamId,
      action: "add_api_key",
      keyPrefix,
      provider,
      keyAlias,
    }),
  });
}

// ============================================================
// Alert Hooks
// ============================================================

export function useAlerts() {
  return useApiQuery<Array<{
    id: string;
    name: string;
    threshold: number;
    currentSpend: number;
    percentUsed: number;
    period: string;
    scope: string;
    scopeFilter: string | null;
    enabled: boolean;
    lastTriggeredAt: string | null;
  }>>("/alerts");
}

export async function createAlert(alert: {
  name: string;
  threshold: number;
  period: string;
  scope: string;
  scopeFilter?: string;
  enabled?: boolean;
}) {
  return apiFetch("/alerts", {
    method: "POST",
    body: JSON.stringify(alert),
  });
}

export async function updateAlert(id: string, updates: Record<string, any>) {
  return apiFetch("/alerts", {
    method: "PUT",
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function deleteAlert(id: string) {
  return apiFetch(`/alerts?id=${id}`, {
    method: "DELETE",
  });
}

// ============================================================
// Optimization Hooks
// ============================================================

export function useOptimizations() {
  return useApiQuery<{
    totalSavings: number;
    suggestions: Array<{
      currentModel: string;
      suggestedModel: string;
      team: string;
      currentMonthlyCost: number;
      projectedMonthlyCost: number;
      monthlySavings: number;
      confidence: string;
      rationale: string;
    }>;
  }>("/optimize");
}

// ============================================================
// Auth Hooks
// ============================================================

export function useCurrentUser() {
  return useApiQuery<{
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
    organizationName: string;
    plan: string;
  }>("/auth/me");
}

export async function login(email: string, password: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

// ============================================================
// Credentials Hooks
// ============================================================

export interface CredentialStatus {
  provider: string;
  status: "active" | "error" | "pending" | "disabled";
  lastSyncAt: string | null;
  recordCount: number;
  lastError: string | null;
  connectorId: string;
}

export function useCredentials() {
  return useApiQuery<CredentialStatus[]>("/credentials");
}

export async function saveCredential(
  provider: string,
  credentials: Record<string, string>
) {
  return apiFetch("/credentials", {
    method: "POST",
    body: JSON.stringify({ provider, credentials }),
  });
}

export async function removeCredential(provider: string) {
  return apiFetch(`/credentials/${provider}`, { method: "DELETE" });
}
