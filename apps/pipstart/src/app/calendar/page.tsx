import type { Metadata } from "next";

import { EconomicCalendar } from "./economic-calendar";

export const metadata: Metadata = {
  title: "Economic Calendar",
  description:
    "Track scheduled economic events and learn what their impact ratings mean.",
};

export default function EconomicCalendarPage() {
  return <EconomicCalendar />;
}
