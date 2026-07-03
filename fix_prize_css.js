const fs = require('fs');
let content = fs.readFileSync('style.css', 'utf8');

const regex = /\.wheel-prize-item \{[\s\S]*?\.wheel-prize-weight \{[\s\S]*?\}/g;

const replacement = `.wheel-prize-item {
    position: relative;
    display: flex;
    flex-direction: row; /* In RTL, this puts content on right, icon on left */
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    border-radius: 12px;
    background: rgba(15, 18, 28, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(223, 171, 41, 0.5);
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5), inset 0 0 10px rgba(223, 171, 41, 0.05);
}

.wheel-prize-item:hover {
    background: rgba(20, 24, 38, 0.95);
    border-color: rgba(223, 171, 41, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(223, 171, 41, 0.15);
}

.prize-content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* flex-start in RTL means RIGHT */
    gap: 0.3rem;
}

.wheel-prize-label {
    font-weight: 800;
    color: #fff;
    font-size: 1.05rem;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    line-height: 1.2;
}

.wheel-prize-val {
    font-size: 0.85rem;
    color: #a3e635;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.wheel-prize-weight {
    position: absolute;
    bottom: 8px;
    left: 8px; /* In RTL, left is the left side */
    font-weight: 900;
    color: #fbbf24;
    font-size: 0.75rem;
    background: rgba(0, 0, 0, 0.7);
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(251, 191, 36, 0.5);
    box-shadow: 0 2px 4px rgba(0,0,0,0.6);
}

.wheel-prize-icon {
    font-size: 2rem;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}`;

// I will do string manipulation manually if regex is too greedy
let startIndex = content.indexOf('.wheel-prize-item {');
let endIndex = content.indexOf('.fortune-cooldown {');

if (startIndex !== -1 && endIndex !== -1) {
    let before = content.substring(0, startIndex);
    let after = content.substring(endIndex);
    content = before + replacement + '\n\n\n' + after;
    fs.writeFileSync('style.css', content);
    console.log('Successfully replaced prize CSS!');
} else {
    console.log('Failed to find indices');
}
