import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2, MessageSquare } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { MessageThreadSummary } from "../../types";

function formatPreview(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 86400000) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function MessagesInbox() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMessageInbox()
      .then(({ threads: data }) => setThreads(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const chatLink = (t: MessageThreadSummary) => {
    const peerParam = user?.role === "technician" ? "" : `?peerId=${encodeURIComponent(t.peerId)}`;
    return `/pesan/${t.jobId}${peerParam}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-4" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="max-w-[640px] mx-auto">
        <h1 className="font-black text-[26px] text-[#172E4D] mb-2">Pesan</h1>
        <p className="text-[14px] text-[#58708D] mb-6">
          Percakapan dengan {user?.role === "technician" ? "pelanggan" : "tukang"} per pekerjaan.
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#1D4196]" />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-12 text-[14px]">{error}</p>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#D8E2F0]">
            <MessageSquare size={44} className="mx-auto mb-3 text-[#D8E2F0]" />
            <p className="font-bold text-[#172E4D]">Belum ada percakapan</p>
            <p className="text-[13px] text-[#7890AA] mt-1 max-w-xs mx-auto">
              Buka penawaran atau pekerjaan aktif, lalu ketuk &quot;Kirim pesan&quot; untuk mulai chat.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {threads.map((t) => (
              <Link
                key={t.id}
                to={chatLink(t)}
                className="bg-white border border-[#D8E2F0] rounded-2xl px-4 py-3.5 hover:border-[#1D4196] hover:shadow-sm transition-all flex gap-3 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-[#EEF3FB] flex items-center justify-center shrink-0">
                  <MessageSquare size={18} className="text-[#1D4196]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-bold text-[14px] text-[#172E4D] truncate">{t.peerName}</p>
                    <span className="text-[11px] text-[#7890AA] shrink-0">{formatPreview(t.lastMessageAt)}</span>
                  </div>
                  <p className="text-[12px] text-[#7890AA] truncate">{t.jobTitle}</p>
                  {t.lastMessage && (
                    <p className="text-[13px] text-[#58708D] truncate mt-0.5">{t.lastMessage}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
