import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewScreen } from "@/components/admin-preview/preview-screen";
import { findScreen, screens } from "@/components/admin-preview/registry";
import { requireAdministrator } from "@/lib/auth/session";

type PageProps = { params: Promise<{ screen: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return screens.map((screen) => ({ screen: screen.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const screen = findScreen((await params).screen);
  return {
    title: screen
      ? `${screen.num} ${screen.title} (design preview)`
      : "Design preview",
  };
}

export default async function AdminPreviewScreenPage({ params }: PageProps) {
  await requireAdministrator();
  const { screen } = await params;
  if (!findScreen(screen)) notFound();
  return <PreviewScreen id={screen} />;
}
