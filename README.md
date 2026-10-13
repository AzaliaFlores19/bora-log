# Bora-Log

**Bora-Log** is a personal media diary: users catalog the movies and TV shows they watch and track
the *emotional* and *temporal* side of it — status, rating, moods and how much time it took.

This repository contains the **backend** (Node.js + TypeScript + Express + Prisma + PostgreSQL) with
**Just-in-Time TMDB integration**: nothing is stored until a user actually adds a title to their list.

---

## Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Runtime   | Node.js + TypeScript (ESM)                   |
| API       | Express 5                                    |
| Database  | PostgreSQL + Prisma ORM (`@prisma/adapter-pg`) |
| Auth      | JWT + bcryptjs                               |
| Validation| Zod                                          |
| External  | TMDB (The Movie Database)                    |
| Docs      | Swagger / OpenAPI at `/api/docs`             |

---

## Requirements

- **Node.js** 20+ (developed on 24)
- **PostgreSQL** 14+
- A **TMDB API key** (free): https://www.themoviedb.org/settings/api

---

## Quickstart

```bash
cd backend
npm install
cp .env.example .env          # then fill in DATABASE_URL, JWT_SECRET and TMDB_API_KEY
npx prisma migrate deploy     # create the schema
npm run seed                  # create the initial admin (+ demo data in dev)
npm run dev                   # http://localhost:4000  (docs at /api/docs)
```

> Detailed setup, environment variables, migrations and seeding: **[docs/SETUP.md](docs/SETUP.md)**.
> Endpoint reference: **[docs/API.md](docs/API.md)**.

---

## Scripts

Run from `backend/`:

| Script                   | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `npm run dev`            | Start in watch/dev mode (ts-node)                       |
| `npm run build`          | Compile TypeScript to `dist/`                           |
| `npm start`              | Run the compiled build (`dist/index.js`)                |
| `npm run prisma:generate`| Regenerate the Prisma Client                            |
| `npm run migrate:dev`    | Create + apply a migration (development)                |
| `npm run migrate:deploy` | Apply pending migrations (production)                   |
| `npm run seed`           | Seed initial admin (+ demo data outside production)     |
| `npm run seed:dev`       | Seed forcing demo data                                  |
| `npm run seed:prod`      | Seed production (admin only, no demo data)              |

---

## Project structure

```
bora-log/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma        # data model
│  │  ├─ migrations/          # SQL migrations
│  │  └─ seed.ts              # idempotent seeder (dev + prod)
│  ├─ src/
│  │  ├─ controllers/         # HTTP handlers
│  │  ├─ services/            # business logic + Prisma access
│  │  ├─ routes/              # route definitions + Swagger JSDoc
│  │  ├─ middleware/          # auth / admin guards
│  │  ├─ lib/                 # prisma client, validation, email
│  │  ├─ index.ts             # app bootstrap
│  │  └─ swagger.ts           # OpenAPI config
│  ├─ .env.example
│  └─ package.json
└─ docs/
   ├─ SETUP.md
   └─ API.md
```

---

## Status

- **Backend:** ready. Auth (JWT + password reset), users/admin management, tracking with **logical
  delete + cascade**, Zod validation, TMDB search with JIT persistence, Swagger docs.
- **Frontend:** developed separately and not yet wired to this API (contracts differ). Pending.
