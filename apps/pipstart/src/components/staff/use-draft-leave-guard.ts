"use client";
import { useEffect, useRef } from "react";
/** Editor entries and exits use document navigation, so browser Back/close/refresh
 * retain native beforeunload protection rather than racing App Router popstate. */
export function useDraftLeaveGuard(protectedWork: boolean) {
  const current = useRef(protectedWork),
    leaving = useRef(false);
  useEffect(() => {
    current.current = protectedWork;
  }, [protectedWork]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (current.current && !leaving.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        (url.pathname === location.pathname &&
          url.search === location.search &&
          url.hash)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (
        current.current &&
        !window.confirm(
          "Leave this editor? Unsaved work or an unresolved save outcome will be lost from this tab.",
        )
      )
        return;
      leaving.current = true;
      window.location.assign(url.href);
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, []);
}
