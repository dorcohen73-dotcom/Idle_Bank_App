const fs = require('fs');
let cssContent = fs.readFileSync('style.css', 'utf8');

const mobileCSS = `
/* Mobile scaling for premium offline modal */
@media (max-width: 480px) {
    .offline-modal-premium {
        padding: 25px 15px 15px 15px !important;
        border-radius: 16px !important;
        width: 90% !important;
        max-width: 350px !important;
    }
    .offline-modal-premium::before {
        height: 100px !important;
    }
    .offline-premium-icon-img {
        width: 100px !important;
        height: 100px !important;
        margin-top: -10px !important;
        margin-bottom: 5px !important;
    }
    .offline-premium-title {
        font-size: 26px !important;
        margin-bottom: 5px !important;
    }
    .offline-premium-subtitle {
        font-size: 14px !important;
        padding: 0 5px !important;
        margin-bottom: 15px !important;
    }
    .offline-premium-divider {
        font-size: 18px !important;
        margin-bottom: 15px !important;
    }
    .offline-premium-amount-box {
        padding: 12px 10px !important;
        margin-bottom: 15px !important;
    }
    .offline-premium-amount {
        font-size: 30px !important;
    }
    .offline-premium-btn-ad {
        font-size: 17px !important;
        padding: 12px !important;
        gap: 8px !important;
    }
    .offline-premium-btn-claim {
        font-size: 16px !important;
        padding: 12px !important;
    }
}
@media (max-height: 700px) {
    .offline-modal-premium {
        padding: 15px !important;
    }
    .offline-premium-icon-img {
        width: 80px !important;
        height: 80px !important;
    }
    .offline-premium-title {
        font-size: 22px !important;
    }
    .offline-premium-amount {
        font-size: 26px !important;
    }
}
`;

if (!cssContent.includes('Mobile scaling for premium offline modal')) {
    cssContent += '\n' + mobileCSS;
    fs.writeFileSync('style.css', cssContent);
    console.log("Added mobile styling");
} else {
    console.log("Mobile styling already exists");
}
