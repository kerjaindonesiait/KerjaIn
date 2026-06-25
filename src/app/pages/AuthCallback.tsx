import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../lib/auth";
import { api, refreshAccessToken } from "../../lib/api";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { establishSession } = useAuth();

  useEffect(() => {
    const error = params.get("error");
    const oauth = params.get("oauth");
    const next = params.get("next");

    if (error) {
      navigate("/masuk?error=oauth_failed", { replace: true });
      return;
    }

    // Legacy: old OAuth redirects with tokens in URL — ignore tokens, prefer cookies if present
    const legacyTokens = params.get("access_token") && params.get("refresh_token");

    if (oauth === "success" || legacyTokens) {
      (async () => {
        try {
          const { user } = await api.me();
          establishSession(user);
          if (next) {
            navigate(next, { replace: true });
          } else {
            navigate(user.role === "technician" ? "/dasbor-tukang" : "/", { replace: true });
          }
        } catch {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            try {
              const { user } = await api.me();
              establishSession(user);
              navigate(next ?? (user.role === "technician" ? "/dasbor-tukang" : "/"), { replace: true });
              return;
            } catch {
              // fall through
            }
          }
          navigate("/masuk?error=oauth_failed", { replace: true });
        }
      })();
    } else {
      navigate("/masuk", { replace: true });
    }
  }, [params, navigate, establishSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <p className="text-[#1a2d4a] font-semibold">Memproses masuk…</p>
    </div>
  );
}
