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
  const latJitter = ((hash % 100) - 50) * 0.00008;
  const lngJitter = (((hash * 7) % 100) - 50) * 0.00008;
  return { lat: base.lat + latJitter, lng: base.lng + lngJitter };
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
  const { lat, lng } = coords;
  const left = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const top = ((lat - MAP_BOUNDS.north) / (MAP_BOUNDS.south - MAP_BOUNDS.north)) * 100;
  return {
    left: `${Math.min(96, Math.max(4, left))}%`,
    top: `${Math.min(92, Math.max(8, top))}%`,
  };
}

function matchesPrice(job: Job, filter: PriceFilter): boolean {
  if (filter === "all") return true;
  if (filter === "open") return job.budgetType === "minta" || job.budgetRaw == null;
  const price = job.budgetRaw ?? 0;
  if (filter === "under500") return price > 0 && price < 500_000;
  if (filter === "500to1000") return price >= 500_000 && price <= 1_000_000;
  if (filter === "over1000") return price > 1_000_000;
  return true;
}

export function filterAndSortJobs(
  jobs: Job[],
  opts: {
    area?: string;
    price?: PriceFilter;
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

  if (opts.price && opts.price !== "all") {
    list = list.filter((j) => matchesPrice(j, opts.price!));
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
