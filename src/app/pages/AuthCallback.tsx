import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../lib/auth";
import { api, setTokens } from "../../lib/api";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  useEffect(() => {
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const error = params.get("error");

    if (error) {
      navigate("/masuk?error=oauth_failed", { replace: true });
      return;
    }

    if (accessToken && refreshToken) {
      (async () => {
        try {
          setTokens(accessToken, refreshToken);
          const { user } = await api.me();
          setSession(accessToken, refreshToken, user);
          const next = params.get("next");
          if (next) {
            navigate(next, { replace: true });
          } else {
            navigate(user.role === "technician" ? "/dasbor-tukang" : "/", { replace: true });
          }
        } catch {
          navigate("/masuk?error=oauth_failed", { replace: true });
        }
      })();
    } else {
      navigate("/masuk", { replace: true });
    }
  }, [params, navigate, setSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <p className="text-[#1a2d4a] font-semibold">Memproses masuk…</p>
    </div>
  );
}
