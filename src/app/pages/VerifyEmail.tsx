import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { refreshUser, user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Tautan verifikasi tidak valid.");
      return;
    }
    api.verifyEmail(token)
      .then(async () => {
        setStatus("success");
        await refreshUser();
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verifikasi gagal");
      });
  }, [token, refreshUser]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#D8E2F0] shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="text-[#1D4196] animate-spin mx-auto mb-4" />
            <p className="font-semibold text-[#172E4D]">Memverifikasi email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle size={48} className="text-[#1D4196] mx-auto mb-4" />
            <h1 className="font-black text-[22px] text-[#172E4D] mb-2">Email terverifikasi!</h1>
            <p className="text-[14px] text-[#58708D] mb-6">Akun Anda siap digunakan.</p>
            <Link
              to={user?.role === "technician" ? "/dasbor-tukang" : "/"}
              className="inline-block bg-[#1D4196] text-white font-bold text-[14px] px-6 py-3 rounded-2xl hover:bg-[#173577]"
            >
              Lanjutkan
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="font-black text-[22px] text-[#172E4D] mb-2">Verifikasi gagal</h1>
            <p className="text-[14px] text-[#58708D] mb-6">{message}</p>
            <Link to="/akun" className="text-[#1D4196] font-bold hover:underline">Buka pengaturan akun</Link>
          </>
        )}
      </div>
    </div>
  );
}
