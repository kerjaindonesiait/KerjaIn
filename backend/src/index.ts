import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";
import offerRoutes from "./routes/offers.js";
import technicianRoutes from "./routes/technicians.js";
import paymentRoutes from "./routes/payments.js";

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(config.port, () => {
  console.log(`KerjaIn API running on http://localhost:${config.port}`);
});
