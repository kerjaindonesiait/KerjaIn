import type { Job } from "../types";

export const JAKARTA_AREAS = [
  "Semua area",
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Depok",
  "Tangerang",
  "Tangerang Selatan",
  "Bekasi",
  "Bogor",
] as const;

export type PriceFilter = "all" | "under500" | "500to1000" | "over1000" | "open";
export type SortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "offers";

export const PRICE_SLIDER_MIN = 50_000;
export const PRICE_SLIDER_MAX = 10_000_000;
export const PRICE_SLIDER_STEP = 50_000;

export type PriceRange = { min: number; max: number };

export const DEFAULT_PRICE_RANGE: PriceRange = {
  min: PRICE_SLIDER_MIN,
  max: PRICE_SLIDER_MAX,
};

export function isFullPriceRange(range: PriceRange): boolean {
  return range.min <= PRICE_SLIDER_MIN && range.max >= PRICE_SLIDER_MAX;
}

export function formatPriceShort(n: number): string {
  if (n >= 1_000_000) {
    const jt = n / 1_000_000;
    return Number.isInteger(jt) ? `Rp ${jt}jt` : `Rp ${jt.toFixed(1)}jt`;
  }
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function formatPriceRangeLabel(range: PriceRange): string {
  if (isFullPriceRange(range)) return "Semua Harga";
  return `${formatPriceShort(range.min)} – ${formatPriceShort(range.max)}`;
}

export const PRICE_FILTER_LABELS: Record<PriceFilter, string> = {
  all: "Semua Harga",
  under500: "Di bawah Rp 500rb",
  "500to1000": "Rp 500rb – 1jt",
  over1000: "Di atas Rp 1jt",
  open: "Minta penawaran",
};

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Terbaru",
  oldest: "Terlama",
  price_asc: "Harga terendah",
  price_desc: "Harga tertinggi",
  offers: "Paling banyak penawaran",
};

export const JOB_CATEGORY_FILTERS = [
  { id: "all", label: "Semua kategori" },
  { id: "darurat", label: "Pipa Bocor Darurat" },
  { id: "deteksi", label: "Deteksi Kebocoran" },
  { id: "mampet", label: "Saluran Mampet" },
  { id: "water", label: "Pemanas Air" },
  { id: "pipa", label: "Ganti Pipa" },
  { id: "bathroom", label: "Pasang Kamar Mandi" },
  { id: "maintenance", label: "Perawatan Umum" },
  { id: "handyman", label: "Tukang Serba Bisa" },
  { id: "pintu", label: "Perbaikan Pintu" },
  { id: "talang", label: "Bersih Talang" },
  { id: "keramik", label: "Perbaikan Keramik" },
  { id: "atap", label: "Perawatan Atap" },
] as const;

export type JobCategoryFilter = (typeof JOB_CATEGORY_FILTERS)[number]["id"];

export function areaFilterLabel(area: string) {
  return area === "Semua area" ? "Jakarta & sekitarnya" : area;
}

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  "Jakarta Pusat": { lat: -6.1754, lng: 106.8272 },
  "Jakarta Selatan": { lat: -6.2615, lng: 106.8106 },
  "Jakarta Barat": { lat: -6.1671, lng: 106.7563 },
  "Jakarta Timur": { lat: -6.225, lng: 106.9 },
  "Jakarta Utara": { lat: -6.1384, lng: 106.903 },
  Depok: { lat: -6.4025, lng: 106.7942 },
  Tangerang: { lat: -6.1783, lng: 106.6319 },
  "Tangerang Selatan": { lat: -6.2835, lng: 106.7113 },
  Bekasi: { lat: -6.2383, lng: 106.9756 },
  Bogor: { lat: -6.595, lng: 106.816 },
};

const MAP_BOUNDS = { north: -6.08, south: -6.42, west: 106.62, east: 107.05 };

export const JAKARTA_CENTER = { lat: -6.2088, lng: 106.8456 };

/** Minimum separation between map pins (~400 m at Jakarta latitude). */
const PIN_MIN_SEPARATION_DEG = 0.0036;

/** Area centroid with jitter so pins don't stack. Uses stored coords when available. */
export function getPublicMapCoordinates(job: Job): { lat: number; lng: number } | null {
  let base: { lat: number; lng: number } | undefined;
  if (job.latitude != null && job.longitude != null) {
    base = { lat: job.latitude, lng: job.longitude };
  } else {
    base = AREA_COORDS[job.area];
  }
  if (!base) return null;

  const hash = job.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const latJitter = ((hash % 100) - 50) * 0.00015;
  const lngJitter = (((hash * 7) % 100) - 50) * 0.00015;
  return { lat: base.lat + latJitter, lng: base.lng + lngJitter };
}

/** Spread overlapping pins so markers stay readable on the map. */
export function resolveMapPinPositions(jobs: Job[]): Map<string, { lat: number; lng: number }> {
  const positions = new Map<string, { lat: number; lng: number }>();
  const placed: { lat: number; lng: number }[] = [];
  const ordered = [...jobs].sort((a, b) => a.id.localeCompare(b.id));

  for (const job of ordered) {
    let coord = getPublicMapCoordinates(job);
    if (!coord) continue;

    for (let pass = 0; pass < 10; pass++) {
      for (const other of placed) {
        const dLat = coord.lat - other.lat;
        const dLng = coord.lng - other.lng;
        const dist = Math.hypot(dLat, dLng);
        if (dist >= PIN_MIN_SEPARATION_DEG) continue;

        if (dist < 1e-9) {
          const hash = job.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
          coord = {
            lat: coord.lat + ((hash % 12) - 6) * 0.00035,
            lng: coord.lng + (((hash * 5) % 12) - 6) * 0.00035,
          };
          continue;
        }

        const push = (PIN_MIN_SEPARATION_DEG - dist) * 0.55;
        coord = {
          lat: coord.lat + (dLat / dist) * push,
          lng: coord.lng + (dLng / dist) * push,
        };
      }
    }

    placed.push(coord);
    positions.set(job.id, coord);
  }

  return positions;
}

export function googleMapsAreaSearchUrl(area: string): string {
  const query = encodeURIComponent(`${area}, Jakarta, Indonesia`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function googleMapsSearchUrl(job: Job): string {
  return googleMapsAreaSearchUrl(job.area);
}

export function jobMapPosition(job: Job): { left: string; top: string } | null {
  const coords = getPublicMapCoordinates(job);
  if (!coords) return null;
  return coordsToMapPosition(coords);
}

export function coordsToMapPosition(coords: { lat: number; lng: number }): { left: string; top: string } {
  const { lat, lng } = coords;
  const left = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const top = ((lat - MAP_BOUNDS.north) / (MAP_BOUNDS.south - MAP_BOUNDS.north)) * 100;
  return {
    left: `${Math.min(96, Math.max(4, left))}%`,
    top: `${Math.min(92, Math.max(8, top))}%`,
  };
}

function matchesPriceRange(job: Job, range: PriceRange): boolean {
  if (isFullPriceRange(range)) return true;
  if (job.budgetType === "minta" || job.budgetRaw == null) {
    return range.max >= PRICE_SLIDER_MAX;
  }
  return job.budgetRaw >= range.min && job.budgetRaw <= range.max;
}

export function filterAndSortJobs(
  jobs: Job[],
  opts: {
    area?: string;
    priceRange?: PriceRange;
    sort?: SortOption;
    search?: string;
    category?: string;
  },
): Job[] {
  let list = [...jobs];

  const search = opts.search?.trim().toLowerCase();
  if (search) {
    list = list.filter(
      (j) =>
        j.title.toLowerCase().includes(search) ||
        j.description.toLowerCase().includes(search) ||
        j.area.toLowerCase().includes(search),
    );
  }

  if (opts.category && opts.category !== "all") {
    list = list.filter((j) => j.category === opts.category);
  }

  if (opts.area && opts.area !== "Semua area") {
    list = list.filter((j) => j.area === opts.area);
  }

  if (opts.priceRange && !isFullPriceRange(opts.priceRange)) {
    list = list.filter((j) => matchesPriceRange(j, opts.priceRange!));
  }

  const sort = opts.sort ?? "newest";
  list.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price_asc": {
        const pa = a.budgetRaw ?? Number.MAX_SAFE_INTEGER;
        const pb = b.budgetRaw ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      }
      case "price_desc": {
        const pa = a.budgetRaw ?? -1;
        const pb = b.budgetRaw ?? -1;
        return pb - pa;
      }
      case "offers":
        return (b.offers ?? 0) - (a.offers ?? 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return list;
}
