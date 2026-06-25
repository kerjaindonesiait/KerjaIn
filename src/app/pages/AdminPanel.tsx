import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Shield, CheckCircle, XCircle, Settings, Users, Briefcase,
  LogOut, Loader2, Eye, ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { AdminTechnician, AppConfig, AdminStats } from "../../types";

type Tab = "verifikasi" | "pengaturan";

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white border border-[#e8ddd0] rounded-2xl px-5 py-4 min-w-[140px]">
      <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider">{label}</p>
      <p className={`font-black text-[28px] mt-1 ${accent ?? "text-[#1a2d4a]"}`}>{value}</p>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
        checked ? "border-[#2E5090] bg-[#f0f7f4]" : "border-[#e8ddd0] bg-white"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-[#2E5090]/50"}`}
    >
      <div className="mt-0.5 shrink-0">
        {checked ? (
          <ToggleRight size={28} className="text-[#2E5090]" />
        ) : (
          <ToggleLeft size={28} className="text-[#b8d4c8]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[15px] text-[#1a2d4a]">{label}</p>
        <p className="text-[13px] text-[#3d6b5e] mt-1 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

function KtpImage({ url, label }: { url: string | null; label: string }) {
  const isRealUrl = url && (url.startsWith("http") || url.startsWith("data:"));
  return (
    <div>
      <p className="text-[11px] font-bold text-[#7a9a8f] uppercase tracking-wider mb-2">{label}</p>
      {isRealUrl ? (
        <a href={url} target="_blank" rel="noreferrer" className="block group">
          <img
            src={url}
            alt={label}
            className="w-full h-36 object-cover rounded-xl border border-[#e8ddd0] group-hover:opacity-90"
          />
          <span className="flex items-center gap-1 text-[11px] text-[#2E5090] font-bold mt-1">
            <Eye size={12} /> Buka ukuran penuh
          </span>
        </a>
      ) : (
        <div className="h-36 rounded-xl border-2 border-dashed border-[#c8dfd8] bg-[#F5F1E8] flex items-center justify-center text-[12px] text-[#7a9a8f] font-semibold px-4 text-center">
          {url ? `Placeholder: "${url}"` : "Belum diunggah"}
        </div>
      )}
    </div>
  );
}

function TechnicianReviewCard({
  tech,
  onVerify,
  busy,
}: {
  tech: AdminTechnician;
  onVerify: (userId: string, verified: boolean) => void;
  busy: string | null;
}) {
  const isBusy = busy === tech.userId;

  return (
    <div className="bg-white border border-[#e8ddd0] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f5eded] flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-[16px] text-[#1a2d4a]">{tech.fullName ?? "Tanpa nama"}</p>
            {tech.verified ? (
              <span className="text-[10px] font-bold bg-[#f0fdf4] text-[#20bf6f] border border-[#bbf7d0] px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> Terverifikasi
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                Menunggu
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#3d6b5e] mt-0.5">{tech.email}</p>
          <p className="text-[12px] text-[#7a9a8f] mt-1">
            {tech.area ?? "—"} · NIK {tech.nik ?? "—"} · {tech.phone ?? "—"}
          </p>
          {tech.keahlian.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tech.keahlian.map((k) => (
                <span key={k} className="text-[10px] font-semibold bg-[#F5F1E8] text-[#1a3d5c] px-2 py-0.5 rounded-lg">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {!tech.verified && tech.hasKtpSubmission && (
            <button
              onClick={() => onVerify(tech.userId, true)}
              disabled={isBusy}
              className="flex items-center gap-1.5 bg-[#20bf6f] hover:bg-[#16a34a] text-white font-bold text-[13px] px-4 py-2 rounded-xl disabled:opacity-60"
            >
              {isBusy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Setujui
            </button>
          )}
          {tech.verified && (
            <button
              onClick={() => onVerify(tech.userId, false)}
              disabled={isBusy}
              className="flex items-center gap-1.5 border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold text-[13px] px-4 py-2 rounded-xl disabled:opacity-60"
            >
              {isBusy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Cabut
            </button>
          )}
        </div>
      </div>
      {tech.hasKtpSubmission && (
        <div className="px-5 py-4 grid sm:grid-cols-2 gap-4">
          <KtpImage url={tech.ktpPhotoUrl} label="Foto KTP" />
          <KtpImage url={tech.selfiePhotoUrl} label="Selfie + KTP" />
        </div>
      )}
    </div>
  );
}

function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login gagal";
      if (msg === "Invalid credentials") {
        setError("Email atau kata sandi salah. Admin perlu daftar akun KerjaIn dulu (tombol di bawah).");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2d4a] flex items-center justify-center p-6" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#2E5090] flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <p className="font-black text-[22px] text-[#1a2d4a]">KerjaIn Admin</p>
            <p className="text-[13px] text-[#7a9a8f]">Masuk dengan akun admin</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#1a2d4a] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#2E5090]"
              placeholder="admin@kerjain.id"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#1a2d4a] mb-1.5">Kata sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 border-[#e8ddd0] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#2E5090]"
            />
          </div>
          {error && (
            <p className="text-[13px] text-red-600 font-semibold flex items-center gap-1.5">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold py-3.5 rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Masuk
          </button>
        </form>

        <p className="text-[11px] text-[#7a9a8f] mt-6 text-center leading-relaxed">
          Email Anda harus terdaftar di <code className="text-[#2E5090]">ADMIN_EMAILS</code> di server.
        </p>
        <p className="text-center text-[13px] text-[#3d6b5e] mt-4">
          Belum punya akun?{" "}
          <Link to="/daftar" className="text-[#2E5090] font-bold hover:underline">
            Daftar dengan email
          </Link>
        </p>
        <Link to="/" className="block text-center text-[13px] text-[#2E5090] font-bold mt-4 hover:underline">
          ← Kembali ke KerjaIn
        </Link>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { user, loading: authLoading, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("verifikasi");
  const [filter, setFilter] = useState<"pending" | "verified" | "unverified" | "all">("pending");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
  const [settings, setSettings] = useState<AppConfig | null>(null);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const checkAdmin = useCallback(async () => {
    if (!user) {
      setIsAdmin(null);
      return;
    }
    try {
      const { isAdmin: ok } = await api.adminMe();
      setIsAdmin(ok);
    } catch {
      setIsAdmin(false);
    }
  }, [user]);

  const loadDashboard = useCallback(async () => {
    const [{ stats: s }, { technicians: t }, { settings: cfg }] = await Promise.all([
      api.adminStats(),
      api.adminTechnicians(filter),
      api.adminGetSettings(),
    ]);
    setStats(s);
    setTechnicians(t);
    setSettings(cfg);
  }, [filter]);

  useEffect(() => {
    if (!authLoading) checkAdmin();
  }, [authLoading, checkAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingTechs(true);
    loadDashboard()
      .catch(() => showToast("Gagal memuat data admin"))
      .finally(() => setLoadingTechs(false));
  }, [isAdmin, loadDashboard]);

  const handleVerify = async (userId: string, verified: boolean) => {
    setVerifyBusy(userId);
    try {
      const { devDashboardLink } = await api.adminSetVerified(userId, verified);
      await loadDashboard();
      showToast(verified ? "Tukang disetujui" : "Verifikasi dicabut");
      if (devDashboardLink) console.log("Dev verify email link:", devDashboardLink);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal memperbarui");
    } finally {
      setVerifyBusy(null);
    }
  };

  const patchSetting = async (patch: Partial<AppConfig>) => {
    if (!settings) return;
    setSavingSettings(true);
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      const { settings: saved } = await api.adminUpdateSettings(patch);
      setSettings(saved);
      showToast("Pengaturan disimpan");
    } catch {
      setSettings(settings);
      showToast("Gagal menyimpan pengaturan");
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#2E5090]" />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6" style={{ fontFamily: "Manrope, sans-serif" }}>
        <div className="max-w-md text-center bg-white rounded-3xl p-8 border border-[#e8ddd0]">
          <AlertCircle size={40} className="text-amber-500 mx-auto mb-4" />
          <h1 className="font-black text-[22px] text-[#1a2d4a] mb-2">Akses ditolak</h1>
          <p className="text-[14px] text-[#3d6b5e] mb-6">
            Akun <span className="font-bold">{user.email}</span> tidak ada di daftar admin.
            Tambahkan email ini ke <code className="text-[#2E5090]">ADMIN_EMAILS</code> di <code>.env</code> backend.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={() => logout()} className="text-[#2E5090] font-bold text-[14px]">
              Ganti akun
            </button>
            <Link to="/" className="text-[13px] text-[#7a9a8f] hover:underline">Kembali ke beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  const FILTER_TABS: { id: typeof filter; label: string }[] = [
    { id: "pending", label: "Menunggu review" },
    { id: "verified", label: "Terverifikasi" },
    { id: "unverified", label: "Belum verifikasi" },
    { id: "all", label: "Semua" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1a2d4a] text-white text-[13px] font-bold px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <header className="bg-[#1a2d4a] text-white shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-[#F59E42]" />
            <div>
              <p className="font-black text-[18px]">KerjaIn Admin</p>
              <p className="text-[11px] text-white/50">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-white/70 hover:text-white text-[13px] font-bold"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>

      {stats && (
        <div className="border-b border-[#e8ddd0] bg-white/80">
          <div className="max-w-6xl mx-auto px-6 py-4 flex gap-4 overflow-x-auto">
            <StatCard label="Menunggu KTP" value={stats.pendingVerification} accent="text-amber-600" />
            <StatCard label="Tukang verified" value={stats.verifiedTechnicians} accent="text-[#20bf6f]" />
            <StatCard label="Total tukang" value={stats.totalTechnicians} />
            <StatCard label="Lowongan open" value={stats.openJobs} />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full px-6 py-6 flex-1">
        <div className="flex gap-2 mb-6">
          {([
            { id: "verifikasi" as const, label: "Verifikasi KTP", icon: <Users size={16} /> },
            { id: "pengaturan" as const, label: "Pengaturan", icon: <Settings size={16} /> },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all ${
                tab === t.id
                  ? "bg-[#2E5090] text-white"
                  : "bg-white border border-[#e8ddd0] text-[#3d6b5e] hover:border-[#2E5090]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "verifikasi" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                    filter === f.id
                      ? "bg-[#1a2d4a] text-white"
                      : "bg-white border border-[#e8ddd0] text-[#3d6b5e]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loadingTechs ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[#2E5090]" />
              </div>
            ) : technicians.length === 0 ? (
              <div className="bg-white border border-[#e8ddd0] rounded-2xl p-12 text-center">
                <Briefcase size={32} className="text-[#b8d4c8] mx-auto mb-3" />
                <p className="font-bold text-[#1a2d4a]">Tidak ada tukang di filter ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {technicians.map((tech) => (
                  <TechnicianReviewCard
                    key={tech.userId}
                    tech={tech}
                    onVerify={handleVerify}
                    busy={verifyBusy}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "pengaturan" && settings && (
          <div className="max-w-xl space-y-4">
            <Toggle
              label="Wajib verifikasi untuk mengajukan penawaran"
              description="Jika aktif, tukang yang belum disetujui admin tidak bisa kirim penawaran ke lowongan."
              checked={settings.requireVerifiedToQuote}
              onChange={(v) => patchSetting({ requireVerifiedToQuote: v })}
              disabled={savingSettings}
            />
            <Toggle
              label="Mode pemeliharaan"
              description="Tandai platform dalam mode maintenance (flag untuk keperluan operasional — dapat diperluas nanti)."
              checked={settings.maintenanceMode}
              onChange={(v) => patchSetting({ maintenanceMode: v })}
              disabled={savingSettings}
            />
            {savingSettings && (
              <p className="text-[12px] text-[#7a9a8f] flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Menyimpan…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
