import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, User as UserIcon, CheckCircle, Eye } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { defaultRouteForUser } from "../../lib/defaultRoute";
import { KEAHLIAN } from "../../lib/keahlian";

export default function AccountSettings() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [keahlian, setKeahlian] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [techProfileLoading, setTechProfileLoading] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [devVerifyLink, setDevVerifyLink] = useState<string | null>(null);

  const isTechnician = user?.role === "technician";

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
    if (user?.role === "user") setPhone(user.phone ?? "");
  }, [user?.fullName, user?.phone, user?.role]);

  useEffect(() => {
    if (!isTechnician) return;
    setTechProfileLoading(true);
    api
      .getTechnicianProfile()
      .then(({ profile }) => {
        if (profile) {
          setPhone(profile.phone ?? "");
          setKeahlian(profile.keahlian ?? []);
          setBio(profile.bio ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setTechProfileLoading(false));
  }, [isTechnician]);

  if (!user) return null;

  const initials = (user.fullName ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const toggleKeahlian = (id: string) => {
    setKeahlian((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.replace(/\D/g, "");

      if (isTechnician) {
        await api.updateProfile({ fullName: trimmedName });
        await api.patchTechnicianProfile({
          phone: trimmedPhone,
          keahlian,
          bio: bio.trim(),
        });
      } else {
        await api.updateProfile({
          fullName: trimmedName,
          phone: trimmedPhone || undefined,
        });
      }

      await refreshUser();
      setProfileMsg("Profil diperbarui.");
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setProfileLoading(false);
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
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nomor telepon</label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="08xxxxxxxxxx"
                disabled={isTechnician && techProfileLoading}
                className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196] disabled:opacity-50"
              />
            </div>

            {isTechnician && (
              <>
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-[#172E4D] mb-2">Keahlian</label>
                  <p className="text-[12px] text-[#7890AA] mb-3">Pilih layanan yang bisa Anda kerjakan.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {KEAHLIAN.map((k) => {
                      const selected = keahlian.includes(k.id);
                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => toggleKeahlian(k.id)}
                          disabled={techProfileLoading}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${
                            selected
                              ? "border-[#172E4D] bg-[#172E4D] text-white"
                              : "border-[#D8E2F0] bg-white hover:border-[#172E4D]/40"
                          }`}
                        >
                          <span className="text-[18px] shrink-0">{k.emoji}</span>
                          <span className={`font-bold text-[11px] leading-snug flex-1 ${selected ? "text-white" : "text-[#172E4D]"}`}>
                            {k.label}
                          </span>
                          {selected && <CheckCircle size={12} className="text-[#FD6665] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">
                    Tentang <span className="font-normal text-[#7890AA]">(opsional)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    disabled={techProfileLoading}
                    placeholder="Ceritakan pengalaman dan layanan Anda..."
                    className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196] resize-none disabled:opacity-50"
                  />
                </div>
              </>
            )}

            {profileMsg && (
              <p className={`text-[13px] mb-3 ${profileMsg.includes("Gagal") ? "text-red-600" : "text-[#20bf6f]"}`}>{profileMsg}</p>
            )}
            <button
              type="submit"
              disabled={profileLoading || (isTechnician && techProfileLoading)}
              className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] px-5 py-2.5 rounded-xl disabled:opacity-50"
            >
              {profileLoading ? "Menyimpan…" : "Simpan profil"}
            </button>
          </form>

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
