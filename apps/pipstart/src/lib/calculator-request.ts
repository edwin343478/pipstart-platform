export const REFERENCE_RATE_TIMEOUT_MS = 8_000;

// Bound both fetch and JSON body reading, even if a mock/transport ignores abort.
export async function withCalculatorDeadline<T>(
  work: (signal: AbortSignal) => Promise<T>,
  parentSignal?: AbortSignal,
  timeoutMs = REFERENCE_RATE_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abortParent: (() => void) | undefined;
  try {
    return await new Promise<T>((resolve, reject) => {
      abortParent = () => {
        controller.abort();
        reject(new DOMException("The request was cancelled.", "AbortError"));
      };
      if (parentSignal?.aborted) {
        abortParent();
        return;
      }
      parentSignal?.addEventListener("abort", abortParent, { once: true });
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error("The reference-rate request timed out."));
      }, timeoutMs);
      Promise.resolve()
        .then(() => {
          if (controller.signal.aborted) {
            throw new DOMException("The request was cancelled.", "AbortError");
          }
          return work(controller.signal);
        })
        .then(resolve, reject);
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (abortParent) parentSignal?.removeEventListener("abort", abortParent);
    controller.abort();
  }
}
