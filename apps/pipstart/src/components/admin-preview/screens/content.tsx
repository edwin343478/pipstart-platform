import type { ReactNode } from "react";

import { Icon, type IconName } from "../icons";
import {
  Alert,
  Avatar,
  Badge,
  type BadgeKind,
  Btn,
  CheckItem,
  Choice,
  Chip,
  DataTable,
  Dialog,
  Field,
  Grid,
  Hash,
  Heading,
  ListItem,
  Pager,
  Panel,
  Pill,
  SearchBox,
  SelectBox,
  Tabs,
  Toolbar,
  Two,
  cx,
} from "../primitives";
import s from "../admin-preview.module.css";

// ---------------------------------------------------------------- C1
const LIBRARY_ROWS: Array<
  [
    string,
    "Lesson" | "Module" | "Quiz",
    string,
    BadgeKind,
    string,
    string,
    string,
    string,
  ]
> = [
  [
    "Bid, ask and spread",
    "Lesson",
    "Forex Foundations",
    "draft",
    "Draft",
    "7",
    "Grace Njeri",
    "Today 13:12",
  ],
  [
    "Pips and lots",
    "Lesson",
    "Forex Foundations",
    "published",
    "Published",
    "5",
    "Salma Khan",
    "Today 11:04",
  ],
  [
    "Averages and momentum",
    "Lesson",
    "Chart Foundations",
    "review",
    "In review",
    "3",
    "Grace Njeri",
    "Today 10:31",
  ],
  [
    "Chart Foundations: reading candles",
    "Lesson",
    "Chart Foundations",
    "review",
    "In review",
    "2",
    "Grace Njeri",
    "Yesterday",
  ],
  [
    "Position size basics",
    "Lesson",
    "Risk Foundations",
    "approved",
    "Approved",
    "4",
    "Salma Khan",
    "22 Oct",
  ],
  [
    "Forex Foundations quiz",
    "Quiz",
    "Forex Foundations",
    "draft",
    "Draft v4",
    "4",
    "Salma Khan",
    "Today 09:20",
  ],
  [
    "Forex Foundations",
    "Module",
    "—",
    "published",
    "Published",
    "9",
    "Salma Khan",
    "21 Oct",
  ],
  [
    "Spread costs on a $100 account",
    "Lesson",
    "Risk Foundations",
    "sched",
    "Scheduled",
    "6",
    "Grace Njeri",
    "Fri 30 Oct",
  ],
];
const KIND_ICON: Record<"Lesson" | "Module" | "Quiz", IconName> = {
  Lesson: "doc",
  Module: "layers",
  Quiz: "quiz",
};

export function LibraryBody() {
  return (
    <>
      <Heading
        actions={
          <>
            <Btn icon="plus">New lesson</Btn>
            <Btn icon="plus" kind="sec">
              New quiz
            </Btn>
          </>
        }
        eyebrow="Content"
        title="Library"
      >
        Lessons, quizzes and modules. Public pages only change when a revision
        is published.
      </Heading>
      <Tabs
        items={[
          { label: "All", pill: <Pill>38</Pill>, current: true },
          { label: "Lessons", pill: <Pill>29</Pill> },
          { label: "Quizzes", pill: <Pill>6</Pill> },
          { label: "Modules", pill: <Pill>3</Pill> },
          { label: "Needs review", pill: <Pill kind="warn">3</Pill> },
        ]}
      />
      <section aria-label="Content library" className={s.panel}>
        <Toolbar>
          <SearchBox label="Search titles" />
          <SelectBox label="Status">All</SelectBox>
          <SelectBox label="Module">All</SelectBox>
        </Toolbar>
        <DataTable
          caption="Lessons, quizzes and modules"
          cols="minmax(0,2.1fr) minmax(0,1.3fr) 7.5rem 4.5rem minmax(0,1.1fr) 5rem"
          head={["Title", "Module", "Status", "Rev", "Last edited by", ""]}
          rows={LIBRARY_ROWS.map(
            ([title, kind, module, badge, status, rev, who, when]) => ({
              cells: [
                {
                  label: "Title",
                  className: "main" as const,
                  node: (
                    <div className={cx(s.row, s.nw)}>
                      <Avatar icon={KIND_ICON[kind]} kind="soft" size="sm" />
                      <div style={{ minWidth: 0 }}>
                        <span className={s.t}>{title}</span>
                        <span className={s.s}>{kind}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  label: "Module",
                  node: <span className={s.muted}>{module}</span>,
                },
                { label: "Status", node: <Badge kind={badge}>{status}</Badge> },
                { label: "Rev", node: <span className={s.mono}>{rev}</span> },
                { label: "Edited", node: <Two sub={when} title={who} /> },
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
            }),
          )}
        />
        <Pager>Showing 1–8 of 38</Pager>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- C2
const MODULE_LESSONS: Array<[string, BadgeKind, string, string]> = [
  ["Pips and lots", "published", "Published", "5"],
  ["Bid, ask and spread", "draft", "Draft", "7"],
  ["Leverage in plain words", "published", "Published", "3"],
  ["Position size basics", "approved", "Approved", "4"],
  ["Reading a price quote", "published", "Published", "6"],
  ["Your first demo trade (practice only)", "draft", "Draft", "1"],
];

export function ModuleBody() {
  return (
    <>
      <Heading
        actions={
          <Btn icon="plus" kind="sec">
            Add lesson
          </Btn>
        }
        crumbs={["Library", "Modules", "Forex Foundations"]}
        eyebrow="Content"
        title="Forex Foundations"
      >
        Module settings and lesson order.
      </Heading>
      <Grid kind="gmain">
        <div>
          <Panel
            meta="6 lessons · order shown to learners"
            pad={false}
            title="Lessons in this module"
          >
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {MODULE_LESSONS.map(([title, kind, label, rev], index) => (
                <li key={title}>
                  <div className={s.li}>
                    <span className={cx(s.ico, s.s)}>
                      <Icon name="grip" />
                    </span>
                    <span
                      className={s.mono}
                      style={{
                        width: "1.4rem",
                        paddingTop: ".35rem",
                        color: "var(--muted)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <div className={s.bd}>
                      <b>{title}</b>
                      <span>Revision {rev}</span>
                    </div>
                    <div className={s.acts}>
                      <Badge kind={kind}>{label}</Badge>
                      <button
                        aria-label={`Move ${title} up`}
                        className={cx(s.btn, s.sec, s.sm)}
                        type="button"
                      >
                        <Icon name="up" />
                      </button>
                      <button
                        aria-label={`Move ${title} down`}
                        className={cx(s.btn, s.sec, s.sm)}
                        type="button"
                      >
                        <Icon name="down" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <div>
          <Panel title="Module details">
            <Field label="Title" value="Forex Foundations" />
            <Field
              count="148 / 300"
              kind="textarea"
              label="Summary"
              value="Learn how currency prices are quoted and how to read them, with practice-only examples. Educational content only."
            />
            <Field kind="select" label="Level" value="Beginner" />
            <Field
              hint="Locked after first publish. Changing it needs a redirect plan from the Owner."
              label="Address (slug)"
              lock
              value="forex-foundations"
            />
            <Field label="Public path" lock value="/learn/forex-foundations" />
          </Panel>
          <Panel title="Save">
            <div className={s.row}>
              <Btn icon="check">Save draft</Btn>
              <Btn icon="eye" kind="sec">
                Preview
              </Btn>
            </div>
            <p className={cx(s.muted, s.xs)} style={{ marginTop: ".7rem" }}>
              Saving makes a new revision. Learners see nothing until you
              publish.
            </p>
          </Panel>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- C3 / C6
function Block({
  active,
  children,
  label,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <div className={cx(s.blk, active && s.act)}>
      <div className={s.bh}>
        <Icon name="grip" />
        {label}
        <span className={s.r}>
          <button
            aria-label={`Move ${label} up`}
            className={s.iconBtn}
            type="button"
          >
            <Icon name="up" />
          </button>
          <button
            aria-label={`Move ${label} down`}
            className={s.iconBtn}
            type="button"
          >
            <Icon name="down" />
          </button>
          <button
            aria-label={`Delete ${label}`}
            className={s.iconBtn}
            type="button"
          >
            <Icon name="trash" />
          </button>
        </span>
      </div>
      <div className={s.bb}>{children}</div>
    </div>
  );
}

export function LessonEditorBody() {
  const ink = { color: "var(--ink)" };
  return (
    <>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <span>Library</span>
        <Icon name="chevR" />
        <span>Forex Foundations</span>
        <Icon name="chevR" />
        <b aria-current="page">Bid, ask and spread</b>
      </nav>
      <div className={s.phrow}>
        <div className={s.ph}>
          <p className={s.eyebrow}>Lesson · Forex Foundations</p>
          <h1>Bid, ask and spread</h1>
          <div className={s.row} style={{ marginTop: ".5rem" }}>
            <Badge kind="draft">Draft · revision 7</Badge>
            <Chip icon="edit" kind="warn">
              Unsaved changes
            </Chip>
            <span className={cx(s.muted, s.small)}>
              Last saved 2 min ago by Grace Njeri
            </span>
          </div>
        </div>
        <div className={cx(s.row, s.right)} style={{ marginTop: ".2rem" }}>
          <Btn icon="eye" kind="sec">
            Preview
          </Btn>
          <Btn icon="check">Save draft</Btn>
        </div>
      </div>
      <Grid kind="gmain">
        <div>
          <Block label="Heading">
            <h3>Two prices for one pair</h3>
          </Block>
          <Block active label="Paragraph · editing">
            Every currency pair is quoted with two prices. The{" "}
            <b style={ink}>bid</b> is what the market pays when you sell; the{" "}
            <b style={ink}>ask</b> is what you pay when you buy. The gap between
            them is the <b style={ink}>spread</b>.
            <div className={s.row} style={{ marginTop: ".6rem" }}>
              <button className={cx(s.tag, s.slate)} type="button">
                Bold
              </button>
              <button className={cx(s.tag, s.slate)} type="button">
                Italic
              </button>
              <button className={cx(s.tag, s.slate)} type="button">
                Link
              </button>
              <span className={cx(s.muted, s.xs)}>412 characters</span>
            </div>
          </Block>
          <Block label="Worked example">
            <b style={ink}>EUR/USD quote:</b> bid 1.0850 · ask 1.0852. The
            spread is 0.0002, or 2 pips. Practice numbers only.
          </Block>
          <Block label="Risk note">
            Trading leveraged products can lose money quickly. This lesson is
            education, not advice and not a promise of results.
          </Block>
          <Block label="Key points">
            • Two prices: bid and ask &nbsp;• Spread is a cost you pay on entry
            &nbsp;• Wider spreads can mean higher cost
          </Block>
          <div className={s.row}>
            <Btn icon="plus" kind="sec">
              Add block
            </Btn>
            <span className={cx(s.muted, s.xs)}>
              Heading · Paragraph · Example · Callout · Key points · Image
            </span>
          </div>
        </div>
        <div>
          <Panel title="Lesson details">
            <Field label="Title" value="Bid, ask and spread" />
            <Field
              hint="Locked after first publish."
              label="Address (slug)"
              lock
              value="bid-ask-spread"
            />
            <Field kind="select" label="Reading time" value="6 min" />
          </Panel>
          <Panel title="Sources">
            <ListItem
              icon="doc"
              sub="Triennial survey · checked 9 Oct 2026"
              tone="s"
            >
              Bank for International Settlements
            </ListItem>
            <ListItem
              icon="doc"
              sub="Spread definition · checked 9 Oct 2026"
              tone="s"
            >
              Deriv.com help centre
            </ListItem>
            <Btn icon="plus" kind="sec" size="sm">
              Add source
            </Btn>
          </Panel>
          <Panel title="Before you submit">
            <CheckItem>Risk wording present</CheckItem>
            <CheckItem>No promise of profit or results</CheckItem>
            <CheckItem>At least one source cited</CheckItem>
            <CheckItem>No affiliate link inside the lesson body</CheckItem>
            <CheckItem on={false} sub="Quiz v4 is still a draft">
              Quiz linked to a published version
            </CheckItem>
          </Panel>
          <div className={s.row} style={{ marginTop: "1.1rem" }}>
            <Btn disabled icon="send">
              Submit for review
            </Btn>
          </div>
          <p className={cx(s.muted, s.xs)} style={{ marginTop: ".5rem" }}>
            Complete the checklist to submit. Authors cannot publish.
          </p>
        </div>
      </Grid>
    </>
  );
}

export function ConflictOverlay() {
  return (
    <Dialog
      description={
        <>
          You started from revision 7. <b>Salma Khan</b> saved revision 8 two
          minutes ago. Your changes have not been saved and are still on this
          page.
        </>
      }
      footer={
        <>
          <Btn kind="sec">Cancel</Btn>
          <Btn icon="check">Continue</Btn>
        </>
      }
      icon="alert"
      title="Someone saved this lesson before you"
      tone="w"
      wide
    >
      <div className={s.cols2} style={{ marginBottom: ".9rem" }}>
        <div className={cx(s.card, s.dim)}>
          <b className={s.small}>Your version</b>
          <p className={cx(s.muted, s.small)} style={{ marginTop: ".3rem" }}>
            Edited paragraph “Two prices for one pair”.
          </p>
        </div>
        <div className={cx(s.card, s.dim)}>
          <b className={s.small}>Latest saved (revision 8)</b>
          <p className={cx(s.muted, s.small)} style={{ marginTop: ".3rem" }}>
            Salma changed the same paragraph and added a source.
          </p>
        </div>
      </div>
      <Choice
        checked
        name="conflict"
        sub="Safest. Nothing is lost; you merge later."
        type="radio"
      >
        Keep both: save mine as a separate draft copy
      </Choice>
      <Choice name="conflict" sub="Opens a side-by-side compare." type="radio">
        Review the differences first
      </Choice>
      <Choice
        name="conflict"
        sub="Your edits are removed from this page."
        type="radio"
      >
        Use the latest and discard my changes
      </Choice>
    </Dialog>
  );
}

// ---------------------------------------------------------------- C4
const REVISIONS: Array<[string, BadgeKind, string, string, string, boolean]> = [
  [
    "7",
    "draft",
    "Draft",
    "Grace Njeri · today 13:12",
    "Added worked example and risk note",
    true,
  ],
  [
    "6",
    "review",
    "Reviewed",
    "Grace Njeri · yesterday",
    "Changes requested by David Otieno",
    false,
  ],
  [
    "5",
    "published",
    "Published",
    "Salma Khan · 14 Oct",
    "Live since 14 Oct 09:00",
    false,
  ],
  [
    "4",
    "arch",
    "Superseded",
    "Grace Njeri · 12 Oct",
    "Rewrote spread explanation",
    false,
  ],
  ["3", "arch", "Superseded", "Grace Njeri · 9 Oct", "First full draft", false],
];

export function RevisionsBody() {
  return (
    <>
      <Heading
        crumbs={[
          "Library",
          "Forex Foundations",
          "Bid, ask and spread",
          "Revisions",
        ]}
        eyebrow="Content"
        title="Bid, ask and spread"
      >
        Every saved revision, newest first.
      </Heading>
      <Grid kind="gmainRev">
        <ol className={s.feed} aria-label="Revisions, newest first">
          {REVISIONS.map(([n, kind, label, who, note, selected]) => (
            <li key={n}>
              <span className={cx(s.marker, kind === "published" && s.live)}>
                <Icon name="doc" />
              </span>
              <div className={cx(s.card, selected && s.sel)}>
                <div className={s.row} style={{ marginBottom: ".3rem" }}>
                  <b>Revision {n}</b>
                  <Badge kind={kind}>{label}</Badge>
                </div>
                <p className={cx(s.muted, s.small)}>{who}</p>
                <p className={s.small} style={{ marginTop: ".2rem" }}>
                  {note}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div>
          <section aria-labelledby="compare-title" className={s.panel}>
            <div className={s.ph2}>
              <h2 id="compare-title">Compare</h2>
              <span className={s.m}>4 changes · 0 sources changed</span>
            </div>
            <div className={s.diffhead}>
              Revision 5 (published) → revision 7 (draft)
            </div>
            <div className={s.diffrow}>
              <i />
              <div>
                <b>Two prices for one pair</b>
              </div>
            </div>
            <div className={cx(s.diffrow, s.del)}>
              <i aria-label="Removed">−</i>
              <div>
                The gap between the two prices is called the spread, and it is{" "}
                <mark>always small</mark>.
              </div>
            </div>
            <div className={cx(s.diffrow, s.add)}>
              <i aria-label="Added">+</i>
              <div>
                The gap between the two prices is called the spread, and it is{" "}
                <mark>a cost you pay on entry</mark>.
              </div>
            </div>
            <div className={cx(s.diffrow, s.add)}>
              <i aria-label="Added">+</i>
              <div>
                <mark>
                  Worked example · EUR/USD bid 1.0850, ask 1.0852. Spread 2 pips
                  (practice numbers).
                </mark>
              </div>
            </div>
            <div className={cx(s.diffrow, s.add)}>
              <i aria-label="Added">+</i>
              <div>
                <mark>
                  Risk note · Trading leveraged products can lose money quickly.
                </mark>
              </div>
            </div>
            <div className={s.diffrow}>
              <i />
              <div className={s.muted}>3 unchanged blocks hidden</div>
            </div>
          </section>
          <Panel title="Restore an older revision">
            <p
              className={s.muted}
              style={{
                marginBottom: ".8rem",
                fontSize: ".75rem",
                lineHeight: 1.6,
              }}
            >
              Restoring revision 5 creates <b>revision 8 as a new draft</b>.
              Nothing is overwritten and nothing goes live.
            </p>
            <div className={s.row}>
              <Btn icon="restore" kind="sec">
                Restore revision 5 as draft
              </Btn>
              <Btn icon="layers" kind="sec">
                Compare other revisions
              </Btn>
            </div>
          </Panel>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- C5 / E1
export function ReviewBody({ approved = false }: { approved?: boolean }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <span>Review queue</span>
        <Icon name="chevR" />
        <b aria-current="page">Bid, ask and spread</b>
      </nav>
      <div className={s.phrow}>
        <div className={s.ph}>
          <p className={s.eyebrow}>Review · Forex Foundations</p>
          <h1>Bid, ask and spread</h1>
          <div className={s.row} style={{ marginTop: ".5rem" }}>
            {approved ? (
              <Badge kind="approved">Approved · ready to publish</Badge>
            ) : (
              <Badge kind="review">In review</Badge>
            )}
            <span className={cx(s.muted, s.small)}>
              Submitted by Grace Njeri · today 13:20
            </span>
          </div>
        </div>
      </div>
      <Grid kind="gmain">
        <div>
          <Panel meta="Open full compare" pad={false} title="What changed">
            <div className={cx(s.diffrow, s.del)}>
              <i aria-label="Removed">−</i>
              <div>
                The gap … is called the spread, and it is{" "}
                <mark>always small</mark>.
              </div>
            </div>
            <div className={cx(s.diffrow, s.add)}>
              <i aria-label="Added">+</i>
              <div>
                The gap … is called the spread, and it is{" "}
                <mark>a cost you pay on entry</mark>.
              </div>
            </div>
            <div className={cx(s.diffrow, s.add)}>
              <i aria-label="Added">+</i>
              <div>
                <mark>Worked example and risk note added.</mark>
              </div>
            </div>
          </Panel>
          <Panel title="You are approving this exact revision">
            <dl className={s.kv}>
              <dt>Revision</dt>
              <dd>7 (of 7)</dd>
              <dt>Fingerprint</dt>
              <dd>
                <Hash>sha256 9c1e7a40…d4fa2b81</Hash>
              </dd>
              <dt>Compared with</dt>
              <dd>Revision 5 (live) · 4 changes</dd>
              <dt>Author</dt>
              <dd>Grace Njeri</dd>
            </dl>
            <Alert
              icon="lock"
              style={{ marginTop: "1rem" }}
              title="Approval is tied to this fingerprint"
            >
              If anyone edits the lesson after you approve, the approval no
              longer applies and it returns to review.
            </Alert>
          </Panel>
        </div>
        <div>
          {approved ? (
            <Panel title="Decision">
              <Alert kind="ok" title="Approved by You">
                Today 13:52 · fingerprint 9c1e…2b81 matches revision 7.
              </Alert>
              <div className={s.row} style={{ marginTop: "1rem" }}>
                <Btn icon="send">Publish or schedule…</Btn>
                <Btn icon="restore" kind="sec">
                  Undo approval
                </Btn>
              </div>
            </Panel>
          ) : (
            <Panel title="Your review">
              <Choice checked>Facts match the sources cited</Choice>
              <Choice checked>No promise of profit or results</Choice>
              <Choice checked>Risk wording is clear and visible</Choice>
              <Choice>Links open the right pages</Choice>
              <div style={{ marginTop: ".8rem" }}>
                <Field
                  kind="textarea"
                  label="Comment for the author"
                  placeholder="Say what is good and what to change…"
                />
              </div>
              <div className={s.row}>
                <Btn icon="check">Approve this revision</Btn>
                <Btn icon="edit" kind="sec">
                  Request changes
                </Btn>
              </div>
              <p className={cx(s.muted, s.xs)} style={{ marginTop: ".7rem" }}>
                <Icon name="shield" /> You are not the author, so you can
                approve. Authors cannot approve their own work.
              </p>
            </Panel>
          )}
        </div>
      </Grid>
    </>
  );
}

export function ReviewScreenBody() {
  return <ReviewBody />;
}
