import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, CheckCircle, Loader2, User as UserIcon } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { KEAHLIAN } from "../../lib/keahlian";

export default function AccountProfileView() {
  const { user, refreshUser } = useAuth();
  const isTechnician = user?.role === "technician";

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [keahlian, setKeahlian] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [techProfileLoading, setTechProfileLoading] = useState(isTechnician);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

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

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-4" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="max-w-[560px] mx-auto">
        <Link
          to="/akun"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] mb-6"
        >
          <ChevronLeft size={15} /> Kembali ke pengaturan
        </Link>

        <div className="bg-white rounded-3xl border border-[#D8E2F0] shadow-lg overflow-hidden">
          {techProfileLoading && isTechnician ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[#58708D]">
              <Loader2 className="animate-spin" size={20} /> Memuat profil...
            </div>
          ) : (
            <form onSubmit={saveProfile} className="p-6">
              <h1 className="font-black text-[16px] text-[#172E4D] mb-4 flex items-center gap-2">
                <UserIcon size={18} /> Profil
              </h1>

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
                <input
                  value={user.email}
                  disabled
                  className="w-full border-2 border-[#e8e8e8] rounded-xl px-4 py-3 text-[14px] bg-[#f5f5f5] text-[#7890AA]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nomor telepon</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
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
                            className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
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
                      placeholder="Ceritakan pengalaman dan layanan Anda..."
                      className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196] resize-none"
                    />
                  </div>
                </>
              )}

              {profileMsg && (
                <p className={`text-[13px] mb-3 ${profileMsg.includes("Gagal") ? "text-red-600" : "text-[#20bf6f]"}`}>
                  {profileMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] px-5 py-2.5 rounded-xl disabled:opacity-50"
              >
                {profileLoading ? "Menyimpan…" : "Simpan profil"}
              </button>

              {isTechnician && (
                <Link
                  to={`/tukang/${user.id}`}
                  className="mt-4 block text-center text-[13px] font-semibold text-[#1D4196] hover:underline"
                >
                  Lihat halaman publik →
                </Link>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
