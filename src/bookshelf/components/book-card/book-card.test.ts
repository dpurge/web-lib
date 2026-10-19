import '../../test-support';
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { makeBook } from '../../test-support';
import './book-card';

type BookCardElement = HTMLElement & { data: ReturnType<typeof makeBook> };

function render(book = makeBook()): BookCardElement {
  const card = document.createElement('book-card') as BookCardElement;
  card.data = book;
  document.body.append(card);
  return card;
}

const text = (card: HTMLElement, selector: string) => card.querySelector(selector)!.textContent;

beforeEach(() => {
  document.body.innerHTML = '';
});

test('shows title, subtitle, author, year and description', () => {
  const card = render();
  assert.equal(text(card, '.book-title'), 'Title');
  assert.equal(text(card, '.book-subtitle'), 'Subtitle');
  assert.equal(text(card, '.book-author'), 'Author');
  assert.equal(text(card, '.book-year'), '1999');
  assert.equal(text(card, '.book-description'), 'Description');
});

test('shows the cover, with the title as alternative text', () => {
  const cover = render().querySelector<HTMLImageElement>('.book-cover')!;
  assert.match(cover.src, /cover\.png$/);
  assert.equal(cover.alt, 'Title');
});

test('uses the placeholder when the cover is empty', () => {
  const cover = render(makeBook({ cover: '' })).querySelector<HTMLImageElement>('.book-cover')!;
  assert.match(cover.src, /img\/bookshelf\/cover\.svg$/);
});

test('marks only the placeholder cover, so the dark theme can dim it', () => {
  assert.equal(render(makeBook({ cover: '' })).querySelector('.book-cover-placeholder') !== null, true);
  assert.equal(render(makeBook({ cover: './c.png' })).querySelector('.book-cover-placeholder'), null);
});

test('shows no links when none are set', () => {
  assert.equal(render().querySelectorAll('.book-link').length, 0);
});

test('shows no link for an empty string', () => {
  assert.equal(render(makeBook({ book: '', pdf: '', audio: '' })).querySelectorAll('.book-link').length, 0);
});

test('shows one link per set field, in book, PDF, audio order', () => {
  const card = render(makeBook({ book: './b.html', pdf: './b.pdf', audio: './a.html' }));
  const links = [...card.querySelectorAll<HTMLAnchorElement>('.book-link')];
  assert.deepEqual(links.map((link) => link.title), ['Book', 'PDF', 'Audio']);
  assert.deepEqual(links.map((link) => link.getAttribute('href')), ['./b.html', './b.pdf', './a.html']);
  assert.match(links[1].querySelector('img')!.src, /img\/bookshelf\/pdf\.svg$/);
});

test('shows book values as text, never as HTML', () => {
  const card = render(makeBook({ title: '<b>bold</b>', description: '<img src=x>' }));
  assert.equal(text(card, '.book-title'), '<b>bold</b>');
  assert.equal(card.querySelector('.book-title b'), null);
  assert.equal(card.querySelector('.book-description img'), null);
});

test('renders again when new data is set', () => {
  const card = render();
  card.data = makeBook({ title: 'Other' });
  assert.equal(card.querySelectorAll('.book-title').length, 1);
  assert.equal(text(card, '.book-title'), 'Other');
});
