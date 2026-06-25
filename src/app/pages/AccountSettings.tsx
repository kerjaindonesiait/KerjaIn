import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, AlertCircle, CheckCircle, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";

export default function AccountSettings() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [devVerifyLink, setDevVerifyLink] = useState<string | null>(null);

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
    if (user?.phone !== undefined) setPhone(user.phone ?? "");
  }, [user?.fullName, user?.phone]);

  if (!user) return null;

  const initials = (user.fullName ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    try {
      await api.updateProfile({
        fullName: fullName.trim(),
        ...(user.role === "user" ? { phone: phone.trim() } : {}),
      });
      await refreshUser();
      setProfileMsg("Profil diperbarui.");
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError("");
    setPwSuccess(false);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Gagal mengubah sandi");
    } finally {
      setPwLoading(false);
    }
  };

  const resendVerification = async () => {
    setVerifyLoading(true);
    setDevVerifyLink(null);
    try {
      const res = await api.resendVerification();
      if (res.devVerifyLink) setDevVerifyLink(res.devVerifyLink);
    } catch {
      // ignore
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-4" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="max-w-[560px] mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] mb-6">
          <ChevronLeft size={15} /> Beranda
        </Link>

        <div className="bg-white rounded-3xl border border-[#D8E2F0] shadow-lg overflow-hidden mb-6">
          <div className="bg-[#172E4D] px-6 py-8 flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full border-2 border-white object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1D4196] flex items-center justify-center text-white font-black text-[20px]">
                {initials}
              </div>
            )}
            <div>
              <h1 className="font-black text-[22px] text-white">{user.fullName ?? "Pengguna"}</h1>
              <p className="text-[13px] text-white/70">{user.email}</p>
              <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wide bg-white/10 text-white/90 px-2 py-0.5 rounded-full">
                {user.role === "technician" ? "Tukang" : "Pengguna"}
              </span>
            </div>
          </div>

          {!user.emailVerified && (
            <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[13px] font-bold text-amber-900 mb-1">Email belum terverifikasi</p>
              <p className="text-[12px] text-amber-800 mb-3">Periksa inbox Anda atau kirim ulang tautan verifikasi.</p>
              <button
                onClick={resendVerification}
                disabled={verifyLoading}
                className="text-[13px] font-bold text-[#1D4196] hover:underline disabled:opacity-50"
              >
                {verifyLoading ? "Mengirim…" : "Kirim ulang email verifikasi"}
              </button>
              {devVerifyLink && (
                <p className="mt-2 text-[11px] text-[#58708D] break-all">
                  Dev: <a href={devVerifyLink} className="text-[#1D4196] underline">{devVerifyLink}</a>
                </p>
              )}
            </div>
          )}

          <form onSubmit={saveProfile} className="p-6 border-b border-[#D8E2F0]">
            <h2 className="font-black text-[16px] text-[#172E4D] mb-4 flex items-center gap-2">
              <UserIcon size={18} /> Profil
            </h2>
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nama lengkap</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Email</label>
              <input value={user.email} disabled className="w-full border-2 border-[#e8e8e8] rounded-xl px-4 py-3 text-[14px] bg-[#f5f5f5] text-[#7890AA]" />
            </div>
            {user.role === "user" && (
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Nomor telepon</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] bg-[#F5F1E8] outline-none focus:border-[#2E5090]"
                />
                <p className="text-[11px] text-[#7a9a8f] mt-1.5">
                  Nomor yang sama boleh dipakai di akun tukang terpisah (email berbeda).
                </p>
              </div>
            )}
            {profileMsg && (
              <p className={`text-[13px] mb-3 ${profileMsg.includes("Gagal") ? "text-red-600" : "text-[#20bf6f]"}`}>{profileMsg}</p>
            )}
            <button
              type="submit"
              disabled={profileLoading}
              className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] px-5 py-2.5 rounded-xl disabled:opacity-50"
            >
              {profileLoading ? "Menyimpan…" : "Simpan profil"}
            </button>
          </form>

          <form onSubmit={changePassword} className="p-6">
            <h2 className="font-black text-[16px] text-[#172E4D] mb-4">Ubah kata sandi</h2>
            <p className="text-[12px] text-[#7890AA] mb-4">Hanya untuk akun yang mendaftar dengan email.</p>
            <div className="space-y-3 mb-4">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Kata sandi saat ini"
                className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
              />
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kata sandi baru (min. 6 karakter)"
                  className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 pr-11 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7890AA]">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {pwError && (
              <div className="flex items-center gap-2 text-red-600 text-[13px] mb-3">
                <AlertCircle size={14} /> {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 text-[#20bf6f] text-[13px] mb-3">
                <CheckCircle size={14} /> Kata sandi diperbarui.
              </div>
            )}
            <button
              type="submit"
              disabled={pwLoading || !currentPassword || newPassword.length < 6}
              className="border-2 border-[#1D4196] text-[#1D4196] font-bold text-[14px] px-5 py-2.5 rounded-xl hover:bg-[#EEF3FB] disabled:opacity-50"
            >
              {pwLoading ? "Menyimpan…" : "Ubah kata sandi"}
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {user.role === "technician" && (
            <Link to="/dasbor-tukang" className="flex-1 text-center border-2 border-[#D8E2F0] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] text-[#294566]">
              Dasbor Tukang
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex-1 bg-white border-2 border-red-200 text-red-600 font-bold text-[14px] py-3 rounded-2xl hover:bg-red-50"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
