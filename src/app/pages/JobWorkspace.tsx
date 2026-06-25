import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChevronLeft, MapPin, Calendar, Clock, MessageCircle, Camera,
  CheckCircle, Shield, ExternalLink, Send, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { googleMapsSearchUrl } from "../../lib/jobFilters";
import { ReviewDisplay, ReviewForm } from "../components/ReviewForm";
import type { JobWorkspace, Review } from "../../types";

function formatSchedule(iso: string | null | undefined, tanggal: string | null | undefined) {
  if (iso) {
    return new Date(iso).toLocaleString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return tanggal ?? "Belum dijadwalkan";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STATUS_STEPS = [
  { key: "assigned", label: "Tukang dipilih" },
  { key: "in_progress", label: "Sedang dikerjakan" },
  { key: "completed", label: "Selesai" },
];

export default function JobWorkspace() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ws, setWs] = useState<JobWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scheduleInput, setScheduleInput] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (silent = false) => {
    if (!jobId) return;
    if (!silent) setLoading(true);
    try {
      const { workspace } = await api.getJobWorkspace(jobId);
      setWs(workspace);
      setScheduleInput(
        workspace.job.scheduledAt
          ? new Date(workspace.job.scheduledAt).toISOString().slice(0, 16)
          : "",
      );
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pekerjaan");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!jobId || !ws || ws.job.status === "completed") return;
    const interval = setInterval(() => load(true), 12_000);
    return () => clearInterval(interval);
  }, [jobId, ws?.job.status, load]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ws?.messages.length]);

  const sendMessage = async () => {
    if (!jobId || !message.trim()) return;
    setSending(true);
    try {
      const { message: msg } = await api.sendJobMessage(jobId, message.trim());
      setWs((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : prev));
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const saveSchedule = async () => {
    if (!jobId || !scheduleInput) return;
    setSavingSchedule(true);
    try {
      const scheduledAt = new Date(scheduleInput).toISOString();
      const { job } = await api.updateJobSchedule(jobId, { scheduledAt });
      setWs((prev) => (prev ? { ...prev, job } : prev));
      toast.success("Jadwal diperbarui");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan jadwal");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleComplete = async () => {
    if (!jobId || !ws) return;
    const isTech = ws.viewerRole === "technician";
    const msg = isTech
      ? "Tandai pekerjaan selesai? Pelanggan akan diminta untuk konfirmasi."
      : "Konfirmasi pekerjaan selesai dan lepaskan pembayaran ke tukang?";
    if (!window.confirm(msg)) return;

    setCompleting(true);
    try {
      const { job } = await api.completeJob(jobId);
      setWs((prev) => (prev ? { ...prev, job } : prev));
      toast.success(isTech ? "Ditandai selesai — menunggu konfirmasi pelanggan" : "Pekerjaan selesai!");
      if (!isTech) await load(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal");
    } finally {
      setCompleting(false);
    }
  };

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!jobId || !file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto maksimal 5 MB");
      return;
    }
    setUploading(true);
    try {
      const b64 = await fileToBase64(file);
      const { url } = await api.uploadProgressPhoto(jobId, b64, file.type);
      const { photo } = await api.addJobProgressPhoto(jobId, url);
      setWs((prev) => (prev ? { ...prev, progressPhotos: [...prev.progressPhotos, photo] } : prev));
      toast.success("Foto progres diunggah");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  const backPath = user?.role === "technician" ? "/dasbor-tukang" : "/pekerjaan-saya";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2E5090]" size={32} />
      </div>
    );
  }

  if (error || !ws) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] p-6">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-red-200 p-6 flex gap-3">
          <AlertCircle className="text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-[#1a2d4a]">Tidak dapat membuka pekerjaan</p>
            <p className="text-[13px] text-red-600 mt-1">{error || "Tidak ditemukan"}</p>
            <Link to={backPath} className="inline-block mt-4 text-[13px] font-bold text-[#2E5090]">
              ← Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { job, viewerRole, counterpart, payment, messages, progressPhotos } = ws;
  const isActive = job.status === "assigned" || job.status === "in_progress";
  const stepIndex = job.status === "completed" ? 2 : job.status === "in_progress" ? 1 : 0;
  const mapsUrl = job.alamat
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([job.alamat, job.area, "Jakarta, Indonesia"].filter(Boolean).join(", "))}`
    : googleMapsSearchUrl(job);

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-[#1a2d4a] text-white px-6 py-4">
        <div className="max-w-[900px] mx-auto">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white/70 hover:text-white mb-3"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide">{job.jobNumber}</p>
          <h1 className="font-black text-[20px] leading-snug mt-1">{job.title}</h1>
          <div className="flex flex-wrap gap-3 mt-3 text-[12px] text-white/80">
            <span className="flex items-center gap-1"><MapPin size={12} />{job.area}</span>
            {job.alamat && viewerRole === "technician" && (
              <span className="text-white/60">· {job.alamat}</span>
            )}
            <span className="font-bold text-[#F59E42]">{ws.acceptedOffer?.priceFormatted ?? job.price}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-6 space-y-5">
        {/* Progress steps */}
        <div className="bg-white rounded-2xl border border-[#c8dfd8] p-5">
          <div className="flex justify-between mb-4">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="flex-1 text-center">
                <div
                  className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-[12px] font-bold mb-1.5 ${
                    i <= stepIndex ? "bg-[#2E5090] text-white" : "bg-[#f0f7f4] text-[#7a9a8f]"
                  }`}
                >
                  {i < stepIndex ? <CheckCircle size={14} /> : i + 1}
                </div>
                <p className={`text-[11px] font-bold ${i <= stepIndex ? "text-[#2E5090]" : "text-[#7a9a8f]"}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          {job.status === "assigned" && viewerRole === "owner" && !payment && (
            <Link
              to={`/bayar?jobId=${job.id}&offerId=${ws.acceptedOffer?.id ?? ""}`}
              className="block w-full text-center bg-[#2E5090] text-white font-bold text-[14px] py-3 rounded-xl hover:bg-[#1e3d7a]"
            >
              Lanjut ke Pembayaran →
            </Link>
          )}

          {job.technicianMarkedCompleteAt && job.status === "in_progress" && viewerRole === "owner" && (
            <div className="bg-[#fff8e1] border border-[#ffe082] rounded-xl p-4 mb-4">
              <p className="text-[13px] font-bold text-[#e65100]">Tukang menandai pekerjaan selesai</p>
              <p className="text-[12px] text-[#7a9a8f] mt-1">Periksa hasil kerja lalu konfirmasi untuk melepaskan pembayaran.</p>
            </div>
          )}

          {job.status === "completed" && (
            <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 text-[#16a34a] font-bold text-[14px] mb-4">
              <CheckCircle size={18} /> Pekerjaan selesai
              {job.completedAt && (
                <span className="font-normal text-[#3d6b5e] text-[12px] ml-1">
                  · {new Date(job.completedAt).toLocaleDateString("id-ID")}
                </span>
              )}
            </div>
          )}

          {job.status === "completed" && viewerRole === "owner" && (
            <div className="mb-4">
              {ws.review ? (
                <ReviewDisplay review={ws.review} />
              ) : ws.canReview ? (
                <ReviewForm
                  jobId={job.id}
                  onSubmitted={(review: Review) => {
                    setWs((prev) => (prev ? { ...prev, review, canReview: false } : prev));
                    toast.success("Terima kasih atas ulasannya!");
                  }}
                />
              ) : null}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-[#c8dfd8] p-5">
            <h2 className="font-bold text-[14px] text-[#1a2d4a] flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-[#2E5090]" /> Jadwal Kunjungan
            </h2>
            <p className="text-[13px] text-[#3d6b5e] mb-3 flex items-center gap-1.5">
              <Clock size={13} />
              {formatSchedule(job.scheduledAt, job.tanggal ?? null)}
            </p>
            {isActive && (
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={scheduleInput}
                  onChange={(e) => setScheduleInput(e.target.value)}
                  className="flex-1 text-[13px] border border-[#c8dfd8] rounded-lg px-3 py-2 outline-none focus:border-[#2E5090]"
                />
                <button
                  type="button"
                  onClick={saveSchedule}
                  disabled={savingSchedule || !scheduleInput}
                  className="shrink-0 bg-[#f0f7f4] text-[#2E5090] font-bold text-[12px] px-3 rounded-lg hover:bg-[#e8f4ef] disabled:opacity-50"
                >
                  {savingSchedule ? "…" : "Simpan"}
                </button>
              </div>
            )}
            {viewerRole === "technician" && job.alamat && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-[#2E5090] hover:underline"
              >
                <ExternalLink size={13} /> Buka alamat di Google Maps
              </a>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-[#c8dfd8] p-5">
            <h2 className="font-bold text-[14px] text-[#1a2d4a] flex items-center gap-2 mb-4">
              <MessageCircle size={16} className="text-[#2E5090]" />
              {viewerRole === "owner" ? "Tukang Anda" : "Pelanggan"}
            </h2>
            {counterpart ? (
              <div>
                <p className="font-bold text-[15px] text-[#0f2035]">{counterpart.name}</p>
                {counterpart.phone && (
                  <a
                    href={`https://wa.me/${counterpart.phone.replace(/\D/g, "").replace(/^0/, "62")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold text-[#20bf6f] bg-[#f0fdf4] px-3 py-2 rounded-lg hover:bg-[#dcfce7]"
                  >
                    Hubungi via WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-[#7a9a8f]">Informasi kontak belum tersedia</p>
            )}
            {payment && (
              <div className="mt-4 pt-4 border-t border-[#f0f7f4] flex items-start gap-2">
                <Shield size={14} className="text-[#2E5090] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#7a9a8f]">
                  <p className="font-bold text-[#3d6b5e]">Escrow: {payment.status}</p>
                  {payment.escrowReleaseAt && payment.status !== "released" && (
                    <p className="mt-0.5">Auto-lepas {new Date(payment.escrowReleaseAt).toLocaleDateString("id-ID")}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl border border-[#c8dfd8] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0f7f4] font-bold text-[14px] text-[#1a2d4a]">
            Pesan
          </div>
          <div className="h-[280px] overflow-y-auto px-5 py-4 space-y-3 bg-[#fafaf8]">
            {messages.length === 0 && (
              <p className="text-center text-[13px] text-[#7a9a8f] py-8">Belum ada pesan. Mulai percakapan di bawah.</p>
            )}
            {messages.map((m) => {
              const mine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] ${
                      mine ? "bg-[#2E5090] text-white rounded-br-md" : "bg-white border border-[#c8dfd8] text-[#1a3d5c] rounded-bl-md"
                    }`}
                  >
                    {!mine && <p className="text-[10px] font-bold opacity-70 mb-0.5">{m.senderName}</p>}
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`text-[9px] mt-1 ${mine ? "text-white/60" : "text-[#7a9a8f]"}`}>
                      {new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          {isActive && (
            <div className="p-4 border-t border-[#f0f7f4] flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Tulis pesan…"
                className="flex-1 text-[14px] border border-[#c8dfd8] rounded-xl px-4 py-2.5 outline-none focus:border-[#2E5090]"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className="w-11 h-11 bg-[#2E5090] text-white rounded-xl flex items-center justify-center hover:bg-[#1e3d7a] disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Progress photos */}
        <div className="bg-white rounded-2xl border border-[#c8dfd8] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[14px] text-[#1a2d4a] flex items-center gap-2">
              <Camera size={16} className="text-[#2E5090]" /> Foto Progres
            </h2>
            {viewerRole === "technician" && job.status === "in_progress" && (
              <>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-[12px] font-bold text-[#2E5090] bg-[#f0f7f4] px-3 py-1.5 rounded-lg hover:bg-[#e8f4ef] disabled:opacity-50"
                >
                  {uploading ? "Mengunggah…" : "+ Unggah Foto"}
                </button>
              </>
            )}
          </div>
          {progressPhotos.length === 0 ? (
            <p className="text-[13px] text-[#7a9a8f]">Belum ada foto progres dari tukang.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {progressPhotos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="block group">
                  <img
                    src={p.url}
                    alt={p.caption ?? "Foto progres"}
                    className="w-full aspect-square object-cover rounded-xl border border-[#c8dfd8] group-hover:opacity-90"
                  />
                  {p.caption && <p className="text-[11px] text-[#7a9a8f] mt-1 truncate">{p.caption}</p>}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      {isActive && job.status === "in_progress" && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#c8dfd8] px-6 py-4 shadow-lg">
          <div className="max-w-[900px] mx-auto">
            {viewerRole === "technician" ? (
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing || !!job.technicianMarkedCompleteAt}
                className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[15px] py-3.5 rounded-xl disabled:opacity-50"
              >
                {job.technicianMarkedCompleteAt ? "Menunggu konfirmasi pelanggan" : completing ? "…" : "Tandai Selesai ✓"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing}
                className="w-full bg-[#20bf6f] hover:bg-[#1a9f5c] text-white font-bold text-[15px] py-3.5 rounded-xl disabled:opacity-50"
              >
                {completing ? "…" : "Konfirmasi Pekerjaan Selesai"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
