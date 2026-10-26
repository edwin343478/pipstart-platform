import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";

import { Icon, type IconName } from "./icons";
import s from "./admin-preview.module.css";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------- buttons, badges, tags
type ButtonKind = "sec" | "dng" | "dngs" | "ghost";

export function Btn({
  children,
  disabled,
  icon,
  kind,
  size,
}: {
  children: ReactNode;
  disabled?: boolean;
  icon?: IconName;
  kind?: ButtonKind;
  size?: "sm";
}) {
  return (
    <button
      className={cx(s.btn, kind && s[kind], size === "sm" && s.sm)}
      disabled={disabled}
      type="button"
    >
      {icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

export type BadgeKind =
  | "approved"
  | "arch"
  | "draft"
  | "fail"
  | "ok"
  | "proc"
  | "published"
  | "review"
  | "sched";

export function Badge({
  children,
  kind,
}: {
  children: ReactNode;
  kind: BadgeKind;
}) {
  return <span className={cx(s.badge, s[kind])}>{children}</span>;
}

export function Tag({
  children,
  kind,
}: {
  children: ReactNode;
  kind?: "navy" | "red" | "slate" | "warn";
}) {
  return <span className={cx(s.tag, kind && s[kind])}>{children}</span>;
}

export function Chip({
  children,
  icon,
  kind,
}: {
  children: ReactNode;
  icon?: IconName;
  kind?: "on" | "warn";
}) {
  return (
    <span className={cx(s.chip, kind && s[kind])}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}

export function Pill({
  children,
  kind,
}: {
  children: ReactNode;
  kind?: "hot" | "red" | "warn";
}) {
  return <span className={cx(s.pill, kind && s[kind])}>{children}</span>;
}

export function Avatar({
  icon,
  initials,
  kind = "teal",
  size,
  style,
}: {
  icon?: IconName;
  initials?: string;
  kind?: "slate" | "soft" | "teal";
  size?: "lg" | "sm";
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(s.avatar, s[kind], size && s[size])}
      style={style}
    >
      {icon ? <Icon name={icon} /> : initials}
    </span>
  );
}

// ---------------------------------------------------------------- headings, panels, alerts
export function Crumbs({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className={s.crumbs}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={item} style={{ display: "contents" }}>
            {index > 0 ? <Icon name="chevR" /> : null}
            {last ? <b aria-current="page">{item}</b> : <span>{item}</span>}
          </span>
        );
      })}
    </nav>
  );
}

export function Heading({
  actions,
  children,
  crumbs,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  crumbs?: string[];
  eyebrow?: string;
  title: string;
}) {
  return (
    <>
      {crumbs ? <Crumbs items={crumbs} /> : null}
      <div className={s.phrow}>
        <div className={s.ph}>
          {eyebrow ? <p className={s.eyebrow}>{eyebrow}</p> : null}
          <h1>{title}</h1>
          {children ? <p>{children}</p> : null}
        </div>
        {actions ? (
          <div className={cx(s.row, s.right)} style={{ marginTop: ".2rem" }}>
            {actions}
          </div>
        ) : null}
      </div>
    </>
  );
}

export function Panel({
  children,
  headExtra,
  meta,
  pad = true,
  title,
}: {
  children: ReactNode;
  headExtra?: ReactNode;
  meta?: ReactNode;
  pad?: boolean;
  title: string;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={s.panel}>
      <div className={s.ph2}>
        <h2 id={id}>{title}</h2>
        {headExtra}
        {meta ? <span className={s.m}>{meta}</span> : null}
      </div>
      <div className={pad ? s.pb : cx(s.pb, s.tight)}>{children}</div>
    </section>
  );
}

export function Alert({
  actions,
  children,
  icon,
  kind,
  style,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  icon?: IconName;
  kind?: "danger" | "ok" | "warn";
  style?: CSSProperties;
  title: string;
}) {
  const fallback: IconName =
    kind === "ok"
      ? "check"
      : kind === "warn" || kind === "danger"
        ? "alert"
        : "info";
  return (
    <div className={cx(s.alert, kind && s[kind])} style={style}>
      <Icon name={icon ?? fallback} />
      <div>
        <b>{title}</b>
        {children}
        {actions ? <div className={s.acts}>{actions}</div> : null}
      </div>
    </div>
  );
}

export function Card({
  children,
  dim,
  selected,
}: {
  children: ReactNode;
  dim?: boolean;
  selected?: boolean;
}) {
  return (
    <div className={cx(s.card, selected && s.sel, dim && s.dim)}>
      {children}
    </div>
  );
}

export function Stat({
  alert,
  children,
  icon,
  label,
  value,
}: {
  alert?: boolean;
  children: ReactNode;
  icon?: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className={cx(s.stat, alert && s.alertc)}>
      <small>
        {icon ? <Icon name={icon} /> : null}
        {label}
      </small>
      <b>{value}</b>
      <span>{children}</span>
    </div>
  );
}

export function ListItem({
  actions,
  children,
  icon,
  sub,
  tone,
}: {
  actions?: ReactNode;
  children: ReactNode;
  icon: IconName;
  sub: ReactNode;
  tone?: "r" | "s" | "w";
}) {
  return (
    <div className={s.li}>
      <span className={cx(s.ico, tone && s[tone])}>
        <Icon name={icon} />
      </span>
      <div className={s.bd}>
        <b>{children}</b>
        <span>{sub}</span>
      </div>
      {actions ? <div className={s.acts}>{actions}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------- forms (static, read-only)
export function Field({
  children,
  count,
  error,
  focused,
  hint,
  kind = "input",
  label,
  lock,
  placeholder,
  value,
}: {
  children?: ReactNode;
  count?: string;
  error?: ReactNode;
  focused?: boolean;
  hint?: ReactNode;
  kind?: "input" | "select" | "textarea";
  label: string;
  lock?: boolean;
  placeholder?: string;
  value?: string;
}) {
  const id = useId();
  const describedBy =
    [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  const common = {
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    id,
    readOnly: true,
  } as const;
  const classes = cx(
    kind === "select" ? s.select : kind === "textarea" ? s.textarea : s.input,
    error ? s.err : undefined,
    lock && s.lock,
    focused && s.foc,
  );
  return (
    <div className={s.field}>
      <label htmlFor={id}>
        {label}
        {lock ? <Icon className={s.lockic} name="lock" /> : null}
        {count ? <span className={s.count}>{count}</span> : null}
      </label>
      {kind === "select" ? (
        <div className={s.selectWrap}>
          <select
            aria-describedby={describedBy}
            className={classes}
            defaultValue={value}
            id={id}
          >
            <option>{value}</option>
          </select>
          <Icon name="chevD" />
        </div>
      ) : kind === "textarea" ? (
        <textarea
          {...common}
          className={classes}
          defaultValue={value}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...common}
          className={classes}
          defaultValue={value}
          placeholder={placeholder}
          type="text"
        />
      )}
      {children}
      {error ? (
        <div className={s.errtxt} id={`${id}-error`}>
          <Icon name="alert" />
          <span>{error}</span>
        </div>
      ) : null}
      {hint ? (
        <div className={s.hint} id={`${id}-hint`}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

// A status line in a checklist: not a form control.
export function CheckItem({
  children,
  on = true,
  sub,
}: {
  children: ReactNode;
  on?: boolean;
  sub?: ReactNode;
}) {
  return (
    <div className={s.check}>
      <span aria-hidden="true" className={cx(s.cb, on && s.on)}>
        {on ? <Icon name="check" /> : null}
      </span>
      <div>
        <span className={s.srOnly}>{on ? "Done: " : "Not done: "}</span>
        {children}
        {sub ? (
          <span className={cx(s.muted, s.small, s.block)}>{sub}</span>
        ) : null}
      </div>
    </div>
  );
}

// A real (read-only in this preview) checkbox or radio with its own label.
export function Choice({
  checked = false,
  children,
  name,
  sub,
  type = "checkbox",
}: {
  checked?: boolean;
  children: ReactNode;
  name?: string;
  sub?: ReactNode;
  type?: "checkbox" | "radio";
}) {
  return (
    <label className={cx(s.check, s.choice)}>
      <input
        checked={checked}
        className={s.srOnly}
        name={name}
        readOnly
        type={type}
      />
      <span
        aria-hidden="true"
        className={cx(type === "radio" ? s.rd : s.cb, checked && s.on)}
      >
        {type === "checkbox" && checked ? <Icon name="check" /> : null}
      </span>
      <div>
        {children}
        {sub ? (
          <span className={cx(s.muted, s.small, s.block)}>{sub}</span>
        ) : null}
      </div>
    </label>
  );
}

// ---------------------------------------------------------------- responsive data table
export type TableCell = {
  className?: "act" | "main";
  label: string;
  node: ReactNode;
};
export type TableRow = { cells: TableCell[]; selected?: boolean };

// Rows are CSS grids, so the ARIA roles are explicit. Under 768px each row
// becomes a card whose cells show their own label.
export function DataTable({
  caption,
  cols,
  head,
  rows,
}: {
  caption: string;
  cols: string;
  head: string[];
  rows: TableRow[];
}) {
  const style = { "--cols": cols } as CSSProperties;
  return (
    <table className={s.tbl} role="table">
      <caption className={s.srOnly}>{caption}</caption>
      <thead role="rowgroup">
        <tr className={cx(s.tr, s.th)} role="row" style={style}>
          {head.map((label, index) => (
            <th
              className={s.td}
              key={`${label}-${index}`}
              role="columnheader"
              scope="col"
            >
              {label ? label : <span className={s.srOnly}>Actions</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {rows.map((row, index) => (
          <tr
            className={cx(s.tr, row.selected && s.sel)}
            key={index}
            role="row"
            style={style}
          >
            {row.cells.map((cell, cellIndex) => (
              <td
                className={cx(s.td, cell.className && s[cell.className])}
                data-l={cell.label}
                key={cellIndex}
                role="cell"
              >
                {cell.node}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PersonCell({
  initials,
  kind,
  name,
  sub,
}: {
  initials: string;
  kind?: "slate" | "soft" | "teal";
  name: string;
  sub: string;
}) {
  return (
    <div className={cx(s.row, s.nw)}>
      <Avatar initials={initials} kind={kind ?? "soft"} size="sm" />
      <div style={{ minWidth: 0 }}>
        <span className={s.t}>{name}</span>
        <span className={s.s}>{sub}</span>
      </div>
    </div>
  );
}

export function Two({ sub, title }: { sub: string; title: string }) {
  return (
    <>
      <span className={s.t}>{title}</span>
      <span className={s.s}>{sub}</span>
    </>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className={s.toolbar}>{children}</div>;
}

export function SearchBox({ label }: { label: string }) {
  const id = useId();
  return (
    <div className={s.search}>
      <Icon name="search" />
      <label className={s.srOnly} htmlFor={id}>
        {label}
      </label>
      <input
        className={s.searchInput}
        id={id}
        placeholder={label}
        readOnly
        type="search"
      />
    </div>
  );
}

export function SelectBox({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const id = useId();
  return (
    <span className={s.selBox}>
      <label htmlFor={id}>{label}</label>
      <select className={s.selBoxInput} defaultValue="" id={id}>
        <option value="">{children}</option>
      </select>
    </span>
  );
}

export function Pager({ children }: { children: ReactNode }) {
  return (
    <div className={s.pager}>
      <span>{children}</span>
      <span className={cx(s.right, s.row)}>
        <Btn disabled kind="sec" size="sm">
          Previous
        </Btn>
        <Btn kind="sec" size="sm">
          Next
        </Btn>
      </span>
    </div>
  );
}

export function Tabs({
  items,
}: {
  items: Array<{ current?: boolean; label: string; pill?: ReactNode }>;
}) {
  return (
    <div className={s.tabs} role="group" aria-label="Sections">
      {items.map((item) => (
        <button
          aria-pressed={item.current ? true : false}
          className={cx(s.tabBtn, item.current && s.on)}
          key={item.label}
          type="button"
        >
          {item.label}
          {item.pill}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- small structural helpers
export function Grid({
  children,
  kind,
  style,
}: {
  children: ReactNode;
  kind: "g2" | "g3" | "g4" | "gmain" | "gmainRev" | "gs3";
  style?: CSSProperties;
}) {
  return (
    <div
      className={kind === "gmainRev" ? cx(s.gmain, s.rev) : s[kind]}
      style={style}
    >
      {children}
    </div>
  );
}

export function Row({
  children,
  nowrap,
  style,
}: {
  children: ReactNode;
  nowrap?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className={cx(s.row, nowrap && s.nw)} style={style}>
      {children}
    </div>
  );
}

export function Hash({ children }: { children: ReactNode }) {
  return <span className={s.hash}>{children}</span>;
}

export function Mono({ children }: { children: ReactNode }) {
  return <span className={s.mono}>{children}</span>;
}

export function Dialog({
  children,
  description,
  footer,
  icon,
  title,
  tone,
  wide,
}: {
  children: ReactNode;
  description: ReactNode;
  footer: ReactNode;
  icon: IconName;
  title: string;
  tone?: "r" | "w";
  wide?: boolean;
}) {
  const id = useId();
  return (
    <div className={s.overlay}>
      <div className={s.scrim} />
      <div
        aria-labelledby={id}
        aria-modal="true"
        className={cx(s.dlg, wide && s.wide)}
        role="dialog"
      >
        <div className={s.dh}>
          <span className={cx(s.ico, tone && s[tone])}>
            <Icon name={icon} />
          </span>
          <div>
            <h2 id={id}>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className={s.db}>{children}</div>
        <div className={s.df}>{footer}</div>
      </div>
    </div>
  );
}

export function CodeBoxes({
  filled,
  label,
}: {
  filled: string[];
  label: string;
}) {
  const id = useId();
  const digits = Array.from({ length: 6 }, (_, index) => filled[index] ?? "");
  return (
    <div className={s.field}>
      <label htmlFor={id}>{label}</label>
      <div aria-hidden="true" className={s.codes}>
        {digits.map((digit, index) => (
          <i
            className={index === filled.length - 1 ? s.f : undefined}
            key={index}
          >
            {digit}
          </i>
        ))}
      </div>
      <input
        autoComplete="one-time-code"
        className={s.srOnly}
        defaultValue={filled.join("")}
        id={id}
        inputMode="numeric"
        maxLength={6}
        readOnly
        type="text"
      />
    </div>
  );
}
