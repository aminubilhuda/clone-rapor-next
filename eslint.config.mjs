import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated service worker assets:
    "public/sw.js",
    "public/workbox-*.js",
    "public/swe-worker-*.js",
    "public/fallback-*.js",
    // Runtime & tooling artifacts:
    "storage/**",
    "graphify-out/**",
    // Node CommonJS config (bukan kode aplikasi):
    "ecosystem.config.js",
  ]),
  {
    rules: {
      // Backlog: 1.070 `any` tersisa, diturunkan ke warning agar CI bisa
      // memblokir error nyata sambil pembersihan tipe berjalan bertahap.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
