// src/lib/connectors/aws-bedrock.ts
// CostLens AI — AWS Bedrock Connector
// Fetches AI spend from AWS Cost Explorer for Bedrock services

import { BaseConnector, ConnectorCredentials, SyncOptions } from "./base";
import { NormalizedCostRecord, AIProvider } from "@/types";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
} from "@aws-sdk/client-cost-explorer";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

export class AWSBedrockConnector extends BaseConnector {
  provider: AIProvider = "AWS_BEDROCK";
  displayName = "AWS Bedrock";

  private getSTSClient(): STSClient {
    return new STSClient({
      region: this.credentials.region || "us-east-1",
      credentials: {
        accessKeyId: this.credentials.accessKeyId!,
        secretAccessKey: this.credentials.secretAccessKey!,
      },
    });
  }

  private getCostExplorerClient(): CostExplorerClient {
    return new CostExplorerClient({
      region: "us-east-1", // Cost Explorer is only available in us-east-1
      credentials: {
        accessKeyId: this.credentials.accessKeyId!,
        secretAccessKey: this.credentials.secretAccessKey!,
      },
    });
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      const sts = this.getSTSClient();
      const result = await sts.send(new GetCallerIdentityCommand({}));

      if (!result.Account) {
        return { valid: false, error: "Could not retrieve AWS account info" };
      }

      return { valid: true };
    } catch (error: any) {
      if (error.name === "InvalidClientTokenId" || error.name === "SignatureDoesNotMatch") {
        return { valid: false, error: "Invalid AWS credentials" };
      }
      if (error.name === "AccessDeniedException") {
        return { valid: false, error: "Credentials lack required permissions (STS:GetCallerIdentity)" };
      }
      return {
        valid: false,
        error: `AWS connection failed: ${error.message || "Unknown error"}`,
      };
    }
  }

  async fetchUsage(options: SyncOptions): Promise<NormalizedCostRecord[]> {
    const records: NormalizedCostRecord[] = [];
    const ce = this.getCostExplorerClient();

    const startDate = options.dateFrom.toISOString().split("T")[0];
    const endDate = options.dateTo.toISOString().split("T")[0];

    try {
      // Query Cost Explorer for Bedrock costs, grouped by usage type (model)
      const params: GetCostAndUsageCommandInput = {
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: "DAILY",
        Metrics: ["UnblendedCost", "UsageQuantity"],
        Filter: {
          Dimensions: {
            Key: "SERVICE",
            Values: [
              "Amazon Bedrock",
              "Amazon SageMaker",
            ],
          },
        },
        GroupBy: [
          {
            Type: "DIMENSION",
            Key: "USAGE_TYPE",
          },
        ],
      };

      let nextPageToken: string | undefined;

      do {
        if (nextPageToken) {
          params.NextPageToken = nextPageToken;
        }

        const command = new GetCostAndUsageCommand(params);
        const response = await ce.send(command);

        for (const result of response.ResultsByTime || []) {
          const usageDate = result.TimePeriod?.Start
            ? new Date(result.TimePeriod.Start)
            : options.dateFrom;

          for (const group of result.Groups || []) {
            const usageType = group.Keys?.[0] || "unknown";
            const costUsd = parseFloat(group.Metrics?.UnblendedCost?.Amount || "0");
            const usageAmount = parseFloat(group.Metrics?.UsageQuantity?.Amount || "0");

            if (costUsd === 0 && usageAmount === 0) continue;

            // Parse model name from usage type (e.g., "USE1-Bedrock:InvokeModel-Claude-3-Sonnet")
            const model = this.parseModelFromUsageType(usageType);

            records.push({
              provider: "AWS_BEDROCK",
              model,
              service: "bedrock",
              costUsd,
              usageUnit: "API_CALLS",
              usageAmount,
              inputTokens: null,
              outputTokens: null,
              apiKeyPrefix: null,
              userId: null,
              projectTag: null,
              usageDate,
              confidence: "CONFIRMED",
            });
          }
        }

        nextPageToken = response.NextPageToken;
      } while (nextPageToken);
    } catch (error: any) {
      if (error.name === "AccessDeniedException") {
        throw new Error(
          "AWS credentials lack Cost Explorer access. Ensure the IAM user has ce:GetCostAndUsage permission."
        );
      }
      throw error;
    }

    return records;
  }

  async getCurrentPeriodSummary(): Promise<{
    totalCost: number;
    recordCount: number;
    period: string;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await this.fetchUsage({
      dateFrom: startOfMonth,
      dateTo: now,
    });

    const totalCost = records.reduce((sum, r) => sum + r.costUsd, 0);

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      recordCount: records.length,
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    };
  }

  /**
   * Parse a model name from AWS usage type strings like:
   * "USE1-Bedrock:InvokeModel-Anthropic-Claude-3-Sonnet"
   * "USE1-Bedrock:InvokeModel-Amazon-Titan-Text-Express"
   */
  private parseModelFromUsageType(usageType: string): string | null {
    // Try to extract model info after "InvokeModel-"
    const invokeMatch = usageType.match(/InvokeModel[- ]?(.*)/i);
    if (invokeMatch) {
      return invokeMatch[1]
        .replace(/^-/, "")
        .toLowerCase()
        .replace(/-/g, "-");
    }

    // If no model info, return the usage type as-is
    if (usageType.toLowerCase().includes("bedrock")) {
      return usageType.split(":").pop()?.toLowerCase() || null;
    }

    return null;
  }
}
