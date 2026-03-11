"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.06) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: "var(--accent)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>💡</div>
            <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
              CostLens AI
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

            <div>
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "12px" }}>
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", color: "var(--text-muted)", fontSize: "14px" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Get started free
          </Link>
        </p>
      </div>
    </div>
  );
}
