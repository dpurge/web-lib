// Writes synthetic sample data (never real data) to web/data/:
//   bookshelf.json    shelves of books, same shape as the real collection
//   covers/cover-N.svg  placeholder covers
// Deterministic: running it again produces identical files.
import { mkdirSync, writeFileSync } from 'node:fs';

const shelfSizes = [12, 20, 7, 15, 4, 9, 3, 8];
const coverCount = 5;
// Real covers are 128 px wide and 170-230 px high, so the samples vary in height too.
const coverWidth = 128;
const coverHeights = [170, 190, 205, 215, 230];

// small seeded generator (mulberry32) so output is reproducible
let seed = 20261019;
function random() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (list) => list[Math.floor(random() * list.length)];

const topics = ['Rivers', 'Mountains', 'Harbours', 'Gardens', 'Bridges', 'Markets', 'Lighthouses', 'Orchards'];
const forms = ['A Short Guide to', 'Notes on', 'The Complete Book of', 'Tales of', 'An Introduction to'];
const surnames = ['Alder', 'Brook', 'Castell', 'Dunmore', 'Everly', 'Fenwick', 'Garrow', 'Hale'];
const subtitles = ['', '', 'Second edition', 'Illustrated', 'Volume 1', 'Volume 2'];
const descriptions = ['', '', 'A sample description that shows how a short note about the book is displayed.'];

// hand-placed cases the layout must survive
const specialTitles = new Map([
  [3, 'A Very Long Sample Title That Keeps Going To Test How Cards Wrap When The Text Does Not Fit On One Line'],
  [5, 'Пример названия книги'],
  [9, '示例书名'],
]);

function slug(index) {
  return `sample-book-${String(index).padStart(3, '0')}`;
}

let bookIndex = 0;
const shelves = shelfSizes.map((size, shelfIndex) => ({
  title: `Sample shelf ${shelfIndex + 1}`,
  description: shelfIndex % 3 === 0 ? 'A synthetic shelf used to preview the layout.' : '',
  books: Array.from({ length: size }, () => {
    bookIndex += 1;
    const book = {
      title: specialTitles.get(bookIndex) ?? `${pick(forms)} ${pick(topics)}`,
      subtitle: pick(subtitles),
      author: `${pick(surnames)} ${pick(surnames)}`,
      year: String(1900 + Math.floor(random() * 120)),
      description: pick(descriptions),
      // about one book in four has no cover, so the placeholder is exercised
      cover: random() < 0.25 ? '' : `./data/covers/cover-${(bookIndex % coverCount) + 1}.svg`,
      book: random() < 0.15 ? '' : `./${slug(bookIndex)}/index.html`,
    };
    // pdf and audio are absent from most books, as in the real data
    if (random() < 0.3) book.pdf = `./${slug(bookIndex)}/book.pdf`;
    if (random() < 0.3) book.audio = random() < 0.2 ? '' : `./${slug(bookIndex)}/audio.html`;
    return book;
  }),
}));

mkdirSync('web/data/covers', { recursive: true });
writeFileSync('web/data/bookshelf.json', `${JSON.stringify(shelves, null, 2)}\n`);

for (let n = 1; n <= coverCount; n += 1) {
  const hue = (n * 67) % 360;
  const height = coverHeights[n - 1];
  const light = `hsl(${hue} 45% 80%)`;
  writeFileSync(
    `web/data/covers/cover-${n}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${coverWidth}" height="${height}" viewBox="0 0 ${coverWidth} ${height}">` +
      `<rect width="${coverWidth}" height="${height}" fill="hsl(${hue} 45% 40%)"/>` +
      `<rect x="12" y="12" width="${coverWidth - 24}" height="${height - 24}" fill="none" stroke="${light}" stroke-width="2"/>` +
      `<rect x="28" y="52" width="${coverWidth - 56}" height="8" fill="${light}"/>` +
      `<rect x="28" y="70" width="${coverWidth - 90}" height="8" fill="${light}"/></svg>\n`,
  );
}
console.log(`Wrote ${bookIndex} books in ${shelves.length} shelves to web/data/`);
