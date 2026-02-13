import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold tracking-wide text-zinc-900">
              Smart Bookmarks
            </p>
            <p className="text-xs text-zinc-500">
              {user ? `Signed in as ${user.email}` : "Sign in to manage bookmarks"}
            </p>
          </div>
          <AuthButton isAuthenticated={Boolean(user)} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5">
          <h1 className="text-xl font-semibold text-zinc-900">
            Private Bookmark Manager
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Sign in with Google to access your private bookmarks. Data model and
            storage are now active, with live updates between open sessions.
          </p>
          {user ? (
            <Link
              href="/bookmarks"
              className="mt-4 inline-block rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
            >
              Go to bookmarks
            </Link>
          ) : null}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-base font-semibold text-zinc-900">
            Current Status
          </h2>
          <div className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-600">
              OAuth auth and bookmark create/read/delete with live updates are
              active.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
