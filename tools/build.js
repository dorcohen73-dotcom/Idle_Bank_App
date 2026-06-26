// Node.js implementation of the Service Worker cache name build automation.
// Note: build.ps1 is a native PowerShell equivalent for environments without Node.js.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Target files to hash (source text/logic files to detect actual changes)
const sourceFiles = [
  'index.html',
  'style.css',
  'config.js',
  'audio.js',
  'locales.js',
  'economy-manager.js',
  'save-manager.js',
  'mission-controller.js',
  'game.js',
  'ui-draw.js',
  'ui-tabs.js',
  'ui-events.js',
  'app.js',
  'manifest.json'
];

try {
  console.log('Starting Service Worker Cache Name build automation...');
  
  const hash = crypto.createHash('md5');
  
  for (const file of sourceFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      hash.update(content);
    } else {
      console.warn(`Warning: source file not found for hashing: ${file}`);
    }
  }
  
  const md5Hash = hash.digest('hex').substring(0, 10);
  const cacheName = `bank-empire-${md5Hash}`;
  console.log(`Generated MD5 Hash: ${md5Hash}`);
  console.log(`New Cache Name: ${cacheName}`);
  
  // Read and update sw.js
  const swPath = path.join(__dirname, '..', 'sw.js');
  if (!fs.existsSync(swPath)) {
    throw new Error('sw.js not found in workspace root.');
  }
  
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Replace const CACHE_NAME = '...';
  const updatedSwContent = swContent.replace(
    /const\s+CACHE_NAME\s*=\s*['"`][^'"`]+['"`];/,
    `const CACHE_NAME = '${cacheName}';`
  );
  
  fs.writeFileSync(swPath, updatedSwContent, 'utf8');
  console.log('Successfully updated sw.js with the new CACHE_NAME!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
