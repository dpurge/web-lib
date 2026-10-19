import '../../test-support';
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import './shelf-tabs';

type ShelfTabsElement = HTMLElement & { tabs: string[]; selected: number };

function render(labels = ['One (1)', 'Two (2)', 'Three (3)'], selected = 0): ShelfTabsElement {
  const element = document.createElement('shelf-tabs') as ShelfTabsElement;
  element.tabs = labels;
  element.selected = selected;
  document.body.append(element);
  return element;
}

const tabs = (element: HTMLElement) => [...element.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

function listenForSelection(element: HTMLElement): number[] {
  const chosen: number[] = [];
  element.addEventListener('tab-select', (event) => chosen.push((event as CustomEvent<number>).detail));
  return chosen;
}

function press(button: HTMLElement, key: string) {
  button.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

beforeEach(() => {
  document.body.innerHTML = '';
});

test('renders one tab per label inside a tablist', () => {
  const element = render();
  assert.deepEqual(tabs(element).map((tab) => tab.textContent), ['One (1)', 'Two (2)', 'Three (3)']);
  assert.equal(element.querySelector('[role="tablist"]') !== null, true);
});

test('marks only the selected tab, and only it is in the Tab key order', () => {
  const element = render(undefined, 1);
  assert.deepEqual(tabs(element).map((tab) => tab.getAttribute('aria-selected')), ['false', 'true', 'false']);
  assert.deepEqual(tabs(element).map((tab) => tab.tabIndex), [-1, 0, -1]);
});

test('shows labels as text, never as HTML', () => {
  const element = render(['<b>x</b>']);
  assert.equal(tabs(element)[0].textContent, '<b>x</b>');
  assert.equal(element.querySelector('.shelf-tab b'), null);
});

test('clicking a tab reports its index and leaves the selection to the owner', () => {
  const element = render();
  const chosen = listenForSelection(element);
  tabs(element)[2].click();
  assert.deepEqual(chosen, [2]);
  assert.equal(element.selected, 0);
});

test('changing the selection updates the tabs in place', () => {
  const element = render();
  const before = tabs(element);
  element.selected = 2;
  assert.deepEqual(tabs(element), before);
  assert.deepEqual(tabs(element).map((tab) => tab.getAttribute('aria-selected')), ['false', 'false', 'true']);
});

test('arrow keys move to the next and previous tab and wrap around', () => {
  const element = render();
  const chosen = listenForSelection(element);
  press(tabs(element)[0], 'ArrowRight');
  press(tabs(element)[2], 'ArrowRight');
  press(tabs(element)[0], 'ArrowLeft');
  press(tabs(element)[1], 'ArrowLeft');
  assert.deepEqual(chosen, [1, 0, 2, 0]);
});

test('Home and End go to the first and last tab', () => {
  const element = render(undefined, 1);
  const chosen = listenForSelection(element);
  press(tabs(element)[1], 'End');
  press(tabs(element)[1], 'Home');
  assert.deepEqual(chosen, [2, 0]);
});

test('keyboard navigation moves focus to the chosen tab', () => {
  const element = render();
  press(tabs(element)[0], 'ArrowRight');
  assert.equal(document.activeElement, tabs(element)[1]);
});

test('other keys do nothing', () => {
  const element = render();
  const chosen = listenForSelection(element);
  press(tabs(element)[0], 'a');
  assert.deepEqual(chosen, []);
});

test('tabs point at their panel through the controls attribute', () => {
  const element = document.createElement('shelf-tabs') as ShelfTabsElement;
  element.setAttribute('controls', 'panel');
  element.tabs = ['One'];
  assert.equal(tabs(element)[0].getAttribute('aria-controls'), 'panel');
});

test('no labels renders an empty bar', () => {
  assert.equal(tabs(render([])).length, 0);
});
