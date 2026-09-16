import type { ProgressSyncState } from "../lib/use-permanent-progress";

export function ProgressSyncStatus({
  className,
  message,
  retry,
  state,
}: {
  className?: string;
  message: string;
  retry?: () => void;
  state: ProgressSyncState;
}) {
  return (
    <p aria-live="polite" className={className} role="status">
      {message}
      {state === "error" && retry ? (
        <>
          {" "}
          <button type="button" onClick={retry}>
            Retry save
          </button>
        </>
      ) : null}
    </p>
  );
}
