import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Link, useNavigate, Navigate, useSearchParams } from "react-router";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
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
  History,
  Banknote,
  TrendingDown,
  TrendingUp,
  Star,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { JobsMap } from "../components/JobsMap";
import {
  filterAndSortJobs,
  JAKARTA_AREAS,
  SORT_LABELS,
  JOB_CATEGORY_FILTERS,
  areaFilterLabel,
  DEFAULT_PRICE_RANGE,
  PRICE_SLIDER_MIN,
  PRICE_SLIDER_MAX,
  PRICE_SLIDER_STEP,
  formatPriceRangeLabel,
  isFullPriceRange,
  type PriceRange,
  type SortOption,
  type JobCategoryFilter,
} from "../../lib/jobFilters";
import type { Job, Offer } from "../../types";
import { BrandLogo } from "../components/BrandLogo";
import { appShellClass, appShellClassMobileFlush } from "../../lib/layout";
import { useShowTasksMap } from "../../lib/useShowTasksMap";
import { FilterPopover, FilterScrollContainerContext } from "../components/FilterPopover";
import { HorizontalScrollRow } from "../components/HorizontalScrollRow";
import { JobPhotoGallery } from "../components/JobPhotoGallery";

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
  if (count <= 0 || rating <= 0) return null;
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

type TaskDetailTab = "detail" | "penawaran" | "pemilik";

function parseTaskDetailTab(raw: string | null, isOwner: boolean): TaskDetailTab {
  if (raw === "penawaran" && isOwner) return "penawaran";
  if (raw === "pemilik") return "pemilik";
  return "detail";
}

function TaskDetail({
  task,
  tab,
  onTabChange,
  onBack,
}: {
  task: Task;
  tab: TaskDetailTab;
  onTabChange: (tab: TaskDetailTab) => void;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const TABS = [
    { id: "detail" as const, label: "Detail", count: null },
    { id: "penawaran" as const, label: "Penawaran", count: task.offers ?? 0 },
    { id: "pemilik" as const, label: "Pemilik", count: null },
  ];

  const canAcceptOffers = !!task.isOwner && task.status === "open";
  const visibleTabs = TABS.filter((t) => t.id !== "penawaran" || task.isOwner);

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
            onClick={onBack}
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
          <h2 className="min-w-0 break-words font-black text-[18px] text-[#172E4D] leading-snug">
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
              onClick={() => onTabChange(t.id)}
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

            <JobPhotoGallery photos={task.photos ?? []} className="mb-6" />

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
                          {(offer.technicianReviewCount ?? 0) > 0 && (
                            <StarRow
                              rating={offer.technicianRating ?? 0}
                              count={offer.technicianReviewCount ?? 0}
                            />
                          )}
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
                <p className="text-[13px] text-[#58708D] mt-1">Pemilik pekerjaan</p>
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

            <div className="flex items-start gap-3 bg-[#F7F9FC] rounded-xl p-4 border border-[#D8E2F0]">
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

type FilterMenuId = "area" | "price" | "more" | "sort";

const SORT_ICONS: Record<SortOption, ReactNode> = {
  newest: <Clock size={18} strokeWidth={2} />,
  oldest: <History size={18} strokeWidth={2} />,
  price_asc: <TrendingDown size={18} strokeWidth={2} />,
  price_desc: <TrendingUp size={18} strokeWidth={2} />,
  offers: <Star size={18} strokeWidth={2} />,
};

function FilterPillTrigger({
  active,
  open,
  icon,
  label,
}: {
  active: boolean;
  open: boolean;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-4 py-2 transition-all whitespace-nowrap border-2 ${
        active || open
          ? "text-[#1D4196] border-[#1D4196] bg-white"
          : "text-[#294566] border-[#D8E2F0] bg-white hover:border-[#1D4196] hover:text-[#1D4196]"
      }`}
    >
      {icon}
      {label}
      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
  );
}

function FilterTextTrigger({
  active,
  open,
  label,
}: {
  active: boolean;
  open: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-full transition-all whitespace-nowrap ${
        open
          ? "text-[#1D4196] bg-[#EEF3FB]"
          : active
            ? "text-[#1D4196]"
            : "text-[#294566] hover:text-[#1D4196]"
      }`}
    >
      {label}
      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
  );
}

function FilterPanelSection({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#7890AA] mb-2">{label}</p>
      {value && <p className="text-[15px] font-bold text-[#172E4D] mb-3">{value}</p>}
      {children}
    </div>
  );
}

function FilterPanelFooter({ onCancel, onApply }: { onCancel: () => void; onApply: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#EEF3FB] bg-[#FAFBFD]">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 text-[13px] font-bold text-[#1D4196] bg-[#EEF3FB] hover:bg-[#E3EBF8] rounded-full py-2.5 transition-colors"
      >
        Batal
      </button>
      <button
        type="button"
        onClick={onApply}
        className="flex-1 text-[13px] font-bold text-white bg-[#1D4196] hover:bg-[#173577] rounded-full py-2.5 transition-colors"
      >
        Terapkan
      </button>
    </div>
  );
}

function FilterRadioOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors ${
        active ? "bg-[#EEF3FB] text-[#1D4196] font-semibold" : "text-[#294566] hover:bg-[#F7F9FC] font-medium"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
          active ? "border-[#1D4196]" : "border-[#C5D3E8]"
        }`}
      >
        {active && <span className="w-2 h-2 rounded-full bg-[#1D4196]" />}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}

function FilterSortItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors ${
        active ? "bg-[#EEF3FB] text-[#1D4196] font-semibold" : "text-[#172E4D] hover:bg-[#F7F9FC] font-medium"
      }`}
    >
      <span className="text-[#1D4196] shrink-0">{icon}</span>
      {label}
    </button>
  );
}

const RANGE_THUMB =
  "pointer-events-none absolute w-full appearance-none bg-transparent h-6 top-1/2 -translate-y-1/2 " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:bg-[#1D4196] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white " +
  "[&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(23,65,150,0.35)] [&::-webkit-slider-thumb]:cursor-grab " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none " +
  "[&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:bg-[#1D4196] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white " +
  "[&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(23,65,150,0.35)] [&::-moz-range-thumb]:cursor-grab " +
  "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent";

function PriceRangeSlider({
  value,
  onChange,
}: {
  value: PriceRange;
  onChange: (v: PriceRange) => void;
}) {
  const span = PRICE_SLIDER_MAX - PRICE_SLIDER_MIN;
  const minPct = ((value.min - PRICE_SLIDER_MIN) / span) * 100;
  const maxPct = ((value.max - PRICE_SLIDER_MIN) / span) * 100;

  return (
    <div className="relative h-8 mx-0.5 mt-1">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#E3EBF5] rounded-full" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#1D4196] rounded-full"
        style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
      />
      <input
        type="range"
        min={PRICE_SLIDER_MIN}
        max={PRICE_SLIDER_MAX}
        step={PRICE_SLIDER_STEP}
        value={value.min}
        onChange={(e) => {
          const next = Math.min(Number(e.target.value), value.max - PRICE_SLIDER_STEP);
          onChange({ ...value, min: next });
        }}
        className={`${RANGE_THUMB} z-[3]`}
        aria-label="Harga minimum"
      />
      <input
        type="range"
        min={PRICE_SLIDER_MIN}
        max={PRICE_SLIDER_MAX}
        step={PRICE_SLIDER_STEP}
        value={value.max}
        onChange={(e) => {
          const next = Math.max(Number(e.target.value), value.min + PRICE_SLIDER_STEP);
          onChange({ ...value, max: next });
        }}
        className={`${RANGE_THUMB} z-[4]`}
        aria-label="Harga maksimum"
      />
    </div>
  );
}

export default function Tasks() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobOpenedViaPush = useRef(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedId = searchParams.get("job");
  const [mapPreviewId, setMapPreviewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("Semua area");
  const [priceRange, setPriceRange] = useState<PriceRange>(DEFAULT_PRICE_RANGE);
  const [categoryFilter, setCategoryFilter] = useState<JobCategoryFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [openMenu, setOpenMenu] = useState<FilterMenuId | null>(null);
  const [draftArea, setDraftArea] = useState("Semua area");
  const [draftPriceRange, setDraftPriceRange] = useState<PriceRange>(DEFAULT_PRICE_RANGE);
  const [draftCategory, setDraftCategory] = useState<JobCategoryFilter>("all");
  const [categorySearch, setCategorySearch] = useState("");
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const openFilter = (id: FilterMenuId) => {
    if (id === "area") setDraftArea(areaFilter);
    if (id === "price") setDraftPriceRange(priceRange);
    if (id === "more") {
      setDraftCategory(categoryFilter);
      setCategorySearch("");
    }
    setOpenMenu(id);
  };

  const closeFilter = () => setOpenMenu(null);

  useEffect(() => {
    if (selectedId) closeFilter();
  }, [selectedId]);

  useEffect(() => {
    api
      .getJobs()
      .then(({ jobs }) => setTasks(jobs))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      filterAndSortJobs(tasks, {
        search: searchQuery,
        area: areaFilter,
        priceRange,
        sort: sortOption,
        category: categoryFilter,
      }),
    [tasks, searchQuery, areaFilter, priceRange, sortOption, categoryFilter],
  );

  useEffect(() => {
    if (selectedId && !filtered.some((t) => t.id === selectedId)) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete("job");
        p.delete("tab");
        return p;
      }, { replace: true });
    }
  }, [filtered, selectedId, setSearchParams]);

  const selectedTask = filtered.find((t) => t.id === selectedId) ?? null;
  const detailTab = selectedTask
    ? parseTaskDetailTab(searchParams.get("tab"), !!selectedTask.isOwner)
    : "detail";

  useEffect(() => {
    if (
      selectedTask &&
      searchParams.get("tab") === "penawaran" &&
      !selectedTask.isOwner
    ) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete("tab");
        return p;
      }, { replace: true });
    }
  }, [selectedTask, searchParams, setSearchParams]);

  const openJob = (id: string | null) => {
    if (!id) {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete("job");
        p.delete("tab");
        return p;
      }, { replace: true });
      return;
    }
    jobOpenedViaPush.current = true;
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("job", id);
      p.delete("tab");
      return p;
    });
  };

  const setDetailTab = (tab: TaskDetailTab) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (tab === "detail") p.delete("tab");
      else p.set("tab", tab);
      return p;
    });
  };

  const handleDetailBack = () => {
    const tab = searchParams.get("tab");
    const job = searchParams.get("job");
    if (job && tab && tab !== "detail") {
      navigate(-1);
      return;
    }
    if (job) {
      if (jobOpenedViaPush.current) {
        jobOpenedViaPush.current = false;
        navigate(-1);
      } else {
        setSearchParams((prev) => {
          const p = new URLSearchParams(prev);
          p.delete("job");
          p.delete("tab");
          return p;
        }, { replace: true });
      }
    }
  };

  const categoryLabel =
    JOB_CATEGORY_FILTERS.find((c) => c.id === categoryFilter)?.label ?? "Filter Lainnya";
  const moreFilterActive = categoryFilter !== "all";

  const filteredCategories = useMemo(
    () =>
      JOB_CATEGORY_FILTERS.filter((c) =>
        c.label.toLowerCase().includes(categorySearch.trim().toLowerCase()),
      ),
    [categorySearch],
  );

  const showMap = useShowTasksMap();

  useEffect(() => {
    if (!showMap) setMapPreviewId(null);
  }, [showMap]);

  const mapPanelClassName =
    "order-1 md:order-2 flex-1 min-w-0 relative min-h-0 h-full md:rounded-xl md:overflow-hidden md:border md:border-[#D8E2F0]";
  const taskListClassName =
    "order-2 md:order-1 w-full md:w-[380px] lg:w-[400px] shrink-0 flex flex-col bg-[#F7F9FC] md:border md:border-[#D8E2F0] md:rounded-xl flex-1 md:flex-none min-h-0 overflow-hidden";
  const portraitListClassName =
    "flex-1 flex flex-col w-full min-h-0 overflow-hidden bg-[#F7F9FC]";

  if (!authLoading && user?.role === "technician") {
    return <Navigate to="/dasbor-tukang" replace />;
  }

  const userDisplayName = user?.fullName ?? user?.email?.split("@")[0] ?? "Akun";
  const userInitials = userDisplayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {user?.role === "user" && (
        <header className="bg-[#172E4D] text-white shrink-0 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <Link to="/tasks" className="hover:opacity-90 transition-opacity shrink-0">
              <BrandLogo variant="dark" imgClassName="h-9" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to="/post-job"
                className="shrink-0 bg-[#1D4196] hover:bg-[#173577] text-white text-[12px] font-semibold px-3.5 py-[7px] rounded-full transition-colors whitespace-nowrap"
              >
                Post Kerjaan
              </Link>
              <Link
                to="/pesan"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                aria-label="Pesan"
              >
                <MessageCircle size={18} className="text-white" />
              </Link>
              <Link to="/akun" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity min-w-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1D4196] flex items-center justify-center text-white font-black text-[12px] shrink-0">
                    {userInitials}
                  </div>
                )}
                <p className="font-bold text-[13px] text-white leading-none truncate max-w-[100px] sm:max-w-[160px]">
                  {userDisplayName}
                </p>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Filter bar — hidden on portrait phone when viewing job detail */}
      <div
        className={`bg-white border-b border-[#f5eded] shrink-0 shadow-sm${
          selectedTask ? " max-md:hidden" : ""
        }`}
      >
        <div className={`${appShellClass} py-3`}>
          <FilterScrollContainerContext.Provider value={filterScrollRef}>
          <HorizontalScrollRow
            ref={filterScrollRef}
            fadeEdge="light"
            innerClassName="-mx-1 px-1 pb-1"
            scrollLocked={openMenu !== null}
          >
            <div className="flex items-center gap-2 flex-nowrap min-w-max pr-2">
              <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-3 py-[9px] min-w-[220px] max-w-[280px] shrink-0 border border-transparent focus-within:border-[#1D4196] focus-within:bg-white transition-all">
                <Search size={15} className="text-[#7890AA] shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pekerjaan, cth. pipa bocor…"
                  className="bg-transparent text-[13px] text-[#294566] placeholder-[#7890AA] outline-none w-full min-w-0"
                />
              </div>
              <div className="w-px h-6 bg-[#f5eded] shrink-0" />
          <FilterPopover
            open={openMenu === "area"}
            onOpenChange={(open) => (open ? openFilter("area") : closeFilter())}
            width={288}
            trigger={
              <FilterPillTrigger
                active={areaFilter !== "Semua area"}
                open={openMenu === "area"}
                icon={<MapPin size={14} className="text-[#1D4196]" />}
                label={areaFilterLabel(areaFilter)}
              />
            }
          >
            <FilterPanelSection label="Area" value={areaFilterLabel(draftArea)}>
              <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 -mx-1">
                {JAKARTA_AREAS.map((area) => (
                  <FilterRadioOption
                    key={area}
                    active={draftArea === area}
                    onClick={() => setDraftArea(area)}
                  >
                    {areaFilterLabel(area)}
                  </FilterRadioOption>
                ))}
              </div>
            </FilterPanelSection>
            <FilterPanelFooter
              onCancel={closeFilter}
              onApply={() => {
                setAreaFilter(draftArea);
                closeFilter();
              }}
            />
          </FilterPopover>
          <FilterPopover
            open={openMenu === "price"}
            onOpenChange={(open) => (open ? openFilter("price") : closeFilter())}
            width={300}
            trigger={
              <FilterPillTrigger
                active={!isFullPriceRange(priceRange)}
                open={openMenu === "price"}
                icon={<Banknote size={14} className="text-[#1D4196]" />}
                label={formatPriceRangeLabel(priceRange)}
              />
            }
          >
            <FilterPanelSection label="Harga pekerjaan" value={formatPriceRangeLabel(draftPriceRange)}>
              <PriceRangeSlider value={draftPriceRange} onChange={setDraftPriceRange} />
            </FilterPanelSection>
            <FilterPanelFooter
              onCancel={closeFilter}
              onApply={() => {
                setPriceRange(draftPriceRange);
                closeFilter();
              }}
            />
          </FilterPopover>
          <FilterPopover
            open={openMenu === "more"}
            onOpenChange={(open) => (open ? openFilter("more") : closeFilter())}
            width={320}
            trigger={
              <FilterPillTrigger
                active={moreFilterActive}
                open={openMenu === "more"}
                icon={<SlidersHorizontal size={14} className="text-[#1D4196]" />}
                label={moreFilterActive ? categoryLabel : "Filter Lainnya"}
              />
            }
          >
            <FilterPanelSection
              label="Kategori"
              value={
                draftCategory === "all"
                  ? "Semua kategori"
                  : JOB_CATEGORY_FILTERS.find((c) => c.id === draftCategory)?.label
              }
            >
              <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-xl px-3 py-2 mb-3 border border-[#E8EDF5]">
                <Search size={14} className="text-[#7890AA] shrink-0" />
                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Cari kategori…"
                  className="bg-transparent text-[13px] text-[#294566] placeholder-[#7890AA] outline-none w-full"
                />
              </div>
              {draftCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => setDraftCategory("all")}
                  className="text-[12px] font-semibold text-[#1D4196] mb-2 hover:underline"
                >
                  Hapus semua
                </button>
              )}
              <div className="max-h-[200px] overflow-y-auto flex flex-col gap-0.5 -mx-1">
                {filteredCategories.map((cat) => (
                  <FilterRadioOption
                    key={cat.id}
                    active={draftCategory === cat.id}
                    onClick={() => setDraftCategory(cat.id)}
                  >
                    {cat.label}
                  </FilterRadioOption>
                ))}
              </div>
            </FilterPanelSection>
            <FilterPanelFooter
              onCancel={closeFilter}
              onApply={() => {
                setCategoryFilter(draftCategory);
                closeFilter();
              }}
            />
          </FilterPopover>
          <FilterPopover
            open={openMenu === "sort"}
            onOpenChange={(open) => (open ? openFilter("sort") : closeFilter())}
            align="right"
            width="auto"
            trigger={
              <FilterTextTrigger
                active={sortOption !== "newest"}
                open={openMenu === "sort"}
                label={sortOption === "newest" ? "Urutkan" : SORT_LABELS[sortOption]}
              />
            }
          >
            <div className="p-2 w-full min-w-0">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <FilterSortItem
                  key={key}
                  active={sortOption === key}
                  icon={SORT_ICONS[key]}
                  label={SORT_LABELS[key]}
                  onClick={() => {
                    setSortOption(key);
                    closeFilter();
                  }}
                />
              ))}
            </div>
          </FilterPopover>
            </div>
          </HorizontalScrollRow>
          </FilterScrollContainerContext.Provider>
        </div>
      </div>

      {/* Body — portrait phone: list only; landscape/tablet/desktop: map + list */}
      <div
        className={`${appShellClassMobileFlush} flex flex-1 min-h-0 ${
          showMap ? "flex-col md:flex-row md:pb-4 md:gap-3" : "flex-col"
        }`}
      >
        {showMap && (
        <div className={mapPanelClassName}>
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
                openJob(id);
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
                tab={detailTab}
                onTabChange={setDetailTab}
                onBack={handleDetailBack}
              />
            )}
          </div>
        </div>
        )}

        {!showMap && selectedTask ? (
          <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden">
            <TaskDetail
              task={selectedTask}
              tab={detailTab}
              onTabChange={setDetailTab}
              onBack={handleDetailBack}
            />
          </div>
        ) : (
        <div
          className={`${showMap ? taskListClassName : portraitListClassName}${
            showMap && selectedTask ? " hidden md:flex" : ""
          }`}
        >
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
            {loading ? (
              <p className="text-center py-16 text-[#7890AA] text-[14px]">
                Memuat pekerjaan…
              </p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-[#7890AA] text-[14px] font-medium">
                Tidak ada pekerjaan yang cocok
              </div>
            ) : (
              filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  selected={selectedId === task.id || mapPreviewId === task.id}
                  onClick={() => {
                    setMapPreviewId(null);
                    openJob(selectedId === task.id ? null : task.id);
                  }}
                />
              ))
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
