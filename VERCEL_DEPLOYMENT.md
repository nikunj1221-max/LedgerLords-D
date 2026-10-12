# Deploy to Vercel with Supabase

This project deploys as one Vercel project: Vite serves the frontend, and
`api/[...path].ts` runs the existing Express API as a serverless function.
Both use the same domain, so browser API calls and session cookies stay
same-origin.

## 1. Prepare Supabase

1. Create or select a Supabase project and keep its database password private.
2. In **Project Settings → Database → Connection string**, obtain:
   - A **Transaction pooler** connection for `DATABASE_URL` (port `6543`).
   - A **Session pooler** connection for `DIRECT_URL` (port `5432`), or the
     direct database connection if it is reachable from your environment.
3. Use the correct pooler username shown by Supabase (often
   `postgres.<project-ref>`), URL-encode special characters in the password,
   and keep SSL enabled.
4. For Vercel runtime, make `DATABASE_URL` use port `6543` and include
   `pgbouncer=true&connection_limit=1`. The Prisma client also supplies these
   compatibility options for the transaction-pooler port.
5. Keep `DIRECT_URL` pointed at the direct or session-pooler connection. Prisma
   uses this URL for schema management, not for ordinary API requests.

The local `server/.env` is ignored by Git and must never be committed. The
current local database URLs use the pooler on port `5432`; use the transaction
pooler URL for Vercel's `DATABASE_URL`.

## 2. Create the database tables

Before deploying, update the local `server/.env` with the correct Supabase
`DATABASE_URL` and `DIRECT_URL`, then run this from the repository root:

```powershell
npm run db:push --workspace=server
```

This project currently uses Prisma `db push` rather than checked-in migration
files. Run it once against the intended Supabase project before sending traffic.
Do not run schema changes automatically on every Vercel deployment.

## 3. Create the Vercel project

1. Push this repository to a private GitHub repository if it is not already
   there. Confirm that `.env` files are not tracked.
2. In Vercel, **Add New → Project**, import the repository, and set the
   **Root Directory** to the repository root (the directory containing this
   file and the root `package.json`).
3. Select Node.js **22.x** in Project Settings → General → Node.js Version.
4. Use the configured build settings:
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Output directory: `client/dist`
5. Add all production environment variables in **Project Settings → Environment
   Variables** before the first deployment. Apply them to Production and, when
   needed, Preview separately.

## 4. Configure environment variables

Add the server-side values below in Vercel. Do not add a `VITE_` prefix to
secrets; these values must not be bundled into the browser.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Supabase transaction pooler URL, port `6543`; include `pgbouncer=true&connection_limit=1`. |
| `DIRECT_URL` | Yes | Supabase direct connection or session pooler URL for Prisma schema operations. |
| `AI_API_KEY` | For AI planning | Secret key for the configured AI provider. |
| `AI_ENDPOINT` | Optional | Defaults to the OpenAI-compatible Chat Completions endpoint. |
| `AI_MODEL` | Optional | Defaults to `gpt-4o-mini`. |
| `AI_REASONING_EFFORT` | Optional | Only used for providers/models that support it. |
| `GOOGLE_CALENDAR_CLIENT_ID` | For calendar invites | Google OAuth client ID. |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | For calendar invites | Google OAuth client secret. |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | For calendar invites | Refresh token for the calendar integration. |
| `GOOGLE_CALENDAR_ID` | Optional | Defaults to `primary`. |
| `GOOGLE_CALENDAR_TIME_ZONE` | Optional | Set the intended calendar time zone. |
| `MEETING_ALLOWED_ATTENDEES` | Optional | Comma-separated permitted email addresses. |
| `MEETING_REMINDER_MINUTES` | Optional | Reminder lead time in minutes. |

Vercel sets `NODE_ENV` and the function port. Do not set `PORT` or
`AI_CACHE_FILE` in Vercel: local disk is not durable across serverless
invocations. `CLIENT_ORIGIN` and `CROSS_ORIGIN_AUTH` can remain unset because
the deployed frontend and API share one origin. If you deliberately split
frontend and API across domains, set `CLIENT_ORIGIN` to the exact frontend
origin and `CROSS_ORIGIN_AUTH=true`.

## 5. Deploy and verify

1. Deploy from the Vercel dashboard or run `npx vercel --prod` from the
   repository root after linking the project.
2. Open `https://<your-domain>/api/health`; it should return JSON with
   `"status":"ok"`.
3. Test sign-up, sign-in, sign-out, and `/api/auth/session` in the deployed
   frontend. Because the API and frontend share an origin, the session cookie
   should be `HttpOnly`, `Secure`, and `SameSite=Lax`.
4. Upload a small CSV/JSON file and confirm that it appears only in the
   signed-in account. Vercel serverless request bodies are limited, so uploads
   are sent as raw text and capped at 4 MB.
5. Check Vercel Function Logs and Supabase logs if API calls fail. A database
   connection error usually means the runtime URL is not the transaction
   pooler URL, the Supabase project is paused, or the database password/query
   string is incorrect.

## Local development remains unchanged

Run `npm run dev` from the repository root. Vite proxies `/api` requests to the
local Express server on port `4000`; local environment values remain in the
ignored `server/.env` file.
