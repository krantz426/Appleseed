"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface ClaimData {
  teacherName: string;
  classroomName: string;
  schoolName: string;
  occasion: string;
  giftCardCode: string;
  giftCardBrand: string;
  giftCardAmountCents: number;
  childNames: string[];
  message: string | null;
  alreadyClaimed: boolean;
}

export default function ClaimPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const deliveryId = params.deliveryId as string;
  const token = searchParams.get("token");

  const [data, setData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClaim() {
      try {
        const res = await fetch(`/api/claim/${deliveryId}?token=${token}`);
        if (!res.ok) throw new Error("Invalid claim link");
        setData(await res.json());
      } catch {
        setError("This claim link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    }
    if (token) loadClaim();
    else {
      setError("Missing claim token.");
      setLoading(false);
    }
  }, [deliveryId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
        <p style={{ color: "#7a7060" }}>Loading your gift...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#2d2a26" }}>
            {error}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#3d6b3d", marginBottom: 32 }}>
          appleseed<span style={{ color: "#b8860b" }}>.</span>
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>🍎</div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#2d2a26", marginBottom: 8 }}>
          You have a gift, {data.teacherName}!
        </h1>
        <p style={{ fontSize: 15, color: "#7a7060", marginBottom: 4 }}>
          From the families of {data.classroomName} at {data.schoolName}
        </p>
        <p style={{ fontSize: 13, color: "#a09880", marginBottom: 32 }}>
          {data.occasion}
        </p>

        {data.message && (
          <div style={{ padding: 20, background: "#fff", border: "1px solid #d4c5a9", borderRadius: 10, marginBottom: 24, fontStyle: "italic", color: "#7a7060", fontSize: 15 }}>
            &ldquo;{data.message}&rdquo;
          </div>
        )}

        {/* Gift card */}
        <div style={{ padding: 24, background: "#fff", border: "1.5px solid #3d6b3d", borderRadius: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#a09880", marginBottom: 4 }}>Your gift card</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "#3d6b3d", marginBottom: 4 }}>
            ${(data.giftCardAmountCents / 100).toFixed(2)}
          </div>
          <div style={{ fontSize: 14, color: "#7a7060", marginBottom: 16, textTransform: "capitalize" }}>
            {data.giftCardBrand} Gift Card
          </div>
          {data.giftCardCode.startsWith("http") ? (
            <a
              href={data.giftCardCode}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", padding: "12px 32px", background: "#3d6b3d", color: "#faf8f4", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}
            >
              Redeem Gift Card
            </a>
          ) : (
            <div style={{ padding: 12, background: "#faf8f4", borderRadius: 8, fontFamily: "monospace", fontSize: 16, color: "#2d2a26", letterSpacing: 1 }}>
              {data.giftCardCode}
            </div>
          )}
        </div>

        {/* Names */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "#a09880", marginBottom: 12 }}>With love from</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {data.childNames.map((name, i) => (
              <span key={i} style={{ padding: "5px 12px", background: "#fff", border: "1px solid #ece8e0", borderRadius: 9999, fontSize: 13, color: "#7a7060" }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "#d4c5a9" }}>
          Powered by appleseed · Plant it once. It grows all year.
        </div>
      </div>
    </div>
  );
}
