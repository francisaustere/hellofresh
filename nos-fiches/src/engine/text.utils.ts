/** Lowercase, strip accents and apostrophes so "Crème fraîche" matches "creme fraiche". Keeps the length. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ");
}

export function splitWords(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

export type TextSegment = { text: string, isMatch: boolean };

/** Splits text into plain and matching segments for each query word found (accent-insensitive). */
export function highlightSegments(text: string, words: string[]): TextSegment[] {
  const source = normalize(text);
  const ranges: [number, number][] = [];
  for (const word of words) {
    if (word.length < 2) continue;
    const start = source.indexOf(word);
    if (start >= 0) ranges.push([start, start + word.length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start < cursor) continue;
    if (start > cursor) segments.push({ text: text.slice(cursor, start), isMatch: false });
    segments.push({ text: text.slice(start, end), isMatch: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), isMatch: false });
  return segments;
}
