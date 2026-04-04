# Deployment Guide (From Zero)

This walkthrough is for a first-time setup of:

- Backend API on Google Cloud Run (`backend/`)
- Frontend on Cloudflare Pages (`frontend/`)

It is written so you can start with a brand new Google Cloud and Cloudflare account.

## 0) What You Are Deploying

- Frontend (React/Vite) calls `VITE_API_BASE_URL` from `frontend/src/services/api.ts`
- Backend (FastAPI) allows browser origins from `CORS_ALLOW_ORIGINS` in `backend/src/main.py`
- You must deploy backend first so the frontend can point at a real API URL

---

## 1) First-Time Google Cloud Setup

### 1.1 Create account and project

1. Create/sign in to Google Cloud: <https://console.cloud.google.com/>
2. Create a new project (for example: `hex-layout-prod`)
3. Enable billing for that project

Save these values for later:

- `PROJECT_ID` (example: `hex-layout-prod-123456`)
- `REGION` (example in this guide: `us-central1`)
- `SERVICE_NAME` (example in this guide: `hex-layout-backend`)

### 1.2 Install and initialize gcloud CLI

Install docs: <https://cloud.google.com/sdk/docs/install>

Then run:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project <PROJECT_ID>
gcloud config set run/region us-central1
```

Verify active config:

```bash
gcloud config list
```

### 1.3 Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 2) Deploy Backend to Cloud Run

Run commands from repository root (`hex/`).

### 2.1 Initial deploy (no frontend URL yet)

Deploy once to get a stable backend URL. For first deploy, allow localhost origins plus a temporary placeholder.

```bash
gcloud run deploy hex-layout-backend \
  --source backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000"
```

When deployment finishes, copy the service URL (example):

```text
https://hex-layout-backend-xxxxx-uc.a.run.app
```

### 2.2 Smoke test backend

```bash
curl https://<your-cloud-run-url>/api/health
curl https://<your-cloud-run-url>/
```

Expected health response:

```json
{"status":"healthy"}
```

### 2.3 Useful Cloud Run operations

View service details:

```bash
gcloud run services describe hex-layout-backend --region us-central1
```

View recent logs:

```bash
gcloud run services logs read hex-layout-backend --region us-central1 --limit 100
```

---

## 3) First-Time Cloudflare Pages Setup

### 3.1 Create account and connect repository

1. Create/sign in to Cloudflare: <https://dash.cloudflare.com/>
2. Go to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**
3. Authorize GitHub/Git provider and select this repository
4. Set project name (example: `hex-layout-frontend`)

### 3.2 Build settings

Use these values:

- Framework preset: `Vite`
- Root directory: `frontend`
- Build command: `npm run build`
- Build output directory: `dist`

Why this works:

- SPA fallback is already configured at `frontend/public/_redirects`
- Build scripts are defined in `frontend/package.json`

### 3.3 Environment variables

Set this variable in Pages for **Production** and **Preview**:

- `VITE_API_BASE_URL=https://<your-cloud-run-url>`

Example:

```text
VITE_API_BASE_URL=https://hex-layout-backend-xxxxx-uc.a.run.app
```

Then trigger deploy (first deploy happens automatically after setup; future deploys happen on git push).

### 3.4 Capture your Pages URL

After deployment, copy your Pages domain (example):

```text
https://hex-layout-frontend.pages.dev
```

---

## 4) Finalize CORS on Cloud Run

Now that you have the real Pages URL, update backend CORS so browser API calls are allowed.

If you only use the default `pages.dev` domain:

```bash
gcloud run services update hex-layout-backend \
  --region us-central1 \
  --set-env-vars "CORS_ALLOW_ORIGINS=https://hex-layout-frontend.pages.dev"
```

If you use multiple origins (recommended during rollout):

```bash
gcloud run services update hex-layout-backend \
  --region us-central1 \
  --set-env-vars "CORS_ALLOW_ORIGINS=https://hex-layout-frontend.pages.dev,https://hex.yourdomain.com,http://localhost:3000"
```

Re-test from browser after update.

---

## 5) End-to-End Verification Checklist

1. Open your Pages URL
2. Load app and verify no immediate API errors
3. Generate a pattern
4. Upload a wall image
5. Run overlay calculation
6. Confirm browser console has no CORS errors
7. Hit health endpoint from terminal:

```bash
curl https://<your-cloud-run-url>/api/health
```

---

## 6) Optional: Custom Domains

### 6.1 Cloudflare Pages custom domain

1. In Pages project -> **Custom domains** -> **Set up a custom domain**
2. Follow Cloudflare DNS instructions (usually automatic if DNS is hosted in Cloudflare)
3. Wait for SSL certificate provisioning

### 6.2 Update CORS for custom frontend domain

Add custom domain origin to Cloud Run:

```bash
gcloud run services update hex-layout-backend \
  --region us-central1 \
  --set-env-vars "CORS_ALLOW_ORIGINS=https://hex.yourdomain.com,https://hex-layout-frontend.pages.dev"
```

---

## 7) Optional: CLI Pages Deployment with Wrangler

If you want manual deploys instead of Git-triggered deploys:

```bash
cd frontend
npm ci
npm run build
npx wrangler login
npx wrangler pages deploy dist --project-name hex-layout-frontend
```

`frontend/wrangler.toml` already defines `pages_build_output_dir = "dist"`.

---

## 8) Troubleshooting

### CORS error in browser

- Cause: Pages/custom domain not included in `CORS_ALLOW_ORIGINS`
- Fix: update Cloud Run env var and redeploy revision via `gcloud run services update`

### Frontend calls localhost in production

- Cause: `VITE_API_BASE_URL` missing in Pages env vars
- Fix: set env var for Production and Preview, then redeploy

### Cloud Run deploy fails during build

- Check APIs enabled in section 1.3
- Check billing is active
- Read build logs in Cloud Console or with `gcloud run services logs read`

### 404 on direct URL refresh in frontend routes

- Ensure `frontend/public/_redirects` exists with:

```text
/* /index.html 200
```

---

## 9) Environment Templates

- Frontend template: `frontend/.env.example`
- Backend template: `backend/.env.example`

For local-only use, copy to `.env` files as needed.
