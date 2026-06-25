import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ChevronLeft, Plus, MapPin, Calendar, Clock, Briefcase,
  ChevronRight, AlertCircle, FileText,
} from "lucide-react";
import { api } from "../../lib/api";
import type { Job } from "../../types";

type TabId = "semua" | "aktif" | "selesai";

const TABS: { id: TabId; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "aktif", label: "Aktif" },
  { id: "selesai", label: "Selesai" },
];

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: "Menunggu Penawaran", bg: "bg-[#e8f4ef]", text: "text-[#2E5090]" },
  assigned: { label: "Tukang Dipilih", bg: "bg-[#fff3e0]", text: "text-[#e85d26]" },
  in_progress: { label: "Sedang Berjalan", bg: "bg-[#e3f2fd]", text: "text-[#1565c0]" },
  completed: { label: "Selesai", bg: "bg-[#e8f5e9]", text: "text-[#2e7d32]" },
  cancelled: { label: "Dibatalkan", bg: "bg-[#fce4ec]", text: "text-[#c62828]" },
};

function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status, bg: "bg-[#f0f7f4]", text: "text-[#3d6b5e]" };
}

function isActiveJob(status: string) {
  return status === "open" || status === "assigned" || status === "in_progress";
}

function JobCard({ job, onCancelled }: { job: Job; onCancelled: (id: string) => void }) {
  const [cancelling, setCancelling] = useState(false);
  const meta = statusMeta(job.status);
  const inWorkspace = job.status === "assigned" || job.status === "in_progress";
  const detailLink =
    job.status === "completed" || inWorkspace
      ? `/pekerjaan/${job.id}`
      : `/tasks?id=${job.id}`;
  const detailLabel =
    job.status === "open"
      ? "Lihat Penawaran"
      : job.status === "completed"
        ? "Lihat & Ulasan"
        : inWorkspace
          ? "Kelola Pekerjaan"
          : "Lihat Detail";

  const handleCancel = async () => {
    if (!window.confirm("Batalkan pekerjaan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setCancelling(true);
    try {
      const { job: updated } = await api.cancelJob(job.id);
      onCancelled(updated.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membatalkan pekerjaan");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#c8dfd8] p-5 hover:border-[#F59E42] hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wide mb-1">{job.jobNumber}</p>
          <h3 className="font-bold text-[15px] text-[#0f2035] leading-snug">{job.title}</h3>
        </div>
        <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
          {meta.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-[12px] text-[#3d6b5e]">
        <span className="flex items-center gap-1">
          <MapPin size={12} className="shrink-0 text-[#2E5090]" />
          {job.remote ? "Jarak Jauh" : job.area}
        </span>
        {job.date && (
          <span className="flex items-center gap-1">
            <Calendar size={12} className="shrink-0" />
            {job.date}
          </span>
        )}
        {job.time && (
          <span className="flex items-center gap-1">
            <Clock size={12} className="shrink-0" />
            {job.time}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f0f7f4]">
        <div>
          <p className="text-[13px] font-bold text-[#2E5090]">{job.price}</p>
          <p className="text-[11px] text-[#7a9a8f] mt-0.5">
            {job.offers} penawaran
            {job.completedAt
              ? ` · selesai ${new Date(job.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
              : ` · diposting ${new Date(job.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {job.status === "open" && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 px-2 py-1 disabled:opacity-50"
            >
              {cancelling ? "…" : "Batalkan"}
            </button>
          )}
          <Link
            to={detailLink}
            className="flex items-center gap-1 text-[12px] font-bold text-[#2E5090] hover:text-[#1e3d7a] whitespace-nowrap"
          >
            {detailLabel}
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabId>("semua");

  useEffect(() => {
    api.getMyJobs()
      .then(({ jobs: data }) => setJobs(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat pekerjaan"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (tab === "aktif") return jobs.filter((j) => isActiveJob(j.status));
    if (tab === "selesai") return jobs.filter((j) => j.status === "completed" || j.status === "cancelled");
    return jobs;
  }, [jobs, tab]);

  const counts = useMemo(
    () => ({
      semua: jobs.length,
      aktif: jobs.filter((j) => isActiveJob(j.status)).length,
      selesai: jobs.filter((j) => j.status === "completed" || j.status === "cancelled").length,
    }),
    [jobs],
  );

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="max-w-[720px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-full border border-[#b8d4c8] flex items-center justify-center hover:border-[#2E5090] transition-colors"
            >
              <ChevronLeft size={18} className="text-[#3d6b5e]" />
            </Link>
            <div>
              <h1 className="font-black text-[22px] text-[#1a2d4a]">Pekerjaan Saya</h1>
              <p className="text-[13px] text-[#7a9a8f]">Kelola pekerjaan yang Anda posting</p>
            </div>
          </div>
          <Link
            to="/post-job"
            className="hidden sm:flex items-center gap-2 bg-[#2E5090] text-white text-[13px] font-bold px-4 py-2.5 rounded-full hover:bg-[#1e3d7a] transition-colors"
          >
            <Plus size={15} /> Pasang Baru
          </Link>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-[#2E5090] text-white shadow-sm"
                  : "bg-white border border-[#c8dfd8] text-[#3d6b5e] hover:border-[#2E5090]"
              }`}
            >
              {t.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                tab === t.id ? "bg-white/20" : "bg-[#f0f7f4]"
              }`}>
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="text-[#7a9a8f] font-semibold">Memuat pekerjaan…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 p-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1a2d4a] text-[14px]">Gagal memuat</p>
              <p className="text-[13px] text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#c8dfd8] p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#f0f7f4] flex items-center justify-center mx-auto mb-4">
              {tab === "semua" ? <Briefcase size={26} className="text-[#2E5090]" /> : <FileText size={26} className="text-[#7a9a8f]" />}
            </div>
            <h2 className="font-black text-[18px] text-[#1a2d4a] mb-2">
              {tab === "semua" && "Belum ada pekerjaan"}
              {tab === "aktif" && "Tidak ada pekerjaan aktif"}
              {tab === "selesai" && "Belum ada pekerjaan selesai"}
            </h2>
            <p className="text-[14px] text-[#7a9a8f] mb-6 max-w-sm mx-auto">
              {tab === "semua"
                ? "Pasang pekerjaan pertama Anda dan tunggu penawaran dari tukang terpercaya."
                : "Pekerjaan di tab ini akan muncul setelah Anda memposting atau menyelesaikan pekerjaan."}
            </p>
            {tab !== "selesai" && (
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 bg-[#2E5090] text-white font-bold text-[14px] px-6 py-3 rounded-full hover:bg-[#1e3d7a] transition-colors"
              >
                <Plus size={16} /> Pasang Pekerjaan
              </Link>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onCancelled={(id) => setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "cancelled" } : j)))}
              />
            ))}
          </div>
        )}

        <Link
          to="/post-job"
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#2E5090] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1e3d7a] transition-colors"
          aria-label="Pasang pekerjaan baru"
        >
          <Plus size={22} />
        </Link>
      </div>
    </div>
  );
}
