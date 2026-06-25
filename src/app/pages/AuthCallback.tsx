import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../lib/auth";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const error = params.get("error");
    const oauth = params.get("oauth");

    if (error) {
      navigate("/masuk?error=oauth_failed", { replace: true });
      return;
    }

    if (oauth === "success") {
      (async () => {
        try {
          const user = await refreshUser();
          if (!user) {
            navigate("/masuk?error=oauth_failed", { replace: true });
            return;
          }
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
      return;
    }

    navigate("/masuk", { replace: true });
  }, [params, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <p className="text-[#172E4D] font-semibold">Memproses masuk…</p>
    </div>
  );
}
