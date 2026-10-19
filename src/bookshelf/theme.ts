// No data-theme attribute on <html> means "follow the device setting" (done in CSS);
// the attribute is set only once the author has chosen a theme.
export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

const storageKey = 'web-lib.theme';
const darkQuery = '(prefers-color-scheme: dark)';

function isTheme(value: unknown): value is Theme {
  return value === Theme.Light || value === Theme.Dark;
}

export function otherTheme(theme: Theme): Theme {
  return theme === Theme.Dark ? Theme.Light : Theme.Dark;
}

export function systemTheme(): Theme {
  return window.matchMedia(darkQuery).matches ? Theme.Dark : Theme.Light;
}

// Calls the listener when the device setting changes; returns a function that stops listening.
export function onSystemThemeChange(listener: () => void): () => void {
  const query = window.matchMedia(darkQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

// Storage can be missing or throw (private browsing, blocked site data); that is an expected
// case, not an error: the page then simply has no remembered choice.
export function storedTheme(): Theme | undefined {
  try {
    const value = window.localStorage.getItem(storageKey);
    return isTheme(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Not remembered; the choice still applies to this page view.
  }
}

// The theme the page shows now: the chosen one, or the device setting when none is chosen.
export function effectiveTheme(root: HTMLElement = document.documentElement): Theme {
  const chosen = root.dataset.theme;
  return isTheme(chosen) ? chosen : systemTheme();
}

export function applyStoredTheme(root: HTMLElement = document.documentElement): void {
  const theme = storedTheme();
  if (theme) root.dataset.theme = theme;
}

export function chooseTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme;
  saveTheme(theme);
}
