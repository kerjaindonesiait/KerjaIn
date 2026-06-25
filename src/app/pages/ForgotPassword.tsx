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
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="flex items-center justify-between px-6 py-4 max-w-[440px] mx-auto w-full">
        <Link to="/masuk" className="flex items-center gap-1 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196]">
          <ChevronLeft size={15} /> Kembali
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#D8E2F0] shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#EEF3FB] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#1D4196]" />
              </div>
              <h1 className="font-black text-[22px] text-[#172E4D] mb-2">Cek email Anda</h1>
              <p className="text-[14px] text-[#58708D] mb-6">
                Jika <span className="font-bold">{email}</span> terdaftar, kami mengirim tautan atur ulang kata sandi.
              </p>
              {devLink && (
                <div className="text-left bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl p-4 mb-4">
                  <p className="text-[11px] font-bold text-[#7890AA] uppercase mb-2">Dev link</p>
                  <a href={devLink} className="text-[12px] text-[#1D4196] break-all hover:underline">{devLink}</a>
                </div>
              )}
              <Link to="/masuk" className="inline-block bg-[#1D4196] text-white font-bold text-[14px] px-6 py-3 rounded-2xl hover:bg-[#173577]">
                Kembali ke masuk
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-black text-[24px] text-[#172E4D] mb-2">Lupa kata sandi?</h1>
              <p className="text-[14px] text-[#58708D] mb-6">Masukkan email akun Anda. Kami kirim tautan atur ulang sandi.</p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] bg-[#F7F9FC] outline-none focus:border-[#1D4196] focus:bg-white"
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
                  className="w-full bg-[#1D4196] hover:bg-[#173577] disabled:bg-[#D8E2F0] disabled:text-[#7890AA] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors"
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
