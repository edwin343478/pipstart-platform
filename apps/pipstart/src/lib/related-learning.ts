export const relatedTermLabels = {
  bitcoin: "Bitcoin",
  blockchain: "Blockchain",
  pip: "Pip",
  "position-size": "Position size",
} as const;

export const relatedTermSlugs = Object.keys(relatedTermLabels);

export function getRelatedTermLabels(slugs: readonly string[]): string[] {
  return slugs.map(
    (slug) =>
      relatedTermLabels[slug as keyof typeof relatedTermLabels] ??
      slug.replaceAll("-", " "),
  );
}
