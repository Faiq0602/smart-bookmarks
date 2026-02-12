import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold tracking-wide text-zinc-900">
              Smart Bookmarks
            </p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
          <AuthButton isAuthenticated />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5">
          <h1 className="text-xl font-semibold text-zinc-900">
            Your Bookmarks
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Authentication is now active. Bookmark CRUD and realtime sync are
            implemented in the next PRs.
          </p>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-600">
            No bookmarks yet. Continue to PR 3 and PR 4 for database + CRUD.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Back to Home
          </Link>
        </section>
      </main>
    </div>
  );
}
