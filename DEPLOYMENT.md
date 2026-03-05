# Task Kanban Deployment Runbook (Dokploy + Nixpacks)

This repository has two deployable services:

- `laravel_backend` (Laravel API + Backpack admin)
- `nuxt_frontend` (Nuxt SSR frontend)

Deploy them as separate Dokploy applications.

## 1. Dokploy Service Setup

Create two services from the same repository:

1. Backend service
- Root directory: `laravel_backend`
- Public/Web root: `public`
- Builder: Nixpacks

2. Frontend service
- Root directory: `nuxt_frontend`
- Builder: Nixpacks
- Start command: `npm run start`

Recommended deployment trigger strategy:

- Auto-deploy backend only when backend files change.
- Auto-deploy frontend only when frontend files change.

This avoids unnecessary backend redeploys when only frontend changes are pushed.

## 2. Backend Deployment (`laravel_backend`)

### Required environment variables (production)

```env
APP_NAME=Kanban
APP_ENV=production
APP_DEBUG=false
APP_URL=https://dev.mctsrv.de
APP_KEY=base64:...your-stable-key...

DB_CONNECTION=mysql
DB_HOST=...
DB_PORT=3306
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

SESSION_DRIVER=file
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SESSION_DOMAIN=null

CORS_ALLOWED_ORIGINS=https://dev.mctsrv.de
SANCTUM_STATEFUL_DOMAINS=dev.mctsrv.de

# Recommended for environments where basset write/internalize can fail:
BASSET_DEV_MODE=true
```

Important:

- Do not regenerate `APP_KEY` on each deploy.
- Keep only one value for each env key (no duplicates).

### Post-deploy command (safe default)

```bash
php artisan migrate --force
php artisan storage:link || true
php artisan permission:cache-reset || true
php artisan optimize:clear
php artisan config:cache
```

### First-time bootstrap checks

```bash
chmod -R ug+rwx storage bootstrap/cache
php artisan migrate --force
php artisan storage:link
```

## 3. Frontend Deployment (`nuxt_frontend`)

### Required environment variables

```env
NUXT_PUBLIC_API_BASE=https://dev.mctsrv.de/api
NODE_ENV=production
```

### Node runtime requirement

Nuxt 4 requires Node 20+.

This repo includes:

- `nuxt_frontend/nixpacks.toml` with `NIXPACKS_NODE_VERSION = "22"`
- `nuxt_frontend/package.json` engines: `>=20.19.0`

If Dokploy still uses Node 18, verify service root is `nuxt_frontend` and set app env var:

```env
NIXPACKS_NODE_VERSION=22
```

## 4. Admin Bootstrap (Backpack)

Use `php artisan tinker` on backend:

```php
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

$permissions = [
  'manage task',
  'manage project',
  'manage groups',
  'manage labels',
  'manage checklists',
  'manage users',
  'manage roles',
  'manage permissions',
];

foreach ($permissions as $p) {
  Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
}

$role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
$role->syncPermissions($permissions);

$user = User::updateOrCreate(
  ['email' => 'admin@gmail.com'],
  ['name' => 'Admin', 'password' => Hash::make('admin_123')]
);

$user->syncRoles([$role->name]);
```

Then:

```bash
php artisan permission:cache-reset
php artisan optimize:clear
```

## 5. Known Issues and Fixes

1. `419 Page Expired` on `/admin/login`
- Ensure `SESSION_DRIVER=file`, stable `APP_KEY`, and `SESSION_SECURE_COOKIE=true`.
- Run `php artisan optimize:clear && php artisan config:cache`.

2. Backpack UI unstyled / JS errors (`$ is not defined`, `Noty is not defined`, MIME type `text/html`)
- Usually static asset URL returns HTML due to storage/basset issues.
- Run `php artisan storage:link`.
- Prefer `BASSET_DEV_MODE=true` if write/internalize is unreliable.

3. CORS preflight blocked on register/login
- Ensure `CORS_ALLOWED_ORIGINS` contains exact frontend origin(s).
- Ensure `SANCTUM_STATEFUL_DOMAINS` contains frontend host(s) without scheme.
- Clear and recache config:
```bash
php artisan optimize:clear
php artisan config:cache
```

4. Frontend build fails with OXC native binding / Node mismatch
- Ensure Node 22 via `nixpacks.toml` or Dokploy env var.
- Keep the existing `scripts/ensure-oxc-binding.mjs` workaround.

## 6. Verification Checklist

After deployment:

1. Backend health endpoint: `GET https://dev.mctsrv.de/up`
2. Admin login page loads styles/scripts: `https://dev.mctsrv.de/admin/login`
3. API register endpoint works from frontend origin (no CORS errors)
4. Frontend can call backend at `NUXT_PUBLIC_API_BASE`

