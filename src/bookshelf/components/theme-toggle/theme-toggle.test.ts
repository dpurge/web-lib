import '../../test-support';
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { setSystemTheme, withBrokenStorage } from '../../test-support';
import { Theme, chooseTheme, storedTheme } from '../../theme';
import './theme-toggle';

const root = () => document.documentElement;

function render(): HTMLElement {
  const toggle = document.createElement('theme-toggle');
  document.body.append(toggle);
  return toggle;
}

const label = (toggle: HTMLElement) => toggle.querySelector('.theme-toggle-label')!.textContent;
const accessibleName = (toggle: HTMLElement) => toggle.querySelector('button')!.getAttribute('aria-label');
const iconSource = (toggle: HTMLElement) => toggle.querySelector<HTMLImageElement>('.theme-toggle-icon')!.src;
const click = (toggle: HTMLElement) => toggle.querySelector('button')!.click();

beforeEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
  delete root().dataset.theme;
  setSystemTheme(false);
});

test('in the light theme it offers the dark theme, with a moon', () => {
  const toggle = render();
  assert.equal(label(toggle), 'Dark');
  assert.equal(accessibleName(toggle), 'Switch to dark theme');
  assert.match(iconSource(toggle), /img\/bookshelf\/moon\.svg$/);
});

test('in the dark theme it offers the light theme, with a sun', () => {
  setSystemTheme(true);
  const toggle = render();
  assert.equal(label(toggle), 'Light');
  assert.equal(accessibleName(toggle), 'Switch to light theme');
  assert.match(iconSource(toggle), /img\/bookshelf\/sun\.svg$/);
});

test('clicking switches the page theme, remembers it and flips the label', () => {
  const toggle = render();
  click(toggle);
  assert.equal(root().dataset.theme, 'dark');
  assert.equal(storedTheme(), Theme.Dark);
  assert.equal(label(toggle), 'Light');
  assert.match(iconSource(toggle), /sun\.svg$/);
});

test('clicking twice returns to the light theme', () => {
  const toggle = render();
  click(toggle);
  click(toggle);
  assert.equal(root().dataset.theme, 'light');
  assert.equal(storedTheme(), Theme.Light);
  assert.equal(label(toggle), 'Dark');
});

test('with a dark device setting and no choice, clicking chooses light', () => {
  setSystemTheme(true);
  const toggle = render();
  click(toggle);
  assert.equal(root().dataset.theme, 'light');
  assert.equal(label(toggle), 'Dark');
});

test('without a chosen theme the label follows device setting changes', () => {
  const toggle = render();
  setSystemTheme(true);
  assert.equal(label(toggle), 'Light');
  setSystemTheme(false);
  assert.equal(label(toggle), 'Dark');
});

test('a chosen theme is not changed by the device setting', () => {
  chooseTheme(Theme.Light);
  const toggle = render();
  setSystemTheme(true);
  assert.equal(label(toggle), 'Dark');
});

test('the label follows a theme applied after the toggle was rendered', async () => {
  const toggle = render();
  assert.equal(label(toggle), 'Dark');
  root().dataset.theme = 'dark';
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(label(toggle), 'Light');
  assert.match(iconSource(toggle), /sun\.svg$/);
});

test('a removed toggle stops watching the theme attribute', async () => {
  const toggle = render();
  toggle.remove();
  root().dataset.theme = 'dark';
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(label(toggle), 'Dark');
});

test('a removed toggle stops following the device setting', () => {
  const toggle = render();
  toggle.remove();
  setSystemTheme(true);
  assert.equal(label(toggle), 'Dark');
});

test('still switches the theme when storage is unavailable', () => {
  const toggle = render();
  withBrokenStorage(() => click(toggle));
  assert.equal(root().dataset.theme, 'dark');
  assert.equal(label(toggle), 'Light');
});

test('is a button the keyboard can reach', () => {
  const button = render().querySelector('button')!;
  assert.equal(button.type, 'button');
  assert.notEqual(button.tabIndex, -1);
});
