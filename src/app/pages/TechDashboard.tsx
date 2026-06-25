import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import {
  Search, MapPin, Calendar, Clock, Shield, CheckCircle,
  ChevronDown, Bell, Star, SlidersHorizontal, Send,
  Briefcase, FileText, TrendingUp, LogOut, Filter,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { Job, TechnicianOffer } from "../../types";

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
  posterRating: number;
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
    posterRating: j.poster?.rating ?? 4.8,
    offers: j.offers,
    description: j.description,
  };
}

const CATEGORY_FILTERS = [
  { id: "semua", label: "Semua" },
  { id: "darurat", label: "Darurat" },
  { id: "deteksi", label: "Deteksi" },
  { id: "mampet", label: "Saluran Mampet" },
  { id: "water", label: "Pemanas Air" },
  { id: "pipa", label: "Ganti Pipa" },
  { id: "bathroom", label: "Kamar Mandi" },
  { id: "maintenance", label: "Perawatan" },
  { id: "handyman", label: "Tukang Serba Bisa" },
  { id: "pintu", label: "Pintu" },
  { id: "talang", label: "Talang" },
  { id: "keramik", label: "Keramik" },
  { id: "atap", label: "Atap" },
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

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 jam lalu" : `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function offerStatusLabel(status: string): string {
  if (status === "accepted") return "Diterima";
  if (status === "rejected") return "Ditolak";
  return "Menunggu";
}

const OFFER_STATUS_STYLE: Record<string, string> = {
  Menunggu: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Diterima: "bg-[#f0fdf4] text-[#20bf6f] border-[#bbf7d0]",
  Ditolak: "bg-red-50 text-red-600 border-red-200",
};

function quotedJobIdsFromOffers(offers: TechnicianOffer[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const o of offers) {
    if (o.status === "pending" || o.status === "accepted") {
      map[o.jobId] = o.price;
    }
  }
  return map;
}

function Avatar({ initials, color, size = "sm" }: { initials: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-14 h-14 text-[18px]" : size === "md" ? "w-10 h-10 text-[13px]" : "w-8 h-8 text-[11px]";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-white font-black shrink-0`} style={{ background: color }}>
      {initials}
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((i) => (
          <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <span className="text-[11px] text-[#3d6b5e] font-semibold">{rating}</span>
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
        selected ? "border-[#2E5090] shadow-md ring-1 ring-[#2E5090]/20"
        : "border-[#c8dfd8] hover:border-[#F59E42] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {urgent && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mb-1.5">
              ⚡ DARURAT
            </span>
          )}
          <p className="font-bold text-[14px] text-[#1a2d4a] leading-snug">{job.title}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-black text-[15px] text-[#1a2d4a]">{job.budget}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2.5 text-[11px] text-[#3d6b5e]">
        <span className="flex items-center gap-1"><MapPin size={11} className="text-[#2E5090]" />{job.area}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{job.date}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#3d6b5e]">{job.offers} penawaran masuk</span>
        {quoted ? (
          <span className="text-[11px] font-bold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle size={10} /> Penawaran terkirim
          </span>
        ) : (
          <span className="text-[11px] font-bold text-[#2E5090] bg-[#f0f7f4] px-2.5 py-0.5 rounded-full">Terbuka</span>
        )}
      </div>
    </button>
  );
}

// ─── Quote Form ───────────────────────────────────────────────────────────────

function QuoteForm({
  job,
  onSuccess,
  canQuote,
  quoteBlockReason,
}: {
  job: ApiJob;
  onSuccess: (price: number) => void;
  canQuote: boolean;
  quoteBlockReason?: string;
}) {
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [waktu, setWaktu] = useState("segera");
  const [jam, setJam] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const priceNum = parseInt(price.replace(/\D/g, "")) || 0;
  const valid = priceNum >= 50000 && note.trim().length >= 20 && canQuote;

  const formatRp = (v: string) => {
    const n = v.replace(/\D/g, "");
    return n ? `Rp ${parseInt(n).toLocaleString("id-ID")}` : "";
  };

  const submit = async () => {
    if (!valid) return;
    setSubmitError("");
    setLoading(true);
    try {
      await api.createOffer(job.id, {
        price: priceNum,
        message: note,
        availability: waktu,
        scheduledTime: jam || undefined,
      });
      onSuccess(priceNum);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim penawaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {!canQuote && quoteBlockReason && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-900 font-semibold leading-relaxed">{quoteBlockReason}</p>
        </div>
      )}
      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Harga yang Anda tawarkan</label>
        <div className="relative">
          <input
            value={price}
            onChange={(e) => setPrice(formatRp(e.target.value))}
            placeholder="Rp 0"
            className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[18px] font-black text-[#1a2d4a] placeholder-[#d4b0b0] bg-[#F5F1E8] outline-none focus:border-[#2E5090] transition-all"
          />
        </div>
        {priceNum > 0 && (
          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className="text-[#3d6b5e]">Anggaran pelanggan:</span>
            <span className="font-bold text-[#1a2d4a]">{job.budget}</span>
            {priceNum <= job.budgetRaw ? (
              <span className="text-[#20bf6f] font-bold">✓ Sesuai anggaran</span>
            ) : (
              <span className="text-[#e85d26] font-bold">↑ Di atas anggaran</span>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Kapan Anda bisa mulai?</label>
        <div className="grid grid-cols-2 gap-2">
          {WAKTU_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setWaktu(opt.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                waktu === opt.id
                  ? "border-[#2E5090] bg-[#f0f7f4] text-[#2E5090]"
                  : "border-[#c8dfd8] bg-white text-[#1a3d5c] hover:border-[#F59E42]"
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
            className="mt-2 w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-2.5 text-[14px] text-[#0f2035] bg-[#F5F1E8] outline-none focus:border-[#2E5090] transition-all"
          />
        )}
        {waktu === "pilih" && (
          <input
            type="datetime-local"
            className="mt-2 w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-2.5 text-[14px] text-[#0f2035] bg-[#F5F1E8] outline-none focus:border-[#2E5090] transition-all"
          />
        )}
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">
          Pesan kepada pelanggan
          <span className="font-normal text-[#7a9a8f] ml-1">(min. 20 karakter)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Contoh: Saya berpengalaman menangani masalah pipa pecah darurat. Bisa tiba dalam 30 menit. Harga sudah termasuk inspeksi dan perbaikan awal..."
          className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#2E5090] resize-none transition-all"
        />
        <div className="flex justify-between mt-1">
          <p className="text-[11px] text-[#7a9a8f]">Pesan bagus meningkatkan peluang dipilih</p>
          <p className={`text-[11px] font-semibold ${note.length >= 20 ? "text-[#20bf6f]" : "text-[#7a9a8f]"}`}>
            {note.length} karakter
          </p>
        </div>
      </div>

      <div className="bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4 text-[12px] text-[#3d6b5e]">
        <p className="font-bold text-[#0f2035] mb-1.5">💡 Tips agar penawaran Anda dipilih:</p>
        <ul className="space-y-1">
          <li>• Sebutkan pengalaman spesifik yang relevan dengan masalah ini</li>
          <li>• Tawarkan garansi pekerjaan jika memungkinkan</li>
          <li>• Jelaskan apa yang termasuk dalam harga Anda</li>
          <li>• Respons cepat meningkatkan kepercayaan pelanggan</li>
        </ul>
      </div>

      {submitError && (
        <p className="text-[13px] text-red-600 font-semibold">{submitError}</p>
      )}

      <button
        onClick={submit}
        disabled={!valid || loading}
        className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-4 rounded-2xl transition-all ${
          valid && !loading
            ? "bg-[#2E5090] hover:bg-[#1e3d7a] text-white shadow-sm"
            : "bg-[#c8dfd8] text-[#7a9a8f] cursor-not-allowed"
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
        <h3 className="font-black text-[22px] text-[#1a2d4a] mb-1">Penawaran Terkirim!</h3>
        <p className="text-[#3d6b5e] text-[14px]">
          Penawaran Anda untuk <span className="font-bold text-[#1a2d4a]">{formatRp(price)}</span> sudah dikirim ke pelanggan
        </p>
      </div>

      <div className="w-full bg-[#1a2d4a] rounded-2xl overflow-hidden text-left">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">Pekerjaan</p>
          <p className="font-bold text-[14px] text-white leading-snug">{job.title}</p>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          {[
            ["Anggaran pelanggan", job.budget],
            ["Penawaran Anda", formatRp(price)],
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

      <div className="w-full space-y-2.5 text-[13px] text-[#3d6b5e] bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4 text-left">
        <p className="font-bold text-[#0f2035] mb-2">Apa yang terjadi selanjutnya?</p>
        {[
          { icon: "🔔", text: "Anda akan dapat notifikasi jika pelanggan menerima penawaran Anda" },
          { icon: "💬", text: "Pelanggan mungkin menghubungi Anda untuk bertanya sebelum memilih" },
          { icon: "✅", text: "Jika diterima, Anda bisa langsung atur jadwal dengan pelanggan" },
          { icon: "💰", text: "Pembayaran masuk ke akun Anda setelah pekerjaan dikonfirmasi selesai" },
        ].map((item) => (
          <div key={item.icon} className="flex items-start gap-2.5">
            <span className="text-[16px] shrink-0 mt-0.5">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] py-3 rounded-2xl hover:border-[#2E5090] hover:text-[#2E5090] transition-all"
      >
        Lihat lowongan lain
      </button>
    </div>
  );
}

// ─── Job Detail Panel ─────────────────────────────────────────────────────────

function JobDetail({ job, quoted, quotedPrice, onQuote, canQuote, quoteBlockReason }: {
  job: ApiJob;
  quoted: boolean;
  quotedPrice: number;
  onQuote: (price: number) => void;
  canQuote: boolean;
  quoteBlockReason?: string;
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
              <h2 className="font-black text-[18px] text-[#1a2d4a] leading-snug">{job.title}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-[20px] text-[#2E5090]">{job.budget}</p>
              <p className="text-[10px] text-[#7a9a8f]">Anggaran</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[12px] text-[#3d6b5e]">
            <span className="flex items-center gap-1 bg-[#F5F1E8] px-2.5 py-1 rounded-lg">
              <MapPin size={12} className="text-[#2E5090]" /> {job.area}
            </span>
            <span className="flex items-center gap-1 bg-[#F5F1E8] px-2.5 py-1 rounded-lg">
              <Calendar size={12} className="text-[#2E5090]" /> {job.date}
            </span>
            <span className="flex items-center gap-1 bg-[#F5F1E8] px-2.5 py-1 rounded-lg">
              <Clock size={12} className="text-[#2E5090]" /> {job.time}
            </span>
            <span className="bg-[#F5F1E8] px-2.5 py-1 rounded-lg font-medium">
              {job.offers} penawaran
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
                tab === t.id ? "text-[#2E5090]" : "text-[#7a9a8f] hover:text-[#3d6b5e]"
              }`}
            >
              {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2E5090] rounded-t" />}
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
              <div className="flex items-center gap-3 bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-[#2E5090]/20 flex items-center justify-center text-[#2E5090] font-black text-[13px]">
                  {job.posterName[0]}
                </div>
                <div>
                  <p className="font-bold text-[13px] text-[#0f2035]">{job.posterName}</p>
                  <StarRow rating={job.posterRating} />
                </div>
                <div className="ml-auto">
                  <span className="text-[11px] font-bold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
                    ✓ Terverifikasi
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="font-bold text-[12px] text-[#7a9a8f] uppercase tracking-wider mb-3">Deskripsi pekerjaan</p>
                <p className="text-[14px] text-[#1a3d5c] leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                <Shield size={16} className="text-[#20bf6f] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#166534] font-semibold">
                  Pembayaran dijamin — dana ditahan aman oleh KerjaIn Pay dan dicairkan ke Anda setelah pekerjaan selesai dan dikonfirmasi pelanggan.
                </p>
              </div>

              <button
                onClick={() => canQuote && setTab("ajukan")}
                disabled={quoted || !canQuote}
                className={`w-full font-bold text-[14px] py-3.5 rounded-2xl transition-colors ${
                  quoted
                    ? "bg-[#f0fdf4] text-[#20bf6f] border border-[#bbf7d0] cursor-default"
                    : canQuote
                      ? "bg-[#2E5090] hover:bg-[#1e3d7a] text-white"
                      : "bg-[#c8dfd8] text-[#7a9a8f] cursor-not-allowed"
                }`}
              >
                {quoted ? "✓ Penawaran sudah terkirim" : canQuote ? "Ajukan Penawaran →" : "Verifikasi diperlukan"}
              </button>
              {!canQuote && !quoted && quoteBlockReason && (
                <p className="text-[12px] text-amber-800 font-semibold">{quoteBlockReason}</p>
              )}
            </div>
          )}

          {tab === "ajukan" && (
            quoted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#f0fdf4] border-4 border-[#bbf7d0] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-[#20bf6f]" fill="#20bf6f" />
                </div>
                <p className="font-black text-[18px] text-[#1a2d4a] mb-1">Penawaran Terkirim</p>
                <p className="text-[13px] text-[#3d6b5e]">Harga penawaran: <span className="font-bold text-[#1a2d4a]">Rp {quotedPrice.toLocaleString("id-ID")}</span></p>
                <p className="text-[12px] text-[#7a9a8f] mt-2">Tunggu konfirmasi dari pelanggan</p>
              </div>
            ) : (
              <QuoteForm
                job={job}
                onSuccess={handleSuccess}
                canQuote={canQuote}
                quoteBlockReason={quoteBlockReason}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function TechDashboard() {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [myOffers, setMyOffers] = useState<TechnicianOffer[]>([]);
  const [techArea, setTechArea] = useState<string | null>(null);
  const [techVerified, setTechVerified] = useState(false);
  const [requireVerifiedToQuote, setRequireVerifiedToQuote] = useState(false);
  const [areaScope, setAreaScope] = useState<"my-area" | "all">("my-area");
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [navTab, setNavTab] = useState<"lowongan" | "penawaran" | "aktif" | "selesai">("lowongan");
  const [filterTab, setFilterTab] = useState("semua");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quotedJobs, setQuotedJobs] = useState<Record<string, number>>({});

  const loadMyOffers = (showLoading = false) => {
    if (showLoading) setLoadingOffers(true);
    return api
      .getMyOffers()
      .then(({ offers }) => {
        setMyOffers(offers);
        setQuotedJobs(quotedJobIdsFromOffers(offers));
      })
      .catch(() => {
        setMyOffers([]);
        setQuotedJobs({});
      })
      .finally(() => {
        if (showLoading) setLoadingOffers(false);
      });
  };

  useEffect(() => {
    api.getTechnicianProfile()
      .then(({ profile }) => {
        if (profile?.area) {
          setTechArea(profile.area);
          setAreaScope("my-area");
        } else {
          setAreaScope("all");
        }
        setTechVerified(profile?.verified ?? false);
      })
      .catch(() => setAreaScope("all"));

    api.getAppConfig()
      .then(({ config }) => setRequireVerifiedToQuote(config.requireVerifiedToQuote))
      .catch(() => {});

    loadMyOffers(true);
  }, []);

  useEffect(() => {
    setLoadingJobs(true);
    api
      .getJobs({
        search: search || undefined,
        area: areaScope === "my-area" && techArea ? techArea : undefined,
      })
      .then(({ jobs: data }) => setJobs(data.map(mapJob)))
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false));
  }, [search, areaScope, techArea]);

  useEffect(() => {
    if (navTab !== "aktif") return;
    setLoadingAssigned(true);
    api.getAssignedJobs()
      .then(({ jobs: data }) => setAssignedJobs(data))
      .catch(() => setAssignedJobs([]))
      .finally(() => setLoadingAssigned(false));
  }, [navTab]);

  useEffect(() => {
    if (navTab === "penawaran") loadMyOffers(true);
  }, [navTab]);

  const unquotedJobs = jobs.filter((j) => !(j.id in quotedJobs));

  const filtered = unquotedJobs.filter((j) => {
    const matchCat = filterTab === "semua" || j.category === filterTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q || j.title.toLowerCase().includes(q) || j.area.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { semua: unquotedJobs.length };
    for (const j of unquotedJobs) {
      counts[j.category] = (counts[j.category] ?? 0) + 1;
    }
    return counts;
  }, [unquotedJobs]);

  const selectedJob = jobs.find((j) => j.id === selectedId) ?? null;

  const pendingOffers = myOffers.filter((o) => o.status === "pending").length;

  const canQuote = !requireVerifiedToQuote || techVerified;
  const quoteBlockReason = canQuote
    ? undefined
    : "Akun Anda belum diverifikasi admin. Upload KTP di profil dan tunggu persetujuan sebelum mengajukan penawaran.";

  const TUKANG = {
    name: user?.fullName ?? "Tukang",
    initials: (user?.fullName ?? "T").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    area: techArea ?? "Jakarta",
    keahlian: ["Pipa Bocor Darurat", "Saluran Mampet"],
    rating: 4.9,
    reviews: 0,
    selesai: 0,
    penawaran_aktif: pendingOffers,
    penghasilan: "Rp 0",
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>

      {/* ── Top nav ── */}
      <header className="bg-[#1a2d4a] text-white shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo + badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="font-black text-[18px] text-[#F59E42]">KerjaIn</Link>
            <span className="text-[10px] font-bold bg-[#2E5090] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
              Dasbor Tukang
            </span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-4">
            <button className="relative text-white/70 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2E5090] text-white text-[9px] font-black rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2E5090] flex items-center justify-center text-white font-black text-[12px]">
                {TUKANG.initials}
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-[13px] text-white leading-none">{TUKANG.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {techVerified ? (
                    <>
                      <CheckCircle size={10} className="text-[#20bf6f]" />
                      <span className="text-[10px] text-[#20bf6f] font-bold">Terverifikasi</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-amber-300 font-bold">⏳ Menunggu verifikasi</span>
                  )}
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
              { label: "Rating",             value: `${TUKANG.rating} ⭐` },
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

      {!techVerified && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-center">
          <p className="text-[12px] text-amber-900 font-semibold">
            Identitas Anda sedang ditinjau. Setelah disetujui admin, badge terverifikasi akan muncul di profil Anda.
          </p>
        </div>
      )}

      {/* ── Nav tabs ── */}
      <div className="bg-white border-b border-[#f5eded] shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 flex">
          {NAV_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setNavTab(t.id as typeof navTab)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-bold transition-all relative border-b-2 ${
                navTab === t.id
                  ? "text-[#2E5090] border-[#2E5090]"
                  : "text-[#7a9a8f] border-transparent hover:text-[#3d6b5e]"
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
            <div className="p-4 border-b border-[#c8dfd8]">
              <div className="flex items-center gap-2 bg-[#f0f7f4] rounded-xl px-3 py-2.5 border border-transparent focus-within:border-[#2E5090] transition-all">
                <Search size={15} className="text-[#7a9a8f] shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pekerjaan…"
                  className="bg-transparent text-[13px] text-[#1a3d5c] placeholder-[#7a9a8f] outline-none w-full"
                />
              </div>
            </div>

            {/* Area + category filters */}
            <div className="px-4 py-2.5 border-b border-[#c8dfd8] flex gap-2">
              <button
                type="button"
                onClick={() => setAreaScope("my-area")}
                disabled={!techArea}
                className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all ${
                  areaScope === "my-area"
                    ? "bg-[#2E5090] text-white"
                    : "bg-[#f0f7f4] text-[#3d6b5e] hover:bg-[#e8f4ef] disabled:opacity-40"
                }`}
              >
                {techArea ? `Area saya · ${techArea}` : "Area saya"}
              </button>
              <button
                type="button"
                onClick={() => setAreaScope("all")}
                className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all ${
                  areaScope === "all"
                    ? "bg-[#2E5090] text-white"
                    : "bg-[#f0f7f4] text-[#3d6b5e] hover:bg-[#e8f4ef]"
                }`}
              >
                Semua Jabodetabek
              </button>
            </div>

            <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-[#c8dfd8]" style={{ scrollbarWidth: "none" }}>
              {CATEGORY_FILTERS.map((f) => {
                const count = categoryCounts[f.id] ?? 0;
                if (f.id !== "semua" && count === 0) return null;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterTab(f.id)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      filterTab === f.id
                        ? "bg-[#2E5090] text-white"
                        : "bg-[#f0f7f4] text-[#3d6b5e] hover:bg-[#ffe0e0]"
                    }`}
                  >
                    {f.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filterTab === f.id ? "bg-white/20" : "bg-white"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Job count */}
            <div className="px-4 py-2 border-b border-[#c8dfd8]">
              <p className="text-[11px] text-[#7a9a8f] font-semibold">
                {loadingJobs
                  ? "Memuat lowongan…"
                  : `${filtered.length} lowongan baru · ${Object.keys(quotedJobs).length} sudah Anda tawari`}
              </p>
            </div>

            {/* Job list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
              {loadingJobs && (
                <p className="text-center py-12 text-[#7a9a8f] text-[13px]">Memuat…</p>
              )}
              {!loadingJobs && filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedId === job.id}
                  quoted={job.id in quotedJobs}
                  onClick={() => setSelectedId(selectedId === job.id ? null : job.id)}
                />
              ))}
              {!loadingJobs && filtered.length === 0 && (
                <div className="text-center py-16 text-[#7a9a8f]">
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
                canQuote={canQuote}
                quoteBlockReason={quoteBlockReason}
                onQuote={(price) => {
                  setQuotedJobs((prev) => ({ ...prev, [selectedJob.id]: price }));
                  loadMyOffers();
                  setSelectedId(null);
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#7a9a8f] gap-3">
                <div className="w-20 h-20 rounded-full bg-[#f0f7f4] flex items-center justify-center text-[40px]">🔧</div>
                <p className="font-bold text-[16px] text-[#1a3d5c]">Pilih pekerjaan untuk melihat detail</p>
                <p className="text-[13px]">Klik salah satu lowongan di sebelah kiri</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PENAWARAN SAYA tab ── */}
      {navTab === "penawaran" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-[860px] mx-auto w-full">
          <h2 className="font-black text-[22px] text-[#1a2d4a] mb-5">Penawaran Saya</h2>
          {loadingOffers && (
            <p className="text-[#7a9a8f] text-[14px]">Memuat penawaran…</p>
          )}
          {!loadingOffers && myOffers.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#c8dfd8] p-8 text-center">
              <p className="text-[#7a9a8f] text-[14px]">Belum ada penawaran. Kirim penawaran dari tab Lowongan.</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {myOffers.map((offer) => {
              const statusLabel = offerStatusLabel(offer.status);
              return (
                <div key={offer.id} className="bg-white rounded-2xl border border-[#c8dfd8] p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="font-bold text-[15px] text-[#1a2d4a] leading-snug">
                      {offer.job?.title ?? "Pekerjaan"}
                    </p>
                    <span className={`text-[11px] font-bold border px-2.5 py-0.5 rounded-full shrink-0 ${OFFER_STATUS_STYLE[statusLabel]}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[12px] text-[#3d6b5e]">
                    {offer.job?.area && (
                      <span className="flex items-center gap-1"><MapPin size={11} className="text-[#2E5090]"/>{offer.job.area}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock size={11}/>{formatTimeAgo(offer.createdAt)}</span>
                    <span className="font-bold text-[#1a2d4a]">{offer.priceFormatted}</span>
                  </div>
                  {offer.status === "accepted" && offer.job?.id && (
                    <Link
                      to={`/pekerjaan/${offer.job.id}`}
                      className="mt-3 block w-full text-center bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[13px] py-2.5 rounded-xl transition-colors"
                    >
                      Buka Pekerjaan →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PEKERJAAN AKTIF tab ── */}
      {navTab === "aktif" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-[860px] mx-auto w-full">
          <h2 className="font-black text-[22px] text-[#1a2d4a] mb-5">Pekerjaan Aktif</h2>
          {loadingAssigned && (
            <p className="text-[#7a9a8f] text-[14px]">Memuat pekerjaan aktif…</p>
          )}
          {!loadingAssigned && assignedJobs.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#c8dfd8] p-8 text-center">
              <p className="text-[#7a9a8f] text-[14px]">Belum ada pekerjaan aktif. Penawaran yang diterima akan muncul di sini.</p>
            </div>
          )}
          {assignedJobs.map((job) => {
            const statusLabel =
              job.status === "in_progress" ? "Sedang dikerjakan" : "Menunggu pembayaran";
            const schedule = job.scheduledAt
              ? new Date(job.scheduledAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              : job.date ?? "Jadwal fleksibel";
            return (
              <div key={job.id} className="bg-white rounded-2xl border border-[#c8dfd8] overflow-hidden mb-4">
                <div className="bg-[#1a2d4a] px-5 py-3 flex items-center justify-between gap-3">
                  <p className="font-bold text-[14px] text-white line-clamp-1">{job.title}</p>
                  <span className="text-[11px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2.5 py-0.5 rounded-full shrink-0">
                    {statusLabel}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2E5090]/20 flex items-center justify-center text-[#2E5090] font-black text-[13px]">
                      {(job.poster?.name ?? "P")[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[14px] text-[#0f2035]">{job.poster?.name ?? "Pelanggan"}</p>
                      {job.poster?.rating != null && <StarRow rating={job.poster.rating} />}
                    </div>
                    <div className="ml-auto text-right">
                      <p className="font-black text-[18px] text-[#2E5090]">{job.price}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-[13px] text-[#3d6b5e]">
                    <span className="flex items-center gap-1"><MapPin size={13} className="text-[#2E5090]"/>{job.area}</span>
                    <span className="flex items-center gap-1"><Clock size={13}/>{schedule}</span>
                  </div>

                  <Link
                    to={`/pekerjaan/${job.id}`}
                    className="block w-full text-center bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[13px] py-3 rounded-xl transition-colors"
                  >
                    Buka Pekerjaan →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SELESAI tab ── */}
      {navTab === "selesai" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-[860px] mx-auto w-full">
          <h2 className="font-black text-[22px] text-[#1a2d4a] mb-5">Pekerjaan Selesai</h2>
          {[
            { job: "Pipa bocor darurat – apartemen Lt.3",  customer: "Bowo S.",  price: "Rp 450rb", rating: 5.0, review: "Andi sangat profesional dan cepat! Datang dalam 30 menit dan beres dalam 1 jam.", date: "2 hari lalu" },
            { job: "Pasang kran baru – kamar mandi utama", customer: "Hana S.",  price: "Rp 180rb", rating: 5.0, review: "Rapi, tepat waktu, dan harga sesuai. Sangat puas!", date: "1 minggu lalu" },
            { job: "Ganti seal kloset bocor",               customer: "Citra N.", price: "Rp 120rb", rating: 4.0, review: "Pekerjaan bagus. Sedikit terlambat dari jadwal.", date: "2 minggu lalu" },
          ].map((job, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#c8dfd8] p-5 mb-3">
              <div className="flex items-start justify-between mb-3">
                <p className="font-bold text-[15px] text-[#1a2d4a] leading-snug">{job.job}</p>
                <p className="font-black text-[16px] text-[#2E5090] shrink-0 ml-3">{job.price}</p>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#2E5090]/20 flex items-center justify-center text-[#2E5090] font-black text-[11px]">
                  {job.customer[0]}
                </div>
                <div>
                  <p className="font-semibold text-[13px] text-[#0f2035]">{job.customer}</p>
                  <StarRow rating={job.rating} />
                </div>
                <span className="ml-auto text-[11px] text-[#7a9a8f]">{job.date}</span>
              </div>
              <div className="bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl px-4 py-3 text-[12px] text-[#3d6b5e] italic">
                "{job.review}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
