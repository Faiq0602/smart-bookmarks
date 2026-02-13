"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RealtimeBookmarksSyncProps = {
  userId: string;
};

export function RealtimeBookmarksSync({ userId }: RealtimeBookmarksSyncProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const initRealtime = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }

      if (cancelled) {
        return;
      }

      const channel = supabase
        .channel(`bookmarks-realtime-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
          },
          (payload) => {
            const newUserId =
              payload.new && "user_id" in payload.new
                ? String(payload.new.user_id)
                : null;
            const oldUserId =
              payload.old && "user_id" in payload.old
                ? String(payload.old.user_id)
                : null;

            const shouldRefresh =
              newUserId === userId ||
              oldUserId === userId ||
              payload.eventType === "DELETE";

            if (shouldRefresh) {
              router.refresh();
            }
          },
        )
        .subscribe();

      return channel;
    };

    const activeChannelPromise = initRealtime();

    return () => {
      cancelled = true;
      void activeChannelPromise.then((channel) => {
        if (channel) {
          void supabase.removeChannel(channel);
        }
      });
    };
  }, [router, userId]);

  return <p className="mt-2 text-xs text-zinc-500">Live updates are enabled.</p>;
}
