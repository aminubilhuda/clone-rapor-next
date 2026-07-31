"use client";

import { useEffect, useRef } from "react";

export default function PushPermission() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      done.current = true;
      return;
    }
    if (Notification.permission === "denied") {
      done.current = true;
      return;
    }

    done.current = true;

    const run = async () => {
      try {
        let reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        reg = await navigator.serviceWorker.ready;
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub),
        });
      } catch {
        // silent
      }
    };

    run();
  }, []);

  return null;
}
