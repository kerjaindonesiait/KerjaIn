# Deployment — URLs & environment

KerjaIn uses **environment variables** for every public URL. Nothing should hardcode `localhost` in production.

## Architecture

| Host | Platform | What runs |
|------|----------|-----------|
| `kerjaindonesia.com` | **Vercel** | Vite static frontend (`npm run build` → `dist/`) |
| `api.kerjaindonesia.com` | **Your API server** (VPS, Railway, Render, etc.) | Express backend (`backend/`) |

**Important:** Vercel only hosts the frontend. The Express API must run on a separate server with `NODE_ENV=production`.

---

## Vercel (frontend)

### Project settings

- **Framework:** Vite
- **Root directory:** `.` (repo root)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- `vercel.json` is included for SPA routing (React Router).

### Environment variables (Vercel dashboard)

Set these for **Production** (and Preview if needed). Only `VITE_*` vars are baked into the frontend bundle:

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://api.kerjaindonesia.com` |
| `VITE_GOOGLE_MAPS_API_KEY` | your Maps key |

Do **not** put backend secrets (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_*`, OAuth secrets) on Vercel unless you add serverless API routes (this project does not).

After changing `VITE_*` on Vercel, **redeploy** — values are fixed at build time.

---

## API server (backend)

Copy `.env.production.example` → `.env.production` on the server, or set the same variables in your host dashboard.

| Variable | Example | Used for |
|----------|---------|----------|
| `NODE_ENV` | `production` | Set on the **process**, not in `.env.production` for Vite |
| `FRONTEND_URL` | `https://kerjaindonesia.com` | Email links, OAuth return, CORS |
| `API_PUBLIC_URL` | `https://api.kerjaindonesia.com` | OAuth callback base URL |
| `CORS_ORIGINS` | `https://www.kerjaindonesia.com` | Extra allowed origins (optional) |
| `GOOGLE_REDIRECT_URI` | `https://api.kerjaindonesia.com/auth/google/callback` | Google Cloud Console |
| `FACEBOOK_REDIRECT_URI` | `https://api.kerjaindonesia.com/auth/facebook/callback` | Meta app settings |
| `COOKIE_SECURE` | `true` | HTTPS cookies (auto `true` in production) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | … | Database |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | … | Auth tokens |
| `GOOGLE_CLIENT_*`, `FACEBOOK_APP_*` | … | OAuth |
| `RESEND_API_KEY`, `EMAIL_FROM` | … | Email |
| `ADMIN_EMAILS` | … | Admin panel |

### Deploy commands

```bash
cd backend
npm ci
npm run build
NODE_ENV=production npm run start:prod
```

Or with a process manager (PM2):

```bash
NODE_ENV=production pm2 start dist/index.js --name kerjain-api
```

If `FRONTEND_URL` or `API_PUBLIC_URL` is missing or still contains `localhost`, the API **refuses to start** in production.

---

## Local development (unchanged)

Use `.env` at the project root:

```env
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

Run: `npm run dev` + `npm run dev:api` (or `dev:all`).

---

## OAuth consoles

Add production callback URLs (in addition to localhost for dev):

- Google: `https://api.kerjaindonesia.com/auth/google/callback`
- Facebook: `https://api.kerjaindonesia.com/auth/facebook/callback`

Authorized JavaScript origins / site URL: `https://kerjaindonesia.com`

---

## What uses `FRONTEND_URL`

- Password reset emails → `/atur-ulang-sandi?token=…`
- Email verification → `/verifikasi-email?token=…`
- Technician verified email → `/dasbor-tukang`
- OAuth success redirect → `/auth/callback?oauth=success`

All are built in `backend/src/utils/authTokens.ts` from `config.frontendUrl`.
