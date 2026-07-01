/** Shared public route list — keep in sync with src/lib/publicRoutes.ts */

export const SITE_URL = "https://kerjaindonesia.com";

export const SERVICE_AREAS = [
  "bsd",
  "serpong",
  "bintaro",
  "alam-sutera",
  "gading-serpong",
  "ciputat",
  "pamulang",
];

/** Sitemap + prerender paths */
export const PUBLIC_PATHS = [
  "/",
  "/how-it-works",
  "/servis-ac",
  "/jasa-tukang",
  ...SERVICE_AREAS.map((area) => `/servis-ac/${area}`),
];

/**
 * Prerender assertions — lowercase substring that MUST appear in rendered <title>.
 * `expect` for area slugs uses hyphen→space so "alam-sutera" matches "Alam Sutera".
 */
export const PRERENDER_ROUTES = [
  { path: "/", expect: "kerjain" },
  { path: "/how-it-works", expect: "cara kerja" },
  { path: "/servis-ac", expect: "servis ac" },
  { path: "/jasa-tukang", expect: "jasa tukang" },
  ...SERVICE_AREAS.map((area) => ({
    path: `/servis-ac/${area}`,
    expect: area.replaceAll("-", " "),
  })),
];
