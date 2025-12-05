# NubiaCars CRM — Project README

This repository contains the NubiaCars CRM application with two main parts:

- `backend` — a Laravel (PHP) API responsible for business logic, database, and authentication.
- `frontend` — a React (Vite/TanStack) single-page app responsible for the user interface.

This README provides an overview, development setup, common commands, and troubleshooting tips for getting both the backend and frontend running locally.

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Repository layout](#repository-layout)
- [Backend — Quick setup](#backend---quick-setup)
- [Frontend — Quick setup](#frontend---quick-setup)
- [Database & migrations](#database--migrations)
- [Testing](#testing)
- [Environment variables](#environment-variables)
- [Common tasks & tips](#common-tasks--tips)
- [Troubleshooting](#troubleshooting)
- [Contact / Next steps](#contact--next-steps)

---

## Architecture overview

- The `backend` is built with Laravel (PHP). It exposes REST (and possibly GraphQL or broadcasting) endpoints for the frontend to consume.
- The `frontend` is a React app scaffolded with Vite and uses TanStack Router, with optional TanStack Query for data fetching.
- Data storage is handled by a relational database (commonly MySQL or PostgreSQL). Jobs/queues, caching, and broadcasting follow Laravel defaults unless configured otherwise.

---

## Prerequisites

Install the following on your machine:

- PHP 8.1+ (match the Laravel requirements in `backend/composer.json`)
- Composer
- Node.js 18+ and npm (or pnpm/yarn if you prefer)
- MySQL or PostgreSQL (or another supported DB)
- Optional: Redis for cache/queue, MailHog or similar for local mail testing

---

## Repository layout

- `backend/` — Laravel app
  - `backend/.env` — environment file (not committed)
  - `backend/artisan` — Laravel CLI
- `frontend/` — React (Vite) app
  - `frontend/package.json` — npm scripts and deps
  - `frontend/src/` — source code and `src/routes` for file-based routing

---

## Backend — Quick setup

1. Change into the backend directory:
   - `cd backend`

2. Install PHP dependencies with Composer:
   - `composer install`

3. Create the environment file and adjust values:
   - Copy `cp .env.example .env` then edit `backend/.env` for your DB, mail, and app URL.

4. Generate the application key:
   - `php artisan key:generate`

5. Configure database credentials in `backend/.env`:
   - Update `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_HOST`.

6. Run migrations and seeders:
   - `php artisan migrate --seed`

7. (Optional) If the app uses storage for uploads:
   - `php artisan storage:link`

8. Start the local development server:
   - `php artisan serve --host=127.0.0.1 --port=8000`
   - Or use Valet / Sail / Docker setup if provided in the project.

Notes:
- If the project includes Docker or Sail, check for `docker-compose.yml` or `backend/docker/*` for an alternate setup.
- If you use queues, start a worker with `php artisan queue:work` (or use Supervisor in production).

---

## Frontend — Quick setup

1. Change into the frontend directory:
   - `cd frontend`

2. Install JS dependencies:
   - `npm install` (or `pnpm install` / `yarn`)

3. Configure environment variables:
   - If the frontend uses an `.env` file (e.g., `VITE_API_URL`), create `frontend/.env.local` or update accordingly.

4. Start the dev server:
   - `npm run start`
   - By default Vite exposes the app on `http://localhost:5173` (port may vary).

5. Build for production:
   - `npm run build`

6. Run tests:
   - `npm run test` (Vitest is commonly used here)

Notes:
- The frontend uses file-based routing in `frontend/src/routes`. Add new routes by creating files in that directory.
- If the frontend talks to the backend API, set `VITE_API_URL` (or equivalent) to `http://localhost:8000` (or the configured backend host).

---

## Database & migrations

- Database configuration is handled in `backend/.env`.
- Typical migration commands:
  - `php artisan migrate` — run migrations
  - `php artisan migrate:fresh --seed` — reset DB and reseed (use with caution)
- If you need to rollback:
  - `php artisan migrate:rollback`
- Seeders (if present) will populate initial data:
  - `php artisan db:seed`

---

## Testing

Backend:
- Run PHPUnit tests from the `backend` directory:
  - `vendor/bin/phpunit` or `php artisan test`

Frontend:
- Run Vitest (from `frontend`):
  - `npm run test`

Check `backend/phpunit.xml` and `frontend/vitest.config.*` for configuration.

---

## Environment variables (common)

Backend (`backend/.env`):
- `APP_NAME`, `APP_URL`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `CACHE_DRIVER`, `QUEUE_CONNECTION`, `SESSION_DRIVER`
- `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`

Frontend (`frontend/.env` or `frontend/.env.local`):
- `VITE_API_URL` — base URL for backend API
- Any third-party keys (e.g., maps, analytics) — keep out of version control

Always keep secrets out of git. Use environment-specific deployment secrets or a secret manager.

---

## Common tasks & scripts

Backend (`backend`):
- `php artisan route:list` — view routes
- `php artisan tinker` — REPL
- `php artisan make:migration`, `make:controller`, `make:model` — scaffolding

Frontend (`frontend`):
- `npm run start` — dev server
- `npm run build` — production build
- `npm run test` — run tests
- `npm run lint` — linting (if configured)

---

## Deployment notes

- Build the frontend (`npm run build`) and serve the static assets via CDN/S3 or integrate with the backend as needed.
- Backend should be deployed to a PHP-compatible host or container, with queue and scheduler processes configured.
- Use environment-specific configuration and ensure `APP_ENV=production` and `APP_DEBUG=false` in production.

---

## Troubleshooting

- Database connection errors: verify `DB_HOST`, credentials, that the DB is running, and network access.
- Missing PHP extensions: check the Laravel error output; install extensions listed by error (e.g., `pdo_mysql`, `mbstring`, `openssl`).
- CORS issues: if frontend and backend run on different origins, confirm CORS settings in `backend` (middleware or `config/cors.php`).
- Assets not loading: confirm `VITE_API_URL` and that `npm run build` completed successfully for production.

---

## Where to look next

- Backend documentation and design decisions live under `backend/README.md` (Laravel defaults).
- Frontend quickstart and router guidance in `frontend/README.md`.
- Application-specific docs, API specs, or PRD may be present in the repo root or a `docs/` directory — search the repo for `docs`, `api.md`, or similar.

---

## Contact / Next steps

If you need help with any specific setup step, provide:
- Your OS and versions of PHP/Node
- Any error messages you see
- Contents of `backend/.env` (redact secrets) and `frontend/.env` if relevant

Recommended next tasks:
- Add a `CONTRIBUTING.md` with local workflow and branch rules
- Add Docker / Sail configuration if you want reproducible local environments
- Add CI for running tests and linting on push/PR

---