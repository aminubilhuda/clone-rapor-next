const fs = require("fs");
const p = "D:\\PROJECT\\nextjs\\clone-rapor-next\\src\\app\\api\\tu\\cetak-rapor\\route.ts";
let c = fs.readFileSync(p, "utf8");

// Add playwright import after next/server import
if (!c.includes("from 'playwright'")) {
  c = c.replace(
    "import { NextRequest, NextResponse } from 'next/server';",
    "import { NextRequest, NextResponse } from 'next/server';\nimport { chromium } from 'playwright';"
  );
}

// Replace ALL puppeteer import+launch blocks
// Pattern 1: 6-space indent (inside if block)
// let puppeteer;\n      try {\n        puppeteer = await import('puppeteer');\n      } catch {\n        return ...\n      }\n\n      const execPath = await puppeteer.default.executablePath();\n      const browser = await puppeteer.default.launch({\n
const regex1 = /let puppeteer;\s*try\s*\{[^}]*puppeteer\s*=\s*await\s*import\('puppeteer'\);[^}]*\}\s*catch[^}]*\}[\s\S]*?const (?:execPath|browser)\s*=\s*await\s*puppeteer\.default\.(?:executablePath|launch)\([^)]*\);\s*const browser\s*=\s*await\s*puppeteer\.default\.launch\(\{/g;
c = c.replace(regex1, "const browser = await chromium.launch({");

// Pattern 2: 4-space indent (outside if block)
const regex2 = /    let puppeteer;\s*    try\s*\{[^}]*puppeteer\s*=\s*await\s*import\('puppeteer'\);[^}]*\}\s*catch[^}]*\}[\s\S]*?const (?:execPath|browser)\s*=\s*await\s*puppeteer\.default\.(?:executablePath|launch)\([^)]*\);\s*    const browser\s*=\s*await\s*puppeteer\.default\.launch\(\{/g;
c = c.replace(regex2, "    const browser = await chromium.launch({");

// Change error message references
c = c.replace(/'Puppeteer tidak tersedia'/g, "'PDF engine tidak tersedia'");

const puppeteerCount = (c.match(/puppeteer/gi) || []).length;
const chromiumCount = (c.match(/chromium/gi) || []).length;
console.log("puppeteer refs remaining: " + puppeteerCount);
console.log("chromium refs: " + chromiumCount);

fs.writeFileSync(p, c);
console.log("Done");