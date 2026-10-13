# Bora-Log

**Bora-Log** is a personal media diary for series: users catalog the shows they watch and track the
*emotional* and *temporal* side of it — status, rating, moods and how much time it took.

The repository has two apps:

- **`backend/`** — API (Node.js + TypeScript + Express + Prisma + PostgreSQL) with **Just-in-Time
  TMDB integration**: nothing is stored until a user actually adds a title to their list.
- **`frontend/`** — web app (Next.js App Router + TypeScript + Tailwind) that consumes the API.

---

## Stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Backend   | Node.js + TypeScript (ESM), Express 5             |
| Database  | PostgreSQL + Prisma ORM (`@prisma/adapter-pg`)    |
| Auth      | JWT + bcryptjs                                   |
| Validation| Zod                                               |
| Frontend  | Next.js (App Router) + React + Tailwind CSS 3     |
| HTTP      | axios (single instance + token interceptors)      |
| Images    | `next/image` (TMDB artwork)                       |
| External  | TMDB (The Movie Database)                         |
| Docs      | Swagger/OpenAPI at `http://localhost:4000/api/docs` |

---

## Requirements

- **Node.js** 20+ (developed on 24)
- **PostgreSQL** 14+
- A **TMDB API key** (free): https://www.themoviedb.org/settings/api

---

## Quickstart

### 1. Backend (API on `:4000`)

```bash
cd backend
npm install
cp .env.example .env          # fill DATABASE_URL, JWT_SECRET and TMDB_API_KEY
npx prisma migrate deploy     # create the schema
npm run seed                  # initial admin (+ demo data in dev)
npm run dev                   # http://localhost:4000  (Swagger at /api/docs)
```

### 2. Frontend (web on `:3000`)

```bash
cd frontend
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                   # http://localhost:3000
```

> The frontend needs the backend running and `NEXT_PUBLIC_API_URL` pointing to it.
> The backend allows the frontend origin via `FRONTEND_URL` (`http://localhost:3000` by default).

---

## Scripts

**Backend** (from `backend/`):

| Script                    | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Start in watch/dev mode (ts-node)                    |
| `npm run build`           | Compile TypeScript to `dist/`                        |
| `npm start`               | Run the compiled build (`dist/index.js`)             |
| `npm run prisma:generate` | Regenerate the Prisma Client                         |
| `npm run migrate:dev`     | Create + apply a migration (development)             |
| `npm run migrate:deploy`  | Apply pending migrations (production)                |
| `npm run seed`            | Seed initial admin (+ demo data outside production)  |
| `npm run backfill:backdrops` | Fetch missing TMDB backdrops for stored shows     |

**Frontend** (from `frontend/`):

| Script              | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the dev server               |
| `npm run build`     | Production build                   |
| `npm start`         | Serve the production build         |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | TypeScript (`tsc --noEmit`)        |

---

## Project structure

```
bora-log/
├─ backend/
│  ├─ prisma/            # schema, migrations, seed, backfill script
│  ├─ src/               # controllers, services, routes, middleware, lib
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ app/            # App Router: (auth) public + (app) protected routes
│  │  ├─ components/     # ui, layout, auth, shows, search, admin
│  │  ├─ hooks/          # useAuth, useShows, useTheme, useToast
│  │  ├─ lib/            # api.ts (axios), mappers, media, constants
│  │  ├─ services/       # auth/user/show/admin .service.ts
│  │  └─ types/          # domain + API DTOs
│  ├─ .env.example
│  └─ package.json
└─ docs/
   ├─ backend/           # SETUP.md, API.md
   └─ frontend/          # SETUP.md, ARCHITECTURE.md
```

---

## Documentation

- Backend: **[docs/backend/SETUP.md](docs/backend/SETUP.md)** · **[docs/backend/API.md](docs/backend/API.md)**
- Frontend: **[docs/frontend/SETUP.md](docs/frontend/SETUP.md)** · **[docs/frontend/ARCHITECTURE.md](docs/frontend/ARCHITECTURE.md)**

---

## Status

- **Backend:** ready. Auth (JWT + password reset), users/admin management, tracking with **logical
  delete + cascade**, Zod validation, TMDB search + trending with JIT persistence, Swagger docs.
- **Frontend:** connected to the API — login/register/reset, dashboard, search + trending, show
  detail, settings (profile, avatar color, password) and admin panel. No mock data.
