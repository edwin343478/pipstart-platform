"use client";

import { useEffect, useState, type ReactNode } from "react";

import { LearnerNavigationProvider } from "./learner-navigation-context";

// Render the same anonymous navigation on the server and during hydration.
// Account status is verified by the server after the public page is available;
// a cookie name by itself is never treated as proof of a signed-in account.
export function PublicLearnerNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    let pending: AbortController | null = null;

    async function refresh() {
      if (!active || pending) return;
      const controller = new AbortController();
      pending = controller;
      const timeout = window.setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch("/api/learner-navigation", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const result: unknown = await response.json();
        if (
          active &&
          !controller.signal.aborted &&
          result !== null &&
          typeof result === "object" &&
          "authenticated" in result &&
          typeof result.authenticated === "boolean"
        ) {
          setAuthenticated(result.authenticated);
        }
      } catch {
        // A failed status check must never block teaching content or replace
        // the last server-confirmed navigation with a cookie-based guess.
      } finally {
        window.clearTimeout(timeout);
        if (pending === controller) pending = null;
      }
    }

    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    void refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      pending?.abort();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <LearnerNavigationProvider authenticated={authenticated}>
      {children}
    </LearnerNavigationProvider>
  );
}
