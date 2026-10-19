// The URL hash holds the 1-based position of the selected shelf: "#3" is the third shelf.

// Returns the 0-based shelf index for a hash, or 0 (the first shelf) when the hash
// is empty, not a positive whole number, or beyond the last shelf.
export function indexFromHash(hash: string, shelfCount: number): number {
  if (!/^#[1-9]\d*$/.test(hash)) return 0;
  const position = Number(hash.slice(1));
  return position <= shelfCount ? position - 1 : 0;
}

export function hashFromIndex(index: number): string {
  return `#${index + 1}`;
}
