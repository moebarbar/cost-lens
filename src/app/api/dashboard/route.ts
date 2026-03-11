// src/app/api/dashboard/route.ts
// CostLens AI — Dashboard API
// Returns all data needed for the main dashboard view

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getDashboardOverview,
  getSpendByProvider,
  getSpendByTeam,
  getSpendByModel,
  getSpendTimeSeries,
  detectAnomalies,
  calculateWaste,
} from "@/lib/services/cost-aggregation";

// GET /api/dashboard?period=30d&groupBy=day
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30d";
    const groupBy = (searchParams.get("groupBy") as "day" | "week" | "month") || "day";

    const orgId = user.organizationId;

    // Calculate date range from period
    const now = new Date();
    const dateFrom = new Date(now);

    switch (period) {
      case "7d":
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case "30d":
        dateFrom.setDate(dateFrom.getDate() - 30);
        break;
      case "90d":
        dateFrom.setDate(dateFrom.getDate() - 90);
        break;
      case "12m":
        dateFrom.setMonth(dateFrom.getMonth() - 12);
        break;
      default:
        dateFrom.setDate(dateFrom.getDate() - 30);
    }

    const filters = {
      dateFrom: dateFrom.toISOString(),
      dateTo: now.toISOString(),
      groupBy,
    };

    // Fetch all dashboard data in parallel
    const [overview, byProvider, byTeam, byModel, timeSeries, anomalies, waste] =
      await Promise.all([
        getDashboardOverview(orgId, dateFrom, now),
        getSpendByProvider(orgId, filters),
        getSpendByTeam(orgId, filters),
        getSpendByModel(orgId, filters),
        getSpendTimeSeries(orgId, filters),
        detectAnomalies(orgId),
        calculateWaste(orgId, dateFrom, now),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        overview,
        byProvider,
        byTeam,
        byModel,
        timeSeries,
        anomalies,
        waste,
        filters: {
          period,
          dateFrom: dateFrom.toISOString(),
          dateTo: now.toISOString(),
          groupBy,
        },
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
