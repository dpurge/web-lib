import type { Shelf } from '../../book';
import { loadShelves } from '../../load-shelves';
import { hashFromIndex, indexFromHash } from '../../tab-hash';
import '../book-shelf/book-shelf';
import { ShelfTabs, tabIdPrefix } from '../shelf-tabs/shelf-tabs';
import '../theme-toggle/theme-toggle';
import template from './bookshelf-app.html';

// Usage: <bookshelf-app src="path/to/bookshelf.json"></bookshelf-app>
// src is resolved relative to the page.
// The URL hash ("#3") says which shelf is shown, so Back, refresh and bookmarks keep the tab.
class BookshelfApp extends HTMLElement {
  #shelves: Shelf[] = [];
  #shownIndex = -1;
  #onHashChange = () => this.#showSelectedShelf();

  connectedCallback() {
    this.innerHTML = template;
    this.#shelves = [];
    this.#shownIndex = -1;
    this.#tabs().addEventListener('tab-select', (event) => {
      window.location.hash = hashFromIndex((event as CustomEvent<number>).detail);
    });
    window.addEventListener('hashchange', this.#onHashChange);
    void this.#load();
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.#onHashChange);
  }

  async #load() {
    const src = this.getAttribute('src');
    if (!src) {
      this.#showError('<bookshelf-app> needs a src attribute with the path to the data file.');
      return;
    }

    try {
      this.#setShelves(await loadShelves(src));
    } catch (error) {
      this.#showError(error instanceof Error ? error.message : String(error));
    }
  }

  #tabs(): ShelfTabs {
    return this.querySelector<ShelfTabs>('shelf-tabs')!;
  }

  #setShelves(shelves: Shelf[]) {
    this.#shelves = shelves;
    const tabs = this.#tabs();
    tabs.tabs = shelves.map((shelf) => `${shelf.title} (${shelf.books.length})`);
    tabs.hidden = shelves.length === 0;
    this.#showSelectedShelf();
  }

  #showSelectedShelf() {
    if (this.#shelves.length === 0) return;

    const index = indexFromHash(window.location.hash, this.#shelves.length);
    if (index === this.#shownIndex) return;
    this.#shownIndex = index;

    this.#tabs().selected = index;
    const shelf = document.createElement('book-shelf') as HTMLElement & { data: Shelf };
    shelf.data = this.#shelves[index];
    const panel = this.querySelector('.bookshelf-panel')!;
    panel.setAttribute('aria-labelledby', `${tabIdPrefix}${index}`);
    panel.replaceChildren(shelf);
  }

  #showError(message: string) {
    const error = this.querySelector<HTMLElement>('.bookshelf-error')!;
    error.textContent = message;
    error.hidden = false;
  }
}

customElements.define('bookshelf-app', BookshelfApp);
