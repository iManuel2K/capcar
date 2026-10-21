"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthStatus } from "./auth-config";

/** Presentation only; protected routes keep their existing server-side auth checks. */
export function useNavigationAuth() {
  // Keep public environment references explicit so Next can inline them for the browser.
  const configured = getAuthStatus({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  }).configured;
  // Do not flash Sign in while the existing browser client restores a saved session.
  const [status, setStatus] = useState<"pending" | "signed-in" | "signed-out">(
    configured ? "pending" : "signed-out",
  );

  useEffect(() => {
    if (!configured) return;
    let active = true;
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((_event, session) => {
      if (active) setStatus(session?.user ? "signed-in" : "signed-out");
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  return {
    showSignIn: status === "signed-out",
    signedIn: status === "signed-in",
  };
}
