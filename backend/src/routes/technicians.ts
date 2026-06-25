import { Router } from "express";
import { db } from "../db.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { resolveTechnicianPhone } from "../utils/phone.js";

const router = Router();

router.get("/profile", requireAuth, requireRole("technician"), async (req: AuthedRequest, res) => {
  const { data, error } = await db
    .from("technician_profiles")
    .select("*")
    .eq("user_id", req.user!.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: "Failed to fetch profile" });
  res.json({ profile: data });
});

router.post("/profile", requireAuth, requireRole("technician"), async (req: AuthedRequest, res) => {
  try {
    const body = req.body;
    let normalizedPhone: string | null = null;
    if (body.phone) {
      const resolved = await resolveTechnicianPhone(body.phone, req.user!.id);
      if ("error" in resolved) return res.status(409).json({ error: resolved.error });
      normalizedPhone = resolved.phone;
    }

    const payload = {
      user_id: req.user!.id,
      phone: normalizedPhone,
      area: body.area ?? null,
      nik: body.nik ?? null,
      ktp_photo_url: body.ktpPhoto ?? body.ktp_photo_url ?? null,
      selfie_photo_url: body.selfiePhoto ?? body.selfie_photo_url ?? null,
      keahlian: body.keahlian ?? [],
      pengalaman: body.pengalaman ?? null,
      tarif: body.tarif ?? null,
      bio: body.bio ?? null,
    };

    const { data: existing } = await db
      .from("technician_profiles")
      .select("id")
      .eq("user_id", req.user!.id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await db
        .from("technician_profiles")
        .update(payload)
        .eq("user_id", req.user!.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await db.from("technician_profiles").insert(payload).select().single();
      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({ error: "Nomor telepon ini sudah terdaftar untuk akun tukang lain" });
        }
        throw error;
      }
      result = data;
    }

    res.json({ profile: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, ...profileData } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error: userErr } = await db
      .from("users")
      .insert({ email, password_hash: passwordHash, full_name: fullName, role: "technician" })
      .select()
      .single();

    if (userErr) {
      if (userErr.code === "23505") return res.status(409).json({ error: "Email already registered" });
      throw userErr;
    }

    let normalizedPhone: string | null = null;
    if (profileData.phone) {
      const resolved = await resolveTechnicianPhone(profileData.phone, user.id);
      if ("error" in resolved) {
        await db.from("users").delete().eq("id", user.id);
        return res.status(409).json({ error: resolved.error });
      }
      normalizedPhone = resolved.phone;
    }

    const { data: profile, error: profileErr } = await db
      .from("technician_profiles")
      .insert({
        user_id: user.id,
        phone: normalizedPhone,
        area: profileData.area ?? null,
        keahlian: profileData.keahlian ?? [],
        pengalaman: profileData.pengalaman ?? null,
        tarif: profileData.tarif ?? null,
        bio: profileData.bio ?? null,
      })
      .select()
      .single();

    if (profileErr) {
      await db.from("users").delete().eq("id", user.id);
      if (profileErr.code === "23505") {
        return res.status(409).json({ error: "Nomor telepon ini sudah terdaftar untuk akun tukang lain" });
      }
      throw profileErr;
    }

    res.status(201).json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Technician registration failed" });
  }
});

export default router;
