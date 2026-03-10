// src/app/api/connectors/sync/route.ts
// CostLens AI — Production Sync API
// Triggers data sync, normalizes, writes to DB

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { decryptCredentials } from "@/lib/encryption";
import { createConnector, isSupportedProvider } from "@/lib/connectors/registry";
import { processRecords } from "@/lib/services/sync-engine";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { provider, fullSync = false } = body;

    const whereClause = { organizationId: user.organizationId, status: "ACTIVE" as const };
    if (provider) (whereClause as any).provider = provider;

    const connectors = await prisma.connector.findMany({ where: whereClause });
    if (connectors.length === 0) {
      return NextResponse.json({ success: false, error: "No active connectors found" }, { status: 404 });
    }

    const keyMappings = await prisma.apiKeyMapping.findMany({
      where: { organizationId: user.organizationId },
    });
    const teamMappings = keyMappings.map(m => ({ keyPrefix: m.keyPrefix, teamId: m.teamId || "" }));

    const results = [];
    for (const conn of connectors) {
      if (!conn.credentialId || !isSupportedProvider(conn.provider)) {
        results.push({ provider: conn.provider, success: false, error: "Unsupported", records: 0 });
        continue;
      }

      const syncLog = await prisma.syncLog.create({
        data: { provider: conn.provider, status: "RUNNING", organizationId: user.organizationId },
      });

      try {
        const credentials = decryptCredentials(conn.credentialId);
        const connector = createConnector(conn.provider, credentials, user.organizationId);
        const now = new Date();
        const dateFrom = fullSync || !conn.lastSyncAt
          ? new Date(now.getTime() - 30 * 86400000)
          : new Date(conn.lastSyncAt.getTime() - 86400000);

        const rawRecords = await connector.fetchUsage({ dateFrom, dateTo: now, fullSync });
        const processed = processRecords(rawRecords, teamMappings);

        let insertedCount = 0;
        for (const record of processed) {
          try {
            await prisma.costRecord.create({
              data: {
                provider: record.provider, model: record.model, service: record.service,
                costUsd: record.costUsd, usageUnit: record.usageUnit, usageAmount: record.usageAmount,
                inputTokens: record.inputTokens, outputTokens: record.outputTokens,
                apiKeyPrefix: record.apiKeyPrefix, userId: record.userId, projectTag: record.projectTag,
                usageDate: record.usageDate, confidence: record.confidence,
                organizationId: user.organizationId, connectorId: conn.id,
                teamId: (record as any).teamId || null,
              },
            });
            insertedCount++;
          } catch (e: any) { if (e.code !== "P2002") console.error("Insert error:", e.message); }
        }

        await prisma.connector.update({ where: { id: conn.id }, data: { lastSyncAt: now, status: "ACTIVE", lastError: null } });
        await prisma.syncLog.update({ where: { id: syncLog.id }, data: { status: "SUCCESS", recordsProcessed: insertedCount, completedAt: new Date() } });
        results.push({ provider: conn.provider, success: true, records: insertedCount });
      } catch (error: any) {
        await prisma.connector.update({ where: { id: conn.id }, data: { status: "ERROR", lastError: error.message } });
        await prisma.syncLog.update({ where: { id: syncLog.id }, data: { status: "FAILED", errorMessage: error.message, completedAt: new Date() } });
        results.push({ provider: conn.provider, success: false, error: error.message, records: 0 });
      }
    }

    return NextResponse.json({ success: true, data: { results, totalRecords: results.reduce((s, r) => s + (r.records || 0), 0) } });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const syncs = await prisma.syncLog.findMany({
      where: { organizationId: user.organizationId }, orderBy: { startedAt: "desc" }, take: 20,
    });
    return NextResponse.json({ success: true, data: syncs });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
