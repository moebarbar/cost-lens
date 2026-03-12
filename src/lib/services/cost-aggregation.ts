// src/lib/services/cost-aggregation.ts
// CostLens AI — Cost Aggregation Service
// All dashboard queries backed by real Prisma DB calls

import prisma from "@/lib/db";
import {
  CostFilters,
  SpendByProvider,
  SpendByTeam,
  SpendByModel,
  SpendTimeSeries,
  DashboardOverview,
  CostAnomaly,
  PROVIDER_CONFIG,
} from "@/types";

// ============================================================
// Helpers
// ============================================================

function periodDates(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

function toNum(decimal: unknown): number {
  if (decimal == null) return 0;
  return typeof decimal === "object"
    ? parseFloat((decimal as { toString(): string }).toString())
    : Number(decimal);
}

// ============================================================
// getDashboardOverview
// ============================================================

export async function getDashboardOverview(
  orgId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<DashboardOverview> {
  const periodMs = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const prevPeriodStart = new Date(currentPeriodStart.getTime() - periodMs);
  const prevPeriodEnd = new Date(currentPeriodStart);

  const [currentAgg, prevAgg, activeConnectors, newConnectors] = await Promise.all([
    prisma.costRecord.aggregate({
      where: {
        organizationId: orgId,
        usageDate: { gte: currentPeriodStart, lte: currentPeriodEnd },
      },
      _sum: { costUsd: true },
    }),
    prisma.costRecord.aggregate({
      where: {
        organizationId: orgId,
        usageDate: { gte: prevPeriodStart, lte: prevPeriodEnd },
      },
      _sum: { costUsd: true },
    }),
    prisma.connector.count({
      where: { organizationId: orgId, status: "ACTIVE" },
    }),
    prisma.connector.count({
      where: {
        organizationId: orgId,
        createdAt: { gte: currentPeriodStart },
      },
    }),
  ]);

  const totalSpend = toNum(currentAgg._sum.costUsd);
  const totalSpendPrevPeriod = toNum(prevAgg._sum.costUsd);
  const spendChange =
    totalSpendPrevPeriod > 0
      ? ((totalSpend - totalSpendPrevPeriod) / totalSpendPrevPeriod) * 100
      : 0;

  // Estimate waste: connectors with zero usage in the period
  const unusedConnectors = await prisma.connector.findMany({
    where: {
      organizationId: orgId,
      status: "ACTIVE",
      costRecords: {
        none: {
          usageDate: { gte: currentPeriodStart },
        },
      },
    },
  });
  const wasteDetected = unusedConnectors.length > 0 ? totalSpend * 0.05 : 0;

  return {
    totalSpend,
    totalSpendPrevPeriod,
    spendChange,
    activeTools: activeConnectors,
    newToolsThisPeriod: newConnectors,
    wasteDetected,
    roiScore: null,
  };
}

// ============================================================
// getSpendByProvider
// ============================================================

export async function getSpendByProvider(
  orgId: string,
  filters: CostFilters
): Promise<SpendByProvider[]> {
  const results = await prisma.costRecord.groupBy({
    by: ["provider"],
    where: {
      organizationId: orgId,
      ...(filters.dateFrom && { usageDate: { gte: new Date(filters.dateFrom) } }),
      ...(filters.dateTo && {
        usageDate: {
          ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
          lte: new Date(filters.dateTo),
        },
      }),
    },
    _sum: { costUsd: true },
    orderBy: { _sum: { costUsd: "desc" } },
  });

  const total = results.reduce((acc, r) => acc + toNum(r._sum.costUsd), 0);

  return results.map((r) => {
    const cost = toNum(r._sum.costUsd);
    const config = PROVIDER_CONFIG[r.provider as keyof typeof PROVIDER_CONFIG];
    return {
      provider: r.provider,
      displayName: config?.name ?? r.provider,
      totalCost: cost,
      percentage: total > 0 ? (cost / total) * 100 : 0,
      trend: 0, // TODO: compare to prev period
      color: config?.color ?? "#888888",
    };
  });
}

// ============================================================
// getSpendByTeam
// ============================================================

export async function getSpendByTeam(
  orgId: string,
  filters: CostFilters
): Promise<SpendByTeam[]> {
  const results = await prisma.costRecord.groupBy({
    by: ["teamId"],
    where: {
      organizationId: orgId,
      teamId: { not: null },
      ...(filters.dateFrom && { usageDate: { gte: new Date(filters.dateFrom) } }),
      ...(filters.dateTo && {
        usageDate: {
          ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
          lte: new Date(filters.dateTo),
        },
      }),
    },
    _sum: { costUsd: true },
    orderBy: { _sum: { costUsd: "desc" } },
  });

  const total = results.reduce((acc, r) => acc + toNum(r._sum.costUsd), 0);

  const teams = await prisma.team.findMany({
    where: { organizationId: orgId },
  });
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const TEAM_COLORS = ["#00D4AA", "#D4A574", "#FF9900", "#0078D4", "#4285F4"];

  return results
    .filter((r) => r.teamId)
    .map((r, i) => {
      const cost = toNum(r._sum.costUsd);
      const team = teamMap.get(r.teamId!);
      return {
        teamId: r.teamId!,
        teamName: team?.name ?? "Unknown",
        totalCost: cost,
        percentage: total > 0 ? (cost / total) * 100 : 0,
        color: team?.color ?? TEAM_COLORS[i % TEAM_COLORS.length],
        topModels: [],
      };
    });
}

// ============================================================
// getSpendByModel
// ============================================================

export async function getSpendByModel(
  orgId: string,
  filters: CostFilters
): Promise<SpendByModel[]> {
  const results = await prisma.costRecord.groupBy({
    by: ["provider", "model"],
    where: {
      organizationId: orgId,
      model: { not: null },
      ...(filters.dateFrom && { usageDate: { gte: new Date(filters.dateFrom) } }),
      ...(filters.dateTo && {
        usageDate: {
          ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
          lte: new Date(filters.dateTo),
        },
      }),
    },
    _sum: { costUsd: true, inputTokens: true, outputTokens: true },
    _count: { id: true },
    orderBy: { _sum: { costUsd: "desc" } },
  });

  return results.map((r) => {
    const costUsd = toNum(r._sum.costUsd);
    const totalTokens =
      (r._sum.inputTokens ?? 0) + (r._sum.outputTokens ?? 0);
    const count = r._count.id;
    return {
      provider: r.provider,
      model: r.model ?? "unknown",
      totalCost: costUsd,
      totalTokens,
      avgCostPerRequest: count > 0 ? costUsd / count : 0,
      requestCount: count,
    };
  });
}

// ============================================================
// getSpendTimeSeries  (raw SQL with DATE_TRUNC)
// ============================================================

export async function getSpendTimeSeries(
  orgId: string,
  filters: CostFilters
): Promise<SpendTimeSeries[]> {
  const groupBy = filters.groupBy ?? "day";
  const { from, to } = filters.dateFrom && filters.dateTo
    ? { from: new Date(filters.dateFrom), to: new Date(filters.dateTo) }
    : periodDates(30);

  type RawRow = { date: Date; provider: string; total_cost: string };

  const rows: RawRow[] = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC(${groupBy}, usage_date) AS date,
      provider,
      SUM(cost_usd)::float AS total_cost
    FROM cost_records
    WHERE organization_id = ${orgId}
      AND usage_date >= ${from}
      AND usage_date <= ${to}
    GROUP BY date, provider
    ORDER BY date ASC
  `;

  // Pivot: group by date
  const byDate = new Map<string, SpendTimeSeries>();
  for (const row of rows) {
    const dateStr = row.date instanceof Date
      ? row.date.toISOString().split("T")[0]
      : String(row.date);
    if (!byDate.has(dateStr)) {
      byDate.set(dateStr, { date: dateStr, totalCost: 0, byProvider: {}, byTeam: {} });
    }
    const entry = byDate.get(dateStr)!;
    const cost = parseFloat(row.total_cost);
    entry.totalCost += cost;
    entry.byProvider[row.provider] = (entry.byProvider[row.provider] ?? 0) + cost;
  }

  return Array.from(byDate.values());
}

// ============================================================
// detectAnomalies
// ============================================================

export async function detectAnomalies(orgId: string): Promise<CostAnomaly[]> {
  const anomalies: CostAnomaly[] = [];

  // 1. Today's spend vs 7-day rolling average
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [todayAgg, rollingAgg] = await Promise.all([
    prisma.costRecord.aggregate({
      where: { organizationId: orgId, usageDate: { gte: todayStart, lte: todayEnd } },
      _sum: { costUsd: true },
    }),
    prisma.costRecord.aggregate({
      where: { organizationId: orgId, usageDate: { gte: sevenDaysAgo, lte: todayStart } },
      _sum: { costUsd: true },
    }),
  ]);

  const todaySpend = toNum(todayAgg._sum.costUsd);
  const rollingAvg = toNum(rollingAgg._sum.costUsd) / 7;
  if (rollingAvg > 0 && todaySpend > rollingAvg * 1.5) {
    anomalies.push({
      id: "spike-today",
      type: "spike",
      severity: todaySpend > rollingAvg * 2 ? "high" : "medium",
      title: "Unusual spend spike today",
      description: `Today's spend ($${todaySpend.toFixed(2)}) is ${((todaySpend / rollingAvg - 1) * 100).toFixed(0)}% above 7-day average ($${rollingAvg.toFixed(2)}).`,
      estimatedImpact: todaySpend - rollingAvg,
      detectedAt: new Date().toISOString(),
    });
  }

  // 2. Unused connectors (active but no records in 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const unusedConnectors = await prisma.connector.findMany({
    where: {
      organizationId: orgId,
      status: "ACTIVE",
      costRecords: { none: { usageDate: { gte: thirtyDaysAgo } } },
    },
  });
  for (const conn of unusedConnectors) {
    anomalies.push({
      id: `unused-${conn.id}`,
      type: "unused",
      severity: "low",
      title: `Unused connector: ${conn.provider}`,
      description: "This connector is active but hasn't reported any usage in the last 30 days.",
      estimatedImpact: 0,
      detectedAt: new Date().toISOString(),
      provider: conn.provider,
    });
  }

  return anomalies;
}

// ============================================================
// calculateWaste
// ============================================================

export async function calculateWaste(
  orgId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<{
  totalWaste: number;
  categories: {
    type: string;
    description: string;
    amount: number;
    recommendation: string;
  }[];
}> {
  const categories: { type: string; description: string; amount: number; recommendation: string }[] = [];

  // Unused subscriptions: active connectors with no usage this period
  const unusedConnectors = await prisma.connector.findMany({
    where: {
      organizationId: orgId,
      status: "ACTIVE",
      costRecords: { none: { usageDate: { gte: currentPeriodStart } } },
    },
  });

  if (unusedConnectors.length > 0) {
    categories.push({
      type: "unused_connectors",
      description: `${unusedConnectors.length} connected provider(s) have no usage this period: ${unusedConnectors.map(c => c.provider).join(", ")}`,
      amount: 0, // no direct cost but opportunity cost
      recommendation: "Review and remove unused connectors to declutter your dashboard.",
    });
  }

  const totalWaste = categories.reduce((sum, c) => sum + c.amount, 0);
  return { totalWaste, categories };
}

// ============================================================
// checkBudgetAlerts
// ============================================================

export async function checkBudgetAlerts(orgId: string): Promise<{
  alertId: string;
  alertName: string;
  currentSpend: number;
  threshold: number;
  percentUsed: number;
  emailSent?: boolean;
}[]> {
  const { sendBudgetAlertEmail } = await import("@/lib/services/email");

  const alerts = await prisma.budgetAlert.findMany({
    where: { organizationId: orgId, enabled: true },
  });

  // Get org owner email for notifications
  const orgOwner = await prisma.user.findFirst({
    where: { organizationId: orgId, role: "OWNER" },
    select: { email: true },
  });

  const results = [];
  const now = new Date();

  for (const alert of alerts) {
    let periodStart: Date;
    if (alert.period === "DAILY") {
      periodStart = new Date(now); periodStart.setHours(0,0,0,0);
    } else if (alert.period === "WEEKLY") {
      periodStart = new Date(now); periodStart.setDate(now.getDate() - 7);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const where: Record<string, unknown> = {
      organizationId: orgId,
      usageDate: { gte: periodStart },
    };
    if (alert.scope === "TEAM" && alert.scopeFilter) where.teamId = alert.scopeFilter;
    if (alert.scope === "PROVIDER" && alert.scopeFilter) where.provider = alert.scopeFilter;
    if (alert.scope === "MODEL" && alert.scopeFilter) where.model = alert.scopeFilter;

    const agg = await prisma.costRecord.aggregate({
      where: where as Parameters<typeof prisma.costRecord.aggregate>[0]["where"],
      _sum: { costUsd: true },
    });

    const currentSpend = toNum(agg._sum.costUsd);
    const threshold = toNum(alert.threshold);
    const percentUsed = threshold > 0 ? (currentSpend / threshold) * 100 : 0;

    let emailSent = false;

    // Send email if threshold exceeded and not recently triggered (6h cooldown)
    if (percentUsed >= 90 && orgOwner?.email) {
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      const recentlyTriggered = alert.lastTriggeredAt && alert.lastTriggeredAt > sixHoursAgo;

      if (!recentlyTriggered) {
        const emailResult = await sendBudgetAlertEmail(orgOwner.email, {
          alertName: alert.name,
          currentSpend,
          threshold,
          percentUsed,
          period: alert.period,
          scope: alert.scope,
          scopeFilter: alert.scopeFilter,
        });

        if (emailResult.success) {
          emailSent = true;
          await prisma.budgetAlert.update({
            where: { id: alert.id },
            data: { lastTriggeredAt: now },
          });
        }
      }
    }

    results.push({
      alertId: alert.id,
      alertName: alert.name,
      currentSpend,
      threshold,
      percentUsed,
      emailSent,
    });
  }

  return results;
}

// ============================================================
// getOptimizationSuggestions
// ============================================================

export async function getOptimizationSuggestions(
  orgId: string,
  filters: CostFilters
): Promise<{
  currentModel: string;
  suggestedModel: string;
  team: string;
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  monthlySavings: number;
  confidence: "high" | "medium" | "low";
  rationale: string;
}[]> {
  // Identify high-cost models that have cheaper alternatives
  const { from } = filters.dateFrom
    ? { from: new Date(filters.dateFrom) }
    : periodDates(30);

  const byModel = await prisma.costRecord.groupBy({
    by: ["model", "teamId"],
    where: {
      organizationId: orgId,
      model: { not: null },
      usageDate: { gte: from },
    },
    _sum: { costUsd: true, inputTokens: true, outputTokens: true },
    _count: { id: true },
    orderBy: { _sum: { costUsd: "desc" } },
    take: 20,
  });

  const teams = await prisma.team.findMany({ where: { organizationId: orgId } });
  const teamMap = new Map(teams.map(t => [t.id, t.name]));

  const DOWNGRADE_MAP: Record<string, { to: string; savings: number; confidence: "high" | "medium" | "low" }> = {
    "gpt-4":           { to: "gpt-4o-mini",          savings: 0.90, confidence: "high"   },
    "gpt-4-turbo":     { to: "gpt-4o-mini",          savings: 0.85, confidence: "high"   },
    "gpt-4o":          { to: "gpt-4o-mini",          savings: 0.80, confidence: "medium" },
    "claude-3-opus":   { to: "claude-3-haiku",       savings: 0.85, confidence: "high"   },
    "claude-3-sonnet": { to: "claude-3-haiku",       savings: 0.70, confidence: "medium" },
  };

  const suggestions = [];
  for (const record of byModel) {
    const model = record.model?.toLowerCase() ?? "";
    const matchKey = Object.keys(DOWNGRADE_MAP).find(k => model.includes(k));
    if (!matchKey) continue;
    const info = DOWNGRADE_MAP[matchKey];
    const currentMonthlyCost = toNum(record._sum.costUsd);
    const monthlySavings = currentMonthlyCost * info.savings;
    if (monthlySavings < 1) continue;

    suggestions.push({
      currentModel: record.model!,
      suggestedModel: info.to,
      team: teamMap.get(record.teamId ?? "") ?? "All teams",
      currentMonthlyCost,
      projectedMonthlyCost: currentMonthlyCost - monthlySavings,
      monthlySavings,
      confidence: info.confidence,
      rationale: `Tasks using ${record.model} with typical prompt sizes can often be served by ${info.to} at similar quality and ~${(info.savings * 100).toFixed(0)}% lower cost.`,
    });
  }

  return suggestions.sort((a, b) => b.monthlySavings - a.monthlySavings).slice(0, 10);
}
