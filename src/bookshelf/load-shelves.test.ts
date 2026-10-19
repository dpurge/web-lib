import './test-support';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadShelves } from './load-shelves';
import { makeShelf, mockFetch } from './test-support';

test('returns validated shelves', async () => {
  mockFetch(() => Response.json([makeShelf({ title: 'One' })]));
  const shelves = await loadShelves('data.json');
  assert.equal(shelves[0].title, 'One');
});

test('an HTTP error names the file and status', async () => {
  mockFetch(() => new Response('nope', { status: 404, statusText: 'Not Found' }));
  await assert.rejects(loadShelves('missing.json'), /missing\.json: 404 Not Found/);
});

test('a network failure names the file and the reason', async () => {
  globalThis.fetch = (async () => {
    throw new TypeError('Failed to fetch');
  }) as typeof fetch;
  await assert.rejects(loadShelves('offline.json'), /Could not load offline\.json: Failed to fetch/);
});

test('invalid JSON names the file', async () => {
  mockFetch(() => new Response('{not json'));
  await assert.rejects(loadShelves('broken.json'), /broken\.json is not valid JSON/);
});

test('a schema mismatch names the file and the path', async () => {
  const shelf = makeShelf();
  mockFetch(() => Response.json([{ ...shelf, books: [{ ...shelf.books[0], year: 1999 }] }]));
  await assert.rejects(loadShelves('wrong.json'), /wrong\.json does not have the expected shape[\s\S]*0\.books\.0\.year/);
});
