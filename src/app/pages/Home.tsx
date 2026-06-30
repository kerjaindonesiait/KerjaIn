import { lazy, Suspense, useState } from "react";
import { Link, Navigate } from "react-router";
import { Search } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { defaultRouteForUser } from "../../lib/defaultRoute";
import { TEXT_MUTED } from "../../lib/accessibleText";

const HomeBelowFold = lazy(() => import("./HomeBelowFold"));

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (user) {
    return <Navigate to={defaultRouteForUser(user)} replace />;
  }

  return (
    <div className="bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <section className="bg-[#172E4D] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          <div className="absolute top-[-100px] right-[-80px] w-[600px] h-[600px] rounded-full bg-[#1D4196]/15 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[20%] w-[400px] h-[400px] rounded-full bg-[#FD6665]/8 blur-3xl" />
          <div className="absolute top-[30%] left-[-100px] w-[300px] h-[300px] rounded-full bg-[#1D4196]/10 blur-3xl" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 min-w-0">
            <h1 className="font-[1000] leading-[0.9] tracking-tight uppercase mb-6">
              <span className="block text-[64px] sm:text-[84px] text-white">Atasi</span>
              <span className="block text-[64px] sm:text-[84px] text-[#FD6665]">Masalah.</span>
              <span className="block text-[64px] sm:text-[84px] text-white">Sekarang.</span>
            </h1>

            <p className="text-white/80 text-[17px] mb-8 max-w-lg leading-relaxed">
              Ceritakan masalahnya, tentukan harga, lalu pilih tukang yang cocok.
            </p>

            <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-2xl max-w-[520px] mb-10 border border-white/20">
              <div className="flex items-center gap-3 flex-1 px-5 py-4">
                <Search size={19} className="shrink-0" style={{ color: TEXT_MUTED }} />
                <input
                  id="hero-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="cth. pipa bocor, saluran mampet…"
                  aria-label="Cari jenis pekerjaan"
                  className="bg-transparent text-[15px] text-[#172E4D] outline-none w-full font-medium placeholder:text-[#627A95]"
                />
              </div>
              <Link
                to="/post-job"
                className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] px-6 py-4 shrink-0 transition-colors"
              >
                Cari tukang
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/post-job" className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] px-7 py-3.5 rounded-full transition-colors">
                Post Kerjaan
              </Link>
              <Link to="/daftar-tukang" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-[14px] px-7 py-3.5 rounded-full transition-colors">
                Daftar jadi tukang
              </Link>
            </div>
          </div>

          <div className="hidden lg:block flex-shrink-0 w-[380px]">
            <div className="relative">
              <div className="flex flex-col gap-3">
                {[
                  { icon: "💧", title: "Pipa bocor – wastafel dapur", price: "Rp 200rb", tag: "⚡ Darurat", tagColor: "text-red-400", offers: "5 penawaran", area: "Jaksel" },
                  { icon: "🔥", title: "Water heater mati – tolong cepat", price: "Rp 400rb", tag: "Segera", tagColor: "text-[#FD6665]", offers: "3 penawaran", area: "Jakpus" },
                  { icon: "🔩", title: "Saluran mampet parah", price: "Rp 180rb", tag: "Terbuka", tagColor: "text-[#20bf6f]", offers: "8 penawaran", area: "Tansel" },
                  { icon: "🔧", title: "Perbaikan umum 4 item", price: "Rp 300rb", tag: "Terbuka", tagColor: "text-[#20bf6f]", offers: "6 penawaran", area: "Bekasi" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl border border-white/30"
                    style={{ transform: `translateX(${i % 2 === 1 ? "20px" : "0px"})` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[28px] shrink-0">{card.icon}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-[13px] text-[#172E4D] leading-snug truncate">{card.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[11px] font-bold ${card.tagColor}`}>{card.tag}</span>
                            <span className="text-[10px]" style={{ color: TEXT_MUTED }}>· {card.offers}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-[15px] text-[#1D4196]">{card.price}</p>
                        <p className="text-[10px]" style={{ color: TEXT_MUTED }}>{card.area}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute -top-3 -right-3 bg-[#20bf6f] text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                9 pekerjaan baru hari ini
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeBelowFold />
      </Suspense>
    </div>
  );
}
