const fs = require('fs');
let content = fs.readFileSync('style.css', 'utf8');

const newMobileCSS = `
/* Global Modal scrolling fix */
.modal-box {
    max-height: 92vh !important;
    overflow-y: auto !important;
}

.modal-box::-webkit-scrollbar {
    width: 6px;
}
.modal-box::-webkit-scrollbar-thumb {
    background: rgba(223, 171, 41, 0.5);
    border-radius: 4px;
}

@media (max-width: 480px) {
    .fortune-wheel-box {
        padding: 1.5rem 1rem !important;
        width: 95% !important;
    }
    .fortune-prize-list {
        grid-template-columns: 1fr !important;
    }
    .fortune-wheel-container {
        transform: scale(0.85);
        transform-origin: center center;
        margin: 0.5rem auto -20px auto !important;
    }
}

@media (max-height: 700px) {
    .fortune-wheel-container {
        transform: scale(0.7);
        transform-origin: center center;
        margin: 0 auto -60px auto !important;
    }
    .fortune-prize-list {
        max-height: 200px !important;
    }
}
`;

// Remove previous fix_mobile.js append if it exists
if (content.includes('@media (max-width: 480px) {') && content.includes('.fortune-prize-list {')) {
    // Just remove everything after the first occurrence to avoid duplicates (assuming it was appended at the end)
    const index = content.lastIndexOf('@media (max-width: 480px) {');
    if (index > 0 && index > content.length - 1000) {
        content = content.substring(0, index);
    }
}

content += '\n' + newMobileCSS;

fs.writeFileSync('style.css', content);
console.log('Mobile CSS fixed');
