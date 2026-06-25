import { useState } from "react";
import { Star } from "lucide-react";
import { api } from "../../lib/api";
import type { Review } from "../../types";

export function ReviewForm({
  jobId,
  onSubmitted,
}: {
  jobId: string;
  onSubmitted: (review: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { review } = await api.submitReview(jobId, { rating, comment: comment.trim() || undefined });
      onSubmitted(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim ulasan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#c8dfd8] p-5">
      <h2 className="font-bold text-[15px] text-[#1a2d4a] mb-1">Beri ulasan untuk tukang</h2>
      <p className="text-[13px] text-[#7a9a8f] mb-4">Bagaimana pengalaman Anda dengan pekerjaan ini?</p>

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="p-1"
            aria-label={`${n} bintang`}
          >
            <Star
              size={28}
              className={
                n <= (hover || rating)
                  ? "text-[#f59e0b] fill-[#f59e0b]"
                  : "text-[#e5e7eb]"
              }
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Ceritakan pengalaman Anda (opsional)…"
        rows={4}
        className="w-full text-[14px] border border-[#c8dfd8] rounded-xl px-4 py-3 outline-none focus:border-[#2E5090] resize-none mb-3"
      />

      {error && <p className="text-[13px] text-red-600 mb-3">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[14px] py-3 rounded-xl disabled:opacity-50"
      >
        {submitting ? "Mengirim…" : "Kirim Ulasan"}
      </button>
    </div>
  );
}

export function ReviewDisplay({ review }: { review: Review }) {
  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5">
      <p className="font-bold text-[14px] text-[#16a34a] mb-2">Ulasan Anda</p>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={16}
            className={n <= review.rating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#e5e7eb]"}
          />
        ))}
      </div>
      {review.comment && (
        <p className="text-[14px] text-[#1a3d5c] leading-relaxed whitespace-pre-wrap">{review.comment}</p>
      )}
      <p className="text-[11px] text-[#7a9a8f] mt-2">
        {new Date(review.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
