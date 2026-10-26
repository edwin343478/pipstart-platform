import type { Metadata } from "next";

import { PreviewGallery } from "@/components/admin-preview/gallery";
import { requireAdministrator } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Milestone 22 design preview" };

export default async function AdminPreviewPage() {
  await requireAdministrator();
  return <PreviewGallery />;
}
