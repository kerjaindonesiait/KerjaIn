import { useState } from "react";
import { Link } from "react-router";
import { Search, Shield, CheckCircle, ChevronRight, Star, ArrowRight } from "lucide-react";

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
    { avatar: "RK", color: "#1D4196", category: "Pipa Bocor",       title: "Pipa utama bocor – banjir dapur",         price: "Rp 480rb", rating: 5, area: "Jaksel" },
    { avatar: "DM", color: "#6c47d9", category: "Deteksi Kebocoran", title: "Temukan kebocoran tersembunyi di dinding", price: "Rp 220rb", rating: 5, area: "Jakpus" },
    { avatar: "BW", color: "#e85d26", category: "Ganti Pipa",        title: "Ganti pipa PVC kamar mandi belakang",     price: "Rp 310rb", rating: 4, area: "Depok" },
    { avatar: "HS", color: "#20bf6f", category: "Kran Bocor",        title: "Kran dapur menetes – ganti washer",       price: "Rp 140rb", rating: 5, area: "Jakbar" },
    { avatar: "YS", color: "#f59e0b", category: "Saluran",           title: "Pasang kran outdoor taman belakang",      price: "Rp 280rb", rating: 5, area: "Tansel" },
    { avatar: "CN", color: "#14b8a6", category: "Kloset",            title: "Kloset terus mengalir ganti katup",       price: "Rp 160rb", rating: 4, area: "Jaktim" },
  ],
  maintenance: [
    { avatar: "LF", color: "#8b5cf6", category: "Perbaikan Pintu",   title: "Pintu depan tidak bisa menutup rapat",    price: "Rp 130rb", rating: 5, area: "Depok" },
    { avatar: "MR", color: "#1D4196", category: "Bersih Talang",     title: "Bersih talang 2 lantai depan & belakang", price: "Rp 290rb", rating: 5, area: "Jakut" },
    { avatar: "WP", color: "#6c47d9", category: "Tukang",            title: "Beberapa pekerjaan kecil sekaligus",      price: "Rp 270rb", rating: 5, area: "Bekasi" },
    { avatar: "FD", color: "#20bf6f", category: "Silikon",           title: "Pasang ulang silikon shower & bak mandi", price: "Rp 150rb", rating: 4, area: "Jaksel" },
    { avatar: "PH", color: "#e85d26", category: "Keramik",           title: "Tambal 3 keramik kamar mandi retak",      price: "Rp 200rb", rating: 5, area: "Jakpus" },
    { avatar: "AN", color: "#f59e0b", category: "Atap",              title: "Atap bocor – area kecil kamar tidur",     price: "Rp 380rb", rating: 5, area: "Bogor" },
  ],
  darurat: [
    { avatar: "RK", color: "#1D4196", category: "Darurat",           title: "Pipa pecah tengah malam – banjir",        price: "Rp 550rb", rating: 5, area: "Jaksel" },
    { avatar: "TW", color: "#e85d26", category: "Darurat",           title: "Air tidak mengalir sama sekali",          price: "Rp 350rb", rating: 5, area: "Tansel" },
    { avatar: "AP", color: "#6c47d9", category: "Darurat",           title: "Water heater meledak – ganti unit",       price: "Rp 900rb", rating: 5, area: "Jakbar" },
    { avatar: "BS", color: "#20bf6f", category: "Darurat",           title: "Saluran pembuangan meluap",               price: "Rp 400rb", rating: 4, area: "Bekasi" },
    { avatar: "DM", color: "#14b8a6", category: "Darurat",           title: "Kran patah air terus keluar",             price: "Rp 320rb", rating: 5, area: "Jakpus" },
    { avatar: "HS", color: "#8b5cf6", category: "Darurat",           title: "Gas bocor – cek & perbaiki segera",       price: "Rp 480rb", rating: 5, area: "Jaktim" },
  ],
  "kamar-mandi": [
    { avatar: "BS", color: "#8b5cf6", category: "Kamar Mandi",       title: "Pasang wastafel & kran mixer baru",       price: "Rp 620rb", rating: 5, area: "Jakbar" },
    { avatar: "YS", color: "#1D4196", category: "Kamar Mandi",       title: "Ganti shower head & sealant shower",      price: "Rp 240rb", rating: 5, area: "Tansel" },
    { avatar: "PH", color: "#e85d26", category: "Kamar Mandi",       title: "Pasang WC duduk baru lengkap",            price: "Rp 750rb", rating: 4, area: "Depok" },
    { avatar: "CN", color: "#20bf6f", category: "Kamar Mandi",       title: "Perbaiki shower mampet & tekanan lemah",  price: "Rp 200rb", rating: 5, area: "Jaksel" },
    { avatar: "LF", color: "#6c47d9", category: "Kamar Mandi",       title: "Pasang kaca cermin & lemari kamar mandi", price: "Rp 430rb", rating: 5, area: "Jakpus" },
    { avatar: "FD", color: "#f59e0b", category: "Kamar Mandi",       title: "Nat keramik kamar mandi difilling ulang",  price: "Rp 180rb", rating: 4, area: "Bekasi" },
  ],
  lainnya: [
    { avatar: "WP", color: "#14b8a6", category: "Inspeksi",          title: "Inspeksi plumbing rumah baru beli",       price: "Rp 450rb", rating: 5, area: "Jakut" },
    { avatar: "MR", color: "#1D4196", category: "Gas",               title: "Pasang instalasi gas untuk kompor baru",  price: "Rp 380rb", rating: 5, area: "Jaksel" },
    { avatar: "AN", color: "#8b5cf6", category: "Waterproofing",     title: "Anti bocor dinding kamar mandi",          price: "Rp 560rb", rating: 5, area: "Tansel" },
    { avatar: "TW", color: "#e85d26", category: "Cat",               title: "Tambal & cat ulang tembok lembab",        price: "Rp 340rb", rating: 4, area: "Bekasi" },
    { avatar: "AP", color: "#6c47d9", category: "Pompa Air",         title: "Ganti pompa air otomatis rumah",          price: "Rp 580rb", rating: 5, area: "Depok" },
    { avatar: "BW", color: "#20bf6f", category: "Filter",            title: "Pasang filter air di dapur",              price: "Rp 290rb", rating: 5, area: "Jakbar" },
  ],
};

const PROS = [
  { name: "Andi S.", initials: "AS", color: "#1D4196", rating: 5.0, reviews: 134, completion: 98, specialty: "pipa bocor darurat, deteksi kebocoran & pemanas air", review: "Andi datang dalam satu jam saat pipa pecah tengah malam. Cepat, rapi, dan harganya jelas dari awal.", reviewer: "Rina K." },
  { name: "Budi H.", initials: "BH", color: "#6c47d9", rating: 4.9, reviews: 211, completion: 96, specialty: "perawatan umum, tukang serba bisa & perbaikan pintu",       review: "Budi menyelesaikan beberapa perbaikan kecil dalam satu kunjungan. Komunikasinya enak dan hasilnya rapi.", reviewer: "Dewi S." },
  { name: "Reza M.", initials: "RM", color: "#e85d26", rating: 4.8, reviews: 89,  completion: 95, specialty: "saluran mampet, ganti pipa & pemasangan kamar mandi",        review: "Saluran mampet selesai hari itu juga. Reza menjelaskan masalahnya dengan jelas dan area kerja ditinggalkan bersih.", reviewer: "Tono W." },
  { name: "Sari P.", initials: "SP", color: "#20bf6f", rating: 5.0, reviews: 57,  completion: 100, specialty: "perbaikan keramik, bersih talang & perawatan atap",         review: "Sari memasang ulang silikon kamar mandi dan hasilnya terlihat jauh lebih rapi. Tepat waktu dan harganya masuk akal.", reviewer: "Hana A." },
];

const SERVICE_LINKS: Record<string, string[]> = {
  "Plumbing": ["Perbaikan Pipa Pecah","Saluran Mampet","Tukang Ledeng Darurat","Pemasangan Gas","Perbaikan Pemanas Air","Pasang Pemanas Air","Deteksi Kebocoran","Relining Pipa","Ganti Pipa","Perbaikan Kran","Pasang Kran","Perbaikan WC","Pasang WC","Perbaikan Shower","Pasang Wastafel","Plumbing Kamar Mandi","Plumbing Dapur","Perbaikan Saluran Pembuangan","Masalah Tekanan Air"],
  "Perawatan Umum": ["Tukang Serba Bisa","Perbaikan Pintu","Perbaikan Kunci","Ganti Engsel","Bersih Talang","Inspeksi Atap","Perbaikan Keramik & Nat","Pengapuran","Aplikasi Sealant","Perbaikan Pagar","Perbaikan Kasa Nyamuk","Perbaikan Jendela","Kedap Air","Perawatan Properti"],
  "Panduan Biaya": ["Biaya Tukang Ledeng Darurat","Biaya Buka Saluran Mampet","Biaya Pemanas Air","Biaya Ganti Pipa","Biaya Pasang Kran","Biaya Pasang WC","Biaya Deteksi Kebocoran","Biaya Plumbing Kamar Mandi","Biaya Tukang Serba Bisa","Biaya Bersih Talang","Biaya Perbaikan Keramik"],
  "Panduan Cara": ["Cara Perbaiki Kran Bocor","Cara Buka Saluran Mampet","Cara Kuras Pemanas Air","Cara Temukan Kebocoran Air","Cara Perbaiki Nat Keramik","Cara Bersih Talang dengan Aman","Cara Rawat Atap","Cara Perbaiki WC Terus Mengalir","Cara Pasang Silikon Shower"],
  "Checklist": ["Checklist Plumbing Tahunan","Checklist Perawatan Pra-Hujan","Checklist Plumbing Rumah Baru","Checklist Perawatan Kamar Mandi","Checklist Perawatan Dapur","Checklist Perawatan Rumah Musiman","Checklist Pra-Jual Properti"],
};
const SERVICE_DIRECTORY_ITEMS = Object.values(SERVICE_LINKS).flat();

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
  @keyframes kj-directory { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .kj-directory { animation: kj-directory 78s linear infinite; }
  .kj-directory:hover { animation-play-state: paused; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex-shrink-0 bg-white rounded-2xl border border-[#D8E2F0] px-5 py-4 min-w-[200px] hover:border-[#1D4196] hover:shadow-sm transition-all cursor-pointer group">
      <div className="w-6 h-1 rounded-full bg-[#1D4196] mb-3 group-hover:w-10 transition-all duration-300" />
      <p className="font-bold text-[14px] text-[#172E4D] mb-1 group-hover:text-[#1D4196] transition-colors">{label}</p>
      <p className="text-[12px] text-[#58708D] leading-snug">{desc}</p>
    </div>
  );
}

function TaskCard({ t }: { t: typeof COMPLETED_TASKS["plumbing"][0] }) {
  return (
    <div className="flex-shrink-0 w-[220px] bg-white rounded-2xl border border-[#D8E2F0] p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-[13px] shrink-0" style={{ background: t.color }}>
          {t.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#7890AA] uppercase tracking-wider">{t.category}</p>
          <div className="flex">
            {[1,2,3,4,5].map((i) => (
              <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= t.rating ? "#f59e0b" : "#e5e7eb"}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="font-semibold text-[13px] text-[#172E4D] leading-snug mb-2 line-clamp-2">{t.title}</p>
      <div className="flex items-center justify-between">
        <span className="font-black text-[15px] text-[#1D4196]">{t.price}</span>
        <span className="text-[11px] text-[#7890AA] bg-[#F7F9FC] px-2 py-0.5 rounded-full">{t.area}</span>
      </div>
    </div>
  );
}

function ServiceDirectoryMarquee() {
  return (
    <div className="overflow-hidden py-1">
      <div className="kj-directory grid w-max grid-flow-col grid-rows-2 gap-3">
        {[...SERVICE_DIRECTORY_ITEMS, ...SERVICE_DIRECTORY_ITEMS].map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex h-[70px] w-[280px] shrink-0 items-center gap-3 rounded-xl border border-[#D8E2F0] bg-white px-4 py-3.5 text-[14px] font-semibold text-[#294566] sm:w-[340px]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#1D4196]" />
            <span className="truncate">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [taskTab, setTaskTab] = useState("plumbing");
  const [searchQuery, setSearchQuery] = useState("");

  const tasks = COMPLETED_TASKS[taskTab] ?? [];

  return (
    <div className="bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <style>{SCROLL_CSS}</style>

      {/* ── HERO ── */}
      <section className="bg-[#172E4D] relative overflow-hidden">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-100px] right-[-80px] w-[600px] h-[600px] rounded-full bg-[#1D4196]/15 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[20%] w-[400px] h-[400px] rounded-full bg-[#FD6665]/8 blur-3xl" />
          <div className="absolute top-[30%] left-[-100px] w-[300px] h-[300px] rounded-full bg-[#1D4196]/10 blur-3xl" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12">

          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <h1 className="font-[1000] leading-[0.9] tracking-tight uppercase mb-6">
              <span className="block text-[64px] sm:text-[84px] text-white">Atasi</span>
              <span className="block text-[64px] sm:text-[84px] text-[#FD6665]">Masalah.</span>
              <span className="block text-[64px] sm:text-[84px] text-white">Sekarang.</span>
            </h1>

            <p className="text-white/60 text-[17px] mb-8 max-w-lg leading-relaxed">
              Ceritakan masalahnya, tentukan harga, lalu pilih tukang yang cocok.
            </p>

            {/* Search */}
            <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-2xl max-w-[520px] mb-10 border border-white/20">
              <div className="flex items-center gap-3 flex-1 px-5 py-4">
                <Search size={19} className="text-[#7890AA] shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="cth. pipa bocor, saluran mampet…"
                  className="bg-transparent text-[15px] text-[#172E4D] placeholder-[#7890AA] outline-none w-full font-medium"
                />
              </div>
              <Link
                to="/post-job"
                className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] px-6 py-4 shrink-0 transition-colors"
              >
                Cari tukang
              </Link>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/post-job" className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] px-7 py-3.5 rounded-full transition-colors">
                Post Kerjaan gratis
              </Link>
              <Link to="/daftar-tukang" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-[14px] px-7 py-3.5 rounded-full transition-colors">
                Daftar jadi tukang
              </Link>
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
                            <span className="text-[10px] text-[#7890AA]">· {card.offers}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-[15px] text-[#1D4196]">{card.price}</p>
                        <p className="text-[10px] text-[#7890AA]">{card.area}</p>
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
          <h2 className="font-black text-[32px] text-[#172E4D] mb-1">Contoh pekerjaan yang sudah beres</h2>
          <p className="text-[#58708D] text-[15px]">Lihat pekerjaan nyata yang diselesaikan tukang terpercaya di Jakarta.</p>
        </div>

        {/* Tab selector */}
        <div className="max-w-[1400px] mx-auto px-6 mb-6 flex gap-2 flex-wrap">
          {TASK_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTaskTab(tab.id)}
              className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                taskTab === tab.id
                  ? "bg-[#172E4D] text-white"
                  : "bg-[#EEF3FB] text-[#58708D] hover:bg-[#EEF3FB] hover:text-[#1D4196]"
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
          <Link to="/tasks" className="inline-flex items-center gap-2 text-[#1D4196] font-bold text-[14px] hover:underline">
            Lihat pekerjaan lainnya <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-6 bg-[#F7F9FC]">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="font-black text-[38px] leading-tight text-[#172E4D] mb-4">
              Post Kerjaan<br />dalam beberapa menit
            </h2>
            <p className="text-[#58708D] text-[16px] mb-10">
              Tidak perlu menelepon satu per satu. Post Kerjaan, lalu tukang yang sesuai bisa mengirim penawaran.
            </p>

            <div className="flex flex-col gap-7 mb-10">
              {[
                { n: "1", title: "Ceritakan Masalahnya", desc: "Jelaskan apa yang perlu dibereskan di rumahmu." },
                { n: "2", title: "Atur Budget", desc: "Tentukan kisaran biaya atau biarkan tukang memberi penawaran." },
                { n: "3", title: "Pilih Penawaran", desc: "Bandingkan harga, profil, rating, dan ulasan tukang." },
                { n: "4", title: "Dikerjain", desc: "Tukang datang sesuai jadwal dan pekerjaan mulai dibereskan." },
              ].map((step) => (
                <div key={step.n} className="flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#1D4196] flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-[#1D4196]/30">
                    <span className="text-white font-black text-[15px]">{step.n}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[16px] text-[#172E4D] mb-1">{step.title}</p>
                    <p className="text-[#58708D] text-[14px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/post-job" className="inline-flex items-center gap-2 bg-[#1D4196] text-white font-bold text-[15px] px-8 py-4 rounded-full hover:bg-[#173577] transition-colors shadow-lg shadow-[#1D4196]/30">
              Post Kerjaan gratis <ArrowRight size={16} />
            </Link>
          </div>

          {/* Visual mock UI */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-[#D8E2F0] overflow-hidden">
              {/* Header */}
              <div className="bg-[#172E4D] px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1D4196] flex items-center justify-center text-white font-black text-[12px]">RK</div>
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
                <p className="text-[11px] font-bold text-[#7890AA] uppercase tracking-wider mb-3">3 penawaran masuk</p>
                {[
                  { name: "Andi S.", color: "#1D4196", price: "Rp 130rb", time: "Bisa dalam 30 menit", stars: 5 },
                  { name: "Reza M.", color: "#e85d26", price: "Rp 150rb", time: "Bisa hari ini",       stars: 5 },
                  { name: "Budi H.", color: "#6c47d9", price: "Rp 175rb", time: "Bisa besok pagi",     stars: 5 },
                ].map((offer) => (
                  <div key={offer.name} className="flex items-center gap-3 py-3 border-b border-[#f5eded] last:border-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[12px] shrink-0" style={{ background: offer.color }}>
                      {offer.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-[13px] text-[#172E4D]">{offer.name}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((i) => (
                            <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#58708D]">{offer.time}</p>
                    </div>
                    <p className="font-black text-[14px] text-[#1D4196] shrink-0">{offer.price}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5">
                <div className="bg-[#1D4196] text-white text-[13px] font-bold text-center py-3 rounded-xl cursor-pointer hover:bg-[#173577] transition-colors">
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
            <h2 className="font-black text-[36px] leading-tight text-[#172E4D] mb-4">
              Cari tukang dengan lebih tenang
            </h2>
            <p className="text-[#58708D] text-[15px] mb-6">KerjaIn membantu kamu melihat profil, rating, dan ulasan sebelum memilih tukang untuk pekerjaan rumah.</p>
            <Link to="/tasks" className="inline-flex items-center gap-2 bg-[#1D4196] text-white font-bold text-[14px] px-7 py-3.5 rounded-full hover:bg-[#173577] transition-colors">
              Lihat tukang tersedia <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: <Shield size={24} className="text-[#1D4196]" />, title: "Bayar dengan aman",       desc: "Dana disimpan dulu dan baru diteruskan setelah pekerjaan selesai dikonfirmasi." },
              { icon: <Star size={24} className="text-[#1D4196]" />,   title: "Ulasan asli", desc: "Baca pengalaman pelanggan lain dari pekerjaan yang benar-benar sudah selesai." },
              { icon: <CheckCircle size={24} className="text-[#1D4196]" />, title: "Tukang terverifikasi", desc: "Profil tukang dicek agar kamu bisa memilih dengan lebih percaya diri." },
            ].map((item) => (
              <div key={item.title} className="bg-[#F7F9FC] rounded-2xl p-6 border border-[#D8E2F0]">
                <div className="w-12 h-12 rounded-xl bg-[#EEF3FB] flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-[16px] text-[#172E4D] mb-2">{item.title}</h3>
                <p className="text-[13px] text-[#58708D] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE DIRECTORY ── */}
      <section className="py-20 px-6 bg-[#F7F9FC]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[12px] font-bold text-[#1D4196] uppercase tracking-widest mb-3">Butuh bantuan apa?</p>
              <h2 className="font-black text-[38px] sm:text-[48px] leading-tight text-[#172E4D] mb-3">
                Pilih layanan yang kamu butuhkan
              </h2>
              <p className="text-[#58708D] text-[17px] leading-relaxed max-w-2xl">
                Dari pipa bocor sampai perawatan rumah rutin, temukan tukang yang pas untuk pekerjaanmu di Jakarta.
              </p>
            </div>
            <div className="bg-white border border-[#D8E2F0] rounded-2xl px-5 py-4 max-w-[280px]">
              <p className="text-[12px] font-bold text-[#7890AA] uppercase tracking-wider mb-1">Layanan populer</p>
              <p className="font-black text-[28px] text-[#172E4D] leading-none">50+</p>
              <p className="text-[13px] text-[#58708D] mt-1">kategori pekerjaan yang bisa kamu pilih</p>
            </div>
          </div>
          <div className="-mx-6 overflow-hidden px-6">
            <ServiceDirectoryMarquee />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-[1400px] mx-auto rounded-[32px] bg-[#F7F9FC] border border-[#D8E2F0] px-8 sm:px-12 py-14 sm:py-16 flex flex-col md:flex-row md:items-center justify-between gap-10 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[13px] font-bold text-[#FD6665] uppercase tracking-widest mb-4">Siap mulai?</p>
            <h2 className="font-black text-[46px] sm:text-[64px] leading-[0.95] text-[#172E4D] mb-5">
              Post Kerjaan sekarang!
            </h2>
            <p className="text-[#58708D] text-[17px] leading-relaxed max-w-2xl">
              Ceritakan masalah plumbing atau perawatan rumahmu, lalu dapatkan penawaran dari tukang terpercaya di Jakarta.
            </p>
          </div>
          <Link
            to="/post-job"
            className="inline-flex items-center justify-center gap-2 bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[16px] px-9 py-4 rounded-full transition-colors shrink-0 shadow-lg shadow-[#1D4196]/20"
          >
            Post Kerjaan gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
