# SocialGrow

A mobile-first social community platform where members complete genuine social-media
support tasks (follow / like / comment / visit / subscribe), submit screenshot proof,
and earn XP once an admin approves it. At 100 approved XP, members unlock the ability
to add their own profile/task to the rotation.

Built with **React + TypeScript + Vite + Tailwind** on the frontend and **Supabase**
(Postgres, Auth, Storage, Row Level Security) as the backend.

---

## 1. Install dependencies

```bash
npm install
```

## 2. Configure Supabase

Project URL is already set for this build:

```
https://wfxkfyouobtoogjftemc.supabase.co
```

1. In the Supabase dashboard, go to **Project Settings → API** and copy the
   **anon / publishable** key (never the `service_role` key).
2. Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://wfxkfyouobtoogjftemc.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

The `service_role` key is never used anywhere in this frontend — all privileged
operations (XP awarding, proof approval, admin actions) go through `SECURITY DEFINER`
Postgres functions instead, so the anon key alone is safe to ship to the browser.

## 3. Run the database migrations

The `supabase/migrations` folder contains everything, in order:

| File | What it does |
|---|---|
| `0001_schema.sql` | Tables, enums, indexes, default settings |
| `0002_rls.sql` | Row Level Security policies on every table |
| `0003_functions.sql` | Secure RPCs: signup handler, `submit_proof`, `approve_proof`, `reject_proof`, `feature_task`, `unfeature_task`, `create_task` |
| `0004_storage.sql` | Private `proofs` storage bucket + access policies |
| `0005_rotation.sql` | Fair-rotation feed RPCs (`get_featured_feed`, `get_rotation_feed`) |

Apply them with the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref wfxkfyouobtoogjftemc
npx supabase db push
```

Or paste each file's contents into the Supabase dashboard's **SQL Editor**, in order,
and run them one at a time.

## 4. Configure Authentication

In the Supabase dashboard → **Authentication → Providers**, make sure **Email** is
enabled. Under **Authentication → URL Configuration**, set:

- **Site URL**: your deployed URL (or `http://localhost:5173` for local dev)
- **Redirect URLs**: add `http://localhost:5173/reset-password` and your production
  equivalent, e.g. `https://your-domain.com/reset-password`

Every new signup automatically gets a row in `public.app_users` via the
`handle_new_user` trigger (role defaults to `user`).

## 5. Configure Storage

Migration `0004_storage.sql` already creates a **private** `proofs` bucket with
policies so:
- users can upload/view/delete only inside their own `{user_id}/...` folder
- admins can view any file (for review)
- nothing is publicly accessible

No manual bucket setup is needed if you ran the migrations — just confirm in
**Storage** that the `proofs` bucket exists and is marked private.

## 6. Configure Row Level Security

RLS is enabled on every table via `0002_rls.sql`. Key guarantees enforced at the
database layer (not just the frontend):
- users can never set their own `role` to `admin` or edit their own `xp`
- XP is only ever written by the `approve_proof()` function
- a user cannot submit proof for their own task (`submit_proof()` checks this)
- a user cannot submit the same task twice (`unique (task_id, user_id)` on `proofs`)
- `create_task()` re-checks the 100 XP requirement server-side, not just in the UI

## 7. Create the first admin

The main administrator account is intended to be:

- **Username:** `TimoScope`
- **Email:** `timothydabere@gmail.com`

Steps:
1. Sign up normally through the app (or Supabase Auth dashboard) with that email.
2. In the Supabase **SQL Editor**, run:

```sql
update public.app_users set role = 'admin' where email = 'timothydabere@gmail.com';
```

3. Log out and back in — the Admin link now appears in the header, and `/admin`
   becomes accessible.

## 8. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`.

## 9. Deploy

Recommended: **Vercel**.

1. Push this project to a GitHub repo.
2. Import it in Vercel.
3. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   in Vercel's Project Settings → Environment Variables.
4. Deploy. Vercel auto-detects the Vite build (`npm run build`, output `dist/`).
5. Add your Vercel domain to Supabase's **Redirect URLs** (step 4 above).

## 10. Test the full flow before going live

- **Auth:** sign up → confirm email → log in → log out → forgot password → reset password.
- **Task flow:** open a task card → read instructions → "I Understand — Open Profile"
  → perform the action on the real platform → come back → instructions shown again →
  upload a screenshot → submit → status becomes Pending.
- **Approval:** as admin, open Proof Review → approve → confirm the user's XP
  increased by exactly 10 and they got a notification.
- **Rejection:** reject a different proof with a reason → confirm the user sees the
  reason on My Tasks and XP is unchanged, with no appeal option shown.
- **XP unlock:** get a test user to 100 approved XP → confirm Add Profile unlocks and
  the database-side check in `create_task()` also blocks it below threshold (try
  calling the RPC directly with an under-threshold user to confirm it's rejected).
- **Security:** as a normal user, try (via the browser console) to `update` your own
  `xp` or `role` directly through the Supabase client — confirm RLS rejects it.
- **Duplicate protection:** try submitting proof for the same task twice — second
  attempt should fail.
- **Self-task protection:** try submitting proof for your own task — should fail.
- **Rotation:** confirm featured profiles stay pinned at the top and outside the
  rotation pool while featured; unfeature one and confirm it re-enters rotation.
- **Featured limits:** feature 5 profiles, confirm a 6th is blocked with the correct
  message; reorder with ↑/↓ and confirm positions swap cleanly.
- **Mobile:** run through the whole flow on an actual Android phone (or Chrome's
  device emulator at minimum) — bottom nav, upload from Gallery, modals, and the
  floating "Need a Website?" tab should all behave.

---

## Project structure

```
supabase/migrations/   SQL schema, RLS, functions, storage, rotation
src/lib/                Supabase client, shared types
src/context/            Auth context/provider
src/components/         Header, nav, task card/modal, widgets, route guards
src/pages/               User-facing pages
src/pages/admin/         Admin dashboard pages
```

## A note on platform rules

SocialGrow does not automate, script, or fake any social-media activity. Every task
requires the member to genuinely perform the action before submitting proof, and the
Rules page reminds members to only participate in ways each platform's own terms
allow.
