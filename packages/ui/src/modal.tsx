"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { joinClasses } from "./utils";
export type ModalProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
};
export function Modal({
  children,
  className,
  description,
  onClose,
  open,
  title,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className={joinClasses(
        "max-w-lg rounded-xl border border-border bg-surface p-6 text-foreground backdrop:bg-black/50",
        className,
      )}
      onCancel={onClose}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-muted">{description}</p> : null}
      <div className="mt-4">{children}</div>
      <Button className="mt-6" variant="secondary" onClick={onClose}>
        Close
      </Button>
    </dialog>
  );
}
