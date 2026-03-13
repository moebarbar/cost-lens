"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Radar, Users, Ghost, Zap, TrendingUp, Bell, ChevronRight, Check } from "lucide-react";
import { ParticleMesh } from "@/components/ui/ParticleMesh";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";

// ============================================================================
// Mini Dashboard Preview Component
// ============================================================================
function DashboardPreview() {
  const [ticker, setTicker] = useState(0);
  
  // Fake data rotation
  useEffect(() => {
    const interval = setInterval(() => setTicker(prev => prev + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const fakeSpend = 47280 + (ticker % 5) * 142;
  const fakeWaste = 8450 - (ticker % 3) * 50;

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-16 perspective-1000">
      <div className="relative rounded-xl border border-[#00F0FF]/30 bg-[#0A0F1C]/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden transform rotate-x-6 rotate-y-[-2deg] transition-transform duration-1000 ease-in-out hover:rotate-x-2">
        
        {/* HUD Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00F0FF]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00F0FF]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00F0FF]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00F0FF]" />

        {/* Fake Sidebar + Topbar structure */}
        <div className="flex h-[500px]">
          {/* Fake Sidebar */}
          <div className="w-16 border-r border-white/5 bg-black/40 flex flex-col items-center py-4 gap-6">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#00F0FF] to-[#00FF88] opacity-80" />
            <div className="w-6 h-6 rounded bg-white/10" />
            <div className="w-6 h-6 rounded bg-white/10" />
            <div className="w-6 h-6 rounded bg-white/10" />
          </div>

          {/* Fake Main Content */}
          <div className="flex-1 p-6 flex flex-col gap-6">
            {/* Topbar */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                <span className="font-mono text-xs text-[#00FF88] tracking-widest">LIVE SYSTEM PREVIEW</span>
              </div>
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-white/5 rounded" />
                <div className="w-16 h-6 bg-[#00F0FF]/20 border border-[#00F0FF]/40 rounded" />
              </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00F0FF]/10 blur-xl rounded-full" />
                <div className="text-[10px] text-slate-400 mb-1 font-mono">TOTAL AI SPEND</div>
                <div className="text-2xl font-mono text-white">${fakeSpend.toLocaleString()}</div>
                <div className="text-[10px] text-[#FFB800] mt-1">↑ 12.4% vs last month</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00FF88]/10 blur-xl rounded-full" />
                <div className="text-[10px] text-slate-400 mb-1 font-mono">ACTIVE MODELS</div>
                <div className="text-2xl font-mono text-white">23</div>
                <div className="text-[10px] text-slate-400 mt-1">Across 4 providers</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF3366]/10 blur-xl rounded-full" />
                <div className="text-[10px] text-slate-400 mb-1 font-mono">DETECTED WASTE</div>
                <div className="text-2xl font-mono text-white">${fakeWaste.toLocaleString()}</div>
                <div className="text-[10px] text-[#00FF88] mt-1">↓ $150 this week</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 blur-xl rounded-full" />
                <div className="text-[10px] text-slate-400 mb-1 font-mono">ROI INDEX</div>
                <div className="text-2xl font-mono text-white">3.2x</div>
                <div className="text-[10px] text-[#00FF88] mt-1">Optimal efficiency</div>
              </div>
            </div>

            {/* Fake Chart Area */}
            <div className="flex-1 bg-white/5 border border-white/5 rounded-lg relative overflow-hidden p-4 flex flex-col justify-end gap-2">
              <div className="absolute inset-0 bg-gradient-to-t from-[#00F0FF]/10 to-transparent opacity-50" />
              {/* Fake bars */}
              <div className="flex items-end justify-between h-[150px] gap-2 px-4 relative z-10 w-full overflow-hidden">
                {[4, 7, 5, 8, 12, 10, 15, 14, 18, 22, 20, 25, 23, 28, 30].map((h, i) => (
                  <div key={i} className="w-full bg-[#00F0FF]/40 rounded-t-sm transition-all duration-1000 relative" style={{ height: `${h * 3 + (ticker % 3) * i}px` }}>
                    <div className="absolute top-0 inset-x-0 h-1 bg-[#00F0FF]" />
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Scan line effect over the entire preview */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-[#00F0FF] shadow-[0_0_15px_#00F0FF] opacity-40 animate-[scanVertical_5s_linear_infinite]" />
      </div>
    </div>
  );
}

// ============================================================================
// Number Counter Component
// ============================================================================
function AnimatedNumber({ end, prefix = "", suffix = "", decimals = 0 }: { end: number, prefix?: string, suffix?: string, decimals?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const startTime = performance.now();
          
          const update = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            setValue(start + (end - start) * easeProgress);
            
            if (progress < 1) {
              requestAnimationFrame(update);
            }
          };
          
          requestAnimationFrame(update);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="font-mono">
      {prefix}{(value).toFixed(decimals)}{suffix}
    </span>
  );
}

// ============================================================================
// Main Landing Page
// ============================================================================
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const words = ["AI Spend", "Cost Intelligence", "Budget Control", "ROI Optimization"];
  const colors = ["text-[#00F0FF]", "text-[#00FF88]", "text-[#8B5CF6]", "text-[#FFB800]"];

  // Scroll handler for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Typing effect
  useEffect(() => {
    let currentWord = words[typingIndex];
    let isDeleting = false;
    let text = "";
    let speed = 150;
    let timer: NodeJS.Timeout;

    const type = () => {
      if (isDeleting) {
        text = currentWord.substring(0, text.length - 1);
        speed = 30; // Faster delete
      } else {
        text = currentWord.substring(0, text.length + 1);
        speed = 100; // Smoother typing
      }

      setTypingText(text);

      if (!isDeleting && text === currentWord) {
        speed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && text === "") {
        // Switch to next word
        setTypingIndex((prev) => (prev + 1) % words.length);
        return; // Exit here. The next effect cycle will spawn the typing loop
      }

      timer = setTimeout(type, speed);
    };

    timer = setTimeout(type, speed);
    return () => clearTimeout(timer);
  }, [typingIndex]);

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-[#00F0FF] selection:text-black">
      <ParticleMesh />

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF] to-[#00FF88] rounded opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 border border-[#00F0FF] rounded group-hover:rotate-180 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transformStyle: 'preserve-3d' }} />
              <span className="font-heading font-bold text-[#00F0FF] z-10 text-lg">C</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00F0FF] group-hover:to-[#00FF88] transition-colors">
              CostLens
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "Pricing", "Testimonials"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-slate-300 hover:text-white relative group transition-colors">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00F0FF] group-hover:w-full transition-all duration-300 ease-out shadow-[0_0_8px_#00F0FF]" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <GlowButton href="/register" variant="outline" className="hidden sm:inline-flex text-sm py-2">
              Launch Console
            </GlowButton>
          </div>
        </div>
        
        {/* Periodic scan line on nav */}
        {scrolled && <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-[#00F0FF] opacity-0 animate-[scanHorizontal_8s_ease-in-out_infinite]" />}
      </nav>

      <main className="pt-32 pb-24 relative z-10">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-mono mb-8 animate-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            SYSTEM ONLINE V2.0.4
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-6 animate-in delay-100 max-w-4xl mx-auto leading-tight">
            The Neural Command Center for <br />
            <span className={`inline-block min-w-[300px] text-left ${colors[typingIndex]} drop-shadow-[0_0_15px_currentColor]`}>
              {typingText}<span className="animate-pulse">|</span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-in delay-200">
            Track every token. Attribute every dollar. Optimize every model. Across every provider.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-in delay-300">
            <GlowButton href="/register" variant="primary" className="w-full sm:w-auto text-lg h-14 px-8">
              Initialize Command Center <ChevronRight className="w-5 h-5" />
            </GlowButton>
            <GlowButton href="#demo" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
              Run Simulation <Radar className="w-5 h-5 text-[#8B5CF6]" />
            </GlowButton>
          </div>
          
          {/* Trust Banner */}
          <div className="mt-20 pt-10 border-t border-white/5 w-full animate-in" style={{ animationDelay: '500ms' }}>
            <p className="text-xs text-slate-500 font-mono mb-6 uppercase tracking-wider">Trusted by advanced engineering teams</p>
            <div className="flex justify-center gap-8 md:gap-16 opacity-30 grayscale saturate-0">
              {/* Fake Logos using SVGs or text */}
              <div className="font-heading font-bold text-xl flex items-center gap-1"><Zap className="w-5 h-5"/> Strike</div>
              <div className="font-heading font-bold text-xl flex items-center gap-1"><Ghost className="w-5 h-5"/> Phantom</div>
              <div className="font-heading font-bold text-xl flex items-center gap-1"><Radar className="w-5 h-5"/> Nexus</div>
              <div className="font-heading font-bold text-xl flex items-center gap-1 hidden sm:flex"><Users className="w-5 h-5"/> Swarm</div>
            </div>
          </div>
        </section>

        {/* Live Dashboard Preview */}
        <section id="demo" className="py-12 w-full overflow-hidden">
          <DashboardPreview />
        </section>

        {/* Stats Section */}
        <section className="py-24 border-y border-white/5 bg-black/40 mt-12 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/5 to-transparent opacity-50 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            
            <div className="flex flex-col items-center text-center p-6 relative group">
              <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <AnimatedNumber end={108} suffix="%" />
              </div>
              <div className="text-sm text-slate-400">AI spend growth YoY</div>
            </div>

            <div className="flex flex-col items-center text-center p-6 relative group">
              <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-2 drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                 <AnimatedNumber end={55.7} prefix="$" suffix="M" decimals={1} />
              </div>
              <div className="text-sm text-slate-400">Avg enterprise SaaS spend</div>
            </div>

            <div className="flex flex-col items-center text-center p-6 relative group">
              <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-2 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                <AnimatedNumber end={78} suffix="%" />
              </div>
              <div className="text-sm text-slate-400">Companies with 0 AI visibility</div>
            </div>

            <div className="flex flex-col items-center text-center p-6 relative group">
              <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FFB800] to-transparent opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-2 drop-shadow-[0_0_10px_rgba(255,184,0,0.3)]">
                <AnimatedNumber end={40} suffix="%" />
              </div>
              <div className="text-sm text-slate-400">Average waste detected</div>
            </div>

          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-16 justify-center">
            <div className="h-px bg-gradient-to-r from-transparent to-[#00F0FF]/50 w-24 hidden md:block" />
            <h2 className="text-sm font-mono tracking-[0.2em] text-[#00F0FF] uppercase">System Capabilities</h2>
            <div className="h-px bg-gradient-to-l from-transparent to-[#00F0FF]/50 w-24 hidden md:block" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard glowColor="cyan" className="p-8 group">
              <div className="w-12 h-12 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center mb-6 border border-[#00F0FF]/20 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
                <Radar className="w-6 h-6 text-[#00F0FF] group-hover:animate-ping" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-white">Universal Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                One neural link to every AI provider. OpenAI, Anthropic, AWS, Azure, Google — unified in real-time.
              </p>
              {/* Mini visual */}
              <div className="h-2 w-full bg-white/5 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent w-1/2 animate-[scanHorizontal_2s_linear_infinite]" />
              </div>
            </GlassCard>

            <GlassCard glowColor="purple" className="p-8 group" delayIndex={1}>
              <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center mb-6 border border-[#8B5CF6]/20 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">
                <Users className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-white">Team Attribution</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Map every token to every team. See who's spending what, down to the exact API key.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 opcaity-50">
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_5px_#8B5CF6]" />
                <div className="h-px w-8 bg-[#8B5CF6]/30" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2"><div className="h-px w-4 bg-[#8B5CF6]/30"/><div className="w-2 h-2 rounded-full bg-white/30"/></div>
                  <div className="flex items-center gap-2"><div className="h-px w-4 bg-[#8B5CF6]/30"/><div className="w-2 h-2 rounded-full bg-white/30"/></div>
                </div>
              </div>
            </GlassCard>

            <GlassCard glowColor="red" className="p-8 group" delayIndex={2}>
              <div className="w-12 h-12 rounded-lg bg-[#FF3366]/10 flex items-center justify-center mb-6 border border-[#FF3366]/20 group-hover:shadow-[0_0_15px_rgba(255,51,102,0.4)] transition-all">
                <Ghost className="w-6 h-6 text-[#FF3366] group-hover:-translate-y-1 transition-transform" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-white">Shadow AI Discovery</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Detect rogue AI tools before they become budget black holes. Full-spectrum scanning.
              </p>
              <div className="relative h-2 w-full bg-white/5 rounded overflow-hidden">
                <div className="absolute inset-0 bg-[#FF3366]/20 animate-pulse" />
              </div>
            </GlassCard>

            <GlassCard glowColor="green" className="p-8 group">
              <div className="w-12 h-12 rounded-lg bg-[#00FF88]/10 flex items-center justify-center mb-6 border border-[#00FF88]/20 group-hover:shadow-[0_0_15px_rgba(0,255,136,0.4)] transition-all">
                <Zap className="w-6 h-6 text-[#00FF88]" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-white">Smart Optimization</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                AI-powered routing. Cheap tasks on cheap models. Premium tasks on premium models. Automatically.
              </p>
              <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                <span>GPT-4o</span>
                <span className="text-[#00FF88] animate-pulse">→</span>
                <span className="text-white">GPT-4o-mini</span>
              </div>
            </GlassCard>

            <GlassCard glowColor="amber" className="p-8 group" delayIndex={1}>
              <div className="w-12 h-12 rounded-lg bg-[#FFB800]/10 flex items-center justify-center mb-6 border border-[#FFB800]/20 group-hover:shadow-[0_0_15px_rgba(255,184,0,0.4)] transition-all">
                <TrendingUp className="w-6 h-6 text-[#FFB800]" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-white">ROI Measurement</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Connect spend to outcomes. Prove value or cut with confidence. Board-ready in one click.
              </p>
              <div className="flex items-end h-8 gap-1">
                {[2,4,3,6,5,8,10].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#FFB800]/20 rounded-t-sm" style={{ height: `${h}0%` }} />
                ))}
              </div>
            </GlassCard>

            <GlassCard glowColor="cyan" className="p-8 group" delayIndex={2}>
              <div className="w-12 h-12 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center mb-6 border border-[#00F0FF]/20 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
                <Bell className="w-6 h-6 text-[#00F0FF] group-hover:rotate-12 transition-transform" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-white">Budget Alerts</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Set guardrails. Get warned before costs spike. Never get surprised by an invoice again.
              </p>
              <div className="h-2 w-full bg-white/5 rounded overflow-hidden flex">
                <div className="h-full bg-[#00FF88] w-2/3" />
                <div className="h-full bg-[#FF3366] w-1/3 animate-pulse" />
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl font-heading font-bold mb-4">Select Your Tier</h2>
            <p className="text-slate-400">Scale your command center as your organization grows.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto relative z-10">
            {/* Free Tier */}
            <GlassCard className="p-8 border-white/5">
              <div className="text-sm font-mono text-slate-400 uppercase mb-2">Reconnaissance</div>
              <div className="text-4xl font-mono text-white mb-6">$0<span className="text-lg text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm text-slate-300">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00FF88]" /> 1 AI Provider</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00FF88]" /> Basic Dashboard</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00FF88]" /> 1 User</li>
                <li className="flex items-center gap-3 text-slate-500"><Check className="w-4 h-4" /> 7-day history</li>
              </ul>
              <GlowButton href="/register" variant="ghost" className="w-full border border-white/10">Deploy Free</GlowButton>
            </GlassCard>

            {/* Pro Tier */}
            <GlassCard glowColor="cyan" className="p-8 md:scale-105 border-[#00F0FF]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)] relative z-20">
              <div className="absolute top-0 right-0 bg-[#00F0FF] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">Most Popular</div>
              <div className="text-sm font-mono text-[#00F0FF] uppercase mb-2">Operations</div>
              <div className="text-4xl font-mono text-white mb-6">$499<span className="text-lg text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm text-slate-200">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00F0FF]" /> Up to 5 AI Providers</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00F0FF]" /> Team Attribution</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00F0FF]" /> Automated Budget Alerts</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00F0FF]" /> 5 Users</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#00F0FF]" /> 90-day history</li>
              </ul>
              <GlowButton href="/register" variant="primary" className="w-full">Activate Pro</GlowButton>
            </GlassCard>

            {/* Enterprise Tier */}
            <GlassCard glowColor="purple" className="p-8 border-white/5">
              <div className="text-sm font-mono text-[#8B5CF6] uppercase mb-2">Command</div>
              <div className="text-4xl font-mono text-white mb-6">$1,499<span className="text-lg text-slate-500">/mo</span></div>
              <ul className="space-y-4 mb-8 text-sm text-slate-300">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8B5CF6]" /> Unlimited Providers</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8B5CF6]" /> Shadow AI Discovery</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8B5CF6]" /> ROI Measurement</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8B5CF6]" /> 20 Users</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#8B5CF6]" /> Unlimited history</li>
              </ul>
              <GlowButton href="/register" variant="outline" className="w-full">Contact Command</GlowButton>
            </GlassCard>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 relative overflow-hidden text-center mt-12 bg-[#030712] border-t border-white/5">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <div className="w-[800px] h-[800px] border border-[#00F0FF]/30 rounded-full absolute animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite]" />
             <div className="w-[600px] h-[600px] border border-[#00F0FF]/20 rounded-full absolute animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite] animation-delay-2000" />
             <div className="w-[400px] h-[400px] border border-[#00F0FF]/10 rounded-full absolute" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Your AI spend is a black box. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#00FF88] filter drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">We turn on the lights.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <div className="relative flex-1 max-w-sm">
                <input 
                  type="email" 
                  placeholder={emailFocus ? "" : "Enter your email"} 
                  onFocus={() => setEmailFocus(true)}
                  onBlur={(e) => setEmailFocus(e.target.value !== "")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-14 text-white font-mono focus:border-[#00F0FF] focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] focus:outline-none transition-all placeholder:font-body"
                />
              </div>
              <button 
                onClick={() => setEmailSubmitted(true)}
                className={`h-14 px-8 rounded-lg font-heading font-bold transition-all flex items-center justify-center gap-2 ${
                  emailSubmitted 
                    ? "bg-[#00FF88] text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]" 
                    : "bg-[#00F0FF] text-black hover:bg-[#2CEFFF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                }`}
              >
                {emailSubmitted ? <><Check className="w-5 h-5"/> Initiated</> : "Launch CostLens"}
              </button>
            </div>
            
            <p className="mt-6 text-sm text-slate-500 font-mono">Free forever tier. No credit card. Deploy in 2 minutes.</p>
          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-12 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-[#00F0FF] text-lg">C</span>
            <span className="text-sm font-bold tracking-tight text-white">CostLens</span>
            <span className="text-xs text-slate-500 hidden sm:inline-block ml-4 pl-4 border-l border-white/10">The neural command center for AI spend</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
            <Link href="#" className="hover:text-[#00F0FF] transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-[#00F0FF] transition-colors">API Ref</Link>
            <Link href="#" className="hover:text-[#00F0FF] transition-colors">Status</Link>
            <div className="flex items-center gap-2 border-l border-white/10 pl-6">
              <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
