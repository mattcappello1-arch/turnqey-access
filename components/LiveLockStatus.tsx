"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type LockStatus = {
  id: string;
  is_locked: boolean | null;
  is_online: boolean | null;
  battery_level: number | null;
};

export function LiveLockStatus({ lockId, initialStatus }: {
  lockId: string;
  initialStatus: { is_locked: boolean | null; is_online: boolean | null };
}) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const supabase = createClient();

    // Poll every 15 seconds for lock status changes
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("locks")
        .select("is_locked,is_online,battery_level")
        .eq("id", lockId)
        .maybeSingle();

      if (data) {
        setStatus(prev => {
          if (prev.is_locked !== data.is_locked || prev.is_online !== data.is_online) {
            return { is_locked: data.is_locked, is_online: data.is_online };
          }
          return prev;
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [lockId]);

  const isOffline = status.is_online === false;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: isOffline ? "var(--slate, #8A8A8E)" : status.is_locked ? "#8A3324" : "#0A6E3B",
        animation: !isOffline ? "livePulse 3s ease infinite" : "none",
      }} />
      <span style={{ fontSize: 11, fontWeight: 500, color: isOffline ? "var(--slate, #8A8A8E)" : status.is_locked ? "#8A3324" : "#0A6E3B" }}>
        {isOffline ? "Offline" : status.is_locked ? "Locked" : "Unlocked"}
      </span>
      <span style={{ fontSize: 9, color: "var(--slate, #8A8A8E)", marginLeft: 2 }}>LIVE</span>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export function LiveLockGrid({ propertyIds }: { propertyIds: string[] }) {
  const [locks, setLocks] = useState<LockStatus[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (propertyIds.length === 0) return;

    const supabase = createClient();

    async function fetchLocks() {
      const { data } = await supabase
        .from("locks")
        .select("id,is_locked,is_online,battery_level")
        .in("property_id", propertyIds);

      if (data) {
        setLocks(data as LockStatus[]);
        setLastUpdate(new Date());
      }
    }

    fetchLocks();
    const interval = setInterval(fetchLocks, 15000);
    return () => clearInterval(interval);
  }, [propertyIds]);

  const online = locks.filter(l => l.is_online !== false).length;
  const locked = locks.filter(l => l.is_locked === true).length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "var(--slate, #8A8A8E)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#0A6E3B", animation: "livePulse 3s ease infinite" }} />
        {online}/{locks.length} online
      </span>
      <span>{locked} locked</span>
      <span style={{ fontSize: 9 }}>Updated {lastUpdate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
    </div>
  );
}
