import type { Shelf } from '../../book';
import '../book-card/book-card';
import template from './book-shelf.html';

class BookShelf extends HTMLElement {
  #shelf?: Shelf;

  set data(shelf: Shelf) {
    this.#shelf = shelf;
    this.#render();
  }

  #render() {
    const shelf = this.#shelf;
    if (!shelf) return;

    this.innerHTML = template;
    this.querySelector('.shelf-title')!.textContent = shelf.title;
    this.querySelector('.shelf-description')!.textContent = shelf.description;

    const cards = shelf.books.map((book) => {
      const card = document.createElement('book-card') as HTMLElement & { data: typeof book };
      card.data = book;
      return card;
    });
    this.querySelector('.shelf-books')!.replaceChildren(...cards);
  }
}

customElements.define('book-shelf', BookShelf);
