// src/app/api/connectors/[connectorId]/keys/route.ts
// CostLens AI — Discovered API Keys endpoint
// Returns unique API key prefixes found in cost_records for a given connector,
// enriched with spend totals and attribution status.

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { connectorId: string } }
) {
  try {
    const user = await requireAuth();

    // Verify connector belongs to this org
    const connector = await prisma.connector.findFirst({
      where: { id: params.connectorId, organizationId: user.organizationId },
    });
    if (!connector) {
      return NextResponse.json({ success: false, error: "Connector not found" }, { status: 404 });
    }

    // Aggregate unique key prefixes with stats
    type RawRow = {
      api_key_prefix: string;
      request_count: bigint;
      total_cost: string;
      project_name: string | null;
    };

    const rows: RawRow[] = await prisma.$queryRaw`
      SELECT
        api_key_prefix,
        COUNT(*)::bigint          AS request_count,
        SUM(cost_usd)::text       AS total_cost,
        MAX(project_tag)          AS project_name
      FROM cost_records
      WHERE connector_id = ${params.connectorId}
        AND api_key_prefix IS NOT NULL
      GROUP BY api_key_prefix
      ORDER BY SUM(cost_usd) DESC
    `;

    // Fetch existing mappings for this org to show current attribution
    const existingMappings = await prisma.apiKeyMapping.findMany({
      where: { organizationId: user.organizationId, provider: connector.provider },
      include: { team: { select: { id: true, name: true, color: true } } },
    });
    const mappingsByPrefix = new Map(existingMappings.map(m => [m.keyPrefix, m]));

    const keys = rows.map(row => {
      const mapping = mappingsByPrefix.get(row.api_key_prefix);
      return {
        keyPrefix: row.api_key_prefix,
        maskedKey: `${row.api_key_prefix.slice(0, 8)}•••`,
        requestCount: Number(row.request_count),
        totalCost: parseFloat(row.total_cost ?? "0"),
        projectName: row.project_name ?? null,
        // Current attribution
        teamId: mapping?.teamId ?? null,
        teamName: mapping?.team?.name ?? null,
        teamColor: mapping?.team?.color ?? null,
        keyAlias: mapping?.keyAlias ?? null,
        mappingId: mapping?.id ?? null,
      };
    });

    return NextResponse.json({ success: true, data: keys });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Keys GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch keys" }, { status: 500 });
  }
}
