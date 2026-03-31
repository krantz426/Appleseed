"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "#3d6b3d", marginBottom: 4 }}>
            appleseed<span style={{ color: "#b8860b" }}>.</span>
          </div>
          <p style={{ fontSize: 14, color: "#7a7060" }}>Sign in to create and manage gift pools</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: 24, background: "rgba(61,107,61,0.08)", borderRadius: 10 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#2d2a26", marginBottom: 8 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: "#7a7060" }}>
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#7a7060", display: "block", marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #d4c5a9", borderRadius: 8, fontSize: 15, outline: "none", background: "#fff", color: "#2d2a26", marginBottom: 16 }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: 14, background: "#3d6b3d", color: "#faf8f4", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#a09880", marginTop: 12 }}>
              No password needed. We&apos;ll email you a sign-in link.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
