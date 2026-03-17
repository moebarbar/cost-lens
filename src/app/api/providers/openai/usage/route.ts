export const dynamic = "force-dynamic";

// src/app/api/providers/openai/usage/route.ts
// CostLens AI — Live OpenAI usage fetch
// Returns real-time spend data from the stored OpenAI connector

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCredential } from "@/lib/services/credentials";
import { OpenAIConnector } from "@/lib/connectors/openai";
import type { OpenAIUsageResponse } from "@/types/usage";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;

    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : new Date();
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch decrypted credentials via the credentials service
    let credentials: Record<string, string>;
    try {
      const creds = await getCredential(user.organizationId, "OPENAI");
      if (!creds) {
        return NextResponse.json(
          { success: false, error: "OpenAI not connected. Add your API key in Settings → Credentials." },
          { status: 404 }
        );
      }
      credentials = creds;
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to decrypt OpenAI credentials" },
        { status: 500 }
      );
    }

    const openai = new OpenAIConnector(credentials, user.organizationId);
    const records = await openai.fetchUsage({ dateFrom, dateTo });

    // Aggregate by model for breakdown
    const modelMap = new Map<string, { requests: number; inputTokens: number; outputTokens: number; cost: number }>();
    const dailyMap = new Map<string, { cost: number; tokens: number }>();

    let totalCost = 0;
    let totalTokens = 0;
    let totalRequests = 0;

    for (const record of records) {
      totalCost += record.costUsd;
      const tokens = (record.inputTokens ?? 0) + (record.outputTokens ?? 0);
      totalTokens += tokens;
      totalRequests += 1;

      const model = record.model || "unknown";
      const m = modelMap.get(model) ?? { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
      modelMap.set(model, {
        requests: m.requests + 1,
        inputTokens: m.inputTokens + (record.inputTokens ?? 0),
        outputTokens: m.outputTokens + (record.outputTokens ?? 0),
        cost: m.cost + record.costUsd,
      });

      const dateKey = record.usageDate.toISOString().split("T")[0];
      const d = dailyMap.get(dateKey) ?? { cost: 0, tokens: 0 };
      dailyMap.set(dateKey, { cost: d.cost + record.costUsd, tokens: d.tokens + tokens });
    }

    const breakdown = Array.from(modelMap.entries())
      .map(([model, stats]) => ({ model, ...stats }))
      .sort((a, b) => b.cost - a.cost);

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const response: OpenAIUsageResponse = {
      totalCost: Math.round(totalCost * 10000) / 10000,
      totalTokens,
      totalRequests,
      breakdown,
      dailyTrend,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("OpenAI usage fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch OpenAI usage" }, { status: 500 });
  }
}
