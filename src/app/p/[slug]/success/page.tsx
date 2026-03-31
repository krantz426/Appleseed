"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
      <div style={{ maxWidth: 390, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 600,
            color: "#2d2a26",
            marginBottom: 8,
          }}
        >
          Thank you!
        </h1>
        <p style={{ color: "#7a7060", fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
          Your contribution has been received. Your child&apos;s name will appear on the
          card when the gift is delivered to the teacher.
        </p>
        <p style={{ color: "#a09880", fontSize: 14, marginBottom: 32 }}>
          A confirmation email is on its way.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            href={`/p/${slug}`}
            style={{
              display: "block",
              padding: "12px 24px",
              background: "transparent",
              color: "#3d6b3d",
              border: "1.5px solid #3d6b3d",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            View the gift pool
          </Link>
        </div>

        <div style={{ marginTop: 32, padding: 16, background: "#f0ece4", borderRadius: 8 }}>
          <p style={{ fontSize: 13, color: "#7a7060", marginBottom: 8, fontWeight: 600 }}>
            Know other parents in the class?
          </p>
          <p style={{ fontSize: 12, color: "#a09880" }}>
            Share the pool link so more families can contribute before the deadline.
          </p>
        </div>
      </div>
    </div>
  );
}
