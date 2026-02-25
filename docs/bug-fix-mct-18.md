# Bug Fix Documentation: MCT-18 (Kanban 419 and 500 Errors)

## Summary
This document describes the bug issues behind the Kanban board `419` and `500` errors and how they were fixed in commit `6b6f0f5`.

## Issue 1: `500` errors during login/register API calls
- Symptom: Authentication endpoints could return server errors when request payloads were missing/invalid.
- Root cause: `AuthController` accepted raw request fields without validating required input.
- Fix:
  - Added request validation for `register()` (`name`, `email`, `password`) and `login()` (`email`, `password`).
  - Replaced direct request reads with validated input.
  - Kept credential checks explicit and returned `401` for invalid login.
- Updated file:
  - `laravel_backend/app/Http/Controllers/AuthController.php`

## Issue 2: Admin access check was bypassed (security + routing instability)
- Symptom: Admin middleware did not enforce role checks correctly, which could lead to inconsistent behavior and protected-route errors.
- Root cause: `CheckIfAdmin` returned `true` unconditionally.
- Fix:
  - Implemented real role-based gate:
    - user must exist,
    - `hasRole` must be available,
    - user must have `admin` role.
- Updated file:
  - `laravel_backend/app/Http/Middleware/CheckIfAdmin.php`

## Issue 3: Backpack registration exposure and auth mismatch side effects
- Symptom: Unexpected registration behavior and admin auth flow conflicts could contribute to unstable auth state.
- Root cause:
  - Backpack registration was open by environment default.
- Fix:
  - Disabled Backpack open registration by default.
- Updated file:
  - `laravel_backend/config/backpack/base.php`

## Issue 4: Frontend auth pages/UI state contributing to unstable request flow
- Symptom: Login/Register experience had inconsistent UI states and messaging during auth flow, reducing reliability of user interaction around failing requests.
- Fix:
  - Updated login/register page structure and state styling.
  - Standardized registration success messaging.
  - Added Nuxt head preload strategy and color-mode cookie persistence to stabilize initial render and client state.
- Updated files:
  - `nuxt_frontend/app/pages/login.vue`
  - `nuxt_frontend/app/pages/register.vue`
  - `nuxt_frontend/nuxt.config.ts`

## Validation Checklist
- `POST /api/register`
  - valid payload creates user and returns token.
  - invalid payload returns validation errors (422), not 500.
- `POST /api/login`
  - valid credentials return token.
  - invalid credentials return `401 Invalid credentials`.
- Admin routes
  - non-admin users are blocked by middleware.
  - admin users can access Backpack routes.
- Frontend
  - login/register render consistently in light/dark mode.
  - auth transitions and notifications behave as expected.

## Commit Reference
- `6b6f0f5` - **MCT-18 Kanban Board 419 and 500 error**
