import { Router } from "express";
import { db, type UserRow } from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { config } from "../config.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

function publicUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
  };
}

async function issueTokens(user: UserRow) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await db.from("refresh_tokens").insert({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return { accessToken, refreshToken, user: publicUser(user) };
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, role = "user" } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (!["user", "technician"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const passwordHash = await hashPassword(password);
    const { data, error } = await db
      .from("users")
      .insert({ email, password_hash: passwordHash, full_name: fullName ?? null, role })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return res.status(409).json({ error: "Email already registered" });
      throw error;
    }

    const tokens = await issueTokens(data as UserRow);
    res.status(201).json(tokens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await db.from("users").select("*").eq("email", email).single();
    if (error || !data?.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await verifyPassword(password, data.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const tokens = await issueTokens(data as UserRow);
    res.json(tokens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const { data: stored } = await db
      .from("refresh_tokens")
      .select("*")
      .eq("user_id", payload.sub)
      .eq("token_hash", tokenHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!stored) return res.status(401).json({ error: "Invalid refresh token" });

    const { data: user } = await db.from("users").select("*").eq("id", payload.sub).single();
    if (!user) return res.status(401).json({ error: "User not found" });

    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ accessToken, user: publicUser(user as UserRow) });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const { data, error } = await db.from("users").select("*").eq("id", req.user!.id).single();
  if (error || !data) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(data as UserRow) });
});

router.post("/logout", requireAuth, async (req: AuthedRequest, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await db
      .from("refresh_tokens")
      .delete()
      .eq("user_id", req.user!.id)
      .eq("token_hash", hashToken(refreshToken));
  }
  res.json({ ok: true });
});

// Google OAuth
router.get("/google", (_req, res) => {
  if (!config.google.clientId) {
    return res.status(503).json({ error: "Google OAuth not configured" });
  }
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Missing code");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).send("OAuth token exchange failed");

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const { data: existingOAuth } = await db
      .from("oauth_accounts")
      .select("user_id")
      .eq("provider", "google")
      .eq("provider_user_id", profile.id)
      .maybeSingle();

    let user: UserRow;

    if (existingOAuth) {
      const { data } = await db.from("users").select("*").eq("id", existingOAuth.user_id).single();
      user = data as UserRow;
    } else {
      const { data: existingUser } = await db.from("users").select("*").eq("email", profile.email).maybeSingle();

      if (existingUser) {
        user = existingUser as UserRow;
        await db.from("oauth_accounts").insert({
          user_id: user.id,
          provider: "google",
          provider_user_id: profile.id,
          provider_email: profile.email,
        });
      } else {
        const { data: newUser, error } = await db
          .from("users")
          .insert({
            email: profile.email,
            full_name: profile.name,
            avatar_url: profile.picture,
            role: "user",
          })
          .select()
          .single();
        if (error) throw error;
        user = newUser as UserRow;
        await db.from("oauth_accounts").insert({
          user_id: user.id,
          provider: "google",
          provider_user_id: profile.id,
          provider_email: profile.email,
        });
      }
    }

    const tokens = await issueTokens(user);
    const redirect = new URL("/auth/callback", config.frontendUrl);
    redirect.searchParams.set("access_token", tokens.accessToken);
    redirect.searchParams.set("refresh_token", tokens.refreshToken);
    res.redirect(redirect.toString());
  } catch (err) {
    console.error(err);
    res.redirect(`${config.frontendUrl}/masuk?error=oauth_failed`);
  }
});

export default router;
