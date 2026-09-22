"use client";

import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";

type LearnerNavigationAction = {
  href: "/dashboard" | "/login";
  label: "Dashboard" | "Log in";
};

const anonymousAction: LearnerNavigationAction = {
  href: "/login",
  label: "Log in",
};
const authenticatedAction: LearnerNavigationAction = {
  href: "/dashboard",
  label: "Dashboard",
};

const LearnerNavigationContext =
  createContext<LearnerNavigationAction | null>(null);

export function LearnerNavigationProvider({
  authenticated,
  children,
}: {
  authenticated: boolean;
  children: ReactNode;
}) {
  return (
    <LearnerNavigationContext.Provider
      value={authenticated ? authenticatedAction : anonymousAction}
    >
      {children}
    </LearnerNavigationContext.Provider>
  );
}

export function useLearnerNavigationAction() {
  return useContext(LearnerNavigationContext);
}

export function LearnerNavigationLink({
  className,
}: {
  className?: string;
}) {
  const action = useLearnerNavigationAction();
  if (!action) return null;

  return (
    <Link className={className} href={action.href}>
      {action.label}
    </Link>
  );
}
