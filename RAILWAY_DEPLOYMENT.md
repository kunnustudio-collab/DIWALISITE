# Railway Deployment Guide for Havells Zella E-Commerce Store

This project is fully optimized and configured for seamless 1-click deployment on [Railway.app](https://railway.app).

---

## 🚀 Step 1: Deploy from GitHub on Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard).
2. Click **"+ New Project"** → Select **"Deploy from GitHub repo"**.
3. Choose the repository: **`kunnustudio-collab/DIWALISITE`**.
4. Railway will automatically detect **Next.js & Nixpacks** and start the build process.

---

## ⚙️ Step 2: Configure Environment Variables in Railway
In your Railway Project Dashboard, navigate to **Settings** → **Variables** and add:

| Variable Name | Recommended Value / Description |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:./dev.db` (Default SQLite) or your Railway PostgreSQL URL |
| `JWT_SECRET` | `zella-ecom-secure-jwt-secret-key-production-ready-2026-auth-token-998` |
| `ADMIN_SESSION_COOKIE` | `zella_admin_session_token` |
| `NEXT_PUBLIC_APP_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` or your custom domain |
| `YOUPI_API_URL` | `http://localhost:6100` |
| `YOUPI_MERCHANT_ID` | `youpi_merchant_live` |
| `YOUPI_MERCHANT_API_KEY` | `yk_live_production_secret_key` |
| `YOUPI_WEBHOOK_SECRET` | `whsec_production_secret_key` |
| `INITIAL_ADMIN_EMAIL` | `admin@aquathermal.store` |
| `INITIAL_ADMIN_PASSWORD` | `AdminSecurePassword2026!` |

---

## 🌐 Step 3: Generate Domain
1. In your service settings on Railway, go to **Settings** → **Networking** → **Public Networking**.
2. Click **"Generate Domain"** (e.g. `diwalisite-production.up.railway.app`).
3. Your storefront is now live worldwide with free SSL!

---

## 🔐 Administrative Access
- **Admin Login:** `https://your-domain/admin/login`
- **Default Email:** `admin@aquathermal.store`
- **Default Password:** `AdminSecurePassword2026!`
