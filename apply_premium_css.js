const fs = require('fs');
let cssContent = fs.readFileSync('style.css', 'utf8');

const premiumCSS = `
/* Premium Offline Modal styling */
.offline-modal-premium {
    background: linear-gradient(145deg, #0f111a, #07090f) !important;
    border: 1px solid rgba(255, 215, 0, 0.4) !important;
    box-shadow: 0 0 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(255, 215, 0, 0.05) !important;
    border-radius: 24px !important;
    padding: 40px 25px !important;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.offline-modal-premium::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 120px;
    background: radial-gradient(circle at top center, rgba(255, 215, 0, 0.25), transparent 70%);
    pointer-events: none;
}

.offline-premium-icon {
    font-size: 100px;
    line-height: 1;
    margin-bottom: 20px;
    position: relative;
    display: inline-block;
    filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.9));
    animation: premium-float 3s ease-in-out infinite;
}

.offline-premium-icon::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 60%);
    z-index: -1;
}

@keyframes premium-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

.offline-premium-title {
    color: #fff !important;
    font-size: 34px !important;
    font-weight: 800 !important;
    margin: 0 0 15px 0 !important;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
    direction: rtl;
}
.offline-premium-title span {
    color: #ffd700 !important;
}

.offline-premium-subtitle {
    color: #a0aec0 !important;
    font-size: 16px !important;
    margin-bottom: 25px !important;
    line-height: 1.5 !important;
    direction: rtl;
    padding: 0 15px;
}

.offline-premium-divider {
    color: #ffd700 !important;
    font-size: 24px !important;
    margin-bottom: 25px !important;
    opacity: 0.8 !important;
    position: relative;
}
.offline-premium-divider::before, .offline-premium-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 35%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent);
}
.offline-premium-divider::before { left: 5%; }
.offline-premium-divider::after { right: 5%; }

.offline-premium-amount-box {
    background: rgba(16, 185, 129, 0.08) !important;
    border: 2px solid rgba(16, 185, 129, 0.8) !important;
    border-radius: 16px !important;
    padding: 25px !important;
    margin-bottom: 25px !important;
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.15) !important;
}

.offline-premium-amount {
    color: #10b981 !important;
    font-size: 44px !important;
    font-weight: 900 !important;
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.8) !important;
    letter-spacing: 1px;
}

.offline-premium-btn-ad {
    background: linear-gradient(90deg, #6b21a8, #c026d3) !important;
    border: 1px solid rgba(232, 121, 249, 0.8) !important;
    box-shadow: 0 0 25px rgba(192, 38, 211, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    font-size: 22px !important;
    font-weight: bold !important;
    padding: 18px !important;
    border-radius: 16px !important;
    margin-bottom: 15px !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 10px !important;
    width: 100% !important;
}
.offline-premium-btn-ad:hover {
    transform: scale(1.03) !important;
    box-shadow: 0 0 35px rgba(192, 38, 211, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.3) !important;
}

.offline-premium-btn-claim {
    background: #1f2937 !important;
    border: 1px solid #374151 !important;
    color: #e2e8f0 !important;
    font-size: 20px !important;
    font-weight: 500 !important;
    padding: 15px !important;
    border-radius: 16px !important;
    transition: all 0.3s ease !important;
    width: 100% !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
}
.offline-premium-btn-claim:hover {
    background: #374151 !important;
}
`;

if (!cssContent.includes('.offline-modal-premium')) {
    cssContent += '\n' + premiumCSS;
    fs.writeFileSync('style.css', cssContent);
    console.log("Appended premium CSS");
} else {
    console.log("CSS already exists, overwriting it...");
    cssContent = cssContent.replace(/\/\* Premium Offline Modal styling \*\/[\s\S]*?(?=\/\*|$)/, premiumCSS);
    fs.writeFileSync('style.css', cssContent);
}
