# Web library

Library of widgets to be used in static HTML files.

## Source code

- `bin/` - scripts used in development
- `src/lib/` - A folder with Svelte components
- `src/img/` - Images used by the components
- `src/vendor/` - Third party javascript, stylesheets and assets
- `src/web/` - Pages for local testing

## Building

```sm
deno install --allow-scripts=npm:svelte-preprocess
deno task build:prod
deno task start
```

## Usage

```html
<link rel="stylesheet" href="/css/app.css" />

<div id="app"></div>

<script type="module">
    import App from '/js/app.js'
    const app = App('app', { title: "My Title" })
</script>
```
