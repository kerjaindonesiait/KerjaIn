import type { Job } from "../../types";

const AVATAR_COLORS = ["#2E5090", "#6c47d9", "#e85d26", "#20bf6f", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function dueLabel(job: Job): string {
  if (job.flexible || job.waktuType === "fleksibel") return "Waktu fleksibel";
  if (job.waktuType === "asap") return "Segera / hari ini";
  if (job.date) return `Jadwal: ${job.date}`;
  return "Jadwal fleksibel";
}

function posterName(job: Job): string {
  const name = job.poster?.name?.trim();
  if (!name) return "Pengguna";
  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

function PosterAvatar({ job }: { job: Job }) {
  const colorIdx = job.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
  const initials = job.initials ?? job.poster?.initials;

  if (initials) {
    return (
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0 border-2 border-[#e8f4ef]"
        style={{ background: color }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-[#e8f4ef] flex items-center justify-center shrink-0 border-2 border-white">
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#7a9a8f" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#7a9a8f" />
      </svg>
    </div>
  );
}

export function JobMapPreviewCard({
  job,
  onViewTask,
}: {
  job: Job;
  onViewTask: () => void;
}) {
  return (
    <div className="w-[280px] font-sans text-left p-1 pr-6">
      <div className="flex items-start gap-3 mb-3">
        <PosterAvatar job={job} />
        <div className="ml-auto text-right shrink-0 bg-[#e8f4ef] rounded-lg px-3 py-2 min-w-[72px]">
          <p className="text-[9px] font-bold text-[#3d6b5e] uppercase tracking-wider leading-none mb-0.5">
            Anggaran
          </p>
          <p className="text-[18px] font-black text-[#1a2d4a] leading-none">{job.price}</p>
        </div>
      </div>

      <h3 className="font-black text-[13px] text-[#1a2d4a] leading-snug mb-2 line-clamp-3 uppercase">
        {job.title}
      </h3>

      <p className="text-[12px] text-[#7a9a8f] mb-1.5">{dueLabel(job)}</p>
      <p className="text-[12px] text-[#7a9a8f] mb-4">
        Diposting oleh{" "}
        <span className="text-[#2E5090] font-semibold">{posterName(job)}</span>
        {" · "}
        {formatTimeAgo(job.createdAt)}
      </p>

      <button
        type="button"
        onClick={onViewTask}
        className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[14px] py-2.5 rounded-full transition-colors"
      >
        Lihat Pekerjaan
      </button>
    </div>
  );
}
