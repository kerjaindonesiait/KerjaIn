import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { CheckCircle, Loader2, Settings, Users, XCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { AdminTechnician, AppSettings } from "../../types";

type Tab = "pending" | "verified" | "settings";

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [stats, setStats] = useState({ pendingVerification: 0, verifiedTechnicians: 0, totalTechnicians: 0, openJobs: 0 });
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    api
      .adminMe()
      .then(({ isAdmin: ok }) => setIsAdmin(ok))
      .catch(() => setIsAdmin(false));
  }, [user, authLoading]);

  const load = () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    const tasks: Promise<void>[] = [
      api.adminStats().then(({ stats: s }) => setStats(s)),
    ];
    if (tab === "settings") {
      tasks.push(api.adminGetSettings().then(({ settings: s }) => setSettings(s)));
    } else {
      const filter = tab === "pending" ? "pending" : "verified";
      tasks.push(api.adminTechnicians(filter).then(({ technicians: list }) => setTechnicians(list)));
    }
    Promise.all(tasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, tab]);

  const handleVerify = async (userId: string, verified: boolean) => {
    setActionId(userId);
    try {
      await api.adminVerifyTechnician(userId, verified);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui verifikasi");
    } finally {
      setActionId(null);
    }
  };

  const toggleSetting = async (key: keyof AppSettings) => {
    if (!settings) return;
    const next = { ...settings, [key]: !settings[key] };
    try {
      const { settings: updated } = await api.adminUpdateSettings(next);
      setSettings(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan pengaturan");
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <Loader2 className="animate-spin text-[#58708D]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/masuk" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const TABS: { id: Tab; label: string }[] = [
    { id: "pending", label: "Menunggu verifikasi" },
    { id: "verified", label: "Terverifikasi" },
    { id: "settings", label: "Pengaturan" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-[#172E4D] text-white">
        <div className="max-w-[960px] mx-auto px-6 py-6">
          <Link to="/" className="text-[12px] text-white/60 hover:text-white">← Beranda</Link>
          <h1 className="font-black text-[24px] mt-2">Admin KerjaIn</h1>
          <p className="text-[13px] text-white/70 mt-1">Masuk sebagai {user.email}</p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Menunggu KTP", value: stats.pendingVerification, icon: Users },
            { label: "Tukang verified", value: stats.verifiedTechnicians, icon: CheckCircle },
            { label: "Total tukang", value: stats.totalTechnicians, icon: Users },
            { label: "Job terbuka", value: stats.openJobs, icon: Settings },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-[#D8E2F0] p-4">
              <Icon size={18} className="text-[#1D4196] mb-2" />
              <p className="font-black text-[22px] text-[#172E4D]">{value}</p>
              <p className="text-[11px] text-[#7890AA] font-semibold">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4 border-b border-[#D8E2F0]">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-[13px] font-bold border-b-2 -mb-px transition-colors ${
                tab === t.id ? "border-[#1D4196] text-[#1D4196]" : "border-transparent text-[#7890AA]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-[14px] mb-4">{error}</p>}

        {loading ? (
          <div className="flex items-center gap-2 text-[#58708D] py-12">
            <Loader2 size={18} className="animate-spin" /> Memuat...
          </div>
        ) : tab === "settings" && settings ? (
          <div className="bg-white rounded-2xl border border-[#D8E2F0] p-5 space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="font-bold text-[14px] text-[#172E4D]">Wajib verified untuk quote</p>
                <p className="text-[12px] text-[#7890AA]">Tukang harus diverifikasi sebelum mengirim penawaran</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireVerifiedToQuote}
                onChange={() => toggleSetting("requireVerifiedToQuote")}
                className="w-5 h-5 accent-[#1D4196]"
              />
            </label>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="font-bold text-[14px] text-[#172E4D]">Mode pemeliharaan</p>
                <p className="text-[12px] text-[#7890AA]">Tampilkan pesan maintenance di aplikasi</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => toggleSetting("maintenanceMode")}
                className="w-5 h-5 accent-[#1D4196]"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {technicians.length === 0 ? (
              <p className="text-[#7890AA] text-[14px] py-8 text-center">Tidak ada data.</p>
            ) : (
              technicians.map((t) => (
                <div key={t.userId} className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-[15px] text-[#172E4D]">{t.fullName ?? t.email}</p>
                      <p className="text-[12px] text-[#7890AA]">{t.email}</p>
                      {t.area && <p className="text-[12px] text-[#58708D] mt-1">{t.area}</p>}
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      t.verified ? "bg-[#f0fdf4] text-[#20bf6f] border-[#bbf7d0]" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {t.verified ? "Verified" : "Belum verified"}
                    </span>
                  </div>
                  {(t.ktpPhotoUrl || t.selfiePhotoUrl) && (
                    <div className="flex gap-3 mb-3">
                      {t.ktpPhotoUrl && (
                        <a href={t.ktpPhotoUrl} target="_blank" rel="noreferrer" className="text-[12px] text-[#1D4196] font-bold underline">
                          Lihat KTP
                        </a>
                      )}
                      {t.selfiePhotoUrl && (
                        <a href={t.selfiePhotoUrl} target="_blank" rel="noreferrer" className="text-[12px] text-[#1D4196] font-bold underline">
                          Lihat selfie
                        </a>
                      )}
                    </div>
                  )}
                  {tab === "pending" && t.hasKtpSubmission && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionId === t.userId}
                        onClick={() => handleVerify(t.userId, true)}
                        className="flex items-center gap-1.5 bg-[#20bf6f] text-white font-bold text-[13px] px-4 py-2 rounded-xl disabled:opacity-50"
                      >
                        {actionId === t.userId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Setujui
                      </button>
                      <Link
                        to={`/tukang/${t.userId}`}
                        className="text-[13px] font-bold text-[#1D4196] border border-[#D8E2F0] px-4 py-2 rounded-xl hover:bg-[#F7F9FC]"
                      >
                        Lihat profil
                      </Link>
                    </div>
                  )}
                  {tab === "verified" && (
                    <button
                      type="button"
                      disabled={actionId === t.userId}
                      onClick={() => handleVerify(t.userId, false)}
                      className="flex items-center gap-1.5 text-red-600 border border-red-200 font-bold text-[13px] px-4 py-2 rounded-xl disabled:opacity-50"
                    >
                      <XCircle size={14} /> Cabut verifikasi
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
