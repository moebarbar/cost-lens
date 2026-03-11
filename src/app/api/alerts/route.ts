// src/app/api/alerts/route.ts
// CostLens AI — Budget Alerts API
// CRUD operations for budget alerts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/alerts — List all alerts for the org
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const alerts = await prisma.budgetAlert.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: alerts.map((a) => ({
        ...a,
        threshold: Number(a.threshold),
      })),
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// POST /api/alerts — Create a new budget alert
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

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

    const alert = await prisma.budgetAlert.create({
      data: {
        name,
        threshold,
        period,
        scope,
        scopeFilter: scopeFilter || null,
        enabled: enabled ?? true,
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...alert,
        threshold: Number(alert.threshold),
        message: "Budget alert created successfully",
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// PUT /api/alerts — Update an existing alert
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing alert ID" },
        { status: 400 }
      );
    }

    // Verify ownership before updating
    const existing = await prisma.budgetAlert.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    const alert = await prisma.budgetAlert.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...alert,
        threshold: Number(alert.threshold),
        message: "Alert updated successfully",
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts — Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing alert ID" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const existing = await prisma.budgetAlert.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    await prisma.budgetAlert.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Alert deleted successfully" },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
