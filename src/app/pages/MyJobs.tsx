import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MapPin, Clock, ChevronRight, Loader2, XCircle, CheckCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { Job, Offer } from "../../types";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  open: { label: "Terbuka", className: "bg-[#EEF3FB] text-[#1D4196] border-[#D8E2F0]" },
  assigned: { label: "Menunggu bayar", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  in_progress: { label: "Sedang berjalan", className: "bg-[#f0fdf4] text-[#20bf6f] border-[#bbf7d0]" },
  completed: { label: "Selesai", className: "bg-[#EEF3FB] text-[#58708D] border-[#D8E2F0]" },
  cancelled: { label: "Dibatalkan", className: "bg-red-50 text-red-600 border-red-200" },
};

function formatOfferPrice(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptedOffers, setAcceptedOffers] = useState<Record<string, Offer>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getMyJobs()
      .then(async ({ jobs: data }) => {
        setJobs(data);
        const assigned = data.filter((j) => j.status === "assigned");
        const offerMap: Record<string, Offer> = {};
        await Promise.all(
          assigned.map(async (job) => {
            try {
              const { offers } = await api.getOffers(job.id);
              const accepted = offers.find((o) => o.status === "accepted");
              if (accepted) offerMap[job.id] = accepted;
            } catch {
              /* ignore per-job offer fetch errors */
            }
          }),
        );
        setAcceptedOffers(offerMap);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (jobId: string) => {
    if (!confirm("Batalkan pekerjaan ini?")) return;
    setActionId(jobId);
    try {
      await api.cancelJob(jobId);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal membatalkan");
    } finally {
      setActionId(null);
    }
  };

  const handleComplete = async (jobId: string) => {
    if (!confirm("Tandai pekerjaan ini selesai dan lepas dana escrow?")) return;
    setActionId(jobId);
    try {
      await api.completeJob(jobId);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyelesaikan pekerjaan");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-white border-b border-[#D8E2F0]">
        <div className="max-w-[860px] mx-auto px-6 py-6">
          <h1 className="font-black text-[26px] text-[#172E4D]">Pekerjaan Saya</h1>
          <p className="text-[14px] text-[#58708D] mt-1">Kelola pekerjaan yang kamu posting</p>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-[#58708D] py-16">
            <Loader2 size={20} className="animate-spin" /> Memuat pekerjaan...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-[14px]">{error}</div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-[16px] text-[#294566] mb-2">Belum ada pekerjaan</p>
            <p className="text-[13px] text-[#7890AA] mb-6">Post pekerjaan pertama kamu untuk mulai menerima penawaran tukang.</p>
            <Link
              to="/post-job"
              className="inline-flex items-center gap-2 bg-[#1D4196] text-white font-bold text-[14px] px-6 py-3 rounded-xl hover:bg-[#173577] transition-colors"
            >
              Post Kerjaan <ChevronRight size={16} />
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {jobs.map((job) => {
            const st = STATUS_LABEL[job.status] ?? { label: job.status, className: "bg-[#EEF3FB] text-[#58708D]" };
            const offer = acceptedOffers[job.id];
            const busy = actionId === job.id;

            return (
              <div key={job.id} className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#7890AA] mb-1">{job.jobNumber}</p>
                    <h2 className="font-bold text-[16px] text-[#172E4D] leading-snug">{job.title}</h2>
                  </div>
                  <span className={`text-[11px] font-bold border px-2.5 py-0.5 rounded-full shrink-0 ${st.className}`}>
                    {st.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-[12px] text-[#58708D] mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-[#1D4196]" /> {job.area}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {job.offers} penawaran
                  </span>
                  <span className="font-semibold text-[#172E4D]">{job.price}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.status === "open" && (
                    <>
                      <Link
                        to="/tasks"
                        className="text-[13px] font-bold text-[#1D4196] border border-[#D8E2F0] px-4 py-2 rounded-xl hover:bg-[#F7F9FC] transition-colors"
                      >
                        Lihat penawaran
                      </Link>
                      <button
                        disabled={busy}
                        onClick={() => handleCancel(job.id)}
                        className="flex items-center gap-1.5 text-[13px] font-bold text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Batalkan
                      </button>
                    </>
                  )}

                  {job.status === "assigned" && offer && (
                    <Link
                      to={`/bayar?jobId=${job.id}&offerId=${offer.id}`}
                      className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Bayar {formatOfferPrice(offer.price)} →
                    </Link>
                  )}

                  {job.status === "in_progress" && (
                    <button
                      disabled={busy}
                      onClick={() => handleComplete(job.id)}
                      className="flex items-center gap-1.5 bg-[#20bf6f] hover:bg-[#1a9d5c] text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Tandai selesai
                    </button>
                  )}

                  {job.status === "completed" && (
                    <span className="text-[13px] text-[#20bf6f] font-bold flex items-center gap-1">
                      <CheckCircle size={14} /> Pekerjaan selesai
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
