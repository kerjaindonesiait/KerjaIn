import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChevronRight, ChevronLeft, CheckCircle, MapPin, Calendar,
  Clock, Banknote, Camera, X, AlertCircle, Share2, Copy, ExternalLink,
  FileText, Star, Pencil,
} from "lucide-react";
import { api } from "../../lib/api";
import type { PostJobFormData } from "../../types";
import { useScrollToTop } from "../../lib/useScrollToTop";
import { compressImageForUpload, blobToBase64 } from "../../lib/compressImage";
import { BrandLogo } from "../components/BrandLogo";
import { JobPhotoGallery } from "../components/JobPhotoGallery";

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

interface FormData extends PostJobFormData {}

// ─── Step components ─────────────────────────────────────────────────────────

type PhotoSlot = {
  id: string;
  preview: string;
  url?: string;
  path?: string;
  uploading: boolean;
};

function StepDeskripsi({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(() =>
    (data.photoUrls ?? []).map((url, i) => ({
      id: `saved-${i}-${url.slice(-8)}`,
      preview: url,
      url,
      path: data.photos[i],
      uploading: false,
    })),
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  const syncPhotos = (slots: PhotoSlot[]) => {
    onChange({
      photos: slots.filter((s) => s.path).map((s) => s.path!),
      photoUrls: slots.filter((s) => s.url).map((s) => s.url!),
      photosUploading: slots.some((s) => s.uploading),
    });
  };

  const handleFile = async (file: File) => {
    if (photoSlots.length >= 3) return;
    setUploadError(null);

    const slotId = crypto.randomUUID();
    const instantPreview = URL.createObjectURL(file);
    blobUrlsRef.current.add(instantPreview);

    setPhotoSlots((prev) => [
      ...prev,
      { id: slotId, preview: instantPreview, uploading: true },
    ]);

    try {
      const { blob, contentType } = await compressImageForUpload(file);
      const compressedPreview = URL.createObjectURL(blob);
      blobUrlsRef.current.add(compressedPreview);
      URL.revokeObjectURL(instantPreview);
      blobUrlsRef.current.delete(instantPreview);
      setPhotoSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, preview: compressedPreview } : slot,
        ),
      );

      const base64 = await blobToBase64(blob);
      const { url, path } = await api.uploadJobPhoto(base64, contentType);

      setPhotoSlots((prev) => {
        const next = prev.map((slot) => {
          if (slot.id !== slotId) return slot;
          if (slot.preview.startsWith("blob:")) {
            URL.revokeObjectURL(slot.preview);
            blobUrlsRef.current.delete(slot.preview);
          }
          return { ...slot, preview: url, url, path, uploading: false };
        });
        syncPhotos(next);
        return next;
      });
    } catch (e) {
      setPhotoSlots((prev) => {
        const slot = prev.find((s) => s.id === slotId);
        if (slot?.preview.startsWith("blob:")) {
          URL.revokeObjectURL(slot.preview);
          blobUrlsRef.current.delete(slot.preview);
        }
        return prev.filter((s) => s.id !== slotId);
      });
      setUploadError(e instanceof Error ? e.message : "Gagal mengunggah foto");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = async (index: number) => {
    const slot = photoSlots[index];
    if (!slot) return;

    if (slot.path) {
      try {
        await api.deleteJobPhoto(slot.path);
      } catch {
        /* best-effort delete */
      }
    }

    if (slot.preview.startsWith("blob:")) {
      URL.revokeObjectURL(slot.preview);
      blobUrlsRef.current.delete(slot.preview);
    }

    setPhotoSlots((prev) => {
      const next = prev.filter((_, j) => j !== index);
      syncPhotos(next);
      return next;
    });
  };

  const uploading = photoSlots.some((slot) => slot.uploading);

  return (
    <div>
      <h2 className="font-black text-[26px] text-[#172E4D] mb-2">Ceritakan masalahnya</h2>
      <p className="text-[#58708D] text-[15px] mb-5">Semakin jelas detailnya, semakin mudah tukang memberi penawaran yang pas.</p>

      <textarea
        value={data.deskripsi}
        onChange={(e) => onChange({ deskripsi: e.target.value })}
        placeholder="Contoh: Kran dapur menetes sudah 3 hari, air menetes terus-menerus bahkan saat sudah ditutup rapat. Sepertinya perlu ganti seal atau kran baru..."
        rows={5}
        className="w-full border-2 border-[#D8E2F0] rounded-2xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] outline-none focus:border-[#1D4196] focus:bg-white resize-none transition-all bg-[#F7F9FC]"
      />
      <div className="flex justify-between items-center mt-1 mb-5">
        <p className="text-[12px] text-[#7890AA]">Minimal 30 karakter</p>
        <p className={`text-[12px] font-semibold ${data.deskripsi.length >= 30 ? "text-[#20bf6f]" : "text-[#7890AA]"}`}>
          {data.deskripsi.length} karakter
        </p>
      </div>

      {/* Photo upload */}
      <div>
        <p className="font-bold text-[14px] text-[#172E4D] mb-3">Tambahkan foto (opsional)</p>
        <div className="flex gap-3 flex-wrap pt-1.5 pr-1.5">
          {photoSlots.map((slot, i) => (
            <div key={slot.id} className="relative shrink-0 w-[90px] h-[90px]">
              <div className="relative w-full h-full rounded-xl bg-[#EEF3FB] border-2 border-[#FD6665] overflow-hidden">
                <img
                  src={slot.preview}
                  alt=""
                  className="w-full h-full object-cover"
                  decoding="async"
                />
                {slot.uploading && (
                  <div className="absolute inset-0 bg-[#172E4D]/25 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void removePhoto(i)}
                className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 rounded-full bg-[#1D4196] text-white flex items-center justify-center shadow-md ring-2 ring-white hover:bg-[#173577] transition-colors"
                aria-label="Hapus foto"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          ))}
          {photoSlots.length < 3 && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-[90px] h-[90px] rounded-xl border-2 border-dashed border-[#D8E2F0] flex flex-col items-center justify-center gap-1 hover:border-[#1D4196] hover:bg-[#F7F9FC] transition-all text-[#7890AA] disabled:opacity-50"
            >
              <Camera size={22} />
              <span className="text-[10px] font-semibold">{uploading ? "Mengunggah…" : "Tambah foto"}</span>
            </button>
          )}
        </div>
        {uploadError && <p className="text-[12px] text-red-600 mt-2">{uploadError}</p>}
      </div>

      {/* Tips */}
      <div className="mt-5 bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4">
        <p className="font-bold text-[13px] text-[#172E4D] mb-2 flex items-center gap-2">
          <AlertCircle size={14} className="text-[#1D4196]" /> Tips deskripsi yang baik
        </p>
        <ul className="text-[12px] text-[#58708D] space-y-1">
          <li>• Sebutkan lokasi masalah (dapur, kamar mandi, dll.)</li>
          <li>• Sudah berapa lama masalah terjadi</li>
          <li>• Apa yang sudah kamu coba sebelumnya</li>
          <li>• Jenis/merek alat jika relevan (misal: Ariston 50L)</li>
        </ul>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}

function StepLokasi({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="font-black text-[26px] text-[#172E4D] mb-2">Di mana lokasinya?</h2>
      <p className="text-[#58708D] text-[15px] mb-6">Tukang akan datang ke lokasimu. Pilih area dan masukkan alamat.</p>

      {true && (
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-[14px] text-[#172E4D] mb-2">Area Jakarta</label>
            <select
              value={data.area}
              onChange={(e) => onChange({ area: e.target.value })}
              className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all appearance-none cursor-pointer"
            >
              <option value="">Pilih area…</option>
              {AREA_JAKARTA.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-[14px] text-[#172E4D] mb-2">
              Alamat lengkap <span className="font-normal text-[#7890AA]">(opsional)</span>
            </label>
            <input
              value={data.alamat}
              onChange={(e) => onChange({ alamat: e.target.value })}
              placeholder="Jl. Sudirman No. 123, RT 01/RW 02"
              className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
            />
            <p className="text-[12px] text-[#7890AA] mt-1.5">Alamat lengkap hanya dibagikan ke tukang yang kamu pilih</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StepWaktu({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div>
      <h2 className="font-black text-[26px] text-[#172E4D] mb-2">Kapan dibutuhkan?</h2>
      <p className="text-[#58708D] text-[15px] mb-6">Beri tahu tukang kapan pekerjaan ini perlu ditangani.</p>

      <div className="flex flex-col gap-3 mb-6">
        {WAKTU_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange({ waktuType: opt.id })}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              data.waktuType === opt.id
                ? "border-[#1D4196] bg-[#EEF3FB]"
                : "border-[#D8E2F0] bg-white hover:border-[#FD6665]"
            }`}
          >
            <span className="text-[36px] shrink-0">{opt.emoji}</span>
            <div className="flex-1">
              <p className={`font-bold text-[15px] ${data.waktuType === opt.id ? "text-[#1D4196]" : "text-[#172E4D]"}`}>
                {opt.label}
              </p>
              <p className="text-[13px] text-[#58708D]">{opt.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
              data.waktuType === opt.id ? "border-[#1D4196] bg-[#1D4196]" : "border-[#D8E2F0]"
            }`}>
              {data.waktuType === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      {data.waktuType === "sebelum" && (
        <div>
          <label className="block font-bold text-[14px] text-[#172E4D] mb-2">Pilih tanggal batas</label>
          <input
            type="date"
            value={data.tanggal}
            onChange={(e) => onChange({ tanggal: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
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
      <h2 className="font-black text-[26px] text-[#172E4D] mb-2">Berapa anggarannya?</h2>
      <p className="text-[#58708D] text-[15px] mb-6">Isi kisaran harga atau biarkan tukang mengajukan penawaran.</p>

      {/* Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { id: "tetap",  label: "Tetapkan harga", emoji: "💰" },
          { id: "minta",  label: "Minta tukang mengajukan harga", emoji: "📋" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange({ budgetType: opt.id as "tetap" | "minta" })}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              data.budgetType === opt.id
                ? "border-[#1D4196] bg-[#EEF3FB]"
                : "border-[#D8E2F0] bg-white hover:border-[#FD6665]"
            }`}
          >
            <span className="text-[30px] block mb-2">{opt.emoji}</span>
            <p className={`font-bold text-[13px] leading-snug ${data.budgetType === opt.id ? "text-[#1D4196]" : "text-[#172E4D]"}`}>
              {opt.label}
            </p>
          </button>
        ))}
      </div>

      {data.budgetType === "tetap" && (
        <div>
          <label className="block font-bold text-[14px] text-[#172E4D] mb-3">Masukkan anggaran</label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1D4196] text-[15px]">Rp</span>
            <input
              type="number"
              value={data.budget}
              onChange={(e) => onChange({ budget: e.target.value })}
              placeholder="0"
              className="w-full border-2 border-[#D8E2F0] rounded-xl pl-12 pr-4 py-3 text-[18px] font-bold text-[#172E4D] bg-[#F7F9FC] outline-none focus:border-[#1D4196] transition-all"
            />
          </div>
          <p className="text-[13px] text-[#58708D] mb-3">Atau pilih anggaran umum:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const val = p.replace(/[^0-9]/g, "");
              return (
                <button
                  key={p}
                  onClick={() => onChange({ budget: val })}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                    data.budget === val
                      ? "bg-[#1D4196] text-white border-[#1D4196]"
                      : "bg-white text-[#294566] border-[#D8E2F0] hover:border-[#1D4196] hover:text-[#1D4196]"
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
        <div className="bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4">
          <p className="text-[14px] text-[#294566] font-semibold mb-1">Apa artinya ini?</p>
          <p className="text-[13px] text-[#58708D]">
            Tukang akan melihat detail pekerjaan dan mengajukan harga sesuai keahlian mereka. Kamu bisa membandingkan lalu memilih penawaran yang paling cocok.
          </p>
        </div>
      )}
    </div>
  );
}

function StepReview({ data, onEdit }: { data: FormData; onEdit: (step: number) => void }) {
  const formatBudget = (b: string) =>
    b ? `Rp ${parseInt(b).toLocaleString("id-ID")}` : "-";

  const rows: {
    step: number;
    icon: ReactNode;
    label: string;
    value: string;
    multiline?: boolean;
  }[] = [
    {
      step: 0,
      icon: <FileText size={20} className="text-[#1D4196]" />,
      label: "Deskripsi",
      value: data.deskripsi || "-",
      multiline: true,
    },
    {
      step: 1,
      icon: <MapPin size={20} className="text-[#1D4196]" />,
      label: "Lokasi",
      value: [data.area, data.alamat].filter(Boolean).join(", ") || "Jakarta",
    },
    {
      step: 2,
      icon: <Calendar size={20} className="text-[#1D4196]" />,
      label: "Waktu",
      value: data.waktuType === "asap"
        ? "Segera / Hari ini"
        : data.waktuType === "sebelum"
        ? `Sebelum ${data.tanggal || "tanggal dipilih"}`
        : "Fleksibel",
    },
    {
      step: 3,
      icon: <Banknote size={20} className="text-[#1D4196]" />,
      label: "Anggaran",
      value: data.budgetType === "minta"
        ? "Minta tukang mengajukan harga"
        : formatBudget(data.budget),
    },
  ];

  return (
    <div>
      <h2 className="font-black text-[26px] text-[#172E4D] mb-2">Cek dulu sebelum dipasang</h2>
      <p className="text-[#58708D] text-[15px] mb-6">Pastikan semua detail sudah benar. Ketuk Ubah untuk mengedit.</p>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-4 bg-white border border-[#D8E2F0] rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg bg-[#EEF3FB] flex items-center justify-center shrink-0 mt-0.5">
              {row.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[#7890AA] uppercase tracking-wider mb-0.5">{row.label}</p>
              <p className={`text-[14px] font-semibold text-[#172E4D] ${row.multiline ? "line-clamp-3" : ""}`}>
                {row.value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="flex items-center gap-1 shrink-0 text-[12px] font-bold text-[#1D4196] hover:text-[#173577] px-2 py-1 rounded-lg hover:bg-[#EEF3FB] transition-colors"
            >
              <Pencil size={13} /> Ubah
            </button>
          </div>
        ))}

        <div className="flex items-start gap-4 bg-white border border-[#D8E2F0] rounded-2xl p-4">
          <div className="w-8 h-8 rounded-lg bg-[#EEF3FB] flex items-center justify-center shrink-0">
            <Camera size={16} className="text-[#1D4196]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#7890AA] uppercase tracking-wider mb-1">Foto</p>
            {(data.photoUrls?.length ?? 0) > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {data.photoUrls!.map((p, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg bg-[#EEF3FB] border border-[#FD6665] overflow-hidden shrink-0">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] font-semibold text-[#7890AA]">Tidak ada foto</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onEdit(0)}
            className="flex items-center gap-1 shrink-0 text-[12px] font-bold text-[#1D4196] hover:text-[#173577] px-2 py-1 rounded-lg hover:bg-[#EEF3FB] transition-colors"
          >
            <Pencil size={13} /> Ubah
          </button>
        </div>
      </div>

      <div className="mt-5 bg-[#EEF3FB] border border-[#FD6665] rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-[#1D4196] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#294566]">
          Dengan memasang pekerjaan ini, kamu menyetujui <span className="font-bold text-[#1D4196]">Syarat & Ketentuan</span> dan <span className="font-bold text-[#1D4196]">Kebijakan Privasi</span> KerjaIn.
          Informasi kontak hanya dibagikan ke tukang yang kamu pilih.
        </p>
      </div>
    </div>
  );
}

// ─── Job Ticket ───────────────────────────────────────────────────────────────

function JobTicket({ data, jobId, photos }: { data: FormData; jobId: string; photos: string[] }) {
  const [copied, setCopied] = useState(false);
  const layanan = LAYANAN.find((l) => l.id === data.layanan);
  const waktu = WAKTU_OPTIONS.find((w) => w.id === data.waktuType);
  const navigate = useNavigate();

  const formatBudget = (b: string) =>
    b ? `Rp ${parseInt(b).toLocaleString("id-ID")}` : "Minta penawaran";

  const copyId = () => {
    navigator.clipboard.writeText(jobId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const now = new Date();
  const postedAt = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Success banner */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#EEF3FB] border-4 border-[#FD6665] flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-[#1D4196]" fill="#1D4196" />
        </div>
        <h2 className="font-black text-[32px] text-[#172E4D] mb-2">Pekerjaan berhasil dipasang!</h2>
        <p className="text-[#58708D] text-[16px]">
          Tukang di Jakarta sedang melihat pekerjaanmu. Penawaran biasanya masuk dalam <span className="font-bold text-[#1D4196]">15–30 menit</span>.
        </p>
      </div>

      {/* Ticket card */}
      <div className="bg-white rounded-3xl border-2 border-[#D8E2F0] overflow-hidden shadow-lg">
        {/* Ticket header */}
        <div className="bg-[#172E4D] px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <BrandLogo variant="dark" imgClassName="h-8" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#20bf6f] animate-pulse" />
              <span className="text-[12px] font-bold text-[#20bf6f]">TERBUKA</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">ID Pekerjaan</p>
              <button onClick={copyId} className="flex items-center gap-1.5 text-white font-black text-[18px] hover:text-[#FD6665] transition-colors">
                {jobId}
                {copied ? <CheckCircle size={14} className="text-[#20bf6f]" /> : <Copy size={14} className="text-white/50" />}
              </button>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">Anggaran</p>
              <p className="font-black text-[20px] text-[#FD6665]">
                {data.budgetType === "minta" ? "Terbuka" : formatBudget(data.budget)}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#F7F9FC] -ml-2 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-[#D8E2F0]" />
          <div className="w-4 h-4 rounded-full bg-[#F7F9FC] -mr-2 shrink-0" />
        </div>

        {/* Ticket body */}
        <div className="px-6 py-5 space-y-4">
          {/* Service + title */}
          <div className="flex items-center gap-3">
            <span className="text-[36px]">{layanan?.emoji}</span>
            <div>
              <p className="text-[11px] font-bold text-[#7890AA] uppercase tracking-wider">{layanan?.label}</p>
              <p className="font-bold text-[16px] text-[#172E4D] leading-snug line-clamp-2">{data.deskripsi || "Tidak ada deskripsi"}</p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F7F9FC] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={13} className="text-[#1D4196]" />
                <p className="text-[11px] font-bold text-[#7890AA] uppercase tracking-wider">Lokasi</p>
              </div>
              <p className="text-[13px] font-semibold text-[#172E4D]">
                {data.lokasiType === "remote" ? "Jarak jauh" : data.area || "Jakarta"}
              </p>
            </div>
            <div className="bg-[#F7F9FC] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-[#1D4196]" />
                <p className="text-[11px] font-bold text-[#7890AA] uppercase tracking-wider">Waktu</p>
              </div>
              <p className="text-[13px] font-semibold text-[#172E4D]">
                {data.waktuType === "asap" ? "Segera" : data.waktuType === "sebelum" ? `Sebelum ${data.tanggal}` : "Fleksibel"}
              </p>
            </div>
          </div>

          <JobPhotoGallery photos={photos} className="pt-1" thumbClassName="w-16 h-16" />

          {/* Posted at */}
          <div className="flex items-center justify-between text-[12px] text-[#7890AA]">
            <span>Diposting: {postedAt}</span>
            <span className="font-semibold">0 penawaran</span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-[#1D4196]">Menunggu penawaran</span>
              <span className="text-[#7890AA]">0 / ~5 penawaran</span>
            </div>
            <div className="h-2 rounded-full bg-[#EEF3FB] overflow-hidden">
              <div className="h-full w-0 bg-[#1D4196] rounded-full animate-pulse" style={{ width: "5%" }} />
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#F7F9FC] -ml-2 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-[#D8E2F0]" />
          <div className="w-4 h-4 rounded-full bg-[#F7F9FC] -mr-2 shrink-0" />
        </div>

        {/* What happens next */}
        <div className="px-6 py-5">
          <p className="font-bold text-[13px] text-[#172E4D] mb-3">Setelah ini apa?</p>
          <div className="space-y-3">
            {[
              { icon: "🔔", text: "Kamu akan dapat notifikasi saat penawaran masuk" },
              { icon: "👀", text: "Tinjau profil, rating, dan harga dari setiap tukang" },
              { icon: "✅", text: "Pilih tukang yang paling cocok dan setujui pekerjaan" },
              { icon: "🔒", text: "Bayar dengan aman — uang dicairkan setelah selesai" },
            ].map((item) => (
              <div key={item.icon} className="flex items-center gap-3 text-[13px] text-[#294566]">
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
          onClick={() => navigate("/tasks")}
          className="w-full bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] py-4 rounded-2xl transition-colors"
        >
          Lihat pekerjaan lainnya
        </button>
        <div className="flex gap-3">
          <button
            onClick={copyId}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all"
          >
            <Copy size={16} /> Salin ID Pekerjaan
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all">
            <Share2 size={16} /> Bagikan
          </button>
        </div>
        <Link
          to="/"
          className="text-center text-[13px] text-[#7890AA] hover:text-[#1D4196] transition-colors py-1"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const STEPS = ["Deskripsi", "Lokasi", "Waktu", "Anggaran", "Tinjau"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-all ${
              i < step
                ? "bg-[#1D4196] text-white"
                : i === step
                ? "bg-[#1D4196] text-white ring-4 ring-[#FD6665]/40"
                : "bg-[#EEF3FB] text-[#7890AA]"
            }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <p className={`text-[10px] font-bold mt-1 hidden sm:block ${i === step ? "text-[#1D4196]" : i < step ? "text-[#1D4196]/60" : "text-[#7890AA]"}`}>
              {label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 transition-all ${i < step ? "bg-[#1D4196]" : "bg-[#D8E2F0]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const INITIAL_DATA: FormData = {
  layanan: "handyman",
  deskripsi: "",
  photos: [],
  photoUrls: [],
  photosUploading: false,
  lokasiType: "lokasi",
  area: "",
  alamat: "",
  waktuType: "",
  tanggal: "",
  budgetType: "tetap",
  budget: "",
};

function generateJobId() {
  const yr = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `#KJ-${yr}-${rand}`;
}

const REVIEW_STEP = STEPS.length - 1;

function canProceed(step: number, data: FormData): boolean {
  if (data.photosUploading) return false;
  if (step === 0) return data.deskripsi.length >= 30;
  if (step === 1) return !!data.area;
  if (step === 2) return !!data.waktuType;
  if (step === 3) return data.budgetType === "minta" || !!data.budget;
  return true;
}

export default function PostJob() {
  const [step, setStep] = useState(0);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [submittedPhotos, setSubmittedPhotos] = useState<string[]>([]);
  const [jobId, setJobId] = useState(generateJobId());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useScrollToTop(step, submitted);

  const update = (patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch }));

  const returnToReview = () => {
    setEditingFromReview(false);
    setStep(REVIEW_STEP);
  };

  const handleEditFromReview = (targetStep: number) => {
    setEditingFromReview(true);
    setStep(targetStep);
  };

  const handleNext = async () => {
    if (editingFromReview && step < REVIEW_STEP) {
      returnToReview();
      return;
    }
    if (step < REVIEW_STEP) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const { job } = await api.createJob(data);
      setJobId(job.jobNumber);
      setSubmittedPhotos(job.photos?.length ? job.photos : data.photoUrls ?? []);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal memposting pekerjaan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (editingFromReview) {
      returnToReview();
      return;
    }
    setStep((s) => s - 1);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] py-10 px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
        <JobTicket data={data} jobId={jobId} photos={submittedPhotos} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="max-w-[680px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="w-9 h-9 rounded-full border border-[#D8E2F0] flex items-center justify-center hover:border-[#1D4196] transition-colors">
            <ChevronLeft size={18} className="text-[#58708D]" />
          </Link>
          <div>
            <p className="text-[12px] text-[#7890AA] font-semibold">Langkah {step + 1} dari {STEPS.length}</p>
            <p className="font-black text-[15px] text-[#172E4D]">Post Kerjaan</p>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-[#D8E2F0] p-6 sm:p-8 mb-6 min-h-[400px]">
          {step === 0 && <StepDeskripsi data={data} onChange={update} />}
          {step === 1 && <StepLokasi data={data} onChange={update} />}
          {step === 2 && <StepWaktu data={data} onChange={update} />}
          {step === 3 && <StepAnggaran data={data} onChange={update} />}
          {step === 4 && <StepReview data={data} onEdit={handleEditFromReview} />}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          {(step > 0 || editingFromReview) && step < REVIEW_STEP && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] px-6 py-3.5 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all"
            >
              <ChevronLeft size={16} /> Kembali
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed(step, data) || submitting}
            className={`flex-1 flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-2xl transition-all ${
              canProceed(step, data) && !submitting
                ? "bg-[#1D4196] hover:bg-[#173577] text-white"
                : "bg-[#D8E2F0] text-[#7890AA] cursor-not-allowed"
            }`}
          >
            {submitting ? (
              "Memposting…"
            ) : step === REVIEW_STEP ? (
              <>Post Kerjaan <Star size={16} /></>
            ) : editingFromReview ? (
              <>Ke ringkasan <ChevronRight size={16} /></>
            ) : (
              <>Lanjut <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        {submitError && (
          <p className="text-center text-[13px] text-red-600 font-semibold mt-3">{submitError}</p>
        )}

        {/* Trust note */}
        <div className="flex items-center justify-center gap-4 mt-5 text-[12px] text-[#7890AA]">
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-[#20bf6f]" /> Gratis posting</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-[#20bf6f]" /> Pembayaran aman</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-[#20bf6f]" /> Tanpa komitmen</span>
        </div>
      </div>
    </div>
  );
}
