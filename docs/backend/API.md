# API Reference — Bora-Log

Base URL (local): `http://localhost:4000`
Interactive docs (Swagger UI): `http://localhost:4000/api/docs`

---

## Conventions

- **Content type:** `application/json`.
- **Auth:** send the JWT in the header: `Authorization: Bearer <token>`.
  Tokens expire in **1 hour**. The server revalidates the user (active + role) on every request.
- **Errors:** JSON `{ "message": string }`. Validation errors add:
  ```json
  { "message": "Validation error", "errors": [{ "path": "email", "message": "Invalid email address" }] }
  ```
- **Status codes:** `200` ok · `201` created · `400` validation/credentials · `401` missing/inactive
  account · `403` forbidden (token invalid or not admin) · `404` not found · `409` conflict (email in use)
  · `500` server error · `502` external (TMDB) error.

### Enums

| Field         | Allowed values |
| ------------- | -------------- |
| `status`      | `watching`, `completed`, `plan_to_watch`, `dropped` |
| `mood`        | `happy`, `sad`, `romantic`, `chill`, `excited`, `nerdy`, `mad`, `stressed`, `bored`, `lonely`, `energetic`, `tragic`, `tense` |
| `time_commit` | `around_30_min`, `between_1_and_3_hours`, `binge` |
| `mediaType`   | `movie`, `tv` |
| `role`        | `USER`, `ADMIN` |

---

## Auth — `/api/auth`

| Method | Path                 | Auth   | Description |
| ------ | -------------------- | ------ | ----------- |
| POST   | `/register`          | public | Create a user. If the email belongs to a **logically deleted** account, it is reactivated. |
| POST   | `/login`             | public | Returns `{ user, token }`. |
| POST   | `/forgot-password`   | public | Sends a reset link (always `200`, never reveals whether the email exists). |
| POST   | `/reset-password`    | public | Resets the password with a token (valid **15 minutes**, single use). |

**Register / login body**

```json
{ "name": "Ada", "email": "ada@example.com", "password": "secret123" }
```

**PowerShell**

```powershell
$body = @{ email = 'admin@boralog.com'; password = 'Admin123!' } | ConvertTo-Json
$res  = Invoke-RestMethod -Uri http://localhost:4000/api/auth/login -Method Post -Body $body -ContentType 'application/json'
$token = $res.token
```

**curl**

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boralog.com","password":"Admin123!"}'
```

---

## Users — `/api/users`

| Method | Path                 | Who can call            | Description |
| ------ | -------------------- | ----------------------- | ----------- |
| GET    | `/me`                | authenticated           | Own profile (never includes the password hash). |
| GET    | `/:id`               | self or **admin**       | Profile of `:id`. |
| PATCH  | `/:id`               | self or **admin**       | Update `name`, `email`, `profileImage` **only**. |
| PATCH  | `/:id/password`      | self or **admin**       | Body `{ "newPassword": "..." }`. |
| DELETE | `/:id`               | self or **admin**       | **Logical delete**. With `?hard=true` → physical delete (**admin only**). |
| GET    | `/`                  | **admin**               | List all active users. |
| PATCH  | `/:id/admin-update`  | **admin**               | Update `name`, `email`, `role`, `isActive`. |
| GET    | `/shows/all`         | **admin**               | All log entries across the platform. |

```powershell
Invoke-RestMethod -Uri http://localhost:4000/api/users -Headers @{ Authorization = "Bearer $token" }
```

---

## Shows — `/api/shows`

| Method | Path                                      | Auth            | Description |
| ------ | ----------------------------------------- | --------------- | ----------- |
| GET    | `/search?title=<q>`                       | public          | TMDB search (movies + tv only). Nothing is stored. |
| POST   | `/add-list`                               | authenticated   | Add a title to the user's list (fetches full details from TMDB if missing). |
| GET    | `/user-list/:userId`                      | self/**admin**  | User's tracked list. Filters: `status`, `time_commit`, `mood` (repeatable). |
| PATCH  | `/update-list/:userShowId`                | owner           | Update `status`, `rating` (1–10 or `null`), `mood`, `time_commit`. |
| DELETE | `/remove-list/:userShowId`                | owner           | **Logical delete** of the entry (re-adding the title restores it). |
| GET    | `/show-details/:userShowId`               | owner           | One log entry + the cached show metadata. |
| GET    | `/external-show-details/:id/:mediaType`   | public          | Full TMDB details (`mediaType` = `movie` or `tv`). |

**Add to list body**

```json
{
  "showData": {
    "external_id": "603",
    "title": "The Matrix",
    "description": "…",
    "mediaType": "movie",
    "imageUrl": "https://image.tmdb.org/t/p/w500/….jpg",
    "duration": 136,
    "totalEpisodes": 1,
    "releaseDate": "1999-03-31"
  },
  "userShowData": {
    "status": "completed",
    "rating": 9,
    "mood": ["excited", "nerdy"],
    "time_commit": "between_1_and_3_hours"
  }
}
```

**Filters example**

```
GET /api/shows/user-list/<userId>?status=watching&time_commit=binge&mood=happy&mood=chill
```

---

## Notes on logical delete

- Deleting a **user** or a **list entry** only sets `deletedAt`. Data is hidden from every read.
- Deleting a user cascades the logical delete to their logs and revokes their reset tokens.
- A user whose account is logically deleted gets **reactivated** if they register again with the same
  email (role reset to `USER`).
- Physical deletion is possible only via `DELETE /api/users/:id?hard=true` (admin) and relies on the
  DB `ON DELETE CASCADE`.
