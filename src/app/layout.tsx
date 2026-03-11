import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CostLens AI — AI Spend Management",
  description: "Track, attribute, and optimize every dollar you spend on AI tools and APIs. Datadog for AI costs.",
  keywords: "AI spend management, LLM cost tracking, OpenAI costs, Anthropic costs, AI observability",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
