const fs = require("fs");
const path = require("path");
const p = path.join("D:\\", "PROJECT", "nextjs", "clone-rapor-next", "src", "app", "api", "tu", "cetak-rapor", "route.ts");
let c = fs.readFileSync(p, "utf8");

const oldBlock = 'const browser = await puppeteer.default.launch({\r\n        headless: true,\r\n        args: [\'--no-sandbox\', \'--disable-setuid-sandbox\'],\r\n      });';

const newBlock = 'const execPath = await puppeteer.default.executablePath();\r\n      const browser = await puppeteer.default.launch({\r\n        headless: true,\r\n        executablePath: execPath,\r\n        args: [\'--no-sandbox\', \'--disable-setuid-sandbox\'],\r\n      });';

const launchCount = (c.match(/puppeteer\.default\.launch/g) || []).length;
console.log("Found " + launchCount + " launch calls");

c = c.replaceAll(oldBlock, newBlock);

const afterCount = (c.match(/puppeteer\.default\.launch/g) || []).length;
console.log("Remaining launch calls: " + afterCount);
console.log("execPath added: " + (c.match(/execPath/g) || []).length);

fs.writeFileSync(p, c);
console.log("Done");