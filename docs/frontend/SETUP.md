# Setup & Operations — Bora-Log Frontend

Next.js app (App Router) that consumes the Bora-Log API. This guide covers install, environment,
running and troubleshooting. API architecture lives in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 1. Prerequisites

| Tool    | Version | Notes                                             |
| ------- | ------- | ------------------------------------------------- |
| Node.js | ≥ 20    | Developed on Node 24                               |
| npm     | ≥ 10    |                                                    |
| Backend | —       | The API must be running (see `docs/backend/SETUP.md`) |

---

## 2. Install

```bash
cd frontend
npm install
```

---

## 3. Environment

Create the local env file from the template:

```bash
cp .env.example .env.local      # Windows: copy .env.example .env.local
```

| Variable              | Required | Description                                            |
| --------------------- | -------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | **yes**  | Base URL of the Bora-Log API (e.g. `http://localhost:4000`) |

> `NEXT_PUBLIC_*` variables are **public** (bundled into the client). Never put secrets here.

---

## 4. Run

```bash
npm run dev          # http://localhost:3000
```

The API must be reachable at `NEXT_PUBLIC_API_URL`. The backend allows the frontend origin via its
`FRONTEND_URL` variable (`http://localhost:3000` by default).

---

## 5. Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the dev server (Turbopack)         |
| `npm run build`    | Production build                         |
| `npm start`        | Serve the production build               |
| `npm run lint`     | ESLint                                   |
| `npm run typecheck`| TypeScript (`tsc --noEmit`)               |

Production:

```bash
npm run build
npm start            # http://localhost:3000
```

---

## 6. Project structure

```
frontend/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # Root layout: fonts, providers, metadata
│  │  ├─ globals.css           # Theme system (CSS variables) + base styles
│  │  ├─ (auth)/               # Public: /login, /register, /reset-password
│  │  └─ (app)/                # Protected: dashboard, search, shows/[id], settings, admin
│  ├─ components/
│  │  ├─ ui/                   # Button, Input, Modal, Artwork, Avatar, toasts…
│  │  ├─ layout/               # Navbar, ThemeSwitcher, RequireAuth
│  │  ├─ auth/                 # AuthPage, ResetPasswordForm
│  │  ├─ shows/                # ShowCard, ShowFormModal, FilterBar, ShowModalProvider
│  │  ├─ search/ admin/
│  │  └─ providers.tsx         # Theme + Auth + Toast providers
│  ├─ hooks/                   # useAuth, useShows, useTheme, useToast
│  ├─ lib/                     # api.ts (axios), mappers.ts, media.ts, constants.ts
│  ├─ services/                # auth/user/show/admin .service.ts
│  └─ types/                   # index.ts (domain) + dto.ts (API)
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
└─ .env.example
```

---

## 7. Troubleshooting

- **`ECONNREFUSED` / requests fail:** the backend isn't running or `NEXT_PUBLIC_API_URL` is wrong.
- **CORS error in the browser:** add the frontend origin to the backend's `FRONTEND_URL`.
- **Sudden `401`:** the JWT expired (1h) — sign in again; the app clears the token automatically.
- **Images not loading:** external domains must be listed in `next.config.ts` → `images.remotePatterns`
  (already includes `image.tmdb.org`).
- **Changed `.env.local`:** restart `npm run dev` (env is read at start/build).
