// Guards against shipping a stale Android build: compares every shipped source
// file against its copy under android/app/src/main/assets/public (populated by
// `npx cap sync`) and fails loudly if any content differs or is missing there.
//
// Why this exists: `cap sync` copying from www/ into the Android project is a
// step that's easy to skip or that can silently no-op (stale gradle cache,
// interrupted copy, running gradlew directly). When that happens the packaged
// AAB/APK contains old code with zero warning — this has cost real debugging
// time on this project before. Run this right before `gradlew bundleRelease`.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectRoot = path.join(__dirname, '..');
const androidPublicDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets', 'public');

const excludedDirs = new Set([
  'node_modules', 'android', 'www', '.git', '.netlify', 'tests',
  'agents-library', 'tools', 'marketing', '.claude', '.vscode',
]);

const excludedFiles = new Set([
  'build.js', 'capacitor.config.json', 'eslint.config.js',
  'package.json', 'package-lock.json',
  'test.js', 'test2.js', 'test3.js',
]);

const includedExtensions = new Set(['.js', '.css', '.html']);

function collectSourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue;
      results.push(...collectSourceFiles(fullPath));
    } else {
      if (excludedFiles.has(entry.name)) continue;
      const ext = path.extname(entry.name);
      if (includedExtensions.has(ext) || entry.name === 'manifest.json') {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function hashFile(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

if (!fs.existsSync(androidPublicDir)) {
  console.error(`[verify-android-sync] ${androidPublicDir} does not exist — run "npm run cap-sync" first.`);
  process.exit(1);
}

const sourceFiles = collectSourceFiles(projectRoot).sort();
const stale = [];
const missing = [];

for (const filePath of sourceFiles) {
  const relPath = path.relative(projectRoot, filePath);
  const androidPath = path.join(androidPublicDir, relPath);
  if (!fs.existsSync(androidPath)) {
    missing.push(relPath);
    continue;
  }
  if (hashFile(filePath) !== hashFile(androidPath)) {
    stale.push(relPath);
  }
}

if (stale.length === 0 && missing.length === 0) {
  console.log(`[verify-android-sync] OK — ${sourceFiles.length} files match android/app/src/main/assets/public.`);
  process.exit(0);
}

console.error('[verify-android-sync] Android build assets are OUT OF SYNC with source.');
if (stale.length > 0) {
  console.error(`  Stale (content differs) — ${stale.length}:`);
  stale.forEach(f => console.error(`    ${f}`));
}
if (missing.length > 0) {
  console.error(`  Missing from android assets — ${missing.length}:`);
  missing.forEach(f => console.error(`    ${f}`));
}
console.error('  Run "npm run cap-sync" before building the AAB/APK.');
process.exit(1);
