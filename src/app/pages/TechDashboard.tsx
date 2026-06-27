import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Search, MapPin, Calendar, Clock, Shield, CheckCircle,
  ChevronDown, Bell, Star, SlidersHorizontal, Send,
  Briefcase, FileText, TrendingUp, LogOut, Filter, Loader2, MessageCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { Job, MineOffer, TechnicianStats } from "../../types";
import { BrandLogo } from "../components/BrandLogo";

type ApiJob = {
  id: string;
  category: string;
  title: string;
  budget: string;
  budgetRaw: number;
  area: string;
  urgency: string;
  date: string;
  time: string;
  posterName: string;
  posterRating: number | null;
  posterJobsPosted: number;
  offers: number;
  description: string;
};

function mapJob(j: Job): ApiJob {
  return {
    id: j.id,
    category: j.category,
    title: j.title,
    budget: j.price,
    budgetRaw: j.budgetRaw ?? 0,
    area: j.area,
    urgency: j.urgency ?? "Normal",
    date: j.date ?? "Fleksibel",
    time: j.time ?? "Kapan saja",
    posterName: j.poster?.name ?? "Pelanggan",
    posterRating: j.poster?.rating ?? null,
    posterJobsPosted: j.poster?.jobsPosted ?? 0,
    offers: j.offers,
    description: j.description,
  };
}

// ─── Job data (static tabs) ───────────────────────────────────────────────────

const ALL_JOBS = [
  {
    id: 1, category: "darurat",
    title: "Pipa pecah – butuh perbaikan segera",
    budget: "Rp 500rb", budgetRaw: 500000,
    area: "Jakarta Selatan", urgency: "Segera",
    date: "Hari ini", time: "Sekarang",
    posterName: "Rina K.", posterRating: 4.9,
    offers: 5,
    description: "Pipa pecah di bawah wastafel dapur dan air terus mengalir. Sudah menutup kran utama dan butuh tukang ledeng darurat untuk memeriksa dan memperbaiki secepatnya.\n\n• Pipa di bawah wastafel (retak terlihat)\n• Lantai lemari dapur ikut basah\n• Perlu perbaikan + inspeksi pipa sekitarnya\n\nMohon tersedia hari ini. Akses mudah — apartemen lantai dasar, ada parkir di depan.",
  },
  {
    id: 2, category: "kran",
    title: "Kran bocor – dapur, menetes pelan",
    budget: "Rp 150rb", budgetRaw: 150000,
    area: "Jakarta Pusat", urgency: "Normal",
    date: "Fleksibel", time: "Kapan saja",
    posterName: "Dewi M.", posterRating: 4.7,
    offers: 9,
    description: "Kran mixer dapur sudah menetes sekitar dua minggu. Tetesannya pelan tapi terus-menerus dan khawatir tagihan air membengkak.\n\nTidak tahu apakah perlu ganti seal atau kran baru — happy to go dengan rekomendasi tukang. Semua akses mudah.",
  },
  {
    id: 3, category: "mampet",
    title: "Saluran shower mampet – tidak bisa bersih",
    budget: "Rp 200rb", budgetRaw: 200000,
    area: "Tangerang Selatan", urgency: "Normal",
    date: "Sebelum Sabtu, 5 Jul", time: "Pagi",
    posterName: "Tono W.", posterRating: 4.8,
    offers: 7,
    description: "Shower kamar mandi utama hampir tidak mengalir — sudah sangat mampet. Sudah coba cairan pembersih dua kali tapi tidak mempan.\n\nCari tukang dengan drain snake atau hydro-jet. Bisa booking Sabtu pagi. Apartemen dengan lift.",
  },
  {
    id: 4, category: "water",
    title: "Water heater tidak berfungsi",
    budget: "Rp 350rb", budgetRaw: 350000,
    area: "Bekasi", urgency: "Normal",
    date: "Sebelum Kamis, 3 Jul", time: "Kapan saja",
    posterName: "Hana S.", posterRating: 5.0,
    offers: 4,
    description: "Water heater listrik tidak menghasilkan air panas lagi. Unit sudah berumur sekitar 8 tahun (Ariston 50L).\n\nTidak tahu apakah elemen, termostat, atau masalah lain. Cari tukang untuk diagnosa dan perbaikan.",
  },
  {
    id: 5, category: "kloset",
    title: "Kloset terus mengalir – tidak berhenti",
    budget: "Rp 175rb", budgetRaw: 175000,
    area: "Jakarta Timur", urgency: "Normal",
    date: "Fleksibel", time: "Kapan saja",
    posterName: "Agus P.", posterRating: 4.6,
    offers: 6,
    description: "Tangki kloset terus mengalir setelah disiram — terdengar suara air mengalir terus-menerus. Awalnya sesekali, sekarang tidak pernah berhenti.\n\nKemungkinan perlu ganti katup inlet atau flapper. Tukang cukup diagnosa di tempat dan perbaiki sesuai kebutuhan.",
  },
  {
    id: 6, category: "bathroom",
    title: "Ganti kran kamar mandi & pasang wastafel baru",
    budget: "Rp 650rb", budgetRaw: 650000,
    area: "Jakarta Barat", urgency: "Normal",
    date: "Sebelum Senin, 7 Jul", time: "Pagi",
    posterName: "Bowo S.", posterRating: 4.9,
    offers: 3,
    description: "Sedang renovasi kamar mandi utama. Butuh tukang ledeng untuk melepas kran dan wastafel lama, pasang wastafel gantung baru dan set kran mixer baru (sudah dibeli).\n\nKerja keramik sudah selesai. Hanya perlu penyambungan plumbing. Perkiraan 2–3 jam.",
  },
  {
    id: 7, category: "maintenance",
    title: "Perbaikan pintu depan – tidak bisa menutup",
    budget: "Rp 140rb", budgetRaw: 140000,
    area: "Depok", urgency: "Normal",
    date: "Fleksibel", time: "Kapan saja",
    posterName: "Laras F.", posterRating: 4.7,
    offers: 11,
    description: "Pintu depan mengembang dan sekarang menyeret lantai saat ditutup. Harus didorong keras dan kunci tidak mengait — jadi masalah keamanan.\n\nCari tukang untuk menyerut/memotong pintu dan menyetel engsel. Rumah satu lantai, akses mudah.",
  },
  {
    id: 8, category: "pipa",
    title: "Ganti pipa PVC bocor – kamar mandi belakang",
    budget: "Rp 280rb", budgetRaw: 280000,
    area: "Jakarta Utara", urgency: "Normal",
    date: "Sebelum Jumat, 4 Jul", time: "Sore",
    posterName: "Mira R.", posterRating: 4.5,
    offers: 2,
    description: "Pipa PVC di kamar mandi belakang bocor di sambungan — sudah ditambal sendiri dengan selotip tapi tidak tahan lama.\n\nPerlu ganti pipa sekitar 1 meter dan sambungan. Material bisa disediakan tukang atau saya beli.",
  },
  {
    id: 9, category: "mampet",
    title: "Tekanan air lemah di seluruh rumah",
    budget: "Rp 250rb", budgetRaw: 250000,
    area: "Tangerang", urgency: "Normal",
    date: "Sebelum Rabu, 2 Jul", time: "Kapan saja",
    posterName: "Citra N.", posterRating: 4.8,
    offers: 4,
    description: "Tekanan air di rumah kami turun drastis beberapa minggu terakhir. Tetangga tidak ada masalah jadi sepertinya ada masalah di dalam properti.\n\nCari tukang ledeng berlisensi untuk diagnosa (kemungkinan pressure regulator) dan perbaikan.",
  },
];

const FILTER_TABS = [
  { id: "semua",       label: "Semua" },
  { id: "darurat",     label: "Darurat" },
  { id: "mampet",      label: "Saluran Mampet" },
  { id: "water",       label: "Pemanas Air" },
  { id: "pipa",        label: "Ganti Pipa" },
  { id: "bathroom",    label: "Kamar Mandi" },
  { id: "maintenance", label: "Perawatan" },
];

const NAV_TABS = [
  { id: "lowongan",  label: "Lowongan",       icon: <Search size={16} /> },
  { id: "penawaran", label: "Penawaran Saya",  icon: <Send size={16} /> },
  { id: "aktif",     label: "Pekerjaan Aktif", icon: <Briefcase size={16} /> },
  { id: "selesai",   label: "Selesai",         icon: <CheckCircle size={16} /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WAKTU_OPTIONS = [
  { id: "segera",    label: "Segera / dalam 1 jam",    emoji: "⚡" },
  { id: "hari-ini",  label: "Hari ini (pilih jam)",     emoji: "🕐" },
  { id: "besok",     label: "Besok",                    emoji: "📅" },
  { id: "pilih",     label: "Pilih tanggal & waktu",    emoji: "🗓️" },
];

function Avatar({ initials, color, size = "sm" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-14 h-14 text-[18px]" : size === "md" ? "w-10 h-10 text-[13px]" : "w-8 h-8 text-[11px]";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-white font-black shrink-0`} style={{ background: color }}>
      {initials}
    </div>
  );
}

function StarRow({ rating }: { rating: number | null | undefined }) {
  if (rating == null || rating <= 0) return null;
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((i) => (
          <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <span className="text-[11px] text-[#58708D] font-semibold">{rating}</span>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job, selected, quoted, onClick }: {
  job: ApiJob;
  selected: boolean;
  quoted: boolean;
  onClick: () => void;
}) {
  const urgent = job.urgency === "Segera";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition-all ${
        selected ? "border-[#1D4196] shadow-md ring-1 ring-[#1D4196]/20"
        : "border-[#D8E2F0] hover:border-[#FD6665] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {urgent && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mb-1.5">
              ⚡ DARURAT
            </span>
          )}
          <p className="font-bold text-[14px] text-[#172E4D] leading-snug">{job.title}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-black text-[15px] text-[#172E4D]">{job.budget}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2.5 text-[11px] text-[#58708D]">
        <span className="flex items-center gap-1"><MapPin size={11} className="text-[#1D4196]" />{job.area}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{job.date}</span>
      </div>
      <div className="flex items-center justify-end">
        {quoted ? (
          <span className="text-[11px] font-bold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle size={10} /> Penawaran terkirim
          </span>
        ) : (
          <span className="text-[11px] font-bold text-[#1D4196] bg-[#EEF3FB] px-2.5 py-0.5 rounded-full">Terbuka</span>
        )}
      </div>
    </button>
  );
}

// ─── Quote Form ───────────────────────────────────────────────────────────────

function QuoteForm({ job, onSuccess }: { job: ApiJob; onSuccess: (price: number) => void }) {
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [waktu, setWaktu] = useState("segera");
  const [jam, setJam] = useState("");
  const [loading, setLoading] = useState(false);

  const priceNum = parseInt(price.replace(/\D/g, "")) || 0;
  const valid = priceNum >= 50000 && note.trim().length >= 20;

  const formatRp = (v: string) => {
    const n = v.replace(/\D/g, "");
    return n ? `Rp ${parseInt(n).toLocaleString("id-ID")}` : "";
  };

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    try {
      await api.createOffer(job.id, {
        price: priceNum,
        message: note,
        availability: waktu,
        scheduledTime: jam || undefined,
      });
      onSuccess(priceNum);
    } catch {
      // show error silently for now
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Harga penawaranmu</label>
        <div className="relative">
          <input
            value={price}
            onChange={(e) => setPrice(formatRp(e.target.value))}
            placeholder="Rp 0"
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[18px] font-black text-[#172E4D] placeholder-[#d4b0b0] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
          />
        </div>
        {priceNum > 0 && (
          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className="text-[#58708D]">Anggaran pelanggan:</span>
            <span className="font-bold text-[#172E4D]">{job.budget}</span>
            {priceNum <= job.budgetRaw ? (
              <span className="text-[#20bf6f] font-bold">✓ Sesuai anggaran</span>
            ) : (
              <span className="text-[#e85d26] font-bold">↑ Di atas anggaran</span>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Kapan bisa mulai?</label>
        <div className="grid grid-cols-2 gap-2">
          {WAKTU_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setWaktu(opt.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                waktu === opt.id
                  ? "border-[#1D4196] bg-[#EEF3FB] text-[#1D4196]"
                  : "border-[#D8E2F0] bg-white text-[#294566] hover:border-[#FD6665]"
              }`}
            >
              <span className="text-[16px] shrink-0">{opt.emoji}</span>
              <span className="text-[12px] font-semibold leading-snug">{opt.label}</span>
            </button>
          ))}
        </div>
        {waktu === "hari-ini" && (
          <input
            value={jam}
            onChange={(e) => setJam(e.target.value)}
            type="time"
            className="mt-2 w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-2.5 text-[14px] text-[#172E4D] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
          />
        )}
        {waktu === "pilih" && (
          <input
            type="datetime-local"
            className="mt-2 w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-2.5 text-[14px] text-[#172E4D] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
          />
        )}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">
          Pesan kepada pelanggan
          <span className="font-normal text-[#7890AA] ml-1">(min. 20 karakter)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Contoh: Saya berpengalaman menangani masalah pipa pecah darurat. Bisa tiba dalam 30 menit. Harga sudah termasuk inspeksi dan perbaikan awal..."
          className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] resize-none transition-all"
        />
        <div className="flex justify-between mt-1">
          <p className="text-[11px] text-[#7890AA]">Pesan bagus meningkatkan peluang dipilih</p>
          <p className={`text-[11px] font-semibold ${note.length >= 20 ? "text-[#20bf6f]" : "text-[#7890AA]"}`}>
            {note.length} karakter
          </p>
        </div>
      </div>

      <div className="bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4 text-[12px] text-[#58708D]">
        <p className="font-bold text-[#172E4D] mb-1.5">💡 Tips agar penawaranmu dipilih:</p>
        <ul className="space-y-1">
          <li>• Sebutkan pengalaman spesifik yang relevan dengan masalah ini</li>
          <li>• Tawarkan garansi pekerjaan jika memungkinkan</li>
          <li>• Jelaskan apa saja yang termasuk dalam harga</li>
          <li>• Respons cepat meningkatkan kepercayaan pelanggan</li>
        </ul>
      </div>

      <button
        onClick={submit}
        disabled={!valid || loading}
        className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-4 rounded-2xl transition-all ${
          valid && !loading
            ? "bg-[#1D4196] hover:bg-[#173577] text-white shadow-sm"
            : "bg-[#D8E2F0] text-[#7890AA] cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Mengirim penawaran…
          </>
        ) : (
          <><Send size={16} /> Kirim Penawaran</>
        )}
      </button>
    </div>
  );
}

// ─── Quote Success ────────────────────────────────────────────────────────────

function QuoteSuccess({ job, price, onBack }: { job: ApiJob; price: number; onBack: () => void }) {
  const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  return (
    <div className="flex flex-col items-center text-center gap-5 py-6 px-2">
      <div className="w-20 h-20 rounded-full bg-[#f0fdf4] border-4 border-[#bbf7d0] flex items-center justify-center">
        <Send size={36} className="text-[#20bf6f]" />
      </div>
      <div>
        <h3 className="font-black text-[22px] text-[#172E4D] mb-1">Penawaran terkirim!</h3>
        <p className="text-[#58708D] text-[14px]">
          Penawaran <span className="font-bold text-[#172E4D]">{formatRp(price)}</span> sudah dikirim ke pelanggan.
        </p>
      </div>

      <div className="w-full bg-[#172E4D] rounded-2xl overflow-hidden text-left">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">Pekerjaan</p>
          <p className="font-bold text-[14px] text-white leading-snug">{job.title}</p>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          {[
            ["Anggaran pelanggan", job.budget],
            ["Penawaranmu", formatRp(price)],
            ["Lokasi", job.area],
            ["Status", "Menunggu respons"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{k}</p>
              <p className={`font-bold text-[13px] mt-0.5 ${k === "Status" ? "text-yellow-300" : "text-white"}`}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full space-y-2.5 text-[13px] text-[#58708D] bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4 text-left">
        <p className="font-bold text-[#172E4D] mb-2">Setelah ini apa?</p>
        {[
          { icon: "🔔", text: "Kamu akan dapat notifikasi jika pelanggan menerima penawaranmu" },
          { icon: "💬", text: "Pelanggan mungkin menghubungi kamu untuk bertanya sebelum memilih" },
          { icon: "✅", text: "Jika diterima, kamu bisa langsung atur jadwal dengan pelanggan" },
          { icon: "💰", text: "Pembayaran masuk setelah pekerjaan dikonfirmasi selesai" },
        ].map((item) => (
          <div key={item.icon} className="flex items-start gap-2.5">
            <span className="text-[16px] shrink-0 mt-0.5">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all"
      >
        Lihat lowongan lain
      </button>
    </div>
  );
}

// ─── Job Detail Panel ─────────────────────────────────────────────────────────

function JobDetail({ job, quoted, quotedPrice, onQuote }: {
  job: ApiJob;
  quoted: boolean;
  quotedPrice: number;
  onQuote: (price: number) => void;
}) {
  const [tab, setTab] = useState<"detail" | "ajukan">("detail");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = (price: number) => {
    onQuote(price);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-6 py-5">
          <QuoteSuccess job={job} price={quotedPrice} onBack={() => setShowSuccess(false)} />
        </div>
      </div>
    );
  }

  const DETAIL_TABS = [
    { id: "detail" as const,  label: "Detail Pekerjaan" },
    { id: "ajukan" as const, label: quoted ? "✓ Penawaran Terkirim" : "Ajukan Penawaran" },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#f5eded]">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              {job.urgency === "Segera" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mb-2">
                  ⚡ DARURAT
                </span>
              )}
              <h2 className="font-black text-[18px] text-[#172E4D] leading-snug">{job.title}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-[20px] text-[#1D4196]">{job.budget}</p>
              <p className="text-[10px] text-[#7890AA]">Anggaran</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[12px] text-[#58708D]">
            <span className="flex items-center gap-1 bg-[#F7F9FC] px-2.5 py-1 rounded-lg">
              <MapPin size={12} className="text-[#1D4196]" /> {job.area}
            </span>
            <span className="flex items-center gap-1 bg-[#F7F9FC] px-2.5 py-1 rounded-lg">
              <Calendar size={12} className="text-[#1D4196]" /> {job.date}
            </span>
            <span className="flex items-center gap-1 bg-[#F7F9FC] px-2.5 py-1 rounded-lg">
              <Clock size={12} className="text-[#1D4196]" /> {job.time}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-[#f5eded]">
          {DETAIL_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-[13px] font-bold transition-all relative ${
                tab === t.id ? "text-[#1D4196]" : "text-[#7890AA] hover:text-[#58708D]"
              }`}
            >
              {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D4196] rounded-t" />}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5">

          {tab === "detail" && (
            <div className="space-y-5">
              {/* Poster */}
              <div className="flex items-center gap-3 bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-[#1D4196]/20 flex items-center justify-center text-[#1D4196] font-black text-[13px]">
                  {job.posterName[0]}
                </div>
                <div>
                  <p className="font-bold text-[13px] text-[#172E4D]">{job.posterName}</p>
                  <p className="text-[11px] text-[#58708D]">{job.posterJobsPosted} pekerjaan diposting</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[11px] font-bold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
                    ✓ Terverifikasi
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="font-bold text-[12px] text-[#7890AA] uppercase tracking-wider mb-3">Deskripsi pekerjaan</p>
                <p className="text-[14px] text-[#294566] leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                <Shield size={16} className="text-[#20bf6f] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#166534] font-semibold">
                  Pembayaran dijamin — dana ditahan aman oleh KerjaIn Pay dan dicairkan setelah pekerjaan selesai dikonfirmasi pelanggan.
                </p>
              </div>

              <button
                onClick={() => setTab("ajukan")}
                className="w-full bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] py-3.5 rounded-2xl transition-colors"
              >
                {quoted ? "✓ Penawaran sudah terkirim" : "Ajukan Penawaran →"}
              </button>
            </div>
          )}

          {tab === "ajukan" && (
            quoted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#f0fdf4] border-4 border-[#bbf7d0] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-[#20bf6f]" fill="#20bf6f" />
                </div>
                <p className="font-black text-[18px] text-[#172E4D] mb-1">Penawaran Terkirim</p>
                <p className="text-[13px] text-[#58708D]">Harga penawaran: <span className="font-bold text-[#172E4D]">Rp {quotedPrice.toLocaleString("id-ID")}</span></p>
                <p className="text-[12px] text-[#7890AA] mt-2">Tunggu konfirmasi dari pelanggan</p>
              </div>
            ) : (
              <QuoteForm job={job} onSuccess={handleSuccess} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Offer / assigned job helpers ─────────────────────────────────────────────

const OFFER_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  accepted: "Diterima",
  rejected: "Ditolak",
};

function jobTitleFromOffer(o: MineOffer) {
  const j = o.job as { title?: string } | null | undefined;
  return j?.title ?? "Pekerjaan";
}

function jobAreaFromOffer(o: MineOffer) {
  const j = o.job as { area?: string } | null | undefined;
  return j?.area ?? "";
}

function jobStatusFromOffer(o: MineOffer) {
  const j = o.job as { status?: string } | null | undefined;
  return j?.status ?? "";
}

function isPenawaranTabOffer(o: MineOffer) {
  return jobStatusFromOffer(o) !== "completed";
}

function canMessageOnJob(status: string) {
  return status === "in_progress" || status === "completed";
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

const STATUS_STYLE: Record<string, string> = {
  Menunggu: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Diterima: "bg-[#f0fdf4] text-[#20bf6f] border-[#bbf7d0]",
  Ditolak: "bg-red-50 text-red-600 border-red-200",
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function TechDashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [navTab, setNavTab] = useState<"lowongan" | "penawaran" | "aktif" | "selesai">("lowongan");
  const [filterTab, setFilterTab] = useState("semua");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quotedJobs, setQuotedJobs] = useState<Record<string, number>>({});
  const [myOffers, setMyOffers] = useState<MineOffer[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [techStats, setTechStats] = useState<TechnicianStats | null>(null);

  useEffect(() => {
    api.getTechnicianStats().then(({ stats }) => setTechStats(stats)).catch(() => setTechStats(null));
    api
      .getOffersMine()
      .then(({ offers }) => {
        const q: Record<string, number> = {};
        for (const o of offers) {
          if ((o.status === "pending" || o.status === "accepted") && isPenawaranTabOffer(o)) {
            q[o.job_id] = o.price;
          }
        }
        setQuotedJobs(q);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (navTab === "lowongan") return;
    setLoadingTab(true);
    if (navTab === "penawaran") {
      api
        .getOffersMine()
        .then(({ offers }) => setMyOffers(offers.filter(isPenawaranTabOffer)))
        .catch(() => setMyOffers([]))
        .finally(() => setLoadingTab(false));
    } else if (navTab === "aktif") {
      api
        .getAssignedJobs({ status: "in_progress" })
        .then(({ jobs }) => setActiveJobs(jobs))
        .catch(() => setActiveJobs([]))
        .finally(() => setLoadingTab(false));
    } else if (navTab === "selesai") {
      api
        .getAssignedJobs({ status: "completed" })
        .then(({ jobs }) => setCompletedJobs(jobs))
        .catch(() => setCompletedJobs([]))
        .finally(() => setLoadingTab(false));
    }
  }, [navTab]);

  const handleCompleteJob = async (jobId: string) => {
    if (!confirm("Tandai pekerjaan ini sudah selesai? Pelanggan perlu mengonfirmasi sebelum dana dicairkan.")) return;
    setCompletingId(jobId);
    try {
      await api.markJobDone(jobId);
      setActiveJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, technicianCompletedAt: new Date().toISOString() } : j,
        ),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menandai pekerjaan selesai");
    } finally {
      setCompletingId(null);
    }
  };

  useEffect(() => {
    api.getJobs({ search: search || undefined })
      .then(({ jobs: data }) => setJobs(data.map(mapJob)))
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false));
  }, [search]);

  const filtered = jobs.filter((j) => {
    const matchCat = filterTab === "semua" || j.category === filterTab;
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.area.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedJob = jobs.find((j) => j.id === selectedId) ?? null;

  const TUKANG = {
    name: user?.fullName ?? "Tukang",
    initials: (user?.fullName ?? "T").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    area: techStats?.area ?? "Jakarta",
    rating: techStats?.rating ?? 0,
    reviews: techStats?.reviewCount ?? 0,
    selesai: techStats?.completedJobs ?? 0,
    penawaran_aktif: techStats?.activeOffers ?? Object.keys(quotedJobs).length,
    penghasilan: "Rp 0",
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>

      {/* ── Top nav ── */}
      <header className="bg-[#172E4D] text-white shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo + badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <BrandLogo variant="dark" imgClassName="h-9" />
            </Link>
            <span className="text-[10px] font-bold bg-[#1D4196] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
              Dasbor Tukang
            </span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-4">
            <button className="relative text-white/70 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1D4196] text-white text-[9px] font-black rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1D4196] flex items-center justify-center text-white font-black text-[12px]">
                {TUKANG.initials}
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-[13px] text-white leading-none">{TUKANG.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle size={10} className="text-[#20bf6f]" />
                  <span className="text-[10px] text-[#20bf6f] font-bold">Terverifikasi</span>
                </div>
              </div>
            </div>
            <Link to="/" className="text-white/50 hover:text-white transition-colors">
              <LogOut size={18} />
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-white/10 px-6 py-2.5 max-w-[1400px] mx-auto">
          <div className="flex gap-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {[
              { label: "Rating",             value: techStats && techStats.reviewCount > 0 ? `${TUKANG.rating.toFixed(1)} ⭐ (${TUKANG.reviews})` : "Belum ada ulasan" },
              { label: "Pekerjaan selesai",  value: `${TUKANG.selesai}` },
              { label: "Penawaran aktif",    value: `${TUKANG.penawaran_aktif}` },
              { label: "Penghasilan bulan ini", value: TUKANG.penghasilan },
            ].map((s) => (
              <div key={s.label} className="shrink-0">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">{s.label}</p>
                <p className="font-black text-[15px] text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Nav tabs ── */}
      <div className="bg-white border-b border-[#f5eded] shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 flex">
          {NAV_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setNavTab(t.id as typeof navTab)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-bold transition-all relative border-b-2 ${
                navTab === t.id
                  ? "text-[#1D4196] border-[#1D4196]"
                  : "text-[#7890AA] border-transparent hover:text-[#58708D]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LOWONGAN tab ── */}
      {navTab === "lowongan" && (
        <div className="flex flex-1 min-h-0 max-w-[1400px] mx-auto w-full overflow-hidden">

          {/* Left: filter + list */}
          <div className="w-[400px] shrink-0 flex flex-col border-r border-[#f5eded] overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-[#D8E2F0]">
              <div className="flex items-center gap-2 bg-[#EEF3FB] rounded-xl px-3 py-2.5 border border-transparent focus-within:border-[#1D4196] transition-all">
                <Search size={15} className="text-[#7890AA] shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pekerjaan…"
                  className="bg-transparent text-[13px] text-[#294566] placeholder-[#7890AA] outline-none w-full"
                />
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-[#D8E2F0]" style={{ scrollbarWidth: "none" }}>
              {FILTER_TABS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterTab(f.id)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                    filterTab === f.id
                      ? "bg-[#1D4196] text-white"
                      : "bg-[#EEF3FB] text-[#58708D] hover:bg-[#EEF3FB]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Job count */}
            <div className="px-4 py-2 border-b border-[#D8E2F0]">
              <p className="text-[11px] text-[#7890AA] font-semibold">
                {filtered.length} pekerjaan tersedia di area utama
              </p>
            </div>

            {/* Job list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
              {filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedId === job.id}
                  quoted={job.id in quotedJobs}
                  onClick={() => setSelectedId(selectedId === job.id ? null : job.id)}
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-[#7890AA]">
                  <p className="text-[32px] mb-3">🔍</p>
                  <p className="font-bold text-[14px]">Tidak ada pekerjaan</p>
                  <p className="text-[12px] mt-1">Coba ubah filter atau kata kunci</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: detail */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {selectedJob ? (
              <JobDetail
                job={selectedJob}
                quoted={selectedJob.id in quotedJobs}
                quotedPrice={quotedJobs[selectedJob.id] ?? 0}
                onQuote={(price) => setQuotedJobs((prev) => ({ ...prev, [selectedJob.id]: price }))}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#7890AA] gap-3">
                <div className="w-20 h-20 rounded-full bg-[#EEF3FB] flex items-center justify-center text-[40px]">🔧</div>
                <p className="font-bold text-[16px] text-[#294566]">Pilih pekerjaan untuk melihat detail</p>
                <p className="text-[13px]">Klik salah satu lowongan di sebelah kiri</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PENAWARAN SAYA tab ── */}
      {navTab === "penawaran" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-[860px] mx-auto w-full">
          <h2 className="font-black text-[22px] text-[#172E4D] mb-5">Penawaran Saya</h2>
          {loadingTab ? (
            <div className="flex items-center gap-2 text-[#58708D] py-8">
              <Loader2 size={18} className="animate-spin" /> Memuat penawaran...
            </div>
          ) : myOffers.length === 0 ? (
            <p className="text-[14px] text-[#7890AA]">Belum ada penawaran. Kirim penawaran dari tab Lowongan.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {myOffers.map((offer) => {
                const statusLabel = OFFER_STATUS_LABEL[offer.status] ?? offer.status;
                return (
                  <div key={offer.id} className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-bold text-[15px] text-[#172E4D] leading-snug">{jobTitleFromOffer(offer)}</p>
                      <span className={`text-[11px] font-bold border px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[statusLabel] ?? ""}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[12px] text-[#58708D]">
                      {jobAreaFromOffer(offer) && (
                        <span className="flex items-center gap-1"><MapPin size={11} className="text-[#1D4196]"/>{jobAreaFromOffer(offer)}</span>
                      )}
                      <span className="font-bold text-[#172E4D]">{formatPrice(offer.price)}</span>
                    </div>
                    {offer.status === "accepted" && canMessageOnJob(jobStatusFromOffer(offer)) && (
                      <Link
                        to={`/pesan/${offer.job_id}`}
                        className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-[#D8E2F0] text-[#294566] font-bold text-[13px] py-2.5 rounded-xl hover:border-[#1D4196] hover:text-[#1D4196] transition-colors"
                      >
                        <MessageCircle size={15} /> Kirim pesan ke pelanggan
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PEKERJAAN AKTIF tab ── */}
      {navTab === "aktif" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-[860px] mx-auto w-full">
          <h2 className="font-black text-[22px] text-[#172E4D] mb-5">Pekerjaan Aktif</h2>
          {loadingTab ? (
            <div className="flex items-center gap-2 text-[#58708D] py-8">
              <Loader2 size={18} className="animate-spin" /> Memuat pekerjaan aktif...
            </div>
          ) : activeJobs.length === 0 ? (
            <p className="text-[14px] text-[#7890AA]">Tidak ada pekerjaan aktif. Pekerjaan muncul setelah pelanggan membayar.</p>
          ) : (
            activeJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-[#D8E2F0] overflow-hidden mb-4">
                <div className="bg-[#172E4D] px-5 py-3 flex items-center justify-between">
                  <p className="font-bold text-[14px] text-white">{job.title}</p>
                  <span className="text-[11px] font-bold bg-[#20bf6f]/20 text-[#bbf7d0] border border-[#20bf6f]/30 px-2.5 py-0.5 rounded-full">Berjalan</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1D4196]/20 flex items-center justify-center text-[#1D4196] font-black text-[13px]">
                      {(job.poster?.name ?? "?")[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[14px] text-[#172E4D]">{job.poster?.name ?? "Pelanggan"}</p>
                      {job.poster && (job.poster.jobsPosted ?? 0) > 0 && (
                        <p className="text-[11px] text-[#58708D]">{job.poster.jobsPosted} pekerjaan diposting</p>
                      )}
                    </div>
                    <div className="ml-auto text-right">
                      <p className="font-black text-[18px] text-[#1D4196]">{job.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-[13px] text-[#58708D]">
                    <span className="flex items-center gap-1"><MapPin size={13} className="text-[#1D4196]"/>{job.area}</span>
                    {job.date && <span className="flex items-center gap-1"><Clock size={13}/>{job.date}</span>}
                  </div>

                  <Link
                    to={`/pesan/${job.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[13px] py-3 rounded-xl transition-colors"
                  >
                    <MessageCircle size={15} /> Hubungi pelanggan
                  </Link>

                  {job.technicianCompletedAt ? (
                    <div className="w-full text-center bg-[#fef9c3] border border-yellow-200 text-yellow-800 font-semibold text-[13px] py-3 rounded-xl">
                      Menunggu konfirmasi pelanggan
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={completingId === job.id}
                      onClick={() => handleCompleteJob(job.id)}
                      className="w-full border-2 border-[#20bf6f] text-[#20bf6f] font-bold text-[13px] py-3 rounded-xl hover:bg-[#f0fdf4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {completingId === job.id ? <Loader2 size={14} className="animate-spin" /> : null}
                      Tandai Selesai ✓
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── SELESAI tab ── */}
      {navTab === "selesai" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-[860px] mx-auto w-full">
          <h2 className="font-black text-[22px] text-[#172E4D] mb-5">Pekerjaan Selesai</h2>
          {loadingTab ? (
            <div className="flex items-center gap-2 text-[#58708D] py-8">
              <Loader2 size={18} className="animate-spin" /> Memuat riwayat...
            </div>
          ) : completedJobs.length === 0 ? (
            <p className="text-[14px] text-[#7890AA]">Belum ada pekerjaan selesai.</p>
          ) : (
            completedJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-[#D8E2F0] p-5 mb-3">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-bold text-[15px] text-[#172E4D] leading-snug">{job.title}</p>
                  <p className="font-black text-[16px] text-[#1D4196] shrink-0 ml-3">{job.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1D4196]/20 flex items-center justify-center text-[#1D4196] font-black text-[11px]">
                    {(job.poster?.name ?? "?")[0]}
                  </div>
                  <p className="font-semibold text-[13px] text-[#172E4D]">{job.poster?.name ?? "Pelanggan"}</p>
                  <span className="ml-auto text-[11px] text-[#7890AA] flex items-center gap-1">
                    <CheckCircle size={12} className="text-[#20bf6f]" /> Selesai
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
