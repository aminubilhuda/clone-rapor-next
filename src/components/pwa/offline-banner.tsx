"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 px-4 py-1.5 text-center text-sm font-medium text-amber-950">
      Mode offline — sebagian fitur mungkin terbatas.
    </div>
  );
}
