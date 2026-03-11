// src/lib/encryption.ts
// CostLens AI — Credential Encryption
// Encrypts/decrypts API keys stored in the database

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(salt: Buffer): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  // Derive a proper key using the per-encryption random salt
  return scryptSync(key, salt, KEY_LENGTH);
}

/**
 * Encrypt sensitive data (API keys, credentials)
 * Returns a base64 string containing: salt + iv + tag + encrypted data
 */
export function encrypt(plaintext: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Combine: salt + iv + tag + encrypted
  const result = Buffer.concat([salt, iv, tag, encrypted]);
  return result.toString("base64");
}

/**
 * Decrypt sensitive data
 * Expects the base64 string produced by encrypt()
 */
export function decrypt(encryptedBase64: string): string {
  const buffer = Buffer.from(encryptedBase64, "base64");

  // Extract components
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  );
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Encrypt a credentials object (all string values get encrypted)
 */
export function encryptCredentials(
  credentials: Record<string, string>
): string {
  return encrypt(JSON.stringify(credentials));
}

/**
 * Decrypt a credentials object
 */
export function decryptCredentials(
  encryptedCredentials: string
): Record<string, string> {
  const decrypted = decrypt(encryptedCredentials);
  return JSON.parse(decrypted);
}
