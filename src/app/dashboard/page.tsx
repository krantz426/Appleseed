"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { formatCents } from "@/lib/utils";

interface Pool {
  id: string;
  slug: string;
  classroom_name: string;
  occasion: string;
  status: string;
  deadline: string;
  target_amount_cents: number;
  teachers: { name: string } | null;
}

export default function DashboardPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPools() {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: parent } = await supabase
        .from("parents")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!parent) { setLoading(false); return; }

      const { data } = await supabase
        .from("pools")
        .select("*, teachers(name)")
        .eq("room_parent_id", parent.id)
        .order("created_at", { ascending: false });

      setPools(data || []);
      setLoading(false);
    }
    loadPools();
  }, []);

  const statusColors: Record<string, string> = {
    active: "#3d6b3d",
    extended: "#b8860b",
    closed: "#7a7060",
    delivered: "#3d6b3d",
    refunded: "#c0392b",
  };

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#3d6b3d" }}>
              appleseed<span style={{ color: "#b8860b" }}>.</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, color: "#2d2a26", marginTop: 4 }}>
              Your gift pools
            </h1>
          </div>
          <Link
            href="/pool/new"
            style={{ padding: "10px 20px", background: "#3d6b3d", color: "#faf8f4", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}
          >
            New pool
          </Link>
        </div>

        {loading ? (
          <p style={{ color: "#7a7060" }}>Loading...</p>
        ) : pools.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#2d2a26", marginBottom: 8 }}>No pools yet</h2>
            <p style={{ color: "#7a7060", fontSize: 14, marginBottom: 24 }}>
              Create your first group gift pool and share the link with your class.
            </p>
            <Link
              href="/pool/new"
              style={{ display: "inline-block", padding: "12px 28px", background: "#3d6b3d", color: "#faf8f4", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}
            >
              Create a pool
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pools.map((pool) => (
              <Link
                key={pool.id}
                href={`/pool/${pool.id}/manage`}
                style={{ display: "block", padding: 20, background: "#fff", border: "1px solid #d4c5a9", borderRadius: 10, textDecoration: "none", transition: "box-shadow 0.2s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#2d2a26", marginBottom: 4 }}>
                      {pool.teachers?.name || "Teacher"}
                    </h3>
                    <p style={{ fontSize: 13, color: "#7a7060" }}>
                      {pool.classroom_name} · {pool.occasion}
                    </p>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, color: statusColors[pool.status] || "#7a7060", background: `${statusColors[pool.status] || "#7a7060"}15`, textTransform: "capitalize" }}>
                    {pool.status}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: "#a09880" }}>
                  <span>Target: {formatCents(pool.target_amount_cents)}</span>
                  <span>Deadline: {new Date(pool.deadline).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
