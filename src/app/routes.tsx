import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import HowItWorks from "./pages/HowItWorks";
import PostJob from "./pages/PostJob";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Payment from "./pages/Payment";
import TechAuth from "./pages/TechAuth";
import TechDashboard from "./pages/TechDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AccountSettings from "./pages/AccountSettings";
import MyJobs from "./pages/MyJobs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "tasks", Component: Tasks },
      { path: "how-it-works", Component: HowItWorks },
      {
        path: "post-job",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "bayar",
        element: (
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        ),
      },
      {
        path: "pekerjaan-saya",
        element: (
          <ProtectedRoute>
            <MyJobs />
          </ProtectedRoute>
        ),
      },
      { path: "masuk", Component: Auth },
      { path: "daftar", Component: Auth },
      { path: "lupa-sandi", Component: ForgotPassword },
      { path: "atur-ulang-sandi", Component: ResetPassword },
      { path: "verifikasi-email", Component: VerifyEmail },
      {
        path: "akun",
        element: (
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        ),
      },
      { path: "auth/callback", Component: AuthCallback },
      { path: "daftar-tukang", Component: TechAuth },
      {
        path: "dasbor-tukang",
        element: (
          <ProtectedRoute role="technician">
            <TechDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "*", Component: Home },
    ],
  },
]);
