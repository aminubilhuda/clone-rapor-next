import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline.html",
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/api\/(nilai|rapor|sekolah)/,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-rapor-data",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
    ],
  },
  customWorkerSrc: "src/service-worker",
});

const nextConfig: NextConfig = {
  // Mengaktifkan Turbopack sebagai bundler (dev & build). Object kosong = pakai default.
  turbopack: {},
  outputFileTracingRoot: process.cwd(),
  /* config options here */
};

export default withPWA(nextConfig);
