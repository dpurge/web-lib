# Project Memory

<!-- Append-only, one entry per line: `YYYY-MM-DDTHH:MM:SSZ [tag] text`. See the `memory-format` skill. Do not read this file in full — grep it. -->

2026-10-19T17:01:00Z [gotcha] node --test skips files under node_modules, so scripts/test.mjs writes test bundles to the OS temp directory instead of node_modules/.cache.
2026-10-19T17:01:01Z [gotcha] Bundling happy-dom into an ES module test bundle with esbuild fails on ws require calls; scripts/test.mjs adds a createRequire banner.
2026-10-19T17:01:02Z [env] happy-dom 21 supports window.location.hash and the hashchange event, so URL-hash behaviour is testable with node:test without an injected hash source.
2026-10-19T17:08:38Z [env] Headless Chrome follows the OS light/dark appearance; force dark with --force-dark-mode and light with --blink-settings=preferredColorScheme=1, using a fresh --user-data-dir per run.
2026-10-19T17:12:45Z [gotcha] Custom elements already in the page render during main.ts's import evaluation, before main.ts's own statements run; state they depend on must be observed, not read once.
