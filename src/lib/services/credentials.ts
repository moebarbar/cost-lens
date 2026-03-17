// src/lib/services/credentials.ts
// CostLens AI — Credential storage service
// Wraps Prisma + encryption for a clean, reusable credential API.
// Credentials are stored encrypted in Connector.credentialId (AES-256-GCM).
// Never returns raw API keys from list/status calls.

import prisma from "@/lib/db";
import { encryptCredentials, decryptCredentials } from "@/lib/encryption";
import type { AIProvider } from "@/types";

export interface CredentialStatus {
  provider: AIProvider;
  status: "active" | "error" | "pending" | "disabled";
  lastSyncAt: string | null;
  recordCount: number;
  lastError: string | null;
  connectorId: string;
}

/**
 * Save or replace credentials for a provider.
 * Upserts the Connector row (creates if new, updates credentialId if exists).
 * Does NOT validate credentials — callers must do that before calling this.
 */
export async function saveCredential(
  orgId: string,
  provider: AIProvider,
  credentials: Record<string, string>
): Promise<{ connectorId: string; isNew: boolean }> {
  const encrypted = encryptCredentials(credentials);

  const existing = await prisma.connector.findUnique({
    where: { organizationId_provider: { organizationId: orgId, provider } },
    select: { id: true },
  });

  if (existing) {
    await prisma.connector.update({
      where: { id: existing.id },
      data: { credentialId: encrypted, status: "ACTIVE", lastError: null, updatedAt: new Date() },
    });
    return { connectorId: existing.id, isNew: false };
  }

  const connector = await prisma.connector.create({
    data: {
      provider,
      status: "ACTIVE",
      credentialId: encrypted,
      organizationId: orgId,
    },
  });
  return { connectorId: connector.id, isNew: true };
}

/**
 * Retrieve decrypted credentials for a provider.
 * Returns null if no connector is configured.
 * Throws if decryption fails (corrupted record or wrong ENCRYPTION_KEY).
 */
export async function getCredential(
  orgId: string,
  provider: AIProvider
): Promise<Record<string, string> | null> {
  const connector = await prisma.connector.findUnique({
    where: { organizationId_provider: { organizationId: orgId, provider } },
    select: { credentialId: true, status: true },
  });

  if (!connector?.credentialId) return null;

  try {
    return decryptCredentials(connector.credentialId);
  } catch {
    throw new Error(`Failed to decrypt credentials for ${provider} — ENCRYPTION_KEY may have changed`);
  }
}

/**
 * Delete a provider's credentials and all associated cost records.
 * Returns false if no connector existed.
 */
export async function deleteCredential(
  orgId: string,
  provider: AIProvider
): Promise<boolean> {
  const connector = await prisma.connector.findUnique({
    where: { organizationId_provider: { organizationId: orgId, provider } },
    select: { id: true },
  });

  if (!connector) return false;

  await prisma.$transaction([
    prisma.costRecord.deleteMany({ where: { connectorId: connector.id } }),
    prisma.connector.delete({ where: { id: connector.id } }),
  ]);

  return true;
}

/**
 * List all connected providers for an org (status only, no decrypted keys).
 */
export async function listCredentialStatuses(orgId: string): Promise<CredentialStatus[]> {
  const connectors = await prisma.connector.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    connectors.map(async (c) => {
      const recordCount = await prisma.costRecord.count({ where: { connectorId: c.id } });
      return {
        provider: c.provider as AIProvider,
        status: c.status.toLowerCase() as CredentialStatus["status"],
        lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
        recordCount,
        lastError: c.lastError,
        connectorId: c.id,
      };
    })
  );
}

/**
 * Mark a connector as errored (called by sync engine on failure).
 */
export async function markCredentialError(
  orgId: string,
  provider: AIProvider,
  errorMessage: string
): Promise<void> {
  await prisma.connector.updateMany({
    where: { organizationId: orgId, provider },
    data: { status: "ERROR", lastError: errorMessage },
  });
}
