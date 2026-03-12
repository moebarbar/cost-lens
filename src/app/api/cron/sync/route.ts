// src/app/api/cron/sync/route.ts
// CostLens AI — Automated Sync Cron Job
// Runs every 6 hours via Vercel Cron to keep all connectors up to date
// Configured in vercel.json: "0 */6 * * *"

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { decryptCredentials } from "@/lib/encryption";
import { createConnector, isSupportedProvider } from "@/lib/connectors/registry";
import { processRecords } from "@/lib/services/sync-engine";
import { checkBudgetAlerts } from "@/lib/services/cost-aggregation";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[CRON] Starting automated sync for all organizations...");

  try {
    // Get all active connectors across all organizations
    const connectors = await prisma.connector.findMany({
      where: { status: "ACTIVE" },
      include: { organization: { select: { id: true, name: true } } },
    });

    console.log(`[CRON] Found ${connectors.length} active connectors`);

    let totalSynced = 0;
    let totalFailed = 0;
    let totalRecords = 0;

    for (const conn of connectors) {
      if (!conn.credentialId || !isSupportedProvider(conn.provider)) {
        continue;
      }

      try {
        const credentials = decryptCredentials(conn.credentialId);
        const connector = createConnector(conn.provider, credentials, conn.organizationId);

        const now = new Date();
        const dateFrom = conn.lastSyncAt
          ? new Date(conn.lastSyncAt.getTime() - 86400000) // Overlap 1 day
          : new Date(now.getTime() - 7 * 86400000); // Default 7 days

        // Get team mappings for this org
        const keyMappings = await prisma.apiKeyMapping.findMany({
          where: { organizationId: conn.organizationId },
        });
        const teamMappings = keyMappings.map(m => ({
          keyPrefix: m.keyPrefix,
          teamId: m.teamId || "",
        }));

        const rawRecords = await connector.fetchUsage({ dateFrom, dateTo: now });
        const processed = processRecords(rawRecords, teamMappings);

        let inserted = 0;
        for (const record of processed) {
          try {
            await prisma.costRecord.create({
              data: {
                provider: record.provider, model: record.model, service: record.service,
                costUsd: record.costUsd, usageUnit: record.usageUnit, usageAmount: record.usageAmount,
                inputTokens: record.inputTokens, outputTokens: record.outputTokens,
                apiKeyPrefix: record.apiKeyPrefix, userId: record.userId, projectTag: record.projectTag,
                usageDate: record.usageDate, confidence: record.confidence,
                organizationId: conn.organizationId, connectorId: conn.id,
                teamId: (record as any).teamId || null,
              },
            });
            inserted++;
          } catch (e: any) {
            if (e.code !== "P2002") console.error(`[CRON] Insert error: ${e.message}`);
          }
        }

        await prisma.connector.update({
          where: { id: conn.id },
          data: { lastSyncAt: now, status: "ACTIVE", lastError: null },
        });

        await prisma.syncLog.create({
          data: {
            provider: conn.provider, status: "SUCCESS",
            recordsProcessed: inserted, organizationId: conn.organizationId,
            completedAt: new Date(),
          },
        });

        totalSynced++;
        totalRecords += inserted;
        console.log(`[CRON] ${conn.organization.name}/${conn.provider}: ${inserted} records`);
      } catch (error: any) {
        totalFailed++;
        console.error(`[CRON] Failed ${conn.provider} for ${conn.organization.name}: ${error.message}`);

        await prisma.connector.update({
          where: { id: conn.id },
          data: { status: "ERROR", lastError: error.message },
        });

        await prisma.syncLog.create({
          data: {
            provider: conn.provider, status: "FAILED",
            errorMessage: error.message, organizationId: conn.organizationId,
            completedAt: new Date(),
          },
        });
      }
    }

    console.log(`[CRON] Sync complete: ${totalSynced} synced, ${totalFailed} failed, ${totalRecords} records`);

    // Check budget alerts for all organizations that had successful syncs
    const orgIds = [...new Set(connectors.map(c => c.organizationId))];
    let alertsTriggered = 0;
    for (const orgId of orgIds) {
      try {
        const alertResults = await checkBudgetAlerts(orgId);
        const triggered = alertResults.filter(a => a.emailSent).length;
        alertsTriggered += triggered;
        if (triggered > 0) {
          console.log(`[CRON] ${triggered} alert email(s) sent for org ${orgId}`);
        }
      } catch (e) {
        console.error(`[CRON] Alert check failed for org ${orgId}:`, e);
      }
    }

    console.log(`[CRON] Alert check complete: ${alertsTriggered} email(s) sent`);

    return NextResponse.json({
      success: true,
      data: { synced: totalSynced, failed: totalFailed, totalRecords, alertsTriggered },
    });
  } catch (error: any) {
    console.error("[CRON] Fatal error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
