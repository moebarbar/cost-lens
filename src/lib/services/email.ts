// src/lib/services/email.ts
// CostLens AI — Email Notification Service
// Sends budget alert emails via Resend

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "CostLens AI <alerts@costlens.dev>";

// ============================================================
// Budget Alert Email
// ============================================================

export async function sendBudgetAlertEmail(
  to: string,
  alert: {
    alertName: string;
    currentSpend: number;
    threshold: number;
    percentUsed: number;
    period: string;
    scope: string;
    scopeFilter?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email notification");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const isOver = alert.percentUsed >= 100;
    const subject = isOver
      ? `🚨 Budget Exceeded: ${alert.alertName}`
      : `⚠️ Budget Warning: ${alert.alertName} (${alert.percentUsed.toFixed(0)}%)`;

    const html = buildAlertEmailHtml(alert, isOver);

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send alert email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}

// ============================================================
// Email Template
// ============================================================

function buildAlertEmailHtml(
  alert: {
    alertName: string;
    currentSpend: number;
    threshold: number;
    percentUsed: number;
    period: string;
    scope: string;
    scopeFilter?: string | null;
  },
  isOver: boolean
): string {
  const barWidth = Math.min(100, alert.percentUsed);
  const barColor = isOver ? "#EF4444" : alert.percentUsed >= 80 ? "#F59E0B" : "#00D4AA";
  const scopeLabel = alert.scopeFilter
    ? `${alert.scope}: ${alert.scopeFilter}`
    : alert.scope;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A0E1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;color:#00D4AA;">💡 CostLens AI</span>
    </div>

    <!-- Alert Card -->
    <div style="background:#111827;border-radius:12px;padding:28px;border:1px solid ${barColor}30;">
      <div style="font-size:14px;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
        ${isOver ? "🚨 Budget Exceeded" : "⚠️ Budget Warning"}
      </div>
      <div style="font-size:20px;font-weight:700;color:#F9FAFB;margin-bottom:20px;">
        ${alert.alertName}
      </div>

      <!-- Spend vs Threshold -->
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:#9CA3AF;font-size:14px;">Current Spend</span>
        <span style="color:${barColor};font-size:14px;font-weight:600;">
          $${alert.currentSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
        <span style="color:#9CA3AF;font-size:14px;">Threshold</span>
        <span style="color:#F9FAFB;font-size:14px;font-weight:600;">
          $${alert.threshold.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <!-- Progress Bar -->
      <div style="background:#1F2937;border-radius:6px;height:8px;overflow:hidden;margin-bottom:12px;">
        <div style="background:${barColor};height:100%;width:${barWidth}%;border-radius:6px;"></div>
      </div>
      <div style="text-align:right;font-size:13px;color:${barColor};font-weight:600;margin-bottom:20px;">
        ${alert.percentUsed.toFixed(1)}% used
      </div>

      <!-- Details -->
      <div style="border-top:1px solid #1F2937;padding-top:16px;display:flex;gap:24px;">
        <div>
          <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Period</div>
          <div style="font-size:14px;color:#D1D5DB;margin-top:4px;">${alert.period}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Scope</div>
          <div style="font-size:14px;color:#D1D5DB;margin-top:4px;">${scopeLabel}</div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.NEXTAUTH_URL || "https://costlens.dev"}/alerts"
         style="display:inline-block;background:#00D4AA;color:#0A0E1A;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
        View in CostLens
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;font-size:12px;color:#4B5563;">
      You're receiving this because you set up a budget alert in CostLens AI.
    </div>
  </div>
</body>
</html>`;
}
