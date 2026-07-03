const fs = require('fs');

let cssContent = fs.readFileSync('style.css', 'utf8');

const premiumCSS = `
/* Premium Offline Modal styling */
.offline-modal-premium {
    background: linear-gradient(145deg, #0f111a, #07090f) !important;
    border: 1px solid rgba(255, 215, 0, 0.4) !important;
    box-shadow: 0 0 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(255, 215, 0, 0.05) !important;
    border-radius: 24px !important;
    padding: 30px 20px !important;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.offline-modal-premium::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 100px;
    background: radial-gradient(circle at top center, rgba(255, 215, 0, 0.15), transparent 70%);
    pointer-events: none;
}

.offline-premium-icon {
    font-size: 80px;
    line-height: 1;
    margin-bottom: 15px;
    position: relative;
    display: inline-block;
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
    animation: premium-float 3s ease-in-out infinite;
}

.offline-premium-icon::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 60%);
    z-index: -1;
}

@keyframes premium-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.offline-premium-title {
    color: #fff;
    font-size: 30px;
    font-weight: 800;
    margin: 0 0 10px 0;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    direction: rtl;
}
.offline-premium-title span {
    color: #ffd700;
}

.offline-premium-subtitle {
    color: #a0aec0;
    font-size: 15px;
    margin-bottom: 20px;
    line-height: 1.4;
    direction: rtl;
    padding: 0 10px;
}

.offline-premium-divider {
    color: #ffd700;
    font-size: 20px;
    margin-bottom: 20px;
    opacity: 0.7;
    position: relative;
}
.offline-premium-divider::before, .offline-premium-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 30%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent);
}
.offline-premium-divider::before { left: 10%; }
.offline-premium-divider::after { right: 10%; }

.offline-premium-amount-box {
    background: rgba(16, 185, 129, 0.05);
    border: 2px solid rgba(16, 185, 129, 0.6);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 15px rgba(16, 185, 129, 0.1);
}

.offline-premium-amount {
    color: #10b981;
    font-size: 38px;
    font-weight: 900;
    text-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
    letter-spacing: 1px;
}

.offline-premium-btn-ad {
    background: linear-gradient(90deg, #6b21a8, #c026d3) !important;
    border: 1px solid rgba(232, 121, 249, 0.6) !important;
    box-shadow: 0 0 20px rgba(192, 38, 211, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    font-size: 20px !important;
    font-weight: bold !important;
    padding: 15px !important;
    border-radius: 14px !important;
    margin-bottom: 12px !important;
    transition: all 0.3s ease !important;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
}
.offline-premium-btn-ad:hover {
    transform: scale(1.03) !important;
    box-shadow: 0 0 30px rgba(192, 38, 211, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.3) !important;
}

.offline-premium-btn-claim {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #e2e8f0 !important;
    font-size: 18px !important;
    font-weight: 500 !important;
    padding: 12px !important;
    border-radius: 14px !important;
    transition: all 0.3s ease !important;
    width: 100%;
}
.offline-premium-btn-claim:hover {
    background: rgba(255, 255, 255, 0.1) !important;
}
`;

if (!cssContent.includes('.offline-modal-premium')) {
    cssContent += '\n' + premiumCSS;
    fs.writeFileSync('style.css', cssContent);
}

let htmlContent = fs.readFileSync('index.html', 'utf8');

const oldModal = \`<div class="modal-box">
              <div class="modal-icon" aria-hidden="true">💰</div>
              <h2 class="modal-title" id="offline-modal-title">ברוך שובך, מנכ"ל!</h2>
              <p class="modal-text" id="offline-modal-text">הצוות והמנהלים שלך עבדו קשה 
בזמן שהיית רחוק וצברו רווחים עבור
                  הבנק!</p>
              <div class="modal-amount" id="modal-amount">$0</div>
              <div class="prestige-options prestige-options-mt">
                  <button id="offline-double-btn" class="modal-close-btn prestige-double-btn"><span
                          aria-hidden="true">🎬</span> צפה בסרטון וקבל פי 2!</button>
                  <button id="offline-claim-btn" class="modal-close-btn secondary-btn">קבל סכום 
רגיל</button>
              </div>
          </div>\`;

const newModal = \`<div class="modal-box offline-modal-premium">
              <div class="vault-particle vp-1" style="--tx: -120px; --ty: -180px; --rot: 120deg;">💵</div>
              <div class="vault-particle vp-2" style="--tx: 140px; --ty: -160px; --rot: -140deg;">💵</div>
              <div class="vault-particle vp-3" style="--tx: -160px; --ty: 100px; --rot: 240deg;">💰</div>
              <div class="vault-particle vp-4" style="--tx: 150px; --ty: 120px; --rot: -220deg;">💰</div>
              <div class="vault-particle vp-5" style="--tx: 0px; --ty: -200px; --rot: 360deg;">💵</div>
              
              <div class="offline-premium-icon" aria-hidden="true">💰</div>
              <h2 class="offline-premium-title" id="offline-modal-title">ברוך שובך, <span>מנכ"ל!</span></h2>
              <p class="offline-premium-subtitle" id="offline-modal-text">הצוות והמנהלים שלך עבדו קשה בזמן שהיית רחוק וצברו רווחים עבור הבנק!</p>
              
              <div class="offline-premium-divider">✧</div>
  
              <div class="offline-premium-amount-box">
                  <div class="offline-premium-amount" id="modal-amount">$0</div>
              </div>
  
              <div class="prestige-options prestige-options-mt">
                  <button id="offline-double-btn" class="modal-close-btn offline-premium-btn-ad">
                      <span aria-hidden="true">🎬</span> צפה בסרטון וקבל פי 3!
                  </button>
                  <button id="offline-claim-btn" class="modal-close-btn offline-premium-btn-claim">קבל סכום רגיל</button>
              </div>
          </div>\`;

// Replace using a regex for more robust matching due to newlines
const oldModalRegex = /<div class="modal-box">\s*<div class="modal-icon".*?<\/div>\s*<\/div>/s;

if (oldModalRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(oldModalRegex, newModal);
    fs.writeFileSync('index.html', htmlContent);
    console.log("Successfully updated offline modal UI");
} else {
    console.log("Could not find the target modal block");
}
