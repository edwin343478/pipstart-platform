import type { ChangeEvent } from "react";
import { EMAIL_PREFERENCE_MODEL, type LearningEmailFrequency } from "../lib/email-preferences";
import styles from "./account-forms.module.css";

export function EmailPreferenceFields({
  educational, marketing, frequency = "all", showFrequency = false,
  onEducationalChange, onMarketingChange,
}: {
  educational: boolean;
  marketing: boolean;
  frequency?: LearningEmailFrequency;
  showFrequency?: boolean;
  onEducationalChange?: (value: boolean) => void;
  onMarketingChange?: (value: boolean) => void;
}) {
  return (
    <>
      <input type="hidden" name="emailPreferenceModel" value={EMAIL_PREFERENCE_MODEL} />
      <label className={styles.preference}>
        <input name="educationalEmails" type="checkbox"
          {...(onEducationalChange ? { checked: educational,
            onChange: (event: ChangeEvent<HTMLInputElement>) => onEducationalChange(event.target.checked) }
            : { defaultChecked: educational })} />
        <span><strong>Learning emails</strong><small>Course guidance, learning reminders and progress updates from PipStart.</small></span>
      </label>
      <label className={styles.preference}>
        <input name="marketingEmails" type="checkbox"
          {...(onMarketingChange ? { checked: marketing,
            onChange: (event: ChangeEvent<HTMLInputElement>) => onMarketingChange(event.target.checked) }
            : { defaultChecked: marketing })} />
        <span><strong>Partner offers from PipStart</strong><small>Occasional partner offers sent by PipStart, not directly by partners.</small></span>
      </label>
      {showFrequency ? (
        <div className={styles.field} role="group" aria-label="Learning email frequency">
          <span>Learning email frequency</span>
          <label className={styles.checkbox}><input type="radio" name="learningFrequency" value="all" defaultChecked={frequency === "all"} />Learning reminders and summaries</label>
          <label className={styles.checkbox}><input type="radio" name="learningFrequency" value="weekly" defaultChecked={frequency === "weekly"} />Weekly summary only</label>
          <small>This choice does not turn learning emails back on if you have switched them off.</small>
        </div>
      ) : <input type="hidden" name="learningFrequency" value="all" />}
    </>
  );
}
