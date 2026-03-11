"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.06) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: "36px", height: "36px",
              background: "var(--accent)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>💡</div>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>CostLens AI</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Start tracking your AI spend in minutes</p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {error && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--radius-md)",
                color: "var(--error)",
                fontSize: "14px",
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="label">Your name</label>
                <input className="input" type="text" placeholder="Alex Chen" value={form.name} onChange={update("name")} required />
              </div>
              <div>
                <label className="label">Organization</label>
                <input className="input" type="text" placeholder="Acme Corp" value={form.organizationName} onChange={update("organizationName")} required />
              </div>
            </div>

            <div>
              <label className="label">Work email</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={update("email")} required />
            </div>

            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="At least 8 characters" value={form.password} onChange={update("password")} required minLength={8} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "12px", marginTop: "4px" }}>
              {loading ? <span className="spinner" /> : "Create account — it&apos;s free"}
            </button>

            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-subtle)" }}>
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", color: "var(--text-muted)", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
