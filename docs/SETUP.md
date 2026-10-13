# Setup & Operations — Bora-Log Backend

Everything needed to install, run, migrate and seed the backend, for **development** and **production**.

---

## 1. Prerequisites

| Tool       | Version | Notes                                              |
| ---------- | ------- | -------------------------------------------------- |
| Node.js    | ≥ 20    | Developed on Node 24                                |
| npm        | ≥ 10    |                                                     |
| PostgreSQL | ≥ 14    | Local install or a hosted service (Neon, Supabase…) |
| TMDB key   | —       | Free: https://www.themoviedb.org/settings/api       |

---

## 2. Install

```bash
cd backend
npm install
```

`npm install` also runs Prisma's client generation in most setups; if not, run it manually:

```bash
npm run prisma:generate
```

---

## 3. Environment variables

Copy the template and edit it:

```bash
cp .env.example .env      # Windows: copy .env.example .env
```

| Variable              | Required | Description                                                        |
| --------------------- | -------- | ------------------------------------------------------------------ |
| `PORT`                | no       | API port (default `4000`)                                          |
| `DATABASE_URL`        | **yes**  | PostgreSQL connection string                                       |
| `JWT_SECRET`          | **yes**  | Secret for signing JWTs (use a long random string in production)   |
| `TMDB_API_KEY`        | **yes**  | TMDB API key                                                       |
| `EMAIL_HOST`          | no\*     | SMTP host (default `smtp.gmail.com`)                               |
| `EMAIL_PORT`          | no\*     | SMTP port (default `587`)                                          |
| `EMAIL_USER`          | no\*     | SMTP user / sender                                                 |
| `EMAIL_PASS`          | no\*     | SMTP password / app password                                       |
| `FRONTEND_URL`        | no       | Allowed CORS origin **and** base URL for the reset link            |
| `SEED_ADMIN_NAME`     | no       | Name of the initial admin created by the seeder                    |
| `SEED_ADMIN_EMAIL`    | prod     | Email of the initial admin                                         |
| `SEED_ADMIN_PASSWORD` | prod     | Password of the initial admin                                      |
| `SEED_DEMO`           | no       | `false` disables demo data in development                          |

\* Required only for the "forgot password" emails to work. In local dev you can leave them empty;
the endpoint still responds `200` (it never leaks whether an email exists).

> **Important:** `.env` is git-ignored — never commit real secrets. `.env.example` is the template.

---

## 4. Database

Create an empty database (name it whatever you put in `DATABASE_URL`, e.g. `bora_log_db`):

```bash
# with psql
createdb bora_log_db

# or from the psql shell
CREATE DATABASE bora_log_db;
```

---

## 5. Migrations

Migrations are the versioned SQL that keeps the database schema in sync with `prisma/schema.prisma`.
They live in `backend/prisma/migrations/`. **Do not edit the schema directly in the DB** — change the
schema and generate a migration.

### Development

Create and apply a migration after editing `schema.prisma`:

```bash
npm run migrate:dev -- --name describe_your_change
```

This applies it, regenerates the Prisma Client and records it in `_prisma_migrations`.

### Production

Apply all pending migrations **without** creating new ones (never resets data):

```bash
npm run migrate:deploy
```

### Other useful commands

```bash
npx prisma migrate status      # show applied / pending migrations
npx prisma migrate resolve ... # mark a migration as applied/rolled-back (recovery)
npx prisma migrate reset       # DANGER: drops and recreates the DB, then re-seeds (dev only)
npx prisma generate            # regenerate the client after schema changes
npx prisma studio              # visual DB browser (http://localhost:5555)
```

---

## 6. Seeder

The seeder (`backend/prisma/seed.ts`) is **idempotent** — safe to run repeatedly, it never deletes data.

- **Always:** ensures an **ADMIN** account exists (from `SEED_ADMIN_*`).
- **Development only:** optionally creates a demo user + demo shows/logs.
- **Production:** seeds **only** the admin. Demo data is never created.

```bash
npm run seed          # admin + demo data (auto: demo only outside production)
npm run seed:dev      # admin + demo data
npm run seed:prod     # admin only (requires SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
npx prisma db seed    # same as `npm run seed` (configured in prisma.config.ts)
```

Extra flags (append to the raw command if needed):

| Flag               | Effect                                                         |
| ------------------ | -------------------------------------------------------------- |
| `--prod`           | Force production mode (no demo, admin env required)            |
| `--demo`           | Force demo data on                                            |
| `--no-demo`        | Force demo data off                                           |
| `--force-password` | Overwrite the admin password even if the account already exists |

**Development defaults** (when `SEED_ADMIN_*` is not set): admin `admin@boralog.com` / `Admin123!`,
demo user `demo@boralog.com` / `Demo123!`. Change them before any real deployment.

---

## 7. Run the server

```bash
npm run dev                 # development, ts-node, restarts on change
npm run build && npm start  # production (compiled to dist/)
```

Health check:

```
GET http://localhost:4000/ping
```

---

## 8. API documentation (Swagger)

With the server running, open:

```
http://localhost:4000/api/docs
```

Click **Authorize** and paste a JWT (obtained from `POST /api/auth/login`) to try protected endpoints.

---

## 9. First admin / access

Create one of these ways:

1. **Seeder** (recommended): set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` and run `npm run seed`.
2. **Promote an existing user**: `npx prisma studio` → `User` table → set `role = ADMIN`.
3. **SQL**:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
   ```

Then log in:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boralog.com","password":"Admin123!"}'
```

The returned `token` goes in `Authorization: Bearer <token>`.

---

## 10. Troubleshooting

- **Dates shifted by hours (password reset "expired"):** the app forces the DB session to
  `timezone=UTC` for consistency. If you connect with other tools, keep that in mind. Prefer running
  the PostgreSQL server with UTC as a good practice.
- **`P1001` / connection refused:** PostgreSQL isn't running or `DATABASE_URL` is wrong.
- **`P2002` on register:** the email already belongs to an account (registering again **reactivates**
  a logically deleted one).
- **Password reset email not received:** check the `EMAIL_*` variables; the API still returns `200`.
- **CORS error from the frontend:** add its origin to `FRONTEND_URL` (comma-separated list supported).
- **DB schema drift after pulling changes:** run `npm run migrate:deploy` (or `npm run migrate:dev`).
