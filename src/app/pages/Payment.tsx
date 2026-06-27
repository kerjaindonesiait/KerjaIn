import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft, Shield, CheckCircle, Copy, Clock,
  AlertCircle, ChevronRight, Lock, Smartphone, CreditCard, Building2, MessageCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION } from "../../constants";
import { useScrollToTop } from "../../lib/useScrollToTop";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, opts: Record<string, () => void>) => void;
    };
  }
}

function loadMidtransSnap(): Promise<void> {
  if (window.snap) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MIDTRANS_IS_PRODUCTION
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
    document.body.appendChild(script);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PayMethod = "gopay" | "ovo" | "dana" | "shopee" | "bca" | "mandiri" | "bri" | "card";
type Screen = "method" | "confirm" | "processing" | "success" | "pending";

type PaymentSummary = {
  jobNumber: string;
  title: string;
  category: string;
  emoji: string;
  tasker: { name: string; initials: string; color: string; rating: number; reviews: number };
  quotePrice: number;
};

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

// ─── Payment method config ────────────────────────────────────────────────────

const METHODS: {
  id: PayMethod;
  label: string;
  group: string;
  color: string;
  bg: string;
  logo: React.ReactNode;
  desc: string;
  instant: boolean;
}[] = [
  {
    id: "gopay",
    label: "GoPay",
    group: "E-Wallet",
    color: "#00AED6",
    bg: "#e6f8fc",
    logo: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#00AED6" />
        <text x="50%" y="67%" textAnchor="middle" fill="white" fontWeight="900" fontSize="13" fontFamily="Manrope,sans-serif">GO</text>
      </svg>
    ),
    desc: "Bayar dari saldo GoPay",
    instant: true,
  },
  {
    id: "ovo",
    label: "OVO",
    group: "E-Wallet",
    color: "#4C3494",
    bg: "#f0ecff",
    logo: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#4C3494" />
        <text x="50%" y="67%" textAnchor="middle" fill="white" fontWeight="900" fontSize="11" fontFamily="Manrope,sans-serif">OVO</text>
      </svg>
    ),
    desc: "Bayar dari saldo OVO",
    instant: true,
  },
  {
    id: "dana",
    label: "DANA",
    group: "E-Wallet",
    color: "#118EEA",
    bg: "#e8f4fe",
    logo: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#118EEA" />
        <text x="50%" y="67%" textAnchor="middle" fill="white" fontWeight="900" fontSize="10" fontFamily="Manrope,sans-serif">DANA</text>
      </svg>
    ),
    desc: "Bayar dari saldo DANA",
    instant: true,
  },
  {
    id: "shopee",
    label: "ShopeePay",
    group: "E-Wallet",
    color: "#EE4D2D",
    bg: "#fdf0ee",
    logo: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#EE4D2D" />
        <text x="50%" y="67%" textAnchor="middle" fill="white" fontWeight="900" fontSize="8" fontFamily="Manrope,sans-serif">SPAY</text>
      </svg>
    ),
    desc: "Bayar dari saldo ShopeePay",
    instant: true,
  },
  {
    id: "bca",
    label: "BCA Virtual Account",
    group: "Transfer Bank",
    color: "#005BAA",
    bg: "#e6eef8",
    logo: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#005BAA" />
        <text x="50%" y="67%" textAnchor="middle" fill="white" fontWeight="900" fontSize="11" fontFamily="Manrope,sans-serif">BCA</text>
      </svg>
    ),
    desc: "Transfer via ATM / m-Banking BCA",
    instant: false,
  },
  {
    id: "mandiri",
    label: "Mandiri Virtual Account",
    group: "Transfer Bank",
    color: "#003D7C",
    bg: "#e6eaf5",
    logo: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#003D7C" />
        <text x="50%" y="67%" textAnchor="middle" fill="white" fontWeight="900" fontSize="8" fontFamily="Manrope,sans-serif">MNDR</text>
      </svg>
    ),
    desc: "Transfer via ATM / Livin' by Mandiri",
    instant: false,
  },
  {
    id: "bri",
    label: "BRI Virtual Account",
    group: "Transfer Bank",
    color: "#005B99",
    bg: "#e6eef6",
    logo: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#005B99" />
        <text x="50%" y="67%" textAnchor="middle" fill="white" fontWeight="900" fontSize="11" fontFamily="Manrope,sans-serif">BRI</text>
      </svg>
    ),
    desc: "Transfer via ATM / BRImo",
    instant: false,
  },
  {
    id: "card",
    label: "Kartu Kredit / Debit",
    group: "Kartu",
    color: "#172E4D",
    bg: "#F7F9FC",
    logo: <CreditCard size={24} className="text-[#172E4D]" />,
    desc: "Visa, Mastercard, JCB",
    instant: true,
  },
];

// ─── Virtual account pending screen ──────────────────────────────────────────

function VAPendingScreen({
  method,
  vaNumber,
  total,
  paymentId,
  onConfirm,
  confirming,
}: {
  method: PayMethod;
  vaNumber: string;
  total: number;
  paymentId: string | null;
  onConfirm: () => void;
  confirming: boolean;
}) {
  const m = METHODS.find((x) => x.id === method)!;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s/g, "")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps: Record<string, string[]> = {
    bca: [
      "Buka aplikasi m-BCA atau kunjungi ATM BCA terdekat",
      'Pilih menu "Transfer" → "Virtual Account"',
      `Masukkan nomor VA: ${vaNumber}`,
      `Transfer tepat ${formatRp(total)}`,
      "Simpan bukti transfer",
    ],
    mandiri: [
      "Buka aplikasi Livin' by Mandiri atau ATM Mandiri",
      'Pilih "Bayar" → "Multipayment"',
      `Masukkan kode perusahaan & nomor VA: ${vaNumber}`,
      `Transfer tepat ${formatRp(total)}`,
      "Konfirmasi dan simpan bukti bayar",
    ],
    bri: [
      "Buka aplikasi BRImo atau ATM BRI",
      'Pilih "Pembayaran" → "BRIVA"',
      `Masukkan nomor BRIVA: ${vaNumber}`,
      `Transfer tepat ${formatRp(total)}`,
      "Simpan struk pembayaran",
    ],
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#F7F9FC] border-2 border-[#FD6665] rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0">{m.logo}</div>
          <div>
            <p className="text-[11px] font-bold text-[#7890AA] uppercase tracking-wider">Nomor Virtual Account</p>
            <p className="font-black text-[22px] text-[#172E4D] tracking-widest">{vaNumber}</p>
          </div>
          <button onClick={copy} className="ml-auto flex items-center gap-1.5 text-[#1D4196] font-bold text-[12px] border border-[#FD6665] px-3 py-1.5 rounded-lg hover:bg-[#EEF3FB] transition-colors">
            {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
            {copied ? "Tersalin!" : "Salin"}
          </button>
        </div>
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
          <div>
            <p className="text-[11px] text-[#7890AA] font-semibold">Total pembayaran</p>
            <p className="font-black text-[20px] text-[#1D4196]">{formatRp(total)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#7890AA] font-semibold">Batas waktu</p>
            <div className="flex items-center gap-1 text-[#173577]">
              <Clock size={13} />
              <span className="font-bold text-[14px]">23:59:47</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="font-bold text-[13px] text-[#172E4D] mb-3">Cara membayar:</p>
        <div className="space-y-2">
          {(steps[method] ?? steps.bca).map((step, i) => (
            <div key={i} className="flex items-start gap-3 text-[13px] text-[#294566]">
              <div className="w-5 h-5 rounded-full bg-[#EEF3FB] border border-[#FD6665] flex items-center justify-center text-[10px] font-black text-[#1D4196] shrink-0 mt-0.5">
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 bg-[#fef9c3] border border-yellow-300 rounded-xl p-4 text-[13px] text-yellow-800">
        <AlertCircle size={16} className="shrink-0 mt-0.5 text-yellow-600" />
        Pastikan transfer tepat sesuai jumlah. Perbedaan nominal akan menyebabkan pembayaran tidak terverifikasi otomatis.
      </div>

      <button
        onClick={onConfirm}
        disabled={!paymentId || confirming}
        className="w-full bg-[#1D4196] hover:bg-[#173577] disabled:bg-[#D8E2F0] disabled:text-[#7890AA] text-white font-bold text-[15px] py-4 rounded-2xl transition-colors"
      >
        {confirming ? "Memverifikasi..." : "Saya sudah transfer"}
      </button>
      <p className="text-center text-[12px] text-[#7890AA]">
        Pembayaran akan diverifikasi otomatis dalam 1–5 menit setelah transfer berhasil
      </p>
    </div>
  );
}

// ─── Card form ────────────────────────────────────────────────────────────────

function CardForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [num, setNum] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const formatNum = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");

  const valid = num.replace(/\s/g, "").length === 16 && name.length > 2 && exp.length === 5 && cvv.length >= 3;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 2000);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nomor Kartu</label>
        <div className="relative">
          <input
            value={num}
            onChange={(e) => setNum(formatNum(e.target.value))}
            placeholder="0000 0000 0000 0000"
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 pr-12 text-[15px] font-mono text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all tracking-widest"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-50">
            <svg width="24" height="16" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="4" fill="#1A1F71"/><path d="M14.5 7h9v10h-9z" fill="#FF5F00"/><circle cx="14" cy="12" r="5" fill="#EB001B"/><circle cx="24" cy="12" r="5" fill="#F79E1B"/></svg>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nama Pemegang Kartu</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          placeholder="BUDI SANTOSO"
          className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all uppercase tracking-wide"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Masa Berlaku</label>
          <input
            value={exp}
            onChange={(e) => setExp(formatExp(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5 flex items-center gap-1">
            CVV <Lock size={11} className="text-[#7890AA]" />
          </label>
          <input
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="•••"
            type="password"
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!valid || loading}
        className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-4 rounded-2xl transition-all mt-2 ${
          valid && !loading
            ? "bg-[#1D4196] hover:bg-[#173577] text-white"
            : "bg-[#D8E2F0] text-[#7890AA] cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Memproses…
          </>
        ) : (
          <>
            <Lock size={16} /> Bayar {formatRp(total)}
          </>
        )}
      </button>
    </form>
  );
}

// ─── Processing screen ────────────────────────────────────────────────────────

function ProcessingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-[#EEF3FB]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#1D4196] border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-[32px]">💳</div>
      </div>
      <div className="text-center">
        <p className="font-black text-[20px] text-[#172E4D]">Memproses pembayaran…</p>
        <p className="text-[13px] text-[#58708D] mt-1">Mohon jangan tutup halaman ini</p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#1D4196]"
            style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }`}</style>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  summary,
  total,
  jobId,
  technicianId,
}: {
  summary: PaymentSummary;
  total: number;
  jobId: string;
  technicianId: string;
}) {
  const navigate = useNavigate();
  const txId = `TXN${Date.now().toString().slice(-10)}`;
  const chatUrl = `/pesan/${jobId}?technicianId=${encodeURIComponent(technicianId)}`;

  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="w-20 h-20 rounded-full bg-[#f0fdf4] border-4 border-[#bbf7d0] flex items-center justify-center">
        <CheckCircle size={44} className="text-[#20bf6f]" fill="#20bf6f" />
      </div>
      <div>
        <h2 className="font-black text-[26px] text-[#172E4D] mb-1">Pembayaran berhasil!</h2>
        <p className="text-[#58708D] text-[14px]">Dana tersimpan aman sampai pekerjaan selesai</p>
      </div>

      {/* Receipt card */}
      <div className="w-full bg-[#F7F9FC] border border-[#D8E2F0] rounded-2xl overflow-hidden text-left">
        <div className="bg-[#172E4D] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">ID Transaksi</p>
            <p className="font-black text-[14px] text-white">{txId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Jumlah</p>
            <p className="font-black text-[18px] text-[#FD6665]">{formatRp(total)}</p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#F7F9FC] -ml-2 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-[#D8E2F0]" />
          <div className="w-4 h-4 rounded-full bg-[#F7F9FC] -mr-2 shrink-0" />
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[28px]">{summary.emoji}</span>
            <div>
              <p className="text-[11px] text-[#7890AA] font-semibold">{summary.category}</p>
              <p className="font-bold text-[14px] text-[#172E4D] line-clamp-1">{summary.title}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-[13px]">
            <div className="flex justify-between text-[#58708D]">
              <span>Harga penawaran tukang</span>
              <span>{formatRp(summary.quotePrice)}</span>
            </div>
            <div className="border-t border-[#D8E2F0] pt-1.5 flex justify-between font-black text-[#172E4D]">
              <span>Total dibayar</span><span>{formatRp(total)}</span>
            </div>
          </div>

          {/* Tasker row */}
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#D8E2F0]">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[12px]" style={{ background: summary.tasker.color }}>
              {summary.tasker.initials}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[13px] text-[#172E4D]">{summary.tasker.name}</p>
              <p className="text-[11px] text-[#7890AA]">Tukang pilihanmu · Dalam perjalanan</p>
            </div>
            <div className="flex items-center gap-1 text-[#f59e0b]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="font-bold text-[12px] text-[#172E4D]">{summary.tasker.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-[#20bf6f] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#166534] font-semibold">
          Dana sebesar <span className="font-black">{formatRp(total)}</span> ditahan aman oleh KerjaIn Pay dan baru dicairkan setelah pekerjaan selesai dikonfirmasi.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Link
          to={chatUrl}
          className="w-full flex items-center justify-center gap-2 bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors"
        >
          <MessageCircle size={16} /> Kirim pesan ke tukang
        </Link>
        <button onClick={() => navigate("/tasks")} className="w-full border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all">
          Lacak pekerjaan
        </button>
        <button onClick={() => navigate("/")} className="w-full border-2 border-[#D8E2F0] text-[#7890AA] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all">
          Kembali ke beranda
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Payment() {
  const [params] = useSearchParams();
  const jobId = params.get("jobId");
  const offerId = params.get("offerId");
  const [screen, setScreen] = useState<Screen>("method");
  const [selected, setSelected] = useState<PayMethod | null>(null);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [loadingQuote, setLoadingQuote] = useState(!!(jobId && offerId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vaNumber, setVaNumber] = useState("8277 0091 4821 7365");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [technicianId, setTechnicianId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useScrollToTop(screen);

  useEffect(() => {
    if (!jobId || !offerId) {
      setLoadingQuote(false);
      setLoadError("Pekerjaan atau penawaran tidak ditemukan.");
      return;
    }
    setLoadingQuote(true);
    setLoadError(null);
    Promise.all([api.getJob(jobId), api.getOffers(jobId)])
      .then(([{ job }, { offers }]) => {
        const offer = offers.find((o) => o.id === offerId);
        if (!offer) {
          setLoadError("Penawaran tidak ditemukan atau sudah tidak berlaku.");
          return;
        }
        setSummary({
          jobNumber: job.jobNumber,
          title: job.title,
          category: job.category,
          emoji: "🔧",
          tasker: {
            name: offer.technicianName,
            initials: offer.technicianName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
            color: "#1D4196",
            rating: offer.technicianRating ?? 0,
            reviews: offer.technicianReviewCount ?? 0,
          },
          quotePrice: offer.price,
        });
        setTechnicianId(offer.technicianId);
        setTotal(offer.price);
      })
      .catch(() => setLoadError("Gagal memuat detail penawaran."))
      .finally(() => setLoadingQuote(false));
  }, [jobId, offerId]);

  const selectedM = METHODS.find((m) => m.id === selected);

  const handlePay = async () => {
    if (!selected || !jobId || !offerId) return;
    if (selected === "card") return;
    setScreen("processing");
    try {
      const { payment } = await api.createPayment({ jobId, offerId, method: selected }) as {
        payment: {
          id: string;
          status: string;
          vaNumber?: string | null;
          snapToken?: string | null;
          midtransEnabled?: boolean;
        };
      };
      setPaymentId(payment.id);
      if (payment.vaNumber) setVaNumber(payment.vaNumber);

      if (payment.snapToken && MIDTRANS_CLIENT_KEY) {
        await loadMidtransSnap();
        window.snap!.pay(payment.snapToken, {
          onSuccess: () => setScreen("success"),
          onPending: () => setScreen("pending"),
          onError: () => {
            alert("Pembayaran gagal. Silakan coba lagi.");
            setScreen("method");
          },
          onClose: () => setScreen("method"),
        });
        return;
      }

      if (payment.status === "pending") {
        setScreen("pending");
      } else {
        setTimeout(() => setScreen("success"), 1500);
      }
    } catch {
      setScreen("method");
    }
  };

  const handleConfirmVa = async () => {
    if (!paymentId) return;
    setConfirming(true);
    try {
      await api.confirmPayment(paymentId);
      setScreen("success");
    } catch {
      alert("Gagal memverifikasi pembayaran. Coba lagi.");
    } finally {
      setConfirming(false);
    }
  };

  const groups = ["E-Wallet", "Transfer Bank", "Kartu"];

  if (loadingQuote) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center" style={{ fontFamily: "Manrope, sans-serif" }}>
        <p className="text-[#58708D] font-semibold">Memuat harga penawaran…</p>
      </div>
    );
  }

  if (!summary || loadError) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center gap-4 px-4" style={{ fontFamily: "Manrope, sans-serif" }}>
        <p className="text-[#58708D] text-center">{loadError ?? "Data pembayaran tidak tersedia."}</p>
        <Link to="/pekerjaan-saya" className="text-[#1D4196] font-bold hover:underline">Kembali ke Pekerjaan Saya</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-[#f5eded] sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4 max-w-[860px] mx-auto">
          <Link to="/tasks" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] transition-colors">
            <ChevronLeft size={16} /> Kembali
          </Link>
          <p className="font-black text-[15px] text-[#172E4D]">Pembayaran</p>
          <div className="flex items-center gap-1 text-[12px] text-[#20bf6f] font-bold">
            <Lock size={13} /> Aman
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-4 py-8">
        {screen === "processing" && <ProcessingScreen />}
        {screen === "success" && jobId && technicianId && (
          <SuccessScreen summary={summary} total={total} jobId={jobId} technicianId={technicianId} />
        )}
        {screen === "pending" && selected && (
          <div className="max-w-[520px] mx-auto">
            <VAPendingScreen
              method={selected}
              vaNumber={vaNumber}
              total={total}
              paymentId={paymentId}
              onConfirm={handleConfirmVa}
              confirming={confirming}
            />
          </div>
        )}

        {(screen === "method" || screen === "confirm") && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left — method selector */}
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-[22px] text-[#172E4D] mb-5">
                {screen === "confirm" && selected === "card" ? "Detail Kartu" : "Pilih Metode Pembayaran"}
              </h1>

              {/* Card form */}
              {screen === "confirm" && selected === "card" ? (
                <div className="bg-white rounded-2xl border border-[#D8E2F0] p-6">
                  <button onClick={() => setScreen("method")} className="flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] mb-5 transition-colors">
                    <ChevronLeft size={14} /> Ganti metode
                  </button>
                  <div className="flex items-center gap-3 mb-5 bg-[#F7F9FC] rounded-xl px-4 py-3">
                    <div className="shrink-0">{selectedM?.logo}</div>
                    <div>
                      <p className="font-bold text-[14px] text-[#172E4D]">{selectedM?.label}</p>
                      <p className="text-[12px] text-[#58708D]">{selectedM?.desc}</p>
                    </div>
                  </div>
                  <CardForm total={total} onSuccess={() => setScreen("success")} />
                </div>
              ) : (
                /* Method list */
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group} className="bg-white rounded-2xl border border-[#D8E2F0] overflow-hidden">
                      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#D8E2F0] bg-[#F7F9FC]">
                        {group === "E-Wallet" && <Smartphone size={15} className="text-[#1D4196]" />}
                        {group === "Transfer Bank" && <Building2 size={15} className="text-[#1D4196]" />}
                        {group === "Kartu" && <CreditCard size={15} className="text-[#1D4196]" />}
                        <span className="font-bold text-[12px] text-[#294566] uppercase tracking-wider">{group}</span>
                      </div>
                      <div className="divide-y divide-[#f5eded]">
                        {METHODS.filter((m) => m.group === group).map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelected(m.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-[#F7F9FC] ${selected === m.id ? "bg-[#EEF3FB]" : ""}`}
                          >
                            <div className="shrink-0">{m.logo}</div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-[14px] ${selected === m.id ? "text-[#1D4196]" : "text-[#172E4D]"}`}>
                                {m.label}
                              </p>
                              <p className="text-[12px] text-[#58708D]">{m.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {m.instant && (
                                <span className="text-[10px] font-bold bg-[#f0fdf4] text-[#20bf6f] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                                  Instan
                                </span>
                              )}
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selected === m.id ? "border-[#1D4196] bg-[#1D4196]" : "border-[#D8E2F0]"
                              }`}>
                                {selected === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right — order summary */}
            <div className="w-full lg:w-[340px] shrink-0 sticky top-[73px]">
              <div className="bg-white rounded-2xl border border-[#D8E2F0] overflow-hidden">
                {/* Header */}
                <div className="bg-[#172E4D] px-5 py-4">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">Ringkasan Pekerjaan</p>
                  <p className="font-black text-[13px] text-white">{summary.jobNumber}</p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Job */}
                  <div className="flex items-center gap-3">
                    <span className="text-[32px]">{summary.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#7890AA] font-semibold">{summary.category}</p>
                      <p className="font-bold text-[13px] text-[#172E4D] leading-snug">{summary.title}</p>
                    </div>
                  </div>

                  {/* Tasker */}
                  <div className="flex items-center gap-3 bg-[#F7F9FC] rounded-xl px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[11px] shrink-0" style={{ background: summary.tasker.color }}>
                      {summary.tasker.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-[#172E4D]">{summary.tasker.name}</p>
                      <div className="flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <span className="text-[11px] text-[#58708D]">{summary.tasker.rating} · {summary.tasker.reviews} ulasan</span>
                      </div>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[13px] text-[#58708D]">
                      <span>Harga penawaran tukang</span>
                      <span>{formatRp(summary.quotePrice)}</span>
                    </div>
                    <div className="border-t border-[#D8E2F0] pt-2 flex justify-between font-black text-[#172E4D] text-[16px]">
                      <span>Total dibayar</span>
                      <span className="text-[#1D4196]">{formatRp(total)}</span>
                    </div>
                  </div>

                  {/* Safety note */}
                  <div className="flex items-start gap-2 text-[11px] text-[#58708D] bg-[#f0fdf4] rounded-xl p-3 border border-[#bbf7d0]">
                    <Shield size={13} className="text-[#20bf6f] shrink-0 mt-0.5" />
                    Dana ditahan aman & dicairkan hanya setelah pekerjaan selesai
                  </div>

                  {/* CTA */}
                  {screen !== "confirm" && (
                    <button
                      onClick={() => {
                        if (!selected) return;
                        if (selected === "card") { setScreen("confirm"); return; }
                        setScreen("confirm");
                      }}
                      disabled={!selected}
                      className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-2xl transition-all ${
                        selected
                          ? "bg-[#1D4196] hover:bg-[#173577] text-white"
                          : "bg-[#D8E2F0] text-[#7890AA] cursor-not-allowed"
                      }`}
                    >
                      <Lock size={15} />
                      {selected ? `Bayar ${formatRp(total)}` : "Pilih metode dulu"}
                    </button>
                  )}

                  {screen === "confirm" && selected !== "card" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-[#EEF3FB] border border-[#FD6665] rounded-xl px-4 py-3">
                        <div className="shrink-0">{selectedM?.logo}</div>
                        <div className="flex-1">
                          <p className="font-bold text-[13px] text-[#172E4D]">{selectedM?.label}</p>
                          <p className="text-[11px] text-[#58708D]">{selectedM?.desc}</p>
                        </div>
                        <button onClick={() => setScreen("method")} className="text-[11px] text-[#1D4196] font-bold hover:underline shrink-0">Ganti</button>
                      </div>
                      <button
                        onClick={handlePay}
                        className="w-full flex items-center justify-center gap-2 bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors"
                      >
                        <Lock size={15} /> Konfirmasi & Bayar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {[
                  { icon: "🔒", text: "SSL Terenkripsi" },
                  { icon: "🛡️", text: "Dana Terlindungi" },
                  { icon: "↩️", text: "Refund Dijamin" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 text-[11px] text-[#7890AA] font-semibold">
                    <span>{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
