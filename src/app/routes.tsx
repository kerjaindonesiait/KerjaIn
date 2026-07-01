import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Root from "./pages/Root";
import Home from "./pages/Home";

const Tasks = lazy(() => import("./pages/Tasks"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const ServisAc = lazy(() => import("./pages/ServisAc"));
const JasaTukang = lazy(() => import("./pages/JasaTukang"));
const ServisAcArea = lazy(() => import("./pages/ServisAcArea"));
const PostJob = lazy(() => import("./pages/PostJob"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Payment = lazy(() => import("./pages/Payment"));
const TechAuth = lazy(() => import("./pages/TechAuth"));
const TechDashboard = lazy(() => import("./pages/TechDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const AccountProfileView = lazy(() => import("./pages/AccountProfileView"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const TechnicianMyReviews = lazy(() => import("./pages/TechnicianMyReviews"));
const MyJobs = lazy(() => import("./pages/MyJobs"));
const MyReviews = lazy(() => import("./pages/MyReviews"));
const TechProfile = lazy(() => import("./pages/TechProfile"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Messages = lazy(() => import("./pages/Messages"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "how-it-works", Component: HowItWorks },
      { path: "servis-ac", Component: ServisAc },
      { path: "jasa-tukang", Component: JasaTukang },
      { path: "servis-ac/:area", Component: ServisAcArea },
      { path: "tasks", Component: Tasks },
      { path: "tukang/:id", Component: TechProfile },
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
