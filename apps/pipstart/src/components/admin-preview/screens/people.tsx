import { Icon } from "../icons";
import {
  Alert,
  Avatar,
  Badge,
  Btn,
  DataTable,
  Field,
  Grid,
  Heading,
  ListItem,
  Pager,
  Panel,
  PersonCell,
  Pill,
  SearchBox,
  SelectBox,
  Stat,
  Tabs,
  Tag,
  Toolbar,
  Two,
  cx,
} from "../primitives";
import s from "../admin-preview.module.css";

const ink = { color: "var(--ink)" };

// ---------------------------------------------------------------- B1
export function OverviewBody() {
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
        eyebrow="Administration"
        title="Overview"
      >
        What needs attention today across content, partners, people and
        publishing.
      </Heading>
      <div className={s.g4} style={{ marginBottom: "1.25rem" }}>
        <Stat icon="edit" label="Drafts in progress" value="12">
          4 assigned to me
        </Stat>
        <Stat icon="check" label="Awaiting review" value="3">
          1 waiting over 2 days
        </Stat>
        <Stat icon="calendar" label="Scheduled" value="2">
          Next: Fri 30 Oct, 09:00
        </Stat>
        <Stat alert icon="alert" label="Needs attention" value="5">
          2 reviews overdue · 3 broken links
        </Stat>
      </div>
      <Grid kind="gmain">
        <div>
          <Panel
            meta="Sorted by urgency"
            pad={false}
            title="Needs your attention"
          >
            <ListItem
              actions={
                <Btn icon="chevR" kind="sec" size="sm">
                  Open
                </Btn>
              }
              icon="clock"
              sub="Due 20 Oct · Reviewer David Otieno · 3 days overdue"
              tone="w"
            >
              Review overdue: Bid, ask and spread
            </ListItem>
            <ListItem
              actions={
                <Btn icon="chevR" kind="sec" size="sm">
                  Open
                </Btn>
              }
              icon="globe"
              sub="Deriv.com · evidence checked 9 Oct 2026 · expires 7 Jan 2027"
              tone="w"
            >
              Partner review expires in 71 days
            </ListItem>
            <ListItem
              actions={
                <Btn icon="chevR" kind="sec" size="sm">
                  View report
                </Btn>
              }
              icon="flag"
              sub="Found in 2 lessons · last check today 06:00"
              tone="r"
            >
              3 broken internal links
            </ListItem>
            <ListItem
              actions={
                <Btn icon="chevR" kind="sec" size="sm">
                  Details
                </Btn>
              }
              icon="refresh"
              sub="Forex Foundations module · attempt 2 of 5 · next try in 2 min"
              tone="r"
            >
              Publication refresh is retrying
            </ListItem>
          </Panel>
          <Panel meta="Assigned to you" pad={false} title="My work queue">
            <ListItem
              actions={<Badge kind="draft">Draft</Badge>}
              icon="edit"
              sub="Draft · revision 7 · saved 2 min ago"
              tone="s"
            >
              Bid, ask and spread
            </ListItem>
            <ListItem
              actions={<Badge kind="draft">Draft</Badge>}
              icon="quiz"
              sub="Draft for version 4 · 12 questions"
              tone="s"
            >
              Forex Foundations quiz
            </ListItem>
            <ListItem
              actions={<Badge kind="review">In review</Badge>}
              icon="check"
              sub="Submitted by Grace Njeri · needs your review"
              tone="w"
            >
              Chart Foundations: reading candles
            </ListItem>
          </Panel>
        </div>
        <div>
          <Panel meta="Next 7 days" title="Publishing">
            <ul className={s.feed} style={{ paddingLeft: "2.6rem" }}>
              <li>
                <span className={s.marker}>
                  <Icon name="calendar" />
                </span>
                <div className={s.card}>
                  <div className={s.row} style={{ marginBottom: ".3rem" }}>
                    <Badge kind="sched">Scheduled</Badge>
                    <span className={cx(s.muted, s.xs)}>
                      Fri 30 Oct · 09:00 EAT
                    </span>
                  </div>
                  <b>Bid, ask and spread</b>
                  <p className={cx(s.muted, s.small)}>
                    Revision 7 · approved by David O.
                  </p>
                </div>
              </li>
              <li>
                <span className={cx(s.marker, s.live)}>
                  <Icon name="check" />
                </span>
                <div className={s.card}>
                  <div className={s.row} style={{ marginBottom: ".3rem" }}>
                    <Badge kind="ok">Verified public</Badge>
                    <span className={cx(s.muted, s.xs)}>Today · 08:12</span>
                  </div>
                  <b>Deriv.com partner profile</b>
                  <p className={cx(s.muted, s.small)}>
                    Visible to anonymous readers.
                  </p>
                </div>
              </li>
            </ul>
          </Panel>
          <Panel pad={false} title="System health">
            <ListItem
              actions={<Badge kind="ok">Healthy</Badge>}
              icon="clock"
              sub="Last tick 42 s ago · target visible within 5 min"
            >
              Publishing scheduler
            </ListItem>
            <ListItem
              actions={<Badge kind="review">Watching</Badge>}
              icon="refresh"
              sub="1 retrying · 0 failed"
            >
              Cache refresh queue
            </ListItem>
            <ListItem
              actions={<Badge kind="ok">Healthy</Badge>}
              icon="list"
              sub="Last write 1 min ago"
            >
              Audit recording
            </ListItem>
          </Panel>
          <Panel title="Recent activity">
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
              <li>
                <b style={ink}>Salma Khan</b> published{" "}
                <b style={ink}>Pips and lots</b> · 11:04
              </li>
              <li>
                <b style={ink}>David Otieno</b> requested changes on{" "}
                <b style={ink}>Averages and momentum</b> · 10:31
              </li>
              <li>
                <b style={ink}>You</b> granted Reviewer to{" "}
                <b style={ink}>David Otieno</b> · yesterday
              </li>
            </ul>
            <p className={s.small} style={{ marginTop: ".9rem" }}>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                Open audit log <Icon name="chevR" />
              </span>
            </p>
          </Panel>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- B2
const PEOPLE_ROWS = [
  [
    "You",
    "owner@pipstart.example",
    "KB",
    "teal",
    "Owner",
    "navy",
    "Active",
    "ok",
    "Enrolled",
    "ok",
    "Now",
  ],
  [
    "Amos Kariuki",
    "amos@pipstart.example",
    "AK",
    "teal",
    "Staff Administrator",
    "",
    "Active",
    "ok",
    "Enrolled",
    "ok",
    "Today",
  ],
  [
    "Salma Khan",
    "salma@pipstart.example",
    "SK",
    "teal",
    "Editor",
    "",
    "Active",
    "ok",
    "Enrolled",
    "ok",
    "Today",
  ],
  [
    "David Otieno",
    "david@pipstart.example",
    "DO",
    "teal",
    "Reviewer",
    "",
    "Active",
    "ok",
    "Enrolled",
    "ok",
    "Yesterday",
  ],
  [
    "Grace Njeri",
    "grace@pipstart.example",
    "GN",
    "teal",
    "Author",
    "",
    "Active",
    "ok",
    "Enrolled",
    "ok",
    "2 min ago",
  ],
  [
    "Peter Mwangi",
    "peter@pipstart.example",
    "PM",
    "teal",
    "Moderator",
    "",
    "Suspended",
    "fail",
    "Enrolled",
    "ok",
    "12 Oct",
  ],
  [
    "Wanjiku M.",
    "w****@example.org",
    "WM",
    "slate",
    "Learner",
    "slate",
    "Active",
    "ok",
    "Not required",
    "slate",
    "Today",
  ],
  [
    "Tendai C.",
    "t****@example.org",
    "TC",
    "slate",
    "Learner",
    "slate",
    "Active",
    "ok",
    "Not required",
    "slate",
    "3 days ago",
  ],
] as const;

export function PeopleBody() {
  return (
    <>
      <Heading
        actions={<Btn icon="plus">Invite staff</Btn>}
        eyebrow="People"
        title="People"
      >
        Staff and learner accounts. Learner details are limited to what role
        management needs: name, masked email and status.
      </Heading>
      <Alert style={{ marginBottom: "1.1rem" }} title="Privacy by design">
        Staff never see learner progress, quiz answers or full email addresses
        here. Opening a learner shows account status only.
      </Alert>
      <section aria-label="People list" className={s.panel}>
        <Toolbar>
          <SearchBox label="Search by name or email" />
          <SelectBox label="Role">All</SelectBox>
          <SelectBox label="Status">All</SelectBox>
          <SelectBox label="Two-step">Any</SelectBox>
        </Toolbar>
        <DataTable
          caption="People"
          cols="minmax(0,2.2fr) minmax(0,1.4fr) .9fr 1fr 1fr 5.5rem"
          head={["Person", "Role", "Status", "Two-step", "Last active", ""]}
          rows={PEOPLE_ROWS.map(
            ([
              name,
              email,
              initials,
              avatar,
              role,
              roleKind,
              status,
              statusKind,
              twoStep,
              twoKind,
              last,
            ]) => ({
              cells: [
                {
                  label: "Person",
                  className: "main" as const,
                  node: (
                    <PersonCell
                      initials={initials}
                      kind={avatar}
                      name={name}
                      sub={email}
                    />
                  ),
                },
                {
                  label: "Role",
                  node: (
                    <Tag kind={roleKind === "" ? undefined : roleKind}>
                      {role}
                    </Tag>
                  ),
                },
                {
                  label: "Status",
                  node: (
                    <Badge kind={statusKind === "fail" ? "fail" : "ok"}>
                      {status}
                    </Badge>
                  ),
                },
                {
                  label: "Two-step",
                  node: (
                    <Tag kind={twoKind === "slate" ? "slate" : undefined}>
                      {twoStep}
                    </Tag>
                  ),
                },
                {
                  label: "Last active",
                  node: <span className={s.muted}>{last}</span>,
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
            }),
          )}
        />
        <Pager>Showing 1–8 of 41</Pager>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- B3 (also behind the A2 step-up dialog)
export function PersonDetailBody() {
  return (
    <>
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <span>People</span>
        <Icon name="chevR" />
        <b aria-current="page">Grace Njeri</b>
      </nav>
      <div
        className={cx(s.row, s.nw)}
        style={{ gap: "1rem", marginBottom: "1.3rem", alignItems: "center" }}
      >
        <Avatar initials="GN" size="lg" />
        <div>
          <h1 style={{ fontSize: "1.6rem", marginBottom: ".25rem" }}>
            Grace Njeri
          </h1>
          <div className={s.row}>
            <span className={cx(s.muted, s.small)}>grace@pipstart.example</span>
            <Badge kind="ok">Active</Badge>
            <Tag>Author</Tag>
          </div>
        </div>
      </div>
      <Grid kind="gmain">
        <div>
          <Panel title="Roles and assignments">
            <ListItem
              icon="edit"
              sub="Can edit assigned drafts. Cannot publish, change roles or edit disclosures."
            >
              Author
            </ListItem>
            <ListItem
              icon="layers"
              sub="Forex Foundations (6 lessons) · Chart Foundations (4 lessons)"
              tone="s"
            >
              Assignments
            </ListItem>
            <div className={s.row} style={{ marginTop: ".8rem" }}>
              <Btn icon="key">Change roles</Btn>
              <Btn icon="layers" kind="sec">
                Edit assignments
              </Btn>
            </div>
            <p className={cx(s.muted, s.xs)} style={{ marginTop: ".7rem" }}>
              <Icon name="shield" /> Changing roles needs a fresh verification
              code.
            </p>
          </Panel>
          <Panel meta="Request ID 7f3a…c1" title="Account action">
            <p
              className={s.muted}
              style={{ marginBottom: ".8rem", fontSize: ".75rem" }}
            >
              Suspending ends staff access immediately. The learner account and
              progress are kept.
            </p>
            <Alert
              actions={
                <Btn icon="refresh" kind="sec" size="sm">
                  Check account state
                </Btn>
              }
              kind="warn"
              style={{ marginBottom: ".9rem" }}
              title="Suspension requested — outcome not confirmed"
            >
              You asked for this at 14:02. We could not confirm the account’s
              state, so nothing is shown as done. Checking the real state is
              safe to repeat.
            </Alert>
            <div className={s.row}>
              <Btn icon="pause" kind="dng">
                Suspend access
              </Btn>
              <Btn disabled icon="restore" kind="sec">
                Reactivate
              </Btn>
            </div>
          </Panel>
        </div>
        <div>
          <Panel title="Security">
            <dl className={s.kv}>
              <dt>Two-step</dt>
              <dd>Enrolled 12 Oct 2026</dd>
              <dt>Last verified</dt>
              <dd>Today, 13:48</dd>
              <dt>Open sessions</dt>
              <dd>2 (Chrome on Windows, Safari on iPhone)</dd>
            </dl>
            <div className={s.row} style={{ marginTop: ".9rem" }}>
              <Btn icon="device" kind="sec">
                Reset two-step
              </Btn>
              <Btn icon="x" kind="sec">
                End all sessions
              </Btn>
            </div>
          </Panel>
          <Panel meta="From audit log" title="Recent events for this person">
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
              <li>
                <b style={ink}>Today 14:02</b> · Suspension requested by You ·{" "}
                <Tag kind="warn">outcome unknown</Tag>
              </li>
              <li>
                <b style={ink}>Today 13:48</b> · Two-step verified
              </li>
              <li>
                <b style={ink}>Yesterday</b> · Role Author granted by You
              </li>
            </ul>
          </Panel>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- B4
const MATRIX_ROLES = [
  "Author",
  "Reviewer",
  "Editor",
  "Moderator",
  "Affiliate Mgr",
  "Staff Admin",
  "Owner",
];
type Cell = "yes" | "no" | "assigned";
const Y: Cell = "yes";
const N: Cell = "no";
const A: Cell = "assigned";
const MATRIX: Array<{
  cells?: Cell[];
  group?: string;
  highlight?: boolean;
  label: string;
}> = [
  { label: "Content", group: "Content" },
  { label: "Edit drafts", cells: [A, N, Y, N, N, Y, Y] },
  { label: "Review an exact revision", cells: [N, A, Y, N, N, Y, Y] },
  { label: "Approve and publish", cells: [N, N, Y, N, N, Y, Y] },
  { label: "Withdraw and restore", cells: [N, N, Y, N, N, Y, Y] },
  { label: "Partners and links", group: "Partners and links" },
  { label: "Edit partner facts and links", cells: [N, N, N, N, Y, Y, Y] },
  {
    label: "Edit disclosures and allowed hosts",
    cells: [N, N, N, N, N, Y, Y],
    highlight: true,
  },
  { label: "People", group: "People" },
  { label: "View people", cells: [N, N, N, N, N, Y, Y] },
  { label: "Grant roles up to own ceiling", cells: [N, N, N, N, N, Y, Y] },
  { label: "Suspend or reactivate staff", cells: [N, N, N, N, N, Y, Y] },
  { label: "Reset another person’s two-step", cells: [N, N, N, N, N, N, Y] },
  { label: "Records", group: "Records" },
  { label: "Triage maintenance reports", cells: [N, N, Y, A, A, Y, Y] },
  { label: "View audit log", cells: [N, N, N, N, N, Y, Y] },
];

function MatrixCell({ value }: { value: Cell }) {
  if (value === "yes")
    return (
      <span className={s.y}>
        <Icon name="check" />
        <span className={s.srOnly}>Yes</span>
      </span>
    );
  if (value === "assigned") return <span className={s.p}>assigned</span>;
  return (
    <span className={s.n}>
      <span aria-hidden="true">—</span>
      <span className={s.srOnly}>No</span>
    </span>
  );
}

export function RolesBody() {
  return (
    <>
      <Heading eyebrow="People" title="Roles and access">
        The capabilities each role has. Changing a role is checked by the
        database, written to the audit log in the same step and needs a fresh
        verification code.
      </Heading>
      <Grid kind="gmain">
        <section aria-labelledby="matrix-title" className={s.panel}>
          <div className={s.ph2}>
            <h2 id="matrix-title">Capability matrix</h2>
            <span className={s.m}>Read-only · set in code</span>
          </div>
          <div
            className={cx(s.scrollX, s.mxwrap)}
            role="region"
            aria-labelledby="matrix-title"
            tabIndex={0}
          >
            <table className={s.mx}>
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  {MATRIX_ROLES.map((role) => (
                    <th key={role} scope="col">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) =>
                  row.group ? (
                    <tr className={s.grp} key={row.label}>
                      <th colSpan={MATRIX_ROLES.length + 1} scope="colgroup">
                        {row.label}
                      </th>
                    </tr>
                  ) : (
                    <tr
                      className={row.highlight ? s.hl : undefined}
                      key={row.label}
                    >
                      <th scope="row">{row.label}</th>
                      {row.cells!.map((cell, index) => (
                        <td key={MATRIX_ROLES[index]}>
                          <MatrixCell value={cell} />
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
        <div>
          <Panel title="Grant a role">
            <Field label="Person" kind="select" value="Grace Njeri" />
            <Field
              hint={
                <>
                  You can grant roles up to <b>Owner</b>. Staff Administrators
                  can grant up to Editor.
                </>
              }
              kind="select"
              label="Role"
              value="Reviewer"
            />
            <Field
              kind="textarea"
              label="Reason (saved in the audit log)"
              value="Cover review rota while David is away"
            />
            <div className={s.row}>
              <Btn icon="shield">Review and confirm</Btn>
            </div>
          </Panel>
          <Alert icon="lock" kind="danger" title="Last-Owner protection">
            You are the only active Owner. Demoting, suspending or removing this
            role is blocked until another Owner exists.
          </Alert>
          <Alert icon="shield" title="No self-promotion">
            You cannot grant yourself a role. A second Owner must do it.
          </Alert>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- B5
const AUDIT_ROWS = [
  [
    "14:06",
    "Salma Khan",
    "Editor",
    "Published revision 7",
    "Lesson · bid-ask-spread",
    true,
    false,
  ],
  [
    "13:58",
    "You",
    "Owner",
    "Granted role Reviewer",
    "Person · David Otieno",
    true,
    true,
  ],
  [
    "13:41",
    "Lina Abdi",
    "Affiliate Mgr",
    "Edited partner fact",
    "Partner · deriv",
    true,
    false,
  ],
  [
    "13:35",
    "Peter Mwangi",
    "Moderator",
    "Tried to edit disclosure text",
    "Partner · deriv",
    false,
    false,
  ],
  [
    "13:12",
    "Grace Njeri",
    "Author",
    "Saved draft revision 7",
    "Lesson · bid-ask-spread",
    true,
    false,
  ],
  [
    "12:50",
    "David Otieno",
    "Reviewer",
    "Requested changes",
    "Lesson · averages-momentum",
    true,
    false,
  ],
] as const;

export function AuditBody() {
  return (
    <>
      <Heading
        actions={
          <Btn icon="download" kind="sec">
            Export filtered view
          </Btn>
        }
        eyebrow="Records"
        title="Audit log"
      >
        A protected record of important actions. A change and its audit entry
        succeed or fail together.
      </Heading>
      <Grid kind="gmain">
        <div>
          <Tabs
            items={[
              { label: "Database changes", current: true },
              {
                label: "External operations",
                pill: <Pill kind="warn">1</Pill>,
              },
            ]}
          />
          <section aria-label="Database changes" className={s.panel}>
            <Toolbar>
              <SelectBox label="Actor">Anyone</SelectBox>
              <SelectBox label="Type">All</SelectBox>
              <SelectBox label="Period">Last 7 days</SelectBox>
            </Toolbar>
            <DataTable
              caption="Audit events, newest first"
              cols="3.8rem minmax(0,1.3fr) minmax(0,1.8fr) minmax(0,1.3fr) 5.2rem"
              head={["Time", "Actor", "Action", "Object", "Result"]}
              rows={AUDIT_ROWS.map(
                ([time, who, role, action, object, ok, selected]) => ({
                  selected,
                  cells: [
                    {
                      label: "Time",
                      node: <span className={s.mono}>{time}</span>,
                    },
                    { label: "Actor", node: <Two sub={role} title={who} /> },
                    {
                      label: "Action",
                      className: "main" as const,
                      node: <span className={s.t}>{action}</span>,
                    },
                    {
                      label: "Object",
                      node: <span className={s.muted}>{object}</span>,
                    },
                    {
                      label: "Result",
                      node: ok ? (
                        <Badge kind="ok">Done</Badge>
                      ) : (
                        <Badge kind="fail">Denied</Badge>
                      ),
                    },
                  ],
                }),
              )}
            />
            <Pager>Showing 1–6 of 318</Pager>
          </section>
        </div>
        <div>
          <Panel meta="Selected row" title="Event detail">
            <dl className={s.kv}>
              <dt>Event</dt>
              <dd>Granted role</dd>
              <dt>Actor</dt>
              <dd>You · Owner</dd>
              <dt>Object</dt>
              <dd>David Otieno</dd>
              <dt>Change</dt>
              <dd>
                Reviewer: <Tag kind="slate">none</Tag> → <Tag>granted</Tag>
              </dd>
              <dt>Reason</dt>
              <dd>Cover review rota</dd>
              <dt>Verification</dt>
              <dd>Fresh code, 2 min earlier</dd>
              <dt>Correlation</dt>
              <dd className={s.mono}>c-5a91…e07</dd>
            </dl>
            <Alert
              icon="lock"
              style={{ marginTop: "1rem" }}
              title="What is not stored"
            >
              Passwords, tokens, reset links, MFA keys and full content are
              never written to the audit log.
            </Alert>
          </Panel>
        </div>
      </Grid>
    </>
  );
}
