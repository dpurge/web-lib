import { imageUrl } from '../../assets';
import { type Book, LinkKind } from '../../book';
import template from './book-card.html';

const linkLabels: Record<LinkKind, string> = {
  [LinkKind.Book]: 'Book',
  [LinkKind.Pdf]: 'PDF',
  [LinkKind.Audio]: 'Audio',
};

function field(root: HTMLElement, className: string): HTMLElement {
  return root.querySelector<HTMLElement>(`.${className}`)!;
}

function createLink(kind: LinkKind, url: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'book-link';
  link.href = url;
  link.title = linkLabels[kind];

  const icon = document.createElement('img');
  icon.src = imageUrl(`${kind}.svg`);
  icon.alt = linkLabels[kind];
  link.append(icon);
  return link;
}

class BookCard extends HTMLElement {
  #book?: Book;

  set data(book: Book) {
    this.#book = book;
    this.#render();
  }

  #render() {
    const book = this.#book;
    if (!book) return;

    // The template is static; book values are only ever set as text or attributes.
    this.innerHTML = template;
    const cover = field(this, 'book-cover') as HTMLImageElement;
    cover.src = book.cover || imageUrl('cover.svg');
    cover.alt = book.title;
    cover.classList.toggle('book-cover-placeholder', !book.cover);
    field(this, 'book-title').textContent = book.title;
    field(this, 'book-subtitle').textContent = book.subtitle;
    field(this, 'book-author').textContent = book.author;
    field(this, 'book-year').textContent = book.year;
    field(this, 'book-description').textContent = book.description;

    const links = field(this, 'book-links');
    for (const kind of Object.values(LinkKind)) {
      const url = book[kind];
      if (url) links.append(createLink(kind, url));
    }
  }
}

customElements.define('book-card', BookCard);
