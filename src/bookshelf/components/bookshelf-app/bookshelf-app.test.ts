import '../../test-support';
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import type { Shelf } from '../../book';
import { makeBook, makeShelf, mockFetch, waitFor } from '../../test-support';
import './bookshelf-app';

function mount(src?: string): HTMLElement {
  const app = document.createElement('bookshelf-app');
  if (src) app.setAttribute('src', src);
  document.body.append(app);
  return app;
}

async function mountWith(shelves: Shelf[]): Promise<HTMLElement> {
  mockFetch(() => Response.json(shelves));
  const app = mount('data.json');
  await waitFor(() => app.querySelector('book-shelf') !== null || shelves.length === 0, 'first shelf');
  return app;
}

const threeShelves = () => [
  makeShelf({ title: 'One', books: [makeBook()] }),
  makeShelf({ title: 'Two', books: [makeBook(), makeBook()] }),
  makeShelf({ title: 'Three', books: [] }),
];

const error = (app: HTMLElement) => app.querySelector<HTMLElement>('.bookshelf-error')!;
const tabs = (app: HTMLElement) => [...app.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const shownTitle = (app: HTMLElement) => app.querySelector('[role="tabpanel"] .shelf-title')?.textContent;
const selectedLabel = (app: HTMLElement) =>
  tabs(app).find((tab) => tab.getAttribute('aria-selected') === 'true')?.textContent;

async function changeHash(hash: string) {
  window.location.hash = hash;
  await new Promise((resolve) => setTimeout(resolve, 20));
}

beforeEach(() => {
  document.body.innerHTML = '';
  window.location.hash = '';
});

test('asks for a src attribute when it is missing', () => {
  const app = mount();
  assert.equal(error(app).hidden, false);
  assert.match(error(app).textContent, /needs a src attribute/);
});

test('loads the file named by src', async () => {
  let requested = '';
  globalThis.fetch = (async (url: string) => {
    requested = url;
    return Response.json(threeShelves());
  }) as unknown as typeof fetch;

  const app = mount('./data/my-books.json');
  await waitFor(() => tabs(app).length === 3, 'three tabs');

  assert.equal(requested, './data/my-books.json');
  assert.equal(error(app).hidden, true);
});

test('shows one tab per shelf with its book count, and only the first shelf', async () => {
  const app = await mountWith(threeShelves());
  assert.deepEqual(tabs(app).map((tab) => tab.textContent), ['One (1)', 'Two (2)', 'Three (0)']);
  assert.equal(selectedLabel(app), 'One (1)');
  assert.equal(shownTitle(app), 'One');
  assert.equal(app.querySelectorAll('book-shelf').length, 1);
});

test('the panel is labelled by the selected tab', async () => {
  const app = await mountWith(threeShelves());
  const panel = app.querySelector('[role="tabpanel"]')!;
  assert.equal(panel.getAttribute('aria-labelledby'), tabs(app)[0].id);
  assert.equal(tabs(app)[0].getAttribute('aria-controls'), panel.id);
});

test('opens on the shelf named by the hash', async () => {
  window.location.hash = '#2';
  const app = await mountWith(threeShelves());
  assert.equal(shownTitle(app), 'Two');
  assert.equal(selectedLabel(app), 'Two (2)');
});

test('an invalid or out-of-range hash shows the first shelf', async () => {
  for (const hash of ['#0', '#99', '#abc']) {
    document.body.innerHTML = '';
    window.location.hash = hash;
    const app = await mountWith(threeShelves());
    assert.equal(shownTitle(app), 'One', hash);
  }
});

test('clicking a tab shows that shelf and puts its position in the hash', async () => {
  const app = await mountWith(threeShelves());
  tabs(app)[1].click();
  await waitFor(() => shownTitle(app) === 'Two', 'second shelf');
  assert.equal(window.location.hash, '#2');
  assert.equal(selectedLabel(app), 'Two (2)');
  assert.equal(app.querySelectorAll('book-shelf').length, 1);
});

test('changing the hash, as the Back button does, changes the shelf', async () => {
  const app = await mountWith(threeShelves());
  await changeHash('#3');
  assert.equal(shownTitle(app), 'Three');
  await changeHash('#1');
  assert.equal(shownTitle(app), 'One');
});

test('a removed app no longer reacts to the hash', async () => {
  const app = await mountWith(threeShelves());
  app.remove();
  await changeHash('#2');
  assert.equal(shownTitle(app), 'One');
});

test('the theme toggle sits in the same bar as the tabs', async () => {
  const app = await mountWith(threeShelves());
  const bar = app.querySelector('.bookshelf-bar')!;
  assert.equal(bar.querySelector('shelf-tabs') !== null, true);
  assert.equal(bar.querySelector('theme-toggle button') !== null, true);
});

test('the theme toggle stays available when the file cannot be loaded', async () => {
  mockFetch(() => new Response('', { status: 500, statusText: 'Server Error' }));
  const app = mount('data.json');
  await waitFor(() => !error(app).hidden, 'error shown');
  assert.equal(app.querySelector('theme-toggle button') !== null, true);
});

test('the theme toggle stays available with zero shelves', async () => {
  const app = await mountWith([]);
  assert.equal(app.querySelector('theme-toggle button') !== null, true);
});

test('no shelves shows no tabs and no error', async () => {
  const app = await mountWith([]);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(app.querySelector<HTMLElement>('shelf-tabs')!.hidden, true);
  assert.equal(tabs(app).length, 0);
  assert.equal(error(app).hidden, true);
});

test('shows the error when the file cannot be loaded', async () => {
  mockFetch(() => new Response('', { status: 500, statusText: 'Server Error' }));
  const app = mount('data.json');
  await waitFor(() => !error(app).hidden, 'error shown');
  assert.match(error(app).textContent, /data\.json: 500 Server Error/);
  assert.equal(tabs(app).length, 0);
});

test('shows the error when the data has the wrong shape', async () => {
  mockFetch(() => Response.json([{ title: 'no books' }]));
  const app = mount('data.json');
  await waitFor(() => !error(app).hidden, 'error shown');
  assert.match(error(app).textContent, /does not have the expected shape/);
});
