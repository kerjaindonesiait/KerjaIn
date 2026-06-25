import { Link } from "react-router";
import { CheckCircle, Shield, Star, MessageSquare, Lock, ChevronRight } from "lucide-react";
import { tasksUrl } from "../../lib/paths";

const STEPS = [
  {
    number: "1",
    label: "Jelaskan",
    heading: "Jelaskan masalahnya",
    body: "Ceritakan apa yang perlu diperbaiki — kran bocor, saluran mampet, pipa pecah, atau perawatan umum. Tambahkan foto jika ada. Semakin jelas deskripsinya, semakin cepat Anda mendapat penawaran.",
    emoji: "📝",
    from: "#ffe4e4", to: "#ffd0d0",
  },
  {
    number: "2",
    label: "Anggaran",
    heading: "Tentukan anggaran Anda",
    body: "Tetapkan harga yang Anda mau bayar, atau minta tukang untuk mengajukan penawaran. Anggaran fleksibel — bisa disesuaikan kapan saja berdasarkan penawaran yang masuk. Tidak ada komitmen sebelum Anda setuju.",
    emoji: "💰",
    from: "#d1fae5", to: "#a7f3d0",
  },
  {
    number: "3",
    label: "Pilih & Beres",
    heading: "Pilih tukang. Masalah beres.",
    body: "Tinjau profil tukang plumbing dan perawatan, rating bintang, lisensi, dan ulasan terverifikasi. Terima penawaran terbaik dan tukang akan datang ke lokasi — pembayaran hanya dicairkan saat Anda puas.",
    emoji: "✅",
    from: "#fef3c7", to: "#fde68a",
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
    heading: "Asuransi tanggung jawab umum",
    body: "Pekerjaan yang memenuhi syarat dilindungi dari cedera tidak sengaja atau kerusakan properti selama pengerjaan berlangsung.",
    badge: "Diasuransikan",
  },
  {
    icon: <Star size={28} className="text-[#2E5090]" />,
    heading: "Rating & ulasan terverifikasi",
    body: "Setiap bintang berasal dari pekerjaan nyata yang sudah diselesaikan — tidak ada ulasan palsu. Cek tingkat penyelesaian sebagai indikator keandalan.",
    badge: "100% terverifikasi",
  },
  {
    icon: <MessageSquare size={28} className="text-[#2E5090]" />,
    heading: "Pesan aman dalam platform",
    body: "Semua komunikasi tetap di dalam KerjaIn dari awal pasang pekerjaan hingga selesai. Pesan pribadi terbuka otomatis setelah penawaran diterima.",
    badge: "Selalu pribadi",
  },
  {
    icon: <Lock size={28} className="text-[#2E5090]" />,
    heading: "Pembayaran terkunci & aman",
    body: "KerjaIn Pay menahan dana Anda dengan aman sampai Anda mengonfirmasi pekerjaan selesai. Tanpa uang tunai — cepat, cashless, dan Anda selalu memegang kendali.",
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
            Tukang Plumbing & Perawatan Terpercaya · Jakarta
          </div>
          <h1 className="font-black text-[52px] sm:text-[68px] leading-none tracking-tight text-white mb-4 max-w-3xl">
            Pasang pekerjaan.<br />
            <span className="text-[#F59E42]">Terima penawaran.</span><br />
            Masalah beres!
          </h1>
          <p className="text-white/70 text-[17px] mb-10 max-w-xl">
            KerjaIn menghubungkan Anda dengan tukang plumbing dan perawatan rumah terverifikasi di Jakarta — penawaran cepat, pembayaran aman, dan kualitas terjamin.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/post-job"
              className="bg-[#2E5090] text-white font-bold text-[15px] px-8 py-3.5 rounded-full hover:bg-[#1e3d7a] transition-colors"
            >
              Pasang pekerjaan gratis
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
          <h2 className="font-black text-[40px] text-[#1a2d4a] leading-tight">Tiga langkah untuk<br />menyelesaikan masalah rumah</h2>
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
                  to="/post-job"
                  className="inline-flex items-center gap-2 bg-[#2E5090] text-white font-bold text-[13px] px-6 py-2.5 rounded-full hover:bg-[#1e3d7a] transition-colors"
                >
                  Pasang pekerjaan gratis <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section className="py-16 bg-[#F5F1E8] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-10 text-center">
          <h2 className="font-black text-[34px] text-[#1a2d4a] mb-2">Semua layanan dalam satu platform</h2>
          <p className="text-[#3d6b5e] text-[16px]">
            Dari panggilan darurat hingga perawatan rutin — semua tukang plumbing dan perawatan ada di KerjaIn.
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-2" style={{ scrollbarWidth: "none" }}>
          {[...LAYANAN, ...LAYANAN].map((cat, i) => (
            <Link
              key={i}
              to={tasksUrl({ search: cat.label })}
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
          <p className="text-[#2E5090] font-bold text-[13px] uppercase tracking-widest mb-3">Keamanan terjamin</p>
          <h2 className="font-black text-[38px] text-[#1a2d4a] leading-tight">Kami melindungi Anda</h2>
          <p className="text-[#3d6b5e] text-[16px] mt-3 max-w-lg mx-auto">
            Saat memesan tukang plumbing atau perawatan, KerjaIn memiliki perlindungan bawaan di setiap langkah.
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
            to="/post-job"
            className="inline-flex items-center gap-2 bg-[#1a2d4a] text-white font-bold text-[14px] px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
          >
            Mulai gratis <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CTA AKHIR ── */}
      <section className="py-20 max-w-[1400px] mx-auto px-6 text-center">
        <h2 className="font-black text-[42px] text-[#1a2d4a] mb-4 leading-tight">
          Siap mengatasi masalah?
        </h2>
        <p className="text-[#3d6b5e] text-[17px] mb-10 max-w-md mx-auto">
          Pasang pekerjaan sekarang dan dapatkan penawaran dari tukang plumbing & perawatan terpercaya di Jakarta.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/post-job"
            className="bg-[#2E5090] text-white font-bold text-[15px] px-9 py-4 rounded-full hover:bg-[#1e3d7a] transition-colors"
          >
            Pasang pekerjaan gratis
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
            "Gratis pasang pekerjaan",
            "Tanpa kontrak mengikat",
            "Tukang berlisensi & diasuransikan",
            "Ulasan terverifikasi",
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
