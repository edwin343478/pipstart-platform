export type PublicationStatus = "draft" | "published";

export type PublishableContent = {
  status: PublicationStatus;
};

export function selectPublishedContent<T extends PublishableContent>(
  entries: readonly T[],
): T[] {
  return entries.filter((entry) => entry.status === "published");
}
