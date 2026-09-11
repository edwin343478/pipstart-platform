import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { joinClasses } from "./utils";
export function Tabs(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} role="tablist" />;
}
export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
  selected: boolean;
};
export function Tab({
  className,
  controls,
  selected,
  type = "button",
  ...props
}: TabProps) {
  return (
    <button
      {...props}
      type={type}
      role="tab"
      aria-controls={controls}
      aria-selected={selected}
      className={joinClasses(
        "min-h-11 rounded-lg px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        selected
          ? "bg-action text-action-foreground"
          : "text-muted hover:text-foreground",
        className,
      )}
    />
  );
}
