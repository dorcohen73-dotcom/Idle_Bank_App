// Bundles the ES module graph (app.js -> ui-events.js -> ui/tabs/*.js) into a single
// classic script. Native <script type="module"> is blocked by the browser under the
// file:// protocol (double-clicking index.html), so the shipped script must be a
// plain, non-module bundle — while the source stays split into readable ES modules.
const esbuild = require('esbuild');
const path = require('path');

esbuild.buildSync({
    entryPoints: [path.join(__dirname, '..', 'app.js')],
    outfile: path.join(__dirname, '..', 'app.bundle.js'),
    bundle: true,
    format: 'iife',
    target: 'es2020',
    sourcemap: true,
    logLevel: 'info',
});
