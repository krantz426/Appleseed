"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";

interface PoolDetails {
  id: string;
  slug: string;
  classroom_name: string;
  grade: string;
  occasion: string;
  status: string;
  deadline: string;
  target_amount_cents: number;
  message: string;
  teacher_email: string;
  teachers: { name: string } | null;
  schools: { name: string } | null;
}

interface Contribution {
  id: string;
  child_name: string;
  parent_name: string;
  status: string;
  created_at: string;
}

export default function ManagePoolPage() {
  const params = useParams();
  const poolId = params.poolId as string;
  const [pool, setPool] = useState<PoolDetails | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCents, setTotalCents] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();

      const { data: poolData } = await supabase
        .from("pools")
        .select("*, teachers(name), schools(name)")
        .eq("id", poolId)
        .single();

      if (poolData) setPool(poolData as PoolDetails);

      // Room parent sees child names but NOT amounts
      const { data: contribs } = await supabase
        .from("contributions")
        .select("id, child_name, parent_name, status, created_at")
        .eq("pool_id", poolId)
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      setContributions(contribs || []);

      // Get total via API (which uses admin client)
      const res = await fetch(`/api/pool/${poolId}`);
      if (res.ok) {
        const data = await res.json();
        setTotalCents(data.collectedCents || 0);
      }

      setLoading(false);
    }
    load();
  }, [poolId]);

  if (loading || !pool) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
        <p style={{ color: "#7a7060" }}>Loading...</p>
      </div>
    );
  }

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${pool.slug}`;

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#3d6b3d", marginBottom: 24 }}>
          appleseed<span style={{ color: "#b8860b" }}>.</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "#2d2a26" }}>
              {pool.teachers?.name || "Teacher"}
            </h1>
            <p style={{ color: "#7a7060", fontSize: 14 }}>
              {pool.schools?.name} · {pool.classroom_name} · {pool.occasion}
            </p>
          </div>
          <span style={{
            padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
            color: pool.status === "active" ? "#3d6b3d" : "#7a7060",
            background: pool.status === "active" ? "rgba(61,107,61,0.1)" : "#ece8e0",
            textTransform: "capitalize",
          }}>
            {pool.status}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, padding: 16, background: "#fff", border: "1px solid #d4c5a9", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#3d6b3d" }}>
              {formatCents(totalCents)}
            </div>
            <div style={{ fontSize: 12, color: "#a09880" }}>collected</div>
          </div>
          <div style={{ flex: 1, padding: 16, background: "#fff", border: "1px solid #d4c5a9", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#3d6b3d" }}>
              {contributions.length}
            </div>
            <div style={{ fontSize: 12, color: "#a09880" }}>families</div>
          </div>
          <div style={{ flex: 1, padding: 16, background: "#fff", border: "1px solid #d4c5a9", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "#2d2a26" }}>
              {new Date(pool.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <div style={{ fontSize: 12, color: "#a09880" }}>deadline</div>
          </div>
        </div>

        {/* Share link */}
        <div style={{ padding: 16, background: "#fff", border: "1px solid #d4c5a9", borderRadius: 10, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#7a7060", marginBottom: 8 }}>Share this link with parents</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input readOnly value={shareLink} style={{ flex: 1, padding: "8px 12px", border: "1px solid #ece8e0", borderRadius: 6, fontSize: 13, color: "#3d6b3d", fontWeight: 500, background: "#faf8f4" }} />
            <button
              onClick={() => navigator.clipboard.writeText(shareLink)}
              style={{ padding: "8px 16px", background: "#3d6b3d", color: "#faf8f4", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Contributors (names only, NO amounts) */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#2d2a26", marginBottom: 12 }}>
            Names on the card ({contributions.length})
          </h2>
          {contributions.length === 0 ? (
            <p style={{ color: "#a09880", fontSize: 14 }}>No contributions yet. Share the link!</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {contributions.map((c) => (
                <span key={c.id} style={{ padding: "6px 14px", background: "#fff", border: "1px solid #ece8e0", borderRadius: 9999, fontSize: 13, color: "#7a7060" }}>
                  {c.child_name || `A Family in ${pool.classroom_name}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
