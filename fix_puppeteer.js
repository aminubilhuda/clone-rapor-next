const fs = require("fs");
const path = require("path");
const p = path.join("D:\\", "PROJECT", "nextjs", "clone-rapor-next", "src", "app", "api", "tu", "cetak-rapor", "route.ts");
let c = fs.readFileSync(p, "utf8");

const oldBlock = 'const browser = await puppeteer.default.launch({\n        headless: true,\n        args: [\'--no-sandbox\', \'--disable-setuid-sandbox\'],\n      });';

const newBlock = 'const execPath = await puppeteer.default.executablePath();\n      const browser = await puppeteer.default.launch({\n        headless: true,\n        executablePath: execPath,\n        args: [\'--no-sandbox\', \'--disable-setuid-sandbox\'],\n      });';

const launchCount = (c.match(/puppeteer\.default\.launch/g) || []).length;
console.log("Found " + launchCount + " launch calls");

let result = c.replaceAll(oldBlock, newBlock);
const afterCount = (result.match(/puppeteer\.default\.launch/g) || []).length;
console.log("Remaining launch calls: " + afterCount);
console.log("execPath added: " + (result.match(/execPath/g) || []).length);

fs.writeFileSync(p, result);
console.log("Done");