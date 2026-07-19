const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, 'www');
if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest);

// Folders and files to exclude from the www build folder
const exclude = ['node_modules', 'android', 'www', '.git', '.netlify', 'tests', 'agents-library', 'tools', 'marketing', '.claude', '.idea', 'scratch', 'playwright-report', 'test-results', 'scss'];

// Dev/tooling files that must never ship inside the app package
const excludeFiles = new Set([
    'package.json', 'package-lock.json', 'build.js', 'capacitor.config.json',
    'eslint.config.js', 'vitest.config.js', 'playwright.config.js',
    'claude_context.md', '.gitignore', 'build_aab.ps1',
]);
const excludeExtensions = new Set(['.ps1', '.md', '.bat']);

function copyRecursiveSync(src, destPath) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (exclude.includes(path.basename(src))) return;
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath);
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(destPath, childItemName));
        });
    } else {
        // Exclude specific files from being copied
        const filename = path.basename(src);
        if (excludeFiles.has(filename) || excludeExtensions.has(path.extname(filename))) return;

        fs.copyFileSync(src, destPath);
    }
}

copyRecursiveSync(__dirname, dest);
console.log('Build copied to www successfully.');
