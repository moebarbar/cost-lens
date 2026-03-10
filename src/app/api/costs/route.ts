// src/app/api/costs/route.ts
// CostLens AI — Cost Records API
// GET: Query cost records with filtering, pagination, and grouping
// POST: Manually add cost records (for CSV upload / manual entry)

import { NextRequest, NextResponse } from "next/server";

// GET /api/costs?provider=OPENAI&team=engineering&dateFrom=2026-01-01&dateTo=2026-03-09&page=1&pageSize=50
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = "demo-org"; // TODO: Get from session

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

    // TODO: Query database with Prisma
    // const where: any = { organizationId: orgId };
    // if (filters.provider) where.provider = filters.provider;
    // if (filters.team) where.teamId = filters.team;
    // if (filters.model) where.model = { contains: filters.model };
    // if (filters.dateFrom) where.usageDate = { ...where.usageDate, gte: new Date(filters.dateFrom) };
    // if (filters.dateTo) where.usageDate = { ...where.usageDate, lte: new Date(filters.dateTo) };
    //
    // const [records, total] = await Promise.all([
    //   prisma.costRecord.findMany({
    //     where,
    //     orderBy: { [sortBy]: sortOrder },
    //     skip: (page - 1) * pageSize,
    //     take: pageSize,
    //     include: { team: true, connector: true },
    //   }),
    //   prisma.costRecord.count({ where }),
    // ]);

    return NextResponse.json({
      success: true,
      data: [],
      meta: {
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      },
    });
  } catch (error) {
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
    const body = await request.json();
    const { records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: "No records provided" },
        { status: 400 }
      );
    }

    const orgId = "demo-org"; // TODO: Get from session

    // Validate each record
    const errors: string[] = [];
    const validRecords = records.filter((r: any, i: number) => {
      if (!r.provider) { errors.push(`Record ${i}: missing provider`); return false; }
      if (r.costUsd === undefined || r.costUsd === null) { errors.push(`Record ${i}: missing costUsd`); return false; }
      if (!r.usageDate) { errors.push(`Record ${i}: missing usageDate`); return false; }
      return true;
    });

    // TODO: Insert into database
    // const created = await prisma.costRecord.createMany({
    //   data: validRecords.map(r => ({
    //     ...r,
    //     organizationId: orgId,
    //     confidence: 'ESTIMATED',
    //   })),
    //   skipDuplicates: true,
    // });

    return NextResponse.json({
      success: true,
      data: {
        inserted: validRecords.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Cost records POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to insert cost records" },
      { status: 500 }
    );
  }
}
