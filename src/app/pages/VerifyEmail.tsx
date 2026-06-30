import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [verifiedRole, setVerifiedRole] = useState<"user" | "technician" | null>(null);
  const verificationTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Tautan verifikasi tidak valid.");
      return;
    }
    if (verificationTokenRef.current === token) return;

    verificationTokenRef.current = token;
    api.verifyEmail(token)
      .then(async ({ user }) => {
        const me = await refreshUser().catch(() => null);
        const role = user?.role ?? me?.role ?? null;
        if (role === "technician" || role === "user") {
          setVerifiedRole(role);
        }
        if (role === "technician") {
          navigate("/daftar-tukang?resume=1", { replace: true });
          return;
        }
        setStatus("success");
      })
      .catch((err) => {
        verificationTokenRef.current = null;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verifikasi gagal");
      });
  }, [token, refreshUser, navigate]);

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
            <p className="text-[14px] text-[#58708D] mb-6">
              Email Anda sudah diverifikasi. Silakan masuk untuk melanjutkan.
            </p>
            <Link
              to="/masuk"
              className="inline-block bg-[#1D4196] text-white font-bold text-[14px] px-6 py-3 rounded-2xl hover:bg-[#173577]"
            >
              Masuk sekarang
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
