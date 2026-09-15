import {
  parseLocalProgress,
  serializeLocalProgress,
  toggleLocalProgress,
} from "../../../../lib/local-progress";

export const CRYPTO_LEVEL_ONE_PROGRESS_KEY =
  "pipstart:learn:crypto:level-1:progress";
export const CRYPTO_PROGRESS_CHANGE_EVENT = "pipstart:crypto-progress-change";

export const parseCryptoLessonProgress = parseLocalProgress;
export const serializeCryptoLessonProgress = serializeLocalProgress;
export const toggleCryptoLessonProgress = toggleLocalProgress;
