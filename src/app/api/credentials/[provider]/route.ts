export const dynamic = "force-dynamic";

// src/app/api/credentials/[provider]/route.ts
// CostLens AI — Per-provider credential endpoints
// GET    /api/credentials/OPENAI   — status for a specific provider
// DELETE /api/credentials/OPENAI   — remove credentials + all cost records

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listCredentialStatuses, deleteCredential } from "@/lib/services/credentials";
import type { AIProvider } from "@/types";

type Params = { params: { provider: string } };

// GET /api/credentials/[provider]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const provider = params.provider.toUpperCase() as AIProvider;

    const all = await listCredentialStatuses(user.organizationId);
    const status = all.find(s => s.provider === provider);

    if (!status) {
      return NextResponse.json(
        { success: false, error: `${provider} is not connected` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: status });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to fetch status" }, { status: 500 });
  }
}

// DELETE /api/credentials/[provider]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const provider = params.provider.toUpperCase() as AIProvider;

    const deleted = await deleteCredential(user.organizationId, provider);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `${provider} connector not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: `${provider} disconnected and all associated records removed` },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Credentials DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to remove credentials" }, { status: 500 });
  }
}
