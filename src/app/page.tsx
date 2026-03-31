"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setJoined(true);
    } catch {
      // Silently fail
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      {/* Hero */}
      <header style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px 48px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "#3d6b3d", marginBottom: 8 }}>
          appleseed<span style={{ color: "#b8860b" }}>.</span>
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontStyle: "italic", color: "#a09880", marginBottom: 40 }}>
          Plant it once. It grows all year.
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, color: "#2d2a26", lineHeight: 1.15, marginBottom: 16 }}>
          Teacher gifts, handled.<br />All year. Automatically.
        </h1>
        <p style={{ fontSize: 18, color: "#7a7060", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
          Sign up in September. Pick a tier. We deliver a thoughtful gift to your
          child&apos;s teacher three times a year. You never think about it again.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <a href="/auth/login" style={{ display: "inline-block", padding: "12px 28px", background: "#3d6b3d", color: "#faf8f4", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
            Start a group gift
          </a>
          <a href="#waitlist" style={{ display: "inline-block", padding: "12px 28px", background: "transparent", color: "#3d6b3d", border: "1.5px solid #3d6b3d", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
            Join the waitlist
          </a>
        </div>
      </header>

      {/* How it works */}
      <section style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px", borderTop: "1px solid #ece8e0" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, textAlign: "center", marginBottom: 32, color: "#2d2a26" }}>
          How it works
        </h2>
        {[
          { num: "1", title: "Set up in September", desc: "Your child's name, teacher, school. Takes 2 minutes." },
          { num: "2", title: "Pick a tier", desc: "$99, $149, or $199/year. Covers all three gifts." },
          { num: "3", title: "We handle the rest", desc: "Fall break. Teacher Appreciation Week. Last day of school. A personalized card + gift card, delivered to the school." },
        ].map((step) => (
          <div key={step.num} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #3d6b3d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#3d6b3d", flexShrink: 0 }}>
              {step.num}
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2d2a26", marginBottom: 2 }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: "#7a7060" }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Group gift CTA */}
      <section style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px", borderTop: "1px solid #ece8e0", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginBottom: 8, color: "#2d2a26" }}>
          The class gift, solved.
        </h2>
        <p style={{ fontSize: 14, color: "#7a7060", marginBottom: 24 }}>
          No more Venmo chasing. No more ghosting. One link, done.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", fontSize: 12, color: "#a09880" }}>
          <span style={{ padding: "8px 14px", border: "1px solid #d4c5a9", borderRadius: 8 }}>Room parent creates pool</span>
          <span style={{ color: "#d4c5a9", lineHeight: "36px" }}>→</span>
          <span style={{ padding: "8px 14px", border: "1px solid #d4c5a9", borderRadius: 8 }}>Share link with class</span>
          <span style={{ color: "#d4c5a9", lineHeight: "36px" }}>→</span>
          <span style={{ padding: "8px 14px", border: "1px solid #d4c5a9", borderRadius: 8 }}>Parents chip in</span>
          <span style={{ color: "#d4c5a9", lineHeight: "36px" }}>→</span>
          <span style={{ padding: "8px 14px", border: "1px solid #d4c5a9", borderRadius: 8 }}>Teacher gets a gift</span>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px", borderTop: "1px solid #ece8e0" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, textAlign: "center", marginBottom: 24, color: "#2d2a26" }}>
          Simple pricing
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { name: "Seed", price: "$99", per: "/year per child", desc: "$25 gift card per occasion" },
            { name: "Bloom", price: "$149", per: "/year per child", desc: "$40 gift card. Teacher picks the store.", featured: true },
            { name: "Harvest", price: "$199", per: "/year per child", desc: "$60 gift card. Handwritten-style note." },
          ].map((tier) => (
            <div key={tier.name} style={{ flex: 1, padding: "16px 12px", border: `1.5px solid ${tier.featured ? "#3d6b3d" : "#d4c5a9"}`, borderRadius: 10, textAlign: "center", background: tier.featured ? "rgba(61,107,61,0.05)" : "transparent" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "#3d6b3d" }}>{tier.price}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#a09880", marginTop: 2 }}>{tier.name}</div>
              <div style={{ fontSize: 10, color: "#a09880" }}>{tier.per}</div>
              <div style={{ fontSize: 11, color: "#7a7060", marginTop: 8, lineHeight: 1.4 }}>{tier.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "#a09880", marginTop: 12 }}>
          Subscriptions open September 2026. Join the waitlist below.
        </p>
      </section>

      {/* Waitlist */}
      <section id="waitlist" style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px 80px", borderTop: "1px solid #ece8e0", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginBottom: 8, color: "#2d2a26" }}>
          Get notified when subscriptions open
        </h2>
        <p style={{ fontSize: 14, color: "#7a7060", marginBottom: 24 }}>
          We&apos;ll remind you in September. One email, no spam.
        </p>
        {joined ? (
          <div style={{ padding: 16, background: "rgba(61,107,61,0.08)", borderRadius: 8 }}>
            <p style={{ color: "#3d6b3d", fontWeight: 600 }}>You&apos;re on the list! 🌱</p>
            <p style={{ color: "#7a7060", fontSize: 13, marginTop: 4 }}>We&apos;ll email you when subscriptions open in September.</p>
          </div>
        ) : (
          <form onSubmit={handleWaitlist} style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{ flex: 1, padding: "12px 16px", border: "1.5px solid #d4c5a9", borderRadius: 8, fontSize: 15, outline: "none", background: "#fff", color: "#2d2a26" }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "12px 24px", background: "#3d6b3d", color: "#faf8f4", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {submitting ? "..." : "Join"}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 480, margin: "0 auto", padding: "24px", textAlign: "center", borderTop: "1px solid #ece8e0" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "#d4c5a9" }}>
          appleseed<span style={{ color: "#b8860b" }}>.</span>
        </div>
        <p style={{ fontSize: 11, color: "#d4c5a9", marginTop: 4 }}>Plant it once. It grows all year.</p>
      </footer>
    </div>
  );
}
