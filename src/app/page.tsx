import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-stone-50 to-zinc-100">
      <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">
              Smart Bookmarks
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-800">
              {user ? `Signed in as ${user.email}` : "Sign in to manage bookmarks"}
            </p>
          </div>
          <AuthButton isAuthenticated={Boolean(user)} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
            AI-enhanced bookmarking
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Save links. Get instant summaries and tags.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Smart Bookmarks helps you collect useful pages and keeps them organized with AI metadata, synced live across your sessions.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {user ? (
              <Link
                href="/bookmarks"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Open dashboard
              </Link>
            ) : (
              <p className="rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
                Sign in with Google to start saving bookmarks.
              </p>
            )}
            <Link
              href="/bookmarks"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              View bookmarks
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Private
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              Each user only sees their own bookmarks through Supabase RLS.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              AI Metadata
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              Gemini generates concise summaries and relevant tags for each saved link.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Realtime
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              Changes sync instantly between open sessions without manual refresh.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
