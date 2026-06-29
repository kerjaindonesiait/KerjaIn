import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";

export default function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah sandi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-8 px-4" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="max-w-[560px] mx-auto">
        <Link
          to="/akun"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] mb-6"
        >
          <ChevronLeft size={15} /> Kembali ke akun
        </Link>

        <div className="bg-white rounded-3xl border border-[#D8E2F0] shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[#D8E2F0]">
            <h1 className="font-black text-[22px] text-[#172E4D] mb-1 flex items-center gap-2">
              <Lock size={20} className="text-[#1D4196]" /> Ubah kata sandi
            </h1>
            <p className="text-[13px] text-[#58708D]">
              Hanya untuk akun yang mendaftar dengan email.
            </p>
          </div>

          <form onSubmit={submit} className="p-6">
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Kata sandi saat ini</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Kata sandi baru</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 pr-11 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7890AA]"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-[13px] mb-3">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-[#20bf6f] text-[13px] mb-3">
                <CheckCircle size={14} /> Kata sandi diperbarui.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !currentPassword || newPassword.length < 6}
              className="w-full bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[14px] py-3 rounded-xl disabled:opacity-50 transition-colors"
            >
              {loading ? "Menyimpan…" : "Simpan kata sandi baru"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
