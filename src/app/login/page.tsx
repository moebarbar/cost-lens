"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ParticleMesh } from "@/components/ui/ParticleMesh";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/overview");
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#00F0FF] selection:text-black">
      {/* Background Ambience */}
      <ParticleMesh />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Logo and Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF] to-[#00FF88] rounded opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 border border-[#00F0FF] rounded shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:rotate-180 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transformStyle: 'preserve-3d' }} />
              <span className="font-heading font-bold text-[#00F0FF] z-10 text-xl">C</span>
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00F0FF] group-hover:to-[#00FF88] transition-colors">
              CostLens
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            Authorization Required
          </div>
        </div>

        {/* Auth Card */}
        <GlassCard glowColor="cyan" className="p-8 pb-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-[#FF3366]/10 border border-[#FF3366]/30 rounded-lg text-[#FF3366] text-sm font-mono flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#FF3366] animate-pulse" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Operator Identity</label>
              <input
                type="email"
                placeholder="operator@command.hq"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-[#00F0FF] focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex justify-between">
                <span>Passphrase</span>
                <Link href="#" className="text-[#00F0FF] hover:text-[#2CEFFF] transition-colors">Reset</Link>
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-[#00F0FF] focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] focus:outline-none transition-all placeholder:text-slate-600 tracking-widest"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`mt-4 h-12 rounded-lg font-heading font-bold text-black transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${
                loading ? "bg-[#00F0FF]/50 text-black/50 cursor-not-allowed" : "bg-[#00F0FF] hover:bg-[#2CEFFF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Initialize Connection</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[scanHorizontal_1.5s_ease-in-out_infinite]" />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <p className="text-center mt-8 text-slate-500 font-mono text-xs">
          No neural link established?{" "}
          <Link href="/register" className="text-[#00F0FF] hover:text-[#2CEFFF] hover:underline underline-offset-4 transition-colors font-bold">
            Create Profile
          </Link>
        </p>

      </div>
    </div>
  );
}
