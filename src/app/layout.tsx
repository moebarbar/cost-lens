import type { Metadata } from "next";
import { Exo_2, IBM_Plex_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const exo2 = Exo_2({ subsets: ["latin"], variable: "--font-exo" });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

export const metadata: Metadata = {
  title: "CostLens AI — Neural Command Center",
  description: "Track, attribute, and optimize every dollar you spend on AI tools and APIs. Datadog for AI costs.",
  keywords: "AI spend management, LLM cost tracking, OpenAI costs, Anthropic costs, AI observability",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${exo2.variable} ${ibmPlexMono.variable} ${dmSans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
