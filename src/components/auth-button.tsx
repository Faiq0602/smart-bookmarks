"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthButtonProps = {
  isAuthenticated: boolean;
};

export function AuthButton({ isAuthenticated }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSignIn() {
    setIsLoading(true);
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);
  }

  async function handleSignOut() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    setIsLoading(false);
  }

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900"
        disabled={isLoading}
      >
        {isLoading ? "Signing out..." : "Sign out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      disabled={isLoading}
    >
      {isLoading ? "Redirecting..." : "Sign in with Google"}
    </button>
  );
}
