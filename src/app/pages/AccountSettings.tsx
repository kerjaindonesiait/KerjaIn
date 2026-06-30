import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { defaultRouteForUser } from "../../lib/defaultRoute";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [devVerifyLink, setDevVerifyLink] = useState<string | null>(null);

  if (!user) return null;

  const initials = (user.fullName ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        <Link to={defaultRouteForUser(user)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] mb-6">
          <ChevronLeft size={15} /> {user.role === "technician" ? "Dasbor Tukang" : "Beranda"}
        </Link>

        <div className="bg-white rounded-3xl border border-[#D8E2F0] shadow-lg overflow-hidden mb-6">
          <div className="bg-[#172E4D] px-6 py-8">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#1D4196] flex items-center justify-center text-white font-black text-[20px]">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-[22px] text-white">{user.fullName ?? "Pengguna"}</h1>
                <p className="text-[13px] text-white/70">{user.email}</p>
                <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wide bg-white/10 text-white/90 px-2 py-0.5 rounded-full">
                  {user.role === "technician" ? "Tukang" : "Pengguna"}
                </span>
              </div>
            </div>
            <Link
              to="/akun/profil"
              className="mt-5 flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[13px] py-2.5 rounded-xl transition-colors"
            >
              <Eye size={16} /> Lihat profil
            </Link>
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

          <Link
            to="/akun/ubah-sandi"
            className="flex items-center justify-between px-6 py-4 border-t border-[#D8E2F0] hover:bg-[#F7F9FC] transition-colors"
          >
            <div>
              <p className="font-bold text-[14px] text-[#172E4D]">Ubah kata sandi</p>
              <p className="text-[12px] text-[#7890AA] mt-0.5">Hanya untuk akun email</p>
            </div>
            <ChevronRight size={18} className="text-[#7890AA] shrink-0" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {user.role === "user" && (
            <Link to="/ulasan-saya" className="flex-1 text-center border-2 border-[#D8E2F0] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] text-[#294566]">
              Ulasan saya
            </Link>
          )}
          {user.role === "technician" && (
            <Link to="/akun/ulasan" className="flex-1 text-center border-2 border-[#D8E2F0] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] text-[#294566]">
              Ulasan saya
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
