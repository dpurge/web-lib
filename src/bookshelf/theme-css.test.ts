import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync('src/bookshelf/theme.css', 'utf8');

// Declarations of the rule whose selector starts with `selector`, e.g. { '--accent': '#2f5d8a' }.
function declarations(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `theme.css has no rule for ${selector}`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/^\s*([-a-z]+):\s*(.+);$/gm)].map((match) => [match[1], match[2]]));
}

const light = declarations(':root');
const dark = declarations(":root[data-theme='dark']");
const darkForDevice = declarations(":root:not([data-theme='light'])");

function luminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5]
    .map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test('the dark values for a chosen theme and for the device setting are identical', () => {
  assert.deepEqual(darkForDevice, dark);
});

test('light and dark define the same tokens', () => {
  assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort());
});

for (const [name, theme] of [['light', light], ['dark', dark]] as const) {
  test(`${name} theme: text reaches 4.5:1 on its backgrounds`, () => {
    const pairs = [
      ['--foreground', '--background'],
      ['--foreground', '--card-background'],
      ['--muted', '--background'],
      ['--muted', '--card-background'],
      ['--accent-contrast', '--accent'],
      ['--error', '--background'],
    ];
    for (const [text, background] of pairs) {
      const ratio = contrast(theme[text], theme[background]);
      assert.ok(ratio >= 4.5, `${text} on ${background} is ${ratio.toFixed(2)}:1`);
    }
  });

  test(`${name} theme: the accent reaches 3:1 against the page`, () => {
    assert.ok(contrast(theme['--accent'], theme['--background']) >= 3);
  });
}
