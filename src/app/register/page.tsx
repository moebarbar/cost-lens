"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ParticleMesh } from "@/components/ui/ParticleMesh";
import { GlassCard } from "@/components/ui/GlassCard";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", organizationName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created — please sign in.");
        router.push("/login");
      } else {
        router.push("/overview");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#00F0FF] selection:text-black">
      {/* Background Ambience */}
      <ParticleMesh />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10 pt-12 pb-12">
        
        {/* Logo and Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF] to-[#8B5CF6] rounded opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 border border-[#8B5CF6] rounded shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:rotate-180 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transformStyle: 'preserve-3d' }} />
              <span className="font-heading font-bold text-[#00F0FF] z-10 text-xl">C</span>
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00F0FF] group-hover:to-[#8B5CF6] transition-colors">
              CostLens
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            New Link Protocol
          </div>
        </div>

        {/* Auth Card */}
        <GlassCard glowColor="purple" className="p-8 pb-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-[#FF3366]/10 border border-[#FF3366]/30 rounded-lg text-[#FF3366] text-sm font-mono flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#FF3366] animate-pulse" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Operator Designation</label>
                <input 
                  type="text" 
                  placeholder="Alex Chen" 
                  value={form.name} 
                  onChange={update("name")} 
                  required 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Command Center HQ</label>
                <input 
                  type="text" 
                  placeholder="Acme Corp" 
                  value={form.organizationName} 
                  onChange={update("organizationName")} 
                  required 
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Comm Link (Email)</label>
              <input 
                type="email" 
                placeholder="operator@acme.corp" 
                value={form.email} 
                onChange={update("email")} 
                required 
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Security Passphrase</label>
              <input 
                type="password" 
                placeholder="Required: Minimum 8 characters" 
                value={form.password} 
                onChange={update("password")} 
                required 
                minLength={8} 
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] focus:outline-none transition-all placeholder:text-slate-600 tracking-widest"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`mt-4 h-12 rounded-lg font-heading font-bold text-black transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${
                loading ? "bg-[#8B5CF6]/50 text-white cursor-not-allowed" : "bg-[#8B5CF6] hover:bg-[#A78BFA] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] text-white hover:text-black"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Generating Identity...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Establish Neural Link</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[scanHorizontal_1.5s_ease-in-out_infinite]" />
                </>
              )}
            </button>
            
            <p className="text-center text-[10px] uppercase font-mono tracking-wider text-slate-600 mt-2">
              By initializing, you accept core system protocols.
            </p>
          </form>
        </GlassCard>

        <p className="text-center mt-8 text-slate-500 font-mono text-xs">
          Already possess a neural link?{" "}
          <Link href="/login" className="text-[#8B5CF6] hover:text-[#A78BFA] hover:underline underline-offset-4 transition-colors font-bold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
