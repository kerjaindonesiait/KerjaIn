import { Outlet, Link, useLocation } from "react-router";
import { Suspense, useState } from "react";
import { RouteFallback } from "../components/RouteFallback";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { BrandLogo } from "../components/BrandLogo";
import { PageSEO } from "../components/PageSEO";
import { ScrollToTop } from "../components/ScrollToTop";
import { appShellClass } from "../../lib/layout";

const NAV_LINKS = [
  { label: "Cari Pekerjaan", href: "/tasks" },
  { label: "Cara Kerja", href: "/how-it-works" },
];

const FOOTER_COLS = [
  {
    heading: "Mulai di sini",
    links: ["Cara Kerja", "Cari Pekerjaan", "Panduan Biaya", "Panduan Plumbing", "Pertanyaan Umum"],
  },
  {
    heading: "Perusahaan",
    links: ["Tentang Kami", "Karir", "Hubungi Media", "Panduan Komunitas", "Syarat & Ketentuan", "Blog", "Hubungi Kami", "Kebijakan Privasi"],
  },
  {
    heading: "Tautan Cepat",
    links: ["Post Kerjaan", "Cari Pekerjaan", "Masuk", "Pusat Bantuan"],
  },
  {
    heading: "Layanan Kami",
    links: ["Pipa Bocor Darurat", "Deteksi Kebocoran", "Ganti Pipa", "Saluran Mampet", "Pemanas Air", "Pasang Kamar Mandi", "Perawatan Umum", "Tukang Serba Bisa", "Perbaikan Pintu & Kunci", "Bersih Talang", "Perbaikan Keramik", "Semua Layanan"],
  },
];

const POPULAR_LOCATIONS = [
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
  "Depok", "Tangerang", "Bekasi", "Bogor",
];

export default function Root() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTasksPage = location.pathname === "/tasks";
  const isTechDashboard = location.pathname === "/dasbor-tukang";
  const isChatPage = /^\/pesan\/[^/]+/.test(location.pathname);
  const hideSiteHeader =
    isTechDashboard || (isTasksPage && user?.role === "user");
  const hideSiteFooter = isTasksPage || isTechDashboard || location.pathname.startsWith("/pesan");
  const fullHeightPage = isTasksPage || isTechDashboard || isChatPage;
  const browseJobsHref = user?.role === "technician" ? "/dasbor-tukang" : "/tasks";

  const navHref = (item: (typeof NAV_LINKS)[number]) =>
    item.label === "Cari Pekerjaan" ? browseJobsHref : item.href;

  const navActive = (item: (typeof NAV_LINKS)[number]) => {
    if (item.label === "Cari Pekerjaan") {
      return user?.role === "technician"
        ? location.pathname === "/dasbor-tukang"
        : location.pathname === "/tasks";
    }
    return location.pathname === item.href;
  };

  const displayName = user?.fullName ?? user?.email?.split("@")[0] ?? "Akun";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`flex flex-col bg-[#F7F9FC] ${fullHeightPage ? "h-screen overflow-hidden" : "min-h-screen"}`} style={{ fontFamily: "Manrope, sans-serif" }}>
      <PageSEO />
      <ScrollToTop />
      {/* NAV — hidden on tukang dashboard (uses its own blue header) */}
      {!hideSiteHeader && (
      <header className="bg-white border-b border-[#D8E2F0] sticky top-0 z-50">
        <div className={`flex items-center h-[72px] ${appShellClass}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center mr-5 shrink-0">
            <BrandLogo imgClassName="h-12" />
          </Link>

          {/* Post a job CTA — desktop */}
          <Link
            to="/post-job"
            className="hidden md:flex items-center bg-[#1D4196] text-white text-[13px] font-semibold px-5 py-[7px] rounded-full hover:bg-[#173577] transition-colors whitespace-nowrap mr-1 shrink-0"
          >
            Post Kerjaan
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center h-full flex-1">
            {NAV_LINKS.map((item) => {
              const href = navHref(item);
              const active = navActive(item);
              return (
                <div key={item.label} className="relative h-full flex items-center px-3">
                  {active && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#1D4196] rounded-b" />
                  )}
                  <Link
                    to={href}
                    className={`text-[13px] font-semibold whitespace-nowrap transition-colors ${
                      active ? "text-[#1D4196]" : "text-[#294566] hover:text-[#1D4196]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Right nav */}
          <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto">
            {loading ? null : user ? (
              <Link to="/akun" className="flex items-center gap-2 text-[13px] font-semibold text-[#294566] hover:text-[#1D4196] transition-colors">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-[#D8E2F0]" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-[#1D4196] text-white text-[11px] font-bold flex items-center justify-center">
                    {initials}
                  </span>
                )}
                <span className="max-w-[120px] truncate">{displayName}</span>
              </Link>
            ) : (
              <>
                <Link to="/daftar" className="text-[13px] font-semibold text-[#294566] hover:text-[#1D4196] transition-colors whitespace-nowrap px-2">
                  Daftar
                </Link>
                <Link to="/masuk" className="bg-[#1D4196] text-white text-[13px] font-semibold px-5 py-[7px] rounded-full hover:bg-[#173577] transition-colors whitespace-nowrap">
                  Masuk
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Post Kerjaan + menu */}
          <div className="md:hidden ml-auto flex items-center gap-2 shrink-0">
            <Link
              to="/post-job"
              className="flex items-center bg-[#1D4196] text-white text-[12px] font-semibold px-3.5 py-[7px] rounded-full hover:bg-[#173577] transition-colors whitespace-nowrap shrink-0"
            >
              Post Kerjaan
            </Link>
            <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} className="text-[#294566]" /> : <Menu size={22} className="text-[#294566]" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#D8E2F0] px-6 py-4 flex flex-col gap-3">
            {NAV_LINKS.filter(
              (item) => !(item.label === "Cari Pekerjaan" && navActive(item)),
            ).map((item) => (
              <Link key={item.label} to={navHref(item)} className="text-[14px] font-semibold text-[#294566] py-2 border-b border-[#EEF3FB]" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#EEF3FB]">
              {user ? (
                <Link to="/akun" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-[#1D4196] text-white text-[12px] font-bold flex items-center justify-center">
                      {initials}
                    </span>
                  )}
                  <div>
                    <p className="text-[14px] font-bold text-[#172E4D]">{displayName}</p>
                    <p className="text-[12px] text-[#7890AA]">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex gap-3">
                  <Link to="/daftar" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-[#D8E2F0] text-[#294566] font-semibold text-[13px] py-2 rounded-full hover:border-[#1D4196] hover:text-[#1D4196] transition-all">Daftar</Link>
                  <Link to="/masuk" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-[#1D4196] text-white font-semibold text-[13px] py-2 rounded-full hover:bg-[#173577] transition-colors">Masuk</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      )}

      {/* PAGE CONTENT */}
      <main className={`flex-1 min-h-0 ${fullHeightPage ? "flex flex-col overflow-hidden" : ""}`}>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      {/* FOOTER */}
      {!hideSiteFooter && (
        <footer className="bg-[#172E4D] text-white">
          {/* Popular locations */}
          <div className="border-b border-white/10 px-6 py-8 max-w-[1400px] mx-auto">
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest mb-4">Lokasi Populer di Jakarta</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {POPULAR_LOCATIONS.map((loc) => (
                <a key={loc} href="#" className="text-[13px] text-white/70 hover:text-white transition-colors">{loc}</a>
              ))}
            </div>
          </div>

          {/* Main footer grid */}
          <div className="px-6 py-12 max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {FOOTER_COLS.map((col) => (
              <div key={col.heading}>
                <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/50 mb-4">{col.heading}</h4>
                <ul className={col.heading === "Layanan Kami" ? "grid grid-cols-2 gap-x-6 gap-y-2" : "flex flex-col gap-2"}>
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13px] text-white/70 hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 px-6 py-6 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <BrandLogo variant="dark" imgClassName="h-9" />
            <p className="text-[12px] text-white/40">KerjaIn 2024 ©, Semua hak dilindungi · Jakarta, Indonesia</p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg width="13" height="13" fill="white" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.78 1.52V6.95a4.85 4.85 0 0 1-1.01-.26z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
