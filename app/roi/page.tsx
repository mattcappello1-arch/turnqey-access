"use client";

import { useState } from "react";
import Link from "next/link";

export default function ROIPage() {
  const [doors, setDoors] = useState(20);
  const [checkins, setCheckins] = useState(50);
  const [keyCallouts, setKeyCallouts] = useState(4);
  const [staffHourlyRate, setStaffHourlyRate] = useState(35);

  // Calculations
  const minutesPerManualCheckin = 15; // meet guest, hand over key, explain
  const minutesPerSmartCheckin = 2; // guest self-checks in
  const minutesSavedPerCheckin = minutesPerManualCheckin - minutesPerSmartCheckin;
  const monthlyTimeSavedMins = checkins * minutesSavedPerCheckin;
  const monthlyTimeSavedHrs = Math.round(monthlyTimeSavedMins / 60);

  const calloutCost = 50; // average cost per lockout/key callout
  const monthlySavedCallouts = keyCallouts * calloutCost;

  const staffTimeSaved = monthlyTimeSavedHrs * staffHourlyRate;
  const totalMonthlySavings = staffTimeSaved + monthlySavedCallouts;

  const pricePerDoor = doors > 100 ? 12 : doors > 20 ? 15 : 19;
  const monthlyCost = doors * pricePerDoor;
  const netSavings = totalMonthlySavings - monthlyCost;
  const roi = monthlyCost > 0 ? Math.round((netSavings / monthlyCost) * 100) : 0;

  const inputStyle = { width: "100%", padding: "12px 16px", fontSize: 16, fontWeight: 300 as const, color: "#0A0A0B", background: "#FFFFFF", border: "1px solid #E8E6E1", borderRadius: 10, outline: "none", textAlign: "center" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 5%", maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.18em", color: "#0A0A0B", textTransform: "uppercase", textDecoration: "none" }}>Turnqey Access</Link>
        <Link href="/pricing" style={{ padding: "10px 20px", fontSize: 13, color: "#3A3A3D", textDecoration: "none", border: "1px solid #E8E6E1", borderRadius: 10 }}>View pricing</Link>
      </nav>

      <section style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#8A8A8E", marginBottom: 16 }}>ROI Calculator</div>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: -1, color: "#0A0A0B", marginBottom: 8 }}>How much will you save?</h1>
          <p style={{ fontSize: 15, color: "#8A8A8E" }}>Adjust the numbers to match your operation.</p>
        </div>

        {/* Inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3A3A3D", marginBottom: 6 }}>Number of doors</label>
            <input type="number" value={doors} onChange={e => setDoors(Number(e.target.value) || 0)} min={1} max={500} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3A3A3D", marginBottom: 6 }}>Check-ins per month</label>
            <input type="number" value={checkins} onChange={e => setCheckins(Number(e.target.value) || 0)} min={0} max={1000} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3A3A3D", marginBottom: 6 }}>Key callouts per month</label>
            <input type="number" value={keyCallouts} onChange={e => setKeyCallouts(Number(e.target.value) || 0)} min={0} max={50} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#3A3A3D", marginBottom: 6 }}>Staff hourly rate (AUD)</label>
            <input type="number" value={staffHourlyRate} onChange={e => setStaffHourlyRate(Number(e.target.value) || 0)} min={0} max={200} style={inputStyle} />
          </div>
        </div>

        {/* Results */}
        <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8E6E1", overflow: "hidden" }}>
          <div style={{ padding: "28px", borderBottom: "1px solid #E8E6E1" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 1.5, color: "#8A8A8E", textTransform: "uppercase", marginBottom: 16 }}>Monthly savings</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 300, color: "#0A0A0B", letterSpacing: -1 }}>{monthlyTimeSavedHrs}</div>
                <div style={{ fontSize: 11, color: "#8A8A8E" }}>Hours saved</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 300, color: "#0A0A0B", letterSpacing: -1 }}>${staffTimeSaved}</div>
                <div style={{ fontSize: 11, color: "#8A8A8E" }}>Staff time saved</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 300, color: "#0A0A0B", letterSpacing: -1 }}>${monthlySavedCallouts}</div>
                <div style={{ fontSize: 11, color: "#8A8A8E" }}>Callouts avoided</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "28px", background: "#FAFAF8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#3A3A3D" }}>Total monthly savings</span>
              <span style={{ fontSize: 22, fontWeight: 300, color: "#0A0A0B" }}>${totalMonthlySavings}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: "#3A3A3D" }}>Turnqey Access cost ({doors} doors x ${pricePerDoor})</span>
              <span style={{ fontSize: 22, fontWeight: 300, color: "#8A8A8E" }}>-${monthlyCost}</span>
            </div>
            <div style={{ height: 1, background: "#E8E6E1", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: "#0A0A0B" }}>Net monthly benefit</span>
              <span style={{ fontSize: 28, fontWeight: 300, color: netSavings >= 0 ? "#0A6E3B" : "#8A3324", letterSpacing: -1 }}>${netSavings}</span>
            </div>
            {roi > 0 && (
              <div style={{ textAlign: "right", fontSize: 12, color: "#0A6E3B", fontWeight: 500, marginTop: 4 }}>{roi}% ROI</div>
            )}
          </div>
        </div>

        {/* Assumptions */}
        <div style={{ marginTop: 24, padding: "16px 20px", background: "#FFFFFF", borderRadius: 12, border: "1px solid #E8E6E1" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: "#8A8A8E", textTransform: "uppercase", marginBottom: 8 }}>Assumptions</div>
          <div style={{ fontSize: 12, color: "#8A8A8E", lineHeight: 1.6 }}>
            Manual check-in: ~15 min (coordinate arrival, hand over key, explain access). Smart check-in: ~2 min (guest self-checks in, PIN auto-generated). Average lockout callout: $50 (travel + re-keying/replacement).
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/login" style={{ display: "inline-block", padding: "14px 36px", background: "#0A0A0B", color: "#F7F5F0", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>Start free trial</Link>
        </div>
      </section>
    </div>
  );
}
