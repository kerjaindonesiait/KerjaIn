import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeft, Loader2, MessageCircle, Send } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { ChatMessage, ConversationPreview } from "../../types";

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function chatUrl(jobId: string, technicianId: string) {
  return `/pesan/${jobId}?technicianId=${encodeURIComponent(technicianId)}`;
}

function ConversationList({
  conversations,
  loading,
  backTo,
}: {
  conversations: ConversationPreview[];
  loading: boolean;
  backTo: string;
}) {
  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-white border-b border-[#D8E2F0] sticky top-0 z-10">
        <div className="max-w-[640px] mx-auto flex items-center gap-3 px-4 py-4">
          <Link to={backTo} className="text-[#58708D] hover:text-[#1D4196]">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="font-black text-[18px] text-[#172E4D]">Pesan</h1>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#58708D]">
            <Loader2 size={18} className="animate-spin" /> Memuat percakapan…
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 text-[#7890AA]">
            <MessageCircle size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-bold text-[15px] text-[#58708D]">Belum ada percakapan</p>
            <p className="text-[13px] mt-1">Kirim pesan dari penawaran atau pekerjaan aktif.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((c) => (
              <Link
                key={`${c.jobId}-${c.technicianId}`}
                to={chatUrl(c.jobId, c.technicianId)}
                className="bg-white border border-[#D8E2F0] rounded-2xl p-4 hover:border-[#1D4196] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-[14px] text-[#172E4D] line-clamp-1">{c.jobTitle}</p>
                  {c.lastMessageAt && (
                    <span className="text-[10px] text-[#7890AA] shrink-0">{formatTime(c.lastMessageAt)}</span>
                  )}
                </div>
                <p className="text-[12px] font-semibold text-[#1D4196] mb-1">{c.otherPartyName}</p>
                <p className="text-[13px] text-[#58708D] line-clamp-2">
                  {c.lastMessage
                    ? `${c.isLastFromMe ? "Anda: " : ""}${c.lastMessage}`
                    : "Belum ada pesan — mulai percakapan"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatRoom({
  jobId,
  technicianId,
  backTo,
}: {
  jobId: string;
  technicianId: string;
  backTo: string;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [otherName, setOtherName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getJobMessages(jobId, user?.role === "user" ? technicianId : undefined);
      setMessages(data.messages);
      setJobTitle(data.job.title);
      const other = user?.id === data.owner.id ? data.technician : data.owner;
      setOtherName(other.name);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesan");
    } finally {
      setLoading(false);
    }
  }, [jobId, technicianId, user?.role, user?.id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      const { message } = await api.sendJobMessage(
        jobId,
        text,
        user?.role === "user" ? technicianId : undefined,
      );
      setMessages((prev) => [...prev, message]);
    } catch (e) {
      setDraft(text);
      setError(e instanceof Error ? e.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-white border-b border-[#D8E2F0] shrink-0">
        <div className="max-w-[640px] mx-auto flex items-center gap-3 px-4 py-4">
          <Link to={backTo} className="text-[#58708D] hover:text-[#1D4196]">
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-black text-[15px] text-[#172E4D] truncate">{otherName || "…"}</p>
            <p className="text-[11px] text-[#7890AA] truncate">{jobTitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-[640px] mx-auto w-full px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16 text-[#58708D]">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : error && messages.length === 0 ? (
          <p className="text-center text-red-600 text-[14px] py-12">{error}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-[#7890AA] text-[14px] py-12">
            Belum ada pesan. Sapa {otherName} untuk koordinasi pekerjaan.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => {
              const mine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      mine
                        ? "bg-[#1D4196] text-white rounded-br-md"
                        : "bg-white border border-[#D8E2F0] text-[#172E4D] rounded-bl-md"
                    }`}
                  >
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-[#7890AA]"}`}>
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-white border-t border-[#D8E2F0] p-4">
        <div className="max-w-[640px] mx-auto flex gap-2">
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
            className="flex-1 border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] resize-none outline-none focus:border-[#1D4196] max-h-32"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim() || sending}
            className="shrink-0 w-12 h-12 rounded-xl bg-[#1D4196] hover:bg-[#173577] disabled:bg-[#D8E2F0] text-white flex items-center justify-center transition-colors"
            aria-label="Kirim"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        {error && messages.length > 0 && (
          <p className="text-[12px] text-red-600 text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  const { jobId } = useParams<{ jobId?: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const technicianId = searchParams.get("technicianId") ?? "";

  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loadingList, setLoadingList] = useState(!jobId);

  const backTo = user?.role === "technician" ? "/dasbor-tukang" : "/pekerjaan-saya";

  useEffect(() => {
    if (jobId) return;
    setLoadingList(true);
    api
      .getConversations()
      .then(({ conversations: list }) => setConversations(list))
      .catch(() => setConversations([]))
      .finally(() => setLoadingList(false));
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    if (user?.role === "user" && !technicianId) {
      navigate("/pesan", { replace: true });
    }
  }, [jobId, technicianId, user?.role, navigate]);

  if (!jobId) {
    return <ConversationList conversations={conversations} loading={loadingList} backTo={backTo} />;
  }

  if (user?.role === "user" && !technicianId) {
    return null;
  }

  return (
    <ChatRoom
      jobId={jobId}
      technicianId={user?.role === "technician" ? user.id : technicianId}
      backTo="/pesan"
    />
  );
}
