"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { BarChart3, Users, Zap, TrendingUp, Bell, ChevronRight, Check, Shield, ArrowRight, Activity, Database, Layers } from "lucide-react";
import { ParticleMesh } from "@/components/ui/ParticleMesh";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";

// ============================================================================
// Animated counter
// ============================================================================
function AnimatedNumber({ end, prefix = "", suffix = "", decimals = 0 }: { end: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 2000;
        const startTime = performance.now();
        const update = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(end * ease);
          if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{value.toFixed(decimals)}{suffix}</span>;
}

// ============================================================================
// Product Screenshot Mockup — browser-framed dashboard
// ============================================================================
function ProductMockup() {
  // SVG area chart data points (normalized 0–100 for a 400×120 viewport)
  const points = [0,18,12,30,25,42,38,55,48,70,62,80,75,90,82,95,88,100];
  const xs = points.map((_, i) => (i / (points.length - 1)) * 400);
  const ys = points.map(p => 120 - p * 1.1);

  // Build smooth bezier path
  const buildPath = () => {
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
      const cpx = (xs[i - 1] + xs[i]) / 2;
      d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
    }
    return d;
  };

  const linePath = buildPath();
  const areaPath = `${linePath} L ${xs[xs.length - 1]} 130 L ${xs[0]} 130 Z`;

  return (
    <div className="relative w-full">
      {/* Ambient glow behind mockup */}
      <div className="absolute -inset-8 bg-gradient-to-br from-[#00F0FF]/10 via-[#8B5CF6]/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

      {/* Browser chrome */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] bg-[#0D1117]">
        {/* Browser topbar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#161B22] border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[#0D1117] border border-white/10 rounded-md px-4 py-1 text-[11px] font-mono text-[#6E7681] flex items-center gap-2 w-48">
              <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
              costlens.io/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex h-[440px] bg-[#080D18]">
          {/* Sidebar */}
          <div className="w-44 shrink-0 border-r border-white/5 bg-[#0A0F1C] flex flex-col py-4 gap-1">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 pb-4 mb-1 border-b border-white/5">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00F0FF] to-[#00FF88] flex items-center justify-center">
                <span className="text-[9px] font-bold text-black">CL</span>
              </div>
              <span className="text-xs font-heading font-bold text-white">CostLens</span>
            </div>
            {[
              { label: "Overview", active: true },
              { label: "Cost Intel" },
              { label: "Teams" },
              { label: "Alerts" },
              { label: "Optimizer" },
            ].map(({ label, active }) => (
              <div
                key={label}
                className={`mx-2 px-3 py-2 rounded-md text-[10px] font-mono transition-all ${
                  active
                    ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20"
                    : "text-[#475569]"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Topbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="text-[11px] font-mono text-[#475569]">
                CostLens <span className="text-white/20">/</span> <span className="text-[#94A3B8]">Command Center</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-white/5 p-0.5 rounded gap-0.5">
                  {["7D","30D","90D","12M"].map((p, i) => (
                    <div key={p} className={`px-2 py-0.5 rounded text-[9px] font-mono ${i === 1 ? "bg-[#00F0FF]/10 text-[#00F0FF]" : "text-[#475569]"}`}>{p}</div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-[#00FF88]/10 border border-[#00FF88]/20 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                  <span className="text-[9px] font-mono text-[#00FF88]">LIVE</span>
                </div>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-3 px-5 py-3">
              {[
                { label: "TOTAL AI SPEND", value: "$47,280", change: "+12.4%", changeColor: "text-[#FFB800]", glow: "#00F0FF" },
                { label: "ACTIVE MODELS", value: "23", change: "4 providers", changeColor: "text-[#475569]", glow: "#00FF88" },
                { label: "DETECTED WASTE", value: "$8,450", change: "↓ $150 this wk", changeColor: "text-[#00FF88]", glow: "#FF3366" },
                { label: "ROI INDEX", value: "3.2×", change: "Optimal", changeColor: "text-[#00FF88]", glow: "#8B5CF6" },
              ].map(({ label, value, change, changeColor, glow }) => (
                <div key={label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-10 h-10 rounded-full blur-xl" style={{ background: `${glow}18` }} />
                  <div className="text-[8px] font-mono text-[#475569] mb-1">{label}</div>
                  <div className="text-base font-mono text-white font-bold">{value}</div>
                  <div className={`text-[8px] font-mono mt-0.5 ${changeColor}`}>{change}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="flex-1 px-5 pb-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg h-full p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-[#475569] uppercase tracking-wider">AI Spend — Last 30 Days</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-0.5 bg-[#00F0FF] rounded" />
                    <span className="text-[8px] font-mono text-[#475569]">Total Spend</span>
                  </div>
                </div>
                <div className="flex-1 relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 inset-y-0 flex flex-col justify-between pb-4">
                    {["$50K","$30K","$10K"].map(l => (
                      <span key={l} className="text-[7px] font-mono text-[#2A3547]">{l}</span>
                    ))}
                  </div>
                  {/* Grid lines */}
                  <div className="absolute inset-0 pl-6 flex flex-col justify-between pb-4">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="border-t border-white/[0.04] w-full" />
                    ))}
                  </div>
                  {/* SVG chart */}
                  <div className="absolute inset-0 pl-6">
                    <svg viewBox="0 0 400 130" preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#areaGrad)" />
                      <path d={linePath} fill="none" stroke="#00F0FF" strokeWidth="1.5" />
                      {/* Current point */}
                      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill="#00F0FF" />
                      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="5" fill="none" stroke="#00F0FF" strokeOpacity="0.4" />
                      {/* Annotation line */}
                      <line x1={xs[xs.length - 1]} y1={ys[ys.length - 1]} x2={xs[xs.length - 1]} y2="130" stroke="#00F0FF" strokeOpacity="0.2" strokeDasharray="2,2" strokeWidth="0.8" />
                    </svg>
                  </div>
                </div>
                {/* X-axis labels */}
                <div className="flex justify-between pl-6 mt-1">
                  {["Jan 1","Jan 8","Jan 15","Jan 22","Jan 30"].map(l => (
                    <span key={l} className="text-[7px] font-mono text-[#2A3547]">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Landing Page
// ============================================================================
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] relative selection:bg-[#00F0FF] selection:text-black overflow-x-hidden">
      <ParticleMesh />

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#030712]/90 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#00FF88] flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.4)]">
              <span className="font-heading font-black text-black text-sm">C</span>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-white">CostLens</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "#features" },
              { label: "How it Works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <GlowButton href="/register" variant="primary" className="text-sm py-2 px-5">
              Launch Console
            </GlowButton>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── Hero Section ── */}
        <section className="min-h-screen flex items-center pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left — Headline */}
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/5 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                  <span className="text-[11px] font-mono text-[#00F0FF] tracking-widest uppercase">AI Cost Intelligence Platform</span>
                </div>

                <h1 className="text-5xl xl:text-6xl font-heading font-black leading-[1.08] tracking-tight text-white">
                  Stop Guessing.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#00F0FF] to-[#00FF88]">
                    Start Knowing.
                  </span>
                </h1>

                <p className="text-lg text-[#64748B] leading-relaxed max-w-lg">
                  The only platform that gives engineering teams complete visibility, attribution, and control over AI spend — across every model and provider.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <GlowButton href="/register" variant="primary" className="h-12 px-6 text-sm" icon={<ChevronRight className="w-4 h-4" />}>
                    Start for Free
                  </GlowButton>
                  <GlowButton href="#features" variant="ghost" className="h-12 px-6 text-sm border border-white/10">
                    See How It Works
                  </GlowButton>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  {[
                    { value: "$8.4K", label: "avg monthly savings" },
                    { value: "23+", label: "providers supported" },
                    { value: "2 min", label: "to connect first API" },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-lg font-mono font-bold text-white">{value}</span>
                      <span className="text-xs text-[#475569]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Product Mockup */}
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                <ProductMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof Banner ── */}
        <div className="border-y border-white/5 bg-white/[0.02] py-5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-mono text-[#475569] uppercase tracking-widest">Trusted by engineering teams at</p>
            <div className="flex items-center gap-8 md:gap-12 opacity-40">
              {["Vercel", "Linear", "Raycast", "Resend", "Loom"].map((name) => (
                <span key={name} className="font-heading font-bold text-sm text-white">{name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats Section ── */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-mono text-[#00F0FF] uppercase tracking-[0.25em] mb-3">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">AI costs are spiraling out of control</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: 108, suffix: "%", label: "AI spend growth YoY", accent: "#00F0FF", hint: "Faster than any other engineering cost" },
                { value: 78, suffix: "%", label: "teams have zero visibility", accent: "#FF3366", hint: "of companies can't explain their AI bills" },
                { value: 40, suffix: "%", label: "of AI spend is wasted", accent: "#FFB800", hint: "Unused context, wrong model selection" },
                { value: 3.2, suffix: "×", decimals: 1, label: "avg ROI after CostLens", accent: "#00FF88", hint: "Measured across our customer base" },
              ].map(({ value, suffix, decimals = 0, label, accent, hint }) => (
                <GlassCard key={label} className="p-6 text-center group">
                  <div className="text-4xl md:text-5xl font-mono font-black mb-2" style={{ color: accent }}>
                    <AnimatedNumber end={value} suffix={suffix} decimals={decimals} />
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{label}</div>
                  <div className="text-xs text-[#475569]">{hint}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-mono text-[#00F0FF] uppercase tracking-[0.25em] mb-3">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">Up and running in minutes</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div className="absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-[#00F0FF]/30 to-[#8B5CF6]/30 hidden md:block" />

              {[
                {
                  step: "01",
                  title: "Connect your providers",
                  body: "Add your API keys for OpenAI, Anthropic, AWS Bedrock, Azure, and 20+ more. Takes under 2 minutes.",
                  icon: Database,
                  accent: "#00F0FF",
                },
                {
                  step: "02",
                  title: "Attribute spend to teams",
                  body: "CostLens automatically maps every token to every team, project, and feature using your existing tags.",
                  icon: Users,
                  accent: "#8B5CF6",
                },
                {
                  step: "03",
                  title: "Optimize and save",
                  body: "Get AI-powered recommendations to route tasks to cheaper models and set guardrails before costs spike.",
                  icon: Zap,
                  accent: "#00FF88",
                },
              ].map(({ step, title, body, icon: Icon, accent }, i) => (
                <GlassCard key={step} className="p-8 relative" animateIn delayIndex={i}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border" style={{ background: `${accent}10`, borderColor: `${accent}25` }}>
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <span className="text-4xl font-mono font-black text-white/5">{step}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-3">{title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{body}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-mono text-[#00F0FF] uppercase tracking-[0.25em] mb-3">Platform Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">Everything you need to control AI costs</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: Activity,
                  accent: "#00F0FF",
                  title: "Real-Time Monitoring",
                  body: "Watch spend accumulate in real-time. Every API call tracked, attributed, and visualized the moment it happens.",
                },
                {
                  icon: Users,
                  accent: "#8B5CF6",
                  title: "Team Attribution",
                  body: "Know exactly which team, project, or feature is driving your AI bill. Down to the individual API key.",
                },
                {
                  icon: Shield,
                  accent: "#FF3366",
                  title: "Shadow AI Discovery",
                  body: "Automatically detect unauthorized AI tool usage across your organization before it becomes a budget problem.",
                },
                {
                  icon: Zap,
                  accent: "#00FF88",
                  title: "Smart Optimization",
                  body: "AI-powered model routing. Automatically send simple tasks to cheaper models without changing your code.",
                },
                {
                  icon: TrendingUp,
                  accent: "#FFB800",
                  title: "ROI Measurement",
                  body: "Connect AI spend to business outcomes. Generate board-ready ROI reports with a single click.",
                },
                {
                  icon: Bell,
                  accent: "#00F0FF",
                  title: "Budget Guardrails",
                  body: "Set budget thresholds per team, project, or model. Get warned at 70% before you hit the ceiling.",
                },
              ].map(({ icon: Icon, accent, title, body }, i) => (
                <GlassCard key={title} glowColor={accent === "#00F0FF" ? "cyan" : accent === "#8B5CF6" ? "purple" : accent === "#FF3366" ? "red" : accent === "#00FF88" ? "green" : "amber"} className="p-7 group" animateIn delayIndex={i % 3}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border transition-all group-hover:scale-110" style={{ background: `${accent}10`, borderColor: `${accent}25` }}>
                    <Icon className="w-5 h-5 transition-colors" style={{ color: accent }} />
                  </div>
                  <h3 className="text-base font-heading font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{body}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-mono text-[#00F0FF] uppercase tracking-[0.25em] mb-3">Pricing</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Simple, transparent pricing</h2>
              <p className="text-[#64748B]">Scale your plan as your AI spend grows.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
              {/* Starter */}
              <div className="rounded-xl border border-white/8 bg-[#0A0F1C]/60 p-7">
                <div className="text-xs font-mono text-[#475569] uppercase tracking-wider mb-2">Starter</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-mono font-black text-white">$0</span>
                  <span className="text-sm text-[#475569] mb-1">/month</span>
                </div>
                <p className="text-xs text-[#475569] mb-6">For individuals exploring AI costs.</p>
                <ul className="space-y-3 mb-8">
                  {["1 AI Provider", "Basic Dashboard", "30-day history", "1 User"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                      <Check className="w-4 h-4 text-[#00FF88] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <GlowButton href="/register" variant="ghost" className="w-full border border-white/10 text-sm">
                  Get Started Free
                </GlowButton>
              </div>

              {/* Pro — featured */}
              <div className="rounded-xl border border-[#00F0FF]/30 bg-[#0A0F1C]/80 p-7 relative shadow-[0_0_40px_rgba(0,240,255,0.08)] md:-translate-y-2">
                <div className="absolute top-0 left-6 -translate-y-1/2 bg-[#00F0FF] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="text-xs font-mono text-[#00F0FF] uppercase tracking-wider mb-2">Pro</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-mono font-black text-white">$499</span>
                  <span className="text-sm text-[#475569] mb-1">/month</span>
                </div>
                <p className="text-xs text-[#475569] mb-6">For engineering teams actively managing AI.</p>
                <ul className="space-y-3 mb-8">
                  {["Up to 5 Providers", "Team Attribution", "Budget Alerts", "90-day history", "5 Users", "Slack + Email alerts"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                      <Check className="w-4 h-4 text-[#00F0FF] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <GlowButton href="/register" variant="primary" className="w-full text-sm">
                  Start Pro Trial
                </GlowButton>
              </div>

              {/* Enterprise */}
              <div className="rounded-xl border border-white/8 bg-[#0A0F1C]/60 p-7">
                <div className="text-xs font-mono text-[#8B5CF6] uppercase tracking-wider mb-2">Enterprise</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-mono font-black text-white">$1,499</span>
                  <span className="text-sm text-[#475569] mb-1">/month</span>
                </div>
                <p className="text-xs text-[#475569] mb-6">For organizations with serious AI investment.</p>
                <ul className="space-y-3 mb-8">
                  {["Unlimited Providers", "Shadow AI Discovery", "ROI Measurement", "Unlimited history", "20 Users", "SSO + Priority Support"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                      <Check className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <GlowButton href="/register" variant="outline" className="w-full text-sm">
                  Contact Sales
                </GlowButton>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-32 border-t border-white/5 relative overflow-hidden">
          {/* Background radial */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs font-mono text-[#00F0FF] uppercase tracking-[0.25em] mb-4">Get Started Today</p>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 leading-tight">
              Your AI spend is a black box.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#00FF88]">
                We turn on the lights.
              </span>
            </h2>
            <p className="text-lg text-[#64748B] mb-10">
              Join hundreds of engineering teams that finally understand where their AI budget goes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your work email"
                onFocus={() => setEmailFocus(true)}
                onBlur={(e) => setEmailFocus(e.target.value !== "")}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 h-12 text-white text-sm font-mono focus:border-[#00F0FF]/50 focus:outline-none transition-all placeholder:text-[#475569]"
              />
              <button
                onClick={() => setEmailSubmitted(true)}
                className={`h-12 px-6 rounded-lg font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0 ${
                  emailSubmitted
                    ? "bg-[#00FF88] text-black"
                    : "bg-[#00F0FF] text-black hover:bg-[#2CEFFF] hover:shadow-[0_0_24px_rgba(0,240,255,0.4)]"
                }`}
              >
                {emailSubmitted ? <><Check className="w-4 h-4" /> You're in!</> : <>Get Early Access <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
            <p className="text-xs text-[#475569] mt-4 font-mono">Free forever tier · No credit card · Live in 2 minutes</p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030712] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#00FF88] flex items-center justify-center">
              <span className="font-heading font-black text-black text-xs">C</span>
            </div>
            <span className="font-heading font-bold text-white">CostLens</span>
            <span className="text-xs text-[#2A3547] pl-4 border-l border-white/5 hidden sm:inline">AI Cost Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#475569] font-mono">
            {["Documentation", "API Reference", "Status", "Privacy", "Terms"].map((l) => (
              <Link key={l} href="#" className="hover:text-[#94A3B8] transition-colors">{l}</Link>
            ))}
            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
