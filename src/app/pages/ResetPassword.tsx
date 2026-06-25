import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const valid = password.length >= 6 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !token) return;
    setLoading(true);
    setError("");
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/masuk"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengatur ulang sandi");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6" style={{ fontFamily: "Manrope, sans-serif" }}>
        <div className="bg-white rounded-3xl border border-[#D8E2F0] p-8 max-w-md text-center">
          <p className="text-[#172E4D] font-semibold mb-4">Tautan tidak valid.</p>
          <Link to="/lupa-sandi" className="text-[#1D4196] font-bold hover:underline">Minta tautan baru</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="px-6 py-4 max-w-[440px] mx-auto w-full">
        <Link to="/masuk" className="flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196]">
          <ChevronLeft size={15} /> Kembali
        </Link>
      </div>
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#D8E2F0] shadow-lg p-8">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle size={40} className="text-[#1D4196] mx-auto mb-3" />
              <h1 className="font-black text-[22px] text-[#172E4D]">Kata sandi diperbarui!</h1>
              <p className="text-[14px] text-[#58708D] mt-2">Mengalihkan ke halaman masuk…</p>
            </div>
          ) : (
            <>
              <h1 className="font-black text-[24px] text-[#172E4D] mb-2">Atur ulang kata sandi</h1>
              <p className="text-[14px] text-[#58708D] mb-6">Buat kata sandi baru untuk akun Anda.</p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Kata sandi baru</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 pr-11 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7890AA]">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Konfirmasi kata sandi</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196]"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!valid || loading}
                  className="w-full bg-[#1D4196] hover:bg-[#173577] disabled:bg-[#D8E2F0] text-white font-bold text-[15px] py-3.5 rounded-2xl"
                >
                  {loading ? "Menyimpan…" : "Simpan kata sandi"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
