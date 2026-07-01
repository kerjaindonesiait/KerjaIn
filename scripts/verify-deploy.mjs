#!/usr/bin/env node
/**
 * Post-deploy smoke test — SEO prerender + app routes + static assets.
 * Usage: node scripts/verify-deploy.mjs [baseUrl]
 * Default baseUrl: https://kerjaindonesia.com
 */
const BASE = (process.argv[2] ?? "https://kerjaindonesia.com").replace(/\/+$/, "");

const CHECKS = [
  // Prerendered marketing (must return 200 + unique title in HTML)
  { path: "/", expectStatus: 200, titleIncludes: "kerjain", ogTitleCount: 1 },
  { path: "/how-it-works", expectStatus: 200, titleIncludes: "cara kerja", ogTitleCount: 1 },
  { path: "/servis-ac", expectStatus: 200, titleIncludes: "servis ac", ogTitleCount: 1 },
  { path: "/servis-ac/bsd", expectStatus: 200, titleIncludes: "bsd", ogTitleCount: 1 },
  { path: "/jasa-tukang", expectStatus: 200, titleIncludes: "jasa tukang", ogTitleCount: 1 },
  // App / auth flows (must return 200 SPA shell — title may be generic until JS)
  { path: "/masuk", expectStatus: 200 },
  { path: "/daftar", expectStatus: 200 },
  { path: "/auth/callback", expectStatus: 200 },
  { path: "/auth/callback?oauth=success", expectStatus: 200 },
  { path: "/post-job", expectStatus: 200 },
  { path: "/tasks", expectStatus: 200 },
  { path: "/daftar-tukang", expectStatus: 200 },
  { path: "/dasbor-tukang", expectStatus: 200 },
  { path: "/pesan", expectStatus: 200 },
  { path: "/tukang/test-id", expectStatus: 200 },
  // Static assets
  { path: "/favicon.png", expectStatus: 200 },
  { path: "/og-default.jpg", expectStatus: 200 },
  { path: "/robots.txt", expectStatus: 200 },
  { path: "/sitemap.xml", expectStatus: 200 },
];

function parseTitle(html) {
  const m = html.match(/<title>(.*?)<\/title>/i);
  return m?.[1]?.replace(/&amp;/g, "&").toLowerCase() ?? "";
}

function countOgTitle(html) {
  return (html.match(/property=["']og:title["']/gi) ?? []).length;
}

async function checkOne({ path, expectStatus, titleIncludes, ogTitleCount }) {
  const url = `${BASE}${path}`;
  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (err) {
    return { path, ok: false, detail: `fetch failed: ${err.message}` };
  }

  const html = await res.text();
  const title = parseTitle(html);
  const issues = [];

  if (res.status !== expectStatus) {
    issues.push(`status ${res.status} (want ${expectStatus})`);
  }
  if (titleIncludes && !title.includes(titleIncludes)) {
    issues.push(`title missing "${titleIncludes}" (got "${title}")`);
  }
  if (ogTitleCount != null && countOgTitle(html) !== ogTitleCount) {
    issues.push(`og:title count ${countOgTitle(html)} (want ${ogTitleCount})`);
  }

  // Prerendered pages must NOT share homepage-only shell title with wrong route
  if (path.startsWith("/servis-ac") && title.includes("cari tukang") && !title.includes("servis ac")) {
    issues.push("looks like homepage SPA shell, not prerendered servis-ac page");
  }

  return {
    path,
    ok: issues.length === 0,
    status: res.status,
    title: title.slice(0, 80),
    detail: issues.join("; ") || "ok",
  };
}

console.log(`Verifying ${BASE} …\n`);

const results = [];
for (const check of CHECKS) {
  const r = await checkOne(check);
  results.push(r);
  console.log(`${r.ok ? "✓" : "✗"} ${r.path.padEnd(36)} ${r.status}  ${r.detail}`);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${failed.length ? "✗" : "✓"} ${results.length - failed.length}/${results.length} checks passed.`);

if (failed.length) {
  process.exit(1);
}
