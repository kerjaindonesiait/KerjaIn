import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { Eye, EyeOff, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Wrench, ArrowRight, HardHat, User } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = "masuk" | "daftar";
type OAuthProvider = "google" | "facebook";
type Screen = "role" | "main" | "loading" | "success" | "email-form";

function modeFromPath(pathname: string): AuthMode {
  return pathname.endsWith("/daftar") ? "daftar" : "masuk";
}

function authErrorMessage(err: unknown, mode: AuthMode): string {
  const msg = err instanceof Error ? err.message : "Autentikasi gagal";
  if (msg === "Email already registered" || msg === "Email sudah terdaftar") {
    return "Email sudah terdaftar. Silakan masuk dengan email ini.";
  }
  if (msg === "Invalid credentials") {
    return mode === "daftar"
      ? "Email sudah digunakan atau kata sandi tidak valid."
      : "Email atau kata sandi salah. Belum punya akun? Daftar dulu.";
  }
  if (msg.includes("Tidak dapat terhubung ke database")) return msg;
  return msg;
}

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
      border: "border border-[#e0d0d0]",
      text: "text-[#0f2035]",
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
        <div className="absolute inset-0 rounded-full border-4 border-[#f0f7f4]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#2E5090] border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          {provider === "google" && <GoogleLogo />}
          {provider === "facebook" && <FacebookLogo />}
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-[16px] text-[#1a2d4a]">Menghubungkan ke {labels[provider]}…</p>
        <p className="text-[13px] text-[#3d6b5e] mt-1">Mohon tunggu sebentar</p>
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
      <div className="w-20 h-20 rounded-full bg-[#f0f7f4] border-4 border-[#F59E42] flex items-center justify-center">
        <CheckCircle size={40} className="text-[#2E5090]" fill="#2E5090" />
      </div>
      <div>
        <h2 className="font-black text-[26px] text-[#1a2d4a] mb-1">
          {mode === "daftar" ? "Akun berhasil dibuat!" : "Selamat datang kembali!"}
        </h2>
        <p className="text-[#3d6b5e] text-[15px]">
          Halo, <span className="font-bold text-[#2E5090]">{displayName}</span> 👋
        </p>
      </div>

      {mode === "daftar" && provider === "email" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full text-left">
          <p className="font-bold text-[13px] text-amber-900 mb-1">Verifikasi email Anda</p>
          <p className="text-[12px] text-amber-800">
            Kami mengirim tautan verifikasi ke <span className="font-semibold">{email}</span>. Periksa inbox atau folder spam.
          </p>
          {devVerifyLink && (
            <p className="mt-2 text-[11px] text-[#3d6b5e] break-all">
              Dev: <a href={devVerifyLink} className="text-[#2E5090] underline">{devVerifyLink}</a>
            </p>
          )}
        </div>
      )}

      {mode === "daftar" && (
        <div className="bg-[#F5F1E8] border border-[#c8dfd8] rounded-2xl p-5 w-full text-left">
          <p className="font-bold text-[13px] text-[#0f2035] mb-3">Apa yang bisa Anda lakukan sekarang?</p>
          <div className="space-y-2.5">
            {[
              { emoji: "🔧", text: "Pasang pekerjaan plumbing atau perawatan gratis" },
              { emoji: "👷", text: "Tinjau profil & ulasan tukang terpercaya" },
              { emoji: "🔒", text: "Bayar dengan aman — uang dicairkan setelah selesai" },
            ].map((item) => (
              <div key={item.emoji} className="flex items-center gap-3 text-[13px] text-[#1a3d5c]">
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
          className="w-full bg-[#2E5090] hover:bg-[#1e3d7a] text-white font-bold text-[15px] py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          Pasang Pekerjaan Sekarang <ArrowRight size={16} />
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] py-3 rounded-2xl hover:border-[#2E5090] hover:text-[#2E5090] transition-all"
        >
          Lihat Beranda
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
  onSuccess: (name: string, email: string, devVerifyLink?: string) => void;
  onBack: () => void;
}) {
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid =
    (mode === "masuk" || name.trim().length >= 2) &&
    email.includes("@") &&
    password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setLoading(true);
    try {
      if (mode === "daftar") {
        const { devVerifyLink } = await register(email, password, name, "user");
        onSuccess(name || email.split("@")[0], email, devVerifyLink);
      } else {
        await login(email, password);
        onSuccess(name || email.split("@")[0], email);
      }
    } catch (err) {
      setError(authErrorMessage(err, mode));
    } finally {
      setLoading(false);
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
        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3d6b5e] hover:text-[#2E5090] transition-colors mb-2"
      >
        <ChevronLeft size={15} /> Kembali ke pilihan login
      </button>

      <h3 className="font-black text-[20px] text-[#1a2d4a] mb-4">
        {mode === "daftar" ? "Daftar dengan email" : "Masuk dengan email"}
      </h3>

      {mode === "daftar" && (
        <div>
          <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Nama lengkap</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Budi Santoso"
            className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#2E5090] focus:bg-white transition-all"
          />
        </div>
      )}

      <div>
        <label className="block text-[13px] font-bold text-[#0f2035] mb-1.5">Alamat email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#2E5090] focus:bg-white transition-all"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[13px] font-bold text-[#0f2035]">Kata sandi</label>
          {mode === "masuk" && (
            <Link to="/lupa-sandi" className="text-[12px] text-[#2E5090] font-semibold hover:underline">
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
            className="w-full border-2 border-[#b8d4c8] rounded-xl px-4 py-3 pr-11 text-[14px] text-[#0f2035] placeholder-[#7a9a8f] bg-[#F5F1E8] outline-none focus:border-[#2E5090] focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a9a8f] hover:text-[#2E5090] transition-colors"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {mode === "daftar" && password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[#c8dfd8] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${strengthColor}`}
                style={{ width: password.length < 6 ? "30%" : password.length < 10 ? "65%" : "100%" }}
              />
            </div>
            <span className="text-[11px] font-semibold text-[#3d6b5e] whitespace-nowrap">{strengthLabel}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {mode === "daftar" && (
        <p className="text-[12px] text-[#3d6b5e]">
          Dengan mendaftar, Anda menyetujui{" "}
          <span className="text-[#2E5090] font-semibold cursor-pointer hover:underline">Syarat & Ketentuan</span>{" "}
          dan{" "}
          <span className="text-[#2E5090] font-semibold cursor-pointer hover:underline">Kebijakan Privasi</span> kami.
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || loading}
        className={`w-full flex items-center justify-center gap-2 font-bold text-[15px] py-3.5 rounded-2xl transition-all ${
          valid && !loading
            ? "bg-[#2E5090] hover:bg-[#1e3d7a] text-white"
            : "bg-[#c8dfd8] text-[#7a9a8f] cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            {mode === "daftar" ? "Membuat akun…" : "Masuk…"}
          </>
        ) : mode === "daftar" ? (
          "Buat Akun"
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const routeMode = modeFromPath(location.pathname);
  const initialMode = (params.get("mode") as AuthMode) || routeMode;
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
        : oauthError === "oauth_failed"
          ? "Login gagal. Silakan coba lagi atau gunakan email."
          : null;

  const handleOAuth = (provider: OAuthProvider) => {
    window.location.href = api.oauthAuthUrl(provider);
  };

  const handleEmailSuccess = (name: string, email: string, link?: string) => {
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
    navigate(m === "daftar" ? "/daftar" : "/masuk", { replace: true });
  };

  useEffect(() => {
    const m = modeFromPath(location.pathname);
    setMode(m);
    setScreen((prev) => {
      if (m === "daftar" && (prev === "main" || prev === "role")) return "role";
      if (m === "masuk" && prev === "role") return "main";
      return prev;
    });
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen bg-[#F5F1E8] flex flex-col"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-[520px] mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-[#2E5090] flex items-center justify-center">
            <Wrench size={16} className="text-white" />
          </div>
          <span className="font-black text-[18px] text-[#2E5090]">KerjaIn</span>
        </Link>
        <Link
          to="/"
          className="text-[13px] font-semibold text-[#3d6b5e] hover:text-[#2E5090] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={15} /> Kembali
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-[#c8dfd8] shadow-lg overflow-hidden">

          {/* Screen: role picker */}
          {screen === "role" ? (
            <div className="p-8">
              <h2 className="font-black text-[24px] text-[#1a2d4a] mb-2">Anda mendaftar sebagai?</h2>
              <p className="text-[#3d6b5e] text-[14px] mb-6">Pilih peran Anda di KerjaIn</p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setScreen("main")}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-[#c8dfd8] bg-white hover:border-[#2E5090] hover:bg-[#f0f7f4] transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#f0f7f4] flex items-center justify-center shrink-0 group-hover:bg-[#2E5090]/10">
                    <User size={28} className="text-[#2E5090]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[16px] text-[#1a2d4a]">Pengguna</p>
                    <p className="text-[13px] text-[#3d6b5e] mt-0.5">Saya ingin memasang pekerjaan dan mencari tukang</p>
                  </div>
                  <ChevronRight size={18} className="text-[#7a9a8f] group-hover:text-[#2E5090] shrink-0" />
                </button>

                <Link
                  to="/daftar-tukang"
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-[#c8dfd8] bg-white hover:border-[#1a2d4a] hover:bg-[#1a2d4a] transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#c8dfd8] flex items-center justify-center shrink-0 group-hover:bg-white/10">
                    <HardHat size={28} className="text-[#1a2d4a] group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[16px] text-[#1a2d4a] group-hover:text-white">Tukang / Teknisi</p>
                    <p className="text-[13px] text-[#3d6b5e] group-hover:text-white/70 mt-0.5">Saya ingin menawarkan jasa plumbing & perawatan</p>
                  </div>
                  <ChevronRight size={18} className="text-[#7a9a8f] group-hover:text-white/70 shrink-0" />
                </Link>
              </div>
              <p className="text-center text-[12px] text-[#7a9a8f] mt-6">
                Sudah punya akun?{" "}
                <button onClick={() => switchMode("masuk")} className="text-[#2E5090] font-bold hover:underline">Masuk</button>
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
              <div className="flex border-b border-[#c8dfd8]">
                {(["masuk", "daftar"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-4 font-bold text-[14px] transition-all ${
                      mode === m
                        ? "text-[#2E5090] border-b-2 border-[#2E5090]"
                        : "text-[#7a9a8f] hover:text-[#3d6b5e]"
                    }`}
                  >
                    {m === "masuk" ? "Masuk" : "Daftar"}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {/* Heading */}
                <div className="mb-6">
                  <h1 className="font-black text-[24px] text-[#1a2d4a] mb-1">
                    {mode === "masuk" ? "Selamat datang kembali" : "Buat akun gratis"}
                  </h1>
                  <p className="text-[#3d6b5e] text-[14px]">
                    {mode === "masuk"
                      ? "Masuk untuk mengelola pekerjaan Anda di Jakarta"
                      : "Bergabung dan temukan tukang terpercaya di Jakarta"}
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
                  <div className="flex-1 h-px bg-[#c8dfd8]" />
                  <span className="text-[12px] font-semibold text-[#7a9a8f]">atau</span>
                  <div className="flex-1 h-px bg-[#c8dfd8]" />
                </div>

                {/* Email button */}
                <button
                  onClick={() => setScreen("email-form")}
                  className="w-full border-2 border-[#b8d4c8] text-[#1a3d5c] font-bold text-[14px] py-3.5 rounded-2xl hover:border-[#2E5090] hover:text-[#2E5090] transition-all"
                >
                  {mode === "masuk" ? "Masuk dengan email" : "Daftar dengan email"}
                </button>

                {/* Bottom switch */}
                <p className="text-center text-[13px] text-[#3d6b5e] mt-5">
                  {mode === "masuk" ? (
                    <>
                      Belum punya akun?{" "}
                      <button
                        onClick={() => switchMode("daftar")}
                        className="text-[#2E5090] font-bold hover:underline"
                      >
                        Daftar gratis
                      </button>
                    </>
                  ) : (
                    <>
                      Sudah punya akun?{" "}
                      <button
                        onClick={() => switchMode("masuk")}
                        className="text-[#2E5090] font-bold hover:underline"
                      >
                        Masuk
                      </button>
                    </>
                  )}
                </p>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-[#c8dfd8]">
                  {[
                    "🔒 Aman & terenkripsi",
                    "✅ Gratis selamanya",
                    "🚫 Tanpa spam",
                  ].map((badge) => (
                    <span key={badge} className="text-[11px] text-[#7a9a8f] font-semibold">
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
            <p className="font-black text-[16px] text-[#1a2d4a]">Dengan bergabung KerjaIn:</p>
            {[
              { emoji: "🏠", title: "Pasang pekerjaan gratis", desc: "Deskripsikan masalah & tetapkan anggaran" },
              { emoji: "⚡", title: "Dapat penawaran cepat", desc: "Tukang Jakarta merespons dalam 15–30 menit" },
              { emoji: "🔒", title: "Bayar dengan aman", desc: "Uang dicairkan hanya jika pekerjaan selesai" },
              { emoji: "⭐", title: "Tukang terverifikasi", desc: "Semua tukang berlisensi & diasuransikan" },
            ].map((item) => (
              <div key={item.emoji} className="flex items-start gap-3 bg-white rounded-2xl border border-[#c8dfd8] p-4">
                <span className="text-[24px] shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-bold text-[13px] text-[#0f2035]">{item.title}</p>
                  <p className="text-[12px] text-[#3d6b5e] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
