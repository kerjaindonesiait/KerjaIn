import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_PATHS, SITE_URL } from "./public-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().slice(0, 10);

const body = PUBLIC_PATHS.map(
  (route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${route === "/" ? "1.0" : route.startsWith("/servis-ac/") ? "0.7" : "0.8"}</priority>
  </url>`,
).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), xml, "utf8");
console.log(`Wrote ${PUBLIC_PATHS.length} URLs to public/sitemap.xml`);
