// M22 MP09b: where the broker directory and /go read partners from. With the "partners" store group
// switched (PIPSTART_STORE_FAMILIES), the deployment's sealed live generation is the only authority;
// otherwise the deployment-controlled register in content/ is used, as before. Read once per server.
import "server-only";

import { providerLinks as codeLinks } from "../content/provider-links";
import { providers as codeProviders } from "../content/providers";
import { liveGeneration } from "./content/live-generation";
import {
  parsePartnerSnapshot,
  type PartnerDirectory,
} from "./content/partner-snapshot";
import { validateProviderDirectory } from "./provider-directory";

let cached: PartnerDirectory | undefined;

export function providerDirectory(): PartnerDirectory {
  if (cached) return cached;
  const live = liveGeneration();
  if (live?.groups.includes("partners")) {
    cached = parsePartnerSnapshot(live.snapshot);
  } else {
    validateProviderDirectory(codeProviders, codeLinks);
    cached = { providers: codeProviders, links: codeLinks };
  }
  return cached;
}
