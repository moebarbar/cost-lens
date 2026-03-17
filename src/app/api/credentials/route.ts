export const dynamic = "force-dynamic";

// src/app/api/credentials/route.ts
// CostLens AI — Credential management API
// GET  /api/credentials       — list all connected providers (status only)
// POST /api/credentials       — save / update credentials for a provider

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createConnector, isSupportedProvider } from "@/lib/connectors/registry";
import {
  saveCredential,
  listCredentialStatuses,
} from "@/lib/services/credentials";
import type { AIProvider } from "@/types";

// GET /api/credentials
export async function GET() {
  try {
    const user = await requireAuth();
    const statuses = await listCredentialStatuses(user.organizationId);
    return NextResponse.json({ success: true, data: statuses });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Credentials GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch credentials" }, { status: 500 });
  }
}

// POST /api/credentials  { provider, credentials }
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { provider, credentials } = body as {
      provider: string;
      credentials: Record<string, string>;
    };

    if (!provider || typeof credentials !== "object" || !credentials) {
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

    if (!credentials.apiKey?.trim()) {
      return NextResponse.json(
        { success: false, error: "API key is required" },
        { status: 400 }
      );
    }

    // Validate credentials by testing the connection
    const connector = createConnector(provider as AIProvider, credentials, user.organizationId);
    const validation = await connector.validateCredentials();
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error ?? "Invalid credentials" },
        { status: 400 }
      );
    }

    // Encrypt and upsert
    const { connectorId, isNew } = await saveCredential(
      user.organizationId,
      provider as AIProvider,
      credentials
    );

    return NextResponse.json({
      success: true,
      data: {
        connectorId,
        isNew,
        message: isNew
          ? `${provider} connected. Run a sync to import data.`
          : `${provider} credentials updated.`,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Credentials POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save credentials" }, { status: 500 });
  }
}
