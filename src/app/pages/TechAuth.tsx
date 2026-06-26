import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Upload, Camera, Eye, EyeOff, HardHat, Clock,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { BrandLogo } from "../components/BrandLogo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";

// ─── Shared social logos (same as Auth.tsx) ───────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const KEAHLIAN = [
  { id: "darurat",     label: "Pipa Bocor Darurat",  emoji: "🚨" },
  { id: "deteksi",     label: "Deteksi Kebocoran",   emoji: "💧" },
  { id: "mampet",      label: "Saluran Mampet",      emoji: "🔩" },
  { id: "water",       label: "Pemanas Air",          emoji: "🔥" },
  { id: "pipa",        label: "Ganti Pipa",           emoji: "🪛" },
  { id: "bathroom",    label: "Pasang Kamar Mandi",   emoji: "🛁" },
  { id: "maintenance", label: "Perawatan Umum",       emoji: "🔧" },
  { id: "handyman",    label: "Tukang Serba Bisa",    emoji: "🪚" },
  { id: "pintu",       label: "Perbaikan Pintu",      emoji: "🚪" },
  { id: "talang",      label: "Bersih Talang",        emoji: "🏠" },
  { id: "keramik",     label: "Perbaikan Keramik",    emoji: "🧱" },
  { id: "atap",        label: "Perawatan Atap",       emoji: "⛏️" },
];

const AREA_GROUPS: { group: string; areas: string[] }[] = [
  {
    group: "Jakarta",
    areas: ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"],
  },
  {
    group: "Tangerang",
    areas: ["Tangerang Kota", "Tangerang Selatan", "Ciputat", "Ciputat Timur", "Serpong", "Serpong Utara", "BSD City", "Alam Sutera", "Gading Serpong", "Pamulang", "Pondok Aren"],
  },
  {
    group: "Bekasi & Depok",
    areas: ["Bekasi Kota", "Bekasi Barat", "Bekasi Selatan", "Bekasi Timur", "Bekasi Utara", "Depok", "Cinere", "Citayam"],
  },
  {
    group: "Bogor",
    areas: ["Bogor Kota", "Cibinong", "Depok (Bogor)", "Sentul"],
  },
];

const PENGALAMAN_OPTIONS = [
  "Kurang dari 1 tahun", "1–2 tahun", "3–5 tahun", "6–10 tahun", "Lebih dari 10 tahun",
];

const TARIF_OPTIONS = [
  "Rp 50.000–100.000/jam", "Rp 100.000–150.000/jam",
  "Rp 150.000–200.000/jam", "Rp 200.000–300.000/jam", "Rp 300.000+/jam",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type OAuthProvider = "google" | "facebook";

interface TechData {
  authMethod: OAuthProvider | "email" | null;
  nama: string;
  phone: string;
  phoneVerified: boolean;
  area: string;
  nik: string;
  ktpPhoto: string | null;
  selfiePhoto: string | null;
  keahlian: string[];
  pengalaman: string;
  tarif: string;
  bio: string;
  email: string;
  password: string;
}

// ─── Progress steps ───────────────────────────────────────────────────────────

const STEPS = ["Akun", "Profil", "Verifikasi HP", "Verifikasi KTP", "Keahlian", "Pengalaman"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 mb-8 px-1">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
              i < step ? "bg-[#172E4D] text-white"
              : i === step ? "bg-[#172E4D] text-white ring-4 ring-[#172E4D]/20"
              : "bg-[#D8E2F0] text-[#7890AA]"
            }`}>
              {i < step ? <CheckCircle size={13} /> : i + 1}
            </div>
            <p className={`text-[9px] font-bold mt-1 hidden sm:block text-center leading-tight ${
              i === step ? "text-[#172E4D]" : i < step ? "text-[#172E4D]/50" : "text-[#7890AA]"
            }`}>
              {label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 transition-all ${i < step ? "bg-[#172E4D]" : "bg-[#D8E2F0]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 0 — Auth method ─────────────────────────────────────────────────────

function StepAuth({
  data, onChange, onOAuth, oauthLoading, loggedInUser,
}: {
  data: TechData;
  onChange: (d: Partial<TechData>) => void;
  onOAuth: (p: OAuthProvider) => void;
  oauthLoading: OAuthProvider | null;
  loggedInUser?: { fullName: string | null; email: string } | null;
}) {
  const [showEmail, setShowEmail] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (loggedInUser) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5 p-4 bg-[#EEF3FB] border border-[#D8E2F0] rounded-2xl">
          <CheckCircle size={24} className="text-[#1D4196] shrink-0" />
          <div>
            <p className="font-black text-[15px] text-[#172E4D]">Akun terhubung</p>
            <p className="text-[13px] text-[#58708D]">{loggedInUser.fullName ?? loggedInUser.email}</p>
            <p className="text-[12px] text-[#7890AA]">{loggedInUser.email}</p>
          </div>
        </div>
        <p className="text-[14px] text-[#58708D]">Lanjutkan mengisi profil tukang Anda.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 p-3 bg-[#172E4D] rounded-2xl">
        <HardHat size={22} className="text-[#FD6665] shrink-0" />
        <div>
          <p className="font-black text-[14px] text-white">Daftar sebagai tukang / teknisi</p>
          <p className="text-[11px] text-white/60">Buat akun dan mulai terima pekerjaan di Jakarta</p>
        </div>
      </div>

      <h2 className="font-black text-[22px] text-[#172E4D] mb-5">Pilih cara masuk</h2>

      <div className="flex flex-col gap-3 mb-5">
        {([
          { id: "google" as OAuthProvider,   label: "Lanjutkan dengan Google",   logo: <GoogleLogo />,   bg: "bg-white border border-[#D8E2F0] text-[#172E4D]" },
          { id: "facebook" as OAuthProvider, label: "Lanjutkan dengan Facebook", logo: <FacebookLogo />, bg: "bg-[#1877F2] text-white" },
        ]).map(({ id, label, logo, bg }) => (
          <button
            key={id}
            onClick={() => onOAuth(id)}
            disabled={oauthLoading !== null}
            className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-[14px] transition-all shadow-sm hover:shadow-md active:scale-[0.98] ${bg} ${oauthLoading ? "opacity-60" : ""}`}
          >
            {oauthLoading === id ? (
              <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <span className="w-5 h-5 flex items-center justify-center">{logo}</span>
            )}
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#D8E2F0]" />
        <span className="text-[12px] font-semibold text-[#7890AA]">atau</span>
        <div className="flex-1 h-px bg-[#D8E2F0]" />
      </div>

      {!showEmail ? (
        <button
          onClick={() => setShowEmail(true)}
          className="w-full border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3.5 rounded-2xl hover:border-[#172E4D] hover:text-[#172E4D] transition-all"
        >
          Daftar dengan email
        </button>
      ) : (
        <div className="space-y-3">
          <input
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            type="email"
            placeholder="nama@email.com"
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#172E4D] transition-all"
          />
          <div className="relative">
            <input
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              type={showPw ? "text" : "password"}
              placeholder="Kata sandi (min. 6 karakter)"
              className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 pr-11 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#172E4D] transition-all"
            />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7890AA]">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button
            onClick={() => onChange({ authMethod: "email" })}
            disabled={!data.email.includes("@") || data.password.length < 6}
            className={`w-full font-bold text-[14px] py-3 rounded-2xl transition-all ${
              data.email.includes("@") && data.password.length >= 6
                ? "bg-[#172E4D] text-white hover:opacity-90"
                : "bg-[#D8E2F0] text-[#7890AA] cursor-not-allowed"
            }`}
          >
            Buat akun dengan email
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 1 — Info Pribadi ────────────────────────────────────────────────────

function StepProfil({ data, onChange }: { data: TechData; onChange: (d: Partial<TechData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-black text-[22px] text-[#172E4D] mb-1">Informasi pribadi</h2>
        <p className="text-[#58708D] text-[14px] mb-5">Informasi ini akan tampil di profil tukangmu.</p>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nama lengkap</label>
        <input
          value={data.nama}
          onChange={(e) => onChange({ nama: e.target.value })}
          placeholder="Budi Santoso"
          className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#172E4D] transition-all"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nomor HP / WhatsApp</label>
        <div className="flex">
          <span className="flex items-center px-3 border-2 border-r-0 border-[#D8E2F0] rounded-l-xl bg-[#EEF3FB] text-[#294566] font-semibold text-[14px]">+62</span>
          <input
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "") })}
            placeholder="812 3456 7890"
            type="tel"
            className="flex-1 border-2 border-[#D8E2F0] rounded-r-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#172E4D] transition-all"
          />
        </div>
        <p className="text-[11px] text-[#7890AA] mt-1">Pelanggan bisa menghubungimu via WhatsApp setelah penawaran diterima</p>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Area kerja utama</label>
        <select
          value={data.area}
          onChange={(e) => onChange({ area: e.target.value })}
          className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] bg-[#F7F9FC] outline-none focus:border-[#172E4D] transition-all appearance-none cursor-pointer"
        >
          <option value="">Pilih area…</option>
          {AREA_GROUPS.map(({ group, areas }) => (
            <optgroup key={group} label={group}>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </optgroup>
          ))}
        </select>
        <p className="text-[11px] text-[#7890AA] mt-1">Kamu tetap bisa menerima pekerjaan di area lain, tapi area utama membantu pencocokan.</p>
      </div>
    </div>
  );
}

// ─── Step 2 — Phone OTP ───────────────────────────────────────────────────────

function StepPhoneVerify({
  phone,
  phoneVerified,
  onVerified,
}: {
  phone: string;
  phoneVerified: boolean;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const displayPhone = phone ? `+62 ${phone.replace(/^0/, "")}` : "";

  const handleSend = async () => {
    if (phone.length < 8) {
      setError("Nomor telepon tidak valid");
      return;
    }
    setSending(true);
    setError("");
    setDevOtp(null);
    try {
      const res = await api.sendPhoneOtp(phone);
      setSent(true);
      setCooldown(60);
      if (res.devOtp) setDevOtp(res.devOtp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim kode");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setError("");
    try {
      await api.verifyPhoneOtp(phone, code);
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verifikasi gagal");
    } finally {
      setVerifying(false);
    }
  };

  if (phoneVerified) {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-[#20bf6f]" />
        </div>
        <h2 className="font-black text-[22px] text-[#172E4D]">Nomor HP terverifikasi</h2>
        <p className="text-[14px] text-[#58708D]">{displayPhone}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-black text-[22px] text-[#172E4D] mb-1">Verifikasi nomor HP</h2>
        <p className="text-[#58708D] text-[14px]">
          Kami kirim kode 6 digit ke <span className="font-bold text-[#172E4D]">{displayPhone}</span> via SMS.
        </p>
      </div>

      {!sent ? (
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || phone.length < 8}
          className="w-full bg-[#172E4D] hover:opacity-90 disabled:opacity-50 text-white font-bold text-[14px] py-3.5 rounded-2xl transition-all"
        >
          {sending ? "Mengirim…" : "Kirim kode SMS"}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-12 w-11 border-2 border-[#D8E2F0] rounded-xl text-[18px] font-bold text-[#172E4D] bg-[#F7F9FC] data-[active=true]:border-[#1D4196]"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
            className="w-full bg-[#1D4196] hover:bg-[#173577] disabled:bg-[#D8E2F0] disabled:text-[#7890AA] text-white font-bold text-[14px] py-3.5 rounded-2xl transition-all"
          >
            {verifying ? "Memverifikasi…" : "Verifikasi kode"}
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || cooldown > 0}
            className="w-full text-[13px] font-bold text-[#1D4196] hover:underline disabled:text-[#7890AA] disabled:no-underline"
          >
            {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : "Kirim ulang kode"}
          </button>

          {devOtp && (
            <p className="text-[11px] text-[#7890AA] text-center bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl px-3 py-2">
              Dev OTP: <span className="font-mono font-bold text-[#172E4D]">{devOtp}</span>
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

// ─── Upload helpers ───────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<{ base64: string; contentType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
  return { base64: dataUrl.split(",")[1], contentType: file.type || "image/jpeg" };
}

// ─── Step 2 — KTP Verification ───────────────────────────────────────────────

function UploadBox({
  label, sublabel, icon, hasFile, uploading, onUpload, onRemove,
}: {
  label: string; sublabel: string; icon: React.ReactNode;
  hasFile: boolean; uploading?: boolean; onUpload: () => void; onRemove: () => void;
}) {
  return (
    <div className={`border-2 border-dashed rounded-2xl p-5 transition-all ${hasFile ? "border-[#20bf6f] bg-[#f0fdf4]" : "border-[#D8E2F0] bg-[#F7F9FC] hover:border-[#172E4D]"}`}>
      {hasFile ? (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#bbf7d0] flex items-center justify-center shrink-0">
            <CheckCircle size={24} className="text-[#20bf6f]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px] text-[#166534]">{label} berhasil diunggah</p>
            <p className="text-[12px] text-[#4ade80]">{uploading ? "Mengunggah…" : "File siap diverifikasi"}</p>
          </div>
          <button type="button" onClick={onRemove} disabled={uploading} className="text-[12px] text-[#7890AA] hover:text-red-500 font-semibold transition-colors disabled:opacity-50">Hapus</button>
        </div>
      ) : (
        <button type="button" onClick={onUpload} disabled={uploading} className="w-full flex flex-col items-center gap-3 py-2 disabled:opacity-60">
          <div className="w-12 h-12 rounded-xl bg-[#EEF3FB] flex items-center justify-center">
            {icon}
          </div>
          <div className="text-center">
            <p className="font-bold text-[14px] text-[#172E4D]">{label}</p>
            <p className="text-[12px] text-[#58708D] mt-0.5">{sublabel}</p>
          </div>
          <div className="flex items-center gap-2 bg-[#172E4D] text-white text-[12px] font-bold px-4 py-2 rounded-full">
            <Upload size={13} /> {uploading ? "Mengunggah…" : "Pilih file"}
          </div>
        </button>
      )}
    </div>
  );
}

function StepKTP({
  data,
  onChange,
  isLoggedIn,
  pendingKtp,
  pendingSelfie,
  onPendingKtp,
  onPendingSelfie,
  uploadError,
  onUploadError,
}: {
  data: TechData;
  onChange: (d: Partial<TechData>) => void;
  isLoggedIn: boolean;
  pendingKtp: File | null;
  pendingSelfie: File | null;
  onPendingKtp: (file: File | null) => void;
  onPendingSelfie: (file: File | null) => void;
  uploadError: string | null;
  onUploadError: (msg: string | null) => void;
}) {
  const ktpRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const [uploadingField, setUploadingField] = useState<"ktp" | "selfie" | null>(null);

  const formatNIK = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{6})(\d{6})(\d{4})/, "$1 $2 $3").trim();

  const handleFile = async (file: File, field: "ktp" | "selfie") => {
    onUploadError(null);
    if (isLoggedIn) {
      setUploadingField(field);
      try {
        const { base64, contentType } = await fileToBase64(file);
        const { path } = await api.uploadKtpDocument(base64, contentType, field);
        onChange(field === "ktp" ? { ktpPhoto: path } : { selfiePhoto: path });
        if (field === "ktp") onPendingKtp(null);
        else onPendingSelfie(null);
      } catch (e) {
        onUploadError(e instanceof Error ? e.message : "Gagal mengunggah foto");
      } finally {
        setUploadingField(null);
      }
    } else {
      if (field === "ktp") onPendingKtp(file);
      else onPendingSelfie(file);
    }
  };

  const handleRemove = async (field: "ktp" | "selfie") => {
    onUploadError(null);
    const path = field === "ktp" ? data.ktpPhoto : data.selfiePhoto;
    if (path && isLoggedIn) {
      try {
        await api.deleteKtpDocument(path);
      } catch {
        /* best-effort */
      }
    }
    onChange(field === "ktp" ? { ktpPhoto: null } : { selfiePhoto: null });
    if (field === "ktp") onPendingKtp(null);
    else onPendingSelfie(null);
  };

  const hasKtp = !!data.ktpPhoto || !!pendingKtp;
  const hasSelfie = !!data.selfiePhoto || !!pendingSelfie;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-black text-[22px] text-[#172E4D] mb-1">Verifikasi identitas</h2>
        <p className="text-[#58708D] text-[14px] mb-1">Upload KTP agar pelanggan tahu profilmu sudah dicek.</p>
      </div>

      <div className="flex items-start gap-3 bg-[#172E4D] rounded-xl p-4">
        <AlertCircle size={16} className="text-[#FD6665] shrink-0 mt-0.5" />
        <div className="text-[12px] text-white/80">
          <span className="font-bold text-white">Kenapa perlu KTP?</span> Verifikasi identitas membantu pelanggan lebih percaya dan bisa meningkatkan peluang mendapat pekerjaan. Datamu dienkripsi dan aman.
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nomor KTP (NIK)</label>
        <input
          value={data.nik}
          onChange={(e) => onChange({ nik: formatNIK(e.target.value) })}
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#172E4D] transition-all tracking-wider"
        />
        <p className="text-[11px] text-[#7890AA] mt-1">16 digit sesuai KTP</p>
      </div>

      <UploadBox
        label="Foto KTP (Bagian Depan)"
        sublabel="Format JPG, PNG — maks. 5MB. Pastikan seluruh teks terbaca jelas"
        icon={<Upload size={22} className="text-[#1D4196]" />}
        hasFile={hasKtp}
        uploading={uploadingField === "ktp"}
        onUpload={() => ktpRef.current?.click()}
        onRemove={() => handleRemove("ktp")}
      />

      <UploadBox
        label="Foto Selfie"
        sublabel="Foto wajah yang jelas — pastikan wajah terlihat penuh dan terang"
        icon={<Camera size={22} className="text-[#1D4196]" />}
        hasFile={hasSelfie}
        uploading={uploadingField === "selfie"}
        onUpload={() => selfieRef.current?.click()}
        onRemove={() => handleRemove("selfie")}
      />

      {!isLoggedIn && (pendingKtp || pendingSelfie) && (
        <p className="text-[12px] text-[#58708D] bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl px-4 py-3">
          Foto disimpan sementara. Setelah verifikasi email dan masuk kembali, dokumen akan diunggah otomatis saat menyelesaikan pendaftaran.
        </p>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} className="shrink-0" /> {uploadError}
        </div>
      )}

      <div className="flex items-start gap-3 bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4 text-[12px] text-[#58708D]">
        <Clock size={14} className="text-[#7890AA] shrink-0 mt-0.5" />
        Verifikasi KTP biasanya selesai dalam <span className="font-bold text-[#172E4D] mx-1">1×24 jam</span> kerja. Kamu bisa tetap melengkapi profil sambil menunggu.
      </div>

      <input
        ref={ktpRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file, "ktp");
          e.target.value = "";
        }}
      />
      <input
        ref={selfieRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file, "selfie");
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Step 3 — Keahlian ────────────────────────────────────────────────────────

function StepKeahlian({ data, onChange }: { data: TechData; onChange: (d: Partial<TechData>) => void }) {
  const toggle = (id: string) => {
    const next = data.keahlian.includes(id)
      ? data.keahlian.filter((k) => k !== id)
      : [...data.keahlian, id];
    onChange({ keahlian: next });
  };

  return (
    <div>
      <h2 className="font-black text-[22px] text-[#172E4D] mb-1">Pilih keahlianmu</h2>
      <p className="text-[#58708D] text-[14px] mb-5">Pilih semua layanan yang bisa kamu kerjakan. Minimal 1 keahlian.</p>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {KEAHLIAN.map((k) => {
          const selected = data.keahlian.includes(k.id);
          return (
            <button
              key={k.id}
              onClick={() => toggle(k.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                selected
                  ? "border-[#172E4D] bg-[#172E4D] text-white"
                  : "border-[#D8E2F0] bg-white hover:border-[#172E4D]/40"
              }`}
            >
              <span className="text-[22px] shrink-0">{k.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-[12px] leading-snug ${selected ? "text-white" : "text-[#172E4D]"}`}>
                  {k.label}
                </p>
              </div>
              {selected && <CheckCircle size={14} className="text-[#FD6665] shrink-0" />}
            </button>
          );
        })}
      </div>

      {data.keahlian.length > 0 && (
        <div className="bg-[#172E4D]/5 border border-[#172E4D]/10 rounded-xl px-4 py-2.5 text-[12px] text-[#294566] font-semibold">
          ✅ {data.keahlian.length} keahlian dipilih
        </div>
      )}
    </div>
  );
}

// ─── Step 4 — Pengalaman & Tarif ─────────────────────────────────────────────

function StepPengalaman({ data, onChange }: { data: TechData; onChange: (d: Partial<TechData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-black text-[22px] text-[#172E4D] mb-1">Pengalaman & tarif</h2>
        <p className="text-[#58708D] text-[14px] mb-2">Bantu pelanggan memahami pengalaman dan kisaran hargamu.</p>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-2">Lama pengalaman</label>
        <div className="flex flex-col gap-2">
          {PENGALAMAN_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ pengalaman: opt })}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-[14px] font-semibold text-left transition-all ${
                data.pengalaman === opt
                  ? "border-[#172E4D] bg-[#172E4D] text-white"
                  : "border-[#D8E2F0] bg-white text-[#294566] hover:border-[#172E4D]/40"
              }`}
            >
              {opt}
              {data.pengalaman === opt && <CheckCircle size={16} className="text-[#FD6665]" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">
          Deskripsi singkat tentang kamu <span className="font-normal text-[#7890AA]">(opsional)</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={4}
          placeholder="Contoh: Saya tukang ledeng dengan pengalaman 5 tahun untuk rumah dan ruko. Melayani pekerjaan darurat di Jakarta Selatan dan sekitarnya..."
          className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#172E4D] resize-none transition-all"
        />
        <p className="text-[11px] text-[#7890AA] mt-1">{data.bio.length}/300 karakter</p>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ data }: { data: TechData }) {
  const navigate = useNavigate();
  const keahlianLabels = data.keahlian
    .map((id) => KEAHLIAN.find((k) => k.id === id)?.label)
    .filter(Boolean);

  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      {/* Animated checkmark */}
      <div className="w-24 h-24 rounded-full bg-[#f0fdf4] border-4 border-[#bbf7d0] flex items-center justify-center">
        <CheckCircle size={52} className="text-[#20bf6f]" fill="#20bf6f" />
      </div>

      <div>
        <h2 className="font-black text-[26px] text-[#172E4D] mb-1">Pendaftaran berhasil!</h2>
        <p className="text-[#58708D] text-[14px] max-w-xs mx-auto">
          Akun tukangmu sedang diverifikasi. Kami akan memberi kabar dalam <span className="font-bold text-[#172E4D]">1×24 jam</span>.
        </p>
      </div>

      {/* Profile preview card */}
      <div className="w-full bg-[#172E4D] rounded-2xl overflow-hidden text-left">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-[#1D4196] flex items-center justify-center text-white font-black text-[18px]">
            {data.nama ? data.nama[0].toUpperCase() : "T"}
          </div>
          <div>
            <p className="font-black text-[16px] text-white">{data.nama || "Tukang KerjaIn"}</p>
            <p className="text-[12px] text-white/60">{data.area || "Jakarta"}</p>
          </div>
          <div className="ml-auto">
            <span className="text-[11px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2.5 py-1 rounded-full">
              ⏳ Menunggu Verifikasi
            </span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Keahlian</p>
            <div className="flex flex-wrap gap-1.5">
              {keahlianLabels.slice(0, 4).map((k) => (
                <span key={k} className="text-[11px] font-semibold bg-white/10 text-white/80 px-2.5 py-0.5 rounded-full">{k}</span>
              ))}
              {keahlianLabels.length > 4 && (
                <span className="text-[11px] font-semibold bg-white/10 text-white/60 px-2.5 py-0.5 rounded-full">+{keahlianLabels.length - 4} lainnya</span>
              )}
            </div>
          </div>
          {data.tarif && (
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Tarif</p>
              <p className="text-[13px] font-bold text-[#FD6665]">{data.tarif}</p>
            </div>
          )}
        </div>
      </div>

      {/* Verification status */}
      <div className="w-full bg-[#F7F9FC] border border-[#D8E2F0] rounded-2xl p-4 text-left space-y-2.5">
        <p className="font-bold text-[13px] text-[#172E4D] mb-3">Status verifikasi:</p>
        {[
          { label: "Akun dibuat", done: true },
          { label: "Informasi profil", done: !!data.nama && !!data.phone },
          { label: "Verifikasi HP", done: data.phoneVerified, pending: !data.phoneVerified },
          { label: "Verifikasi KTP", done: !!data.ktpPhoto, pending: !data.ktpPhoto },
          { label: "Keahlian dikonfirmasi", done: data.keahlian.length > 0 },
          { label: "Akun disetujui & aktif", done: false, pending: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-[13px]">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              item.done ? "bg-[#20bf6f]" : item.pending ? "bg-yellow-400" : "bg-[#D8E2F0]"
            }`}>
              {item.done ? <CheckCircle size={12} className="text-white" /> : <Clock size={11} className="text-[#172E4D]" />}
            </div>
            <span className={item.done ? "text-[#172E4D] font-semibold" : item.pending ? "text-yellow-700 font-semibold" : "text-[#7890AA]"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => navigate("/dasbor-tukang")}
          className="w-full bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          Buka Dasbor Tukang →
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all"
        >
          Kembali ke beranda
        </button>
      </div>
    </div>
  );
}

// ─── can proceed logic ────────────────────────────────────────────────────────

function canProceed(
  step: number,
  data: TechData,
  isLoggedInTechnician: boolean,
  pending: { ktp: File | null; selfie: File | null },
): boolean {
  if (step === 0) {
    return isLoggedInTechnician || !!(data.authMethod || (data.email.includes("@") && data.password.length >= 6));
  }
  if (step === 1) return data.nama.trim().length >= 2 && data.phone.length >= 8 && !!data.area;
  if (step === 2) return data.phoneVerified;
  if (step === 3) {
    const nikOk = data.nik.replace(/\D/g, "").length === 16;
    const hasKtp = !!data.ktpPhoto || !!pending.ktp;
    const hasSelfie = !!data.selfiePhoto || !!pending.selfie;
    return nikOk && hasKtp && hasSelfie;
  }
  if (step === 4) return data.keahlian.length >= 1;
  if (step === 5) return !!data.pengalaman;
  return true;
}

const TECH_DRAFT_KEY = "kerjain_tech_draft";

async function saveTechDraft(data: TechData, pendingKtp: File | null, pendingSelfie: File | null) {
  const draft: {
    data: TechData;
    pendingKtp?: { base64: string; contentType: string };
    pendingSelfie?: { base64: string; contentType: string };
  } = { data };
  if (pendingKtp) {
    draft.pendingKtp = await fileToBase64(pendingKtp);
  }
  if (pendingSelfie) {
    draft.pendingSelfie = await fileToBase64(pendingSelfie);
  }
  sessionStorage.setItem(TECH_DRAFT_KEY, JSON.stringify(draft));
}

function base64ToFile(base64: string, contentType: string, name: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: contentType });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL: TechData = {
  authMethod: null, nama: "", phone: "", phoneVerified: false, area: "",
  nik: "", ktpPhoto: null, selfiePhoto: null,
  keahlian: [], pengalaman: "", tarif: "", bio: "",
  email: "", password: "",
};

export default function TechAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, register } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<TechData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pendingEmailVerify, setPendingEmailVerify] = useState(false);
  const [pendingKtp, setPendingKtp] = useState<File | null>(null);
  const [pendingSelfie, setPendingSelfie] = useState<File | null>(null);
  const [ktpUploadError, setKtpUploadError] = useState<string | null>(null);

  const update = (patch: Partial<TechData>) => {
    setData((d) => {
      const next = { ...d, ...patch };
      if (patch.phone !== undefined && patch.phone !== d.phone) {
        next.phoneVerified = false;
      }
      return next;
    });
  };

  const isLoggedInTechnician = user?.role === "technician";

  useEffect(() => {
    if (loading) return;
    const resume = searchParams.get("resume");
    if (user?.role === "technician" && resume === "1") {
      const providerParam = searchParams.get("provider");
      const authMethod: OAuthProvider = providerParam === "facebook" ? "facebook" : "google";
      setStep(1);
      const raw = sessionStorage.getItem(TECH_DRAFT_KEY);
      if (raw) {
        try {
          const draft = JSON.parse(raw) as {
            data: TechData;
            pendingKtp?: { base64: string; contentType: string };
            pendingSelfie?: { base64: string; contentType: string };
          };
          setData((d) => ({
            ...draft.data,
            nama: draft.data.nama || user.fullName || "",
            email: draft.data.email || user.email,
            authMethod: draft.data.authMethod ?? authMethod,
          }));
          if (draft.pendingKtp) {
            setPendingKtp(base64ToFile(draft.pendingKtp.base64, draft.pendingKtp.contentType, "ktp.jpg"));
          }
          if (draft.pendingSelfie) {
            setPendingSelfie(base64ToFile(draft.pendingSelfie.base64, draft.pendingSelfie.contentType, "selfie.jpg"));
          }
          sessionStorage.removeItem(TECH_DRAFT_KEY);
          return;
        } catch {
          sessionStorage.removeItem(TECH_DRAFT_KEY);
        }
      }
      setData((d) => ({
        ...d,
        nama: d.nama || user.fullName || "",
        email: d.email || user.email,
        authMethod: d.authMethod ?? authMethod,
      }));
    }
  }, [loading, user, searchParams]);

  const handleOAuth = (provider: OAuthProvider) => {
    setOauthLoading(provider);
    window.location.href = api.oauthAuthUrl(provider, { role: "technician" });
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      if (!isLoggedInTechnician && (data.authMethod === "email" || data.email)) {
        await register(data.email, data.password, data.nama, "technician");
        if (pendingKtp || pendingSelfie) {
          await saveTechDraft(data, pendingKtp, pendingSelfie);
        }
        setPendingEmailVerify(true);
        setSubmitted(true);
        return;
      }
      if (!isLoggedInTechnician && !user) {
        throw new Error("Silakan buat akun terlebih dahulu di langkah 1");
      }

      let ktpPhoto = data.ktpPhoto;
      let selfiePhoto = data.selfiePhoto;

      if (pendingKtp && !ktpPhoto) {
        const { base64, contentType } = await fileToBase64(pendingKtp);
        ktpPhoto = (await api.uploadKtpDocument(base64, contentType, "ktp")).path;
      }
      if (pendingSelfie && !selfiePhoto) {
        const { base64, contentType } = await fileToBase64(pendingSelfie);
        selfiePhoto = (await api.uploadKtpDocument(base64, contentType, "selfie")).path;
      }

      await api.saveTechnicianProfile({
        phone: data.phone,
        area: data.area,
        nik: data.nik.replace(/\D/g, ""),
        ktpPhoto,
        selfiePhoto,
        keahlian: data.keahlian,
        pengalaman: data.pengalaman,
        tarif: data.tarif,
        bio: data.bio,
      });
      sessionStorage.removeItem(TECH_DRAFT_KEY);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Pendaftaran gagal");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] py-10 px-4" style={{ fontFamily: "Manrope, sans-serif" }}>
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <BrandLogo imgClassName="h-10" />
            </div>
          </div>
          {pendingEmailVerify ? (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="w-24 h-24 rounded-full bg-[#EEF3FB] border-4 border-[#D8E2F0] flex items-center justify-center">
                <CheckCircle size={52} className="text-[#1D4196]" />
              </div>
              <div>
                <h2 className="font-black text-[26px] text-[#172E4D] mb-1">Cek email kamu</h2>
                <p className="text-[#58708D] text-[14px] max-w-xs mx-auto">
                  Kami mengirim tautan verifikasi ke <span className="font-bold text-[#172E4D]">{data.email}</span>.
                  Setelah verifikasi, masuk dan lanjutkan pendaftaran profil tukang.
                </p>
              </div>
              <button
                onClick={() => navigate("/masuk", { state: { from: "/daftar-tukang?resume=1" } })}
                className="w-full bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors"
              >
                Ke halaman masuk
              </button>
            </div>
          ) : (
            <SuccessScreen data={data} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-[520px] mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BrandLogo imgClassName="h-10" />
          <span className="text-[12px] font-bold text-[#7890AA] bg-[#EEF3FB] px-2 py-0.5 rounded-full">Tukang</span>
        </Link>
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#172E4D] transition-colors">
            <ChevronLeft size={15} /> Kembali
          </button>
        ) : (
          <Link to="/daftar" className="flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] transition-colors">
            <ChevronLeft size={15} /> Kembali
          </Link>
        )}
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4">
        {/* Banner */}
        {step === 0 && (
          <div className="bg-gradient-to-r from-[#172E4D] to-[#3d1515] rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1D4196]/20 flex items-center justify-center shrink-0">
              <HardHat size={30} className="text-[#FD6665]" />
            </div>
            <div>
              <p className="font-black text-[16px] text-white">Daftar sebagai tukang</p>
              <p className="text-[12px] text-white/60 mt-0.5">Terima pekerjaan plumbing dan perawatan di Jakarta</p>
              <div className="flex gap-3 mt-2">
                {["Gratis daftar", "Verifikasi KTP", "Langsung dapat pekerjaan"].map((t) => (
                  <span key={t} className="text-[10px] font-bold text-[#FD6665]">✓ {t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-[#D8E2F0] p-6 mb-5 min-h-[380px]">
          {step === 0 && (
            <StepAuth
              data={data}
              onChange={update}
              onOAuth={handleOAuth}
              oauthLoading={oauthLoading}
              loggedInUser={isLoggedInTechnician ? user : null}
            />
          )}
          {step === 1 && <StepProfil data={data} onChange={update} />}
          {step === 2 && (
            <StepPhoneVerify
              phone={data.phone}
              phoneVerified={data.phoneVerified}
              onVerified={() => update({ phoneVerified: true })}
            />
          )}
          {step === 3 && (
            <StepKTP
              data={data}
              onChange={update}
              isLoggedIn={isLoggedInTechnician}
              pendingKtp={pendingKtp}
              pendingSelfie={pendingSelfie}
              onPendingKtp={setPendingKtp}
              onPendingSelfie={setPendingSelfie}
              uploadError={ktpUploadError}
              onUploadError={setKtpUploadError}
            />
          )}
          {step === 4 && <StepKeahlian data={data} onChange={update} />}
          {step === 5 && <StepPengalaman data={data} onChange={update} />}
        </div>

        {/* KTP skip note */}
        {step === 3 && (
          <p className="text-center text-[12px] text-[#7890AA] mb-3">
            Belum punya KTP siap?{" "}
            <button type="button" onClick={() => setStep(4)} className="text-[#1D4196] font-bold hover:underline">
              Lewati untuk sekarang
            </button>
          </p>
        )}

        {/* Nav button */}
        {!(step === 0 && oauthLoading) && (
          <button
            onClick={handleNext}
            disabled={!canProceed(step, data, isLoggedInTechnician, { ktp: pendingKtp, selfie: pendingSelfie }) || submitting}
            className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-2xl transition-all ${
              canProceed(step, data, isLoggedInTechnician, { ktp: pendingKtp, selfie: pendingSelfie }) && !submitting
                ? "bg-[#172E4D] hover:opacity-90 text-white"
                : "bg-[#D8E2F0] text-[#7890AA] cursor-not-allowed"
            }`}
          >
            {submitting ? (
              "Mendaftarkan…"
            ) : step === STEPS.length - 1 ? (
              "Selesai & Daftarkan Akun"
            ) : (
              <>{step === 0 ? "Lanjutkan" : "Selanjutnya"} <ChevronRight size={16} /></>
            )}
          </button>
        )}

        {submitError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3 text-[13px] text-red-600">
            <AlertCircle size={15} /> {submitError}
          </div>
        )}

        {/* Trust strip */}
        <div className="flex flex-wrap justify-center gap-5 mt-5 text-[11px] text-[#7890AA]">
          {["🔒 Data terenkripsi", "✅ Verifikasi resmi", "🆓 Daftar 100% gratis"].map((b) => (
            <span key={b} className="font-semibold">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
