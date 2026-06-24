import { Link } from "react-router";
import { CheckCircle, Shield, Star, MessageSquare, Lock, ChevronRight } from "lucide-react";

const STEPS = [
  {
    number: "1",
    label: "Ceritakan",
    heading: "Ceritakan Masalahnya",
    body: "Jelaskan apa yang perlu dibereskan di rumahmu.",
    emoji: "📝",
    from: "#ffe4e4", to: "#ffd0d0",
  },
  {
    number: "2",
    label: "Budget",
    heading: "Atur Budget",
    body: "Tentukan kisaran biaya atau biarkan tukang memberi penawaran.",
    emoji: "💰",
    from: "#d1fae5", to: "#a7f3d0",
  },
  {
    number: "3",
    label: "Penawaran",
    heading: "Pilih Penawaran",
    body: "Bandingkan harga, profil, rating, dan ulasan tukang.",
    emoji: "✅",
    from: "#fef3c7", to: "#fde68a",
  },
  {
    number: "4",
    label: "Dikerjain",
    heading: "Dikerjain",
    body: "Tukang datang sesuai jadwal dan pekerjaan mulai dibereskan.",
    emoji: "🔧",
    from: "#dbeafe", to: "#bfdbfe",
  },
];

const LAYANAN = [
  { label: "Pipa Bocor Darurat", emoji: "🚨" },
  { label: "Deteksi Kebocoran",  emoji: "💧" },
  { label: "Saluran Mampet",     emoji: "🔩" },
  { label: "Pemanas Air",        emoji: "🔥" },
  { label: "Ganti Pipa",         emoji: "🪛" },
  { label: "Pasang Kamar Mandi", emoji: "🛁" },
  { label: "Tukang Serba Bisa",  emoji: "🔧" },
  { label: "Bersih Talang",      emoji: "🏠" },
];

const FITUR_KEPERCAYAAN = [
  {
    icon: <Shield size={28} className="text-[#2E5090]" />,
    heading: "Perlindungan untuk pekerjaan tertentu",
    body: "Beberapa pekerjaan yang memenuhi syarat mendapat perlindungan tambahan jika terjadi kerusakan properti saat pengerjaan.",
    badge: "Diasuransikan",
  },
  {
    icon: <Star size={28} className="text-[#2E5090]" />,
    heading: "Rating & ulasan asli",
    body: "Lihat pengalaman pelanggan lain dari pekerjaan yang benar-benar sudah selesai. Kamu juga bisa melihat riwayat penyelesaian tukang.",
    badge: "100% terverifikasi",
  },
  {
    icon: <MessageSquare size={28} className="text-[#2E5090]" />,
    heading: "Chat tetap di KerjaIn",
    body: "Komunikasi pekerjaan tetap rapi di dalam KerjaIn, dari tanya jawab awal sampai pekerjaan selesai.",
    badge: "Selalu pribadi",
  },
  {
    icon: <Lock size={28} className="text-[#2E5090]" />,
    heading: "Pembayaran aman",
    body: "KerjaIn Pay menyimpan dana sampai pekerjaan selesai dikonfirmasi. Pembayaran jadi lebih jelas tanpa perlu uang tunai.",
    badge: "KerjaIn Pay",
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>

      {/* ── HERO ── */}
      <section className="bg-[#1a2d4a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-80px] right-[-60px] w-[500px] h-[500px] rounded-full bg-[#2E5090]/20 blur-3xl" />
          <div className="absolute bottom-[-60px] left-[25%] w-[350px] h-[350px] rounded-full bg-[#F59E42]/10 blur-3xl" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[13px] text-white/70 font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#F59E42] inline-block" />
            Tukang plumbing & perawatan rumah di Jakarta
          </div>
          <h1 className="font-black text-[52px] sm:text-[68px] leading-none tracking-tight text-white mb-4 max-w-3xl">
            Post Kerjaan.<br />
            <span className="text-[#F59E42]">Terima penawaran.</span><br />
            Masalah beres!
          </h1>
          <p className="text-white/70 text-[17px] mb-10 max-w-xl">
            KerjaIn membantu kamu menemukan tukang plumbing dan perawatan rumah di Jakarta dengan penawaran cepat dan pembayaran aman.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/tasks"
              className="bg-[#2E5090] text-white font-bold text-[15px] px-8 py-3.5 rounded-full hover:bg-[#1e3d7a] transition-colors"
            >
              Post Kerjaan gratis
            </Link>
            <Link
              to="/tasks"
              className="bg-white/10 border border-white/30 text-white font-bold text-[15px] px-8 py-3.5 rounded-full hover:bg-white/20 transition-colors"
            >
              Lihat pekerjaan
            </Link>
          </div>
        </div>
      </section>

      {/* ── TIGA LANGKAH ── */}
      <section className="py-20 max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#2E5090] font-bold text-[13px] uppercase tracking-widest mb-3">Cara kerja</p>
          <h2 className="font-black text-[40px] text-[#1a2d4a] leading-tight">Empat langkah simpel<br />untuk membereskan pekerjaan rumah</h2>
        </div>

        <div className="flex flex-col gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`flex flex-col ${i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"} gap-8 items-center rounded-3xl overflow-hidden border border-[#c8dfd8] bg-white`}
            >
              <div
                className="sm:w-[420px] shrink-0 h-[240px] sm:h-[280px] flex flex-col items-center justify-center gap-4 relative"
                style={{ background: `linear-gradient(135deg, ${step.from}, ${step.to})` }}
              >
                <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-[#1a2d4a] font-black text-[22px] shadow-sm mb-1">
                  {step.number}
                </div>
                <span className="text-[80px] leading-none">{step.emoji}</span>
                <span className="text-[13px] font-bold text-[#1a3d5c]/70 uppercase tracking-widest">{step.label}</span>
              </div>
              <div className="flex-1 px-6 sm:px-10 py-8">
                <p className="text-[#2E5090] font-bold text-[12px] uppercase tracking-widest mb-2">Langkah {step.number}</p>
                <h3 className="font-black text-[28px] text-[#1a2d4a] leading-tight mb-4">{step.heading}</h3>
                <p className="text-[#3d6b5e] text-[15px] leading-relaxed mb-6">{step.body}</p>
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-2 bg-[#2E5090] text-white font-bold text-[13px] px-6 py-2.5 rounded-full hover:bg-[#1e3d7a] transition-colors"
                >
                  Post Kerjaan gratis <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section className="py-16 bg-[#F5F1E8] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-10 text-center">
          <h2 className="font-black text-[34px] text-[#1a2d4a] mb-2">Semua urusan rumah, bisa di-KerjaIn.</h2>
          <p className="text-[#3d6b5e] text-[16px]">
            Cari tukang, bandingkan penawaran, dan jadwalkan pekerjaan langsung dari satu tempat.
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-2" style={{ scrollbarWidth: "none" }}>
          {[...LAYANAN, ...LAYANAN].map((cat, i) => (
            <Link
              key={i}
              to="/tasks"
              className="flex-shrink-0 w-[160px] bg-white rounded-2xl p-5 border border-transparent hover:border-[#2E5090] hover:shadow-md transition-all flex flex-col items-center gap-3 group"
            >
              <span className="text-[44px]">{cat.emoji}</span>
              <p className="font-bold text-[13px] text-[#0f2035] text-center group-hover:text-[#2E5090] transition-colors">
                {cat.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── KEPERCAYAAN & KEAMANAN ── */}
      <section className="py-20 max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#2E5090] font-bold text-[13px] uppercase tracking-widest mb-3">Lebih tenang</p>
          <h2 className="font-black text-[38px] text-[#1a2d4a] leading-tight">Ada perlindungan di setiap langkah</h2>
          <p className="text-[#3d6b5e] text-[16px] mt-3 max-w-lg mx-auto">
            Dari memilih tukang sampai membayar pekerjaan, KerjaIn membantu prosesnya tetap jelas dan aman.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FITUR_KEPERCAYAAN.map((f) => (
            <div key={f.heading} className="bg-[#F5F1E8] rounded-3xl p-8 flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#f0f7f4] flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-black text-[18px] text-[#1a2d4a]">{f.heading}</h3>
                  <span className="text-[11px] font-bold bg-[#2E5090]/10 text-[#2E5090] px-2 py-0.5 rounded-full whitespace-nowrap">
                    {f.badge}
                  </span>
                </div>
                <p className="text-[14px] text-[#3d6b5e] leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 bg-[#1a2d4a] text-white font-bold text-[14px] px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Mulai gratis <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CTA AKHIR ── */}
      <section className="py-20 max-w-[1400px] mx-auto px-6 text-center">
        <h2 className="font-black text-[42px] text-[#1a2d4a] mb-4 leading-tight">
          Siap membereskan pekerjaan rumah?
        </h2>
        <p className="text-[#3d6b5e] text-[17px] mb-10 max-w-md mx-auto">
          Post Kerjaan sekarang dan dapatkan penawaran dari tukang plumbing dan perawatan rumah di Jakarta.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/tasks"
            className="bg-[#2E5090] text-white font-bold text-[15px] px-9 py-4 rounded-full hover:bg-[#1e3d7a] transition-colors"
          >
            Post Kerjaan gratis
          </Link>
          <Link
            to="/tasks"
            className="border-2 border-[#2E5090] text-[#2E5090] font-bold text-[15px] px-9 py-4 rounded-full hover:bg-[#f0f7f4] transition-colors"
          >
            Lihat pekerjaan tersedia
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-14 pt-10 border-t border-[#c8dfd8]">
          {[
            "Post Kerjaan gratis",
            "Tanpa kontrak mengikat",
            "Tukang terverifikasi",
            "Ulasan asli",
            "Pembayaran aman",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[14px] text-[#1a3d5c] font-semibold">
              <CheckCircle size={18} className="text-[#20bf6f]" /> {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
