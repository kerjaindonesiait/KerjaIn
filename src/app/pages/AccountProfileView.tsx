import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, Loader2, MapPin, CheckCircle, Star } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { keahlianLabel } from "../../lib/keahlian";
import type { TechnicianPublic } from "../../types";

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

export default function AccountProfileView() {
  const { user } = useAuth();
  const [tech, setTech] = useState<TechnicianPublic | null>(null);
  const [loading, setLoading] = useState(user?.role === "technician");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "technician") return;
    setLoading(true);
    api
      .getTechnicianPublic(user.id)
      .then(({ technician }) => setTech(technician))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const initials = (user.fullName ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (user.role === "user") {
    return (
      <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
        <div className="bg-white border-b border-[#D8E2F0]">
          <div className="max-w-[560px] mx-auto px-6 py-5">
            <Link to="/akun" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196]">
              <ChevronLeft size={16} /> Kembali ke pengaturan
            </Link>
            <h1 className="font-black text-[22px] text-[#172E4D] mt-3">Profil saya</h1>
            <p className="text-[13px] text-[#58708D] mt-1">Informasi dasar akun Anda.</p>
          </div>
        </div>

        <div className="max-w-[560px] mx-auto px-6 py-6 space-y-4">
          <section className="bg-white rounded-2xl border border-[#D8E2F0] p-5 flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#D8E2F0]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1D4196] text-white font-black text-xl flex items-center justify-center">
                {initials}
              </div>
            )}
            <div>
              <p className="font-black text-[18px] text-[#172E4D]">{user.fullName ?? "Pengguna"}</p>
              <p className="text-[13px] text-[#58708D]">{user.email}</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#D8E2F0] p-5 space-y-3">
            <div>
              <p className="text-[12px] font-bold text-[#7890AA] uppercase tracking-wide mb-1">Nomor telepon</p>
              <p className="text-[14px] text-[#172E4D]">{user.phone || "Belum diisi"}</p>
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#7890AA] uppercase tracking-wide mb-1">Email</p>
              <p className="text-[14px] text-[#172E4D]">{user.email}</p>
            </div>
          </section>

          <Link
            to="/akun"
            className="block text-center bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] py-3 rounded-2xl"
          >
            Edit profil
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] text-[#58708D] gap-2">
        <Loader2 className="animate-spin" size={20} /> Memuat profil...
      </div>
    );
  }

  if (error || !tech) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] px-6">
        <p className="text-red-600 mb-4">{error ?? "Profil tidak ditemukan"}</p>
        <Link to="/akun" className="text-[#1D4196] font-bold">← Kembali</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-white border-b border-[#D8E2F0]">
        <div className="max-w-[720px] mx-auto px-6 py-5">
          <Link to="/akun" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196]">
            <ChevronLeft size={16} /> Kembali ke pengaturan
          </Link>
          <h1 className="font-black text-[22px] text-[#172E4D] mt-3">Profil publik</h1>
          <p className="text-[13px] text-[#58708D] mt-1">Ini yang dilihat pelanggan saat melihat profil Anda.</p>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-[#D8E2F0] p-6 mb-6">
          <div className="flex items-start gap-5">
            {tech.avatarUrl ? (
              <img src={tech.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-[#D8E2F0]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1D4196] text-white font-black text-2xl flex items-center justify-center">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-[22px] text-[#172E4D]">{tech.name}</h2>
                {tech.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#20bf6f] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} /> Terverifikasi
                  </span>
                )}
              </div>
              {tech.area && (
                <p className="flex items-center gap-1 text-[14px] text-[#58708D] mt-1">
                  <MapPin size={14} className="text-[#1D4196]" /> {tech.area}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <StarDisplay rating={tech.rating} />
                <span className="text-[13px] text-[#58708D]">
                  {tech.rating.toFixed(1)} · {tech.reviewCount} ulasan · {tech.completedJobs} selesai
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <section className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
            <h3 className="font-bold text-[14px] text-[#172E4D] mb-2">Tentang</h3>
            <p className="text-[14px] text-[#58708D] leading-relaxed">
              {tech.bio || "Belum ada deskripsi."}
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-[#D8E2F0] p-5">
            <h3 className="font-bold text-[14px] text-[#172E4D] mb-3">Keahlian</h3>
            {tech.keahlian.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {tech.keahlian.map((k) => (
                  <span key={k} className="text-[12px] font-semibold bg-[#EEF3FB] text-[#1D4196] px-3 py-1 rounded-full">
                    {keahlianLabel(k)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#7890AA] mb-3">Belum ada keahlian dipilih.</p>
            )}
            {tech.pengalaman && <p className="text-[13px] text-[#58708D]">Pengalaman: {tech.pengalaman}</p>}
            {tech.tarif && <p className="text-[13px] text-[#58708D] mt-1">Tarif: {tech.tarif}</p>}
          </section>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/akun"
            className="flex-1 text-center bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] py-3 rounded-2xl"
          >
            Edit profil
          </Link>
          <Link
            to={`/tukang/${user.id}`}
            className="flex-1 text-center border-2 border-[#D8E2F0] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] text-[#294566]"
          >
            Buka halaman publik
          </Link>
        </div>
      </div>
    </div>
  );
}
