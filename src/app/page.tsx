export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold tracking-wide text-zinc-900">
              Smart Bookmarks
            </p>
            <p className="text-xs text-zinc-500">
              PR 1 scaffold: auth and data wiring comes next
            </p>
          </div>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled
          >
            Sign in with Google (next PR)
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5">
          <h1 className="text-xl font-semibold text-zinc-900">
            Private Bookmark Manager
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            This baseline sets up Next.js + Tailwind + Supabase client helpers.
            Google login, database, and realtime updates are implemented in
            upcoming PRs.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-base font-semibold text-zinc-900">
            Bookmarks (placeholder)
          </h2>
          <div className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-600">
              No bookmark data yet. CRUD + realtime list rendering will be added
              after auth and RLS setup.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
