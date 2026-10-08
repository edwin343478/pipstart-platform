export type GlossaryCourse = "forex" | "crypto";
export type GlossaryEntry = {
  id: string;
  course: GlossaryCourse;
  slug: string;
  name: string;
  href: string;
  status: "draft" | "published";
  approved: boolean;
  sourceReview: "pending" | "verified";
  category: string;
  aliases: readonly { value: string; kind: string }[];
  relatedEntries?: readonly { id: string; kind: string }[];
  lessonLinks?: readonly { lessonId: string; href: string; relation: string }[];
  meanings: readonly {
    definition: string;
    example?: string;
    confusionNote?: string;
    lessons?: readonly { title: string; href: string }[];
  }[];
};
export type GlossarySearchInput = {
  q?: unknown;
  course?: unknown;
  category?: unknown;
  letter?: unknown;
  limit?: unknown;
};
export function normalizeGlossaryText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
export function isPublicGlossaryEntry(entry: GlossaryEntry) {
  return (
    entry.status === "published" &&
    entry.approved === true &&
    entry.sourceReview === "verified"
  );
}
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
// Bounded adjacent-transposition distance. Only term names/approved aliases
// participate, only as a fallback after all direct matches have failed.
function typoDistance(a: string, b: string, maximum: number) {
  if (Math.abs(a.length - b.length) > maximum) return maximum + 1;
  let priorPrior: number[] = [];
  let prior = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let smallest = i;
    for (let j = 1; j <= b.length; j++) {
      let value = Math.min(
        current[j - 1] + 1,
        prior[j] + 1,
        prior[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        value = Math.min(value, priorPrior[j - 2] + 1);
      current[j] = value;
      smallest = Math.min(smallest, value);
    }
    if (smallest > maximum) return maximum + 1;
    priorPrior = prior;
    prior = current;
  }
  return prior[b.length];
}
function queryWordsMatch(text: string, query: string) {
  const words = normalizeGlossaryText(text).split(" ");
  return query
    .split(" ")
    .every(
      (word) =>
        words.includes(word) ||
        (word.length >= 3 &&
          word.endsWith("s") &&
          words.includes(word.slice(0, -1))),
    );
}
// No HTML interpretation, input-derived regex or client storage.
export function searchGlossary(
  entries: readonly GlossaryEntry[],
  input: GlossarySearchInput = {},
) {
  const query = typeof input.q === "string" ? input.q.trim().slice(0, 200) : "";
  const normalized = normalizeGlossaryText(query);
  const course: GlossaryCourse | "" =
    input.course === "forex" || input.course === "crypto" ? input.course : "";
  const category =
    typeof input.category === "string" ? input.category.trim() : "";
  const letter =
    typeof input.letter === "string" && /^[A-Z]$/i.test(input.letter)
      ? input.letter.toUpperCase()
      : "";
  const limit =
    typeof input.limit === "number" && Number.isFinite(input.limit)
      ? Math.max(1, Math.min(500, Math.trunc(input.limit)))
      : 500;
  const matches: {
    entry: GlossaryEntry;
    rank: number;
    matchedBy:
      "name" | "alias" | "component" | "definition" | "browse" | "typo";
  }[] = [];
  for (const entry of entries) {
    if (
      !isPublicGlossaryEntry(entry) ||
      (course && entry.course !== course) ||
      (category && entry.category !== category)
    )
      continue;
    const name = normalizeGlossaryText(entry.name);
    if (!normalized) {
      // A nonempty punctuation-only query is not an accidental request for all terms.
      if (query || (letter && !name.toUpperCase().startsWith(letter))) continue;
      matches.push({ entry, rank: 0, matchedBy: "browse" });
      continue;
    }
    // Search takes precedence over the letter, matching the existing Crypto contract.
    if (name === normalized) {
      matches.push({ entry, rank: 0, matchedBy: "name" });
      continue;
    }
    const exact = entry.aliases.filter(
      (a) => normalizeGlossaryText(a.value) === normalized,
    );
    if (exact.length) {
      const component = exact.every(
        (a) => a.kind === "component-discovery-key",
      );
      matches.push({
        entry,
        rank: component ? 2 : 1,
        matchedBy: component ? "component" : "alias",
      });
      continue;
    }
    if (name.startsWith(normalized)) {
      matches.push({ entry, rank: 3, matchedBy: "name" });
      continue;
    }
    const prefix = entry.aliases.find((a) =>
      normalizeGlossaryText(a.value).startsWith(normalized),
    );
    if (prefix) {
      matches.push({
        entry,
        rank: 4,
        matchedBy:
          prefix.kind === "component-discovery-key" ? "component" : "alias",
      });
      continue;
    }
    if (queryWordsMatch(name, normalized)) {
      matches.push({ entry, rank: 5, matchedBy: "name" });
      continue;
    }
    const substring = entry.aliases.find((a) =>
      queryWordsMatch(a.value, normalized),
    );
    if (substring) {
      matches.push({
        entry,
        rank: 6,
        matchedBy:
          substring.kind === "component-discovery-key" ? "component" : "alias",
      });
      continue;
    }
    if (
      entry.meanings.some((m) =>
        queryWordsMatch(entry.name + " " + m.definition, normalized),
      )
    )
      matches.push({ entry, rank: 7, matchedBy: "definition" });
  }
  if (!matches.length && normalized.length >= 4 && normalized.length <= 80) {
    const maximum = normalized.length >= 8 ? 2 : 1;
    for (const entry of entries) {
      if (
        !isPublicGlossaryEntry(entry) ||
        (course && entry.course !== course) ||
        (category && entry.category !== category)
      )
        continue;
      const candidates = [
        entry.name,
        ...entry.aliases
          .filter((a) => a.kind !== "component-discovery-key")
          .map((a) => a.value),
      ]
        .flatMap((value) => {
          const n = normalizeGlossaryText(value);
          return [n, ...n.split(" ")];
        })
        .filter((n) => n.length >= 3 && n.length <= 80);
      const distance = Math.min(
        ...candidates.map((n) => typoDistance(normalized, n, maximum)),
      );
      if (distance <= maximum)
        matches.push({ entry, rank: 8 + distance, matchedBy: "typo" });
    }
  }
  matches.sort(
    (a, b) =>
      a.rank - b.rank ||
      compare(
        normalizeGlossaryText(a.entry.name),
        normalizeGlossaryText(b.entry.name),
      ) ||
      compare(a.entry.course, b.entry.course) ||
      compare(a.entry.id, b.entry.id),
  );
  return {
    query,
    course,
    category,
    letter,
    total: matches.length,
    usedTypoTolerance: matches.some((m) => m.matchedBy === "typo"),
    results: matches.slice(0, limit),
  };
}
