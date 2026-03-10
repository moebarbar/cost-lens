// src/app/api/teams/route.ts
// CostLens AI — Teams & Attribution API
// Manage teams and map API keys to teams for cost attribution

import { NextRequest, NextResponse } from "next/server";

// GET /api/teams — List all teams with their cost summaries
export async function GET(request: NextRequest) {
  try {
    const orgId = "demo-org"; // TODO: Get from session

    // TODO: Fetch from database with cost aggregation
    // const teams = await prisma.team.findMany({
    //   where: { organizationId: orgId },
    //   include: {
    //     users: { select: { id: true, name: true, email: true } },
    //     apiKeys: true,
    //     _count: { select: { costRecords: true } },
    //   },
    // });
    //
    // // Get current month spend per team
    // const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    // const teamSpend = await prisma.costRecord.groupBy({
    //   by: ['teamId'],
    //   where: { organizationId: orgId, usageDate: { gte: startOfMonth } },
    //   _sum: { costUsd: true },
    // });

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams — Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = "demo-org"; // TODO: Get from session

    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Team name is required" },
        { status: 400 }
      );
    }

    // TODO: Create in database
    // const team = await prisma.team.create({
    //   data: { name, color: color || '#00E5A0', organizationId: orgId },
    // });

    return NextResponse.json({
      success: true,
      data: {
        id: "placeholder-id",
        name,
        color: color || "#00E5A0",
        message: "Team created successfully",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create team" },
      { status: 500 }
    );
  }
}

// PUT /api/teams — Update team or add API key mapping
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = "demo-org"; // TODO: Get from session

    const { teamId, action, ...data } = body;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Team ID is required" },
        { status: 400 }
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

      // TODO: Create mapping in database
      // await prisma.apiKeyMapping.create({
      //   data: {
      //     keyPrefix: safePrefix,
      //     keyAlias,
      //     provider,
      //     teamId,
      //     organizationId: orgId,
      //   },
      // });
      //
      // // Re-attribute existing unattributed records
      // await prisma.costRecord.updateMany({
      //   where: {
      //     organizationId: orgId,
      //     provider,
      //     apiKeyPrefix: safePrefix,
      //     teamId: null,
      //   },
      //   data: { teamId, confidence: 'CONFIRMED' },
      // });

      return NextResponse.json({
        success: true,
        data: { message: `API key mapped to team. Existing records will be re-attributed.` },
      });
    }

    // Default: update team info
    // TODO: Update in database
    // await prisma.team.update({
    //   where: { id: teamId, organizationId: orgId },
    //   data,
    // });

    return NextResponse.json({
      success: true,
      data: { message: "Team updated successfully" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update team" },
      { status: 500 }
    );
  }
}
