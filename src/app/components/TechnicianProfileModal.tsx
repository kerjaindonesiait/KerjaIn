import { useEffect, useState } from "react";
import { X, MapPin, CheckCircle, Star } from "lucide-react";
import { api } from "../../lib/api";
import type { TechnicianPublicProfile } from "../../types";

const AVATAR_COLORS = ["#2E5090", "#6c47d9", "#e85d26", "#20bf6f", "#f59e0b", "#ec4899"];

export function TechnicianProfileModal({
  technicianId,
  onClose,
}: {
  technicianId: string | null;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<TechnicianPublicProfile | null>(null);
  const [reviews, setReviews] = useState<{ rating: number; comment: string | null; reviewerName: string | null; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!technicianId) {
      setProfile(null);
      setReviews([]);
      return;
    }
    setLoading(true);
    setError("");
    api
      .getTechnicianPublic(technicianId)
      .then(({ technician }) => setProfile(technician))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat profil"))
      .finally(() => setLoading(false));

    api
      .getTechnicianReviews(technicianId, 5)
      .then(({ reviews: data }) => setReviews(data))
      .catch(() => setReviews([]));
  }, [technicianId]);

  if (!technicianId) return null;

  const colorIdx = technicianId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f7f4]">
          <h3 className="font-black text-[16px] text-[#1a2d4a]">Profil Tukang</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#f0f7f4] flex items-center justify-center">
            <X size={18} className="text-[#3d6b5e]" />
          </button>
        </div>

        {loading && <p className="text-center py-12 text-[#7a9a8f]">Memuat profil…</p>}
        {error && <p className="text-center py-12 text-red-600 text-[14px] px-5">{error}</p>}

        {profile && !loading && (
          <div className="px-5 py-5">
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-[16px] shrink-0"
                style={{ background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length] }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-[18px] text-[#0f2035]">{profile.name}</p>
                  {profile.verified && (
                    <span className="text-[10px] font-bold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} /> Terverifikasi
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i <= Math.round(profile.rating) ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#e5e7eb]"}
                    />
                  ))}
                  <span className="text-[12px] text-[#3d6b5e] ml-1">
                    {profile.rating} ({profile.reviewCount} ulasan)
                  </span>
                </div>
                {profile.area && (
                  <p className="flex items-center gap-1 text-[12px] text-[#7a9a8f] mt-1">
                    <MapPin size={12} /> {profile.area}
                  </p>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-[14px] text-[#3d6b5e] leading-relaxed mb-4">{profile.bio}</p>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#F5F1E8] rounded-xl p-3 text-center">
                <p className="font-black text-[15px] text-[#0f2035]">{profile.completedJobs}</p>
                <p className="text-[10px] text-[#7a9a8f]">Selesai</p>
              </div>
              <div className="bg-[#F5F1E8] rounded-xl p-3 text-center">
                <p className="font-black text-[15px] text-[#0f2035]">
                  {profile.completionRate != null ? `${profile.completionRate}%` : "—"}
                </p>
                <p className="text-[10px] text-[#7a9a8f]">Penyelesaian</p>
              </div>
              <div className="bg-[#F5F1E8] rounded-xl p-3 text-center">
                <p className="font-black text-[15px] text-[#0f2035]">{profile.memberSince}</p>
                <p className="text-[10px] text-[#7a9a8f]">Sejak</p>
              </div>
            </div>

            {profile.keahlian.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider mb-2">Keahlian</p>
                <div className="flex flex-wrap gap-2">
                  {profile.keahlian.map((k) => (
                    <span key={k} className="text-[12px] font-semibold bg-[#f0f7f4] text-[#2E5090] px-2.5 py-1 rounded-full">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(profile.pengalaman || profile.tarif) && (
              <div className="bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4 space-y-2 text-[13px]">
                {profile.pengalaman && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[#7a9a8f]">Pengalaman</span>
                    <span className="font-semibold text-[#0f2035] text-right">{profile.pengalaman}</span>
                  </div>
                )}
                {profile.tarif && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[#7a9a8f]">Tarif umum</span>
                    <span className="font-semibold text-[#0f2035]">{profile.tarif}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 text-[11px] text-[#20bf6f]">
              <CheckCircle size={12} /> Identitas tukang terdaftar di KerjaIn
            </div>

            {reviews.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[#f0f7f4]">
                <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider mb-3">Ulasan terbaru</p>
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.createdAt + (r.reviewerName ?? "")} className="bg-[#F5F1E8] rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={11}
                            className={i <= r.rating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#e5e7eb]"}
                          />
                        ))}
                        <span className="text-[11px] text-[#7a9a8f] ml-1">{r.reviewerName ?? "Pelanggan"}</span>
                      </div>
                      {r.comment && <p className="text-[12px] text-[#3d6b5e] leading-snug line-clamp-3">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
