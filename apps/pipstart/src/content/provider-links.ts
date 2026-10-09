import "server-only";
import type { ProviderLink } from "../lib/provider-directory";

// Central deployment-controlled register. Changes require a deployment in Phase 1.
// Keep existing attribution parameters intact. No visitor IDs or click logs added.
export const providerLinks: readonly ProviderLink[] = [
  {
    id: "deriv",
    providerId: "deriv",
    relationship: "affiliate",
    url: "https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32",
    allowedHosts: ["t.deriv.link"],
    active: true,
    expiresAt: null,
  },
];
