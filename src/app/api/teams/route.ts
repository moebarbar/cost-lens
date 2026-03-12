// src/app/api/teams/route.ts
// CostLens AI — Teams & Attribution API
// Manage teams and map API keys to teams for cost attribution

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { teamCreateSchema, teamUpdateSchema, validateBody } from "@/lib/validation";

// GET /api/teams — List all teams with their cost summaries
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const teams = await prisma.team.findMany({
      where: { organizationId: user.organizationId },
      include: {
        users: { select: { id: true, name: true, email: true } },
        apiKeys: true,
        _count: { select: { costRecords: true } },
      },
    });

    // Get current month spend per team
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const teamSpend = await prisma.costRecord.groupBy({
      by: ["teamId"],
      where: {
        organizationId: user.organizationId,
        usageDate: { gte: startOfMonth },
        teamId: { not: null },
      },
      _sum: { costUsd: true },
    });

    const spendMap = new Map(
      teamSpend.map((s) => [s.teamId, Number(s._sum.costUsd ?? 0)])
    );

    return NextResponse.json({
      success: true,
      data: teams.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        createdAt: t.createdAt.toISOString(),
        memberCount: t.users.length,
        members: t.users,
        apiKeys: t.apiKeys.map((k) => ({
          id: k.id,
          keyPrefix: k.keyPrefix,
          keyAlias: k.keyAlias,
          provider: k.provider,
        })),
        recordCount: t._count.costRecords,
        currentMonthSpend: spendMap.get(t.id) ?? 0,
      })),
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams — Create a new team
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(teamCreateSchema, body);
    if (!validation.success) return validation.response;

    const { name, color } = validation.data;

    const team = await prisma.team.create({
      data: {
        name,
        color: color || "#00E5A0",
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        color: team.color,
        message: "Team created successfully",
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // Handle unique constraint violation (duplicate team name in org)
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A team with that name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create team" },
      { status: 500 }
    );
  }
}

// PUT /api/teams — Update team or add API key mapping
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(teamUpdateSchema, body);
    if (!validation.success) return validation.response;

    const { teamId, action, ...data } = validation.data;

    // Verify team belongs to this org
    const existingTeam = await prisma.team.findFirst({
      where: { id: teamId, organizationId: user.organizationId },
    });

    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    if (action === "add_api_key") {
      // Map an API key prefix to this team
      const { keyPrefix, keyAlias, provider } = data;

      if (!keyPrefix || !provider) {
        return NextResponse.json(
          { success: false, error: "keyPrefix and provider are required" },
          { status: 400 }
        );
      }

      // Only store first 8 chars for security
      const safePrefix = keyPrefix.slice(0, 8);

      await prisma.apiKeyMapping.create({
        data: {
          keyPrefix: safePrefix,
          keyAlias: keyAlias || null,
          provider,
          teamId,
          organizationId: user.organizationId,
        },
      });

      // Re-attribute existing unattributed records
      const updated = await prisma.costRecord.updateMany({
        where: {
          organizationId: user.organizationId,
          provider,
          apiKeyPrefix: safePrefix,
          teamId: null,
        },
        data: { teamId, confidence: "CONFIRMED" },
      });

      return NextResponse.json({
        success: true,
        data: {
          message: `API key mapped to team. ${updated.count} existing records re-attributed.`,
        },
      });
    }

    // Default: update team info
    const { name, color } = data;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    await prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: { message: "Team updated successfully" },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // Handle unique constraint violation for API key mapping
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "This API key prefix is already mapped for this provider" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update team" },
      { status: 500 }
    );
  }
}
