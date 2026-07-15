// Compiles scss/main.scss (+ its partials) into the single style.css that
// index.html links. The SCSS partials are the source of truth; style.css
// itself is a generated build artifact from here on (like app.bundle.js).
const sass = require('sass');
const fs = require('fs');
const path = require('path');

const entry = path.join(__dirname, '..', 'scss', 'main.scss');
const outfile = path.join(__dirname, '..', 'style.css');

const result = sass.compile(entry, {
    style: 'expanded',
    sourceMap: true,
    sourceMapIncludeSources: true,
    silenceDeprecations: ['import'],
});

let css = result.css;
if (result.sourceMap) {
    const mapFile = outfile + '.map';
    fs.writeFileSync(mapFile, JSON.stringify(result.sourceMap));
    css += `\n/*# sourceMappingURL=${path.basename(mapFile)} */\n`;
}

fs.writeFileSync(outfile, css, 'utf8');
console.log(`Compiled scss/main.scss -> style.css (${(css.length / 1024).toFixed(1)}kb)`);
