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
import AccountProfileView from "./pages/AccountProfileView";
import ChangePassword from "./pages/ChangePassword";
import TechnicianMyReviews from "./pages/TechnicianMyReviews";
import MyJobs from "./pages/MyJobs";
import MyReviews from "./pages/MyReviews";
import TechProfile from "./pages/TechProfile";
import AdminPanel from "./pages/AdminPanel";
import Messages from "./pages/Messages";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "tasks", Component: Tasks },
      { path: "tukang/:id", Component: TechProfile },
      { path: "how-it-works", Component: HowItWorks },
      {
        path: "post-job",
        element: (
          <ProtectedRoute role="user">
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "bayar",
        element: (
          <ProtectedRoute role="user">
            <Payment />
          </ProtectedRoute>
        ),
      },
      {
        path: "pekerjaan-saya",
        element: (
          <ProtectedRoute role="user">
            <MyJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "ulasan-saya",
        element: (
          <ProtectedRoute role="user">
            <MyReviews />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminPanel />
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
      {
        path: "akun/ubah-sandi",
        element: (
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: "akun/profil",
        element: (
          <ProtectedRoute>
            <AccountProfileView />
          </ProtectedRoute>
        ),
      },
      {
        path: "akun/ulasan",
        element: (
          <ProtectedRoute role="technician">
            <TechnicianMyReviews />
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
      {
        path: "pesan",
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      {
        path: "pesan/:jobId",
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      { path: "*", Component: Home },
    ],
  },
]);
