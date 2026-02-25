# Task Kanban Deployment Guide

This project has two deployable apps:

- `laravel_backend` (API + auth + storage)
- `nuxt_frontend` (Nuxt SSR app)

Deploy them as two services.

## 1. Backend Deployment (`laravel_backend`)

## Build/Install

```bash
cd laravel_backend
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

## Required environment variables

Set these in production:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://api.your-domain.com`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com`
- `CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com`

## First-time/Release commands

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

Web root for backend must be:

- `laravel_backend/public`

## 2. Frontend Deployment (`nuxt_frontend`)

## Build/Start

```bash
cd nuxt_frontend
npm ci
npm run build
npm run start
```

Build output:

- `.output/`

Runtime entry:

- `.output/server/index.mjs`

## Required environment variables

- `NUXT_PUBLIC_API_BASE=https://api.your-domain.com/api`
- `NODE_ENV=production`

Optional (dev only):

- `NUXT_DEV_PROXY_TARGET=http://127.0.0.1:8000`

## 3. Nixpacks/Host Settings

For `nuxt_frontend` service:

- Root directory: `nuxt_frontend`
- Build command: `npm run build`
- Start command: `npm run start`

For `laravel_backend` service:

- Root directory: `laravel_backend`
- Web root/public dir: `public`

## 4. Notes

- CORS is now env-driven from `CORS_ALLOWED_ORIGINS`.
- Frontend API base is env-driven from `NUXT_PUBLIC_API_BASE`.
- If you change domains, update both backend and frontend env vars.
