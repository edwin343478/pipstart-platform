import type { Metadata } from "next";

import { CourseConfirmationCard } from "@/components/course-confirmation-card";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Confirm Your Course",

  description: "Confirm your Skillcima Forex Foundations course enrolment.",

  robots: {
    index: false,
    follow: false,
  },

  referrer: "no-referrer",
};

export default function ConfirmPage() {
  return (
    <PageShell>
      <article>
        <CourseConfirmationCard />
      </article>
    </PageShell>
  );
}
