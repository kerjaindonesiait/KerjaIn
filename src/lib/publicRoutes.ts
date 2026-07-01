/** South Tangerang areas for programmatic servis-ac landing pages. */
export const SERVICE_AREAS = [
  "bsd",
  "serpong",
  "bintaro",
  "alam-sutera",
  "gading-serpong",
  "ciputat",
  "pamulang",
] as const;

export type ServiceArea = (typeof SERVICE_AREAS)[number];

export const AREA_LABELS: Record<ServiceArea, string> = {
  bsd: "BSD",
  serpong: "Serpong",
  bintaro: "Bintaro",
  "alam-sutera": "Alam Sutera",
  "gading-serpong": "Gading Serpong",
  ciputat: "Ciputat",
  pamulang: "Pamulang",
};

export const SITE_URL = "https://kerjaindonesia.com";

/** Paths pre-rendered at build time — keep in sync with sitemap generation. */
export function getPublicPrerenderPaths(): string[] {
  return [
    "/",
    "/how-it-works",
    "/servis-ac",
    "/jasa-tukang",
    ...SERVICE_AREAS.map((area) => `/servis-ac/${area}`),
  ];
}

export function getSitemapUrls(): string[] {
  return getPublicPrerenderPaths();
}
