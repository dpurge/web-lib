import './test-support';
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { setSystemTheme, withBrokenStorage } from './test-support';
import {
  Theme,
  applyStoredTheme,
  chooseTheme,
  effectiveTheme,
  onSystemThemeChange,
  otherTheme,
  saveTheme,
  storedTheme,
  systemTheme,
} from './theme';

const root = () => document.documentElement;
const storageKey = 'web-lib.theme';

beforeEach(() => {
  window.localStorage.clear();
  delete root().dataset.theme;
  setSystemTheme(false);
});

test('theme names are light and dark', () => {
  assert.deepEqual(Object.values(Theme), ['light', 'dark']);
});

test('otherTheme flips between the two', () => {
  assert.equal(otherTheme(Theme.Light), Theme.Dark);
  assert.equal(otherTheme(Theme.Dark), Theme.Light);
});

test('systemTheme reports the device setting', () => {
  assert.equal(systemTheme(), Theme.Light);
  setSystemTheme(true);
  assert.equal(systemTheme(), Theme.Dark);
});

test('storedTheme is undefined when nothing is stored', () => {
  assert.equal(storedTheme(), undefined);
});

test('storedTheme returns a stored light or dark choice', () => {
  window.localStorage.setItem(storageKey, 'dark');
  assert.equal(storedTheme(), Theme.Dark);
  window.localStorage.setItem(storageKey, 'light');
  assert.equal(storedTheme(), Theme.Light);
});

test('storedTheme ignores any other stored value', () => {
  for (const value of ['blue', '', 'Dark', 'null']) {
    window.localStorage.setItem(storageKey, value);
    assert.equal(storedTheme(), undefined, value);
  }
});

test('storedTheme ignores storage that throws', () => {
  withBrokenStorage(() => assert.equal(storedTheme(), undefined));
});

test('saveTheme remembers the theme', () => {
  saveTheme(Theme.Dark);
  assert.equal(window.localStorage.getItem(storageKey), 'dark');
});

test('saveTheme does not throw when storage does', () => {
  withBrokenStorage(() => saveTheme(Theme.Dark));
});

test('effectiveTheme follows the device setting when no theme is chosen', () => {
  assert.equal(effectiveTheme(), Theme.Light);
  setSystemTheme(true);
  assert.equal(effectiveTheme(), Theme.Dark);
});

test('a chosen theme wins over the device setting', () => {
  setSystemTheme(true);
  root().dataset.theme = 'light';
  assert.equal(effectiveTheme(), Theme.Light);
});

test('an invalid theme attribute is treated as no choice', () => {
  setSystemTheme(true);
  root().dataset.theme = 'sepia';
  assert.equal(effectiveTheme(), Theme.Dark);
});

test('applyStoredTheme sets the attribute from a stored choice', () => {
  saveTheme(Theme.Dark);
  applyStoredTheme();
  assert.equal(root().dataset.theme, 'dark');
});

test('applyStoredTheme leaves the attribute off when nothing valid is stored', () => {
  applyStoredTheme();
  assert.equal(root().dataset.theme, undefined);
  window.localStorage.setItem(storageKey, 'sepia');
  applyStoredTheme();
  assert.equal(root().dataset.theme, undefined);
});

test('chooseTheme sets the attribute and remembers the choice', () => {
  chooseTheme(Theme.Dark);
  assert.equal(root().dataset.theme, 'dark');
  assert.equal(storedTheme(), Theme.Dark);
});

test('chooseTheme still applies the theme when storage throws', () => {
  withBrokenStorage(() => chooseTheme(Theme.Dark));
  assert.equal(root().dataset.theme, 'dark');
});

test('onSystemThemeChange reports device changes until it is stopped', () => {
  let calls = 0;
  const stop = onSystemThemeChange(() => {
    calls += 1;
  });
  setSystemTheme(true);
  setSystemTheme(false);
  assert.equal(calls, 2);
  stop();
  setSystemTheme(true);
  assert.equal(calls, 2);
});
