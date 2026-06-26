import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeft, Loader2, MessageSquare, Send } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { JobMessage } from "../../types";

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function JobChat() {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const peerId = searchParams.get("peerId") ?? undefined;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [peerName, setPeerName] = useState("");
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (silent = false) => {
    if (!jobId) return;
    if (!silent) setLoading(true);
    try {
      const data = await api.getJobMessages(jobId, peerId);
      setJobTitle(data.job.title);
      setPeerName(data.peer.name);
      setMessages(data.messages);
      setError(null);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : "Gagal memuat pesan");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [jobId, peerId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => load(true), 5000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !jobId || sending) return;
    setSending(true);
    try {
      const { message } = await api.sendJobMessage(jobId, text, peerId);
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const backTo = user?.role === "technician" ? "/dasbor-tukang" : "/pekerjaan-saya";

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <p className="text-[#58708D]">Pekerjaan tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>
      <header className="shrink-0 bg-white border-b border-[#D8E2F0] sticky top-0 z-10">
        <div className="max-w-[720px] mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="text-[#58708D] hover:text-[#1D4196] transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[15px] text-[#172E4D] truncate">{peerName || "Percakapan"}</p>
            <p className="text-[12px] text-[#7890AA] truncate">{jobTitle}</p>
          </div>
          <Link to="/pesan" className="text-[12px] font-bold text-[#1D4196] hover:underline shrink-0">
            Semua pesan
          </Link>
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 max-w-[720px] mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#1D4196]" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-[14px] mb-4">{error}</p>
            <button type="button" onClick={() => load()} className="text-[#1D4196] font-bold text-[14px]">
              Coba lagi
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-[#7890AA]">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-[14px]">Belum ada pesan</p>
            <p className="text-[12px] mt-1">Mulai percakapan dengan {peerName}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    m.isMine
                      ? "bg-[#1D4196] text-white rounded-br-md"
                      : "bg-white border border-[#D8E2F0] text-[#172E4D] rounded-bl-md"
                  }`}
                >
                  {!m.isMine && (
                    <p className="text-[10px] font-bold opacity-70 mb-0.5">{m.senderName}</p>
                  )}
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${m.isMine ? "text-white/70" : "text-[#7890AA]"}`}>
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-white border-t border-[#D8E2F0] px-4 py-3">
        <div className="max-w-[720px] mx-auto flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Tulis pesan…"
            rows={1}
            className="flex-1 resize-none border-2 border-[#D8E2F0] rounded-xl px-4 py-2.5 text-[14px] text-[#172E4D] bg-[#F7F9FC] outline-none focus:border-[#1D4196] max-h-32"
          />
          <button
            type="button"
            disabled={!draft.trim() || sending}
            onClick={send}
            className="shrink-0 w-11 h-11 rounded-xl bg-[#1D4196] hover:bg-[#173577] disabled:bg-[#D8E2F0] disabled:text-[#7890AA] text-white flex items-center justify-center transition-colors"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
