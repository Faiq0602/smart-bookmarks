import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

async function addBookmark(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!title || !url) {
    redirect("/bookmarks?error=Title+and+URL+are+required");
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    redirect("/bookmarks?error=Please+enter+a+valid+URL");
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    title,
    url,
  });

  if (error) {
    redirect("/bookmarks?error=Could+not+save+bookmark");
  }

  redirect("/bookmarks");
}

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id,title,url,created_at")
    .order("created_at", { ascending: false });

  const params = searchParams ? await searchParams : undefined;
  const errorMessage = params?.error;
  const dbError = error ? "Failed to load bookmarks." : null;

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
            Database-backed bookmarks are now live. Realtime sync and advanced
            interactions are coming soon.
          </p>
        </section>

        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-base font-semibold text-zinc-900">Add Bookmark</h2>
          <form action={addBookmark} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              name="title"
              type="text"
              placeholder="Title"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              required
              maxLength={120}
            />
            <input
              name="url"
              type="url"
              placeholder="https://example.com"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 sm:col-span-2"
              required
            />
            <button
              type="submit"
              className="w-fit rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
            >
              Save bookmark
            </button>
          </form>
          {errorMessage ? (
            <p className="mt-3 text-sm text-red-700">{errorMessage}</p>
          ) : null}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900">
              Saved Bookmarks
            </h2>
            <Link href="/" className="text-sm font-medium text-zinc-900 underline">
              Back to Home
            </Link>
          </div>

          {dbError ? <p className="mt-4 text-sm text-red-700">{dbError}</p> : null}

          {!dbError && (!bookmarks || bookmarks.length === 0) ? (
            <p className="mt-4 text-sm text-zinc-600">No bookmarks yet. Add your first one above.</p>
          ) : null}

          {!dbError && bookmarks && bookmarks.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {(bookmarks as Bookmark[]).map((bookmark) => (
                <li key={bookmark.id} className="rounded-md border border-zinc-200 p-3">
                  <p className="text-sm font-semibold text-zinc-900">{bookmark.title}</p>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-sm text-zinc-700 underline break-all"
                  >
                    {bookmark.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
