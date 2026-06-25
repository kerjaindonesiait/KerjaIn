import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, optionalAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { geocodeJobLocation, getAreaCoordinates } from "../utils/geocode.js";
import {
  canAccessJobWorkspace,
  escrowReleaseAtFromNow,
  maybeAutoReleaseEscrow,
  releaseEscrowForJob,
  workspaceViewerRole,
} from "../utils/jobWorkspace.js";
import { validateCreateJobBody } from "../utils/jobValidation.js";

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

const AREA_SHORT: Record<string, string> = {
  "Jakarta Pusat": "Jakpus",
  "Jakarta Selatan": "Jaksel",
  "Jakarta Barat": "Jakbar",
  "Jakarta Timur": "Jaktim",
  "Jakarta Utara": "Jakut",
  Depok: "Depok",
  Tangerang: "Tangerang",
  "Tangerang Selatan": "Tansel",
  Bekasi: "Bekasi",
  Bogor: "Bogor",
};

const FEED_TAB_CATEGORIES: Record<string, string[] | "other"> = {
  plumbing: ["darurat", "deteksi", "mampet", "water", "pipa"],
  maintenance: ["maintenance", "handyman", "pintu", "talang", "keramik", "atap"],
  darurat: ["darurat"],
  "kamar-mandi": ["bathroom"],
  lainnya: "other",
};

const FEED_EXCLUDED_FOR_OTHER = new Set(
  ["darurat", "deteksi", "mampet", "water", "pipa", "maintenance", "handyman", "pintu", "talang", "keramik", "atap", "bathroom"],
);

const router = Router();

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

function canViewExactLocation(
  job: Record<string, unknown>,
  viewer?: { id: string; role: string } | null,
) {
  if (!viewer) return false;
  if (job.user_id === viewer.id) return true;
  return (
    viewer.role === "technician" &&
    job.assigned_technician_id === viewer.id &&
    ["assigned", "in_progress", "completed"].includes(String(job.status))
  );
}

async function enrichJob(
  job: Record<string, unknown>,
  viewer?: { id: string; role: string } | null,
) {
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

  const exactLocation = canViewExactLocation(job, viewer);
  const areaCoords = getAreaCoordinates(String(job.area ?? ""));

  return {
    id: job.id,
    jobNumber: job.job_number,
    category: job.category,
    title: job.title,
    description: job.description,
    photos: job.photos,
    area: job.area,
    alamat: exactLocation ? job.alamat : null,
    latitude: exactLocation ? (job.latitude ?? null) : (areaCoords?.latitude ?? null),
    longitude: exactLocation ? (job.longitude ?? null) : (areaCoords?.longitude ?? null),
    locationPrivate: !exactLocation,
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
    assignedTechnicianId: job.assigned_technician_id ?? null,
    scheduledAt: job.scheduled_at ?? null,
    technicianMarkedCompleteAt: job.technician_marked_complete_at ?? null,
    completedAt: job.completed_at ?? null,
    createdAt: job.created_at,
  };
}

router.get("/", optionalAuth, async (req: AuthedRequest, res) => {
  try {
    const { status = "open", search, area, sort = "newest" } = req.query;
    const ascending = sort === "oldest" || sort === "price_asc";
    let query = db.from("jobs").select("*");

    if (sort === "price_asc" || sort === "price_desc") {
      query = query.order("budget_raw", { ascending: sort === "price_asc", nullsFirst: false });
    } else {
      query = query.order("created_at", { ascending });
    }

    if (status) query = query.eq("status", status as string);
    if (area && area !== "Semua area") query = query.eq("area", area as string);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    let rows = data ?? [];
    if (req.user?.role === "technician") {
      rows = rows.filter((j) => j.user_id !== req.user!.id);
    }

    const jobs = await Promise.all(rows.map((j) => enrichJob(j, req.user)));

    if (sort === "offers") {
      jobs.sort((a, b) => b.offers - a.offers);
    }

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
    const jobs = await Promise.all((data ?? []).map((j) => enrichJob(j, req.user)));
    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

router.get("/completed/feed", async (req, res) => {
  try {
    const tab = String(req.query.tab ?? "plumbing");
    const limit = Math.min(Number(req.query.limit) || 12, 24);
    const tabFilter = FEED_TAB_CATEGORIES[tab] ?? FEED_TAB_CATEGORIES.plumbing;

    let query = db
      .from("jobs")
      .select("id, title, category, area, budget_raw, completed_at")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(limit * 2);

    const { data: jobs, error } = await query;
    if (error) throw error;

    let rows = jobs ?? [];
    if (tabFilter === "other") {
      rows = rows.filter((j) => !FEED_EXCLUDED_FOR_OTHER.has(j.category));
    } else if (Array.isArray(tabFilter)) {
      rows = rows.filter((j) => tabFilter.includes(j.category));
    }
    rows = rows.slice(0, limit);

    const jobIds = rows.map((j) => j.id);
    const reviewsByJob: Record<string, number> = {};
    if (jobIds.length > 0) {
      const { data: reviews } = await db
        .from("reviews")
        .select("job_id, rating")
        .in("job_id", jobIds);
      for (const r of reviews ?? []) {
        reviewsByJob[r.job_id] = r.rating;
      }
    }

    res.json({
      jobs: rows.map((j) => ({
        id: j.id,
        title: j.title,
        category: j.category,
        categoryLabel: CATEGORY_LABELS[j.category] ?? j.category,
        price: formatPrice(j.budget_raw as number | null),
        area: AREA_SHORT[j.area] ?? j.area,
        rating: reviewsByJob[j.id] ?? null,
        completedAt: j.completed_at,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memuat pekerjaan selesai" });
  }
});

router.get("/assigned", requireAuth, requireRole("technician"), async (req: AuthedRequest, res) => {
  try {
    const { data, error } = await db
      .from("jobs")
      .select("*")
      .eq("assigned_technician_id", req.user!.id)
      .in("status", ["assigned", "in_progress"])
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const jobs = await Promise.all((data ?? []).map((j) => enrichJob(j, req.user)));
    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assigned jobs" });
  }
});

router.get("/:id/workspace", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { data: job, error } = await db.from("jobs").select("*").eq("id", req.params.id).single();
    if (error || !job) return res.status(404).json({ error: "Pekerjaan tidak ditemukan" });
    if (!canAccessJobWorkspace(job, req.user!)) {
      return res.status(403).json({ error: "Anda tidak memiliki akses ke pekerjaan ini" });
    }

    await maybeAutoReleaseEscrow(job.id);
    const { data: refreshed } = await db.from("jobs").select("*").eq("id", job.id).single();
    const row = refreshed ?? job;

    const role = workspaceViewerRole(row, req.user!)!;

    const [{ data: messages }, { data: progressPhotos }, { data: acceptedOffer }, { data: payment }, { data: reviewRow }] =
      await Promise.all([
        db
          .from("job_messages")
          .select("id, job_id, sender_id, body, created_at")
          .eq("job_id", row.id)
          .order("created_at", { ascending: true }),
        db
          .from("job_progress_photos")
          .select("id, job_id, uploaded_by, url, caption, created_at")
          .eq("job_id", row.id)
          .order("created_at", { ascending: true }),
        db
          .from("offers")
          .select("id, price, technician_id")
          .eq("job_id", row.id)
          .eq("status", "accepted")
          .maybeSingle(),
        db
          .from("payments")
          .select("id, status, amount, total, escrow_release_at, released_at, created_at")
          .eq("job_id", row.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        db
          .from("reviews")
          .select("id, job_id, reviewer_id, reviewee_id, rating, comment, created_at")
          .eq("job_id", row.id)
          .maybeSingle(),
      ]);

    const { data: customer } = await db
      .from("users")
      .select("id, full_name, email, phone")
      .eq("id", row.user_id)
      .single();

    let counterpart: Record<string, unknown> | null = null;
    if (role === "owner" && acceptedOffer?.technician_id) {
      const { data: tech } = await db
        .from("users")
        .select("id, full_name, phone")
        .eq("id", acceptedOffer.technician_id)
        .single();
      if (tech) {
        counterpart = {
          id: tech.id,
          name: tech.full_name ?? "Tukang",
          phone: tech.phone,
          role: "technician",
        };
      }
    } else if (role === "technician" && customer) {
      counterpart = {
        id: customer.id,
        name: customer.full_name ?? customer.email,
        phone: customer.phone,
        role: "customer",
      };
    }

    const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
    const senderNames: Record<string, string> = {};
    if (senderIds.length > 0) {
      const { data: senders } = await db.from("users").select("id, full_name").in("id", senderIds);
      for (const s of senders ?? []) {
        senderNames[s.id] = s.full_name ?? "Pengguna";
      }
    }

    res.json({
      workspace: {
        job: await enrichJob(row, req.user),
        viewerRole: role,
        counterpart,
        acceptedOffer: acceptedOffer
          ? {
              id: acceptedOffer.id,
              price: acceptedOffer.price,
              priceFormatted: formatPrice(acceptedOffer.price),
            }
          : null,
        payment: payment
          ? {
              id: payment.id,
              status: payment.status,
              amount: payment.amount,
              total: payment.total,
              escrowReleaseAt: payment.escrow_release_at,
              releasedAt: payment.released_at,
            }
          : null,
        messages: (messages ?? []).map((m) => ({
          id: m.id,
          jobId: m.job_id,
          senderId: m.sender_id,
          senderName: senderNames[m.sender_id] ?? "Pengguna",
          body: m.body,
          createdAt: m.created_at,
        })),
        progressPhotos: (progressPhotos ?? []).map((p) => ({
          id: p.id,
          jobId: p.job_id,
          uploadedBy: p.uploaded_by,
          url: p.url,
          caption: p.caption,
          createdAt: p.created_at,
        })),
        review: reviewRow
          ? {
              id: reviewRow.id,
              jobId: reviewRow.job_id,
              reviewerId: reviewRow.reviewer_id,
              revieweeId: reviewRow.reviewee_id,
              rating: reviewRow.rating,
              comment: reviewRow.comment,
              createdAt: reviewRow.created_at,
            }
          : null,
        canReview: role === "owner" && row.status === "completed" && !reviewRow,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memuat workspace pekerjaan" });
  }
});

router.post("/:id/messages", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const body = String(req.body?.body ?? "").trim();
    if (!body || body.length > 2000) {
      return res.status(400).json({ error: "Pesan wajib diisi (maks. 2000 karakter)" });
    }

    const { data: job, error } = await db.from("jobs").select("*").eq("id", req.params.id).single();
    if (error || !job) return res.status(404).json({ error: "Pekerjaan tidak ditemukan" });
    if (!canAccessJobWorkspace(job, req.user!)) {
      return res.status(403).json({ error: "Anda tidak memiliki akses ke pekerjaan ini" });
    }
    if (!["assigned", "in_progress"].includes(job.status)) {
      return res.status(400).json({ error: "Pesan tidak tersedia untuk status pekerjaan ini" });
    }

    const { data, error: insertErr } = await db
      .from("job_messages")
      .insert({ job_id: job.id, sender_id: req.user!.id, body })
      .select("id, job_id, sender_id, body, created_at")
      .single();
    if (insertErr) throw insertErr;

    const { data: sender } = await db
      .from("users")
      .select("full_name")
      .eq("id", req.user!.id)
      .single();

    res.status(201).json({
      message: {
        id: data.id,
        jobId: data.job_id,
        senderId: data.sender_id,
        senderName: sender?.full_name ?? "Pengguna",
        body: data.body,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengirim pesan" });
  }
});

router.patch("/:id/schedule", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { scheduledAt, tanggal } = req.body as { scheduledAt?: string; tanggal?: string };
    if (!scheduledAt && !tanggal) {
      return res.status(400).json({ error: "scheduledAt atau tanggal wajib diisi" });
    }

    const { data: job, error } = await db.from("jobs").select("*").eq("id", req.params.id).single();
    if (error || !job) return res.status(404).json({ error: "Pekerjaan tidak ditemukan" });
    if (!canAccessJobWorkspace(job, req.user!)) {
      return res.status(403).json({ error: "Anda tidak memiliki akses ke pekerjaan ini" });
    }
    if (!["assigned", "in_progress"].includes(job.status)) {
      return res.status(400).json({ error: "Jadwal tidak dapat diubah untuk status ini" });
    }

    const updates: Record<string, string | null> = {};
    if (scheduledAt) updates.scheduled_at = scheduledAt;
    if (tanggal !== undefined) updates.tanggal = tanggal || null;

    const { data, error: updateErr } = await db
      .from("jobs")
      .update(updates)
      .eq("id", job.id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    res.json({ job: await enrichJob(data, req.user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memperbarui jadwal" });
  }
});

router.post("/:id/progress-photos", requireAuth, requireRole("technician"), async (req: AuthedRequest, res) => {
  try {
    const { url, caption } = req.body as { url?: string; caption?: string };
    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "URL foto tidak valid" });
    }

    const { data: job, error } = await db.from("jobs").select("*").eq("id", req.params.id).single();
    if (error || !job) return res.status(404).json({ error: "Pekerjaan tidak ditemukan" });
    if (job.assigned_technician_id !== req.user!.id) {
      return res.status(403).json({ error: "Hanya tukang yang ditugaskan dapat mengunggah foto" });
    }
    if (job.status !== "in_progress") {
      return res.status(400).json({ error: "Foto progres hanya saat pekerjaan sedang berjalan" });
    }

    const { data, error: insertErr } = await db
      .from("job_progress_photos")
      .insert({
        job_id: job.id,
        uploaded_by: req.user!.id,
        url,
        caption: caption?.trim() || null,
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    res.status(201).json({
      photo: {
        id: data.id,
        jobId: data.job_id,
        uploadedBy: data.uploaded_by,
        url: data.url,
        caption: data.caption,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan foto progres" });
  }
});

router.post("/:id/complete", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { data: job, error } = await db.from("jobs").select("*").eq("id", req.params.id).single();
    if (error || !job) return res.status(404).json({ error: "Pekerjaan tidak ditemukan" });

    const role = workspaceViewerRole(job, req.user!);
    if (!role) return res.status(403).json({ error: "Anda tidak memiliki akses ke pekerjaan ini" });

    if (role === "technician") {
      if (job.status !== "in_progress") {
        return res.status(400).json({ error: "Hanya pekerjaan yang sedang berjalan yang dapat ditandai selesai" });
      }
      const now = new Date().toISOString();
      const { data, error: updateErr } = await db
        .from("jobs")
        .update({ technician_marked_complete_at: now })
        .eq("id", job.id)
        .select()
        .single();
      if (updateErr) throw updateErr;

      await db.from("job_messages").insert({
        job_id: job.id,
        sender_id: req.user!.id,
        body: "✓ Tukang menandai pekerjaan selesai. Silakan periksa dan konfirmasi.",
      });

      res.json({ job: await enrichJob(data, req.user) });
      return;
    }

    // Customer confirms completion
    if (job.status !== "in_progress") {
      return res.status(400).json({ error: "Pekerjaan tidak dapat dikonfirmasi saat ini" });
    }

    await releaseEscrowForJob(job.id);
    const { data: completed } = await db.from("jobs").select("*").eq("id", job.id).single();

    res.json({ job: await enrichJob(completed!, req.user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyelesaikan pekerjaan" });
  }
});

router.post("/:id/cancel", requireAuth, requireRole("user"), async (req: AuthedRequest, res) => {
  try {
    const { data: job, error: fetchErr } = await db
      .from("jobs")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchErr || !job) {
      return res.status(404).json({ error: "Pekerjaan tidak ditemukan" });
    }
    if (job.user_id !== req.user!.id) {
      return res.status(403).json({ error: "Anda tidak berhak membatalkan pekerjaan ini" });
    }
    if (job.status !== "open") {
      return res.status(400).json({ error: "Hanya pekerjaan terbuka yang bisa dibatalkan" });
    }

    const { data, error } = await db
      .from("jobs")
      .update({ status: "cancelled" })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ job: await enrichJob(data, req.user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membatalkan pekerjaan" });
  }
});

router.get("/:id", optionalAuth, async (req: AuthedRequest, res) => {
  try {
    const { data, error } = await db.from("jobs").select("*").eq("id", req.params.id).single();
    if (error || !data) return res.status(404).json({ error: "Job not found" });
    res.json({ job: await enrichJob(data, req.user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

router.post("/", requireAuth, requireRole("user"), async (req: AuthedRequest, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const validationErrors = validateCreateJobBody(body);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: "Periksa kembali formulir Anda", details: validationErrors });
    }

    const budgetRaw = body.budgetType === "minta" ? null : parseBudget(String(body.budget ?? ""));
    const coords = await geocodeJobLocation(String(body.area ?? ""), body.alamat as string | undefined);

    const photos = Array.isArray(body.photos)
      ? (body.photos as string[]).filter((p) => typeof p === "string" && p.startsWith("http"))
      : [];

    const { data, error } = await db
      .from("jobs")
      .insert({
        user_id: req.user!.id,
        job_number: generateJobNumber(),
        category: body.layanan ?? body.category,
        title: deriveTitle(String(body.layanan ?? body.category), String(body.deskripsi ?? body.description)),
        description: body.deskripsi ?? body.description,
        photos,
        lokasi_type: body.lokasiType ?? "lokasi",
        area: body.area,
        alamat: body.alamat ?? null,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        waktu_type: body.waktuType ?? "fleksibel",
        tanggal: body.tanggal || null,
        budget_type: body.budgetType ?? "tetap",
        budget_raw: budgetRaw,
        urgency: urgencyFromWaktu(String(body.waktuType ?? "fleksibel")),
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ job: await enrichJob(data, req.user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create job" });
  }
});

export default router;
