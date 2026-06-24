import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../lib/auth";

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: "user" | "technician" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <p className="text-[#1a2d4a] font-semibold">Memuat…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/masuk" state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "technician" ? "/dasbor-tukang" : "/"} replace />;
  }

  return <>{children}</>;
}
