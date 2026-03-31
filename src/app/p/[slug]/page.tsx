"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCents, calculateFee } from "@/lib/utils";
import { PRESET_AMOUNTS } from "@/lib/constants";

interface PoolData {
  id: string;
  slug: string;
  teacherName: string;
  schoolName: string;
  classroomName: string;
  grade: string;
  occasion: string;
  deadline: string;
  status: string;
  targetAmountCents: number;
  suggestedAmountCents: number;
  collectedCents: number;
  contributorCount: number;
  childNames: string[];
}

export default function ContributionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [pool, setPool] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(1500);
  const [childName, setChildName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentName, setParentName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPool() {
      try {
        // First find pool ID by slug via a search
        const res = await fetch(`/api/pool/by-slug/${slug}`);
        if (!res.ok) throw new Error("Pool not found");
        const data = await res.json();
        setPool(data);
        if (data.suggestedAmountCents) {
          setSelectedAmount(data.suggestedAmountCents);
        }
      } catch {
        setError("This gift pool doesn't exist or has been closed.");
      } finally {
        setLoading(false);
      }
    }
    loadPool();
  }, [slug]);

  const { fee, total } = calculateFee(selectedAmount);
  const progress = pool
    ? Math.min(
        100,
        Math.round((pool.collectedCents / pool.targetAmountCents) * 100)
      )
    : 0;

  const daysLeft = pool
    ? Math.max(
        0,
        Math.ceil(
          (new Date(pool.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const isOpen = pool?.status === "active" || pool?.status === "extended";

  async function handleContribute() {
    if (!pool || !parentEmail) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          amountCents: selectedAmount,
          childName: childName || null,
          parentEmail,
          parentName: parentName || null,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || "Something went wrong");
        setSubmitting(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
        <div style={{ color: "#7a7060" }}>Loading...</div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
        <div className="text-center" style={{ maxWidth: 320, padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍎</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#2d2a26", marginBottom: 8 }}>
            Pool not found
          </h1>
          <p style={{ color: "#7a7060", fontSize: 14 }}>
            {error || "This gift pool doesn't exist or has been closed."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      <div style={{ maxWidth: 390, margin: "0 auto", padding: "0" }}>
        {/* Header */}
        <div style={{ padding: "48px 24px 24px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 500,
              color: "#3d6b3d",
              marginBottom: 28,
            }}
          >
            appleseed<span style={{ color: "#b8860b" }}>.</span>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#a09880",
              textTransform: "uppercase" as const,
              letterSpacing: 2,
              marginBottom: 6,
            }}
          >
            A gift for
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 600,
              color: "#2d2a26",
              marginBottom: 6,
            }}
          >
            {pool.teacherName}
          </h1>
          <p style={{ fontSize: 13, color: "#7a7060" }}>
            {pool.schoolName} · {pool.classroomName}
            {pool.grade ? ` · ${pool.grade}` : ""}
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 1,
            background: "#d4c5a9",
            margin: "0 auto",
          }}
        />

        {/* Progress */}
        <div style={{ padding: "24px 24px" }}>
          <div
            style={{
              height: 4,
              background: "#ece8e0",
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#3d6b3d",
                borderRadius: 2,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "#a09880",
            }}
          >
            <span>
              <strong style={{ color: "#3d6b3d" }}>
                {formatCents(pool.collectedCents)}
              </strong>{" "}
              of {formatCents(pool.targetAmountCents)}
            </span>
            <span>
              <strong style={{ color: "#3d6b3d" }}>
                {pool.contributorCount}
              </strong>{" "}
              families · {daysLeft}d left
            </span>
          </div>
        </div>

        {isOpen ? (
          <>
            {/* Amount Selection */}
            <div style={{ padding: "0 24px 24px" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  color: "#7a7060",
                  marginBottom: 12,
                }}
              >
                Choose your contribution
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      border: `1.5px solid ${
                        selectedAmount === amount ? "#3d6b3d" : "#d4c5a9"
                      }`,
                      borderRadius: 8,
                      background:
                        selectedAmount === amount ? "#3d6b3d" : "transparent",
                      color:
                        selectedAmount === amount ? "#faf8f4" : "#7a7060",
                      fontFamily: "var(--font-body)",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {formatCents(amount)}
                  </button>
                ))}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#a09880",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {formatCents(selectedAmount)} gift + {formatCents(fee)} fee ={" "}
                {formatCents(total)}
              </div>
            </div>

            {/* Child Name */}
            <div style={{ padding: "0 24px 16px" }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#7a7060",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Your child&apos;s name (for the card)
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Emma Rosenkrantz"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1.5px solid #d4c5a9",
                  borderRadius: 8,
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "#2d2a26",
                  background: "#fff",
                  outline: "none",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ padding: "0 24px 16px" }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#7a7060",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Your email (for receipt)
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1.5px solid #d4c5a9",
                  borderRadius: 8,
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  color: "#2d2a26",
                  background: "#fff",
                  outline: "none",
                }}
              />
            </div>

            {/* CTA */}
            <div style={{ padding: "0 24px 12px" }}>
              <button
                onClick={handleContribute}
                disabled={!parentEmail || submitting}
                style={{
                  width: "100%",
                  padding: 16,
                  background: submitting ? "#7a7060" : "#3d6b3d",
                  color: "#faf8f4",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {submitting
                  ? "Redirecting to payment..."
                  : `Contribute ${formatCents(total)}`}
              </button>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#a09880",
                  marginTop: 10,
                }}
              >
                Secure payment via Stripe · Contributions are private
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <p style={{ color: "#7a7060", fontSize: 14 }}>
              This gift pool is no longer accepting contributions.
            </p>
          </div>
        )}

        {/* Names on card */}
        {pool.childNames.length > 0 && (
          <div
            style={{
              padding: "24px",
              marginTop: 8,
              borderTop: "1px solid #ece8e0",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                color: "#a09880",
                marginBottom: 12,
              }}
            >
              On the card so far
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {pool.childNames.map((name, i) => (
                <span
                  key={i}
                  style={{
                    padding: "5px 12px",
                    background: "#faf8f4",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#7a7060",
                    border: "1px solid #ece8e0",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: 24,
            textAlign: "center",
            fontSize: 11,
            color: "#d4c5a9",
          }}
        >
          Powered by appleseed · Never think about teacher gifts again
        </div>
      </div>
    </div>
  );
}
