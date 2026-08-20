export const SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION = 1 as const;

export type SkillcimaEmailQueueJobType = "course_confirmation";

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
