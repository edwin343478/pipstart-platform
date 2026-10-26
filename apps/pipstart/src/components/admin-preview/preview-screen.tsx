import { notFound } from "next/navigation";

import { findScreen, neighboursOf } from "./registry";
import { AdminShell } from "./shell";

// Renders one approved Milestone 22 screen with sample data inside the shared
// administration shell. The route that uses this must check the administrator
// itself; this component has no data access of its own.
export function PreviewScreen({ id }: { id: string }) {
  const screen = findScreen(id);
  if (!screen) notFound();
  const { Body, Overlay } = screen;
  return (
    <AdminShell
      meta={screen}
      neighbours={neighboursOf(id)}
      overlay={Overlay ? <Overlay /> : undefined}
    >
      <Body />
    </AdminShell>
  );
}
