const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, 'www');
if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest);

// Folders and files to exclude from the www build folder
const exclude = ['node_modules', 'android', 'www', '.git', '.netlify', 'tests', 'agents-library', 'tools', 'marketing', '.claude'];

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
        if (filename === 'package.json' || filename === 'package-lock.json' || filename === 'build.js' || filename === 'capacitor.config.json' || filename === 'eslint.config.js') return;
        
        fs.copyFileSync(src, destPath);
    }
}

copyRecursiveSync(__dirname, dest);
console.log('Build copied to www successfully.');
