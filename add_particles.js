const fs = require('fs');

let cssContent = fs.readFileSync('style.css', 'utf8');

const particlesCSS = `
/* Vault particles */
.vault-particle {
    position: absolute;
    width: 25px;
    height: 15px;
    background: #10b981;
    border-radius: 2px;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
    z-index: 45; /* behind doors, above modal but wait, modal is opacity 0 */
    opacity: 0;
}

#offline-modal.active .vault-particle {
    animation: fly-out 1.2s ease-out 1.2s forwards;
}

.vp-1 { top: 50%; left: 50%; transform: rotate(15deg); }
.vp-2 { top: 50%; left: 50%; transform: rotate(-25deg); }
.vp-3 { top: 50%; left: 50%; transform: rotate(45deg); }
.vp-4 { top: 50%; left: 50%; transform: rotate(-65deg); }
.vp-5 { top: 50%; left: 50%; transform: rotate(10deg); }

@keyframes fly-out {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(0deg); }
    20% { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--tx, 150px), var(--ty, -150px)) scale(1.5) rotate(var(--rot, 360deg)); }
}
`;

if (!cssContent.includes('.vault-particle')) {
    cssContent += '\n' + particlesCSS;
    fs.writeFileSync('style.css', cssContent);
}

let htmlContent = fs.readFileSync('index.html', 'utf8');
const oldWrapperStart = '<div class="vault-doors">';
const newWrapperStart = `<div class="vault-doors">
                <div class="vault-particle vp-1" style="--tx: -120px; --ty: -180px; --rot: 120deg;">💵</div>
                <div class="vault-particle vp-2" style="--tx: 140px; --ty: -160px; --rot: -140deg;">💵</div>
                <div class="vault-particle vp-3" style="--tx: -160px; --ty: 100px; --rot: 240deg;">💰</div>
                <div class="vault-particle vp-4" style="--tx: 150px; --ty: 120px; --rot: -220deg;">💰</div>
                <div class="vault-particle vp-5" style="--tx: 0px; --ty: -200px; --rot: 360deg;">💵</div>`;

if (htmlContent.includes(oldWrapperStart) && !htmlContent.includes('vp-1')) {
    htmlContent = htmlContent.replace(oldWrapperStart, newWrapperStart);
    fs.writeFileSync('index.html', htmlContent);
}
console.log('Particles added');
