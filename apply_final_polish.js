const fs = require('fs');

// 1. Update HTML
let htmlContent = fs.readFileSync('index.html', 'utf8');

if (!htmlContent.includes('family=Heebo')) {
    htmlContent = htmlContent.replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&display=swap" rel="stylesheet">');
}

htmlContent = htmlContent.replace('<div class="offline-premium-icon" aria-hidden="true">💰</div>', 
    '<img src="premium_bag.png" class="offline-premium-icon-img" alt="Money Bag" aria-hidden="true" />');

htmlContent = htmlContent.replace('<h2 class="offline-premium-title" id="offline-modal-title">ברוך שובך, <span>מנכ"ל!</span></h2>',
    '<h2 class="offline-premium-title" id="offline-modal-title">ברוך שובך, מנכ"ל!</h2>');

htmlContent = htmlContent.replace('<span aria-hidden="true">🎬</span> צפה בסרטון וקבל פי 3!',
    'צפה בסרטון וקבל פי 3! <span aria-hidden="true" style="font-size: 1.2em;">🎬</span>');

fs.writeFileSync('index.html', htmlContent);
console.log("Updated index.html");

// 2. Update CSS
let cssContent = fs.readFileSync('style.css', 'utf8');

const updatedCSS = `
/* Premium Offline Modal styling */
.offline-modal-premium {
    background: linear-gradient(180deg, #111827, #030712) !important;
    border: 1px solid rgba(255, 215, 0, 0.5) !important;
    box-shadow: 0 0 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(255, 215, 0, 0.05) !important;
    border-radius: 20px !important;
    padding: 30px 20px 20px 20px !important;
    text-align: center;
    position: relative;
    overflow: hidden;
    font-family: 'Heebo', sans-serif !important;
    max-width: 400px;
    margin: 0 auto;
}

.offline-modal-premium::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 160px;
    background: radial-gradient(circle at top center, rgba(255, 215, 0, 0.2), transparent 70%);
    pointer-events: none;
}

.offline-premium-icon-img {
    width: 140px;
    height: 140px;
    margin-top: -20px;
    margin-bottom: 10px;
    mix-blend-mode: screen;
    position: relative;
    z-index: 2;
    animation: premium-float 3s ease-in-out infinite;
    filter: drop-shadow(0 5px 15px rgba(255, 215, 0, 0.4));
}

@keyframes premium-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.offline-premium-title {
    color: #f3f4f6 !important;
    font-size: 32px !important;
    font-weight: 900 !important;
    margin: 0 0 10px 0 !important;
    text-shadow: 0 2px 5px rgba(0,0,0,0.8) !important;
    direction: rtl;
    font-family: 'Heebo', sans-serif !important;
    letter-spacing: -0.5px;
}

.offline-premium-subtitle {
    color: #cbd5e1 !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    margin-bottom: 25px !important;
    line-height: 1.4 !important;
    direction: rtl;
    padding: 0 20px;
    font-family: 'Heebo', sans-serif !important;
}

.offline-premium-divider {
    color: #fbbf24 !important;
    font-size: 20px !important;
    margin-bottom: 25px !important;
    opacity: 0.9 !important;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.offline-premium-divider::before, .offline-premium-divider::after {
    content: '';
    flex-grow: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent);
    margin: 0 15px;
}

.offline-premium-amount-box {
    background: rgba(16, 185, 129, 0.05) !important;
    border: 1px solid #4ade80 !important;
    border-radius: 12px !important;
    padding: 15px 10px !important;
    margin-bottom: 20px !important;
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.15), inset 0 0 10px rgba(74, 222, 128, 0.1) !important;
}

.offline-premium-amount {
    color: #86efac !important;
    font-size: 40px !important;
    font-weight: 900 !important;
    text-shadow: 0 0 15px rgba(74, 222, 128, 0.5) !important;
    letter-spacing: 0px;
    font-family: 'Heebo', sans-serif !important;
}

.offline-premium-btn-ad {
    background: linear-gradient(90deg, #4c1d95, #701a75) !important;
    border: 1px solid #fbbf24 !important;
    box-shadow: 0 0 25px rgba(112, 26, 117, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
    font-size: 20px !important;
    font-weight: 800 !important;
    padding: 15px !important;
    border-radius: 12px !important;
    margin-bottom: 12px !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 12px !important;
    width: 100% !important;
    font-family: 'Heebo', sans-serif !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    direction: rtl;
}
.offline-premium-btn-ad:hover {
    transform: scale(1.02) !important;
    box-shadow: 0 0 35px rgba(112, 26, 117, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.2) !important;
}

.offline-premium-btn-claim {
    background: #1f2937 !important;
    border: 1px solid #374151 !important;
    color: #cbd5e1 !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    padding: 14px !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
    width: 100% !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
    font-family: 'Heebo', sans-serif !important;
}
.offline-premium-btn-claim:hover {
    background: #374151 !important;
    color: #fff !important;
}
`;

cssContent = cssContent.replace(/\/\* Premium Offline Modal styling \*\/[\s\S]*?(?=\/\*|$)/, updatedCSS);
fs.writeFileSync('style.css', cssContent);
console.log("Updated style.css");
