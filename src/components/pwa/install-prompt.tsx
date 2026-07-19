"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) return null;

  const install = async () => {
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  return (
    <button
      onClick={install}
      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
    >
      Instal Aplikasi
    </button>
  );
}
