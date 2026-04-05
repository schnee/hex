# Deployment Guide (From Zero)

This walkthrough is for a first-time setup of:

- Backend API on Google Cloud Run (`backend/`)
- Frontend on Cloudflare Pages (`frontend/`)

It is written so you can start with a brand new Google Cloud and Cloudflare account.

## 0) What You Are Deploying

- Frontend (React/Vite) calls `VITE_API_BASE_URL` from `frontend/src/services/api.ts`
- Backend (FastAPI) allows browser origins from `CORS_ALLOW_ORIGINS` and optional `CORS_ALLOW_ORIGIN_REGEX` in `backend/src/main.py`
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

### 2.1 Create backend env file for Cloud Run

Store Cloud Run environment variables in a tracked template-style file so deploy and update commands stay consistent.

Create `backend/cloudrun.env`:

```dotenv
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
# Optional: allow Cloudflare Pages preview deployments for one project
# CORS_ALLOW_ORIGIN_REGEX=^https://[a-z0-9-]+\.hex-layout-frontend\.pages\.dev$
```

Notes:

- Use one `KEY=VALUE` per line
- Do not wrap values in quotes
- Use comma-separated origins for `CORS_ALLOW_ORIGINS`
- Use `CORS_ALLOW_ORIGIN_REGEX` only for dynamic preview subdomains (for example Cloudflare Pages previews)

### 2.2 Initial deploy (using env file)

Deploy once to get a stable backend URL:

```bash
gcloud run deploy hex-layout-backend \
  --source backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --env-vars-file backend/cloudrun.env
```

When deployment finishes, copy the service URL (example):

```text
https://hex-layout-backend-xxxxx-uc.a.run.app
```

### 2.3 Smoke test backend

```bash
curl https://<your-cloud-run-url>/api/health
curl https://<your-cloud-run-url>/
```

Expected health response:

```json
{"status":"healthy"}
```

### 2.4 Useful Cloud Run operations

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

Update `backend/cloudrun.env` with your real frontend origin, for example:

```dotenv
CORS_ALLOW_ORIGINS=https://hex-layout-frontend.pages.dev
# Optional preview deploy support:
# CORS_ALLOW_ORIGIN_REGEX=^https://[a-z0-9-]+\.hex-layout-frontend\.pages\.dev$
```

If you use multiple origins (recommended during rollout), keep them comma-separated:

```dotenv
CORS_ALLOW_ORIGINS=https://hex-layout-frontend.pages.dev,https://hex.yourdomain.com,http://localhost:3000
CORS_ALLOW_ORIGIN_REGEX=^https://[a-z0-9-]+\.hex-layout-frontend\.pages\.dev$
```

Then apply the updated env file:

```bash
gcloud run services update hex-layout-backend \
  --region us-central1 \
  --env-vars-file backend/cloudrun.env
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

Add custom domain origin in `backend/cloudrun.env`, for example:

```dotenv
CORS_ALLOW_ORIGINS=https://hex.yourdomain.com,https://hex-layout-frontend.pages.dev
CORS_ALLOW_ORIGIN_REGEX=^https://[a-z0-9-]+\.hex-layout-frontend\.pages\.dev$
```

Then apply it to Cloud Run:

```bash
gcloud run services update hex-layout-backend \
  --region us-central1 \
  --env-vars-file backend/cloudrun.env
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
- Fix: add exact domain to `CORS_ALLOW_ORIGINS`, and if preview deploys fail add `CORS_ALLOW_ORIGIN_REGEX`, then apply via `gcloud run services update --env-vars-file backend/cloudrun.env`

### Frontend calls localhost in production

- Cause: `VITE_API_BASE_URL` missing in Pages env vars
- Fix: set env var for Production and Preview, then redeploy

### Cloud Run deploy fails during build

- Check APIs enabled in section 1.3
- Check billing is active
- Read build logs in Cloud Console or with `gcloud run services logs read`

### Cloud Run update ignores expected env changes

- Cause: command used inline `--set-env-vars` instead of the shared file workflow
- Fix: make the change in `backend/cloudrun.env`, then run `gcloud run services update ... --env-vars-file backend/cloudrun.env`

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
