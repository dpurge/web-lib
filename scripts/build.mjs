// Builds one app from src/<app>/ into dist/: js/<app>.js, css/<app>.css, img/<app>/
// and the contents of web/ (hand-written page and data). dist/ is the web server root.
// Nothing is written outside dist/.
// Usage: node scripts/build.mjs [app]   (default: bookshelf)
import { build } from 'esbuild';
import { cpSync, existsSync, rmSync } from 'node:fs';

const app = process.argv[2] ?? 'bookshelf';
const source = `src/${app}`;
const out = 'dist';

if (!existsSync(`${source}/main.ts`)) {
  console.error(`No app "${app}": ${source}/main.ts not found`);
  process.exit(1);
}

const shared = { bundle: true, sourcemap: true, minify: false, logLevel: 'info' };

await build({
  ...shared,
  entryPoints: [`${source}/main.ts`],
  outfile: `${out}/js/${app}.js`,
  format: 'esm',
  target: 'es2022',
  // HTML templates are imported as strings
  loader: { '.html': 'text' },
});

// css/<app>.css inlines every @import, because src/ is not served
await build({
  ...shared,
  entryPoints: [`${source}/${app}.css`],
  outfile: `${out}/css/${app}.css`,
});

rmSync(`${out}/img/${app}`, { recursive: true, force: true });
if (existsSync(`${source}/img`)) {
  cpSync(`${source}/img`, `${out}/img/${app}`, { recursive: true });
}

if (existsSync('web')) {
  cpSync('web', out, { recursive: true });
}
