import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "../../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.forgotPassword(email);
      setSent(true);
      if (res.devResetLink) setDevLink(res.devResetLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="flex items-center justify-between px-6 py-4 max-w-[440px] mx-auto w-full">
        <Link to="/masuk" className="flex items-center gap-1 text-[13px] font-semibold text-[#3d6b5e] hover:text-[#2E5090]">
          <ChevronLeft size={15} /> Kembali
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#c8dfd8] shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#f0f7f4] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#2E5090]" />
              </div>
              <h1 className="font-black text-[22px] text-[#1a2d4a] mb-2">Cek email Anda</h1>
              <p className="text-[14px] text-[#3d6b5e] mb-6">
                Jika <span className="font-bold">{email}</span> terdaftar, kami mengirim tautan atur ulang kata sandi.
              </p>
              {devLink && (
                <div className="text-left bg-[#F5F1E8] border border-[#c8dfd8] rounded-xl p-4 mb-4">
                  <p className="text-[11px] font-bold text-[#7a9a8f] uppercase mb-2">Dev link</p>
                  <a href={devLink} className="text-[12px] text-[#2E5090] break-all hover:underline">{devLink}</a>
                </div>
              )}
              <Link to="/masuk" className="inline-block bg-[#2E5090] text-white font-bold text-[14px] px-6 py-3 rounded-2xl hover:bg-[#1e3d7a]">
                Kembali ke masuk
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-black text-[24px] text-[#1a2d4a] mb-2">Lupa kata sandi?</h1>
              <p className="text-[14px] text-[#3d6b5e] mb-6">Masukkan email akun Anda. Kami kirim tautan atur ulang sandi.</p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] bg-[#F5F1E8] outline-none focus:border-[#2E5090] focus:bg-white"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !email.includes("@")}
                  className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] disabled:bg-[#c8dfd8] disabled:text-[#7a9a8f] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors"
                >
                  {loading ? "Mengirim…" : "Kirim tautan"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
