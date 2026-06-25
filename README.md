# KerjaIn

Marketplace web app for home services (Indonesia).

## Local development

```bash
npm install
cp .env.example .env   # fill in secrets
npm run dev            # frontend → http://localhost:5173
npm run dev:api        # backend  → http://localhost:3000
# or: npm run dev:all
```

## Production deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

- **Frontend:** Vercel (`kerjaindonesia.com`) — set `VITE_API_URL` and `VITE_GOOGLE_MAPS_API_KEY` in Vercel env
- **Backend:** separate API host (`api.kerjaindonesia.com`) — set all backend vars + `NODE_ENV=production`

```bash
# Frontend (Vercel runs this automatically)
npm run build

# Backend (on your API server)
npm run build:api
npm run start:api
```
