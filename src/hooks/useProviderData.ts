"use client";

// src/hooks/useProviderData.ts
// CostLens AI — Hook for fetching live provider usage data
// Auto-refreshes every 5 minutes; handles loading/error states

import { useState, useEffect, useCallback } from "react";
import type { OpenAIUsageResponse } from "@/types/usage";

interface ProviderDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch live OpenAI usage data for a given date range.
 * Falls back gracefully if the connector is not configured.
 */
export function useOpenAIUsage(
  dateFrom?: string,
  dateTo?: string
): ProviderDataState<OpenAIUsageResponse> {
  const [data, setData] = useState<OpenAIUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/providers/openai/usage?${params}`);
      const json = await res.json();

      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error ?? "Failed to fetch OpenAI usage");
      }
    } catch {
      setError("Network error — could not reach the server");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Test connector credentials without saving them.
 * Returns { success, error } immediately.
 */
export async function testConnectorCredentials(
  provider: string,
  credentials: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/connectors/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, credentials }),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Network error" };
  }
}
