import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Search, MapPin, ChevronDown, Clock, Calendar, Grid3x3,
  Plus, Minus, Crosshair, SlidersHorizontal, Shield,
  CheckCircle, Heart, Share2, ChevronLeft,
} from "lucide-react";
import { api } from "../../lib/api";
import type { Job, Offer } from "../../types";

type Task = Job & { status: string };

const AVATAR_COLORS = ["#2E5090", "#6c47d9", "#e85d26", "#20bf6f", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];

const MAP_PINS = [
  { x: "28%", y: "35%" }, { x: "42%", y: "22%" }, { x: "55%", y: "42%" },
  { x: "35%", y: "55%" }, { x: "65%", y: "30%" }, { x: "72%", y: "60%" },
  { x: "18%", y: "62%" }, { x: "50%", y: "65%" }, { x: "80%", y: "45%" },
];
function Avatar({ initials, id, size = "sm" }: { initials: string | null | undefined; id: string; size?: "sm" | "lg" }) {
  const colorIdx = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
  const cls = size === "lg"
    ? "w-14 h-14 text-[16px] rounded-full border-2 border-white shadow"
    : "w-9 h-9 text-[11px] rounded-full border-2 border-white shadow-sm";
  if (!initials) {
    return (
      <div className={`${cls} flex items-center justify-center`} style={{ background: "#f0f7f4" }}>
        <svg width={size === "lg" ? 22 : 17} height={size === "lg" ? 22 : 17} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" fill="#F59E42" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#F59E42" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`${cls} flex items-center justify-center text-white font-bold`} style={{ background: color }}>
      {initials}
    </div>
  );
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-[12px] text-[#3d6b5e]">{rating} ({count} ulasan)</span>
    </div>
  );
}

function TaskCard({ task, selected, onClick }: { task: Task; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all px-5 py-4 hover:shadow-sm ${
        selected ? "border-[#2E5090] shadow-md ring-1 ring-[#2E5090]/20" : "border-[#c8dfd8] hover:border-[#F59E42]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[14px] leading-snug text-[#0f2035] mb-2">{task.title}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2.5">
            {task.remote && (
              <span className="flex items-center gap-1 text-[12px] text-[#3d6b5e]">
                <Grid3x3 size={12} className="shrink-0" /> Jarak Jauh
              </span>
            )}
            {task.flexible && (
              <span className="flex items-center gap-1 text-[12px] text-[#3d6b5e]">
                <Calendar size={12} className="shrink-0" /> Fleksibel
              </span>
            )}
            {task.date && !task.flexible && (
              <span className="flex items-center gap-1 text-[12px] text-[#3d6b5e]">
                <Calendar size={12} className="shrink-0" /> {task.date}
              </span>
            )}
            {task.time && !task.flexible && (
              <span className="flex items-center gap-1 text-[12px] text-[#3d6b5e]">
                <Clock size={12} className="shrink-0" /> {task.time}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-bold text-[#2E5090]">{task.status}</span>
            {task.offers !== null && (
              <span className="text-[12px] text-[#3d6b5e]">
                · {task.offers} penawaran
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-black text-[15px] text-[#0f2035]">{task.price}</span>
          <Avatar initials={task.initials} id={task.id} />
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"detail" | "penawaran" | "pemilik">("detail");

  useEffect(() => {
    if (tab === "penawaran") {
      setLoadingOffers(true);
      api.getOffers(task.id)
        .then(({ offers: data }) => setOffers(data))
        .catch(() => setOffers([]))
        .finally(() => setLoadingOffers(false));
    }
  }, [tab, task.id]);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await api.acceptOffer(offerId);
      setAcceptedOfferId(offerId);
    } catch {
      // keep UI state
    }
  };

  const TABS = [
    { id: "detail"    as const, label: "Detail",    count: null },
    { id: "penawaran" as const, label: "Penawaran", count: task.offers ?? 0 },
    { id: "pemilik"   as const, label: "Pemilik",   count: null },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 border-b border-[#f5eded]">
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3d6b5e] hover:text-[#2E5090] transition-colors"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved((s) => !s)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                saved ? "border-[#2E5090] bg-[#f0f7f4]" : "border-[#b8d4c8] hover:border-[#2E5090]"
              }`}
            >
              <Heart size={16} className={saved ? "text-[#2E5090] fill-[#2E5090]" : "text-[#3d6b5e]"} />
            </button>
            <button className="w-9 h-9 rounded-full border border-[#b8d4c8] flex items-center justify-center hover:border-[#2E5090] transition-all">
              <Share2 size={16} className="text-[#3d6b5e]" />
            </button>
          </div>
        </div>

        {/* Title + price */}
        <div className="flex items-start justify-between gap-3 px-6 pb-3">
          <h2 className="font-black text-[18px] text-[#1a2d4a] leading-snug">{task.title}</h2>
          <div className="text-right shrink-0">
            <p className="font-black text-[20px] text-[#1a2d4a] leading-none">{task.price}</p>
            <p className="text-[10px] text-[#7a9a8f] mt-0.5">Anggaran</p>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 px-6 pb-3">
          <span className="bg-[#f0f7f4] text-[#2E5090] text-[11px] font-bold px-2.5 py-0.5 rounded-full">{task.status}</span>
          {task.offers !== null && (
            <span className="text-[12px] text-[#3d6b5e]">{task.offers} penawaran</span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-[#f5eded]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-[13px] font-bold transition-all relative ${
                tab === t.id ? "text-[#2E5090]" : "text-[#7a9a8f] hover:text-[#3d6b5e]"
              }`}
            >
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-[#2E5090] text-white" : "bg-[#c8dfd8] text-[#3d6b5e]"}`}>
                  {t.count}
                </span>
              )}
              {tab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2E5090] rounded-t" />
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
                <div className="flex items-center gap-1.5 bg-[#F5F1E8] rounded-lg px-3 py-2 text-[13px] text-[#1a3d5c] font-medium">
                  <Calendar size={13} className="text-[#2E5090]" /> Waktu fleksibel
                </div>
              )}
              {task.date && !task.flexible && (
                <div className="flex items-center gap-1.5 bg-[#F5F1E8] rounded-lg px-3 py-2 text-[13px] text-[#1a3d5c] font-medium">
                  <Calendar size={13} className="text-[#2E5090]" /> {task.date}
                </div>
              )}
              {task.time && !task.flexible && (
                <div className="flex items-center gap-1.5 bg-[#F5F1E8] rounded-lg px-3 py-2 text-[13px] text-[#1a3d5c] font-medium">
                  <Clock size={13} className="text-[#2E5090]" /> {task.time}
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-[#F5F1E8] rounded-lg px-3 py-2 text-[13px] text-[#1a3d5c] font-medium">
                <MapPin size={13} className="text-[#2E5090]" /> Di lokasi · Jakarta
              </div>
            </div>

            <h3 className="font-bold text-[12px] text-[#7a9a8f] uppercase tracking-wider mb-3">Deskripsi pekerjaan</h3>
            <div className="text-[14px] text-[#1a3d5c] leading-relaxed whitespace-pre-line mb-6">
              {task.description}
            </div>

            <div className="flex items-start gap-3 bg-[#F5F1E8] rounded-xl p-4">
              <Shield size={16} className="text-[#2E5090] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-[#0f2035]">Pembayaran Anda terlindungi</p>
                <p className="text-[12px] text-[#3d6b5e] mt-0.5">Dana hanya dicairkan setelah Anda konfirmasi pekerjaan selesai.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Penawaran ── */}
        {tab === "penawaran" && (
          <div className="px-6 py-5">
            {loadingOffers ? (
              <p className="text-center py-12 text-[#7a9a8f] text-[14px]">Memuat penawaran…</p>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 text-[#7a9a8f]">
                <p className="text-[32px] mb-3">📭</p>
                <p className="font-bold text-[14px]">Belum ada penawaran</p>
                <p className="text-[12px] mt-1">Tukang akan segera mengajukan penawaran</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[12px] font-bold text-[#7a9a8f] uppercase tracking-wider mb-1">
                  {offers.length} penawaran masuk
                </p>
                {offers.map((offer) => {
                  const initials = offer.technicianName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  const colorIdx = offer.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
                  return (
                  <div key={offer.id} className="bg-[#F5F1E8] border border-[#c8dfd8] rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[13px] shrink-0"
                        style={{ background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length] }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[14px] text-[#0f2035]">{offer.technicianName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-[16px] text-[#1a2d4a]">{offer.priceFormatted}</p>
                      </div>
                    </div>
                    {offer.message && (
                      <p className="text-[12px] text-[#3d6b5e] leading-relaxed mb-3 italic">"{offer.message}"</p>
                    )}
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[13px] py-2.5 rounded-xl transition-colors"
                    >
                      Terima penawaran ini
                    </button>
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
                <p className="font-bold text-[16px] text-[#0f2035]">{task.poster.name}</p>
                <StarRow rating={task.poster.rating} count={task.poster.reviews} />
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="text-center">
                    <p className="font-black text-[15px] text-[#0f2035]">{task.poster.completionRate}%</p>
                    <p className="text-[11px] text-[#7a9a8f]">Penyelesaian</p>
                  </div>
                  <div className="w-px bg-[#f0f7f4]" />
                  <div className="text-center">
                    <p className="font-black text-[15px] text-[#0f2035]">{task.poster.reviews}</p>
                    <p className="text-[11px] text-[#7a9a8f]">Ulasan</p>
                  </div>
                  <div className="w-px bg-[#f0f7f4]" />
                  <div className="text-center">
                    <p className="font-black text-[15px] text-[#0f2035]">Sejak {task.poster.memberSince}</p>
                    <p className="text-[11px] text-[#7a9a8f]">Anggota</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-5">
              {["Email terverifikasi", "HP terverifikasi", "ID terverifikasi"].map((badge) => (
                <span key={badge} className="flex items-center gap-1 text-[11px] font-semibold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} /> {badge}
                </span>
              ))}
            </div>

            <div className="bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4 space-y-2.5 text-[13px]">
              {[
                ["Bergabung sejak", `${task.poster.memberSince}`],
                ["Pekerjaan selesai", `${task.poster.completionRate}% dari semua pekerjaan`],
                ["Total ulasan", `${task.poster.reviews} ulasan dari tukang`],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[#7a9a8f] font-medium">{label}</span>
                  <span className="font-semibold text-[#0f2035]">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 bg-[#F5F1E8] rounded-xl p-4 mt-4 border border-[#c8dfd8]">
              <Shield size={16} className="text-[#2E5090] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#3d6b5e]">
                Identitas pemilik pekerjaan sudah diverifikasi oleh KerjaIn. Komunikasi tetap aman di dalam platform.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="shrink-0 border-t border-[#f5eded] px-6 py-4 bg-white">
        {acceptedOfferId ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] font-bold text-[14px] rounded-xl py-3">
              <CheckCircle size={16} /> Penawaran diterima!
            </div>
            <Link
              to={`/bayar?jobId=${task.id}&offerId=${acceptedOfferId}`}
              className="w-full flex items-center justify-center gap-2 bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[15px] py-3.5 rounded-xl transition-colors"
            >
              Lanjut ke Pembayaran →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-center text-[11px] text-[#7a9a8f]">
              Buka tab Penawaran untuk menerima penawaran dari tukang
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MapPlaceholder({ selectedId }: { selectedId: string | null }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f8eded]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <rect width="100%" height="100%" fill="#f8eded" />
        {["20%", "38%", "56%", "72%", "87%"].map((y) => (
          <line key={y} x1="0" y1={y} x2="100%" y2={y} stroke="#F5F1E8" strokeWidth="10" />
        ))}
        {["18%", "35%", "52%", "68%", "83%"].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="100%" stroke="#F5F1E8" strokeWidth="10" />
        ))}
        {[
          {x:"2%",y:"3%",w:"14%",h:"15%"},{x:"20%",y:"3%",w:"13%",h:"15%"},{x:"37%",y:"3%",w:"13%",h:"15%"},
          {x:"54%",y:"3%",w:"12%",h:"15%"},{x:"70%",y:"3%",w:"11%",h:"15%"},{x:"85%",y:"3%",w:"13%",h:"15%"},
          {x:"2%",y:"22%",w:"14%",h:"14%"},{x:"20%",y:"22%",w:"13%",h:"14%"},{x:"37%",y:"22%",w:"13%",h:"14%"},
          {x:"54%",y:"22%",w:"12%",h:"14%"},{x:"70%",y:"22%",w:"11%",h:"14%"},{x:"85%",y:"22%",w:"13%",h:"14%"},
          {x:"2%",y:"40%",w:"14%",h:"14%"},{x:"20%",y:"40%",w:"13%",h:"14%"},{x:"37%",y:"40%",w:"13%",h:"14%"},
          {x:"54%",y:"40%",w:"12%",h:"14%"},{x:"70%",y:"40%",w:"11%",h:"14%"},{x:"85%",y:"40%",w:"13%",h:"14%"},
          {x:"2%",y:"58%",w:"14%",h:"12%"},{x:"20%",y:"58%",w:"13%",h:"12%"},{x:"37%",y:"58%",w:"13%",h:"12%"},
          {x:"54%",y:"58%",w:"12%",h:"12%"},{x:"70%",y:"58%",w:"11%",h:"12%"},{x:"85%",y:"58%",w:"13%",h:"12%"},
          {x:"2%",y:"74%",w:"14%",h:"23%"},{x:"20%",y:"74%",w:"13%",h:"23%"},{x:"37%",y:"74%",w:"13%",h:"23%"},
          {x:"54%",y:"74%",w:"12%",h:"23%"},{x:"70%",y:"74%",w:"11%",h:"23%"},{x:"85%",y:"74%",w:"13%",h:"23%"},
        ].map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="4" fill="#f0d8d8" opacity="0.85" />)}
        <rect x="37%" y="40%" width="13%" height="14%" rx="4" fill="#c8e6c9" opacity="0.6" />
        <rect x="2%" y="58%" width="14%" height="12%" rx="4" fill="#c8e6c9" opacity="0.5" />
        {/* Jakarta label */}
        <text x="50%" y="92%" textAnchor="middle" fontFamily="Manrope,sans-serif" fontSize="12" fill="#7a9a8f" fontWeight="600">Jakarta, Indonesia</text>
      </svg>

      {MAP_PINS.map((pin, i) => {
        const active = selectedId !== null && i === 0;
        return (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: pin.x, top: pin.y }}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 transition-all ${
              active ? "bg-[#2E5090] border-white scale-125" : "bg-white border-[#2E5090] hover:scale-110"
            }`}>
              <MapPin size={13} className={active ? "text-white" : "text-[#2E5090]"} fill={active ? "currentColor" : "none"} />
            </div>
            {active && <div className="w-2 h-2 bg-[#2E5090] rotate-45 mx-auto -mt-[3px]" />}
          </div>
        );
      })}

      <div className="absolute right-4 bottom-10 flex flex-col gap-1.5">
        <button className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F5F1E8] border border-[#b8d4c8]">
          <Crosshair size={15} className="text-[#3d6b5e]" />
        </button>
        <div className="w-9 bg-white rounded-lg shadow-md border border-[#b8d4c8] overflow-hidden mt-0.5">
          <button className="w-full h-9 flex items-center justify-center hover:bg-[#F5F1E8] border-b border-[#b8d4c8]">
            <Plus size={15} className="text-[#3d6b5e]" />
          </button>
          <button className="w-full h-9 flex items-center justify-center hover:bg-[#F5F1E8]">
            <Minus size={15} className="text-[#3d6b5e]" />
          </button>
        </div>
      </div>
      <div className="absolute bottom-2 right-3 text-[10px] text-[#7a9a8f] bg-white/80 px-2 py-0.5 rounded-full">
        MapLibre | © OpenStreetMap
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.getJobs({ search: searchQuery || undefined })
      .then(({ jobs }) => setTasks(jobs.map((j) => ({ ...j, status: j.status === "open" ? "Terbuka" : j.status }))))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Filter bar */}
      <div className="bg-white border-b border-[#f5eded] shrink-0 shadow-sm">
        <div className="flex items-center gap-2 px-6 py-3 max-w-[1400px] mx-auto w-full overflow-x-auto">
          <div className="flex items-center gap-2 bg-[#F5F1E8] rounded-lg px-3 py-[9px] min-w-[200px] border border-transparent focus-within:border-[#2E5090] focus-within:bg-white transition-all">
            <Search size={15} className="text-[#7a9a8f] shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pekerjaan, cth. pipa bocor…"
              className="bg-transparent text-[13px] text-[#1a3d5c] placeholder-[#7a9a8f] outline-none w-full"
            />
          </div>
          <div className="w-px h-6 bg-[#f5eded] shrink-0" />
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1a3d5c] bg-white border border-[#b8d4c8] rounded-lg px-4 py-[9px] hover:border-[#2E5090] hover:text-[#2E5090] transition-all whitespace-nowrap shrink-0">
            <MapPin size={13} className="text-[#2E5090]" /> Jakarta & sekitarnya <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1a3d5c] bg-white border border-[#b8d4c8] rounded-lg px-4 py-[9px] hover:border-[#2E5090] hover:text-[#2E5090] transition-all whitespace-nowrap shrink-0">
            Semua Harga <ChevronDown size={13} />
          </button>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1a3d5c] bg-white border border-[#b8d4c8] rounded-lg px-4 py-[9px] hover:border-[#2E5090] hover:text-[#2E5090] transition-all whitespace-nowrap shrink-0">
            <SlidersHorizontal size={13} /> Filter Lainnya <ChevronDown size={13} />
          </button>
          <div className="ml-auto shrink-0">
            <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1a3d5c] hover:text-[#2E5090] px-3 py-[9px] transition-colors whitespace-nowrap">
              Urutkan <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Task list */}
        <div className="w-[410px] shrink-0 flex flex-col bg-[#F5F1E8] border-r border-[#f5eded]">
          <div className="px-4 py-2.5 border-b border-[#c8dfd8] bg-white">
            <p className="text-[12px] text-[#7a9a8f] font-semibold">{filtered.length} pekerjaan tersedia</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
            {loading ? (
              <p className="text-center py-16 text-[#7a9a8f] text-[14px]">Memuat pekerjaan…</p>
            ) : filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedId === task.id}
                onClick={() => setSelectedId(selectedId === task.id ? null : task.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-[#7a9a8f] text-[14px] font-medium">
                Tidak ada pekerjaan yang cocok
              </div>
            )}
          </div>
        </div>

        {/* Right panel: detail or map */}
        <div className="flex-1 min-w-0 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${selectedTask ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <MapPlaceholder selectedId={selectedId} />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${
            selectedTask ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0 pointer-events-none"
          }`}>
            {selectedTask && (
              <TaskDetail task={selectedTask} onClose={() => setSelectedId(null)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
