// Serves dist/ as a plain static site. Run `npm run build` first; refresh the browser to see changes.
// Usage: node scripts/serve.mjs [port] [host]
//   port  default 8080
//   host  default 127.0.0.1 (this computer only); use 0.0.0.0 to open it to the local network,
//         e.g. to try the app on a tablet. Anyone on that network can then read dist/.
import { context } from 'esbuild';
import { existsSync } from 'node:fs';
import { networkInterfaces } from 'node:os';

const root = 'dist';
const port = Number(process.argv[2] ?? 8080);
const host = process.argv[3] ?? '127.0.0.1';

if (!existsSync(root)) {
  console.error(`${root}/ not found. Run "npm run build" first.`);
  process.exit(1);
}

function addressesFor(host) {
  if (host !== '0.0.0.0') return [host];
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((entry) => entry.family === 'IPv4' && !entry.internal)
    .map((entry) => entry.address);
  return ['localhost', ...addresses];
}

const server = await context({});
const { port: actualPort } = await server.serve({ servedir: root, port, host });
console.log(`Serving ${root}/ (stop with Ctrl+C):`);
for (const address of addressesFor(host)) {
  console.log(`  http://${address}:${actualPort}/bookshelf.html`);
}
