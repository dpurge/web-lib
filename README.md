# web-lib

Single-page applications built from web components. Source is TypeScript and plain CSS; the build produces plain HTML, JS, CSS and JSON files that any static web server can serve. There is no framework and no backend.

The first app, `bookshelf`, is a browsable collection of books in tabs, one tab per shelf.

## Requirements

- Node.js 26 or newer
- A current browser (CSS nesting is used: Chrome 120, Safari 17.2, Firefox 117 or newer)

## Commands

| Command | What it does |
|---|---|
| `npm install` | Installs the build and test tools. |
| `npm run build` | Builds the app into `dist/`. |
| `npm run serve` | Serves `dist/` at `http://127.0.0.1:8080/bookshelf.html`. Refresh the browser to see changes; there is no hot reload. |
| `npm run serve -- 8080 0.0.0.0` | Same, but reachable from other devices on your network, for example a tablet. Anyone on that network can read `dist/`. The port and host are optional arguments. |
| `npm test` | Runs the tests (`node:test` in a happy-dom document). |
| `npm run typecheck` | Type-checks the sources and tests. |
| `npm run sample-data` | Regenerates the synthetic sample data in `web/data/`. |

The page must be served over HTTP. Opening `dist/bookshelf.html` straight from disk shows nothing, because browsers block module scripts on `file://`.

## Layout

```
src/bookshelf/              the app
  main.ts                   entry point
  bookshelf.css             imports theme.css and every component's CSS
  theme.css                 colours (light and dark) and base styles
  theme.ts                  light/dark choice: stored in localStorage, applied on <html>
  book.ts                   data schema (valibot) and the LinkKind enum
  load-shelves.ts           fetches and validates the data file
  tab-hash.ts               URL hash <-> selected tab
  img/*.svg                 icons
  components/<name>/        <name>.ts, <name>.html, <name>.css, <name>.test.ts
web/                        hand-written page and data, copied into the root of dist/
  bookshelf.html
  data/bookshelf.json       synthetic sample data
scripts/                    build, serve, test and sample-data scripts
dist/                       generated; this is the web server root
```

`npm run build` writes `dist/js/bookshelf.js`, `dist/css/bookshelf.css`, `dist/img/bookshelf/` and copies the contents of `web/` into the root of `dist/`. Sourcemaps are on and the output is not minified.

## The bookshelf page

```html
<link rel="stylesheet" href="./css/bookshelf.css" />
<bookshelf-app src="./data/bookshelf.json"></bookshelf-app>
<script type="module" src="./js/bookshelf.js"></script>
```

- `src` is the data file, relative to the page, so it can be renamed or moved.
- Icons are found relative to `bookshelf.js`, so keep `js/` and `img/` side by side.
- The selected shelf is in the URL hash: `bookshelf.html#3` opens the third shelf, and the Back button and bookmarks work. An invalid hash opens the first shelf.
- Arrow keys, Home and End move between tabs.
- A problem with the data file (missing, not JSON, wrong shape) is shown on the page with the file name and the offending path.

### Light and dark theme

- A button at the right end of the tab bar switches between the light and the dark theme. It shows the theme it will switch to.
- Until you click it, the page follows the device setting (`prefers-color-scheme`), including when that setting changes. After a click, your choice is remembered in the browser (`localStorage`, key `web-lib.theme`) and wins over the device setting.
- A stored choice that differs from the device setting can show the other theme for a split second while the page loads.
- Colours are CSS custom properties in `src/bookshelf/theme.css`. The dark values are written twice there (once in the `prefers-color-scheme` media query, once under `data-theme="dark"`) because CSS cannot share one block between the two; a test fails if they differ, and another checks that text reaches a 4.5:1 contrast ratio.

### Data file

A JSON array of shelves:

```json
[
  {
    "title": "Shelf title",
    "description": "Optional text, may be empty",
    "books": [
      {
        "title": "Title",
        "subtitle": "",
        "author": "Author",
        "year": "1999",
        "description": "",
        "cover": "./path/to/cover.png",
        "book": "./path/to/index.html",
        "pdf": "./path/to/book.pdf",
        "audio": "./path/to/audio.html"
      }
    ]
  }
]
```

All fields except `book`, `pdf` and `audio` are required strings (`year` is a string too). A missing or empty `book`, `pdf` or `audio` means the book has no such link, and an empty `cover` shows a placeholder. Paths are relative to the page.

## Adding a component

1. Create `src/bookshelf/components/<name>/` with `<name>.ts`, `<name>.html`, `<name>.css` and `<name>.test.ts`.
2. Import the component from the component that uses it (or from `main.ts`), and add its CSS to `src/bookshelf/bookshelf.css` with `@import`.
3. Run `npm test`, `npm run typecheck` and `npm run build`.

Components are native custom elements rendered in the light DOM, so one global stylesheet styles them. Book data is only ever written as text or attributes, never as HTML.

## Tests

Tests sit next to the code as `*.test.ts`. `npm test` bundles them into a temporary directory, runs them and removes it; they never reach `dist/`. happy-dom is not a real browser, so layout and CSS are not tested; check those in a browser.
