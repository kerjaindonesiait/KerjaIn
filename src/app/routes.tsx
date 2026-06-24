import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import HowItWorks from "./pages/HowItWorks";
import PostJob from "./pages/PostJob";
import Auth from "./pages/Auth";
import Payment from "./pages/Payment";
import TechAuth from "./pages/TechAuth";
import TechDashboard from "./pages/TechDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "tasks", Component: Tasks },
      { path: "how-it-works", Component: HowItWorks },
      { path: "post-job", Component: PostJob },
      { path: "bayar", Component: Payment },
      { path: "masuk", Component: Auth },
      { path: "daftar", Component: Auth },
      { path: "daftar-tukang", Component: TechAuth },
      { path: "dasbor-tukang", Component: TechDashboard },
      { path: "*", Component: Home },
    ],
  },
]);
