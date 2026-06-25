import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight, ChevronLeft, CheckCircle, MapPin, Calendar,
  Clock, Banknote, Camera, X, AlertCircle, Share2, Copy,
  Wrench, FileText, Star, Loader2, Pencil,
} from "lucide-react";
import { api } from "../../lib/api";
import { tasksUrl } from "../../lib/paths";
import { ApiError, type PostJobFormData } from "../../types";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"]);

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

// ─── Data ────────────────────────────────────────────────────────────────────

const LAYANAN = [
  { id: "darurat",     label: "Pipa Bocor Darurat",  emoji: "🚨", desc: "Pipa pecah, banjir, bocor parah" },
  { id: "deteksi",     label: "Deteksi Kebocoran",   emoji: "💧", desc: "Cari & perbaiki kebocoran tersembunyi" },
  { id: "mampet",      label: "Saluran Mampet",      emoji: "🔩", desc: "Saluran buntu, mampet, kotor" },
  { id: "water",       label: "Pemanas Air",          emoji: "🔥", desc: "Pasang, perbaiki & ganti water heater" },
  { id: "pipa",        label: "Ganti Pipa",           emoji: "🪛", desc: "Pipa lama atau pecah diganti tuntas" },
  { id: "bathroom",    label: "Pasang Kamar Mandi",   emoji: "🛁", desc: "Kran, WC, shower & wastafel" },
  { id: "maintenance", label: "Perawatan Umum",       emoji: "🔧", desc: "Perawatan & perbaikan rumah lengkap" },
  { id: "handyman",    label: "Tukang Serba Bisa",    emoji: "🪚", desc: "Pekerjaan kecil, pasang & perbaiki" },
  { id: "pintu",       label: "Perbaikan Pintu",      emoji: "🚪", desc: "Pintu macet, kunci rusak, engsel" },
  { id: "talang",      label: "Bersih Talang",        emoji: "🏠", desc: "Talang mampet dibersihkan tuntas" },
  { id: "keramik",     label: "Perbaikan Keramik",    emoji: "🧱", desc: "Keramik retak ditambal atau diganti" },
  { id: "atap",        label: "Perawatan Atap",       emoji: "⛏️", desc: "Perbaikan atap kecil & inspeksi" },
];

const AREA_JAKARTA = [
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
  "Depok", "Tangerang", "Tangerang Selatan", "Bekasi", "Bogor",
];

const WAKTU_OPTIONS = [
  { id: "asap",     label: "Segera",            desc: "Butuh ditangani hari ini",           emoji: "🚨" },
  { id: "sebelum",  label: "Sebelum tanggal",   desc: "Ada batas waktu tertentu",           emoji: "📅" },
  { id: "fleksibel",label: "Fleksibel",         desc: "Tidak ada kebutuhan mendesak",       emoji: "🕐" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type PhotoStatus = "uploading" | "done" | "error";

interface JobPhoto {
  id: string;
  file: File;
  preview: string;
  status: PhotoStatus;
  storageUrl?: string;
  storagePath?: string;
  uploadError?: string;
}

interface FormData extends PostJobFormData {
  localPhotos: JobPhoto[];
}

function photosBlockingSubmit(photos: JobPhoto[]): string | null {
  const uploading = photos.filter((p) => p.status === "uploading");
  if (uploading.length > 0) {
    return `Menunggu ${uploading.length} foto selesai diunggah…`;
  }
  const failed = photos.filter((p) => p.status === "error");
  if (failed.length > 0) {
    return "Beberapa foto gagal diunggah. Hapus atau ketuk untuk coba lagi.";
  }
  return null;
}

function PhotoGrid({
  photos,
  photoError,
  onAdd,
  onRemove,
  onRetry,
  hideTitle = false,
}: {
  photos: JobPhoto[];
  photoError?: string;
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  hideTitle?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {!hideTitle && (
        <p className="font-bold text-[14px] text-[#0f2035] mb-3">Tambahkan foto (opsional)</p>
      )}
      <div className="flex gap-3 flex-wrap pt-1 pr-1">
        {photos.map((photo) => (
          <div key={photo.id} className="relative w-[90px] h-[90px] shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden border-2 border-[#F59E42] relative">
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              {photo.status === "uploading" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <Loader2 size={22} className="text-white animate-spin" />
                </div>
              )}
              {photo.status === "error" && (
                <button
                  type="button"
                  onClick={() => onRetry(photo.id)}
                  className="absolute inset-0 bg-red-600/80 flex flex-col items-center justify-center text-white p-1 pt-4"
                  title={photo.uploadError}
                >
                  <AlertCircle size={16} />
                  <span className="text-[9px] font-bold mt-0.5">Coba lagi</span>
                </button>
              )}
              {photo.status === "done" && (
                <div className="absolute bottom-0.5 left-0.5 w-4 h-4 rounded-full bg-[#20bf6f] flex items-center justify-center pointer-events-none">
                  <CheckCircle size={10} className="text-white" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              aria-label="Hapus foto"
              className="absolute -top-1.5 -right-1.5 z-20 w-6 h-6 rounded-full bg-[#2E5090] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#1e3d7a] transition-colors"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-[90px] h-[90px] rounded-xl border-2 border-dashed border-[#b8d4c8] flex flex-col items-center justify-center gap-1 hover:border-[#2E5090] hover:bg-[#F5F1E8] transition-all text-[#7a9a8f]"
          >
            <Camera size={22} />
            <span className="text-[10px] font-semibold">Tambah foto</span>
          </button>
        )}
      </div>
      {photoError && <p className="text-[12px] text-red-600 mt-2">{photoError}</p>}
      <p className="text-[11px] text-[#7a9a8f] mt-2">Maks. 3 foto, 5 MB per foto · diunggah otomatis</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        className="hidden"
        onChange={(e) => {
          onAdd(e.target.files);
          if (fileRef.current) fileRef.current.value = "";
        }}
      />
    </div>
  );
}

// ─── Step components ─────────────────────────────────────────────────────────

function StepPilihLayanan({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="font-black text-[26px] text-[#1a2d4a] mb-2">Apa yang perlu diperbaiki?</h2>
      <p className="text-[#3d6b5e] text-[15px] mb-6">Pilih kategori yang paling sesuai dengan masalah Anda.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LAYANAN.map((l) => (
          <button
            key={l.id}
            onClick={() => onChange({ layanan: l.id })}
            className={`text-left p-4 rounded-2xl border-2 transition-all ${
              data.layanan === l.id
                ? "border-[#2E5090] bg-[#f0f7f4] shadow-sm"
                : "border-[#c8dfd8] bg-white hover:border-[#F59E42] hover:bg-[#F5F1E8]"
            }`}
          >
            <span className="text-[32px] block mb-2">{l.emoji}</span>
            <p className={`font-bold text-[13px] leading-snug ${data.layanan === l.id ? "text-[#2E5090]" : "text-[#0f2035]"}`}>
              {l.label}
            </p>
            <p className="text-[11px] text-[#3d6b5e] mt-1 leading-snug">{l.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDeskripsi({
  data,
  onChange,
  photoError,
  onAddPhotos,
  onRemovePhoto,
  onRetryPhoto,
}: {
  data: FormData;
  onChange: (d: Partial<FormData>) => void;
  photoError: string;
  onAddPhotos: (files: FileList | null) => void;
  onRemovePhoto: (id: string) => void;
  onRetryPhoto: (id: string) => void;
}) {
  const layanan = LAYANAN.find((l) => l.id === data.layanan);

  return (
    <div>
      {layanan && (
        <div className="flex items-center gap-2 mb-5 bg-[#f0f7f4] border border-[#F59E42] rounded-xl px-4 py-2.5">
          <span className="text-[22px]">{layanan.emoji}</span>
          <span className="font-bold text-[14px] text-[#2E5090]">{layanan.label}</span>
        </div>
      )}
      <h2 className="font-black text-[26px] text-[#1a2d4a] mb-2">Jelaskan masalahnya</h2>
      <p className="text-[#3d6b5e] text-[15px] mb-5">Semakin detail deskripsi Anda, semakin tepat penawaran yang diterima.</p>

      <textarea
        value={data.deskripsi}
        onChange={(e) => onChange({ deskripsi: e.target.value })}
        placeholder="Contoh: Kran dapur menetes sudah 3 hari, air menetes terus-menerus bahkan saat sudah ditutup rapat. Sepertinya perlu ganti seal atau kran baru..."
        rows={5}
        className="w-full border-2 border-[#b8d4c8] rounded-2xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] outline-none focus:border-[#2E5090] focus:bg-white resize-none transition-all bg-[#F5F1E8]"
      />
      <div className="flex justify-between items-center mt-1 mb-5">
        <p className="text-[12px] text-[#7a9a8f]">Minimal 30 karakter</p>
        <p className={`text-[12px] font-semibold ${data.deskripsi.length >= 30 ? "text-[#20bf6f]" : "text-[#7a9a8f]"}`}>
          {data.deskripsi.length} karakter
        </p>
      </div>

      {/* Photo upload */}
      <PhotoGrid
        photos={data.localPhotos}
        photoError={photoError}
        onAdd={onAddPhotos}
        onRemove={onRemovePhoto}
        onRetry={onRetryPhoto}
      />

      {/* Tips */}
      <div className="mt-5 bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4">
        <p className="font-bold text-[13px] text-[#0f2035] mb-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-[#2E5090]" /> Tips deskripsi yang baik
        </p>
        <ul className="text-[12px] text-[#3d6b5e] space-y-1">
          <li>• Sebutkan lokasi masalah (dapur, kamar mandi, dll.)</li>
          <li>• Sudah berapa lama masalah terjadi</li>
          <li>• Apa yang sudah Anda coba sebelumnya</li>
          <li>• Jenis/merek alat jika relevan (misal: Ariston 50L)</li>
        </ul>
      </div>
    </div>
  );
}

function StepLokasi({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="font-black text-[26px] text-[#1a2d4a] mb-2">Di mana lokasinya?</h2>
      <p className="text-[#3d6b5e] text-[15px] mb-6">Tukang akan datang ke lokasi Anda. Pilih area dan masukkan alamat.</p>

      {true && (
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-[14px] text-[#0f2035] mb-2">Area Jakarta</label>
            <select
              value={data.area}
              onChange={(e) => onChange({ area: e.target.value })}
              className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] bg-[#F5F1E8] outline-none focus:border-[#2E5090] transition-all appearance-none cursor-pointer"
            >
              <option value="">Pilih area…</option>
              {AREA_JAKARTA.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-[14px] text-[#0f2035] mb-2">
              Alamat lengkap <span className="font-normal text-[#7a9a8f]">(opsional)</span>
            </label>
            <input
              value={data.alamat}
              onChange={(e) => onChange({ alamat: e.target.value })}
              placeholder="Jl. Sudirman No. 123, RT 01/RW 02"
              className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#2E5090] transition-all"
            />
            <p className="text-[12px] text-[#7a9a8f] mt-1.5">Alamat lengkap hanya dibagikan ke tukang yang Anda pilih</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StepWaktu({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="font-black text-[26px] text-[#1a2d4a] mb-2">Kapan dibutuhkan?</h2>
      <p className="text-[#3d6b5e] text-[15px] mb-6">Beri tahu tukang seberapa mendesak pekerjaan ini.</p>

      <div className="flex flex-col gap-3 mb-6">
        {WAKTU_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange({ waktuType: opt.id })}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              data.waktuType === opt.id
                ? "border-[#2E5090] bg-[#f0f7f4]"
                : "border-[#c8dfd8] bg-white hover:border-[#F59E42]"
            }`}
          >
            <span className="text-[36px] shrink-0">{opt.emoji}</span>
            <div className="flex-1">
              <p className={`font-bold text-[15px] ${data.waktuType === opt.id ? "text-[#2E5090]" : "text-[#0f2035]"}`}>
                {opt.label}
              </p>
              <p className="text-[13px] text-[#3d6b5e]">{opt.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
              data.waktuType === opt.id ? "border-[#2E5090] bg-[#2E5090]" : "border-[#b8d4c8]"
            }`}>
              {data.waktuType === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      {data.waktuType === "sebelum" && (
        <div>
          <label className="block font-bold text-[14px] text-[#0f2035] mb-2">Pilih tanggal batas</label>
          <input
            type="date"
            value={data.tanggal}
            onChange={(e) => onChange({ tanggal: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] bg-[#F5F1E8] outline-none focus:border-[#2E5090] transition-all"
          />
        </div>
      )}
    </div>
  );
}

function StepAnggaran({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const presets = ["Rp 100.000", "Rp 150.000", "Rp 250.000", "Rp 500.000", "Rp 750.000", "Rp 1.000.000"];

  return (
    <div>
      <h2 className="font-black text-[26px] text-[#1a2d4a] mb-2">Berapa anggaran Anda?</h2>
      <p className="text-[#3d6b5e] text-[15px] mb-6">Tetapkan anggaran atau biarkan tukang mengajukan harga mereka sendiri.</p>

      {/* Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { id: "tetap",  label: "Saya tetapkan harga", emoji: "💰" },
          { id: "minta",  label: "Minta tukang mengajukan harga", emoji: "📋" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange({ budgetType: opt.id as "tetap" | "minta" })}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              data.budgetType === opt.id
                ? "border-[#2E5090] bg-[#f0f7f4]"
                : "border-[#c8dfd8] bg-white hover:border-[#F59E42]"
            }`}
          >
            <span className="text-[30px] block mb-2">{opt.emoji}</span>
            <p className={`font-bold text-[13px] leading-snug ${data.budgetType === opt.id ? "text-[#2E5090]" : "text-[#0f2035]"}`}>
              {opt.label}
            </p>
          </button>
        ))}
      </div>

      {data.budgetType === "tetap" && (
        <div>
          <label className="block font-bold text-[14px] text-[#0f2035] mb-3">Masukkan anggaran</label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#2E5090] text-[15px]">Rp</span>
            <input
              type="number"
              value={data.budget}
              onChange={(e) => onChange({ budget: e.target.value })}
              placeholder="0"
              className="w-full border-2 border-[#b8d4c8] rounded-xl pl-12 pr-4 py-3 text-[18px] font-bold text-[#0f2035] bg-[#F5F1E8] outline-none focus:border-[#2E5090] transition-all"
            />
          </div>
          <p className="text-[13px] text-[#3d6b5e] mb-3">Atau pilih anggaran umum:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const val = p.replace(/[^0-9]/g, "");
              return (
                <button
                  key={p}
                  onClick={() => onChange({ budget: val })}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                    data.budget === val
                      ? "bg-[#2E5090] text-white border-[#2E5090]"
                      : "bg-white text-[#1a3d5c] border-[#b8d4c8] hover:border-[#2E5090] hover:text-[#2E5090]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {data.budgetType === "minta" && (
        <div className="bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4">
          <p className="text-[14px] text-[#1a3d5c] font-semibold mb-1">Apa artinya ini?</p>
          <p className="text-[13px] text-[#3d6b5e]">
            Tukang akan melihat pekerjaan Anda dan mengajukan harga sesuai keahlian mereka. Anda bisa membandingkan dan memilih penawaran terbaik.
          </p>
        </div>
      )}
    </div>
  );
}

function StepReview({
  data,
  photoError,
  onAddPhotos,
  onRemovePhoto,
  onRetryPhoto,
  onEditStep,
}: {
  data: FormData;
  photoError: string;
  onAddPhotos: (files: FileList | null) => void;
  onRemovePhoto: (id: string) => void;
  onRetryPhoto: (id: string) => void;
  onEditStep: (step: number) => void;
}) {
  const layanan = LAYANAN.find((l) => l.id === data.layanan);

  const formatBudget = (b: string) =>
    b ? `Rp ${parseInt(b).toLocaleString("id-ID")}` : "-";

  const rows: {
    label: string;
    value: string;
    step: number;
    icon: ReactNode;
    multiline?: boolean;
  }[] = [
    {
      icon: <span className="text-[24px]">{layanan?.emoji}</span>,
      label: "Layanan",
      value: layanan?.label ?? "-",
      step: 0,
    },
    {
      icon: <FileText size={20} className="text-[#2E5090]" />,
      label: "Deskripsi",
      value: data.deskripsi || "-",
      step: 1,
      multiline: true,
    },
    {
      icon: <MapPin size={20} className="text-[#2E5090]" />,
      label: "Lokasi",
      value: [data.area, data.alamat].filter(Boolean).join(", ") || "Jakarta",
      step: 2,
    },
    {
      icon: <Calendar size={20} className="text-[#2E5090]" />,
      label: "Waktu",
      value: data.waktuType === "asap"
        ? "Segera / Hari ini"
        : data.waktuType === "sebelum"
        ? `Sebelum ${data.tanggal || "tanggal dipilih"}`
        : "Fleksibel",
      step: 3,
    },
    {
      icon: <Banknote size={20} className="text-[#2E5090]" />,
      label: "Anggaran",
      value: data.budgetType === "minta"
        ? "Minta tukang mengajukan harga"
        : formatBudget(data.budget),
      step: 4,
    },
  ];

  return (
    <div>
      <h2 className="font-black text-[26px] text-[#1a2d4a] mb-2">Tinjau sebelum posting</h2>
      <p className="text-[#3d6b5e] text-[15px] mb-6">Pastikan semua detail sudah benar. Ketuk Ubah untuk mengedit.</p>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-4 bg-white border border-[#c8dfd8] rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg bg-[#f0f7f4] flex items-center justify-center shrink-0 mt-0.5">
              {row.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider mb-0.5">{row.label}</p>
              <p className={`text-[14px] font-semibold text-[#0f2035] ${row.multiline ? "line-clamp-3" : ""}`}>
                {row.value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(row.step)}
              className="shrink-0 flex items-center gap-1 text-[12px] font-bold text-[#2E5090] hover:text-[#1e3d7a] px-2 py-1 rounded-lg hover:bg-[#f0f7f4] transition-colors"
            >
              <Pencil size={13} /> Ubah
            </button>
          </div>
        ))}

        <div className="bg-white border border-[#c8dfd8] rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f0f7f4] flex items-center justify-center shrink-0">
                <Camera size={16} className="text-[#2E5090]" />
              </div>
              <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider">
                Foto {data.localPhotos.length > 0 ? `(${data.localPhotos.length})` : "(opsional)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="shrink-0 flex items-center gap-1 text-[12px] font-bold text-[#2E5090] hover:text-[#1e3d7a] px-2 py-1 rounded-lg hover:bg-[#f0f7f4] transition-colors"
            >
              <Pencil size={13} /> Ubah
            </button>
          </div>
          <PhotoGrid
            photos={data.localPhotos}
            photoError={photoError}
            onAdd={onAddPhotos}
            onRemove={onRemovePhoto}
            onRetry={onRetryPhoto}
            hideTitle
          />
        </div>
      </div>

      <div className="mt-5 bg-[#f0f7f4] border border-[#F59E42] rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-[#2E5090] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#1a3d5c]">
          Dengan memposting pekerjaan ini, Anda menyetujui <span className="font-bold text-[#2E5090]">Syarat & Ketentuan</span> dan <span className="font-bold text-[#2E5090]">Kebijakan Privasi</span> KerjaIn.
          Informasi kontak Anda hanya dibagikan ke tukang yang Anda pilih.
        </p>
      </div>
    </div>
  );
}

// ─── Job Ticket ───────────────────────────────────────────────────────────────

function JobTicket({ data, jobId, jobUuid }: { data: FormData; jobId: string; jobUuid: string }) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const layanan = LAYANAN.find((l) => l.id === data.layanan);
  const navigate = useNavigate();

  const jobLink = jobUuid ? `${window.location.origin}${tasksUrl({ id: jobUuid })}` : "";

  const formatBudget = (b: string) =>
    b ? `Rp ${parseInt(b).toLocaleString("id-ID")}` : "Minta penawaran";

  const copyId = () => {
    navigator.clipboard.writeText(jobId).catch(() => {});
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyLink = () => {
    if (!jobLink) return;
    navigator.clipboard.writeText(jobLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!jobLink) return;
    const text = encodeURIComponent(`Lihat pekerjaan saya di KerjaIn: ${jobLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const now = new Date();
  const postedAt = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Success banner */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#f0f7f4] border-4 border-[#F59E42] flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-[#2E5090]" fill="#2E5090" />
        </div>
        <h2 className="font-black text-[32px] text-[#1a2d4a] mb-2">Pekerjaan berhasil diposting!</h2>
        <p className="text-[#3d6b5e] text-[16px]">
          Tukang di Jakarta sedang melihat pekerjaan Anda. Penawaran biasanya masuk dalam <span className="font-bold text-[#2E5090]">15–30 menit</span>.
        </p>
      </div>

      {/* Ticket card */}
      <div className="bg-white rounded-3xl border-2 border-[#c8dfd8] overflow-hidden shadow-lg">
        {/* Ticket header */}
        <div className="bg-[#1a2d4a] px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Wrench size={16} className="text-[#F59E42]" />
              </div>
              <span className="font-black text-white text-[16px]">KerjaIn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#20bf6f] animate-pulse" />
              <span className="text-[12px] font-bold text-[#20bf6f]">TERBUKA</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">ID Pekerjaan</p>
              <button onClick={copyId} className="flex items-center gap-1.5 text-white font-black text-[18px] hover:text-[#F59E42] transition-colors">
                {jobId}
                {copiedId ? <CheckCircle size={14} className="text-[#20bf6f]" /> : <Copy size={14} className="text-white/50" />}
              </button>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">Anggaran</p>
              <p className="font-black text-[20px] text-[#F59E42]">
                {data.budgetType === "minta" ? "Terbuka" : formatBudget(data.budget)}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#F5F1E8] -ml-2 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-[#c8dfd8]" />
          <div className="w-4 h-4 rounded-full bg-[#F5F1E8] -mr-2 shrink-0" />
        </div>

        {/* Ticket body */}
        <div className="px-6 py-5 space-y-4">
          {/* Service + title */}
          <div className="flex items-center gap-3">
            <span className="text-[36px]">{layanan?.emoji}</span>
            <div>
              <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider">{layanan?.label}</p>
              <p className="font-bold text-[16px] text-[#0f2035] leading-snug line-clamp-2">{data.deskripsi || "Tidak ada deskripsi"}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F5F1E8] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={13} className="text-[#2E5090]" />
                <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider">Lokasi</p>
              </div>
              <p className="text-[13px] font-semibold text-[#0f2035]">
                {data.lokasiType === "remote" ? "Jarak jauh" : data.area || "Jakarta"}
              </p>
            </div>
            <div className="bg-[#F5F1E8] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-[#2E5090]" />
                <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider">Waktu</p>
              </div>
              <p className="text-[13px] font-semibold text-[#0f2035]">
                {data.waktuType === "asap" ? "Segera" : data.waktuType === "sebelum" ? `Sebelum ${data.tanggal}` : "Fleksibel"}
              </p>
            </div>
          </div>

          {/* Posted at */}
          <div className="flex items-center justify-between text-[12px] text-[#7a9a8f]">
            <span>Diposting: {postedAt}</span>
            <span className="font-semibold">0 penawaran</span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-[#2E5090]">Menunggu penawaran</span>
              <span className="text-[#7a9a8f]">0 / ~5 penawaran</span>
            </div>
            <div className="h-2 rounded-full bg-[#f0f7f4] overflow-hidden">
              <div className="h-full w-0 bg-[#2E5090] rounded-full animate-pulse" style={{ width: "5%" }} />
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#F5F1E8] -ml-2 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-[#c8dfd8]" />
          <div className="w-4 h-4 rounded-full bg-[#F5F1E8] -mr-2 shrink-0" />
        </div>

        {/* What happens next */}
        <div className="px-6 py-5">
          <p className="font-bold text-[13px] text-[#0f2035] mb-3">Apa yang terjadi selanjutnya?</p>
          <div className="space-y-3">
            {[
              { icon: "🔔", text: "Anda akan dapat notifikasi saat penawaran masuk" },
              { icon: "👀", text: "Tinjau profil, rating, dan harga dari setiap tukang" },
              { icon: "✅", text: "Pilih tukang terbaik dan setujui pekerjaan" },
              { icon: "🔒", text: "Bayar dengan aman — uang dicairkan setelah selesai" },
            ].map((item) => (
              <div key={item.icon} className="flex items-center gap-3 text-[13px] text-[#1a3d5c]">
                <span className="text-[18px] shrink-0">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={() => navigate(jobUuid ? tasksUrl({ id: jobUuid }) : "/tasks")}
          className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[15px] py-4 rounded-2xl transition-colors"
        >
          {jobUuid ? "Lihat pekerjaan saya" : "Lihat semua pekerjaan"}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copyLink}
            disabled={!jobLink}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] py-3 rounded-2xl hover:border-[#2E5090] hover:text-[#2E5090] transition-all disabled:opacity-50"
          >
            <Copy size={16} /> {copiedLink ? "Tersalin!" : "Salin Tautan"}
          </button>
          <button
            type="button"
            onClick={shareWhatsApp}
            disabled={!jobLink}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] py-3 rounded-2xl hover:border-[#2E5090] hover:text-[#2E5090] transition-all disabled:opacity-50"
          >
            <Share2 size={16} /> WhatsApp
          </button>
        </div>
        <button
          type="button"
          onClick={copyId}
          className="w-full text-center text-[13px] text-[#7a9a8f] hover:text-[#2E5090] transition-colors py-1"
        >
          Salin ID pekerjaan ({jobId})
        </button>
        <Link
          to="/"
          className="text-center text-[13px] text-[#7a9a8f] hover:text-[#2E5090] transition-colors py-1"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const STEPS = ["Layanan", "Deskripsi", "Lokasi", "Waktu", "Anggaran", "Tinjau"];
const REVIEW_STEP = STEPS.length - 1;

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-all ${
              i < step
                ? "bg-[#2E5090] text-white"
                : i === step
                ? "bg-[#2E5090] text-white ring-4 ring-[#F59E42]/40"
                : "bg-[#f0f7f4] text-[#7a9a8f]"
            }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <p className={`text-[10px] font-bold mt-1 hidden sm:block ${i === step ? "text-[#2E5090]" : i < step ? "text-[#2E5090]/60" : "text-[#7a9a8f]"}`}>
              {label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 transition-all ${i < step ? "bg-[#2E5090]" : "bg-[#c8dfd8]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const INITIAL_DATA: FormData = {
  layanan: "",
  deskripsi: "",
  photos: [],
  localPhotos: [],
  lokasiType: "lokasi",
  area: "",
  alamat: "",
  waktuType: "",
  tanggal: "",
  budgetType: "tetap",
  budget: "",
};

function canProceed(step: number, data: FormData): boolean {
  if (step === 0) return !!data.layanan;
  if (step === 1) return data.deskripsi.length >= 30;
  if (step === 2) return !!data.area;
  if (step === 3) return !!data.waktuType;
  if (step === 4) return data.budgetType === "minta" || !!data.budget;
  return true;
}

function canSaveEditStep(step: number, data: FormData): boolean {
  if (!canProceed(step, data)) return false;
  if (step === 1 && photosBlockingSubmit(data.localPhotos)) return false;
  return true;
}

export default function PostJob() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [jobId, setJobId] = useState("");
  const [jobUuid, setJobUuid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [returnToReview, setReturnToReview] = useState(false);

  const removedPhotoIdsRef = useRef(new Set<string>());
  const uploadPromisesRef = useRef(new Map<string, Promise<void>>());
  const localPhotosRef = useRef(data.localPhotos);
  localPhotosRef.current = data.localPhotos;

  useEffect(() => {
    return () => {
      localPhotosRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []);

  const updatePhoto = (id: string, patch: Partial<JobPhoto>) => {
    setData((d) => ({
      ...d,
      localPhotos: d.localPhotos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const startUpload = (photo: JobPhoto) => {
    const promise = (async () => {
      const base64 = await readFileAsBase64(photo.file);
      const { url, path } = await api.uploadJobPhoto(base64, photo.file.type);

      if (removedPhotoIdsRef.current.has(photo.id)) {
        api.deleteJobPhoto(path).catch(() => {});
        return;
      }

      updatePhoto(photo.id, { status: "done", storageUrl: url, storagePath: path, uploadError: undefined });
    })().catch((err) => {
      if (removedPhotoIdsRef.current.has(photo.id)) return;
      const message = err instanceof Error ? err.message : "Gagal mengunggah";
      updatePhoto(photo.id, { status: "error", uploadError: message });
    }).finally(() => {
      uploadPromisesRef.current.delete(photo.id);
    });

    uploadPromisesRef.current.set(photo.id, promise);
  };

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError("");

    const remaining = MAX_PHOTOS - data.localPhotos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const added: JobPhoto[] = [];

    for (const file of toAdd) {
      if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
        setPhotoError("Format foto harus JPEG, PNG, atau WebP");
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError("Ukuran foto maksimal 5 MB");
        continue;
      }
      const photo: JobPhoto = {
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: "uploading",
      };
      added.push(photo);
    }

    if (!added.length) return;

    setData((d) => ({ ...d, localPhotos: [...d.localPhotos, ...added] }));
    added.forEach((photo) => startUpload(photo));
  };

  const removePhoto = (id: string) => {
    removedPhotoIdsRef.current.add(id);
    const photo = data.localPhotos.find((p) => p.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
      if (photo.storagePath) {
        api.deleteJobPhoto(photo.storagePath).catch(() => {});
      }
    }
    setData((d) => ({ ...d, localPhotos: d.localPhotos.filter((p) => p.id !== id) }));
  };

  const retryPhoto = (id: string) => {
    const photo = data.localPhotos.find((p) => p.id === id);
    if (!photo) return;
    removedPhotoIdsRef.current.delete(id);
    updatePhoto(id, { status: "uploading", uploadError: undefined, storageUrl: undefined, storagePath: undefined });
    startUpload(photo);
  };

  const waitForPendingUploads = async () => {
    const pending = [...uploadPromisesRef.current.values()];
    if (pending.length > 0) {
      await Promise.allSettled(pending);
    }
  };

  const photoBlockReason = photosBlockingSubmit(data.localPhotos);

  const editFromReview = (targetStep: number) => {
    setReturnToReview(true);
    setSubmitError("");
    setStep(targetStep);
  };

  const goBackToReview = () => {
    setReturnToReview(false);
    setStep(REVIEW_STEP);
  };

  const handleNext = async () => {
    if (returnToReview) {
      if (!canSaveEditStep(step, data)) return;
      goBackToReview();
      return;
    }

    if (step < REVIEW_STEP) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await waitForPendingUploads();

      const photos = localPhotosRef.current;
      const blockReason = photosBlockingSubmit(photos);
      if (blockReason) {
        setSubmitError(blockReason);
        return;
      }

      const photoUrls = photos
        .filter((p) => p.status === "done" && p.storageUrl)
        .map((p) => p.storageUrl!);

      const { job } = await api.createJob({
        layanan: data.layanan,
        deskripsi: data.deskripsi,
        photos: photoUrls,
        lokasiType: data.lokasiType,
        area: data.area,
        alamat: data.alamat,
        waktuType: data.waktuType,
        tanggal: data.tanggal,
        budgetType: data.budgetType,
        budget: data.budget,
      });
      setJobId(job.jobNumber);
      setJobUuid(job.id);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const detailMsgs = err.details ? Object.values(err.details) : [];
        setSubmitError(detailMsgs.length > 0 ? detailMsgs.join(" · ") : err.message);
      } else {
        setSubmitError(err instanceof Error ? err.message : "Gagal memposting pekerjaan");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (returnToReview) {
      goBackToReview();
      return;
    }
    setStep((s) => s - 1);
  };

  const update = (patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch }));

  const canSubmit = canProceed(step, data) && !photoBlockReason && !submitting;
  const progressStep = returnToReview ? REVIEW_STEP : step;
  const forwardEnabled = returnToReview
    ? canSaveEditStep(step, data) && !submitting
    : step === REVIEW_STEP
    ? canSubmit
    : canProceed(step, data) && !submitting;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] py-10 px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
        <JobTicket data={data} jobId={jobId} jobUuid={jobUuid} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="max-w-[680px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="w-9 h-9 rounded-full border border-[#b8d4c8] flex items-center justify-center hover:border-[#2E5090] transition-colors">
            <ChevronLeft size={18} className="text-[#3d6b5e]" />
          </Link>
          <div>
            <p className="text-[12px] text-[#7a9a8f] font-semibold">
              {returnToReview ? "Mengedit — kembali ke tinjauan" : `Langkah ${step + 1} dari ${STEPS.length}`}
            </p>
            <p className="font-black text-[15px] text-[#1a2d4a]">Pasang Pekerjaan</p>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar step={progressStep} />

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-[#c8dfd8] p-6 sm:p-8 mb-6 min-h-[400px]">
          {step === 0 && <StepPilihLayanan data={data} onChange={update} />}
          {step === 1 && (
            <StepDeskripsi
              data={data}
              onChange={update}
              photoError={photoError}
              onAddPhotos={addPhotos}
              onRemovePhoto={removePhoto}
              onRetryPhoto={retryPhoto}
            />
          )}
          {step === 2 && <StepLokasi data={data} onChange={update} />}
          {step === 3 && <StepWaktu data={data} onChange={update} />}
          {step === 4 && <StepAnggaran data={data} onChange={update} />}
          {step === 5 && (
            <StepReview
              data={data}
              photoError={photoError}
              onAddPhotos={addPhotos}
              onRemovePhoto={removePhoto}
              onRetryPhoto={retryPhoto}
              onEditStep={editFromReview}
            />
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          {(step > 0 || returnToReview) && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] px-6 py-3.5 rounded-2xl hover:border-[#2E5090] hover:text-[#2E5090] transition-all"
            >
              <ChevronLeft size={16} /> {returnToReview ? "Kembali ke tinjauan" : "Kembali"}
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!forwardEnabled}
            className={`flex-1 flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-2xl transition-all ${
              forwardEnabled
                ? "bg-[#2E5090] hover:bg-[#1e3d7a] text-white"
                : "bg-[#c8dfd8] text-[#7a9a8f] cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Memposting…</>
            ) : returnToReview ? (
              <><CheckCircle size={16} /> Simpan & kembali</>
            ) : step === REVIEW_STEP && photoBlockReason ? (
              photoBlockReason
            ) : step === REVIEW_STEP ? (
              <>Posting Sekarang <Star size={16} /></>
            ) : (
              <>Lanjut <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        {returnToReview && step === 1 && photoBlockReason && !submitting && (
          <p className="text-center text-[12px] text-[#7a9a8f] mt-2">{photoBlockReason}</p>
        )}

        {photoBlockReason && step === REVIEW_STEP && !submitting && !returnToReview && (
          <p className="text-center text-[12px] text-[#7a9a8f] mt-2">{photoBlockReason}</p>
        )}

        {submitError && (
          <p className="text-center text-[13px] text-red-600 font-semibold mt-3">{submitError}</p>
        )}

        {/* Trust note */}
        <div className="flex items-center justify-center gap-4 mt-5 text-[12px] text-[#7a9a8f]">
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-[#20bf6f]" /> Gratis posting</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-[#20bf6f]" /> Pembayaran aman</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-[#20bf6f]" /> Tanpa komitmen</span>
        </div>
      </div>
    </div>
  );
}
