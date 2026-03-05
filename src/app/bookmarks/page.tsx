import { AuthButton } from "@/components/auth-button";
import { RealtimeBookmarksSync } from "@/components/realtime-bookmarks-sync";
import { generateBookmarkMetadata } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  ai_summary: string | null;
  ai_tags: string[];
};

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
  return hasProtocol ? trimmed : `https://${trimmed}`;
}

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
  const rawUrl = String(formData.get("url") ?? "").trim();
  const url = normalizeUrl(rawUrl);

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

  const { data: inserted, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: user.id,
      title,
      url,
      ai_status: "processing",
    })
    .select("id")
    .single();

  if (error) {
    redirect("/bookmarks?error=Could+not+save+bookmark");
  }

  if (inserted?.id) {
    try {
      const metadata = await generateBookmarkMetadata({ title, url });

      await supabase
        .from("bookmarks")
        .update({
          ai_summary: metadata.summary,
          ai_tags: metadata.tags,
          ai_status: "done",
          ai_error: null,
          ai_generated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id)
        .eq("user_id", user.id);
    } catch (generationError) {
      await supabase
        .from("bookmarks")
        .update({
          ai_status: "failed",
          ai_error:
            generationError instanceof Error
              ? generationError.message
              : "AI metadata generation failed",
        })
        .eq("id", inserted.id)
        .eq("user_id", user.id);
    }
  }

  redirect("/bookmarks");
}

async function deleteBookmark(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect("/bookmarks?error=Could+not+delete+bookmark");
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect("/bookmarks?error=Could+not+delete+bookmark");
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
    .select("id,title,url,created_at,ai_summary,ai_tags")
    .order("created_at", { ascending: false });

  const params = searchParams ? await searchParams : undefined;
  const errorMessage = params?.error;
  const dbError = error ? "Failed to load bookmarks." : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-stone-50 to-zinc-100">
      <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">
              Smart Bookmarks
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-800">{user.email}</p>
          </div>
          <AuthButton isAuthenticated />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <section className="mb-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Your Bookmarks
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Add and organize links with AI-generated summaries and tags.
          </p>
          <p className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
            {bookmarks?.length ?? 0} saved bookmark{(bookmarks?.length ?? 0) === 1 ? "" : "s"}
          </p>
          <RealtimeBookmarksSync userId={user.id} />
        </section>

        <section className="mb-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Add Bookmark</h2>
          <form action={addBookmark} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              name="title"
              type="text"
              placeholder="Title"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 sm:col-span-1"
              required
              maxLength={120}
            />
            <input
              name="url"
              type="text"
              placeholder="example.com/article"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-amber-500 sm:col-span-2"
              required
            />
            <button
              type="submit"
              className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Save bookmark
            </button>
          </form>
          <p className="mt-2 text-xs text-zinc-500">
            Tip: You can paste plain domains like <span className="font-medium">github.com</span>.
          </p>
          {errorMessage ? (
            <p className="mt-3 text-sm text-red-700">{errorMessage}</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900">
              Saved Bookmarks
            </h2>
            <Link href="/" className="text-sm font-medium text-zinc-700 underline">
              Back to Home
            </Link>
          </div>

          {dbError ? <p className="mt-4 text-sm text-red-700">{dbError}</p> : null}

          {!dbError && (!bookmarks || bookmarks.length === 0) ? (
            <p className="mt-4 text-sm text-zinc-600">No bookmarks yet. Add your first one above.</p>
          ) : null}

          {!dbError && bookmarks && bookmarks.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {(bookmarks as Bookmark[]).map((bookmark) => (
                <li
                  key={bookmark.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{bookmark.title}</p>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm text-zinc-700 underline"
                      >
                        {bookmark.url}
                      </a>
                      {bookmark.ai_summary ? (
                        <p className="mt-2 text-sm text-zinc-700">{bookmark.ai_summary}</p>
                      ) : null}
                      {bookmark.ai_tags && bookmark.ai_tags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {bookmark.ai_tags.map((tag) => (
                            <span
                              key={`${bookmark.id}-${tag}`}
                              className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 text-xs text-zinc-500">
                        Saved on{" "}
                        {new Date(bookmark.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <form action={deleteBookmark}>
                      <input type="hidden" name="id" value={bookmark.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-white"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
