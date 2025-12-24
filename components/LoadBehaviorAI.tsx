// components/LoadBehaviorAI.tsx
"use client";

import { useEffect } from "react";

export function LoadBehaviorAI() {
  useEffect(() => {
    const loadAndStart = async () => {
      // ✅ Carga diferida: solo cuando el navegador esté libre
      const { startBehaviorTracking } = await import("@/lib/behavior-tracker");
      startBehaviorTracking();
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadAndStart, { timeout: 3000 });
      } else {
        setTimeout(loadAndStart, 1500);
      }
    }
  }, []);

  return null; // Sin UI
}