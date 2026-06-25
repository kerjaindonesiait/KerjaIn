import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Shield, CheckCircle, ChevronRight, Star, ArrowRight } from "lucide-react";
import { tasksUrl } from "../../lib/paths";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES_ROW1 = [
  { label: "Pipa Bocor Darurat",   desc: "Pipa pecah & banjir 24/7" },
  { label: "Deteksi Kebocoran",    desc: "Cari & perbaiki kebocoran" },
  { label: "Saluran Mampet",       desc: "Saluran buntu hari ini" },
  { label: "Pemanas Air",          desc: "Pasang, perbaiki & ganti" },
  { label: "Ganti Pipa",           desc: "Pipa lama diganti tuntas" },
  { label: "Pasang Kamar Mandi",   desc: "Kran, WC, shower & wastafel" },
  { label: "Tukang Serba Bisa",    desc: "Pekerjaan kecil & pasang" },
  { label: "Bersih Talang",        desc: "Talang mampet dibersihkan" },
];

const SERVICES_ROW2 = [
  { label: "Perbaikan Keramik",    desc: "Keramik retak ditambal" },
  { label: "Perawatan Atap",       desc: "Perbaikan atap kecil" },
  { label: "Perawatan Umum",       desc: "Perawatan & perbaikan rumah" },
  { label: "Perbaikan Pintu",      desc: "Pintu macet, kunci rusak" },
  { label: "Instalasi Gas",        desc: "Pemasangan & pengecekan gas" },
  { label: "Waterproofing",        desc: "Anti bocor dinding & atap" },
  { label: "Inspeksi Properti",    desc: "Cek kondisi rumah menyeluruh" },
  { label: "Cat & Dempul",         desc: "Perbaikan cat & tembok" },
];

const TASK_TABS = [
  { id: "plumbing",     label: "Plumbing" },
  { id: "maintenance",  label: "Perawatan" },
  { id: "darurat",      label: "Darurat" },
  { id: "kamar-mandi",  label: "Kamar Mandi" },
  { id: "lainnya",      label: "Lainnya" },
];

const COMPLETED_TASKS: Record<string, {
  avatar: string; color: string; category: string;
  title: string; price: string; rating: number; area: string;
}[]> = {
  plumbing: [
    { avatar: "RK", color: "#2E5090", category: "Pipa Bocor",       title: "Pipa utama bocor – banjir dapur",         price: "Rp 480rb", rating: 5, area: "Jaksel" },
    { avatar: "DM", color: "#6c47d9", category: "Deteksi Kebocoran", title: "Temukan kebocoran tersembunyi di dinding", price: "Rp 220rb", rating: 5, area: "Jakpus" },
    { avatar: "BW", color: "#e85d26", category: "Ganti Pipa",        title: "Ganti pipa PVC kamar mandi belakang",     price: "Rp 310rb", rating: 4, area: "Depok" },
    { avatar: "HS", color: "#20bf6f", category: "Kran Bocor",        title: "Kran dapur menetes – ganti washer",       price: "Rp 140rb", rating: 5, area: "Jakbar" },
    { avatar: "YS", color: "#f59e0b", category: "Saluran",           title: "Pasang kran outdoor taman belakang",      price: "Rp 280rb", rating: 5, area: "Tansel" },
    { avatar: "CN", color: "#14b8a6", category: "Kloset",            title: "Kloset terus mengalir ganti katup",       price: "Rp 160rb", rating: 4, area: "Jaktim" },
  ],
  maintenance: [
    { avatar: "LF", color: "#8b5cf6", category: "Perbaikan Pintu",   title: "Pintu depan tidak bisa menutup rapat",    price: "Rp 130rb", rating: 5, area: "Depok" },
    { avatar: "MR", color: "#2E5090", category: "Bersih Talang",     title: "Bersih talang 2 lantai depan & belakang", price: "Rp 290rb", rating: 5, area: "Jakut" },
    { avatar: "WP", color: "#6c47d9", category: "Tukang",            title: "Beberapa pekerjaan kecil sekaligus",      price: "Rp 270rb", rating: 5, area: "Bekasi" },
    { avatar: "FD", color: "#20bf6f", category: "Silikon",           title: "Pasang ulang silikon shower & bak mandi", price: "Rp 150rb", rating: 4, area: "Jaksel" },
    { avatar: "PH", color: "#e85d26", category: "Keramik",           title: "Tambal 3 keramik kamar mandi retak",      price: "Rp 200rb", rating: 5, area: "Jakpus" },
    { avatar: "AN", color: "#f59e0b", category: "Atap",              title: "Atap bocor – area kecil kamar tidur",     price: "Rp 380rb", rating: 5, area: "Bogor" },
  ],
  darurat: [
    { avatar: "RK", color: "#2E5090", category: "Darurat",           title: "Pipa pecah tengah malam – banjir",        price: "Rp 550rb", rating: 5, area: "Jaksel" },
    { avatar: "TW", color: "#e85d26", category: "Darurat",           title: "Air tidak mengalir sama sekali",          price: "Rp 350rb", rating: 5, area: "Tansel" },
    { avatar: "AP", color: "#6c47d9", category: "Darurat",           title: "Water heater meledak – ganti unit",       price: "Rp 900rb", rating: 5, area: "Jakbar" },
    { avatar: "BS", color: "#20bf6f", category: "Darurat",           title: "Saluran pembuangan meluap",               price: "Rp 400rb", rating: 4, area: "Bekasi" },
    { avatar: "DM", color: "#14b8a6", category: "Darurat",           title: "Kran patah air terus keluar",             price: "Rp 320rb", rating: 5, area: "Jakpus" },
    { avatar: "HS", color: "#8b5cf6", category: "Darurat",           title: "Gas bocor – cek & perbaiki segera",       price: "Rp 480rb", rating: 5, area: "Jaktim" },
  ],
  "kamar-mandi": [
    { avatar: "BS", color: "#8b5cf6", category: "Kamar Mandi",       title: "Pasang wastafel & kran mixer baru",       price: "Rp 620rb", rating: 5, area: "Jakbar" },
    { avatar: "YS", color: "#2E5090", category: "Kamar Mandi",       title: "Ganti shower head & sealant shower",      price: "Rp 240rb", rating: 5, area: "Tansel" },
    { avatar: "PH", color: "#e85d26", category: "Kamar Mandi",       title: "Pasang WC duduk baru lengkap",            price: "Rp 750rb", rating: 4, area: "Depok" },
    { avatar: "CN", color: "#20bf6f", category: "Kamar Mandi",       title: "Perbaiki shower mampet & tekanan lemah",  price: "Rp 200rb", rating: 5, area: "Jaksel" },
    { avatar: "LF", color: "#6c47d9", category: "Kamar Mandi",       title: "Pasang kaca cermin & lemari kamar mandi", price: "Rp 430rb", rating: 5, area: "Jakpus" },
    { avatar: "FD", color: "#f59e0b", category: "Kamar Mandi",       title: "Nat keramik kamar mandi difilling ulang",  price: "Rp 180rb", rating: 4, area: "Bekasi" },
  ],
  lainnya: [
    { avatar: "WP", color: "#14b8a6", category: "Inspeksi",          title: "Inspeksi plumbing rumah baru beli",       price: "Rp 450rb", rating: 5, area: "Jakut" },
    { avatar: "MR", color: "#2E5090", category: "Gas",               title: "Pasang instalasi gas untuk kompor baru",  price: "Rp 380rb", rating: 5, area: "Jaksel" },
    { avatar: "AN", color: "#8b5cf6", category: "Waterproofing",     title: "Anti bocor dinding kamar mandi",          price: "Rp 560rb", rating: 5, area: "Tansel" },
    { avatar: "TW", color: "#e85d26", category: "Cat",               title: "Tambal & cat ulang tembok lembab",        price: "Rp 340rb", rating: 4, area: "Bekasi" },
    { avatar: "AP", color: "#6c47d9", category: "Pompa Air",         title: "Ganti pompa air otomatis rumah",          price: "Rp 580rb", rating: 5, area: "Depok" },
    { avatar: "BW", color: "#20bf6f", category: "Filter",            title: "Pasang filter air di dapur",              price: "Rp 290rb", rating: 5, area: "Jakbar" },
  ],
};

const PROS = [
  { name: "Andi S.", initials: "AS", color: "#2E5090", rating: 5.0, reviews: 134, completion: 98, specialty: "pipa bocor darurat, deteksi kebocoran & pemanas air", review: "Andi datang dalam satu jam saat pipa pecah tengah malam. Benar-benar penyelamat — profesional, cepat dan harga wajar.", reviewer: "Rina K." },
  { name: "Budi H.", initials: "BH", color: "#6c47d9", rating: 4.9, reviews: 211, completion: 96, specialty: "perawatan umum, tukang serba bisa & perbaikan pintu",       review: "Budi menyelesaikan tiga masalah yang sudah lama saya tunda, semuanya dalam satu kunjungan. Komunikasi bagus dan kerja rapi.", reviewer: "Dewi S." },
  { name: "Reza M.", initials: "RM", color: "#e85d26", rating: 4.8, reviews: 89,  completion: 95, specialty: "saluran mampet, ganti pipa & pemasangan kamar mandi",        review: "Saluran mampet parah dan Reza beres hari itu juga. Penjelasannya jelas dan tempat ditinggal bersih.", reviewer: "Tono W." },
  { name: "Sari P.", initials: "SP", color: "#20bf6f", rating: 5.0, reviews: 57,  completion: 100, specialty: "perbaikan keramik, bersih talang & perawatan atap",         review: "Sari memasang ulang silikon kamar mandi kami dan hasilnya seperti baru. Tepat waktu, profesional dan harga sangat terjangkau.", reviewer: "Hana A." },
];

const ARTICLES = [
  { title: "5 tanda rumah Anda mengalami kebocoran air tersembunyi", category: "Tips Plumbing", emoji: "💧", from: "#dbeafe", to: "#bfdbfe" },
  { title: "Cara memilih water heater yang tepat untuk rumah Anda",  category: "Panduan Perawatan", emoji: "🔥", from: "#fee2e2", to: "#fecaca" },
  { title: "10 perawatan rumah yang wajib dilakukan setiap tahun",   category: "Perawatan Rumah", emoji: "🏠", from: "#d1fae5", to: "#a7f3d0" },
];

const SERVICE_TABS = ["Plumbing", "Perawatan Umum", "Panduan Biaya", "Panduan Cara", "Checklist"];
const SERVICE_LINKS: Record<string, string[]> = {
  "Plumbing": ["Perbaikan Pipa Pecah","Saluran Mampet","Tukang Ledeng Darurat","Pemasangan Gas","Perbaikan Pemanas Air","Pasang Pemanas Air","Deteksi Kebocoran","Relining Pipa","Ganti Pipa","Perbaikan Kran","Pasang Kran","Perbaikan WC","Pasang WC","Perbaikan Shower","Pasang Wastafel","Plumbing Kamar Mandi","Plumbing Dapur","Perbaikan Saluran Pembuangan","Masalah Tekanan Air"],
  "Perawatan Umum": ["Tukang Serba Bisa","Perbaikan Pintu","Perbaikan Kunci","Ganti Engsel","Bersih Talang","Inspeksi Atap","Perbaikan Keramik & Nat","Pengapuran","Aplikasi Sealant","Perbaikan Pagar","Perbaikan Kasa Nyamuk","Perbaikan Jendela","Kedap Air","Perawatan Properti"],
  "Panduan Biaya": ["Biaya Tukang Ledeng Darurat","Biaya Buka Saluran Mampet","Biaya Pemanas Air","Biaya Ganti Pipa","Biaya Pasang Kran","Biaya Pasang WC","Biaya Deteksi Kebocoran","Biaya Plumbing Kamar Mandi","Biaya Tukang Serba Bisa","Biaya Bersih Talang","Biaya Perbaikan Keramik"],
  "Panduan Cara": ["Cara Perbaiki Kran Bocor","Cara Buka Saluran Mampet","Cara Kuras Pemanas Air","Cara Temukan Kebocoran Air","Cara Perbaiki Nat Keramik","Cara Bersih Talang dengan Aman","Cara Rawat Atap","Cara Perbaiki WC Terus Mengalir","Cara Pasang Silikon Shower"],
  "Checklist": ["Checklist Plumbing Tahunan","Checklist Perawatan Pra-Hujan","Checklist Plumbing Rumah Baru","Checklist Perawatan Kamar Mandi","Checklist Perawatan Dapur","Checklist Perawatan Rumah Musiman","Checklist Pra-Jual Properti"],
};

// ─── Animations (injected once) ───────────────────────────────────────────────

const SCROLL_CSS = `
  @keyframes kj-left  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
  @keyframes kj-right { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
  .kj-row1 { animation: kj-left  32s linear infinite; }
  .kj-row2 { animation: kj-right 28s linear infinite; }
  .kj-row1:hover, .kj-row2:hover { animation-play-state: paused; }
  @keyframes kj-tasks { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .kj-tasks { animation: kj-tasks 36s linear infinite; }
  .kj-tasks:hover { animation-play-state: paused; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({ label, desc }: { label: string; desc: string }) {
  return (
    <Link
      to={tasksUrl({ search: label })}
      className="flex-shrink-0 bg-white rounded-2xl border border-[#c8dfd8] px-5 py-4 min-w-[200px] hover:border-[#2E5090] hover:shadow-sm transition-all cursor-pointer group block"
    >
      <div className="w-6 h-1 rounded-full bg-[#2E5090] mb-3 group-hover:w-10 transition-all duration-300" />
      <p className="font-bold text-[14px] text-[#1a2d4a] mb-1 group-hover:text-[#2E5090] transition-colors">{label}</p>
      <p className="text-[12px] text-[#3d6b5e] leading-snug">{desc}</p>
    </Link>
  );
}

function TaskCard({ t }: { t: typeof COMPLETED_TASKS["plumbing"][0] }) {
  return (
    <div className="flex-shrink-0 w-[220px] bg-white rounded-2xl border border-[#c8dfd8] p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-[13px] shrink-0" style={{ background: t.color }}>
          {t.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#7a9a8f] uppercase tracking-wider">{t.category}</p>
          <div className="flex">
            {[1,2,3,4,5].map((i) => (
              <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= t.rating ? "#f59e0b" : "#e5e7eb"}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="font-semibold text-[13px] text-[#1a2d4a] leading-snug mb-2 line-clamp-2">{t.title}</p>
      <div className="flex items-center justify-between">
        <span className="font-black text-[15px] text-[#2E5090]">{t.price}</span>
        <span className="text-[11px] text-[#7a9a8f] bg-[#F5F1E8] px-2 py-0.5 rounded-full">{t.area}</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const [taskTab, setTaskTab] = useState("plumbing");
  const [activeTab, setActiveTab] = useState("Plumbing");
  const [searchQuery, setSearchQuery] = useState("");

  const tasks = COMPLETED_TASKS[taskTab] ?? [];

  const goSearch = () => {
    navigate(tasksUrl({ search: searchQuery }));
  };

  return (
    <div className="bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <style>{SCROLL_CSS}</style>

      {/* ── HERO ── */}
      <section className="bg-[#1a2d4a] relative overflow-hidden">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-100px] right-[-80px] w-[600px] h-[600px] rounded-full bg-[#2E5090]/15 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[20%] w-[400px] h-[400px] rounded-full bg-[#F59E42]/8 blur-3xl" />
          <div className="absolute top-[30%] left-[-100px] w-[300px] h-[300px] rounded-full bg-[#2E5090]/10 blur-3xl" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12">

          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-[13px] text-white/80 font-semibold mb-7">
              <span className="w-2 h-2 rounded-full bg-[#F59E42] animate-pulse" />
              Tukang Plumbing & Perawatan Rumah · Jakarta
            </div>

            <h1 className="font-black leading-[0.92] tracking-tight uppercase mb-6">
              <span className="block text-[64px] sm:text-[84px] text-white">Atasi</span>
              <span className="block text-[64px] sm:text-[84px] text-[#F59E42]">Masalah.</span>
              <span className="block text-[64px] sm:text-[84px] text-white">Sekarang.</span>
            </h1>

            <p className="text-white/60 text-[17px] mb-8 max-w-lg leading-relaxed">
              Pasang pekerjaan. Pilih tukang terbaik. Beres.
            </p>

            {/* Search */}
            <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-2xl max-w-[520px] mb-10 border border-white/20">
              <div className="flex items-center gap-3 flex-1 px-5 py-4">
                <Search size={19} className="text-[#7a9a8f] shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goSearch()}
                  placeholder="cth. pipa bocor, saluran mampet…"
                  className="bg-transparent text-[15px] text-[#0f2035] placeholder-[#7a9a8f] outline-none w-full font-medium"
                />
              </div>
              <button
                type="button"
                onClick={goSearch}
                className="bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[14px] px-6 py-4 shrink-0 transition-colors"
              >
                Cari Tukang
              </button>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/post-job" className="bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[14px] px-7 py-3.5 rounded-full transition-colors">
                Pasang pekerjaan gratis
              </Link>
              <Link to="/daftar-tukang" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-[14px] px-7 py-3.5 rounded-full transition-colors">
                Daftar sebagai Tukang
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
              {[
                { value: "50K+",   label: "Pekerjaan selesai" },
                { value: "2.000+", label: "Tukang terverifikasi" },
                { value: "4,9★",   label: "Rating rata-rata" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-black text-[30px] text-white leading-none">{s.value}</p>
                  <p className="text-white/50 text-[13px] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating task feed */}
          <div className="hidden lg:block flex-shrink-0 w-[380px]">
            <div className="relative">
              {/* Main card stack */}
              <div className="flex flex-col gap-3">
                {/* Open job cards */}
                {[
                  { icon: "💧", title: "Pipa bocor – wastafel dapur", price: "Rp 200rb", tag: "⚡ Darurat", tagColor: "text-red-400", offers: "5 penawaran", area: "Jaksel" },
                  { icon: "🔥", title: "Water heater mati – tolong cepat", price: "Rp 400rb", tag: "Segera", tagColor: "text-[#F59E42]", offers: "3 penawaran", area: "Jakpus" },
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
                          <p className="font-bold text-[13px] text-[#1a2d4a] leading-snug truncate">{card.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[11px] font-bold ${card.tagColor}`}>{card.tag}</span>
                            <span className="text-[10px] text-[#7a9a8f]">· {card.offers}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-[15px] text-[#2E5090]">{card.price}</p>
                        <p className="text-[10px] text-[#7a9a8f]">{card.area}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-[#20bf6f] text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                9 pekerjaan baru hari ini
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEE WHAT OTHERS HAVE DONE ── */}
      <section className="py-16 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-8">
          <h2 className="font-black text-[32px] text-[#1a2d4a] mb-1">Lihat apa yang pernah dikerjakan</h2>
          <p className="text-[#3d6b5e] text-[15px]">Pekerjaan nyata yang telah diselesaikan oleh tukang terpercaya di Jakarta</p>
        </div>

        {/* Tab selector */}
        <div className="max-w-[1400px] mx-auto px-6 mb-6 flex gap-2 flex-wrap">
          {TASK_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTaskTab(tab.id)}
              className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                taskTab === tab.id
                  ? "bg-[#1a2d4a] text-white"
                  : "bg-[#f0f7f4] text-[#3d6b5e] hover:bg-[#ffe0e0] hover:text-[#2E5090]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrolling task cards */}
        <div className="overflow-hidden">
          <div className="kj-tasks flex gap-4 w-max px-6">
            {[...tasks, ...tasks].map((t, i) => (
              <TaskCard key={i} t={t} />
            ))}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 mt-7">
          <Link to="/tasks" className="inline-flex items-center gap-2 text-[#2E5090] font-bold text-[14px] hover:underline">
            Lihat semua pekerjaan <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-6 bg-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="font-black text-[38px] leading-tight text-[#1a2d4a] mb-4">
              Pasang pekerjaan<br />dalam hitungan menit
            </h2>
            <p className="text-[#3d6b5e] text-[16px] mb-10">
              Tidak perlu menunggu lama atau menelepon sana-sini. Pasang pekerjaan dan biarkan tukang terpercaya menghubungi Anda.
            </p>

            <div className="flex flex-col gap-7 mb-10">
              {[
                { n: "1", title: "Jelaskan masalahnya",          desc: "Ceritakan apa yang perlu diperbaiki — kran bocor, saluran mampet, atau perawatan umum. Tambahkan foto jika ada." },
                { n: "2", title: "Tentukan anggaran",             desc: "Tetapkan harga Anda atau minta tukang mengajukan penawaran. Anggaran bisa disesuaikan kapan saja." },
                { n: "3", title: "Pilih tukang & masalah beres",  desc: "Tinjau profil, rating, dan ulasan nyata. Terima penawaran terbaik dan tukang akan datang ke lokasi Anda." },
              ].map((step) => (
                <div key={step.n} className="flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#2E5090] flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-[#2E5090]/30">
                    <span className="text-white font-black text-[15px]">{step.n}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[16px] text-[#1a2d4a] mb-1">{step.title}</p>
                    <p className="text-[#3d6b5e] text-[14px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/post-job" className="inline-flex items-center gap-2 bg-[#2E5090] text-white font-bold text-[15px] px-8 py-4 rounded-full hover:bg-[#1e3d7a] transition-colors shadow-lg shadow-[#2E5090]/30">
              Pasang pekerjaan gratis <ArrowRight size={16} />
            </Link>
          </div>

          {/* Visual mock UI */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-[#c8dfd8] overflow-hidden">
              {/* Header */}
              <div className="bg-[#1a2d4a] px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2E5090] flex items-center justify-center text-white font-black text-[12px]">RK</div>
                <div>
                  <p className="font-bold text-[13px] text-white">Kran bocor – dapur</p>
                  <p className="text-[11px] text-white/50">Dipasang 5 menit lalu · Jakarta Selatan</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[11px] font-black text-[#20bf6f] bg-[#20bf6f]/20 px-2.5 py-1 rounded-full">Terbuka</span>
                </div>
              </div>

              {/* Offers */}
              <div className="px-5 py-4">
                <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider mb-3">3 penawaran masuk</p>
                {[
                  { name: "Andi S.", color: "#2E5090", price: "Rp 130rb", time: "Bisa dalam 30 menit", stars: 5 },
                  { name: "Reza M.", color: "#e85d26", price: "Rp 150rb", time: "Bisa hari ini",       stars: 5 },
                  { name: "Budi H.", color: "#6c47d9", price: "Rp 175rb", time: "Bisa besok pagi",     stars: 5 },
                ].map((offer) => (
                  <div key={offer.name} className="flex items-center gap-3 py-3 border-b border-[#f5eded] last:border-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[12px] shrink-0" style={{ background: offer.color }}>
                      {offer.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[13px] text-[#1a2d4a]">{offer.name}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((i) => (
                            <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#3d6b5e]">{offer.time}</p>
                    </div>
                    <p className="font-black text-[14px] text-[#2E5090] shrink-0">{offer.price}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5">
                <div className="bg-[#2E5090] text-white text-[13px] font-bold text-center py-3 rounded-xl cursor-pointer hover:bg-[#1e3d7a] transition-colors">
                  Terima penawaran Andi S.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-16 px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="lg:w-[380px] shrink-0">
            <h2 className="font-black text-[36px] leading-tight text-[#1a2d4a] mb-4">
              Setiap tukang sudah terverifikasi untuk keamanan Anda
            </h2>
            <p className="text-[#3d6b5e] text-[15px] mb-6">Kami tidak sembarangan menerima tukang. Setiap plumber dan tukang perawatan di KerjaIn sudah diverifikasi, dinilai, dan diasuransikan.</p>
            <Link to="/tasks" className="inline-flex items-center gap-2 bg-[#2E5090] text-white font-bold text-[14px] px-7 py-3.5 rounded-full hover:bg-[#1e3d7a] transition-colors">
              Temukan tukang terverifikasi <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: <Shield size={24} className="text-[#2E5090]" />, title: "Pembayaran aman",       desc: "Uang Anda ditahan dengan aman dan hanya dicairkan ke tukang setelah Anda mengonfirmasi pekerjaan selesai." },
              { icon: <Star size={24} className="text-[#2E5090]" />,   title: "Ulasan terverifikasi", desc: "Setiap bintang berasal dari pekerjaan plumbing atau perawatan nyata yang sudah selesai — tidak ada ulasan palsu." },
              { icon: <CheckCircle size={24} className="text-[#2E5090]" />, title: "Berlisensi & diasuransikan", desc: "Tukang plumbing membawa lisensi yang relevan. Asuransi tanggung jawab umum tersedia untuk pekerjaan yang memenuhi syarat." },
            ].map((item) => (
              <div key={item.title} className="bg-[#F5F1E8] rounded-2xl p-6 border border-[#c8dfd8]">
                <div className="w-12 h-12 rounded-xl bg-[#f0f7f4] flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-[16px] text-[#1a2d4a] mb-2">{item.title}</h3>
                <p className="text-[13px] text-[#3d6b5e] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BE YOUR OWN BOSS ── */}
      <section className="py-0 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-[520px]">

          {/* Left — text */}
          <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-16">
            <h2 className="font-black text-[48px] sm:text-[56px] leading-tight text-[#1a2d4a] mb-5">
              Jadilah bos<br />kamu sendiri
            </h2>
            <p className="text-[#3d6b5e] text-[16px] mb-8 max-w-md leading-relaxed">
              Apakah kamu seorang tukang ledeng berpengalaman atau ahli perawatan rumah, temukan pekerjaan berikutnya di KerjaIn.
            </p>

            <ul className="flex flex-col gap-3.5 mb-10">
              {[
                "Akses gratis ke ribuan peluang pekerjaan",
                "Tanpa biaya berlangganan atau kredit",
                "Raih penghasilan tambahan dengan jadwal fleksibel",
                "Kembangkan bisnis dan basis klien Anda",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-[#1a2d4a]">
                  <div className="w-5 h-5 rounded-full bg-[#2E5090] flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div>
              <Link
                to="/daftar-tukang"
                className="inline-flex items-center gap-2 border-2 border-[#1a2d4a] text-[#1a2d4a] font-bold text-[15px] px-8 py-3.5 rounded-full hover:bg-[#1a2d4a] hover:text-white transition-all"
              >
                Daftar sebagai Tukang
              </Link>
            </div>
          </div>

          {/* Right — dark panel with floating cards */}
          <div className="relative lg:w-[520px] shrink-0 bg-[#1a2d4a] flex items-end justify-center overflow-hidden min-h-[400px] lg:min-h-0">

            {/* Background texture rings */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute bottom-[-80px] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
              <div className="absolute bottom-[-40px] left-[50%] -translate-x-1/2 w-[380px] h-[380px] rounded-full border border-white/8" />
              <div className="absolute bottom-[20px] left-[50%] -translate-x-1/2 w-[260px] h-[260px] rounded-full border border-white/10" />
            </div>

            {/* Silhouette illustration */}
            <div className="relative z-10 flex items-end justify-center w-full h-full pt-12 pb-0">
              <svg viewBox="0 0 320 400" width="320" height="400" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                {/* Body */}
                <ellipse cx="160" cy="390" rx="90" ry="18" fill="#0d0404" opacity="0.5"/>
                {/* Legs */}
                <rect x="130" y="300" width="28" height="90" rx="14" fill="#2d5a8e"/>
                <rect x="162" y="300" width="28" height="90" rx="14" fill="#2d5a8e"/>
                {/* Shoes */}
                <rect x="120" y="376" width="46" height="16" rx="8" fill="#1a1a2e"/>
                <rect x="154" y="376" width="46" height="16" rx="8" fill="#1a1a2e"/>
                {/* Torso — blue overalls */}
                <rect x="115" y="190" width="90" height="120" rx="20" fill="#3b7dd8"/>
                {/* Overall straps */}
                <rect x="135" y="168" width="16" height="32" rx="8" fill="#3b7dd8"/>
                <rect x="169" y="168" width="16" height="32" rx="8" fill="#3b7dd8"/>
                {/* Overall bib */}
                <rect x="133" y="190" width="54" height="40" rx="6" fill="#2d6bc4"/>
                {/* Arms */}
                <rect x="78" y="195" width="42" height="22" rx="11" fill="#e8a87c" transform="rotate(-15 78 195)"/>
                <rect x="202" y="190" width="42" height="22" rx="11" fill="#e8a87c" transform="rotate(20 202 190)"/>
                {/* Hand holding wrench */}
                <circle cx="72" cy="225" r="12" fill="#e8a87c"/>
                <rect x="56" y="218" width="6" height="30" rx="3" fill="#888" transform="rotate(-20 56 218)"/>
                <rect x="46" y="215" width="20" height="7" rx="3" fill="#888" transform="rotate(-20 46 215)"/>
                {/* Neck */}
                <rect x="148" y="158" width="24" height="34" rx="12" fill="#e8a87c"/>
                {/* Head */}
                <ellipse cx="160" cy="140" rx="38" ry="44" fill="#e8a87c"/>
                {/* Hair */}
                <ellipse cx="160" cy="105" rx="36" ry="18" fill="#3d2000"/>
                <ellipse cx="132" cy="120" rx="14" ry="22" fill="#3d2000"/>
                <ellipse cx="188" cy="120" rx="14" ry="22" fill="#3d2000"/>
                {/* Face — smile */}
                <path d="M148 150 Q160 162 172 150" stroke="#c47a5a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Eyes */}
                <ellipse cx="148" cy="138" rx="5" ry="6" fill="#3d2000"/>
                <ellipse cx="172" cy="138" rx="5" ry="6" fill="#3d2000"/>
                {/* Eye shine */}
                <circle cx="150" cy="136" r="2" fill="white"/>
                <circle cx="174" cy="136" r="2" fill="white"/>
                {/* Pocket on overalls */}
                <rect x="143" y="230" width="34" height="24" rx="5" fill="#2d6bc4" stroke="#1e56aa" strokeWidth="1"/>
                {/* Tool in pocket */}
                <rect x="152" y="225" width="5" height="14" rx="2" fill="#aaa"/>
                <rect x="160" y="223" width="5" height="16" rx="2" fill="#f59e0b"/>
              </svg>
            </div>

            {/* Floating card — Payment received (top right) */}
            <div className="absolute top-8 right-6 bg-white rounded-2xl shadow-2xl px-5 py-4 w-[210px]">
              <p className="text-[11px] font-bold text-[#7a9a8f] mb-2">Pembayaran diterima!</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[13px] text-[#1a2d4a]">Perbaiki kran bocor</p>
                  <p className="text-[11px] text-[#3d6b5e]">Jakarta Selatan</p>
                </div>
                <p className="font-black text-[18px] text-[#1a2d4a]">Rp 179rb</p>
              </div>
              {/* New job badge */}
              <div className="mt-3 flex items-center gap-1.5 bg-[#20bf6f] text-white text-[11px] font-bold px-3 py-1.5 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Lowongan baru!
              </div>
            </div>

            {/* Floating card — Total earnings (bottom right) */}
            <div className="absolute bottom-8 right-6 bg-white rounded-2xl shadow-2xl px-5 py-4 w-[190px]">
              <p className="text-[11px] font-bold text-[#7a9a8f] mb-1">Total penghasilan</p>
              <p className="font-black text-[28px] text-[#1a2d4a] leading-none">Rp 13jt</p>
              <p className="text-[12px] text-[#20bf6f] font-bold mt-1">↑ 20% vs bulan lalu</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTICLES ── */}
      <section className="py-16 px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-black text-[30px] text-[#1a2d4a]">Panduan plumbing & perawatan</h2>
          <button className="flex items-center gap-1 text-[#2E5090] font-bold text-[14px] hover:underline">
            Lihat semua <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {ARTICLES.map((a) => (
            <div key={a.title} className="group cursor-pointer">
              <div
                className="rounded-2xl mb-4 aspect-[16/10] flex items-center justify-center group-hover:brightness-95 transition-all"
                style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
              >
                <span className="text-[56px]">{a.emoji}</span>
              </div>
              <span className="text-[11px] font-bold text-[#2E5090] uppercase tracking-wider">{a.category}</span>
              <h3 className="font-bold text-[16px] text-[#1a2d4a] mt-1 leading-snug group-hover:text-[#2E5090] transition-colors">{a.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICE DIRECTORY ── */}
      <section className="py-16 px-6 bg-[#F5F1E8]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-black text-[28px] text-[#1a2d4a] mb-2">Direktori Layanan</h2>
          <p className="text-[#3d6b5e] text-[15px] mb-8">Telusuri semua layanan plumbing dan perawatan yang tersedia di Jakarta.</p>
          <div className="flex gap-2 mb-8 flex-wrap">
            {SERVICE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[13px] font-semibold px-4 py-2 rounded-full transition-all ${
                  activeTab === tab ? "bg-[#1a2d4a] text-white" : "bg-white text-[#1a3d5c] border border-[#b8d4c8] hover:border-[#2E5090] hover:text-[#2E5090]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
            {(SERVICE_LINKS[activeTab] || []).map((link) => (
              <Link key={link} to={tasksUrl({ search: link })} className="text-[13px] text-[#1a3d5c] hover:text-[#2E5090] transition-colors py-1 truncate">
                {link}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/categories" className="text-[13px] font-bold text-[#2E5090] hover:underline">
              Lihat semua kategori layanan →
            </Link>
          </div>
        </div>
      </section>

      {/* ── INTERNATIONAL ── */}
      <section className="py-10 px-6 border-t border-[#c8dfd8]">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-[12px] font-bold text-[#7a9a8f] uppercase tracking-widest mb-4">Layanan tersedia di</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/categories" className="text-[14px] font-semibold text-[#2E5090]">🇮🇩 Jakarta & Jabodetabek</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
