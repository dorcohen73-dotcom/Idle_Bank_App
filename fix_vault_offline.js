const fs = require('fs');

let cssContent = fs.readFileSync('style.css', 'utf8');

const vaultCSS = `
/* Offline Vault Animation */
.vault-animation-container {
    position: relative;
    width: 90%;
    max-width: 450px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* overflow: hidden; */ /* Removing overflow hidden so doors can slide completely out of frame visually */
}

/* Ensure the modal box takes full width of container */
.vault-animation-container .modal-box {
    width: 100%;
    margin: 0;
    opacity: 0;
}

.vault-doors {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
    pointer-events: none;
}

.vault-door-left, .vault-door-right {
    width: 50%;
    height: 100%;
    background: linear-gradient(135deg, #3a3f58, #1c1f2e);
    border: 2px solid rgba(255,255,255,0.1);
    position: relative;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
    transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1);
    transition-delay: 0.8s;
}

.vault-door-left {
    border-right: 4px solid #0f111a;
    border-radius: 20px 0 0 20px;
}

.vault-door-right {
    border-left: 4px solid #0f111a;
    border-radius: 0 20px 20px 0;
}

.vault-wheel-spinner {
    position: absolute;
    right: -40px;
    top: 50%;
    margin-top: -40px;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle at center, #fef08a, #ca8a04);
    border-radius: 50%;
    border: 4px solid #111;
    box-shadow: 0 5px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,255,255,0.5);
    z-index: 60;
    transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.vault-wheel-spinner::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 100%;
    background: #222;
    border-radius: 2px;
}
.vault-wheel-spinner::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 12px;
    background: #222;
    border-radius: 2px;
}
.vault-wheel-center {
    position: absolute;
    width: 30px;
    height: 30px;
    background: #444;
    border-radius: 50%;
    z-index: 61;
    border: 2px solid #ca8a04;
}

/* Hardware accents */
.vault-hardware {
    position: absolute;
    width: 20px;
    height: 60px;
    background: #222;
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(255,255,255,0.2);
}
.hardware-l1 { top: 20%; right: 10px; }
.hardware-l2 { bottom: 20%; right: 10px; }
.hardware-r1 { top: 20%; left: 10px; }
.hardware-r2 { bottom: 20%; left: 10px; }

/* Active Animations */
#offline-modal.active .vault-wheel-spinner {
    transform: rotate(270deg);
}

#offline-modal.active .vault-door-left {
    transform: translateX(-110%);
    opacity: 0;
    transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1) 0.8s, opacity 0.5s ease 1.5s;
}

#offline-modal.active .vault-door-right {
    transform: translateX(110%);
    opacity: 0;
    transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1) 0.8s, opacity 0.5s ease 1.5s;
}

#offline-modal.active .modal-box {
    animation: reveal-offline-modal 0.8s ease-out 1.2s forwards;
}

@keyframes reveal-offline-modal {
    0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: brightness(0); }
    50% { opacity: 1; transform: scale(1.05) translateY(-5px); filter: brightness(1.5); }
    100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1); }
}

/* End Vault Animation */
`;

if (!cssContent.includes('.vault-animation-container')) {
    cssContent += '\n' + vaultCSS;
    fs.writeFileSync('style.css', cssContent);
}

let htmlContent = fs.readFileSync('index.html', 'utf8');

const oldModal = \`<div class="modal-box">
            <div class="modal-icon" aria-hidden="true">💰</div>
            <h2 class="modal-title" id="offline-modal-title">ברוך שובך, מנכ"ל!</h2>
            <p class="modal-text" id="offline-modal-text">הצוות והמנהלים שלך עבדו קשה בזמן שהיית רחוק וצברו רווחים עבור
                הבנק!</p>
            <div class="modal-amount" id="modal-amount">$0</div>
            <div class="prestige-options prestige-options-mt">
                <button id="offline-double-btn" class="modal-close-btn prestige-double-btn"><span
                        aria-hidden="true">🎬</span> צפה בסרטון וקבל פי 2!</button>
                <button id="offline-claim-btn" class="modal-close-btn secondary-btn">קבל סכום רגיל</button>
            </div>
        </div>\`;

const newModal = \`<div class="vault-animation-container">
            <div class="vault-doors">
                <div class="vault-door-left">
                    <div class="vault-hardware hardware-l1"></div>
                    <div class="vault-hardware hardware-l2"></div>
                    <div class="vault-wheel-spinner">
                        <div class="vault-wheel-center"></div>
                    </div>
                </div>
                <div class="vault-door-right">
                    <div class="vault-hardware hardware-r1"></div>
                    <div class="vault-hardware hardware-r2"></div>
                </div>
            </div>
            <div class="modal-box">
                <div class="modal-icon" aria-hidden="true">💰</div>
                <h2 class="modal-title" id="offline-modal-title">ברוך שובך, מנכ"ל!</h2>
                <p class="modal-text" id="offline-modal-text">הצוות והמנהלים שלך עבדו קשה בזמן שהיית רחוק וצברו רווחים עבור הבנק!</p>
                <div class="modal-amount" id="modal-amount" style="text-shadow: 0 0 20px rgba(16,185,129,0.8);">$0</div>
                <div class="prestige-options prestige-options-mt">
                    <button id="offline-double-btn" class="modal-close-btn prestige-double-btn"><span aria-hidden="true">🎬</span> צפה בסרטון וקבל פי 2!</button>
                    <button id="offline-claim-btn" class="modal-close-btn secondary-btn">קבל סכום רגיל</button>
                </div>
            </div>
        </div>\`;

if (htmlContent.includes('<div class="modal-box">\n            <div class="modal-icon" aria-hidden="true">💰</div>')) {
    htmlContent = htmlContent.replace(oldModal, newModal);
    fs.writeFileSync('index.html', htmlContent);
    console.log('Successfully updated CSS and HTML for Vault Animation!');
} else {
    console.log('Could not find the target modal block in index.html');
}
