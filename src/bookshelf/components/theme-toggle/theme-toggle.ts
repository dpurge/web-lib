import { imageUrl } from '../../assets';
import { Theme, chooseTheme, effectiveTheme, onSystemThemeChange, otherTheme } from '../../theme';
import template from './theme-toggle.html';

const labels: Record<Theme, string> = {
  [Theme.Light]: 'Light',
  [Theme.Dark]: 'Dark',
};
const iconNames: Record<Theme, string> = {
  [Theme.Light]: 'sun.svg',
  [Theme.Dark]: 'moon.svg',
};

// A button that shows the theme it will switch to, not the current one.
class ThemeToggle extends HTMLElement {
  #stopListening?: () => void;
  // The page's theme can be set by someone else, e.g. the stored choice applied at start-up
  // after this element was already rendered, so the label watches the attribute itself.
  #themeObserver = new MutationObserver(() => this.#refresh());

  connectedCallback() {
    this.innerHTML = template;
    this.querySelector('button')!.addEventListener('click', () => {
      chooseTheme(otherTheme(effectiveTheme()));
      this.#refresh();
    });
    // Without a chosen theme the page follows the device, so the label must follow it too.
    this.#stopListening = onSystemThemeChange(() => this.#refresh());
    this.#themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    this.#refresh();
  }

  disconnectedCallback() {
    this.#stopListening?.();
    this.#themeObserver.disconnect();
  }

  #refresh() {
    const next = otherTheme(effectiveTheme());
    this.querySelector('button')!.setAttribute('aria-label', `Switch to ${next} theme`);
    this.querySelector<HTMLImageElement>('.theme-toggle-icon')!.src = imageUrl(iconNames[next]);
    this.querySelector('.theme-toggle-label')!.textContent = labels[next];
  }
}

customElements.define('theme-toggle', ThemeToggle);
