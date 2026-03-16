export const dynamic = "force-dynamic";

// src/app/api/connectors/test/route.ts
// CostLens AI — Test connector credentials without saving
// Used by the Settings → Credentials "Test Connection" button

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createConnector, isSupportedProvider } from "@/lib/connectors/registry";
import type { AIProvider } from "@/types";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { provider, credentials } = body;

    if (!provider || !credentials || typeof credentials !== "object") {
      return NextResponse.json(
        { success: false, error: "provider and credentials are required" },
        { status: 400 }
      );
    }

    if (!isSupportedProvider(provider as AIProvider)) {
      return NextResponse.json(
        { success: false, error: `${provider} is not yet supported` },
        { status: 400 }
      );
    }

    const connector = createConnector(provider as AIProvider, credentials, "test");
    const result = await connector.validateCredentials();

    return NextResponse.json({
      success: result.valid,
      error: result.error,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Connector test error:", error);
    return NextResponse.json({ success: false, error: "Connection test failed" }, { status: 500 });
  }
}
