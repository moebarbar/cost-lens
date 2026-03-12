// src/app/api/costs/route.ts
// CostLens AI — Cost Records API
// GET: Query cost records with filtering, pagination, and grouping
// POST: Manually add cost records (for CSV upload / manual entry)

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { costRecordsPostSchema, validateBody } from "@/lib/validation";

// GET /api/costs?provider=OPENAI&team=engineering&dateFrom=2026-01-01&dateTo=2026-03-09&page=1&pageSize=50
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const filters = {
      provider: searchParams.get("provider"),
      team: searchParams.get("team"),
      model: searchParams.get("model"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      minCost: searchParams.get("minCost") ? parseFloat(searchParams.get("minCost")!) : undefined,
      maxCost: searchParams.get("maxCost") ? parseFloat(searchParams.get("maxCost")!) : undefined,
    };

    // Parse pagination
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "50"), 200);
    const sortBy = searchParams.get("sortBy") || "usageDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = { organizationId: user.organizationId };
    if (filters.provider) where.provider = filters.provider;
    if (filters.team) where.teamId = filters.team;
    if (filters.model) where.model = { contains: filters.model, mode: "insensitive" };
    if (filters.dateFrom || filters.dateTo) {
      where.usageDate = {};
      if (filters.dateFrom) where.usageDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.usageDate.lte = new Date(filters.dateTo);
    }
    if (filters.minCost !== undefined || filters.maxCost !== undefined) {
      where.costUsd = {};
      if (filters.minCost !== undefined) where.costUsd.gte = filters.minCost;
      if (filters.maxCost !== undefined) where.costUsd.lte = filters.maxCost;
    }

    const [records, total] = await Promise.all([
      prisma.costRecord.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { team: true, connector: true },
      }),
      prisma.costRecord.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: records.map((r) => ({
        ...r,
        costUsd: Number(r.costUsd),
        originalCost: r.originalCost ? Number(r.originalCost) : null,
        usageAmount: r.usageAmount ? Number(r.usageAmount) : null,
      })),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cost records API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cost records" },
      { status: 500 }
    );
  }
}

// POST /api/costs
// Body: { records: NormalizedCostRecord[] }
// Used for CSV upload or manual entry
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(costRecordsPostSchema, body);
    if (!validation.success) return validation.response;

    const created = await prisma.costRecord.createMany({
      data: validation.data.records.map((r) => ({
        provider: r.provider as any,
        model: r.model || null,
        service: r.service || null,
        costUsd: r.costUsd,
        usageUnit: (r.usageUnit || null) as any,
        usageAmount: r.usageAmount || null,
        inputTokens: r.inputTokens || null,
        outputTokens: r.outputTokens || null,
        usageDate: new Date(r.usageDate),
        billingPeriod: r.billingPeriod || null,
        apiKeyPrefix: r.apiKeyPrefix || null,
        projectTag: r.projectTag || null,
        confidence: "ESTIMATED" as any,
        organizationId: user.organizationId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        inserted: created.count,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cost records POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to insert cost records" },
      { status: 500 }
    );
  }
}
