// Runs every src/**/*.test.ts with node:test, in a happy-dom document.
// Tests are bundled by esbuild (happy-dom included) into a temporary directory only to be run;
// they never reach dist/, and nothing is written to the project. (node --test skips node_modules,
// so the bundles cannot live there.)
import { build } from 'esbuild';
import { globSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const outdir = mkdtempSync(join(tmpdir(), 'web-lib-test-'));
const tests = globSync('src/**/*.test.ts');

if (tests.length === 0) {
  console.error('No tests found: expected src/**/*.test.ts');
  process.exit(1);
}

await build({
  entryPoints: tests,
  outdir,
  outbase: 'src',
  bundle: true,
  platform: 'node',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  loader: { '.html': 'text' },
  // happy-dom's dependencies call require(); an ES module bundle needs it defined
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  sourcemap: 'inline',
  logLevel: 'warning',
});

const bundles = tests.map((file) => join(outdir, file.replace(/^src\//, '').replace(/\.ts$/, '.mjs')));
const { status } = spawnSync(process.execPath, ['--test', '--enable-source-maps', ...bundles], { stdio: 'inherit' });
rmSync(outdir, { recursive: true, force: true });
process.exit(status ?? 1);
