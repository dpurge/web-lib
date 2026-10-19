// Importing this module first gives a test a DOM (happy-dom) with custom element support.
import { Window } from 'happy-dom';
import type { Book, Shelf } from './book';

const window = new Window({ url: 'http://localhost/' });
Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  customElements: window.customElements,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  KeyboardEvent: window.KeyboardEvent,
  MutationObserver: window.MutationObserver,
});

// A stand-in for the device's light/dark setting; tests change it with setSystemTheme.
let systemIsDark = false;
const systemThemeListeners = new Set<() => void>();
Object.assign(window, {
  matchMedia: (query: string) => ({
    get matches() {
      return query.includes('dark') && systemIsDark;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => systemThemeListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => systemThemeListeners.delete(listener),
  }),
});

export function setSystemTheme(dark: boolean) {
  systemIsDark = dark;
  for (const listener of systemThemeListeners) listener();
}

// Runs `action` while localStorage throws, as it does in some private-browsing modes.
export function withBrokenStorage(action: () => void) {
  const broken = {
    getItem() {
      throw new Error('storage blocked');
    },
    setItem() {
      throw new Error('storage blocked');
    },
  };
  Object.defineProperty(window, 'localStorage', { value: broken, configurable: true });
  try {
    action();
  } finally {
    delete (window as { localStorage?: unknown }).localStorage;
  }
}

export function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    title: 'Title',
    subtitle: 'Subtitle',
    author: 'Author',
    year: '1999',
    description: 'Description',
    cover: './cover.png',
    ...overrides,
  };
}

export function makeShelf(overrides: Partial<Shelf> = {}): Shelf {
  return { title: 'Shelf', description: 'About the shelf', books: [makeBook()], ...overrides };
}

export function mockFetch(respond: () => Response | Promise<Response>) {
  globalThis.fetch = (async () => respond()) as typeof fetch;
}

export async function waitFor(condition: () => boolean, message: string) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error(`Timed out waiting for: ${message}`);
}
