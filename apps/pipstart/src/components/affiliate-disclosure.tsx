import type { ReactNode } from "react";

type AffiliateDisclosureProps = {
  children: ReactNode;
  className?: string;
};

export function AffiliateDisclosure({
  children,
  className,
}: AffiliateDisclosureProps) {
  return (
    <div className={className} role="note" aria-label="Affiliate disclosure">
      <strong>Affiliate disclosure:</strong> {children}
    </div>
  );
}
