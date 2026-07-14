"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function FeedbackPage() {
  const params = useParams();
  const stayId = params.stayId as string;
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (rating === null) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stay_id: stayId, rating, comment: comment.trim() || null }),
      });
      setSubmitted(true);
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(10,110,59,0.08)", border: "1px solid rgba(10,110,59,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A6E3B" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: "#0A0A0B", marginBottom: 8 }}>Thank you</h1>
          <p style={{ fontSize: 14, color: "#8A8A8E" }}>Your feedback helps us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ fontSize: 11, fontWeight: 400, letterSpacing: "0.15em", color: "#8A8A8E", textTransform: "uppercase", marginBottom: 32, textAlign: "center" }}>Turnqey Access</div>

        <h1 style={{ fontSize: 24, fontWeight: 300, color: "#0A0A0B", letterSpacing: -0.5, marginBottom: 8, textAlign: "center" }}>How was your stay?</h1>
        <p style={{ fontSize: 14, color: "#8A8A8E", textAlign: "center", marginBottom: 32 }}>Your feedback is anonymous and takes 30 seconds.</p>

        {/* Rating */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setRating(n)}
              style={{
                width: 56, height: 56, borderRadius: 14, border: `2px solid ${rating === n ? "#0A0A0B" : "#E8E6E1"}`,
                background: rating === n ? "#0A0A0B" : "#FFFFFF", color: rating === n ? "#F7F5F0" : "#0A0A0B",
                fontSize: 20, fontWeight: 300, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8A8A8E", marginBottom: 24, padding: "0 8px" }}>
          <span>Poor</span>
          <span>Excellent</span>
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Anything else you would like to share? (optional)"
          style={{ width: "100%", padding: "14px 16px", fontSize: 14, color: "#0A0A0B", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 12, outline: "none", resize: "vertical", minHeight: 80, fontFamily: "inherit", marginBottom: 20 }}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || rating === null}
          style={{
            width: "100%", padding: "14px", background: "#0A0A0B", color: "#F7F5F0",
            border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600,
            cursor: rating === null ? "not-allowed" : "pointer", opacity: rating === null ? 0.4 : 1,
          }}
        >
          {submitting ? "Submitting..." : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}
