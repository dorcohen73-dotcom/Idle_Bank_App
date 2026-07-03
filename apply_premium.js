const fs = require('fs');
let htmlContent = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="modal-box">.*?<h2 class="modal-title" id="offline-modal-title">.*?<\/div>\s*<\/div>/s;

const newHTML = 
'<div class="modal-box offline-modal-premium">\n' +
'    <div class="vault-particle vp-1" style="--tx: -120px; --ty: -180px; --rot: 120deg;">💵</div>\n' +
'    <div class="vault-particle vp-2" style="--tx: 140px; --ty: -160px; --rot: -140deg;">💵</div>\n' +
'    <div class="vault-particle vp-3" style="--tx: -160px; --ty: 100px; --rot: 240deg;">💰</div>\n' +
'    <div class="vault-particle vp-4" style="--tx: 150px; --ty: 120px; --rot: -220deg;">💰</div>\n' +
'    <div class="vault-particle vp-5" style="--tx: 0px; --ty: -200px; --rot: 360deg;">💵</div>\n' +
'    <div class="offline-premium-icon" aria-hidden="true">💰</div>\n' +
'    <h2 class="offline-premium-title" id="offline-modal-title">ברוך שובך, <span>מנכ"ל!</span></h2>\n' +
'    <p class="offline-premium-subtitle" id="offline-modal-text">הצוות והמנהלים שלך עבדו קשה בזמן שהיית רחוק וצברו רווחים עבור הבנק!</p>\n' +
'    <div class="offline-premium-divider">✧</div>\n' +
'    <div class="offline-premium-amount-box">\n' +
'        <div class="offline-premium-amount" id="modal-amount">$0</div>\n' +
'    </div>\n' +
'    <div class="prestige-options prestige-options-mt">\n' +
'        <button id="offline-double-btn" class="modal-close-btn offline-premium-btn-ad">\n' +
'            <span aria-hidden="true">🎬</span> צפה בסרטון וקבל פי 3!\n' +
'        </button>\n' +
'        <button id="offline-claim-btn" class="modal-close-btn offline-premium-btn-claim">קבל סכום רגיל</button>\n' +
'    </div>\n' +
'</div>';

if (regex.test(htmlContent)) {
    htmlContent = htmlContent.replace(regex, newHTML);
    fs.writeFileSync('index.html', htmlContent);
    console.log("Updated HTML");
} else {
    console.log("Regex not found");
}
