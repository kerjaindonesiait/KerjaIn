import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, ArrowRight, HardHat, User } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { BrandLogo } from "../components/BrandLogo";
import type { User as AppUser } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = "masuk" | "daftar";
type OAuthProvider = "google" | "facebook";
type Screen = "role" | "main" | "loading" | "success" | "email-form";

// ─── Brand SVG logos ──────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// ─── Social Button ────────────────────────────────────────────────────────────

function SocialButton({
  provider,
  onClick,
  loading,
}: {
  provider: OAuthProvider;
  onClick: () => void;
  loading: boolean;
}) {
  const config = {
    google: {
      label: "Lanjutkan dengan Google",
      bg: "bg-white hover:bg-gray-50",
      border: "border border-[#D8E2F0]",
      text: "text-[#172E4D]",
      logo: <GoogleLogo />,
    },
    facebook: {
      label: "Lanjutkan dengan Facebook",
      bg: "bg-[#1877F2] hover:bg-[#1565d8]",
      border: "",
      text: "text-white",
      logo: <FacebookLogo />,
    },
  }[provider];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-[14px] transition-all ${config.bg} ${config.border} ${config.text} ${loading ? "opacity-60 cursor-not-allowed" : "shadow-sm hover:shadow-md active:scale-[0.98]"}`}
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center">{config.logo}</span>
      {config.label}
    </button>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingScreen({ provider }: { provider: OAuthProvider }) {
  const labels = {
    google: "Google",
    facebook: "Facebook",
  };
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#EEF3FB]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#1D4196] border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          {provider === "google" && <GoogleLogo />}
          {provider === "facebook" && <FacebookLogo />}
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-[16px] text-[#172E4D]">Menghubungkan ke {labels[provider]}…</p>
        <p className="text-[13px] text-[#58708D] mt-1">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  mode,
  provider,
  email,
  name,
  devVerifyLink,
}: {
  mode: AuthMode;
  provider: OAuthProvider | "email" | null;
  email: string;
  name: string;
  devVerifyLink?: string | null;
}) {
  const navigate = useNavigate();

  const displayName = name || email.split("@")[0] || "Pengguna";

  return (
    <div className="flex flex-col items-center text-center py-8 gap-5">
      <div className="w-20 h-20 rounded-full bg-[#EEF3FB] border-4 border-[#FD6665] flex items-center justify-center">
        <CheckCircle size={40} className="text-[#1D4196]" fill="#1D4196" />
      </div>
      <div>
        <h2 className="font-black text-[26px] text-[#172E4D] mb-1">
          {mode === "daftar" ? "Akun berhasil dibuat!" : "Selamat datang kembali!"}
        </h2>
        <p className="text-[#58708D] text-[15px]">
          Halo, <span className="font-bold text-[#1D4196]">{displayName}</span> 👋
        </p>
      </div>

      {mode === "daftar" && provider === "email" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full text-left">
          <p className="font-bold text-[13px] text-amber-900 mb-1">Verifikasi email Anda</p>
          <p className="text-[12px] text-amber-800">
            Kami mengirim tautan verifikasi ke <span className="font-semibold">{email}</span>. Periksa inbox atau folder spam.
          </p>
          {devVerifyLink && (
            <p className="mt-2 text-[11px] text-[#58708D] break-all">
              Dev: <a href={devVerifyLink} className="text-[#1D4196] underline">{devVerifyLink}</a>
            </p>
          )}
        </div>
      )}

      {mode === "daftar" && (
        <div className="bg-[#F7F9FC] border border-[#D8E2F0] rounded-2xl p-5 w-full text-left">
          <p className="font-bold text-[13px] text-[#172E4D] mb-3">Kamu bisa mulai dari sini:</p>
          <div className="space-y-2.5">
            {[
              { emoji: "🔧", text: "Post Kerjaan plumbing atau perawatan gratis" },
              { emoji: "👷", text: "Tinjau profil & ulasan tukang terpercaya" },
              { emoji: "🔒", text: "Bayar dengan aman — uang dicairkan setelah selesai" },
            ].map((item) => (
              <div key={item.emoji} className="flex items-center gap-3 text-[13px] text-[#294566]">
                <span className="text-[18px]">{item.emoji}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => navigate("/post-job")}
          className="w-full bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          Post Kerjaan sekarang <ArrowRight size={16} />
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all"
        >
          Lihat beranda
        </button>
      </div>
    </div>
  );
}

// ─── Email form ───────────────────────────────────────────────────────────────

function EmailForm({
  mode,
  onSuccess,
  onBack,
}: {
  mode: AuthMode;
  onSuccess: (name: string, email: string, devVerifyLink?: string, loggedInUser?: AppUser) => void;
  onBack: () => void;
}) {
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [devVerifyLink, setDevVerifyLink] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const needsEmailVerification = error === "Email belum terverifikasi";

  const valid =
    (mode === "masuk" || name.trim().length >= 2) &&
    email.includes("@") &&
    password.length >= 6 &&
    (mode === "masuk" || phone.replace(/\D/g, "").length >= 8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setResendSent(false);
    setDevVerifyLink(null);
    setLoading(true);
    try {
      if (mode === "daftar") {
        const { devVerifyLink } = await register(email, password, name, "user", phone);
        onSuccess(name || email.split("@")[0], email, devVerifyLink);
      } else {
        const loggedInUser = await login(email, password);
        onSuccess(name || email.split("@")[0], email, undefined, loggedInUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autentikasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.includes("@")) return;
    setResendLoading(true);
    setResendSent(false);
    setDevVerifyLink(null);
    try {
      const res = await api.resendVerificationEmail(email);
      setResendSent(true);
      if (res.devVerifyLink) setDevVerifyLink(res.devVerifyLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim ulang email verifikasi");
    } finally {
      setResendLoading(false);
    }
  };

  const strengthColor = password.length === 0
    ? ""
    : password.length < 6
    ? "bg-red-400"
    : password.length < 10
    ? "bg-yellow-400"
    : "bg-[#20bf6f]";

  const strengthLabel = password.length === 0
    ? ""
    : password.length < 6
    ? "Terlalu pendek"
    : password.length < 10
    ? "Cukup kuat"
    : "Sangat kuat";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] transition-colors mb-2"
      >
        <ChevronLeft size={15} /> Kembali ke pilihan login
      </button>

      <h3 className="font-black text-[20px] text-[#172E4D] mb-4">
        {mode === "daftar" ? "Daftar dengan email" : "Masuk dengan email"}
      </h3>

      {mode === "daftar" && (
        <div>
          <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nama lengkap</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Budi Santoso"
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] focus:bg-white transition-all"
          />
        </div>
      )}

      <div>
        <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Alamat email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] focus:bg-white transition-all"
        />
      </div>

      {mode === "daftar" && (
        <>
          <div>
            <label className="block text-[13px] font-bold text-[#172E4D] mb-1.5">Nomor WhatsApp</label>
            <div className="flex">
              <span className="flex items-center px-3 border-2 border-r-0 border-[#D8E2F0] rounded-l-xl bg-[#EEF3FB] text-[#294566] font-semibold text-[14px]">+62</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="812 3456 7890"
                className="flex-1 border-2 border-[#D8E2F0] rounded-r-xl px-4 py-3 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] focus:bg-white transition-all"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[13px] font-bold text-[#172E4D]">Kata sandi</label>
          {mode === "masuk" && (
            <Link to="/lupa-sandi" className="text-[12px] text-[#1D4196] font-semibold hover:underline">
              Lupa kata sandi?
            </Link>
          )}
        </div>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "daftar" ? "Minimal 6 karakter" : "Masukkan kata sandi"}
            className="w-full border-2 border-[#D8E2F0] rounded-xl px-4 py-3 pr-11 text-[14px] text-[#172E4D] placeholder-[#7890AA] bg-[#F7F9FC] outline-none focus:border-[#1D4196] focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7890AA] hover:text-[#1D4196] transition-colors"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {mode === "daftar" && password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#D8E2F0] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${strengthColor}`}
                style={{ width: password.length < 6 ? "30%" : password.length < 10 ? "65%" : "100%" }}
              />
            </div>
            <span className="text-[11px] font-semibold text-[#58708D] whitespace-nowrap">{strengthLabel}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {needsEmailVerification && (
        <div className="bg-[#F7F9FC] border border-[#D8E2F0] rounded-xl px-4 py-3 space-y-2">
          <p className="text-[12px] text-[#58708D]">
            Periksa inbox untuk tautan verifikasi, atau kirim ulang email verifikasi.
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="text-[13px] font-bold text-[#1D4196] hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Mengirim…" : "Kirim ulang email verifikasi"}
          </button>
          {resendSent && (
            <p className="text-[12px] text-[#20bf6f] font-semibold">Email verifikasi dikirim. Periksa inbox.</p>
          )}
          {devVerifyLink && (
            <a href={devVerifyLink} className="block text-[11px] text-[#1D4196] break-all hover:underline">
              Dev link verifikasi
            </a>
          )}
        </div>
      )}

      {mode === "daftar" && (
        <p className="text-[12px] text-[#58708D]">
          Dengan mendaftar, kamu menyetujui{" "}
          <span className="text-[#1D4196] font-semibold cursor-pointer hover:underline">Syarat & Ketentuan</span>{" "}
          dan{" "}
          <span className="text-[#1D4196] font-semibold cursor-pointer hover:underline">Kebijakan Privasi</span> kami.
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || loading}
        className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-2xl transition-all ${
          valid && !loading
            ? "bg-[#1D4196] hover:bg-[#173577] text-white"
            : "bg-[#D8E2F0] text-[#7890AA] cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            {mode === "daftar" ? "Membuat akun…" : "Masuk…"}
          </>
        ) : mode === "daftar" ? (
          "Buat akun"
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = (location.state as { from?: string } | null)?.from;
  const nextParam = params.get("next");
  const initialMode = (params.get("mode") as AuthMode) ?? "masuk";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [screen, setScreen] = useState<Screen>(initialMode === "daftar" ? "role" : "main");
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [authProvider, setAuthProvider] = useState<OAuthProvider | "email" | null>(null);
  const [successName, setSuccessName] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [devVerifyLink, setDevVerifyLink] = useState<string | null>(null);

  const oauthError = params.get("error");
  const oauthErrorMessage =
    oauthError === "facebook_no_email"
      ? "Facebook tidak mengembalikan email. Pastikan akun Facebook Anda memiliki email terverifikasi."
      : oauthError === "oauth_denied"
        ? "Login dibatalkan. Silakan coba lagi."
        : oauthError === "oauth_unavailable"
          ? "Login Facebook belum tersedia. Silakan gunakan Google atau email."
        : oauthError === "oauth_failed"
          ? "Login gagal. Silakan coba lagi atau gunakan email."
          : null;

  const handleOAuth = (provider: OAuthProvider) => {
    window.location.href = api.oauthAuthUrl(provider);
  };

  const handleEmailSuccess = (
    name: string,
    email: string,
    link?: string,
    loggedInUser?: AppUser,
  ) => {
    if (mode === "masuk") {
      const destination = nextParam || redirectFrom;
      if (destination) {
        navigate(destination, { replace: true });
        return;
      }
      if (loggedInUser?.role === "technician") {
        navigate("/dasbor-tukang", { replace: true });
        return;
      }
    }
    setAuthProvider("email");
    setSuccessName(name);
    setSuccessEmail(email);
    setDevVerifyLink(link ?? null);
    setScreen("success");
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setScreen(m === "daftar" ? "role" : "main");
    setActiveProvider(null);
  };

  return (
    <div
      className="min-h-screen bg-[#F7F9FC] flex flex-col"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-[520px] mx-auto w-full">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <BrandLogo imgClassName="h-10" />
        </Link>
        <Link
          to="/"
          className="text-[13px] font-semibold text-[#58708D] hover:text-[#1D4196] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={15} /> Kembali
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#D8E2F0] shadow-lg overflow-hidden">

          {/* Screen: role picker */}
          {screen === "role" ? (
            <div className="p-8">
              <h2 className="font-black text-[24px] text-[#172E4D] mb-2">Mau daftar sebagai apa?</h2>
              <p className="text-[#58708D] text-[14px] mb-6">Pilih peran yang sesuai di KerjaIn.</p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setScreen("main")}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-[#D8E2F0] bg-white hover:border-[#1D4196] hover:bg-[#EEF3FB] transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#EEF3FB] flex items-center justify-center shrink-0 group-hover:bg-[#1D4196]/10">
                    <User size={28} className="text-[#1D4196]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[16px] text-[#172E4D]">Pengguna</p>
                    <p className="text-[13px] text-[#58708D] mt-0.5">Saya ingin memasang pekerjaan dan mencari tukang</p>
                  </div>
                  <ChevronRight size={18} className="text-[#7890AA] group-hover:text-[#1D4196] shrink-0" />
                </button>

                <Link
                  to="/daftar-tukang"
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-[#D8E2F0] bg-white hover:border-[#172E4D] hover:bg-[#172E4D] transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#D8E2F0] flex items-center justify-center shrink-0 group-hover:bg-white/10">
                    <HardHat size={28} className="text-[#172E4D] group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[16px] text-[#172E4D] group-hover:text-white">Tukang / Teknisi</p>
                    <p className="text-[13px] text-[#58708D] group-hover:text-white/70 mt-0.5">Saya ingin menawarkan jasa plumbing dan perawatan</p>
                  </div>
                  <ChevronRight size={18} className="text-[#7890AA] group-hover:text-white/70 shrink-0" />
                </Link>
              </div>
              <p className="text-center text-[12px] text-[#7890AA] mt-6">
                Sudah punya akun?{" "}
                <button onClick={() => switchMode("masuk")} className="text-[#1D4196] font-bold hover:underline">Masuk</button>
              </p>
            </div>
          ) : screen === "success" ? (
            <div className="p-8">
              <SuccessScreen
                mode={mode}
                provider={authProvider}
                email={successEmail}
                name={successName}
                devVerifyLink={devVerifyLink}
              />
            </div>
          ) : screen === "loading" && activeProvider ? (
            <div className="p-8">
              <LoadingScreen provider={activeProvider} />
            </div>
          ) : screen === "email-form" ? (
            <div className="p-8">
              <EmailForm
                mode={mode}
                onSuccess={handleEmailSuccess}
                onBack={() => setScreen("main")}
              />
            </div>
          ) : (
            /* Screen: main */
            <>
              {/* Tab toggle */}
              <div className="flex border-b border-[#D8E2F0]">
                {(["masuk", "daftar"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-4 font-bold text-[14px] transition-all ${
                      mode === m
                        ? "text-[#1D4196] border-b-2 border-[#1D4196]"
                        : "text-[#7890AA] hover:text-[#58708D]"
                    }`}
                  >
                    {m === "masuk" ? "Masuk" : "Daftar"}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {/* Heading */}
                <div className="mb-6">
                  <h1 className="font-black text-[24px] text-[#172E4D] mb-1">
                    {mode === "masuk" ? "Selamat datang kembali" : "Buat akun gratis"}
                  </h1>
                  <p className="text-[#58708D] text-[14px]">
                    {mode === "masuk"
                      ? "Masuk untuk mengelola pekerjaanmu di Jakarta"
                      : "Buat akun untuk menemukan tukang terpercaya di Jakarta"}
                  </p>
                </div>

                {oauthErrorMessage && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3 mb-5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {oauthErrorMessage}
                  </div>
                )}

                {/* Social buttons */}
                <div className="flex flex-col gap-3 mb-5">
                  <SocialButton
                    provider="google"
                    onClick={() => handleOAuth("google")}
                    loading={activeProvider !== null}
                  />
                  <SocialButton
                    provider="facebook"
                    onClick={() => handleOAuth("facebook")}
                    loading={activeProvider !== null}
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-[#D8E2F0]" />
                  <span className="text-[12px] font-semibold text-[#7890AA]">atau</span>
                  <div className="flex-1 h-px bg-[#D8E2F0]" />
                </div>

                {/* Email button */}
                <button
                  onClick={() => setScreen("email-form")}
                  className="w-full border-2 border-[#D8E2F0] text-[#294566] font-bold text-[14px] py-3.5 rounded-2xl hover:border-[#1D4196] hover:text-[#1D4196] transition-all"
                >
                  {mode === "masuk" ? "Masuk dengan email" : "Daftar dengan email"}
                </button>

                {/* Bottom switch */}
                <p className="text-center text-[13px] text-[#58708D] mt-5">
                  {mode === "masuk" ? (
                    <>
                      Belum punya akun?{" "}
                      <button
                        onClick={() => switchMode("daftar")}
                        className="text-[#1D4196] font-bold hover:underline"
                      >
                        Daftar gratis
                      </button>
                    </>
                  ) : (
                    <>
                      Sudah punya akun?{" "}
                      <button
                        onClick={() => switchMode("masuk")}
                        className="text-[#1D4196] font-bold hover:underline"
                      >
                        Masuk
                      </button>
                    </>
                  )}
                </p>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-[#D8E2F0]">
                  {[
                    "🔒 Aman & terenkripsi",
                    "✅ Gratis selamanya",
                    "🚫 Tanpa spam",
                  ].map((badge) => (
                    <span key={badge} className="text-[11px] text-[#7890AA] font-semibold">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* What you get — shown only on main/email screens */}
        {screen !== "success" && (
          <div className="hidden lg:flex flex-col gap-4 ml-8 mt-2 max-w-[280px]">
            <p className="font-black text-[16px] text-[#172E4D]">Dengan KerjaIn, kamu bisa:</p>
            {[
              { emoji: "🏠", title: "Post Kerjaan gratis", desc: "Ceritakan masalah dan atur anggaran" },
              { emoji: "⚡", title: "Dapat penawaran cepat", desc: "Tukang Jakarta merespons dalam 15–30 menit" },
              { emoji: "🔒", title: "Bayar dengan aman", desc: "Dana diteruskan setelah pekerjaan selesai" },
              { emoji: "⭐", title: "Tukang terverifikasi", desc: "Profil tukang dicek sebelum menerima pekerjaan" },
            ].map((item) => (
              <div key={item.emoji} className="flex items-start gap-3 bg-white rounded-2xl border border-[#D8E2F0] p-4">
                <span className="text-[24px] shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-bold text-[13px] text-[#172E4D]">{item.title}</p>
                  <p className="text-[12px] text-[#58708D] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
