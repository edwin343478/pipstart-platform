import type { ReactNode } from "react";

import { Icon, type IconName } from "../icons";
import {
  Alert,
  Avatar,
  Badge,
  type BadgeKind,
  Btn,
  Card,
  DataTable,
  Field,
  Grid,
  Heading,
  ListItem,
  Panel,
  Stat,
  Tag,
  cx,
} from "../primitives";
import s from "../admin-preview.module.css";

// ---------------------------------------------------------------- F1
const PARTNERS: Array<[string, string, string, string, BadgeKind, string]> = [
  [
    "Deriv.com",
    "Broker",
    "Reviewed 9 Oct · expires 7 Jan",
    "3",
    "published",
    "Published",
  ],
  [
    "Example Charting Tool",
    "Tools",
    "Reviewed 2 Oct · expires 31 Dec",
    "1",
    "published",
    "Published",
  ],
  [
    "Sample Education Hub",
    "Learning",
    "Evidence due · expires in 12 days",
    "2",
    "review",
    "Review due",
  ],
  [
    "Example Data Feed",
    "Tools",
    "Draft · not yet reviewed",
    "0",
    "draft",
    "Draft",
  ],
];

export function PartnersBody() {
  return (
    <>
      <Heading
        actions={<Btn icon="plus">Add partner</Btn>}
        eyebrow="Partners"
        title="Partners"
      >
        Partner profiles, evidence reviews and disclosures.
      </Heading>
      <Alert
        style={{ marginBottom: "1.1rem" }}
        title="Partner content is reviewed, not endorsed"
      >
        Every partner page shows an affiliate disclosure. Disclosure text and
        allowed link hosts are protected fields.
      </Alert>
      <section aria-label="Partner list" className={s.panel}>
        <DataTable
          caption="Partners"
          cols="minmax(0,2fr) minmax(0,1.3fr) minmax(0,1.4fr) 4.5rem 7rem 5rem"
          head={["Partner", "Type", "Evidence review", "Links", "Status", ""]}
          rows={PARTNERS.map(([name, type, review, links, kind, status]) => ({
            cells: [
              {
                label: "Partner",
                className: "main" as const,
                node: (
                  <div className={cx(s.row, s.nw)}>
                    <Avatar icon="globe" kind="soft" size="sm" />
                    <span className={s.t}>{name}</span>
                  </div>
                ),
              },
              { label: "Type", node: <span className={s.muted}>{type}</span> },
              {
                label: "Review",
                node: <span className={s.muted}>{review}</span>,
              },
              { label: "Links", node: <span className={s.mono}>{links}</span> },
              { label: "Status", node: <Badge kind={kind}>{status}</Badge> },
              {
                label: "",
                className: "act" as const,
                node: (
                  <Btn kind="sec" size="sm">
                    Open
                  </Btn>
                ),
              },
            ],
          }))}
        />
      </section>
    </>
  );
}

// ---------------------------------------------------------------- F2
export function PartnerEditorBody() {
  return (
    <>
      <Heading
        crumbs={["Partners", "Deriv.com"]}
        eyebrow="Partners"
        title="Deriv.com"
      >
        Edit the facts readers see. Protected fields stay locked for your role.
      </Heading>
      <Grid kind="gmain">
        <div>
          <Panel title="Partner facts">
            <Field
              hint="Name and address are set by an Owner."
              label="Name"
              lock
              value="Deriv.com"
            />
            <Field
              count="121 / 280"
              kind="textarea"
              label="Summary"
              value="Online trading platform offering forex and synthetic indices with a practice account. Trading carries risk of loss."
            />
            <Field label="Minimum deposit" value="From USD 5" />
            <Field kind="select" label="Practice (demo) account" value="Yes" />
            <Field
              kind="textarea"
              label="Supported regions"
              value="Kenya and many other countries; check eligibility on the provider’s site."
            />
            <Field
              hint="Reminder is set for 7 Jan 2027 and appears in your reminders."
              label="Evidence checked"
              value="9 Oct 2026"
            />
          </Panel>
          <div className={s.row} style={{ marginTop: "1.1rem" }}>
            <Btn icon="check">Save draft</Btn>
            <Btn icon="eye" kind="sec">
              Preview
            </Btn>
            <Btn icon="send" kind="sec">
              Submit for review
            </Btn>
          </div>
        </div>
        <div>
          <Panel title="Protected fields">
            <Field
              kind="textarea"
              label="Affiliate disclosure text"
              lock
              value="PipStart may earn a commission if you open an account through this link. This does not change our reviews."
            />
            <Field
              label="Allowed link hosts"
              lock
              value="deriv.com · track.deriv.com"
            />
            <Alert
              icon="lock"
              kind="warn"
              style={{ marginTop: ".2rem" }}
              title="Why these are locked"
            >
              Only an Owner or Staff Administrator can change them, because they
              decide what readers are told and where links may point.
            </Alert>
            <div className={s.row} style={{ marginTop: ".9rem" }}>
              <Btn icon="send" kind="sec" size="sm">
                Ask an Owner to change
              </Btn>
            </div>
          </Panel>
          <Panel title="Reader preview">
            <Card>
              <div className={s.row} style={{ marginBottom: ".4rem" }}>
                <b>Deriv.com</b>
                <Tag>Affiliate link</Tag>
              </div>
              <p className={cx(s.muted, s.small)}>
                Online trading platform … Trading carries risk of loss.
              </p>
              <p className={cx(s.muted, s.xs)} style={{ marginTop: ".5rem" }}>
                PipStart may earn a commission if you open an account through
                this link.
              </p>
            </Card>
          </Panel>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- F3
const LINKS: Array<
  [string, string, string, string, BadgeKind, string, boolean]
> = [
  [
    "deriv-signup",
    "Sign-up page",
    "track.deriv.com",
    "ps-••••••3f",
    "published",
    "Live",
    true,
  ],
  [
    "deriv-demo",
    "Practice account",
    "deriv.com",
    "ps-••••••91",
    "published",
    "Live",
    true,
  ],
  [
    "deriv-promo-old",
    "Retired offer",
    "deriv.com",
    "ps-••••••b2",
    "arch",
    "Revoked",
    false,
  ],
];

export function LinksBody() {
  return (
    <>
      <Heading
        actions={<Btn icon="plus">Add link</Btn>}
        crumbs={["Partners", "Deriv.com", "Links"]}
        eyebrow="Partners"
        title="Affiliate links"
      >
        Managed links readers reach through PipStart.
      </Heading>
      <section aria-labelledby="links-title" className={s.panel}>
        <div className={s.ph2}>
          <h2 id="links-title">Deriv.com links</h2>
          <span className={s.m}>
            3 links · 2 live · revoking stops a link at once; pages show the
            safe fallback
          </span>
        </div>
        <DataTable
          caption="Deriv.com affiliate links"
          cols="minmax(0,1.3fr) minmax(0,1.3fr) minmax(0,1.3fr) minmax(0,1.1fr) 6rem 5.5rem"
          head={["Link", "Label", "Host", "Attribution", "Status", ""]}
          rows={LINKS.map(
            ([id, label, host, attribution, kind, status, live]) => ({
              cells: [
                {
                  label: "Link",
                  className: "main" as const,
                  node: <span className={cx(s.t, s.mono)}>{id}</span>,
                },
                {
                  label: "Label",
                  node: <span className={s.muted}>{label}</span>,
                },
                { label: "Host", node: <span className={s.mono}>{host}</span> },
                {
                  label: "Attribution",
                  node: (
                    <span className={cx(s.mono, s.muted)}>{attribution}</span>
                  ),
                },
                { label: "Status", node: <Badge kind={kind}>{status}</Badge> },
                {
                  label: "",
                  className: "act" as const,
                  node: live ? (
                    <Btn icon="x" kind="dng" size="sm">
                      Revoke
                    </Btn>
                  ) : (
                    <span className={cx(s.muted, s.xs)}>
                      Stopped redirecting
                    </span>
                  ),
                },
              ],
            }),
          )}
        />
      </section>
      <div className={s.g2} style={{ marginTop: "1.1rem" }}>
        <div>
          <Panel title="Add a link">
            <Field kind="select" label="Partner" value="Deriv.com" />
            <Field
              error={
                <>
                  This host isn’t on Deriv.com’s allowed list: <b>deriv.com</b>,{" "}
                  <b>track.deriv.com</b>.
                </>
              }
              label="Destination address"
              value="https://deriv-promo.example/offer"
            />
            <Field label="Label" value="Welcome offer" />
            <div className={s.row}>
              <Btn disabled icon="check">
                Save link
              </Btn>
              <Btn kind="sec">Cancel</Btn>
            </div>
          </Panel>
        </div>
        <div>
          <Alert
            icon="shield"
            title="We never click affiliate links to test them"
          >
            Clicking could create false referrals or breach the partner’s terms.
            Link checks look at the address only; a person confirms the page by
            hand.
          </Alert>
          <Alert icon="lock" kind="warn" title="Attribution codes are masked">
            Only the last two characters are shown. The full code is never
            displayed or written to the audit log.
          </Alert>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- G1
function ReminderActions() {
  return (
    <>
      <Btn icon="check" kind="sec" size="sm">
        Acknowledge
      </Btn>
      <Btn icon="users" kind="sec" size="sm">
        Reassign
      </Btn>
    </>
  );
}

export function RemindersBody() {
  return (
    <>
      <Heading eyebrow="Maintenance" title="Review reminders">
        Content and partner reviews that need someone.
      </Heading>
      <Grid kind="gmain">
        <div>
          <Panel meta="2 items" pad={false} title="Overdue">
            <ListItem
              actions={<ReminderActions />}
              icon="clock"
              sub="Due 20 Oct · 3 days overdue · assigned to David Otieno"
              tone="r"
            >
              Review: Bid, ask and spread
            </ListItem>
            <ListItem
              actions={<ReminderActions />}
              icon="clock"
              sub="Due 22 Oct · 1 day overdue · assigned to You"
              tone="r"
            >
              Review: Spread costs on a $100 account
            </ListItem>
          </Panel>
          <Panel meta="3 items" pad={false} title="Due in the next 30 days">
            <ListItem
              actions={<ReminderActions />}
              icon="globe"
              sub="Due 4 Nov · assigned to Lina Abdi"
              tone="w"
            >
              Re-check partner evidence: Sample Education Hub
            </ListItem>
            <ListItem
              actions={<ReminderActions />}
              icon="globe"
              sub="Due 7 Jan 2027 · in 71 days · assigned to Lina Abdi"
              tone="w"
            >
              Re-check partner evidence: Deriv.com
            </ListItem>
            <ListItem
              actions={<ReminderActions />}
              icon="doc"
              sub="Due 12 Nov · assigned to Salma Khan"
              tone="s"
            >
              Annual lesson review: Pips and lots
            </ListItem>
          </Panel>
        </div>
        <div>
          <Alert icon="bell" title="In the app only">
            Nobody gets an email for these. Reminders show here, on the overview
            and as a dot on the Maintenance tab.
          </Alert>
          <Panel title="Review cycles">
            <dl className={s.kv}>
              <dt>Lessons</dt>
              <dd>Every 12 months</dd>
              <dt>Partner evidence</dt>
              <dd>Every 90 days</dd>
              <dt>Quizzes</dt>
              <dd>With each lesson review</dd>
            </dl>
            <p className={cx(s.muted, s.xs)} style={{ marginTop: ".8rem" }}>
              Set by the Owner. A published change restarts the clock.
            </p>
          </Panel>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- G2
const LINK_RESULTS: Array<[string, string, BadgeKind, string]> = [
  [
    "/learn/forex-foundations/old-pips",
    "Bid, ask and spread · block 3",
    "fail",
    "Broken 404",
  ],
  [
    "/learn/risk/position-sizing",
    "Position size basics · block 5",
    "fail",
    "Broken 410",
  ],
  [
    "https://example.org/spreads",
    "Pips and lots · source 2",
    "review",
    "Redirects",
  ],
  [
    "https://example.net/guide",
    "Chart Foundations · source 1",
    "review",
    "Forbidden",
  ],
  [
    "https://example.com/data",
    "Averages and momentum · source 3",
    "draft",
    "Throttled",
  ],
];

export function LinkHealthBody() {
  return (
    <>
      <Heading eyebrow="Maintenance" title="Link health">
        Daily check of internal links and cited sources. Last run today 06:00.
      </Heading>
      <div className={s.gs3} style={{ marginBottom: "1.25rem" }}>
        <Stat alert label="Confirmed broken" value="3">
          404 or 410 twice in a row
        </Stat>
        <Stat label="Redirects" value="5">
          Still work · update the address
        </Stat>
        <Stat label="Forbidden" value="2">
          Site refuses checks · confirm by hand
        </Stat>
        <Stat label="Throttled" value="1">
          Too many requests · retry later
        </Stat>
        <Stat label="Timed out" value="1">
          No answer in 10 s · retry
        </Stat>
        <Stat label="Not checked" value="4">
          Manual or protected links
        </Stat>
      </div>
      <section aria-labelledby="needs-look" className={s.panel}>
        <div className={s.ph2}>
          <h2 id="needs-look">Needs a look</h2>
          <span className={s.m}>Sorted by severity</span>
        </div>
        <DataTable
          caption="Links that need a look"
          cols="minmax(0,2fr) minmax(0,1.6fr) 8.5rem 7rem 5rem"
          head={["Address", "Where it appears", "Result", "Last checked", ""]}
          rows={LINK_RESULTS.map(([address, where, kind, result]) => ({
            cells: [
              {
                label: "Address",
                className: "main" as const,
                node: (
                  <span
                    className={cx(s.t, s.mono)}
                    style={{ fontSize: ".75rem" }}
                  >
                    {address}
                  </span>
                ),
              },
              {
                label: "Where",
                node: <span className={s.muted}>{where}</span>,
              },
              { label: "Result", node: <Badge kind={kind}>{result}</Badge> },
              {
                label: "Checked",
                node: <span className={s.muted}>Today 06:00</span>,
              },
              {
                label: "",
                className: "act" as const,
                node: (
                  <Btn kind="sec" size="sm">
                    Open
                  </Btn>
                ),
              },
            ],
          }))}
        />
      </section>
      <div className={s.g2} style={{ marginTop: "1.1rem" }}>
        <Panel title="Check one external link now">
          <Field focused label="Address" value="https://example.org/spreads" />
          <div className={s.row}>
            <Btn icon="refresh">Run one check</Btn>
          </div>
        </Panel>
        <Panel title="Limits on manual checks">
          <ul
            className={s.stack}
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              color: "var(--slate)",
              fontSize: ".75rem",
            }}
          >
            <li>• 10 checks per hour, per person.</li>
            <li>
              • Only addresses on the approved sources list. Affiliate links are
              never checked.
            </li>
            <li>
              • Reads the address only; follows at most 3 redirects; 10 s
              timeout.
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- H1
function StateCard({
  actions,
  children,
  icon,
  kind,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  icon: IconName;
  kind: "slate" | "soft" | "teal";
  title: string;
}) {
  return (
    <section className={s.panel}>
      <div className={s.pb}>
        <div
          className={cx(s.row, s.nw)}
          style={{ alignItems: "flex-start", gap: ".8rem" }}
        >
          <Avatar
            icon={icon}
            kind={kind}
            style={{ width: "2.2rem", height: "2.2rem" }}
          />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: ".95rem", marginBottom: ".3rem" }}>
              {title}
            </h2>
            <p className={cx(s.muted, s.small)} style={{ lineHeight: 1.6 }}>
              {children}
            </p>
          </div>
        </div>
        {actions ? (
          <div className={s.row} style={{ marginTop: ".9rem" }}>
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SystemStatesBody() {
  return (
    <>
      <Heading eyebrow="System" title="System states">
        Errors and quiet moments, written plainly.
      </Heading>
      <div className={s.g3}>
        <div className={s.stack}>
          <StateCard
            actions={
              <Btn icon="refresh" size="sm">
                Try again
              </Btn>
            }
            icon="lock"
            kind="slate"
            title="Action stopped — nothing changed"
          >
            The audit record could not be written, so the change was not made.
            Try again in a minute; if it keeps happening, tell an Owner.
          </StateCard>
          <StateCard
            actions={
              <>
                <Btn icon="check" size="sm">
                  Stay and save
                </Btn>
                <Btn kind="sec" size="sm">
                  Discard
                </Btn>
              </>
            }
            icon="edit"
            kind="teal"
            title="You have unsaved changes"
          >
            Leaving this page will discard your edits to “Bid, ask and spread”.
          </StateCard>
        </div>
        <div className={s.stack}>
          <StateCard
            actions={
              <Btn icon="refresh" kind="sec" size="sm">
                Check account state
              </Btn>
            }
            icon="alert"
            kind="slate"
            title="Outcome not confirmed"
          >
            We asked for the account to be suspended but could not confirm the
            result. It is not shown as done.
          </StateCard>
          <StateCard
            actions={
              <Btn icon="book" kind="sec" size="sm">
                Go to library
              </Btn>
            }
            icon="book"
            kind="soft"
            title="Nothing here yet"
          >
            No drafts are assigned to you. When an Owner assigns a lesson it
            will appear here.
          </StateCard>
        </div>
        <div className={s.stack}>
          <StateCard
            actions={
              <Btn icon="refresh" kind="sec" size="sm">
                Retry now
              </Btn>
            }
            icon="server"
            kind="slate"
            title="Administration is temporarily unavailable"
          >
            Learners are not affected. Your work is saved as of 14:02. We will
            keep trying to reconnect.
          </StateCard>
          <section
            aria-busy="true"
            aria-label="Loading example"
            className={s.panel}
          >
            <div className={s.pb}>
              <h2 style={{ fontSize: ".95rem", marginBottom: ".8rem" }}>
                Loading
              </h2>
              <span className={s.sk} style={{ width: "60%" }} />
              <span className={s.sk} style={{ width: "90%" }} />
              <span className={s.sk} style={{ width: "75%" }} />
              <span className={s.sk} style={{ width: "40%" }} />
            </div>
          </section>
        </div>
      </div>
      <p className={cx(s.muted, s.xs)} style={{ marginTop: "1rem" }}>
        <Icon name="info" /> These states are shown together for review. Live
        screens show one at a time, next to the content they affect.
      </p>
    </>
  );
}
