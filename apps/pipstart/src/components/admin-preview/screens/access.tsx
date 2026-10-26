import type { ReactNode } from "react";

import {
  Alert,
  Avatar,
  Btn,
  CheckItem,
  Choice,
  CodeBoxes,
  Dialog,
  Field,
  Mono,
  Panel,
  Row,
  cx,
} from "../primitives";
import { Icon, type IconName } from "../icons";
import { Sidebar } from "../shell";
import s from "../admin-preview.module.css";
import { PersonDetailBody } from "./people";

// Deterministic sample QR pattern (not a real code, never scannable).
function sampleQr(seed: number, n: number, cell: number) {
  let a = seed;
  const random = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const corners = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];
  const reserved = new Set<string>();
  for (const [ox, oy] of corners)
    for (let x = ox - 1; x < ox + 8; x++)
      for (let y = oy - 1; y < oy + 8; y++) reserved.add(`${x},${y}`);
  const dots: Array<[number, number]> = [];
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++)
      if (!reserved.has(`${x},${y}`) && random() < 0.48) dots.push([x, y]);
  const size = n * cell;
  return (
    <svg
      aria-label="Sample QR code for the mock-up"
      className={s.qr}
      height={size + 22}
      role="img"
      style={{ stroke: "none" }}
      viewBox={`0 0 ${size} ${size}`}
      width={size + 22}
    >
      {dots.map(([x, y]) => (
        <rect
          fill="#0b1220"
          height={cell}
          key={`${x}-${y}`}
          width={cell}
          x={x * cell}
          y={y * cell}
        />
      ))}
      {corners.map(([ox, oy]) => (
        <g key={`${ox}-${oy}`}>
          <rect
            fill="#0b1220"
            height={7 * cell}
            width={7 * cell}
            x={ox * cell}
            y={oy * cell}
          />
          <rect
            fill="#fff"
            height={5 * cell}
            width={5 * cell}
            x={(ox + 1) * cell}
            y={(oy + 1) * cell}
          />
          <rect
            fill="#0b1220"
            height={3 * cell}
            width={3 * cell}
            x={(ox + 2) * cell}
            y={(oy + 2) * cell}
          />
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------- A1
export function MfaEnrolBody() {
  return (
    <div className={s.gmain} style={{ width: "100%", maxWidth: "58rem" }}>
      <div className={s.panel}>
        <div className={s.pb} style={{ padding: "1.6rem 1.7rem" }}>
          <p className={s.eyebrow}>Staff security · step 2 of 3</p>
          <h1 style={{ fontSize: "1.6rem", marginBottom: ".5rem" }}>
            Set up two-step verification
          </h1>
          <p
            className={s.muted}
            style={{ marginBottom: "1.1rem", lineHeight: 1.65 }}
          >
            Staff accounts need a second step. Scan this code with an
            authenticator app, then enter the 6-digit code it shows.
          </p>
          <ol
            className={s.steps}
            style={{ margin: "0 0 1.1rem", padding: 0, listStyle: "none" }}
          >
            <li className={cx(s.s, s.done)}>
              <Icon name="check" />1 Install an app
            </li>
            <li aria-current="step" className={cx(s.s, s.now)}>
              2 Scan and confirm
            </li>
            <li className={s.s}>3 Save recovery codes</li>
          </ol>
          <div
            className={cx(s.row, s.nw)}
            style={{
              alignItems: "flex-start",
              gap: "1.2rem",
              flexWrap: "wrap",
            }}
          >
            {sampleQr(11, 25, 6)}
            <div style={{ flex: "1 1 12rem", minWidth: 0 }}>
              <Field
                label="Can’t scan? Enter this key instead"
                value="JBSW Y3DP EHPK 3PXP"
              />
              <p className={cx(s.muted, s.xs)} style={{ marginTop: ".5rem" }}>
                Sample QR code and key for the mock-up. Never share a real key.
              </p>
            </div>
          </div>
          <div style={{ marginTop: "1.3rem" }}>
            <CodeBoxes filled={["4", "7", "2", "1"]} label="6-digit code" />
            <div className={s.hint}>The code changes every 30 seconds.</div>
          </div>
          <Row style={{ marginTop: "1.1rem" }}>
            <Btn icon="shield">Verify and turn on</Btn>
            <Btn kind="sec">Back</Btn>
          </Row>
        </div>
      </div>
      <div>
        <Panel title="Why this is required">
          <CheckItem>
            Roles that can publish, change partners or manage people need two
            steps.
          </CheckItem>
          <CheckItem>
            Sensitive actions ask for a fresh code, even while you are signed
            in.
          </CheckItem>
          <CheckItem>
            Learners are never asked for staff verification.
          </CheckItem>
        </Panel>
        <Alert
          icon="alert"
          kind="warn"
          title="PipStart never asks for your password or code by email"
        >
          Only enter codes on pipstart.net. Staff will never ask you to read a
          code aloud.
        </Alert>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- A2
export function StepUpBody() {
  return <PersonDetailBody />;
}

export function StepUpOverlay() {
  return (
    <Dialog
      description={
        <>
          You are about to change roles for <b>Grace Njeri</b>. This needs a
          code from your authenticator app, entered within the last 10 minutes.
        </>
      }
      footer={
        <>
          <Btn kind="sec">Cancel</Btn>
          <Btn icon="check">Verify and continue</Btn>
        </>
      }
      icon="shield"
      title="Confirm it’s you"
    >
      <Alert
        icon="clock"
        kind="warn"
        style={{ marginBottom: "1rem" }}
        title="Your last verification was 42 minutes ago"
      >
        Enter a new code to continue.
      </Alert>
      <CodeBoxes filled={["8", "3", "0"]} label="6-digit code" />
      <Btn kind="ghost" size="sm">
        Use a recovery code instead
      </Btn>
    </Dialog>
  );
}

// ---------------------------------------------------------------- A3
const RECOVERY_CODES = [
  "7K4M-92QX",
  "B3LD-58RV",
  "T9ZP-14HC",
  "N6WE-70JA",
  "Y2GS-35UK",
  "F8CQ-66DM",
  "R1VX-93TB",
  "H5NA-27LP",
];

export function RecoveryBody() {
  return (
    <div className={s.g2} style={{ width: "100%", maxWidth: "60rem" }}>
      <Panel meta="Step 3 of 3" title="Your recovery codes">
        <Alert icon="key" kind="warn" title="Shown once — save them now">
          Each code works one time. Store them in your password manager, not in
          email or a chat.
        </Alert>
        <ul
          className={s.cols2}
          style={{ margin: "1rem 0", padding: 0, listStyle: "none" }}
        >
          {RECOVERY_CODES.map((code) => (
            <li
              className={cx(s.input, s.mono)}
              key={code}
              style={{ justifyContent: "center", minHeight: "2.4rem" }}
            >
              {code}
            </li>
          ))}
        </ul>
        <Row>
          <Btn icon="download" kind="sec">
            Download
          </Btn>
          <Btn icon="copy" kind="sec">
            Copy all
          </Btn>
        </Row>
        <div style={{ marginTop: "1rem" }}>
          <Choice checked>I have saved these codes somewhere safe</Choice>
        </div>
        <Row style={{ marginTop: ".8rem" }}>
          <Btn icon="check">Finish set-up</Btn>
        </Row>
      </Panel>
      <Panel title="Lost your authenticator?">
        <ol
          className={s.stack}
          style={{
            margin: 0,
            paddingLeft: "1.1rem",
            color: "var(--slate)",
            lineHeight: 1.6,
            fontSize: ".8125rem",
          }}
        >
          <li>
            <b>Use a recovery code</b> on the verification screen.
          </li>
          <li>
            No codes left? <b>Ask the Owner</b> to reset your two-step
            verification. They confirm your identity first and the reset is
            logged.
          </li>
          <li>
            You are the only Owner? Use the{" "}
            <b>offline Owner recovery procedure</b> from the operator guide. It
            is tested before enforcement.
          </li>
        </ol>
        <Alert style={{ marginTop: "1rem" }} title="While access is reset">
          Your sessions end and your roles are paused, so nobody can act as you.
        </Alert>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- A4
function AccessCard({
  actions,
  icon,
  kind,
  rows,
  text,
  title,
}: {
  actions: ReactNode;
  icon: IconName;
  kind: "slate" | "teal";
  rows: Array<[string, ReactNode]>;
  text: ReactNode;
  title: string;
}) {
  return (
    <section className={s.panel}>
      <div className={s.pb} style={{ padding: "1.4rem 1.4rem 1.2rem" }}>
        <Avatar
          icon={icon}
          kind={kind}
          style={{ width: "2.6rem", height: "2.6rem", marginBottom: ".9rem" }}
        />
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".4rem" }}>{title}</h2>
        <p
          className={s.muted}
          style={{ lineHeight: 1.65, fontSize: ".8125rem" }}
        >
          {text}
        </p>
        <dl
          className={s.kv}
          style={{ margin: "1rem 0 1.1rem", fontSize: ".75rem" }}
        >
          {rows.map(([term, detail]) => (
            <div key={term} style={{ display: "contents" }}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
        <Row>{actions}</Row>
      </div>
    </section>
  );
}

export function AccessStatesBody() {
  return (
    <div className={s.g3} style={{ width: "100%", maxWidth: "74rem" }}>
      <AccessCard
        actions={
          <>
            <Btn icon="home" kind="sec">
              Back to overview
            </Btn>
            <Btn icon="send">Request access</Btn>
          </>
        }
        icon="lock"
        kind="slate"
        rows={[
          ["Needs", <Mono key="n">partners.edit_disclosure</Mono>],
          ["Your role", "Moderator"],
          ["Who can help", "Owner, Staff Administrator"],
        ]}
        text={
          <>
            Your role can’t open <b>Partners → Disclosure text</b>. Nothing was
            changed.
          </>
        }
        title="You don’t have access to this page"
      />
      <AccessCard
        actions={
          <>
            <Btn icon="shield">Enter code</Btn>
            <Btn kind="sec">Sign out</Btn>
          </>
        }
        icon="shield"
        kind="teal"
        rows={[
          ["Signed in as", "Grace Njeri"],
          ["Verification", "Not done this session"],
        ]}
        text="You are signed in, but this area needs two-step verification. Enter a code to unlock it."
        title="Verify to continue"
      />
      <AccessCard
        actions={<Btn icon="home">Go to my dashboard</Btn>}
        icon="alert"
        kind="slate"
        rows={[
          ["Effective", "Immediately"],
          ["Learner account", "Unchanged"],
        ]}
        text="An Owner ended your staff access. Your learner account and progress are not affected."
        title="Your staff access was removed"
      />
    </div>
  );
}

// ---------------------------------------------------------------- A5
export function NavigationBody() {
  return (
    <div style={{ width: "100%", maxWidth: "74rem" }}>
      <div className={s.g3}>
        {(
          [
            ["Owner", "Owner (all areas)", "overview"],
            ["Author", "Author", "library"],
            ["Affiliate Manager", "Affiliate Manager", "partners"],
          ] as const
        ).map(([role, title, current]) => (
          <div key={role}>
            <p className={s.b} style={{ marginBottom: ".5rem" }}>
              {title}
            </p>
            <div className={s.panel} style={{ padding: "1rem .9rem" }}>
              <Sidebar
                current={current}
                label={`${title} navigation`}
                role={role}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1.1rem" }}>
        <Alert title="What each role sees">
          Authors see their assigned drafts only. Affiliate Managers see
          partners, links and their own reminders. Neither role sees People,
          Roles, Audit or system health.
        </Alert>
      </div>
      <div
        className={cx(s.showM, s.panel)}
        style={{ padding: ".5rem .6rem", marginTop: "1rem" }}
      >
        <p className={s.eyebrow} style={{ padding: ".6rem .6rem 0" }}>
          More
        </p>
        <Sidebar current="audit" label="More navigation" role="Owner" />
      </div>
    </div>
  );
}
