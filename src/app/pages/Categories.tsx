import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronRight, TrendingUp, MapPin, Search } from "lucide-react";
import { tasksUrl } from "../../lib/paths";

const POPULAR_SERVICES = [
  { name: "Pipa Bocor Darurat", jobs: "1.240", emoji: "🚨", from: "#fee2e2", to: "#fecaca", search: "pipa bocor" },
  { name: "Saluran Mampet", jobs: "980", emoji: "🔩", from: "#dbeafe", to: "#bfdbfe", search: "saluran mampet" },
  { name: "Deteksi Kebocoran", jobs: "756", emoji: "💧", from: "#e0f2fe", to: "#bae6fd", search: "deteksi kebocoran" },
  { name: "Pemanas Air", jobs: "612", emoji: "🔥", from: "#fef3c7", to: "#fde68a", search: "pemanas air" },
  { name: "Tukang Serba Bisa", jobs: "540", emoji: "🔧", from: "#d1fae5", to: "#a7f3d0", search: "tukang serba bisa" },
];

const TRENDING_SERVICES = [
  { name: "Waterproofing", growth: "42%", emoji: "🏠", from: "#fce7f3", to: "#fbcfe8", search: "waterproofing" },
  { name: "Bersih Talang", growth: "38%", emoji: "🌧️", from: "#fef9c3", to: "#fef08a", search: "bersih talang" },
  { name: "Pasang Kamar Mandi", growth: "31%", emoji: "🛁", from: "#e0f2fe", to: "#bae6fd", search: "kamar mandi" },
  { name: "Ganti Pipa", growth: "28%", emoji: "🪛", from: "#f0fdf4", to: "#bbf7d0", search: "ganti pipa" },
  { name: "Perbaikan Keramik", growth: "24%", emoji: "🧱", from: "#f5f3ff", to: "#ede9fe", search: "keramik" },
];

const LOCATIONS = [
  { name: "Jakarta Selatan", emoji: "🏙️", from: "#dbeafe", to: "#93c5fd", area: "Jakarta Selatan" },
  { name: "Jakarta Pusat", emoji: "🌆", from: "#fef3c7", to: "#fcd34d", area: "Jakarta Pusat" },
  { name: "Jakarta Barat", emoji: "🌇", from: "#f0fdf4", to: "#86efac", area: "Jakarta Barat" },
  { name: "Depok", emoji: "🏡", from: "#fce7f3", to: "#f9a8d4", area: "Depok" },
  { name: "Tangerang", emoji: "🛣️", from: "#e0f2fe", to: "#7dd3fc", area: "Tangerang" },
];

const CATEGORY_DETAILS = [
  {
    name: "Plumbing Darurat",
    slug: "plumbing-darurat",
    emoji: "🚨",
    from: "#fee2e2",
    to: "#fecaca",
    description: "Pipa pecah, banjir, atau kebocoran parah — tukang ledeng darurat siap datang hari ini di area Jakarta.",
    subcategories: ["Pipa Bocor Darurat", "Kran Patah", "Saluran Meluap", "Water Heater Bocor", "Gas Bocor", "Panggilan 24 Jam"],
  },
  {
    name: "Saluran & Pipa",
    slug: "saluran-pipa",
    emoji: "🔩",
    from: "#dbeafe",
    to: "#bfdbfe",
    description: "Saluran mampet, ganti pipa, relining, dan perbaikan tekanan air untuk rumah & apartemen.",
    subcategories: ["Saluran Mampet", "Ganti Pipa PVC", "Deteksi Kebocoran", "Masalah Tekanan Air", "Relining Pipa", "Perbaikan Saluran Pembuangan"],
  },
  {
    name: "Kamar Mandi & Dapur",
    slug: "kamar-mandi",
    emoji: "🛁",
    from: "#d1fae5",
    to: "#a7f3d0",
    description: "Pasang wastafel, WC, shower, kran mixer, dan perbaikan plumbing kamar mandi atau dapur.",
    subcategories: ["Pasang Wastafel", "Pasang WC", "Pasang Shower", "Perbaikan Kran", "Plumbing Dapur", "Nat & Silikon Kamar Mandi"],
  },
  {
    name: "Pemanas Air",
    slug: "pemanas-air",
    emoji: "🔥",
    from: "#fef3c7",
    to: "#fde68a",
    description: "Instalasi, servis, dan penggantian water heater listrik atau gas di Jakarta & sekitarnya.",
    subcategories: ["Pasang Water Heater", "Servis Pemanas Air", "Ganti Elemen Pemanas", "Perbaikan Termostat", "Cek Kebocoran Tangki"],
  },
  {
    name: "Perawatan Rumah",
    slug: "perawatan-rumah",
    emoji: "🔧",
    from: "#ede9fe",
    to: "#ddd6fe",
    description: "Tukang serba bisa untuk pekerjaan kecil — pintu, talang, keramik, atap, dan perawatan berkala.",
    subcategories: ["Tukang Serba Bisa", "Bersih Talang", "Perbaikan Pintu", "Perbaikan Keramik", "Perawatan Atap", "Waterproofing"],
  },
  {
    name: "Instalasi & Renovasi",
    slug: "instalasi",
    emoji: "🪛",
    from: "#e0f2fe",
    to: "#bae6fd",
    description: "Proyek plumbing untuk renovasi kamar mandi, dapur baru, atau inspeksi rumah sebelum beli.",
    subcategories: ["Renovasi Kamar Mandi", "Instalasi Gas", "Inspeksi Plumbing", "Pasang Pompa Air", "Filter Air Dapur", "Proyek Apartemen"],
  },
];

const ALL_CATEGORIES = CATEGORY_DETAILS.flatMap((c) => [c.name, ...c.subcategories]);

function GradientCard({ from, to, children, className = "" }: { from: string; to: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {children}
    </div>
  );
}

function ServiceCard({ name, stat, emoji, from, to: toColor, label, href }: { name: string; stat: string; emoji: string; from: string; to: string; label: string; href: string }) {
  return (
    <Link to={href} className="group flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white border border-[#c8dfd8] hover:shadow-lg transition-all hover:border-transparent">
      <GradientCard from={from} to={toColor} className="h-[110px] flex items-center justify-center group-hover:brightness-95 transition-all">
        <span className="text-[48px]">{emoji}</span>
      </GradientCard>
      <div className="p-4">
        <p className="font-bold text-[14px] text-[#0f2035] leading-snug mb-0.5">{name}</p>
        <p className="text-[12px] text-[#3d6b5e]">{stat} {label}</p>
      </div>
    </Link>
  );
}

function CategoryCard({ cat }: { cat: typeof CATEGORY_DETAILS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cat.subcategories : cat.subcategories.slice(0, 6);

  return (
    <div id={cat.slug} className="bg-white rounded-2xl border border-[#c8dfd8] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <GradientCard from={cat.from} to={cat.to} className="sm:w-[180px] shrink-0 h-[120px] sm:h-auto flex items-center justify-center">
          <span className="text-[56px]">{cat.emoji}</span>
        </GradientCard>
        <div className="flex-1 p-5">
          <h3 className="font-black text-[17px] text-[#1a2d4a] mb-1.5">
            <Link to={tasksUrl({ search: cat.name })} className="hover:text-[#2E5090] transition-colors">{cat.name}</Link>
          </h3>
          <p className="text-[13px] text-[#3d6b5e] mb-4 leading-relaxed">{cat.description}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mb-3">
            {visible.map((sub) => (
              <li key={sub}>
                <Link to={tasksUrl({ search: sub })} className="text-[13px] text-[#1a3d5c] hover:text-[#2E5090] transition-colors">{sub}</Link>
              </li>
            ))}
          </ul>
          {cat.subcategories.length > 6 && (
            <button onClick={() => setExpanded(!expanded)} className="text-[12px] font-bold text-[#2E5090] hover:underline flex items-center gap-1">
              {expanded ? "Tampilkan lebih sedikit" : `+${cat.subcategories.length - 6} lainnya`}
              <ChevronRight size={13} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const filteredDetails = CATEGORY_DETAILS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subcategories.some((s) => s.toLowerCase().includes(search.toLowerCase())),
  );

  const filteredAlpha = ALL_CATEGORIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  const grouped = filteredAlpha.reduce<Record<string, string[]>>((acc, cat) => {
    const letter = cat[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(cat);
    return acc;
  }, {});

  return (
    <div className="bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <section className="bg-[#1a2d4a] relative overflow-hidden min-h-[240px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-60px] right-[-40px] w-[400px] h-[400px] rounded-full bg-[#2E5090]/20 blur-3xl" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 pt-10 pb-12">
          <div className="flex items-center gap-1.5 text-white/50 text-[13px] mb-6">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight size={13} />
            <span className="text-white">Layanan</span>
          </div>
          <h1 className="font-black text-[44px] sm:text-[52px] leading-tight text-white mb-3">
            Temukan layanan<br className="hidden sm:block" /> di Jakarta & sekitarnya
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-lg">
            Plumbing, perawatan rumah, dan tukang terpercaya — pasang pekerjaan dan terima penawaran dalam hitungan menit.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/post-job" className="bg-[#2E5090] text-white font-bold text-[14px] px-7 py-3 rounded-full hover:bg-[#1e3d7a] transition-colors">
              Pasang pekerjaan
            </Link>
            <Link to="/tasks" className="bg-white/10 border border-white/30 text-white font-bold text-[14px] px-7 py-3 rounded-full hover:bg-white/20 transition-colors">
              Lihat pekerjaan terbuka
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-[1400px] mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-black text-[26px] text-[#1a2d4a]">Layanan populer di Jakarta</h2>
            <p className="text-[#3d6b5e] text-[13px] mt-1">Volume pekerjaan tertinggi 30 hari terakhir</p>
          </div>
          <Link to="/tasks" className="hidden sm:flex items-center gap-1 text-[#2E5090] font-bold text-[13px] hover:underline whitespace-nowrap">
            Lihat semua <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {POPULAR_SERVICES.map((s) => (
            <ServiceCard key={s.name} name={s.name} stat={s.jobs} emoji={s.emoji} from={s.from} to={s.to} label="pekerjaan" href={tasksUrl({ search: s.search })} />
          ))}
        </div>
      </section>

      <section className="py-12 bg-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={20} className="text-[#2E5090]" />
                <h2 className="font-black text-[26px] text-[#1a2d4a]">Layanan naik daun</h2>
              </div>
              <p className="text-[#3d6b5e] text-[13px]">Pertumbuhan terbesar vs. 30 hari sebelumnya</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {TRENDING_SERVICES.map((s) => (
              <Link key={s.name} to={tasksUrl({ search: s.search })} className="group flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white border border-[#c8dfd8] hover:shadow-lg transition-all">
                <GradientCard from={s.from} to={s.to} className="h-[110px] relative flex items-center justify-center group-hover:brightness-95 transition-all">
                  <span className="text-[48px]">{s.emoji}</span>
                  <div className="absolute top-2.5 right-2.5 bg-[#20bf6f] text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <TrendingUp size={9} /> {s.growth}
                  </div>
                </GradientCard>
                <div className="p-4">
                  <p className="font-bold text-[14px] text-[#0f2035]">{s.name}</p>
                  <p className="text-[12px] text-[#20bf6f] font-semibold mt-0.5">↑ {s.growth}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} className="text-[#2E5090]" />
          <h2 className="font-black text-[26px] text-[#1a2d4a]">Lokasi populer</h2>
        </div>
        <p className="text-[#3d6b5e] text-[13px] mb-6">Cari tukang di kota dan wilayah sekitar Jakarta</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {LOCATIONS.map((loc) => (
            <Link key={loc.name} to={tasksUrl({ area: loc.area })} className="group rounded-2xl overflow-hidden aspect-[4/3]">
              <GradientCard from={loc.from} to={loc.to} className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:brightness-95 transition-all">
                <span className="text-[44px]">{loc.emoji}</span>
                <p className="font-black text-[15px] text-[#0f2035] text-center px-2">{loc.name}</p>
              </GradientCard>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-14 bg-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-black text-[30px] text-[#1a2d4a] mb-2">Semua kategori layanan</h2>
          <p className="text-[#3d6b5e] text-[14px] mb-8">Temukan layanan yang tepat untuk pekerjaan rumah Anda</p>

          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-[#b8d4c8] max-w-md mb-10 focus-within:border-[#2E5090] transition-colors shadow-sm">
            <Search size={16} className="text-[#7a9a8f] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari layanan…"
              className="bg-transparent text-[14px] text-[#1a3d5c] placeholder-[#7a9a8f] outline-none w-full"
            />
          </div>

          {!search && (
            <div className="bg-white rounded-2xl border border-[#c8dfd8] p-6 mb-10">
              {Object.entries(grouped).sort().map(([letter, cats]) => (
                <div key={letter} className="flex gap-x-2 gap-y-0 items-baseline flex-wrap mb-3 last:mb-0">
                  <span className="font-black text-[13px] text-[#2E5090] w-5 shrink-0">{letter}</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {cats.map((cat) => (
                      <Link key={cat} to={tasksUrl({ search: cat })} className="text-[13px] text-[#1a3d5c] hover:text-[#2E5090] transition-colors">
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {(search ? filteredDetails : CATEGORY_DETAILS).map((cat) => (
              <CategoryCard key={cat.slug} cat={cat} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#3d6b5e] text-[13px] mb-4">Tidak menemukan yang Anda cari?</p>
            <Link to="/post-job" className="inline-flex items-center gap-2 bg-[#2E5090] text-white font-bold text-[14px] px-7 py-3 rounded-full hover:bg-[#1e3d7a] transition-colors">
              Pasang pekerjaan kustom <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
