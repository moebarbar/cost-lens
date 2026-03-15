export const dynamic = "force-dynamic";

// src/app/api/optimize/route.ts
// CostLens AI — Optimization Suggestions API
// Returns AI model switch recommendations based on usage patterns

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getOptimizationSuggestions } from "@/lib/services/cost-aggregation";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const orgId = user.organizationId;

    const now = new Date();
    const dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 30);

    const filters = {
      dateFrom: dateFrom.toISOString(),
      dateTo: now.toISOString(),
    };

    const result = await getOptimizationSuggestions(orgId, filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Optimize API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load optimization suggestions" },
      { status: 500 }
    );
  }
}
