"use client";

import { useEffect } from "react";

// CSP belongs to the document, not a client-side route. Calendar entry links
// use plain anchors; leaving must also request a fresh document/header set.
export function CalendarDocumentBoundary() {
  useEffect(() => {
    const leaveCalendar = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      )
        return;
      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(destination.href);
    };
    document.addEventListener("click", leaveCalendar, true);
    return () => document.removeEventListener("click", leaveCalendar, true);
  }, []);
  return null;
}
