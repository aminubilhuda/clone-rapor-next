"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";

type SubState = "unknown" | "subscribed" | "unsupported" | "denied";

export default function PushPermission() {
  const { showToast } = useToast();
  const [state, setState] = useState<SubState>("unknown");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "subscribed" : "unknown"))
      .catch(() => setState("unknown"));
  }, []);

  const subscribe = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setState("subscribed");
      showToast("Notifikasi diaktifkan", "success");
    } catch (err) {
      showToast("Gagal mengaktifkan notifikasi", "error");
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("unknown");
      showToast("Notifikasi dimatikan", "success");
    } catch {
      showToast("Gagal mematikan notifikasi", "error");
    } finally {
      setBusy(false);
    }
  };

  if (state === "unsupported") return null;
  if (state === "denied") {
    return (
      <span className="text-xs text-red-400">Notifikasi diblokir di browser</span>
    );
  }

  return (
    <button
      onClick={state === "subscribed" ? unsubscribe : subscribe}
      disabled={busy}
      className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
    >
      {busy ? "Memproses..." : state === "subscribed" ? "Nonaktifkan Notif" : "Aktifkan Notif"}
    </button>
  );
}
