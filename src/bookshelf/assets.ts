// Icons are located relative to this script (js/bookshelf.js), not to the page,
// so the page and its data can be renamed or moved without breaking them.
export function imageUrl(name: string): string {
  return new URL(`../img/bookshelf/${name}`, import.meta.url).href;
}
