# Architecture — Bora-Log Frontend

Next.js (App Router) + TypeScript + Tailwind CSS. Mostly client-side: the app authenticates with a
JWT and talks to the Bora-Log API.

---

## Layers

```
component / page  →  hook (state)  →  service (HTTP)  →  lib/api (axios)  →  API
                          ↑                  ↓
                     types/index.ts    types/dto.ts + lib/mappers.ts
```

- **`lib/api.ts`** — the single axios instance. `baseURL` = `NEXT_PUBLIC_API_URL`. Holds the token
  helpers (`getToken` / `setToken` / `clearToken`, localStorage). Request interceptor attaches
  `Authorization: Bearer <token>`; response interceptor normalizes errors into `ApiError` and clears
  the token on `401`.
- **`services/*.service.ts`** — one file per domain (`auth`, `user`, `show`, `admin`). Each function
  calls the API and returns **domain types** (never raw DTOs).
- **`types/dto.ts`** — the API payload shapes. **`types/index.ts`** — the app's domain types.
- **`lib/mappers.ts`** — adapt backend ↔ app (`mapUser`, `mapShow`, `mapUserShow`, `mapSearchResult`,
  `toShowData`, `toUserShowData`). The backend and UI intentionally use different field names
  (`name`↔`username`, `mood`↔`moods`, `external_id`↔`tmdb_id`, …); the mappers are the only place
  that knows both.

---

## Providers & route groups

```
app/layout.tsx → <Providers> (Theme + Auth + Toast + <ToastContainer/>)
   ├─ app/(auth)/…      public: /login, /register, /reset-password
   └─ app/(app)/layout  protected:
        <RequireAuth>            → redirects to /login when there is no session
          <ShowsProvider>        → the user's tracked list (shared state)
            <ShowModalProvider>  → add/edit modal, uses external details + add/update endpoints
              <Navbar/> + page
```

- **`hooks/useAuth.tsx`** — session state. On mount, if a token exists it validates via
  `GET /api/users/me`; `signIn`/`signUp` store the token; `signOut` clears it. Exposes
  `updateProfile` and `changePassword`.
- **`hooks/useShows.tsx`** — shared list context (`shows`, `addShow`, `updateShow`, `removeShow`,
  `reload`), so every page stays in sync.
- **`hooks/useToast.tsx`** / **`useTheme.tsx`** — UI feedback and the color theme (persisted in
  localStorage, applied via `data-theme`).
- **`RequireAuth`** guards the `(app)` group; `<Navbar/>` shows the user menu and (for admins) the
  panel link.

---

## Theme system

`globals.css` defines each theme as CSS variables in RGB channels (`[data-theme="..."]`), consumed by
Tailwind (`rgb(var(--c-*) / <alpha-value>)`). `useTheme` sets `data-theme` on `<html>`; `ThemeSwitcher`
lists the options. Add a theme by appending a `[data-theme="name"]` block and an entry in
`lib/constants.ts` → `themeOptions`.

---

## Images

- **`components/ui/Artwork.tsx`** — wraps `next/image` (`fill`) with a neutral gradient fallback when
  there is no image. Accepts `objectFit` (`cover` | `contain`).
- **`lib/media.ts`** — returns the real URL or `null` (`posterSrc`, `backdropSrc`, `searchPosterSrc`).
- External domains must be declared in `next.config.ts` → `images.remotePatterns`.

---

## Auth & session flow

1. `POST /api/auth/login` → `{ user, token }`. The token is stored via `setToken` and the user mapped
   into the `AuthProvider`.
2. Every request carries `Authorization: Bearer <token>` (axios interceptor).
3. On `401` the token is cleared; `RequireAuth` sends the user back to `/login`.
4. `POST /api/auth/forgot-password` from the auth screen; the email link opens
   `/reset-password?token=…` → `POST /api/auth/reset-password`.

---

## Adding a new endpoint

1. Add the payload type to `types/dto.ts` (if it doesn't exist).
2. Add a mapper in `lib/mappers.ts` (or reuse `toShowData`-style helpers) when field names differ.
3. Add a function to the matching `services/*.service.ts` that calls `api` and returns a domain type.
4. Consume it from a hook/page/component (state, loading, toasts).

Keep HTTP/axios usage inside `services/` — components and hooks shouldn't call `api` directly.

---

## Routes

| Route              | Access    | Description                          |
| ------------------ | --------- | ------------------------------------ |
| `/login`           | public    | Sign in / create account             |
| `/register`        | public    | Create account (focus mode)          |
| `/reset-password`  | public    | Set a new password from the email link |
| `/dashboard`       | protected | The user's tracked shows + filters   |
| `/search`          | protected | Search + trending, add to log        |
| `/shows/[id]`      | protected | Detail of a log entry (by entry id)  |
| `/settings`        | protected | Profile, avatar color, password      |
| `/admin`           | admin     | Users, stats and all shows           |
