import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../../lib/auth";

const NAV_LINKS = [
  { label: "Lihat Pekerjaan", href: "/tasks" },
  { label: "Cara Kerja", href: "/how-it-works" },
];

const FOOTER_COLS = [
  {
    heading: "Temukan",
    links: ["Cara Kerja", "Cari Pekerjaan", "Panduan Biaya", "Panduan Plumbing", "FAQ Pengguna Baru"],
  },
  {
    heading: "Perusahaan",
    links: ["Tentang Kami", "Karir", "Hubungi Media", "Panduan Komunitas", "Syarat & Ketentuan", "Blog", "Hubungi Kami", "Kebijakan Privasi"],
  },
  {
    heading: "Tautan Cepat",
    links: ["Pasang Pekerjaan", "Lihat Pekerjaan", "Masuk", "Pusat Bantuan"],
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
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTasksPage = location.pathname === "/tasks";

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  const displayName = user?.fullName ?? user?.email?.split("@")[0] ?? "Akun";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8]" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* NAV */}
      <header className="bg-white border-b border-[#f5eded] sticky top-0 z-50">
        <div className="flex items-center h-[57px] px-6 max-w-[1400px] mx-auto w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-5 shrink-0">
            <svg width="108" height="26" viewBox="0 0 108 26" fill="none">
              <text x="0" y="20" fontFamily="Manrope,sans-serif" fontWeight="800" fontSize="20" fill="#2E5090" letterSpacing="-0.3">KerjaIn</text>
            </svg>
          </Link>

          {/* Post a job CTA */}
          <Link
            to="/post-job"
            className="hidden md:flex items-center bg-[#2E5090] text-white text-[13px] font-semibold px-5 py-[7px] rounded-full hover:bg-[#1e3d7a] transition-colors whitespace-nowrap mr-1"
          >
            Pasang Pekerjaan
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center h-full flex-1">
            {NAV_LINKS.map((item) => {
              const active = location.pathname === item.href;
              return (
                <div key={item.label} className="relative h-full flex items-center px-3">
                  {active && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2E5090] rounded-b" />
                  )}
                  <Link
                    to={item.href}
                    className={`text-[13px] font-semibold whitespace-nowrap transition-colors ${
                      active ? "text-[#2E5090]" : "text-[#1a3d5c] hover:text-[#2E5090]"
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
              <>
                {user.role === "technician" && (
                  <Link to="/dasbor-tukang" className="text-[13px] font-semibold text-[#1a3d5c] hover:text-[#2E5090] transition-colors whitespace-nowrap px-2">
                    Dasbor Tukang
                  </Link>
                )}
                <Link to="/akun" className="flex items-center gap-2 text-[13px] font-semibold text-[#1a3d5c] hover:text-[#2E5090] transition-colors">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-[#c8dfd8]" />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-[#2E5090] text-white text-[11px] font-bold flex items-center justify-center">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1a3d5c] hover:text-red-600 transition-colors px-2"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/daftar" className="text-[13px] font-semibold text-[#1a3d5c] hover:text-[#2E5090] transition-colors whitespace-nowrap px-2">
                  Daftar
                </Link>
                <Link to="/masuk" className="bg-[#2E5090] text-white text-[13px] font-semibold px-5 py-[7px] rounded-full hover:bg-[#1e3d7a] transition-colors whitespace-nowrap">
                  Masuk
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden ml-auto p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} className="text-[#1a3d5c]" /> : <Menu size={22} className="text-[#1a3d5c]" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#f5eded] px-6 py-4 flex flex-col gap-3">
            <Link to="/post-job" className="bg-[#2E5090] text-white text-[13px] font-semibold px-5 py-[9px] rounded-full text-center">
              Pasang Pekerjaan
            </Link>
            {NAV_LINKS.map((item) => (
              <Link key={item.label} to={item.href} className="text-[14px] font-semibold text-[#1a3d5c] py-2 border-b border-[#f0f7f4]" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#f0f7f4]">
              {user ? (
                <>
                  <Link to="/akun" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-2">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-[#2E5090] text-white text-[12px] font-bold flex items-center justify-center">
                        {initials}
                      </span>
                    )}
                    <div>
                      <p className="text-[14px] font-bold text-[#1a2d4a]">{displayName}</p>
                      <p className="text-[12px] text-[#7a9a8f]">{user.email}</p>
                    </div>
                  </Link>
                  {user.role === "technician" && (
                    <Link to="/dasbor-tukang" onClick={() => setMobileOpen(false)} className="text-[14px] font-semibold text-[#1a3d5c] py-2 flex items-center gap-2">
                      <UserIcon size={16} /> Dasbor Tukang
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 border border-red-200 text-red-600 font-semibold text-[13px] py-2.5 rounded-full">
                    <LogOut size={15} /> Keluar
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link to="/daftar" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-[#b8d4c8] text-[#1a3d5c] font-semibold text-[13px] py-2 rounded-full hover:border-[#2E5090] hover:text-[#2E5090] transition-all">Daftar</Link>
                  <Link to="/masuk" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-[#2E5090] text-white font-semibold text-[13px] py-2 rounded-full hover:bg-[#1e3d7a] transition-colors">Masuk</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className={`flex-1 ${isTasksPage ? "flex flex-col overflow-hidden" : ""}`}>
        <Outlet />
      </main>

      {/* FOOTER */}
      {!isTasksPage && (
        <footer className="bg-[#1a2d4a] text-white">
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
                <ul className="flex flex-col gap-2">
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
            <svg width="90" height="22" viewBox="0 0 90 22" fill="none">
              <text x="0" y="17" fontFamily="Manrope,sans-serif" fontWeight="800" fontSize="17" fill="white" letterSpacing="-0.2">KerjaIn</text>
            </svg>
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
