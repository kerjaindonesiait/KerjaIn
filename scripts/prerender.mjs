// Run AFTER `vite build`. Serves dist/, renders each public route in headless Chromium,
// writes nested static HTML, and HARD-FAILS (exit 1) on any un-rendered shell.
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRERENDER_ROUTES } from "./public-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");
const PORT = 4173;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function startServer(port) {
  const shell = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      const file = path.join(DIST, url);

      if (url !== "/" && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
        fs.createReadStream(file).pipe(res);
      } else {
        res.setHeader("Content-Type", "text/html");
        res.end(shell);
      }
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

const server = await startServer(PORT);
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
page.setDefaultTimeout(30000);

const failures = [];
for (const route of PRERENDER_ROUTES) {
  const url = `http://127.0.0.1:${PORT}${route.path}`;
  await page.goto(url, { waitUntil: "load" });
  await page.waitForSelector("#root h1, main h1, h1", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(300);

  const html = await page.content();
  const outDir = route.path === "/" ? DIST : path.join(DIST, route.path);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);

  const title = (html.match(/<title>(.*?)<\/title>/i)?.[1] || "").toLowerCase();
  const hasTitle = title.includes(route.expect);
  const hasOg = /property=["']og:title["']/i.test(html);
  const ok = hasTitle && hasOg;
  console.log(
    `${ok ? "✓" : "✗"} ${route.path.padEnd(26)} <title>${title}</title>${hasOg ? "" : "  [no og:title!]"}`,
  );
  if (!ok) {
    failures.push(
      `${route.path}: ${!hasTitle ? `title missing "${route.expect}" (got "${title}") ` : ""}${!hasOg ? "og:title absent — un-rendered shell" : ""}`,
    );
  }
}

await browser.close();
server.close();

if (failures.length) {
  console.error(`\n✗ Prerender FAILED for ${failures.length}/${PRERENDER_ROUTES.length} route(s):`);
  failures.forEach((f) => console.error("   - " + f));
  process.exit(1);
}
console.log(`\n✓ Prerendered ${PRERENDER_ROUTES.length} routes — all assertions passed.`);
