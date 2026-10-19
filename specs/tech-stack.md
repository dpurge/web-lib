---
version: 10
status: approved
updated: 2026-10-19
---

## Languages & runtimes

- TypeScript 7.x. Enums are allowed. Types are checked with `tsc --noEmit`; esbuild produces the JS.
- Node.js >= 26 for tooling (the version installed locally today).
- Browser target: current browsers with native CSS nesting (Chrome 120, Safari 17.2, Firefox 117 or newer); output is a plain ES module. Only Chrome has been used for checks.
- Plain CSS only, using native nesting and custom properties. No preprocessor.

## Frameworks & libraries

- No UI framework. Components are native Custom Elements rendered in the light DOM, so one global stylesheet styles them.
- Each component lives in `src/<app>/components/<name>/` as `<name>.ts`, `<name>.html` (template), `<name>.css` and `<name>.test.ts`. The HTML template is inlined into the JS at build time.
- Runtime validation of JSON data with valibot 1.x; it is bundled into the output, so it is not a runtime dependency of the served app.

## Infrastructure & tooling

- esbuild 0.28.x bundles each app from `src/<app>/main.ts`.
- All build output goes to `dist/`, never to the project root. The build for app `<app>` writes `dist/js/<app>.js`, `dist/css/<app>.css` (all component and app CSS concatenated) and `dist/img/<app>/*.svg`, and copies the contents of `web/` into the root of `dist/`. `dist/` is the web server root, generated and ignored.
- `web/<app>.html` and `web/data/<app>.json` are hand-written sources, and `npm run sample-data` regenerates synthetic data for them; the page loads `./js/<app>.js`, `./css/<app>.css` and `./img/<app>/`, and reads its data path from the `src` attribute of the app element, so the data file can be renamed or moved. Icons are located relative to the script, not the page.
- Local serving: `scripts/serve.mjs`, a static server built on esbuild's `serve`, rooted at `dist/`; it binds to localhost unless a host argument such as `0.0.0.0` opens it to the local network for tablet testing; the page is opened at `/<app>.html`. Manual refresh, no hot reload.
- Tests run with `node:test` in a happy-dom document (`npm test`, `scripts/test.mjs`): fast, few dependencies, but not a real browser, so layout and CSS are checked by hand. Test files sit next to the component and are bundled by esbuild into a temporary directory only to be run, never into `dist/`. `@types/node` is installed for type-checking the tests.
- npm scripts: `build`, `serve`, `test`, `typecheck`, `sample-data`.

## Key conventions

- One directory per component; script, template, styles and tests stay together.
- Colours come only from CSS custom properties in `theme.css`. No `data-theme` attribute on `<html>` means the page follows the device's light/dark setting through a media query; `data-theme="light"` or `"dark"` is the author's choice, remembered in `localStorage` under `web-lib.theme`. The dark values appear in two blocks that must stay identical; a test enforces that and the contrast ratios.
- Layouts are fluid: no fixed page width; grids add columns as space allows. Fixed sizes are only for covers and tap targets.
- Tests are never bundled into app output.
- Built output is readable: sourcemaps on, minification off.
- The page is served over HTTP; opening it from `file://` does not work because browsers block module scripts there.
- JSON data is validated at load time; a validation failure is shown on the page, never ignored.
- The project is not under git for now; do not run `git init` unless asked.
