"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OCCASIONS } from "@/lib/constants";

export default function CreatePoolPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shareLink, setShareLink] = useState("");

  const [form, setForm] = useState({
    teacherName: "",
    teacherEmail: "",
    schoolName: "",
    classroomName: "",
    grade: "",
    targetAmountCents: 37500,
    suggestedAmountCents: 1500,
    deadline: "",
    occasion: OCCASIONS[0],
    message: "",
    preferredStore: "amazon",
  });

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create pool");
      setShareLink(data.shareableLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setSubmitting(false);
  }

  if (shareLink) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f4" }}>
        <div style={{ maxWidth: 480, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#2d2a26", marginBottom: 12 }}>
            Pool created!
          </h1>
          <p style={{ color: "#7a7060", marginBottom: 24 }}>
            Share this link with the parents in your class:
          </p>
          <div style={{ padding: 16, background: "#fff", border: "1.5px solid #3d6b3d", borderRadius: 10, marginBottom: 16, wordBreak: "break-all", fontSize: 15, fontWeight: 600, color: "#3d6b3d" }}>
            {shareLink}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(shareLink)}
            style={{ padding: "10px 24px", background: "#3d6b3d", color: "#faf8f4", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", marginBottom: 24 }}
          >
            Copy link
          </button>
          <div style={{ padding: 16, background: "#f0ece4", borderRadius: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#7a7060", marginBottom: 4 }}>Suggested text message:</p>
            <p style={{ fontSize: 13, color: "#7a7060", fontStyle: "italic" }}>
              &quot;Hi! I set up a group gift for {form.teacherName} for {form.occasion}. Click here to chip in: {shareLink}&quot;
            </p>
          </div>
          <div style={{ marginTop: 24 }}>
            <button onClick={() => router.push("/dashboard")} style={{ padding: "10px 24px", background: "transparent", color: "#3d6b3d", border: "1.5px solid #3d6b3d", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fieldStyle = { width: "100%", padding: "12px 16px", border: "1.5px solid #d4c5a9", borderRadius: 8, fontSize: 15, outline: "none", background: "#fff", color: "#2d2a26", fontFamily: "inherit" };
  const labelStyle = { fontSize: 13, fontWeight: 600 as const, color: "#7a7060", display: "block" as const, marginBottom: 6 };

  return (
    <div className="min-h-screen" style={{ background: "#faf8f4" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#3d6b3d", marginBottom: 4 }}>
          appleseed<span style={{ color: "#b8860b" }}>.</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "#2d2a26", marginBottom: 4 }}>
          Start a class gift
        </h1>
        <p style={{ color: "#7a7060", fontSize: 14, marginBottom: 28 }}>
          Takes 60 seconds. We&apos;ll give you a link to share with parents.
        </p>

        {error && (
          <div style={{ padding: 12, background: "rgba(192,57,43,0.08)", borderRadius: 8, marginBottom: 16, color: "#c0392b", fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Teacher&apos;s name</label>
            <input style={fieldStyle} value={form.teacherName} onChange={(e) => updateField("teacherName", e.target.value)} placeholder="Ms. Rodriguez" required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Teacher&apos;s email (for gift delivery)</label>
            <input style={fieldStyle} type="email" value={form.teacherEmail} onChange={(e) => updateField("teacherEmail", e.target.value)} placeholder="teacher@school.edu" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>School</label>
            <input style={fieldStyle} value={form.schoolName} onChange={(e) => updateField("schoolName", e.target.value)} placeholder="Brentwood Elementary" required />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Class / Room</label>
              <input style={fieldStyle} value={form.classroomName} onChange={(e) => updateField("classroomName", e.target.value)} placeholder="Room 4B" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Grade</label>
              <input style={fieldStyle} value={form.grade} onChange={(e) => updateField("grade", e.target.value)} placeholder="3rd" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Gift occasion</label>
            <select style={{ ...fieldStyle, cursor: "pointer" }} value={form.occasion} onChange={(e) => updateField("occasion", e.target.value)}>
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Suggested contribution per family</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1000, 1500, 2000, 2500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => updateField("suggestedAmountCents", amt)}
                  style={{
                    flex: 1, padding: "10px 0", border: `1.5px solid ${form.suggestedAmountCents === amt ? "#3d6b3d" : "#d4c5a9"}`,
                    borderRadius: 8, background: form.suggestedAmountCents === amt ? "#3d6b3d" : "transparent",
                    color: form.suggestedAmountCents === amt ? "#faf8f4" : "#7a7060",
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                  }}
                >
                  ${amt / 100}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Deadline for contributions</label>
            <input style={fieldStyle} type="date" value={form.deadline} onChange={(e) => updateField("deadline", e.target.value)} required min={new Date().toISOString().split("T")[0]} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Message for the card (optional)</label>
            <textarea
              style={{ ...fieldStyle, minHeight: 80, resize: "vertical" }}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Thank you for an amazing year!"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ width: "100%", padding: 16, background: "#3d6b3d", color: "#faf8f4", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: "pointer" }}
          >
            {submitting ? "Creating..." : "Create pool & get link"}
          </button>
        </form>
      </div>
    </div>
  );
}
