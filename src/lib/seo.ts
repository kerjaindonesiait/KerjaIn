import { useEffect } from "react";
import { useLocation } from "react-router";

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "https://kerjaindonesia.com";

export const SITE_NAME = "KerjaIn";

export type PageSeo = {
  title: string;
  description: string;
  robots: string;
  canonicalPath: string;
};

const DEFAULT_SEO: PageSeo = {
  title: `${SITE_NAME} — Cari Tukang & Jasa Rumah di Jakarta`,
  description:
    "KerjaIn menghubungkan kamu dengan tukang terpercaya di Jakarta untuk plumbing, perbaikan rumah, dan pekerjaan darurat. Post kerjaan gratis, bandingkan penawaran, bayar aman.",
  robots: "index, follow",
  canonicalPath: "/",
};

const EXACT_SEO: Record<string, PageSeo> = {
  "/": {
    title: `${SITE_NAME} — Cari Tukang & Jasa Rumah di Jakarta`,
    description:
      "Temukan tukang plumbing, perawatan rumah, dan jasa darurat di Jakarta. Post pekerjaan gratis, terima penawaran, dan bayar dengan aman lewat KerjaIn.",
    robots: "index, follow",
    canonicalPath: "/",
  },
  "/how-it-works": {
    title: `Cara Kerja ${SITE_NAME} — Post Pekerjaan & Pilih Tukang`,
    description:
      "Pelajari cara memposting pekerjaan, menerima penawaran tukang, dan menyelesaikan pembayaran dengan aman di KerjaIn.",
    robots: "index, follow",
    canonicalPath: "/how-it-works",
  },
  "/tasks": {
    title: `Cari Pekerjaan Tukang — ${SITE_NAME} Jakarta`,
    description:
      "Jelajahi pekerjaan terbuka untuk tukang di Jakarta dan sekitarnya. Plumbing, perbaikan rumah, dan layanan darurat.",
    robots: "index, follow",
    canonicalPath: "/tasks",
  },
  "/masuk": {
    title: `Masuk — ${SITE_NAME}`,
    description: "Masuk ke akun KerjaIn untuk mengelola pekerjaan, pesan, dan pembayaran.",
    robots: "noindex, nofollow",
    canonicalPath: "/masuk",
  },
  "/daftar": {
    title: `Daftar — ${SITE_NAME}`,
    description: "Buat akun KerjaIn gratis untuk memposting pekerjaan atau mendaftar sebagai tukang.",
    robots: "noindex, nofollow",
    canonicalPath: "/daftar",
  },
  "/daftar-tukang": {
    title: `Daftar Sebagai Tukang — ${SITE_NAME}`,
    description: "Lengkapi profil tukang, verifikasi identitas, dan mulai terima pekerjaan di Jakarta.",
    robots: "noindex, nofollow",
    canonicalPath: "/daftar-tukang",
  },
  "/post-job": {
    title: `Post Kerjaan — ${SITE_NAME}`,
    description: "Posting pekerjaan rumah atau kantor dan terima penawaran dari tukang terpercaya.",
    robots: "noindex, nofollow",
    canonicalPath: "/post-job",
  },
  "/dasbor-tukang": {
    title: `Dasbor Tukang — ${SITE_NAME}`,
    description: "Kelola penawaran, pekerjaan aktif, dan pesan pelanggan di dasbor tukang KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/dasbor-tukang",
  },
  "/akun": {
    title: `Pengaturan Akun — ${SITE_NAME}`,
    description: "Kelola profil, keamanan, dan preferensi akun KerjaIn kamu.",
    robots: "noindex, nofollow",
    canonicalPath: "/akun",
  },
  "/pesan": {
    title: `Pesan — ${SITE_NAME}`,
    description: "Chat dengan pelanggan atau tukang terkait pekerjaanmu di KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/pesan",
  },
  "/pekerjaan-saya": {
    title: `Pekerjaan Saya — ${SITE_NAME}`,
    description: "Lihat dan kelola pekerjaan yang kamu posting di KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/pekerjaan-saya",
  },
  "/ulasan-saya": {
    title: `Ulasan Saya — ${SITE_NAME}`,
    description: "Lihat ulasan yang kamu berikan untuk tukang di KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/ulasan-saya",
  },
  "/bayar": {
    title: `Pembayaran — ${SITE_NAME}`,
    description: "Selesaikan pembayaran pekerjaan dengan aman di KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/bayar",
  },
  "/lupa-sandi": {
    title: `Lupa Sandi — ${SITE_NAME}`,
    description: "Reset kata sandi akun KerjaIn kamu melalui email.",
    robots: "noindex, nofollow",
    canonicalPath: "/lupa-sandi",
  },
  "/atur-ulang-sandi": {
    title: `Atur Ulang Sandi — ${SITE_NAME}`,
    description: "Buat kata sandi baru untuk akun KerjaIn kamu.",
    robots: "noindex, nofollow",
    canonicalPath: "/atur-ulang-sandi",
  },
  "/verifikasi-email": {
    title: `Verifikasi Email — ${SITE_NAME}`,
    description: "Verifikasi alamat email untuk mengaktifkan akun KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/verifikasi-email",
  },
  "/auth/callback": {
    title: `Masuk — ${SITE_NAME}`,
    description: "Menyelesaikan proses masuk ke KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/auth/callback",
  },
  "/admin": {
    title: `Admin — ${SITE_NAME}`,
    description: "Panel admin KerjaIn.",
    robots: "noindex, nofollow",
    canonicalPath: "/admin",
  },
};

const PRIVATE_PREFIXES = [
  "/akun/",
  "/pesan/",
  "/auth/",
];

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function resolveSeoForPath(pathname: string): PageSeo {
  const path = normalizePath(pathname);

  const exact = EXACT_SEO[path];
  if (exact) return exact;

  if (path.startsWith("/tukang/")) {
    return {
      title: `Profil Tukang — ${SITE_NAME}`,
      description: "Lihat profil, keahlian, dan ulasan tukang terpercaya di KerjaIn Jakarta.",
      robots: "index, follow",
      canonicalPath: path,
    };
  }

  if (PRIVATE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return {
      title: `${SITE_NAME}`,
      description: DEFAULT_SEO.description,
      robots: "noindex, nofollow",
      canonicalPath: path,
    };
  }

  return { ...DEFAULT_SEO, canonicalPath: path };
}

function upsertMeta(
  selector: string,
  createAttrs: Record<string, string>,
  content: string,
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(createAttrs).forEach(([key, value]) => el!.setAttribute(key, value));
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applyPageSeo(seo: PageSeo) {
  const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`;

  document.title = seo.title;
  upsertMeta('meta[name="description"]', { name: "description" }, seo.description);
  upsertMeta('meta[name="robots"]', { name: "robots" }, seo.robots);
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, seo.title);
  upsertMeta('meta[property="og:description"]', { property: "og:description" }, seo.description);
  upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
  upsertMeta('meta[property="og:type"]', { property: "og:type" }, "website");
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, seo.title);
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, seo.description);
  upsertLink("canonical", canonicalUrl);
}

export function usePageSEO(override?: Partial<PageSeo> | null) {
  const { pathname } = useLocation();

  useEffect(() => {
    const base = resolveSeoForPath(pathname);
    const seo: PageSeo = override ? { ...base, ...override } : base;
    applyPageSeo(seo);
  }, [pathname, override?.title, override?.description, override?.robots, override?.canonicalPath]);
}
