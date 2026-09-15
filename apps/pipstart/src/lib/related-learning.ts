const termLabels: Record<string, string> = {
  bitcoin: "Bitcoin",
  blockchain: "Blockchain",
  pip: "Pip",
  "position-size": "Position size",
};

export function getRelatedTermLabels(slugs: readonly string[]): string[] {
  return slugs.map((slug) => termLabels[slug] ?? slug.replaceAll("-", " "));
}
