import template from './shelf-tabs.html';

// Usage:
//   tabs.tabs = ['First (3)', 'Second (5)'];
//   tabs.selected = 0;
//   tabs.addEventListener('tab-select', (event) => { tabs.selected = event.detail; });
//
// The component does not change its own selection: it reports the user's choice in a
// `tab-select` event (detail: the 0-based index) and the owner sets `selected`.
// Buttons are updated in place, so keyboard focus survives a selection change.
export const tabIdPrefix = 'shelf-tab-';

export class ShelfTabs extends HTMLElement {
  #labels: string[] = [];
  #selected = 0;

  constructor() {
    super();
    this.addEventListener('click', (event) => {
      const index = this.#indexOf(event.target);
      if (index >= 0) this.#choose(index);
    });
    this.addEventListener('keydown', (event) => this.#onKeydown(event));
  }

  set tabs(labels: string[]) {
    this.#labels = labels;
    this.#render();
  }

  set selected(index: number) {
    this.#selected = index;
    this.#updateSelection();
  }

  get selected(): number {
    return this.#selected;
  }

  #buttons(): HTMLButtonElement[] {
    return [...this.querySelectorAll<HTMLButtonElement>('.shelf-tab')];
  }

  #indexOf(target: EventTarget | null): number {
    const button = (target as HTMLElement | null)?.closest?.('.shelf-tab');
    return this.#buttons().indexOf(button as HTMLButtonElement);
  }

  #render() {
    this.innerHTML = template;
    const buttons = this.#labels.map((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shelf-tab';
      button.id = `${tabIdPrefix}${index}`;
      button.setAttribute('role', 'tab');
      const controls = this.getAttribute('controls');
      if (controls) button.setAttribute('aria-controls', controls);
      button.textContent = label;
      return button;
    });
    this.querySelector('.shelf-tabs-bar')!.replaceChildren(...buttons);
    this.#updateSelection();
  }

  #updateSelection() {
    this.#buttons().forEach((button, index) => {
      const isSelected = index === this.#selected;
      button.setAttribute('aria-selected', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    });
  }

  #choose(index: number) {
    this.dispatchEvent(new CustomEvent<number>('tab-select', { detail: index, bubbles: true }));
  }

  #onKeydown(event: KeyboardEvent) {
    const buttons = this.#buttons();
    const current = this.#indexOf(event.target);
    if (current < 0) return;

    const last = buttons.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target === undefined) return;

    event.preventDefault();
    buttons[target].focus();
    this.#choose(target);
  }
}

customElements.define('shelf-tabs', ShelfTabs);
