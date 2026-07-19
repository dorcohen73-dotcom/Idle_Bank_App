const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const projectRoot = path.join(__dirname, '..');

// Directories to exclude from syntax checks
const excludedDirs = new Set([
  'node_modules', 'android', 'www', '.git', '.netlify', 'scratch', 'playwright-report', 'test-results', '.idea'
]);

function collectFiles(dir, extension) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue;
      results.push(...collectFiles(fullPath, extension));
    } else {
      if (entry.name.endsWith(extension)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

try {
  console.log('Verifying integrity of source files...');

  // 1. Verify JS files
  const jsFiles = collectFiles(projectRoot, '.js');
  console.log(`Checking syntax of ${jsFiles.length} JS files...`);
  for (const file of jsFiles) {
    try {
      cp.execSync(`node --check "${file}"`, { stdio: 'ignore' });
    } catch (e) {
      console.error(`\n[ERROR] Syntax error detected in: ${file}`);
      console.error('This is likely due to file truncation. Fix the file or restore from git before building.');
      process.exit(1);
    }
  }

  // 2. Verify SCSS basic balance (brace matching)
  const scssFiles = collectFiles(projectRoot, '.scss');
  console.log(`Checking brace balance of ${scssFiles.length} SCSS files...`);
  for (const file of scssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let openBraces = 0;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') openBraces++;
      if (content[i] === '}') openBraces--;
    }
    if (openBraces !== 0) {
      console.error(`\n[ERROR] Unbalanced braces detected in SCSS: ${file}`);
      console.error('This is likely due to file truncation. Fix the file or restore from git before building.');
      process.exit(1);
    }
  }

  console.log('Integrity check PASSED. No truncated files detected.');
} catch (error) {
  console.error('Integrity check failed:', error);
  process.exit(1);
}
