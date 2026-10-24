import { useId, type ChangeEvent } from "react";
import {
  EMAIL_PREFERENCE_MODEL,
  type LearningEmailFrequency,
} from "../lib/email-preferences";
import styles from "./account-forms.module.css";

export function EmailPreferenceFields({
  educational,
  marketing,
  frequency = "all",
  showFrequency = false,
  onEducationalChange,
  onMarketingChange,
}: {
  educational: boolean;
  marketing: boolean;
  frequency?: LearningEmailFrequency;
  showFrequency?: boolean;
  onEducationalChange?: (value: boolean) => void;
  onMarketingChange?: (value: boolean) => void;
}) {
  const id = useId();
  const learningLabel = `${id}-learning-label`;
  const learningHint = `${id}-learning-hint`;
  const partnerLabel = `${id}-partner-label`;
  const partnerHint = `${id}-partner-hint`;
  const frequencyHint = `${id}-frequency-hint`;
  return (
    <>
      <input
        type="hidden"
        name="emailPreferenceModel"
        value={EMAIL_PREFERENCE_MODEL}
      />
      <label className={styles.preference}>
        <input
          name="educationalEmails"
          type="checkbox"
          aria-labelledby={learningLabel}
          aria-describedby={learningHint}
          {...(onEducationalChange
            ? {
                checked: educational,
                onChange: (event: ChangeEvent<HTMLInputElement>) =>
                  onEducationalChange(event.target.checked),
              }
            : { defaultChecked: educational })}
        />
        <span>
          <strong id={learningLabel}>Learning emails</strong>
          <small id={learningHint}>
            Course guidance, learning reminders and progress updates from
            PipStart.
          </small>
        </span>
      </label>
      <label className={styles.preference}>
        <input
          name="marketingEmails"
          type="checkbox"
          aria-labelledby={partnerLabel}
          aria-describedby={partnerHint}
          {...(onMarketingChange
            ? {
                checked: marketing,
                onChange: (event: ChangeEvent<HTMLInputElement>) =>
                  onMarketingChange(event.target.checked),
              }
            : { defaultChecked: marketing })}
        />
        <span>
          <strong id={partnerLabel}>Partner offers from PipStart</strong>
          <small id={partnerHint}>
            Occasional partner offers sent by PipStart, not directly by
            partners.
          </small>
        </span>
      </label>
      {showFrequency ? (
        <div
          className={styles.frequency}
          role="radiogroup"
          aria-label="Learning email frequency"
          aria-describedby={frequencyHint}
        >
          <span>Learning email frequency</span>
          <label className={styles.checkbox}>
            <input
              type="radio"
              name="learningFrequency"
              value="all"
              aria-describedby={frequencyHint}
              defaultChecked={frequency === "all"}
            />
            Learning reminders and summaries
          </label>
          <label className={styles.checkbox}>
            <input
              type="radio"
              name="learningFrequency"
              value="weekly"
              aria-describedby={frequencyHint}
              defaultChecked={frequency === "weekly"}
            />
            Weekly summary only
          </label>
          <small id={frequencyHint}>
            This choice does not turn learning emails back on if you have
            switched them off.
          </small>
        </div>
      ) : (
        <input type="hidden" name="learningFrequency" value="all" />
      )}
    </>
  );
}
