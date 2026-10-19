import '../../test-support';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Shelf } from '../../book';
import { makeBook, makeShelf } from '../../test-support';
import './book-shelf';

function render(shelf: Shelf) {
  const element = document.createElement('book-shelf') as HTMLElement & { data: Shelf };
  element.data = shelf;
  document.body.append(element);
  return element;
}

test('shows the title and description', () => {
  const element = render(makeShelf({ title: 'Atlases', description: 'Maps' }));
  assert.equal(element.querySelector('.shelf-title')!.textContent, 'Atlases');
  assert.equal(element.querySelector('.shelf-description')!.textContent, 'Maps');
});

test('shows one card per book, in order', () => {
  const books = [makeBook({ title: 'A' }), makeBook({ title: 'B' }), makeBook({ title: 'C' })];
  const element = render(makeShelf({ books }));
  const titles = [...element.querySelectorAll('book-card .book-title')].map((node) => node.textContent);
  assert.deepEqual(titles, ['A', 'B', 'C']);
});

test('shows no cards for an empty shelf', () => {
  assert.equal(render(makeShelf({ books: [] })).querySelectorAll('book-card').length, 0);
});
