const fs = require('fs');
let content = fs.readFileSync('style.css', 'utf8');
content += `\n
@media (max-width: 480px) {
    .fortune-prize-list {
        grid-template-columns: 1fr !important;
    }
    .fortune-wheel-graphic {
        margin: 1rem auto;
    }
    .wheel-prize-item {
        padding: 0.6rem 0.8rem;
    }
}
`;
fs.writeFileSync('style.css', content);
console.log('Added mobile media query');
