const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix Scripts
html = html.replace(/<script src=\"[^\"]+\" defer><\/script>/g, '');
html = html.replace('</body>', `    <script src=\"config.js\" defer></script>\n    <script src=\"audio.js\" defer></script>\n    <script src=\"locales.js\" defer></script>\n    <script src=\"economy-manager.js\" defer></script>\n    <script src=\"save-manager.js\" defer></script>\n    <script src=\"mission-controller.js\" defer></script>\n    <script src=\"game.js\" defer></script>\n    <script src=\"ui-draw.js\" defer></script>\n    <script src=\"ui-tabs.js\" defer></script>\n    <script src=\"ui-events.js\" defer></script>\n    <script src=\"app.js\" defer></script>\n</body>`);

// 2. Fix Splash Title
html = html.replace('<h1 class="splash-title">אימפריית הבנקים</h1>', '<p class="splash-title">אימפריית הבנקים</p>');

// 3. Inline Styles to Classes
html = html.replace('style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;"', 'class="modal-text-muted"');
html = html.replace('id="login-reward-collect-btn" style="margin-top:1.25rem;"', 'id="login-reward-collect-btn" class="login-reward-collect-btn"');
html = html.replace('class="prestige-options" style="margin-top: 1.5rem;"', 'class="prestige-options prestige-options-mt"');
html = html.replace('style="margin-top: 1.5rem; border-top: 1px dashed var(--border-color); padding-top: 1rem; width: 100%; text-align: center;"', 'class="settings-theme-section"');
html = html.replace('style="font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 600;"', 'class="settings-section-title"');
html = html.replace('style="color: var(--danger-red); font-size: 0.9rem; margin-bottom: 0.4rem; font-weight: 600;"', 'class="settings-danger-title"');
html = html.replace('id="reset-game-btn" style="background: var(--danger-red); border-color: var(--danger-red); font-size: 0.8rem; padding: 0.4rem 0.8rem; width: auto; display: inline-block;"', 'id="reset-game-btn" class="reset-game-btn"');
html = html.replace('id="lang-modal-close" style="display: none; margin-top: 1rem; width: auto; padding: 0.6rem 2rem;"', 'id="lang-modal-close" class="lang-modal-close-btn"');
html = html.replace('id="event-cash-display-box" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); background: rgba(255, 255, 255, 0.03); padding: 0.5rem 1.25rem; border-radius: 10px; border: 1px solid var(--border-color); margin-top: -0.25rem; display: flex; align-items: center; gap: 0.5rem;"', 'id="event-cash-display-box" class="event-cash-display-box"');
html = html.replace('id="event-cash-val" style="color:var(--money-green); font-family:\'Outfit\', sans-serif;"', 'id="event-cash-val" class="event-cash-val"');
html = html.replace('style="font-size:0.85rem; margin-bottom:0.75rem;" id="fortune-wheel-subtitle"', 'class="fortune-wheel-subtitle" id="fortune-wheel-subtitle"');
html = html.replace(/<div class="wheel-segments">[\s\S]*?<\/div>/, '<div class="wheel-segments" id="wheel-segments-container"></div>');
html = html.replace('id="fortune-spin-hint" style="font-size:0.8rem; color:#9ca3af; margin:0 0 0.5rem; text-align:center;"', 'id="fortune-spin-hint"');
html = html.replace('id="fortune-close-btn" style="margin-top:0.75rem; width:100%; padding:0.6rem; border-radius:10px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); color:#f87171; font-size:0.9rem; font-weight:600; cursor:pointer; transition:background 0.2s;"', 'id="fortune-close-btn" class="fortune-close-btn-styled"');
html = html.replace('id="weekly-stats-box" style="background:rgba(255,255,255,0.05); border:1px solid var(--border-color); border-radius:10px; padding:0.75rem 1rem; margin:0.75rem 0; text-align:right; font-size:0.88rem; line-height:1.8;"', 'id="weekly-stats-box" class="weekly-stats-box"');
html = html.replace('class="prestige-options" style="margin-top: 1rem;"', 'class="prestige-options weekly-prestige-options"');

// 5. UX & A11y & SEO Improvements
html = html.replace('</head>', '    <meta property="og:title" content="אימפריית הבנקים">\n    <meta property="og:description" content="הפוך מטייקון מתחיל למנהל אימפריית בנקים עולמית. משחק קליל וממכר עם גרפיקה יוקרתית, שדרוגים, מנהלים וסניפים ברחבי העולם!">\n    <meta property="og:image" content="assets/icons/icon-512x512.png">\n    <meta property="og:type" content="website">\n</head>');
html = html.replace('<body>', '<body>\n    <a href="#main-content" class="skip-link">דלג לתוכן</a>');
html = html.replace('<div class="splash-loader"></div>', '<div class="splash-loader" role="status" aria-label="טוען..."></div>');
html = html.replace('<main class="main-grid">', '<main id="main-content" class="main-grid">');
html = html.replace('<section class="control-panel" aria-label="לוח בקרה ושדרוגים">', '<section class="control-panel" aria-label="לוח בקרה ושדרוגים">\n                <h2 class="sr-only">לוח בקרה</h2>');
html = html.replace('<div class="floating-container" id="floating-container"></div>', '<div class="floating-container" id="floating-container" aria-hidden="true"></div>');
html = html.replace('<div class="vault-mini-bar" id="vault-mini-bar">', '<div class="vault-mini-bar" id="vault-mini-bar" style="display:none;">');

// 6. Reset Checkbox
html = html.replace('<button class="collect-vault-btn reset-game-btn" id="reset-game-btn"><span aria-hidden="true">⚠️</span> איפוס משחק / Reset Game</button>', 
`<div class="reset-confirm-wrapper" style="margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <input type="checkbox" id="reset-confirm-checkbox">
                    <label for="reset-confirm-checkbox" id="reset-confirm-label" style="font-size: 0.8rem; color: var(--text-muted); cursor: pointer;">אני מאשר איפוס מלא / I confirm full reset</label>
                </div>
                <button class="collect-vault-btn reset-game-btn" id="reset-game-btn" disabled><span aria-hidden="true">⚠️</span> איפוס משחק / Reset Game</button>`);

// 7. Footer
html = html.replace(/<footer>[\s\S]*?<\/footer>/, `<footer role="contentinfo">
            <p id="label-footer"><span id="footer-flavor">אימפריית הבנקים © 2026 - משחק Idle פרימיום. כל הזכויות שמורות.</span></p>
            <div class="footer-links">
                <a href="#" class="footer-link">תנאי שימוש</a> | 
                <a href="#" class="footer-link">מדיניות פרטיות</a> |
                <span class="footer-version">v1.0.0</span>
            </div>
        </footer>`);

// 8. Fix missing closing tags on some modal buttons if any? No, they were intact.

fs.writeFileSync('index.html', html);
console.log('HTML Patched Successfully');
