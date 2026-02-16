# Smart Bookmarks

A simple private bookmark manager built with Next.js App Router + Supabase.


# Live Vercel Link
- https://smart-bookmarks-phi.vercel.app/
  
## Features Implemented

- Google OAuth login/signup only (no email/password flow)
- Authenticated users can add bookmarks (title + URL)
- Authenticated users can delete their own bookmarks
- Bookmarks are private per user via Supabase Row Level Security (RLS)
- Realtime bookmark updates across tabs without manual refresh

## Tech Stack

- Next.js (App Router)
- React
- Supabase (Auth, Postgres, Realtime)
- Tailwind CSS
- TypeScript

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Supabase Setup (SQL)

Run this in Supabase SQL Editor:

```sql
create extension if not exists pgcrypto;

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
create index if not exists bookmarks_created_at_idx on public.bookmarks(created_at desc);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own"
on public.bookmarks
for select
using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own"
on public.bookmarks
for insert
with check (auth.uid() = user_id);

drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own"
on public.bookmarks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own"
on public.bookmarks
for delete
using (auth.uid() = user_id);

alter publication supabase_realtime add table public.bookmarks;
alter table public.bookmarks replica identity full;
```

Also set Google OAuth in Supabase Auth and include:

- Site URL: `http://localhost:3000` (and later your Vercel domain)
- Redirect URL: `http://localhost:3000/auth/callback` (and Vercel callback URL)

## Problems Faced and How I Solved Them

1. Realtime looked "partially broken" at first.
I could see new bookmarks sync between tabs, but delete events were inconsistent. That made it confusing because it felt like realtime was working and not working at the same time.
I fixed this in two layers:
- In code, I made delete events trigger a refresh fallback.
- In database config, I set `replica identity full` so delete payloads include enough row data.

2. Getting auth + server actions to play nicely took some iteration.
Initially I had to be careful about where user checks happen and how redirects are handled so unauthorized actions are blocked cleanly.
I moved all create/delete logic to server actions with explicit session checks, then redirected safely on invalid state.

3. RLS setup was easy to get wrong silently.
Without strict policies, features can "work" in development but be insecure.
I enforced per-user policies for select/insert/update/delete and validated behavior by signing in with different accounts and confirming data isolation.


## Verification Done

- `npm run lint` passes
- `npm run build` passes
- Manual test: open two tabs as same user, add/delete in one tab, see auto-update in the other
