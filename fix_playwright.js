const fs = require("fs");
const p = "D:\\PROJECT\\nextjs\\clone-rapor-next\\src\\app\\api\\tu\\cetak-rapor\\route.ts";
let c = fs.readFileSync(p, "utf8");

// Remove all puppeteer import-launch blocks and replace with playwright
const regex = /let puppeteer;\s*try\s*\{[^}]*puppeteer\s*=\s*await\s*import\('puppeteer'\);[^}]*\}\s*catch[^}]*\}[\s\S]*?const execPath = await puppeteer\.default\.executablePath\(\);\s*const browser = await puppeteer\.default\.launch\(\{/g;
c = c.replace(regex, "const browser = await chromium.launch({");

// Add import if not present
if (!c.includes("from 'playwright'")) {
  c = c.replace(
    "import { NextRequest, NextResponse } from 'next/server';",
    "import { chromium } from 'playwright';\nimport { NextRequest, NextResponse } from 'next/server';"
  );
}

c = c.replace(/puppeteer\.default\.launch/g, "chromium.launch");
c = c.replace(/puppeteer\.default\.executablePath\(\)/g, "chromium.launch()");

const puppeteerRefs = (c.match(/puppeteer/gi) || []).length;
const chromiumRefs = (c.match(/chromium/gi) || []).length;
console.log("puppeteer refs: " + puppeteerRefs);
console.log("chromium refs: " + chromiumRefs);

fs.writeFileSync(p, c);
console.log("Done");