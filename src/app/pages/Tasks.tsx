import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import {
  Search,
  MapPin,
  ChevronDown,
  Clock,
  Calendar,
  Grid3x3,
  SlidersHorizontal,
  Shield,
  CheckCircle,
  Heart,
  Share2,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { JobsMap } from "../components/JobsMap";
import type { Job, Offer } from "../../types";

type Task = Job & { status: string };

const STATUS_LABEL: Record<string, string> = {
  open: "Terbuka",
  assigned: "Menunggu bayar",
  in_progress: "Sedang berjalan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

function statusLabel(status: string) {
  return STATUS_LABEL[status] ?? status;
}

const AVATAR_COLORS = [
  "#1D4196",
  "#6c47d9",
  "#e85d26",
  "#20bf6f",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
];

function Avatar({
  initials,
  id,
  size = "sm",
}: {
  initials: string | null | undefined;
  id: string;
  size?: "sm" | "lg";
}) {
  const colorIdx = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
  const cls =
    size === "lg"
      ? "w-14 h-14 text-[16px] rounded-full border-2 border-white shadow"
      : "w-9 h-9 text-[11px] rounded-full border-2 border-white shadow-sm";
  if (!initials) {
    return (
      <div
        className={`${cls} flex items-center justify-center`}
        style={{ background: "#EEF3FB" }}
      >
        <svg
          width={size === "lg" ? 22 : 17}
          height={size === "lg" ? 22 : 17}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="8" r="4" fill="#FD6665" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#FD6665" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className={`${cls} flex items-center justify-center text-white font-bold`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-[12px] text-[#58708D]">
        {rating} ({count} ulasan)
      </span>
    </div>
  );
}

function TaskCard({
  task,
  selected,
  onClick,
}: {
  task: Task;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all px-5 py-4 hover:shadow-sm ${
        selected
          ? "border-[#1D4196] shadow-md ring-1 ring-[#1D4196]/20"
          : "border-[#D8E2F0] hover:border-[#FD6665]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[14px] leading-snug text-[#172E4D] mb-2">
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2.5">
            {task.remote && (
              <span className="flex items-center gap-1 text-[12px] text-[#58708D]">
                <Grid3x3 size={12} className="shrink-0" /> Jarak Jauh
              </span>
            )}
            {task.flexible && (
              <span className="flex items-center gap-1 text-[12px] text-[#58708D]">
                <Calendar size={12} className="shrink-0" /> Fleksibel
              </span>
            )}
            {task.date && !task.flexible && (
              <span className="flex items-center gap-1 text-[12px] text-[#58708D]">
                <Calendar size={12} className="shrink-0" /> {task.date}
              </span>
            )}
            {task.time && !task.flexible && (
              <span className="flex items-center gap-1 text-[12px] text-[#58708D]">
                <Clock size={12} className="shrink-0" /> {task.time}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-bold text-[#1D4196]">
              {statusLabel(task.status)}
            </span>
            {task.isOwner && task.offers != null && task.offers > 0 && (
              <span className="text-[12px] text-[#58708D]">
                · {task.offers} penawaran
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-black text-[15px] text-[#172E4D]">
            {task.price}
          </span>
          <Avatar initials={task.initials} id={task.id} />
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"detail" | "penawaran" | "pemilik">("detail");

  const TABS = [
    { id: "detail" as const, label: "Detail", count: null },
    { id: "penawaran" as const, label: "Penawaran", count: task.offers ?? 0 },
    { id: "pemilik" as const, label: "Pemilik", count: null },
  ];

  const canAcceptOffers = !!task.isOwner && task.status === "open";
  const visibleTabs = TABS.filter((t) => t.id !== "penawaran" || task.isOwner);

  useEffect(() => {
    if (tab === "penawaran" && !task.isOwner) {
      setTab("detail");
    }
  }, [tab, task.isOwner]);

  useEffect(() => {
    if (tab === "penawaran" && task.isOwner) {
      setLoadingOffers(true);
      setAcceptError(null);
      api
        .getOffers(task.id)
        .then(({ offers: data }) => setOffers(data))
        .catch(() => setOffers([]))
        .finally(() => setLoadingOffers(false));
    }
  }, [tab, task.id, task.isOwner]);

  const handleAcceptOffer = async (offerId: string) => {
    if (!user) {
      navigate("/masuk", { state: { from: "/tasks" } });
      return;
    }
    if (!canAcceptOffers) {
      setAcceptError("Hanya pemilik pekerjaan yang dapat menerima penawaran.");
      return;
    }
    setAcceptError(null);
    setAcceptingId(offerId);
    try {
      await api.acceptOffer(offerId);
      setAcceptedOfferId(offerId);
    } catch (e) {
      setAcceptError(
        e instanceof Error ? e.message : "Gagal menerima penawaran",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 border-b border-[#f5eded]">
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved((s) => !s)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                saved
                  ? "border-[#1D4196] bg-[#EEF3FB]"
                  : "border-[#D8E2F0] hover:border-[#1D4196]"
              }`}
            >
              <Heart
                size={16}
                className={
                  saved ? "text-[#1D4196] fill-[#1D4196]" : "text-[#58708D]"
                }
              />
            </button>
            <button className="w-9 h-9 rounded-full border border-[#D8E2F0] flex items-center justify-center hover:border-[#1D4196] transition-all">
              <Share2 size={16} className="text-[#58708D]" />
            </button>
          </div>
        </div>

        {/* Title + price */}
        <div className="flex items-start justify-between gap-3 px-6 pb-3">
          <h2 className="font-black text-[18px] text-[#172E4D] leading-snug">
            {task.title}
          </h2>
          <div className="text-right shrink-0">
            <p className="font-black text-[20px] text-[#172E4D] leading-none">
              {task.price}
            </p>
            <p className="text-[10px] text-[#7890AA] mt-0.5">Anggaran</p>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 px-6 pb-3">
          <span className="bg-[#EEF3FB] text-[#1D4196] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {statusLabel(task.status)}
          </span>
          {task.isOwner && task.offers != null && (
            <span className="text-[12px] text-[#58708D]">
              {task.offers} penawaran
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-[#f5eded]">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-[13px] font-bold transition-all relative ${
                tab === t.id
                  ? "text-[#1D4196]"
                  : "text-[#7890AA] hover:text-[#58708D]"
              }`}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span
                  className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-[#1D4196] text-white" : "bg-[#D8E2F0] text-[#58708D]"}`}
                >
                  {t.count}
                </span>
              )}
              {tab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D4196] rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── TAB: Detail ── */}
        {tab === "detail" && (
          <div className="px-6 py-5">
            <div className="flex flex-wrap gap-2 mb-5">
              {task.flexible && (
                <div className="flex items-center gap-1.5 bg-[#F7F9FC] rounded-lg px-3 py-2 text-[13px] text-[#294566] font-medium">
                  <Calendar size={13} className="text-[#1D4196]" /> Waktu
                  fleksibel
                </div>
              )}
              {task.date && !task.flexible && (
                <div className="flex items-center gap-1.5 bg-[#F7F9FC] rounded-lg px-3 py-2 text-[13px] text-[#294566] font-medium">
                  <Calendar size={13} className="text-[#1D4196]" /> {task.date}
                </div>
              )}
              {task.time && !task.flexible && (
                <div className="flex items-center gap-1.5 bg-[#F7F9FC] rounded-lg px-3 py-2 text-[13px] text-[#294566] font-medium">
                  <Clock size={13} className="text-[#1D4196]" /> {task.time}
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-[#F7F9FC] rounded-lg px-3 py-2 text-[13px] text-[#294566] font-medium">
                <MapPin size={13} className="text-[#1D4196]" /> Di lokasi ·
                Jakarta
              </div>
            </div>

            <h3 className="font-bold text-[12px] text-[#7890AA] uppercase tracking-wider mb-3">
              Deskripsi pekerjaan
            </h3>
            <div className="text-[14px] text-[#294566] leading-relaxed whitespace-pre-line mb-6">
              {task.description}
            </div>

            <div className="flex items-start gap-3 bg-[#F7F9FC] rounded-xl p-4">
              <Shield size={16} className="text-[#1D4196] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-[#172E4D]">
                  Pembayaran terlindungi
                </p>
                <p className="text-[12px] text-[#58708D] mt-0.5">
                  Dana baru dicairkan setelah pekerjaan selesai dikonfirmasi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Penawaran ── */}
        {tab === "penawaran" && (
          <div className="px-6 py-5">
            {loadingOffers ? (
              <p className="text-center py-12 text-[#7890AA] text-[14px]">
                Memuat penawaran…
              </p>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 text-[#7890AA]">
                <p className="text-[32px] mb-3">📭</p>
                <p className="font-bold text-[14px]">Belum ada penawaran</p>
                <p className="text-[12px] mt-1">
                  Tukang akan segera mengajukan penawaran
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-bold text-[#7890AA] uppercase tracking-wider mb-1">
                  {offers.length} penawaran masuk
                </p>
                {!canAcceptOffers && !user && (
                  <p className="text-[13px] text-[#58708D] bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl px-4 py-3">
                    <Link
                      to="/masuk"
                      state={{ from: "/tasks" }}
                      className="font-bold text-[#1D4196] hover:underline"
                    >
                      Masuk
                    </Link>{" "}
                    sebagai pemilik pekerjaan untuk menerima penawaran.
                  </p>
                )}
                {!canAcceptOffers && user && !task.isOwner && (
                  <p className="text-[13px] text-[#58708D] bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl px-4 py-3">
                    Hanya pemilik pekerjaan yang dapat menerima penawaran. Lihat
                    pekerjaan Anda di{" "}
                    <Link
                      to="/pekerjaan-saya"
                      className="font-bold text-[#1D4196] hover:underline"
                    >
                      Pekerjaan Saya
                    </Link>
                    .
                  </p>
                )}
                {acceptError && (
                  <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {acceptError}
                  </p>
                )}
                {offers.map((offer) => {
                  const initials = offer.technicianName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const colorIdx = offer.id
                    .split("")
                    .reduce((a, c) => a + c.charCodeAt(0), 0);
                  return (
                    <div
                      key={offer.id}
                      className="bg-[#F7F9FC] border border-[#D8E2F0] rounded-2xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[13px] shrink-0"
                          style={{
                            background:
                              AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
                          }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] text-[#172E4D]">
                            <Link
                              to={`/tukang/${offer.technicianId}`}
                              className="hover:underline text-[#1D4196]"
                            >
                              {offer.technicianName}
                            </Link>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-[16px] text-[#172E4D]">
                            {offer.priceFormatted}
                          </p>
                        </div>
                      </div>
                      {offer.message && (
                        <p className="text-[12px] text-[#58708D] leading-relaxed mb-3 italic">
                          "{offer.message}"
                        </p>
                      )}
                      {task.isOwner && offer.status === "accepted" && (task.status === "in_progress" || task.status === "completed") && (
                        <Link
                          to={`/pesan/${task.id}?technicianId=${encodeURIComponent(offer.technicianId)}`}
                          className="w-full flex items-center justify-center gap-2 border-2 border-[#D8E2F0] text-[#294566] font-bold text-[13px] py-2.5 rounded-xl hover:border-[#1D4196] hover:text-[#1D4196] transition-colors"
                        >
                          <MessageCircle size={15} /> Kirim pesan
                        </Link>
                      )}
                      {task.isOwner && canAcceptOffers && (
                        <button
                          type="button"
                          disabled={acceptingId === offer.id}
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="w-full bg-[#1D4196] hover:bg-[#173577] disabled:opacity-60 text-white font-bold text-[13px] py-2.5 rounded-xl transition-colors"
                        >
                          {acceptingId === offer.id
                            ? "Memproses..."
                            : "Terima penawaran ini"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Pemilik ── */}
        {tab === "pemilik" && task.poster && (
          <div className="px-6 py-5">
            <div className="flex items-start gap-4 mb-5">
              <Avatar initials={task.poster.initials} id={task.id} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[16px] text-[#172E4D]">
                  {task.poster.name}
                </p>
                <StarRow
                  rating={task.poster.rating}
                  count={task.poster.reviews}
                />
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="text-center">
                    <p className="font-black text-[15px] text-[#172E4D]">
                      {task.poster.completionRate}%
                    </p>
                    <p className="text-[11px] text-[#7890AA]">Penyelesaian</p>
                  </div>
                  <div className="w-px bg-[#EEF3FB]" />
                  <div className="text-center">
                    <p className="font-black text-[15px] text-[#172E4D]">
                      {task.poster.reviews}
                    </p>
                    <p className="text-[11px] text-[#7890AA]">Ulasan</p>
                  </div>
                  <div className="w-px bg-[#EEF3FB]" />
                  <div className="text-center">
                    <p className="font-black text-[15px] text-[#172E4D]">
                      Sejak {task.poster.memberSince}
                    </p>
                    <p className="text-[11px] text-[#7890AA]">Anggota</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
              {["Email terverifikasi", "ID terverifikasi"].map((badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 rounded-full"
                >
                  <CheckCircle size={11} /> {badge}
                </span>
              ))}
            </div>

            <div className="bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4 space-y-2.5 text-[13px]">
              {[
                ["Bergabung sejak", `${task.poster.memberSince}`],
                [
                  "Pekerjaan selesai",
                  `${task.poster.completionRate}% dari semua pekerjaan`,
                ],
                ["Total ulasan", `${task.poster.reviews} ulasan dari tukang`],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[#7890AA] font-medium">{label}</span>
                  <span className="font-semibold text-[#172E4D]">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 bg-[#F7F9FC] rounded-xl p-4 mt-4 border border-[#D8E2F0]">
              <Shield size={16} className="text-[#1D4196] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#58708D]">
                Identitas pemilik pekerjaan sudah diverifikasi oleh KerjaIn.
                Komunikasi tetap aman di dalam platform.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      {task.isOwner && (
        <div className="shrink-0 border-t border-[#f5eded] px-6 py-4 bg-white">
          {acceptedOfferId ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] font-bold text-[14px] rounded-xl py-3">
                <CheckCircle size={16} /> Penawaran diterima!
              </div>
              <Link
                to={`/bayar?jobId=${task.id}&offerId=${acceptedOfferId}`}
                className="w-full flex items-center justify-center gap-2 bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] py-3.5 rounded-xl transition-colors"
              >
                Lanjut ke Pembayaran →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-center text-[11px] text-[#7890AA]">
                Buka tab Penawaran untuk menerima penawaran dari tukang
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Tasks() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapPreviewId, setMapPreviewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api
      .getJobs({ search: searchQuery || undefined })
      .then(({ jobs }) => setTasks(jobs))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null;

  if (!authLoading && user?.role === "technician") {
    return <Navigate to="/dasbor-tukang" replace />;
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Filter bar */}
      <div className="bg-white border-b border-[#f5eded] shrink-0 shadow-sm">
        <div className="flex items-center gap-2 px-6 py-3 max-w-[1400px] mx-auto w-full overflow-x-auto">
          <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-3 py-[9px] min-w-[200px] border border-transparent focus-within:border-[#1D4196] focus-within:bg-white transition-all">
            <Search size={15} className="text-[#7890AA] shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pekerjaan, cth. pipa bocor…"
              className="bg-transparent text-[13px] text-[#294566] placeholder-[#7890AA] outline-none w-full"
            />
          </div>
          <div className="w-px h-6 bg-[#f5eded] shrink-0" />
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#294566] bg-white border border-[#D8E2F0] rounded-lg px-4 py-[9px] hover:border-[#1D4196] hover:text-[#1D4196] transition-all whitespace-nowrap shrink-0">
            <MapPin size={13} className="text-[#1D4196]" /> Jakarta & sekitarnya{" "}
            <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#294566] bg-white border border-[#D8E2F0] rounded-lg px-4 py-[9px] hover:border-[#1D4196] hover:text-[#1D4196] transition-all whitespace-nowrap shrink-0">
            Semua Harga <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#294566] bg-white border border-[#D8E2F0] rounded-lg px-4 py-[9px] hover:border-[#1D4196] hover:text-[#1D4196] transition-all whitespace-nowrap shrink-0">
            <SlidersHorizontal size={13} /> Filter Lainnya{" "}
            <ChevronDown size={13} />
          </button>
          <div className="ml-auto shrink-0">
            <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#294566] hover:text-[#1D4196] px-3 py-[9px] transition-colors whitespace-nowrap">
              Urutkan <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Map — top on mobile, right panel on desktop */}
        <div className="order-1 md:order-2 flex-1 min-w-0 relative h-[42vh] min-h-[280px] md:h-auto md:min-h-0">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${selectedTask ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <JobsMap
              jobs={filtered}
              previewId={mapPreviewId}
              onPinClick={(id) =>
                setMapPreviewId((prev) => (prev === id ? null : id))
              }
              onPreviewClose={() => setMapPreviewId(null)}
              onViewTask={(id) => {
                setMapPreviewId(null);
                setSelectedId(id);
              }}
            />
          </div>
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              selectedTask
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0 pointer-events-none"
            }`}
          >
            {selectedTask && (
              <TaskDetail
                task={selectedTask}
                onClose={() => {
                  setSelectedId(null);
                  setMapPreviewId(null);
                }}
              />
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="order-2 md:order-1 w-full md:w-[410px] shrink-0 flex flex-col bg-[#F7F9FC] border-t md:border-t-0 md:border-r border-[#f5eded] flex-1 md:flex-none min-h-0">
          <div className="px-4 py-2.5 border-b border-[#D8E2F0] bg-white">
            <p className="text-[12px] text-[#7890AA] font-semibold">
              {filtered.length} pekerjaan tersedia
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
            {loading ? (
              <p className="text-center py-16 text-[#7890AA] text-[14px]">
                Memuat pekerjaan…
              </p>
            ) : (
              filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  selected={selectedId === task.id || mapPreviewId === task.id}
                  onClick={() => {
                    setMapPreviewId(null);
                    setSelectedId(selectedId === task.id ? null : task.id);
                  }}
                />
              ))
            )}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-[#7890AA] text-[14px] font-medium">
                Tidak ada pekerjaan yang cocok
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
