import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../lib/auth";
import { defaultRouteForUser } from "../../lib/defaultRoute";

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: "user" | "technician" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <p className="text-[#172E4D] font-semibold">Memuat…</p>
      </div>
    );
  }

  if (!user) {
    const returnTo = location.pathname + location.search;
    return (
      <Navigate
        to={"/masuk?next=" + encodeURIComponent(returnTo)}
        state={{ from: returnTo }}
        replace
      />
    );
  }

  if (role && user.role !== role) {
    const redirect =
      user.role === "technician" && role === "user"
        ? defaultRouteForUser(user)
        : user.role === "user" && role === "technician"
          ? "/"
          : "/";
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
