import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Upload, Camera, Eye, EyeOff, HardHat, Clock,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";

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

function AppleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
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

type OAuthProvider = "google" | "facebook" | "apple";

interface TechData {
  authMethod: OAuthProvider | "email" | null;
  nama: string;
  phone: string;
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

const STEPS = ["Akun", "Profil", "Verifikasi KTP", "Keahlian", "Pengalaman"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 mb-8 px-1">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
              i < step ? "bg-[#1a2d4a] text-white"
              : i === step ? "bg-[#1a2d4a] text-white ring-4 ring-[#1a2d4a]/20"
              : "bg-[#c8dfd8] text-[#7a9a8f]"
            }`}>
              {i < step ? <CheckCircle size={13} /> : i + 1}
            </div>
            <p className={`text-[9px] font-bold mt-1 hidden sm:block text-center leading-tight ${
              i === step ? "text-[#1a2d4a]" : i < step ? "text-[#1a2d4a]/50" : "text-[#7a9a8f]"
            }`}>
              {label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 transition-all ${i < step ? "bg-[#1a2d4a]" : "bg-[#c8dfd8]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 0 — Auth method ─────────────────────────────────────────────────────

function StepAuth({
  data, onChange, onOAuth, oauthLoading,
}: {
  data: TechData;
  onChange: (d: Partial<TechData>) => void;
  onOAuth: (p: OAuthProvider) => void;
  oauthLoading: OAuthProvider | null;
}) {
  const [showEmail, setShowEmail] = useState(false);
  const [showPw, setShowPw] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 p-3 bg-[#1a2d4a] rounded-2xl">
        <HardHat size={22} className="text-[#F59E42] shrink-0" />
        <div>
          <p className="font-black text-[14px] text-white">Daftar sebagai Tukang / Teknisi</p>
          <p className="text-[11px] text-white/60">Buat akun untuk mulai menerima pekerjaan di Jakarta</p>
        </div>
      </div>

      <h2 className="font-black text-[22px] text-[#1a2d4a] mb-5">Pilih cara masuk</h2>

      <div className="flex flex-col gap-3 mb-5">
        {([
          { id: "google" as OAuthProvider,   label: "Lanjutkan dengan Google",   logo: <GoogleLogo />,   bg: "bg-white border border-[#e0d0d0] text-[#0f2035]" },
          { id: "facebook" as OAuthProvider, label: "Lanjutkan dengan Facebook", logo: <FacebookLogo />, bg: "bg-[#1877F2] text-white" },
          { id: "apple" as OAuthProvider,    label: "Lanjutkan dengan Apple",    logo: <AppleLogo />,    bg: "bg-[#1a2d4a] text-white" },
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
        <div className="flex-1 h-px bg-[#c8dfd8]" />
        <span className="text-[12px] font-semibold text-[#7a9a8f]">atau</span>
        <div className="flex-1 h-px bg-[#c8dfd8]" />
      </div>

      {!showEmail ? (
        <button
          onClick={() => setShowEmail(true)}
          className="w-full border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] py-3.5 rounded-2xl hover:border-[#1a2d4a] hover:text-[#1a2d4a] transition-all"
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
            className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#1a2d4a] transition-all"
          />
          <div className="relative">
            <input
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              type={showPw ? "text" : "password"}
              placeholder="Kata sandi (min. 6 karakter)"
              className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 pr-11 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#1a2d4a] transition-all"
            />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a9a8f]">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button
            onClick={() => onChange({ authMethod: "email" })}
            disabled={!data.email.includes("@") || data.password.length < 6}
            className={`w-full font-bold text-[14px] py-3 rounded-2xl transition-all ${
              data.email.includes("@") && data.password.length >= 6
                ? "bg-[#1a2d4a] text-white hover:opacity-90"
                : "bg-[#c8dfd8] text-[#7a9a8f] cursor-not-allowed"
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
        <h2 className="font-black text-[22px] text-[#1a2d4a] mb-1">Informasi pribadi</h2>
        <p className="text-[#3d6b5e] text-[14px] mb-5">Informasi ini akan ditampilkan di profil tukang Anda</p>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Nama lengkap</label>
        <input
          value={data.nama}
          onChange={(e) => onChange({ nama: e.target.value })}
          placeholder="Budi Santoso"
          className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#1a2d4a] transition-all"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Nomor HP / WhatsApp</label>
        <div className="flex">
          <span className="flex items-center px-3 border-2 border-r-0 border-[#b8d4c8] rounded-l-xl bg-[#f0f7f4] text-[#1a3d5c] font-semibold text-[14px]">+62</span>
          <input
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "") })}
            placeholder="812 3456 7890"
            type="tel"
            className="flex-1 border-2 border-[#b8d4c8] rounded-r-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#1a2d4a] transition-all"
          />
        </div>
        <p className="text-[11px] text-[#7a9a8f] mt-1">Pelanggan akan menghubungi Anda via WhatsApp setelah penawaran diterima</p>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Area kerja utama</label>
        <select
          value={data.area}
          onChange={(e) => onChange({ area: e.target.value })}
          className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] bg-[#F5F1E8] outline-none focus:border-[#1a2d4a] transition-all appearance-none cursor-pointer"
        >
          <option value="">Pilih area…</option>
          {AREA_GROUPS.map(({ group, areas }) => (
            <optgroup key={group} label={group}>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </optgroup>
          ))}
        </select>
        <p className="text-[11px] text-[#7a9a8f] mt-1">Anda bisa menerima pekerjaan di seluruh Jakarta, tapi area utama membantu pencocokan</p>
      </div>
    </div>
  );
}

// ─── Step 2 — KTP Verification ───────────────────────────────────────────────

function UploadBox({
  label, sublabel, icon, hasFile, onUpload, onRemove,
}: {
  label: string; sublabel: string; icon: React.ReactNode;
  hasFile: boolean; onUpload: () => void; onRemove: () => void;
}) {
  return (
    <div className={`border-2 border-dashed rounded-2xl p-5 transition-all ${hasFile ? "border-[#20bf6f] bg-[#f0fdf4]" : "border-[#b8d4c8] bg-[#F5F1E8] hover:border-[#1a2d4a]"}`}>
      {hasFile ? (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#bbf7d0] flex items-center justify-center shrink-0">
            <CheckCircle size={24} className="text-[#20bf6f]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px] text-[#166534]">{label} berhasil diunggah</p>
            <p className="text-[12px] text-[#4ade80]">File siap diverifikasi</p>
          </div>
          <button onClick={onRemove} className="text-[12px] text-[#7a9a8f] hover:text-red-500 font-semibold transition-colors">Hapus</button>
        </div>
      ) : (
        <button onClick={onUpload} className="w-full flex flex-col items-center gap-3 py-2">
          <div className="w-12 h-12 rounded-xl bg-[#f0f7f4] flex items-center justify-center">
            {icon}
          </div>
          <div className="text-center">
            <p className="font-bold text-[14px] text-[#1a2d4a]">{label}</p>
            <p className="text-[12px] text-[#3d6b5e] mt-0.5">{sublabel}</p>
          </div>
          <div className="flex items-center gap-2 bg-[#1a2d4a] text-white text-[12px] font-bold px-4 py-2 rounded-full">
            <Upload size={13} /> Pilih file
          </div>
        </button>
      )}
    </div>
  );
}

function StepKTP({ data, onChange }: { data: TechData; onChange: (d: Partial<TechData>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (field: "ktpPhoto" | "selfiePhoto") => {
    setTimeout(() => onChange({ [field]: "uploaded" }), 800);
  };

  const formatNIK = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{6})(\d{6})(\d{4})/, "$1 $2 $3").trim();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-black text-[22px] text-[#1a2d4a] mb-1">Verifikasi identitas</h2>
        <p className="text-[#3d6b5e] text-[14px] mb-1">Upload KTP untuk membuktikan identitas Anda kepada pelanggan</p>
      </div>

      {/* Info bar */}
      <div className="flex items-start gap-3 bg-[#1a2d4a] rounded-xl p-4">
        <AlertCircle size={16} className="text-[#F59E42] shrink-0 mt-0.5" />
        <div className="text-[12px] text-white/80">
          <span className="font-bold text-white">Mengapa perlu KTP?</span> Verifikasi identitas meningkatkan kepercayaan pelanggan dan membantu Anda mendapat lebih banyak pekerjaan. Data Anda dienkripsi dan aman.
        </div>
      </div>

      {/* KTP Upload */}
      <UploadBox
        label="Foto KTP (Bagian Depan)"
        sublabel="Format JPG, PNG — maks. 5MB. Pastikan seluruh teks terbaca jelas"
        icon={<Upload size={22} className="text-[#2E5090]" />}
        hasFile={!!data.ktpPhoto}
        onUpload={() => simulateUpload("ktpPhoto")}
        onRemove={() => onChange({ ktpPhoto: null })}
      />

      {/* Selfie */}
      <UploadBox
        label="Foto Selfie"
        sublabel="Foto wajah Anda yang jelas — pastikan wajah terlihat penuh dan terang"
        icon={<Camera size={22} className="text-[#2E5090]" />}
        hasFile={!!data.selfiePhoto}
        onUpload={() => simulateUpload("selfiePhoto")}
        onRemove={() => onChange({ selfiePhoto: null })}
      />

      {/* Verification note */}
      <div className="flex items-start gap-3 bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4 text-[12px] text-[#3d6b5e]">
        <Clock size={14} className="text-[#7a9a8f] shrink-0 mt-0.5" />
        Verifikasi KTP biasanya selesai dalam <span className="font-bold text-[#1a2d4a] mx-1">1×24 jam</span> kerja. Anda bisa tetap melengkapi profil sembari menunggu.
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" />
      <input ref={selfieRef} type="file" accept="image/*" className="hidden" />
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
      <h2 className="font-black text-[22px] text-[#1a2d4a] mb-1">Pilih keahlian Anda</h2>
      <p className="text-[#3d6b5e] text-[14px] mb-5">Pilih semua layanan yang bisa Anda kerjakan. Minimal 1 keahlian.</p>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {KEAHLIAN.map((k) => {
          const selected = data.keahlian.includes(k.id);
          return (
            <button
              key={k.id}
              onClick={() => toggle(k.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                selected
                  ? "border-[#1a2d4a] bg-[#1a2d4a] text-white"
                  : "border-[#c8dfd8] bg-white hover:border-[#1a2d4a]/40"
              }`}
            >
              <span className="text-[22px] shrink-0">{k.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-[12px] leading-snug ${selected ? "text-white" : "text-[#0f2035]"}`}>
                  {k.label}
                </p>
              </div>
              {selected && <CheckCircle size={14} className="text-[#F59E42] shrink-0" />}
            </button>
          );
        })}
      </div>

      {data.keahlian.length > 0 && (
        <div className="bg-[#1a2d4a]/5 border border-[#1a2d4a]/10 rounded-xl px-4 py-2.5 text-[12px] text-[#1a3d5c] font-semibold">
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
        <h2 className="font-black text-[22px] text-[#1a2d4a] mb-1">Pengalaman & tarif</h2>
        <p className="text-[#3d6b5e] text-[14px] mb-2">Bantu pelanggan memahami kemampuan dan harga Anda</p>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-2">Lama pengalaman</label>
        <div className="flex flex-col gap-2">
          {PENGALAMAN_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ pengalaman: opt })}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-[14px] font-semibold text-left transition-all ${
                data.pengalaman === opt
                  ? "border-[#1a2d4a] bg-[#1a2d4a] text-white"
                  : "border-[#c8dfd8] bg-white text-[#1a3d5c] hover:border-[#1a2d4a]/40"
              }`}
            >
              {opt}
              {data.pengalaman === opt && <CheckCircle size={16} className="text-[#F59E42]" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">
          Deskripsi singkat tentang Anda <span className="font-normal text-[#7a9a8f]">(opsional)</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={4}
          placeholder="Contoh: Saya adalah tukang ledeng berpengalaman dengan 5 tahun di bidang plumbing residensial dan komersial. Melayani darurat 24 jam di Jakarta Selatan dan sekitarnya..."
          className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#1a2d4a] resize-none transition-all"
        />
        <p className="text-[11px] text-[#7a9a8f] mt-1">{data.bio.length}/300 karakter</p>
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
        <h2 className="font-black text-[26px] text-[#1a2d4a] mb-1">Pendaftaran berhasil!</h2>
        <p className="text-[#3d6b5e] text-[14px] max-w-xs mx-auto">
          Akun tukang Anda sedang dalam proses verifikasi. Kami akan memberi tahu Anda dalam <span className="font-bold text-[#1a2d4a]">1×24 jam</span>.
        </p>
      </div>

      {/* Profile preview card */}
      <div className="w-full bg-[#1a2d4a] rounded-2xl overflow-hidden text-left">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-[#2E5090] flex items-center justify-center text-white font-black text-[18px]">
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
              <p className="text-[13px] font-bold text-[#F59E42]">{data.tarif}</p>
            </div>
          )}
        </div>
      </div>

      {/* Verification status */}
      <div className="w-full bg-[#F5F1E8] border border-[#c8dfd8] rounded-2xl p-4 text-left space-y-2.5">
        <p className="font-bold text-[13px] text-[#0f2035] mb-3">Status verifikasi:</p>
        {[
          { label: "Akun dibuat", done: true },
          { label: "Informasi profil", done: !!data.nama && !!data.phone },
          { label: "Verifikasi KTP", done: !!data.ktpPhoto, pending: !data.ktpPhoto },
          { label: "Keahlian dikonfirmasi", done: data.keahlian.length > 0 },
          { label: "Akun disetujui & aktif", done: false, pending: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-[13px]">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              item.done ? "bg-[#20bf6f]" : item.pending ? "bg-yellow-400" : "bg-[#c8dfd8]"
            }`}>
              {item.done ? <CheckCircle size={12} className="text-white" /> : <Clock size={11} className="text-[#1a2d4a]" />}
            </div>
            <span className={item.done ? "text-[#0f2035] font-semibold" : item.pending ? "text-yellow-700 font-semibold" : "text-[#7a9a8f]"}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => navigate("/dasbor-tukang")}
          className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          Buka Dasbor Tukang →
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] py-3 rounded-2xl hover:border-[#2E5090] hover:text-[#2E5090] transition-all"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

// ─── can proceed logic ────────────────────────────────────────────────────────

function canProceed(step: number, data: TechData): boolean {
  if (step === 0) return !!(data.authMethod || (data.email.includes("@") && data.password.length >= 6));
  if (step === 1) return data.nama.trim().length >= 2 && data.phone.length >= 8 && !!data.area;
  if (step === 2) return !!data.ktpPhoto && !!data.selfiePhoto;
  if (step === 3) return data.keahlian.length >= 1;
  if (step === 4) return !!data.pengalaman;
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL: TechData = {
  authMethod: null, nama: "", phone: "", area: "",
  nik: "", ktpPhoto: null, selfiePhoto: null,
  keahlian: [], pengalaman: "", tarif: "", bio: "",
  email: "", password: "",
};

export default function TechAuth() {
  const navigate = useNavigate();
  const { register, setSession } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<TechData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (patch: Partial<TechData>) => setData((d) => ({ ...d, ...patch }));

  const handleOAuth = (provider: OAuthProvider) => {
    if (provider === "google") {
      window.location.href = api.googleAuthUrl();
      return;
    }
    setOauthLoading(provider);
    setTimeout(() => {
      const names: Record<OAuthProvider, string> = {
        google: "Budi Santoso", facebook: "Sari Dewi", apple: "Ahmad Rizki",
      };
      setOauthLoading(null);
      update({ authMethod: provider, nama: names[provider] });
      setStep(1);
    }, 1800);
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      if (data.authMethod === "email" || data.email) {
        const result = await api.register(data.email, data.password, data.nama, "technician");
        setSession(result.accessToken, result.refreshToken, result.user);
      }
      await api.saveTechnicianProfile({
        phone: data.phone,
        area: data.area,
        nik: data.nik,
        ktpPhoto: data.ktpPhoto,
        selfiePhoto: data.selfiePhoto,
        keahlian: data.keahlian,
        pengalaman: data.pengalaman,
        tarif: data.tarif,
        bio: data.bio,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Pendaftaran gagal");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] py-10 px-4" style={{ fontFamily: "Manrope, sans-serif" }}>
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2E5090] flex items-center justify-center">
                <HardHat size={16} className="text-white" />
              </div>
              <span className="font-black text-[18px] text-[#2E5090]">KerjaIn</span>
            </div>
          </div>
          <SuccessScreen data={data} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-[520px] mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-[#2E5090] flex items-center justify-center">
            <HardHat size={16} className="text-white" />
          </div>
          <span className="font-black text-[18px] text-[#2E5090]">KerjaIn</span>
          <span className="text-[12px] font-bold text-[#7a9a8f] bg-[#f0f7f4] px-2 py-0.5 rounded-full">Tukang</span>
        </Link>
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1 text-[13px] font-semibold text-[#3d6b5e] hover:text-[#1a2d4a] transition-colors">
            <ChevronLeft size={15} /> Kembali
          </button>
        ) : (
          <Link to="/daftar" className="flex items-center gap-1 text-[13px] font-semibold text-[#3d6b5e] hover:text-[#2E5090] transition-colors">
            <ChevronLeft size={15} /> Kembali
          </Link>
        )}
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-4">
        {/* Banner */}
        {step === 0 && (
          <div className="bg-gradient-to-r from-[#1a2d4a] to-[#3d1515] rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2E5090]/20 flex items-center justify-center shrink-0">
              <HardHat size={30} className="text-[#F59E42]" />
            </div>
            <div>
              <p className="font-black text-[16px] text-white">Daftar sebagai Tukang</p>
              <p className="text-[12px] text-white/60 mt-0.5">Terima pekerjaan plumbing & perawatan di Jakarta</p>
              <div className="flex gap-3 mt-2">
                {["Gratis daftar", "Verifikasi KTP", "Langsung dapat pekerjaan"].map((t) => (
                  <span key={t} className="text-[10px] font-bold text-[#F59E42]">✓ {t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-[#c8dfd8] p-6 mb-5 min-h-[380px]">
          {step === 0 && (
            <StepAuth data={data} onChange={update} onOAuth={handleOAuth} oauthLoading={oauthLoading} />
          )}
          {step === 1 && <StepProfil data={data} onChange={update} />}
          {step === 2 && <StepKTP data={data} onChange={update} />}
          {step === 3 && <StepKeahlian data={data} onChange={update} />}
          {step === 4 && <StepPengalaman data={data} onChange={update} />}
        </div>

        {/* KTP skip note */}
        {step === 2 && (
          <p className="text-center text-[12px] text-[#7a9a8f] mb-3">
            Belum punya KTP siap?{" "}
            <button onClick={() => setStep(3)} className="text-[#2E5090] font-bold hover:underline">
              Lewati untuk sekarang
            </button>
          </p>
        )}

        {/* Nav button */}
        {!(step === 0 && oauthLoading) && (
          <button
            onClick={handleNext}
            disabled={!canProceed(step, data)}
            className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-2xl transition-all ${
              canProceed(step, data)
                ? "bg-[#1a2d4a] hover:opacity-90 text-white"
                : "bg-[#c8dfd8] text-[#7a9a8f] cursor-not-allowed"
            }`}
          >
            {step === STEPS.length - 1 ? "Selesai & Daftarkan Akun" : (
              <>{step === 0 ? "Lanjutkan" : "Selanjutnya"} <ChevronRight size={16} /></>
            )}
          </button>
        )}

        {/* Trust strip */}
        <div className="flex flex-wrap justify-center gap-5 mt-5 text-[11px] text-[#7a9a8f]">
          {["🔒 Data terenkripsi", "✅ Verifikasi resmi", "🆓 Daftar 100% gratis"].map((b) => (
            <span key={b} className="font-semibold">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
