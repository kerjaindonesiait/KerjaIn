import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const CATEGORY_LABELS: Record<string, string> = {
  darurat: "Pipa Bocor Darurat",
  deteksi: "Deteksi Kebocoran",
  mampet: "Saluran Mampet",
  water: "Pemanas Air",
  pipa: "Ganti Pipa",
  bathroom: "Pasang Kamar Mandi",
  maintenance: "Perawatan Umum",
  handyman: "Tukang Serba Bisa",
  pintu: "Perbaikan Pintu",
  talang: "Bersih Talang",
  keramik: "Perbaikan Keramik",
  atap: "Perawatan Atap",
};

function generateJobNumber() {
  const yr = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `#KJ-${yr}-${rand}`;
}

function deriveTitle(category: string, description: string) {
  const label = CATEGORY_LABELS[category] ?? category;
  const firstLine = description.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 80) return firstLine;
  return `${label} – ${description.slice(0, 60).trim()}…`;
}

function parseBudget(budget: string | undefined): number | null {
  if (!budget) return null;
  const digits = budget.replace(/\D/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  if (budget.toLowerCase().includes("rb") || budget.toLowerCase().includes("ribu")) {
    return n * 1000;
  }
  return n;
}

function formatPrice(amount: number | null) {
  if (!amount) return "Minta penawaran";
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1000) return `Rp ${Math.round(amount / 1000)}rb`;
  return `Rp ${amount}`;
}

function urgencyFromWaktu(waktuType: string) {
  if (waktuType === "asap") return "Segera";
  if (waktuType === "sebelum") return "Normal";
  return "Fleksibel";
}

async function enrichJob(job: Record<string, unknown>) {
  const { count } = await db
    .from("offers")
    .select("*", { count: "exact", head: true })
    .eq("job_id", job.id);

  const { data: poster } = await db
    .from("users")
    .select("id, full_name, email")
    .eq("id", job.user_id)
    .single();

  const initials = poster?.full_name
    ? poster.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return {
    id: job.id,
    jobNumber: job.job_number,
    category: job.category,
    title: job.title,
    description: job.description,
    photos: job.photos,
    area: job.area,
    alamat: job.alamat,
    lokasiType: job.lokasi_type,
    waktuType: job.waktu_type,
    tanggal: job.tanggal,
    budgetType: job.budget_type,
    budgetRaw: job.budget_raw,
    price: formatPrice(job.budget_raw as number | null),
    status: job.status,
    urgency: job.urgency,
    offers: count ?? 0,
    remote: job.lokasi_type === "remote",
    flexible: job.waktu_type === "fleksibel",
    date: job.tanggal ?? (job.waktu_type === "asap" ? "Hari ini" : null),
    time: job.urgency,
    initials,
    poster: poster
      ? { name: poster.full_name ?? poster.email, initials, color: "#2E5090", rating: 4.8, reviews: 0, memberSince: "2024", completionRate: 95 }
      : null,
    createdAt: job.created_at,
  };
}

router.get("/", async (req, res) => {
  try {
    const { status = "open", search, area } = req.query;
    let query = db.from("jobs").select("*").order("created_at", { ascending: false });

    if (status) query = query.eq("status", status as string);
    if (area) query = query.eq("area", area as string);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    const jobs = await Promise.all((data ?? []).map((j) => enrichJob(j)));
    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

router.get("/mine", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { data, error } = await db
      .from("jobs")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const jobs = await Promise.all((data ?? []).map((j) => enrichJob(j)));
    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await db.from("jobs").select("*").eq("id", req.params.id).single();
    if (error || !data) return res.status(404).json({ error: "Job not found" });
    res.json({ job: await enrichJob(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = req.body;
    const budgetRaw = body.budgetType === "minta" ? null : parseBudget(body.budget);

    const { data, error } = await db
      .from("jobs")
      .insert({
        user_id: req.user!.id,
        job_number: generateJobNumber(),
        category: body.layanan ?? body.category,
        title: deriveTitle(body.layanan ?? body.category, body.deskripsi ?? body.description),
        description: body.deskripsi ?? body.description,
        photos: body.photos ?? [],
        lokasi_type: body.lokasiType ?? "lokasi",
        area: body.area,
        alamat: body.alamat ?? null,
        waktu_type: body.waktuType ?? "fleksibel",
        tanggal: body.tanggal || null,
        budget_type: body.budgetType ?? "tetap",
        budget_raw: budgetRaw,
        urgency: urgencyFromWaktu(body.waktuType ?? "fleksibel"),
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ job: await enrichJob(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create job" });
  }
});

export default router;
