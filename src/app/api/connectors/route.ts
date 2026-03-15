export const dynamic = "force-dynamic";

// src/app/api/connectors/route.ts
// CostLens AI — Connector Management API (Production-ready)
// GET: List all connectors
// POST: Add a new connector (validates credentials, encrypts, stores)
// DELETE: Remove a connector

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { encryptCredentials, decryptCredentials } from "@/lib/encryption";
import { createConnector, isSupportedProvider } from "@/lib/connectors/registry";
import { connectorCreateSchema, validateBody } from "@/lib/validation";
import type { AIProvider } from "@/types";

// GET /api/connectors
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const connectors = await prisma.connector.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    // Get record counts and cost totals per connector
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const enriched = await Promise.all(
      connectors.map(async (c) => {
        const [recordCount, costSum] = await Promise.all([
          prisma.costRecord.count({
            where: { connectorId: c.id },
          }),
          prisma.costRecord.aggregate({
            where: {
              connectorId: c.id,
              usageDate: { gte: startOfMonth },
            },
            _sum: { costUsd: true },
          }),
        ]);

        return {
          id: c.id,
          provider: c.provider,
          status: c.status,
          lastSyncAt: c.lastSyncAt?.toISOString() || null,
          lastError: c.lastError,
          syncInterval: c.syncInterval,
          recordCount,
          totalCostTracked: Number(costSum._sum.costUsd || 0),
          createdAt: c.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Connectors GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch connectors" }, { status: 500 });
  }
}

// POST /api/connectors
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Zod validation
    const validation = validateBody(connectorCreateSchema, body);
    if (!validation.success) return validation.response;

    const { provider, credentials } = validation.data;

    // Check if connector already exists for this provider
    const existing = await prisma.connector.findUnique({
      where: {
        organizationId_provider: {
          organizationId: user.organizationId,
          provider: provider as AIProvider,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `${provider} is already connected` },
        { status: 409 }
      );
    }

    // Validate credentials by testing the connection
    if (isSupportedProvider(provider as AIProvider)) {
      const connector = createConnector(
        provider as AIProvider,
        credentials,
        user.organizationId
      );

      const validation = await connector.validateCredentials();
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: `Credential validation failed: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    // Encrypt credentials and store
    const encryptedCreds = encryptCredentials(credentials);

    const newConnector = await prisma.connector.create({
      data: {
        provider: provider as AIProvider,
        status: "ACTIVE",
        credentialId: encryptedCreds,
        organizationId: user.organizationId,
      },
    });

    // Log the initial sync
    await prisma.syncLog.create({
      data: {
        provider: provider as AIProvider,
        status: "RUNNING",
        organizationId: user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newConnector.id,
        provider: newConnector.provider,
        status: newConnector.status,
        message: `${provider} connected successfully. Initial sync starting...`,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Connectors POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add connector" }, { status: 500 });
  }
}

// DELETE /api/connectors?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Connector ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const connector = await prisma.connector.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!connector) {
      return NextResponse.json(
        { success: false, error: "Connector not found" },
        { status: 404 }
      );
    }

    // Delete connector and associated cost records
    await prisma.$transaction([
      prisma.costRecord.deleteMany({ where: { connectorId: id } }),
      prisma.connector.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { message: `${connector.provider} disconnected and records removed` },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Connectors DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete connector" }, { status: 500 });
  }
}
