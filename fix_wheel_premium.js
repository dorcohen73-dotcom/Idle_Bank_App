const fs = require('fs');

// 1. Update JS Colors
let jsContent = fs.readFileSync('ui-events.js', 'utf8');
const oldColors = "const colors = ['#dfab29', '#10b981', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4'];";
const newColors = "const colors = ['#ca8a04', '#15803d', '#6d28d9', '#1e3a8a', '#b91c1c', '#0284c7'];";
if (jsContent.includes(oldColors)) {
    jsContent = jsContent.replace(oldColors, newColors);
    fs.writeFileSync('ui-events.js', jsContent);
    console.log('Updated JS colors');
}

// 2. Update CSS for premium wheel
let cssContent = fs.readFileSync('style.css', 'utf8');

const regex = /\.fortune-wheel-graphic \{[\s\S]*?\.wheel-pointer svg \{[\s\S]*?\}/g;

const newCSS = `.fortune-wheel-graphic {
    position: relative;
    width: 320px;
    height: 320px;
    max-width: 100%;
    max-height: 100%;
    flex-shrink: 0;
    margin: 1.5rem auto;
    border-radius: 50%;
    /* Ambient back glow */
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
    /* The metallic rim is handled by ::before */
    border: none;
    box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 60px rgba(223, 171, 41, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.1, 0.8, 0.1, 1);
}

.fortune-wheel-graphic::before {
    /* The Gold Metallic Rim */
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
        #ffeaa7 0deg, #d4af37 45deg, #996515 90deg, #d4af37 135deg, #ffeaa7 180deg, 
        #d4af37 225deg, #996515 270deg, #d4af37 315deg, #ffeaa7 360deg
    );
    box-shadow: inset 0 0 10px rgba(0,0,0,0.8), inset 0 0 3px rgba(255,255,255,0.8), 0 0 15px rgba(212, 175, 55, 0.5);
    z-index: 1;
}

.fortune-wheel-graphic::after {
    /* The Center Gold Knob */
    content: '';
    position: absolute;
    width: 65px;
    height: 65px;
    background: radial-gradient(circle at 35% 35%, #fff 0%, #fef08a 15%, #ca8a04 50%, #713f12 100%);
    border: 2px solid #fef08a;
    border-radius: 50%;
    z-index: 20;
    box-shadow: 0 10px 25px rgba(0,0,0,0.9), 0 0 15px rgba(223, 171, 41, 0.6), inset 0 -4px 6px rgba(0,0,0,0.5), inset 0 4px 6px rgba(255,255,255,0.7);
}

.wheel-segments {
    position: absolute;
    inset: 12px; /* Inner wheel, inside the 12px rim */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 5;
    /* Dark inner rim separator */
    border: 3px solid #111;
    background: #111;
}

.wheel-segments::before {
    /* Inner shadow on the slices */
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow: inset 0 0 25px rgba(0,0,0,0.9), inset 0 0 10px rgba(0,0,0,0.7);
    pointer-events: none;
    z-index: 10;
}

.wheel-segments::after {
    /* Glass highlight overlay */
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 30%, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.3) 100%);
    pointer-events: none;
    z-index: 11;
}

.wheel-seg {
    position: absolute;
    font-size: 1.2rem;
    font-weight: 800;
    color: #fff;
    /* Deep text shadow for premium look */
    text-shadow: 1px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6);
    transform-origin: 50% 50%;
}

/* Dots around the rim */
.fortune-wheel-graphic .wheel-rim-dots {
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    border: 2px dashed rgba(255, 255, 255, 0.6);
    pointer-events: none;
    z-index: 2;
    filter: drop-shadow(0 0 4px #fff);
}

.wheel-pointer {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    filter: drop-shadow(0 8px 10px rgba(0,0,0,0.8));
    animation: pointer-bob 1.5s infinite ease-in-out;
}
.wheel-pointer svg {
    width: 45px;
    height: 50px;
}`;

let startIndex = cssContent.indexOf('.fortune-wheel-graphic {');
let endIndex = cssContent.indexOf('@keyframes pointer-bob');

if (startIndex !== -1 && endIndex !== -1) {
    let before = cssContent.substring(0, startIndex);
    let after = cssContent.substring(endIndex);
    cssContent = before + newCSS + '\n\n' + after;
    fs.writeFileSync('style.css', cssContent);
    console.log('Successfully replaced wheel CSS!');
} else {
    console.log('Failed to find indices');
}
