import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth/session";

import { LearnerNavigationProvider } from "./learner-navigation-context";

export async function AuthenticatedNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <LearnerNavigationProvider authenticated={Boolean(user)}>
      {children}
    </LearnerNavigationProvider>
  );
}
