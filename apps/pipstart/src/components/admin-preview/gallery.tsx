import Link from "next/link";

import { Alert, Heading, Panel, Tag, cx } from "./primitives";
import { screens } from "./registry";
import { AdminShell, previewHref, type ScreenMeta } from "./shell";
import s from "./admin-preview.module.css";

const galleryMeta: ScreenMeta = {
  group: "Design preview",
  id: "gallery",
  mfa: "MFA verified · 4 min ago",
  nav: "",
  note: "Every approved Milestone 22 screen, in order.",
  num: "M22",
  patch: "MP01",
  role: "Owner",
  roadmap: "",
  shell: "full",
  title: "Screen list",
};

export function PreviewGallery() {
  const groups = Array.from(new Set(screens.map((screen) => screen.group)));
  return (
    <AdminShell meta={galleryMeta} neighbours={{}}>
      <Heading eyebrow="Milestone 22 · MP01" title="Design preview">
        The approved administration screens, built as real pages with sample
        data so they can be reviewed at desktop and phone width before any
        feature is connected.
      </Heading>
      <Alert style={{ marginBottom: "1.25rem" }} title="Nothing here is live">
        These pages show sample data only and none of their buttons do anything.
        Learners cannot see this area. The features behind each screen arrive in
        the later Milestone 22 patches shown on every card.
      </Alert>
      {groups.map((group) => (
        <Panel key={group} title={group}>
          <ul
            className={s.cols2}
            style={{ margin: 0, padding: 0, listStyle: "none" }}
          >
            {screens
              .filter((screen) => screen.group === group)
              .map((screen) => (
                <li key={screen.id}>
                  <Link
                    className={cx(s.card, s.galleryCard)}
                    href={previewHref(screen.id)}
                  >
                    <span className={s.row} style={{ marginBottom: ".35rem" }}>
                      <Tag kind="navy">{screen.num}</Tag>
                      <Tag>{screen.patch}</Tag>
                      <Tag kind="slate">{screen.role}</Tag>
                    </span>
                    <b>{screen.title}</b>
                    <span className={cx(s.muted, s.small, s.block)}>
                      {screen.note}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </Panel>
      ))}
    </AdminShell>
  );
}
