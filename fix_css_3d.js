const fs = require('fs');
let content = fs.readFileSync('style.css', 'utf8');

// Replace the wheel graphic CSS
const wheelCSSOld = `.fortune-wheel-graphic {
    position: relative;
    width: 320px;
    height: 320px;
    max-width: 85vw;
    max-height: 85vw;
    flex-shrink: 0;
    margin: 1.5rem auto;
    border-radius: 50%;
    background: conic-gradient(
        #dfab29 0deg 60deg,
        #10b981 60deg 120deg,
        #3b82f6 120deg 180deg,
        #a855f7 180deg 240deg,
        #ef4444 240deg 300deg,
        #06b6d4 300deg 360deg
    );
    border: 6px solid #eab308;
    box-shadow: 0 0 35px rgba(223, 171, 41, 0.8), inset 0 0 25px rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
}

.fortune-wheel-graphic::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 6px dotted rgba(255, 255, 255, 0.7);
    pointer-events: none;
    z-index: 15;
}

.fortune-wheel-graphic::after {
    content: '';
    position: absolute;
    width: 45px;
    height: 45px;
    background: radial-gradient(circle, #fef08a 0%, #ca8a04 100%);
    border: 3px solid #fef08a;
    border-radius: 50%;
    z-index: 20;
    box-shadow: 0 0 15px rgba(0,0,0,0.7), inset 0 0 8px rgba(255,255,255,0.8);
}`;

const wheelCSSNew = `.fortune-wheel-graphic {
    position: relative;
    width: 340px;
    height: 340px;
    max-width: 85vw;
    max-height: 85vw;
    flex-shrink: 0;
    margin: 1.5rem auto;
    border-radius: 50%;
    border: 8px solid #fbbf24;
    box-shadow: 0 0 50px rgba(234, 179, 8, 0.5), inset 0 0 40px rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.1, 0.8, 0.1, 1);
}

.fortune-wheel-graphic::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 8px dotted rgba(255, 255, 255, 0.4);
    pointer-events: none;
    z-index: 15;
}

.fortune-wheel-graphic::after {
    content: '';
    position: absolute;
    width: 65px;
    height: 65px;
    background: radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 45%, #713f12 100%);
    border: 3px solid #fef08a;
    border-radius: 50%;
    z-index: 20;
    box-shadow: 0 8px 20px rgba(0,0,0,0.9), inset 0 -4px 8px rgba(0,0,0,0.5), inset 0 4px 6px rgba(255,255,255,0.6);
}`;

content = content.replace(wheelCSSOld, wheelCSSNew);

const wheelSegmentsOld = `.wheel-segments {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}`;

const wheelSegmentsNew = `.wheel-segments {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.wheel-segments::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.8) 100%);
    pointer-events: none;
    z-index: 5;
}`;

content = content.replace(wheelSegmentsOld, wheelSegmentsNew);

const wheelPointerOld = `.wheel-pointer {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 3rem;
    color: #fef08a;
    filter: drop-shadow(0 5px 8px rgba(0,0,0,0.8));
    z-index: 25;
    text-shadow: 0 0 10px rgba(234, 179, 8, 1);
}`;

const wheelPointerNew = `.wheel-pointer {
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    filter: drop-shadow(0 8px 10px rgba(0,0,0,0.8));
    animation: pointer-bob 1.5s infinite ease-in-out;
}
.wheel-pointer svg {
    width: 50px;
    height: 55px;
}`;

content = content.replace(wheelPointerOld, wheelPointerNew);

fs.writeFileSync('style.css', content);
