import type { ReactNode } from "react";

import { Icon } from "../icons";
import {
  Alert,
  Badge,
  type BadgeKind,
  Btn,
  CheckItem,
  Chip,
  Choice,
  DataTable,
  Dialog,
  Field,
  Grid,
  Hash,
  Heading,
  Mono,
  Panel,
  Tag,
  Toolbar,
  SearchBox,
  cx,
} from "../primitives";
import s from "../admin-preview.module.css";

// ---------------------------------------------------------------- D1
function Question({
  active,
  children,
  number,
  options,
  text,
}: {
  active?: boolean;
  children?: ReactNode;
  number: number;
  options: string[];
  text: string;
}) {
  return (
    <div className={cx(s.blk, active && s.act)}>
      <div className={s.bh}>
        <Icon name="grip" />
        Question {number}
        <span className={s.r}>
          <button
            aria-label={`Move question ${number} up`}
            className={s.iconBtn}
            type="button"
          >
            <Icon name="up" />
          </button>
          <button
            aria-label={`Move question ${number} down`}
            className={s.iconBtn}
            type="button"
          >
            <Icon name="down" />
          </button>
          <button
            aria-label={`Delete question ${number}`}
            className={s.iconBtn}
            type="button"
          >
            <Icon name="trash" />
          </button>
        </span>
      </div>
      <div className={s.bb}>
        <b style={{ color: "var(--ink)" }}>{text}</b>
        <div style={{ marginTop: ".6rem" }}>
          {options.map((option, index) => (
            <div className={cx(s.opt, index === 0 && s.ok)} key={option}>
              <span
                aria-hidden="true"
                className={cx(s.cb, index === 0 && s.on)}
              >
                {index === 0 ? <Icon name="check" /> : null}
              </span>
              <span>
                {option}
                {index === 0 ? (
                  <span className={s.srOnly}> (correct answer)</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export function QuizEditorBody() {
  return (
    <>
      <div className={s.phrow}>
        <div className={s.ph}>
          <p className={s.eyebrow}>Quiz · Forex Foundations</p>
          <h1>Forex Foundations quiz</h1>
          <div className={s.row} style={{ marginTop: ".5rem" }}>
            <Badge kind="draft">Draft for version 4</Badge>
            <Badge kind="published">Version 3 live</Badge>
            <Chip icon="lock">Answer key private</Chip>
          </div>
        </div>
        <div className={cx(s.row, s.right)} style={{ marginTop: ".2rem" }}>
          <Btn icon="eye" kind="sec">
            Sandbox preview
          </Btn>
          <Btn icon="check">Save draft</Btn>
        </div>
      </div>
      <Grid kind="gmain">
        <div>
          <Question
            active
            number={1}
            options={[
              "The gap between the bid and ask price",
              "How fast a price is moving",
              "The size of one lot",
              "The broker’s opening hours",
            ]}
            text="What does the spread measure?"
          >
            <Alert
              kind="warn"
              style={{ marginTop: ".6rem" }}
              title="Answer lengths are uneven"
            >
              The correct answer is the longest option. Shorten it or lengthen
              the others.
            </Alert>
          </Question>
          <Question
            number={2}
            options={["0.0001", "0.01", "1.00"]}
            text="A pip on EUR/USD is usually which move?"
          />
          <div className={s.row}>
            <Btn icon="plus" kind="sec">
              Add question
            </Btn>
            <span className={cx(s.muted, s.xs)}>
              12 questions · single answer
            </span>
          </div>
        </div>
        <div>
          <Panel title="Checks before publishing">
            <CheckItem>Every question has exactly one correct answer</CheckItem>
            <CheckItem>Pass mark set to 70%</CheckItem>
            <CheckItem>Explanations written for all 12</CheckItem>
            <CheckItem
              on={false}
              sub="Correct answer is the longest in 7 of 12 questions"
            >
              Answer-length balance
            </CheckItem>
          </Panel>
          <Panel title="What publishing does">
            <p
              className={s.muted}
              style={{
                lineHeight: 1.6,
                marginBottom: ".8rem",
                fontSize: ".75rem",
              }}
            >
              Publishing creates <b>version 4</b>. Version 3 stays available to
              learners who started it, so no one’s progress is lost or
              re-marked.
            </p>
            <dl className={s.kv}>
              <dt>Learners now on v3</dt>
              <dd>38 in progress</dd>
              <dt>Progress key</dt>
              <dd className={s.mono}>quiz_id + version</dd>
            </dl>
          </Panel>
          <Panel title="Sandbox preview">
            <p
              className={s.muted}
              style={{
                lineHeight: 1.6,
                marginBottom: ".8rem",
                fontSize: ".75rem",
              }}
            >
              Take the draft as a learner would. Answers are checked here only;
              nothing is saved to any learner or to your own progress.
            </p>
            <Btn icon="eye" kind="sec">
              Open sandbox
            </Btn>
          </Panel>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- D2
const VERSIONS: Array<
  [string, BadgeKind, string, string, string, string, boolean]
> = [
  ["v4", "draft", "Draft", "12 questions", "Not published", "—", true],
  [
    "v3",
    "published",
    "Live",
    "12 questions",
    "Published 14 Oct",
    "418 attempts · 38 in progress",
    false,
  ],
  [
    "v2",
    "arch",
    "Retired",
    "10 questions",
    "Published 2 Sep",
    "1,204 attempts · 0 in progress",
    false,
  ],
  [
    "v1",
    "arch",
    "Retired",
    "8 questions",
    "Published 20 Jul",
    "611 attempts · 0 in progress",
    false,
  ],
];

export function QuizVersionsBody() {
  return (
    <>
      <Heading
        actions={<Btn icon="edit">Edit draft v4</Btn>}
        crumbs={["Library", "Quizzes", "Forex Foundations quiz"]}
        eyebrow="Content"
        title="Forex Foundations quiz"
      >
        Frozen versions and who is on each one.
      </Heading>
      <section aria-label="Quiz versions" className={s.panel}>
        <DataTable
          caption="Quiz versions"
          cols="5rem 7.5rem minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr) 5rem"
          head={[
            "Version",
            "Status",
            "Questions",
            "Published",
            "Activity (counts only)",
            "",
          ]}
          rows={VERSIONS.map(
            ([
              version,
              kind,
              status,
              questions,
              published,
              activity,
              selected,
            ]) => ({
              selected,
              cells: [
                {
                  label: "Version",
                  className: "main" as const,
                  node: <span className={cx(s.t, s.mono)}>{version}</span>,
                },
                { label: "Status", node: <Badge kind={kind}>{status}</Badge> },
                { label: "Questions", node: <span>{questions}</span> },
                {
                  label: "Published",
                  node: <span className={s.muted}>{published}</span>,
                },
                {
                  label: "Activity",
                  node: <span className={s.muted}>{activity}</span>,
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
      </section>
      <Alert
        icon="layers"
        style={{ marginTop: "1.1rem" }}
        title="Why versions exist"
      >
        Lesson progress is stored against a quiz version. A learner who passed
        version 2 keeps that result when version 3 goes live.
      </Alert>
    </>
  );
}

// ---------------------------------------------------------------- E1 dialog (the page behind it is the approved review screen)
export function PublishOverlay() {
  return (
    <Dialog
      description={
        <>
          Revision 7 · fingerprint <Hash>9c1e…2b81</Hash> · approved by You
        </>
      }
      footer={
        <>
          <Btn kind="sec">Cancel</Btn>
          <Btn icon="calendar">Schedule publish</Btn>
        </>
      }
      icon="send"
      title="Publish “Bid, ask and spread”"
      wide
    >
      <Choice name="when" sub="Goes live within about 5 minutes" type="radio">
        Publish now
      </Choice>
      <Choice checked name="when" type="radio">
        Schedule for later
      </Choice>
      <div className={s.cols2} style={{ margin: ".5rem 0 .2rem" }}>
        <Field label="Date" value="Fri 30 Oct 2026" />
        <Field label="Time" value="09:00" />
      </div>
      <Field
        hint={
          <>
            Saved as <b>06:00 UTC</b> on 30 Oct. Nairobi has no clock changes;
            for zones that do, the UTC time is shown before you confirm.
          </>
        }
        kind="select"
        label="Time zone"
        value="Africa/Nairobi (UTC+3)"
      />
      <p className={s.lbl} style={{ marginTop: ".4rem" }}>
        Checks
      </p>
      <CheckItem>Approval matches revision 7</CheckItem>
      <CheckItem>2 internal links resolve</CheckItem>
      <CheckItem>Quiz Forex Foundations v3 is live</CheckItem>
      <CheckItem>
        Includes: lesson rev 7 and module order. No partner links.
      </CheckItem>
    </Dialog>
  );
}

// ---------------------------------------------------------------- E2
type StageState = "bad" | "done" | "now" | "";
const STAGES = ["Approved", "Scheduled", "Published", "Refreshing", "Verified"];

function Pipeline({ states }: { states: StageState[] }) {
  return (
    <ol
      className={s.steps}
      style={{ margin: 0, padding: 0, listStyle: "none" }}
    >
      {STAGES.map((name, index) => {
        const state = states[index];
        return (
          <li
            aria-current={state === "now" ? "step" : undefined}
            className={cx(s.s, state && s[state])}
            key={name}
          >
            {state === "done" ? <Icon name="check" /> : null}
            {state === "now" ? <Icon name="clock" /> : null}
            {state === "bad" ? <Icon name="alert" /> : null}
            {name}
            {state === "bad" ? (
              <span className={s.srOnly}> (failed)</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function PublicationBody() {
  return (
    <>
      <Heading
        actions={
          <Btn icon="check" kind="sec">
            Open review queue
          </Btn>
        }
        eyebrow="Content"
        title="Publishing"
      >
        Scheduled, in progress and recently published.
      </Heading>
      <Grid kind="gmain">
        <div>
          <div className={s.card} style={{ marginBottom: ".8rem" }}>
            <div className={s.row} style={{ marginBottom: ".5rem" }}>
              <b>Bid, ask and spread</b>
              <Badge kind="sched">Scheduled</Badge>
              <span className={cx(s.muted, s.small, s.right)}>
                Fri 30 Oct · 09:00 EAT (06:00 UTC)
              </span>
            </div>
            <Pipeline states={["done", "now", "", "", ""]} />
            <div className={s.row} style={{ marginTop: ".7rem" }}>
              <Btn icon="calendar" kind="sec" size="sm">
                Change time
              </Btn>
              <Btn icon="x" kind="dng" size="sm">
                Cancel schedule
              </Btn>
            </div>
          </div>
          <div className={s.card} style={{ marginBottom: ".8rem" }}>
            <div className={s.row} style={{ marginBottom: ".5rem" }}>
              <b>Pips and lots</b>
              <Badge kind="proc">Refreshing public pages</Badge>
              <span className={cx(s.muted, s.small, s.right)}>Today 11:04</span>
            </div>
            <Pipeline states={["done", "done", "done", "now", ""]} />
            <p className={cx(s.muted, s.small)} style={{ marginTop: ".6rem" }}>
              Saved and live in the database. Public pages are being refreshed;
              some readers may still see the previous version for a few minutes.
            </p>
          </div>
          <div className={s.card} style={{ marginBottom: ".8rem" }}>
            <div className={s.row} style={{ marginBottom: ".5rem" }}>
              <b>Deriv.com partner profile</b>
              <Badge kind="ok">Verified public</Badge>
              <span className={cx(s.muted, s.small, s.right)}>Today 08:12</span>
            </div>
            <Pipeline states={["done", "done", "done", "done", "done"]} />
          </div>
          <div className={cx(s.card, s.sel)}>
            <div className={s.row} style={{ marginBottom: ".5rem" }}>
              <b>Forex Foundations module</b>
              <Badge kind="fail">Refresh failed</Badge>
              <span className={cx(s.muted, s.small, s.right)}>
                Yesterday 17:40
              </span>
            </div>
            <Pipeline states={["done", "done", "done", "bad", ""]} />
            <p
              className={s.small}
              style={{ marginTop: ".6rem", color: "var(--slate)" }}
            >
              Content is safely stored and live in the database. After 5
              attempts the public refresh did not complete, so readers may see
              the previous version.
            </p>
            <div className={s.row} style={{ marginTop: ".7rem" }}>
              <Btn icon="refresh" size="sm">
                Retry refresh
              </Btn>
              <Btn icon="list" kind="sec" size="sm">
                View attempts
              </Btn>
            </div>
          </div>
        </div>
        <div>
          <Panel title="How to read these">
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
                <b style={{ color: "var(--ink)" }}>Scheduled</b> · waiting for
                its time; can be changed or cancelled.
              </li>
              <li>
                <b style={{ color: "var(--ink)" }}>Published</b> · the saved
                snapshot is live in the database.
              </li>
              <li>
                <b style={{ color: "var(--ink)" }}>Refreshing</b> · public pages
                are catching up.
              </li>
              <li>
                <b style={{ color: "var(--ink)" }}>Verified</b> · an anonymous
                check saw the new version.
              </li>
            </ul>
          </Panel>
          <Alert icon="refresh" kind="warn" title="Retrying is safe">
            A retry only repeats the refresh. It never publishes the content a
            second time.
          </Alert>
        </div>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------- E3
const TRASH: Array<
  [string, "Lesson" | "Quiz", string, string, boolean, boolean]
> = [
  [
    "Old spread explainer",
    "Lesson",
    "Deleted 12 Oct by Salma Khan",
    "78 days left",
    false,
    false,
  ],
  [
    "Pip value calculator",
    "Lesson",
    "Deleted 2 Oct by Grace Njeri",
    "68 days left",
    false,
    true,
  ],
  [
    "Leverage quiz (v1)",
    "Quiz",
    "Deleted 28 Sep by Salma Khan",
    "64 days left",
    false,
    false,
  ],
  [
    "Candlestick patterns draft",
    "Lesson",
    "Deleted 3 Aug by Grace Njeri",
    "On hold: referenced by a scheduled publication",
    true,
    false,
  ],
];

export function TrashBody() {
  return (
    <>
      <Heading eyebrow="Content" title="Trash and recovery">
        Recently deleted lessons, quizzes and modules.
      </Heading>
      <section aria-label="Deleted items" className={s.panel}>
        <Toolbar>
          <SearchBox label="Search deleted items" />
        </Toolbar>
        <DataTable
          caption="Deleted items"
          cols="minmax(0,1.6fr) 5.5rem minmax(0,1.8fr) minmax(0,2fr) 7rem"
          head={["Item", "Type", "Deleted", "Time left", ""]}
          rows={TRASH.map(([title, type, deleted, left, held, selected]) => ({
            selected,
            cells: [
              {
                label: "Item",
                className: "main" as const,
                node: <span className={s.t}>{title}</span>,
              },
              { label: "Type", node: <Tag kind="slate">{type}</Tag> },
              {
                label: "Deleted",
                node: <span className={s.muted}>{deleted}</span>,
              },
              {
                label: "Time left",
                node: held ? (
                  <Tag kind="warn">{left}</Tag>
                ) : (
                  <span className={s.muted}>{left}</span>
                ),
              },
              {
                label: "",
                className: "act" as const,
                node: (
                  <Btn disabled={held} icon="restore" kind="sec" size="sm">
                    Restore
                  </Btn>
                ),
              },
            ],
          }))}
        />
      </section>
      <div className={s.g2} style={{ marginTop: "1.1rem" }}>
        <div>
          <Panel title="Restore “Pip value calculator”">
            <p
              className={s.muted}
              style={{
                lineHeight: 1.6,
                marginBottom: ".8rem",
                fontSize: ".75rem",
              }}
            >
              Restoring brings back the content as <b>a new draft</b> in Forex
              Foundations. It stays unpublished and goes through review again.
            </p>
            <CheckItem>
              Original address <Mono>pip-value</Mono> is free
            </CheckItem>
            <CheckItem>No other item uses this address</CheckItem>
            <div className={s.row} style={{ marginTop: ".8rem" }}>
              <Btn icon="restore">Restore as draft</Btn>
              <Btn kind="sec">Cancel</Btn>
            </div>
          </Panel>
        </div>
        <div>
          <Alert
            icon="trash"
            kind="danger"
            title="Recoverable for at least 90 days"
          >
            No automatic permanent deletion. Referenced content and items on
            hold stay protected; restoring creates a draft, never a publication.
          </Alert>
        </div>
      </div>
    </>
  );
}
