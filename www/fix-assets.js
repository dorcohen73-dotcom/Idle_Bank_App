const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const oldImgDir = path.join(projectDir, 'תמונות');
const newImgDir = path.join(projectDir, 'images');

// Rename directory
if (fs.existsSync(oldImgDir)) {
    fs.renameSync(oldImgDir, newImgDir);
    console.log('Renamed directory תמונות to images');
} else {
    console.log('Directory תמונות not found, maybe already renamed.');
}

// Files to check
const exts = ['.js', '.html', '.css'];

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'android') continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            replaceInDir(fullPath);
        } else if (exts.includes(path.extname(fullPath))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('images/')) {
                content = content.replace(/תמונות\//g, 'images/');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir(projectDir);
console.log('Done.');
