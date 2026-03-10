// src/lib/connectors/registry.ts
// CostLens AI — Connector Registry
// Central hub that manages all provider connectors

import { BaseConnector, ConnectorCredentials } from "./base";
import { OpenAIConnector } from "./openai";
import { AnthropicConnector } from "./anthropic";
import { AIProvider, ConnectorConfig } from "@/types";

// ============================================================
// Connector Factory
// ============================================================

export function createConnector(
  provider: AIProvider,
  credentials: ConnectorCredentials,
  orgId: string
): BaseConnector {
  switch (provider) {
    case "OPENAI":
      return new OpenAIConnector(credentials, orgId);
    case "ANTHROPIC":
      return new AnthropicConnector(credentials, orgId);
    // Future connectors:
    // case "AWS_BEDROCK":
    //   return new AWSBedrockConnector(credentials, orgId);
    // case "AZURE_OPENAI":
    //   return new AzureOpenAIConnector(credentials, orgId);
    // case "GOOGLE_VERTEX":
    //   return new GoogleVertexConnector(credentials, orgId);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// ============================================================
// Provider Configurations (for the UI)
// ============================================================

export const CONNECTOR_CONFIGS: ConnectorConfig[] = [
  {
    provider: "OPENAI",
    displayName: "OpenAI",
    description: "Track GPT-4o, GPT-4, DALL-E, Whisper, and all OpenAI API costs",
    icon: "🟢",
    authType: "api_key",
    requiredFields: [
      {
        key: "apiKey",
        label: "Admin API Key",
        type: "password",
        placeholder: "sk-admin-...",
        helpText: "Use an admin key from platform.openai.com for full usage access. Go to Settings → API Keys → Create admin key.",
        required: true,
      },
      {
        key: "organizationId",
        label: "Organization ID (optional)",
        type: "text",
        placeholder: "org-...",
        helpText: "Found in Settings → Organization. Required if your key has access to multiple orgs.",
        required: false,
      },
    ],
    docsUrl: "https://platform.openai.com/docs/api-reference/usage",
  },
  {
    provider: "ANTHROPIC",
    displayName: "Anthropic",
    description: "Track Claude Opus, Sonnet, Haiku, and all Anthropic API costs",
    icon: "🟠",
    authType: "api_key",
    requiredFields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "sk-ant-...",
        helpText: "Get your API key from console.anthropic.com → API Keys. Admin keys provide more granular usage data.",
        required: true,
      },
    ],
    docsUrl: "https://docs.anthropic.com/en/api/admin-api",
  },
  {
    provider: "AWS_BEDROCK",
    displayName: "AWS Bedrock",
    description: "Track all AI model usage through AWS Bedrock (Claude, Llama, Titan, etc.)",
    icon: "🟡",
    authType: "api_key",
    requiredFields: [
      {
        key: "accessKeyId",
        label: "AWS Access Key ID",
        type: "password",
        placeholder: "AKIA...",
        helpText: "IAM user with Cost Explorer and Bedrock read access",
        required: true,
      },
      {
        key: "secretAccessKey",
        label: "AWS Secret Access Key",
        type: "password",
        placeholder: "",
        helpText: "Secret key for the IAM user above",
        required: true,
      },
      {
        key: "region",
        label: "AWS Region",
        type: "text",
        placeholder: "us-east-1",
        helpText: "The region where your Bedrock models are deployed",
        required: true,
      },
    ],
    docsUrl: "https://docs.aws.amazon.com/bedrock/",
  },
  {
    provider: "AZURE_OPENAI",
    displayName: "Azure OpenAI",
    description: "Track GPT-4, GPT-3.5, and DALL-E usage through Azure OpenAI Service",
    icon: "🔵",
    authType: "api_key",
    requiredFields: [
      {
        key: "apiKey",
        label: "Azure API Key",
        type: "password",
        placeholder: "",
        helpText: "Found in Azure Portal → OpenAI Resource → Keys and Endpoint",
        required: true,
      },
      {
        key: "endpoint",
        label: "Endpoint URL",
        type: "text",
        placeholder: "https://your-resource.openai.azure.com",
        helpText: "Your Azure OpenAI endpoint URL",
        required: true,
      },
    ],
    docsUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/",
  },
  {
    provider: "GOOGLE_VERTEX",
    displayName: "Google Vertex AI",
    description: "Track Gemini, PaLM, and all Vertex AI model costs on Google Cloud",
    icon: "🔷",
    authType: "api_key",
    requiredFields: [
      {
        key: "projectId",
        label: "GCP Project ID",
        type: "text",
        placeholder: "my-project-123",
        helpText: "Found in Google Cloud Console → Dashboard",
        required: true,
      },
      {
        key: "serviceAccountKey",
        label: "Service Account JSON Key",
        type: "password",
        placeholder: '{"type": "service_account", ...}',
        helpText: "Create a service account with Billing Viewer + Vertex AI User roles",
        required: true,
      },
    ],
    docsUrl: "https://cloud.google.com/vertex-ai/docs",
  },
];

/**
 * Get the config for a specific provider
 */
export function getConnectorConfig(provider: AIProvider): ConnectorConfig | undefined {
  return CONNECTOR_CONFIGS.find(c => c.provider === provider);
}

/**
 * Get all available connectors (for the "Add Connector" UI)
 */
export function getAvailableConnectors(): ConnectorConfig[] {
  return CONNECTOR_CONFIGS;
}

/**
 * Check which providers are currently supported with full connectors
 */
export function isSupportedProvider(provider: AIProvider): boolean {
  const supported: AIProvider[] = ["OPENAI", "ANTHROPIC"];
  return supported.includes(provider);
}
