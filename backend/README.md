# Hex Layout Toolkit - Backend

FastAPI backend for the Hex Layout Toolkit v2.0

## Development Setup

```bash
# Install dependencies
uv pip install -r requirements.txt

# Run development server
uvicorn src.main:app --reload --port 8000

# Run tests
pytest tests/ -v
```

## Environment variables

- `CORS_ALLOW_ORIGINS`: optional comma-separated list of allowed frontend origins.
  - Default: `http://localhost:3000,http://127.0.0.1:3000`
- `CORS_ALLOW_ORIGIN_REGEX`: optional regex for additional allowed origins.
  - Intended use: Cloudflare Pages preview subdomains for one project.
  - Default: unset

Example:

```bash
export CORS_ALLOW_ORIGINS="https://hex-layout.pages.dev,https://hex.yourdomain.com"
export CORS_ALLOW_ORIGIN_REGEX="^https://[a-z0-9-]+\\.hex-layout-frontend\\.pages\\.dev$"
```

## Cloud Run deployment

`Dockerfile` and `.dockerignore` are included for deployment.

See `../DEPLOYMENT.md` for full Cloud Run + Cloudflare Pages setup.
