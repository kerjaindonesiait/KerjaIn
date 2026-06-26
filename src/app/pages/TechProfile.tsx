import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { MapPin, CheckCircle, Star, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import type { Review, TechnicianPublic } from "../../types";

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

export default function TechProfile() {
  const { id } = useParams<{ id: string }>();
  const [tech, setTech] = useState<TechnicianPublic | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getTechnicianPublic(id), api.getTechnicianReviews(id, 20)])
      .then(([{ technician }, { reviews: list }]) => {
        setTech(technician);
        setReviews(list);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] text-[#58708D] gap-2">
        <Loader2 className="animate-spin" size={20} /> Memuat profil...
      </div>
    );
  }

  if (error || !tech) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] px-6">
        <p className="text-red-600 mb-4">{error ?? "Tukang tidak ditemukan"}</p>
        <Link to="/tasks" className="text-[#1D4196] font-bold">← Kembali</Link>
      </div>
    );
  }

  const initials = tech.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-white border-b border-[#D8E2F0]">
        <div className="max-w-[720px] mx-auto px-6 py-8">
          <Link to="/tasks" className="text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196]">← Kembali</Link>
          <div className="flex items-start gap-5 mt-6">
            {tech.avatarUrl ? (
              <img src={tech.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-[#D8E2F0]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1D4196] text-white font-black text-2xl flex items-center justify-center">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-[24px] text-[#172E4D]">{tech.name}</h1>
                {tech.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} /> Terverifikasi
                  </span>
                )}
              </div>
              {tech.area && (
                <p className="flex items-center gap-1 text-[14px] text-[#58708D] mt-1">
                  <MapPin size={14} className="text-[#1D4196]" /> {tech.area}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <StarDisplay rating={tech.rating} />
                <span className="text-[13px] text-[#58708D]">
                  {tech.rating.toFixed(1)} · {tech.reviewCount} ulasan · {tech.completedJobs} selesai
                  {tech.completionRate != null && ` · ${tech.completionRate}% selesai tepat waktu`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
        {tech.bio && (
          <section className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
            <h2 className="font-bold text-[14px] text-[#172E4D] mb-2">Tentang</h2>
            <p className="text-[14px] text-[#58708D] leading-relaxed">{tech.bio}</p>
          </section>
        )}

        {(tech.keahlian.length > 0 || tech.pengalaman || tech.tarif) && (
          <section className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
            <h2 className="font-bold text-[14px] text-[#172E4D] mb-3">Keahlian</h2>
            {tech.keahlian.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tech.keahlian.map((k) => (
                  <span key={k} className="text-[12px] font-semibold bg-[#EEF3FB] text-[#1D4196] px-3 py-1 rounded-full">{k}</span>
                ))}
              </div>
            )}
            {tech.pengalaman && <p className="text-[13px] text-[#58708D]">Pengalaman: {tech.pengalaman}</p>}
            {tech.tarif && <p className="text-[13px] text-[#58708D] mt-1">Tarif: {tech.tarif}</p>}
          </section>
        )}

        <section className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
          <h2 className="font-bold text-[14px] text-[#172E4D] mb-4">Ulasan pelanggan</h2>
          {reviews.length === 0 ? (
            <p className="text-[13px] text-[#7890AA]">Belum ada ulasan.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-[#EEF3FB] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-[13px] text-[#172E4D]">{r.reviewerName ?? "Pelanggan"}</p>
                    <StarDisplay rating={r.rating} size={12} />
                  </div>
                  {r.comment && <p className="text-[13px] text-[#58708D] italic">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
