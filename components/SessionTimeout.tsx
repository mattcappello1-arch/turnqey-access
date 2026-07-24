"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

export function SessionTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login?reason=timeout";
      }, TIMEOUT_MS);
    }

    // Reset on any user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
