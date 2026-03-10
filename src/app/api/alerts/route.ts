// src/app/api/alerts/route.ts
// CostLens AI — Budget Alerts API
// CRUD operations for budget alerts

import { NextRequest, NextResponse } from "next/server";

// GET /api/alerts — List all alerts for the org
export async function GET(request: NextRequest) {
  try {
    const orgId = "demo-org"; // TODO: Get from session

    // TODO: Fetch from database
    // const alerts = await prisma.budgetAlert.findMany({
    //   where: { organizationId: orgId },
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// POST /api/alerts — Create a new budget alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = "demo-org"; // TODO: Get from session

    const { name, threshold, period, scope, scopeFilter, enabled } = body;

    // Validation
    if (!name || !threshold || !period || !scope) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, threshold, period, scope" },
        { status: 400 }
      );
    }

    if (threshold <= 0) {
      return NextResponse.json(
        { success: false, error: "Threshold must be greater than 0" },
        { status: 400 }
      );
    }

    // TODO: Insert into database
    // const alert = await prisma.budgetAlert.create({
    //   data: {
    //     name,
    //     threshold,
    //     period,
    //     scope,
    //     scopeFilter,
    //     enabled: enabled ?? true,
    //     organizationId: orgId,
    //   },
    // });

    return NextResponse.json({
      success: true,
      data: {
        id: "placeholder-id",
        name,
        threshold,
        period,
        scope,
        scopeFilter,
        enabled: enabled ?? true,
        message: "Budget alert created successfully",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// PUT /api/alerts — Update an existing alert
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const orgId = "demo-org"; // TODO: Get from session

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing alert ID" },
        { status: 400 }
      );
    }

    // TODO: Update in database
    // const alert = await prisma.budgetAlert.update({
    //   where: { id, organizationId: orgId },
    //   data: updates,
    // });

    return NextResponse.json({
      success: true,
      data: { id, ...updates, message: "Alert updated successfully" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts — Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const orgId = "demo-org"; // TODO: Get from session

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing alert ID" },
        { status: 400 }
      );
    }

    // TODO: Delete from database
    // await prisma.budgetAlert.delete({
    //   where: { id, organizationId: orgId },
    // });

    return NextResponse.json({
      success: true,
      data: { message: "Alert deleted successfully" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
