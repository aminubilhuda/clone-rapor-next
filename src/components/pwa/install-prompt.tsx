"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setPromptEvent(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    const initializationFrame = window.requestAnimationFrame(() => {
      setIsStandalone(standalone);
      setIsIOS(ios);
      setIsDismissed(Date.now() - dismissedAt < DISMISS_DURATION);
    });

    return () => {
      window.cancelAnimationFrame(initializationFrame);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
  };

  const install = async () => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);

    if (choice.outcome === "dismissed") {
      dismiss();
    }
  };

  if (isStandalone || isDismissed || (!promptEvent && !isIOS)) return null;

  return (
    <aside className="relative mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Tutup ajakan instalasi"
        className="absolute right-2 top-2 rounded-lg p-1 text-emerald-700/60 transition-colors hover:bg-emerald-100 hover:text-emerald-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex gap-3 pr-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-950">Pasang E-Rapor di perangkat ini?</p>
          <p className="mt-1 text-xs leading-5 text-emerald-800">
            {isIOS
              ? 'Ketuk tombol Bagikan di Safari, lalu pilih "Tambahkan ke Layar Utama".'
              : "Akses lebih cepat dari layar utama dan gunakan seperti aplikasi."}
          </p>

          {promptEvent && (
            <button
              type="button"
              onClick={install}
              className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Install Aplikasi
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
