import type { EducationalCourse } from "@repo/types";
import { Card } from "@repo/ui";
import type { ReactNode } from "react";

import { ClockIcon, LevelIcon, SignalOffIcon, TagIcon } from "./stat-icons";

interface Props {
  course: EducationalCourse;
}

export function CourseOverviewCard({ course }: Props) {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-px">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-70%] animate-[glow-rotate_6s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, transparent 72%, var(--brand-accent) 84%, var(--brand-primary) 92%, transparent 100%)",
        }}
      />

      <Card
        padded={false}
        className="relative w-full border-0 bg-surface p-8"
      >
        <div className="mb-6 text-center">
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.15em] text-brand-accent">
            Course overview
          </span>
        </div>

        <div className="divide-y divide-border">
          <OverviewRow icon={<ClockIcon />} label="Duration">
            {course.durationDays} days
          </OverviewRow>

          <OverviewRow icon={<LevelIcon />} label="Level">
            Beginner
          </OverviewRow>

          <OverviewRow icon={<TagIcon />} label="Cost">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-accent">
              Free
            </span>
          </OverviewRow>

          <OverviewRow icon={<SignalOffIcon />} label="Trading signals">
            None
          </OverviewRow>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-brand-primary"
            />

            <span className="text-xs text-muted">
              Development preview — no data is transmitted or stored
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function OverviewRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true">{icon}</span>

        <span className="text-sm text-muted">{label}</span>
      </div>

      <span className="font-heading text-sm font-semibold text-foreground">
        {children}
      </span>
    </div>
  );
}