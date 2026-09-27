import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  register: process.env.NODE_ENV !== "development",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  // Mengaktifkan Turbopack sebagai bundler (dev & build). Object kosong = pakai default.
  turbopack: {},
  outputFileTracingRoot: process.cwd(),
  /* config options here */
};

export default withSerwist(nextConfig);
