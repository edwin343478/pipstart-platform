export const SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION = 1 as const;

export const SKILLCIMA_EMAIL_QUEUE_JOB_TYPES = [
  "course_confirmation",
  "course_day_1",
  "course_day_2",
  "course_day_3",
  "course_day_4",
  "course_day_5",
  "course_day_6",
] as const;

export type SkillcimaEmailQueueJobType =
  (typeof SKILLCIMA_EMAIL_QUEUE_JOB_TYPES)[number];

const SKILLCIMA_EMAIL_QUEUE_JOB_TYPE_SET: ReadonlySet<string> = new Set(
  SKILLCIMA_EMAIL_QUEUE_JOB_TYPES,
);

export function isSkillcimaEmailQueueJobType(
  value: unknown,
): value is SkillcimaEmailQueueJobType {
  return (
    typeof value === "string" && SKILLCIMA_EMAIL_QUEUE_JOB_TYPE_SET.has(value)
  );
}

export interface SkillcimaEmailQueueMessage {
  version: typeof SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION;
  jobId: string;
  jobType: SkillcimaEmailQueueJobType;
}

export interface EmailQueueBinding {
  send(message: SkillcimaEmailQueueMessage): Promise<void>;
}

export function createEmailQueueMessage(input: {
  jobId: string;
  jobType: SkillcimaEmailQueueJobType;
}): SkillcimaEmailQueueMessage {
  return {
    version: SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
    jobId: input.jobId,
    jobType: input.jobType,
  };
}
