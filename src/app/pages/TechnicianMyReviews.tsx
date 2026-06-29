import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, Loader2, Star } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import type { Review } from "../../types";

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TechnicianMyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .getTechnicianReviews(user.id, 50)
      .then(({ reviews: list }) => setReviews(list))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-white border-b border-[#D8E2F0]">
        <div className="max-w-[720px] mx-auto px-6 py-5">
          <Link
            to="/akun"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196]"
          >
            <ChevronLeft size={16} /> Kembali ke akun
          </Link>
          <h1 className="font-black text-[22px] text-[#172E4D] mt-3">Ulasan pelanggan</h1>
          <p className="text-[13px] text-[#58708D] mt-1">
            Ulasan yang diberikan pelanggan setelah pekerjaan selesai.
          </p>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#58708D]">
            <Loader2 className="animate-spin" size={20} /> Memuat ulasan...
          </div>
        ) : error ? (
          <p className="text-center py-16 text-red-600">{error}</p>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D8E2F0] p-8 text-center">
            <p className="font-bold text-[15px] text-[#172E4D] mb-2">Belum ada ulasan</p>
            <p className="text-[13px] text-[#58708D]">
              Ulasan akan muncul di sini setelah pelanggan menilai pekerjaan yang sudah selesai.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-2xl border border-[#D8E2F0] p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-bold text-[14px] text-[#172E4D]">
                      {r.reviewerName ?? "Pelanggan"}
                    </p>
                    {r.jobTitle && (
                      <p className="text-[13px] text-[#58708D] mt-0.5">{r.jobTitle}</p>
                    )}
                  </div>
                  <StarDisplay rating={r.rating} />
                </div>
                {r.comment && (
                  <p className="text-[13px] text-[#58708D] italic leading-relaxed mb-2">
                    "{r.comment}"
                  </p>
                )}
                <p className="text-[11px] text-[#7890AA]">{formatReviewDate(r.createdAt)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
