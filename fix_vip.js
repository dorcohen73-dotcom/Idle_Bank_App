const fs = require('fs');
const file = 'c:/Users/dorco/Desktop/אנטי גרפיטי/IDLE בנק/ui-events.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /function triggerVipVisitBanner\(\) \{[\s\S]*?function serveVipVisitor\(withAd\) \{[\s\S]*?    \}/;

const replacement = `window.triggerVipVisitBanner = function() {
        if (document.getElementById('vip-visit-banner')) return;

        const lang = (game.state && game.state.language) || 'he';
        const tObj = translations[lang] || translations.he;

        const banner = document.createElement('div');
        banner.id = 'vip-visit-banner';
        banner.className = 'vip-visit-banner';

        let prestigeAmount = typeof game.calculatePrestigeShares === 'function' ? game.calculatePrestigeShares() : 10;
        let shareReward = Math.max(1, Math.ceil(prestigeAmount * 0.30));

        let hourlyProfit = typeof game.getEarningsPerSecond === 'function' ? game.getEarningsPerSecond() * 3600 : 0;
        let cashReward = Math.ceil(hourlyProfit * 0.30);

        const serveText = tObj.vipCloseBtn || 'המשך כרגיל';
        const rewardType = Math.random() < 0.5 ? 'shares' : 'cash';
        
        let premiumText = '';
        if (rewardType === 'shares') {
            premiumText = typeof tObj.vipPremiumBtn === 'function' ? tObj.vipPremiumBtn(shareReward) : (tObj.vipPremiumBtn || 'VIP Premium');
        } else {
            premiumText = tObj.vipPremiumCashBtn ? tObj.vipPremiumCashBtn(formatMoney(cashReward)) : \`VIP Premium (פרסומת + \${formatMoney(cashReward)})\`;
        }

        const vipName = tObj.vipBannerTitle || 'לקוח עסקי';

        banner.innerHTML = \`
            <div class="vip-premium-content">
                <div class="vip-red-carpet"></div>
                <div class="vip-shimmer"></div>
                <div class="vip-profile">
                    <div class="vip-avatar">💎</div>
                    <div class="vip-ring"></div>
                </div>
                <div class="vip-info">
                    <div class="vip-title-wrap"><span class="vip-badge">VIP</span> <span class="vip-name">\${vipName}</span></div>
                </div>
                <div class="vip-progress-wrap">
                    <div class="vip-progress-bar" id="vip-progress-bar"></div>
                </div>
                <div class="vip-actions">
                    \${!AdService.isInCooldown() ? \`
                    <button class="vip-btn vip-serve-premium" id="vip-serve-ad"><span class="btn-icon">🎬</span> \${premiumText}</button>
                    \` : ''}
                    <button class="vip-btn vip-serve-cash" id="vip-serve-cash">\${serveText}</button>
                </div>
            </div>
        \`;
        document.body.appendChild(banner);

        let secsLeft = 25;
        const totalSecs = 25;
        const progressBar = document.getElementById('vip-progress-bar');

        if (vipBannerCountdownInterval) clearInterval(vipBannerCountdownInterval);
        vipBannerCountdownInterval = setInterval(() => {
            secsLeft--;
            if (progressBar) {
                const pct = (secsLeft / totalSecs) * 100;
                progressBar.style.width = pct + '%';
            }
            if (secsLeft <= 0) {
                clearInterval(vipBannerCountdownInterval);
                removeVipVisitBanner();
            }
        }, 1000);

        document.getElementById('vip-serve-cash').addEventListener('click', () => {
            initSound();
            serveVipVisitor('none');
        });
        const premiumAdBtn = document.getElementById('vip-serve-ad');
        if (premiumAdBtn) {
            premiumAdBtn.addEventListener('click', () => {
                initSound();
                serveVipVisitor(rewardType);
            });
        }
    }

    function removeVipVisitBanner() {
        if (vipBannerCountdownInterval) {
            clearInterval(vipBannerCountdownInterval);
            vipBannerCountdownInterval = null;
        }
        if (window._vipBannerRetryTimeout) {
            clearTimeout(window._vipBannerRetryTimeout);
            window._vipBannerRetryTimeout = null;
        }
        const banner = document.getElementById('vip-visit-banner');
        if (banner) banner.remove();
    }

    function serveVipVisitor(rewardType) {
        removeVipVisitBanner();
        game.state.vipVisitActive = false;
        game.state.nextVipVisit = Date.now() + (300 + Math.random() * 180) * 1000;
        game.state.vipVisitExpiry = 0;
        game.state.vipServedTotal = (game.state.vipServedTotal || 0) + 1;
        game.missionsDirty = true;

        if (rewardType === 'shares') {
            playAd(() => {
                let prestigeAmount = typeof game.calculatePrestigeShares === 'function' ? game.calculatePrestigeShares() : 10;
                let shareReward = Math.max(1, Math.ceil(prestigeAmount * 0.30));
                
                game.state.shares = Math.min((game.state.shares || 0) + shareReward, 1000000000);
                const msg = \`⭐ \${shareReward} VIP Shares ⭐\`;
                spawnFloating(msg, window.innerWidth / 2, window.innerHeight / 2 - 40, 'gold');
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => spawnFloating('💎', window.innerWidth / 2 + (Math.random() * 160 - 80), window.innerHeight / 2 + (Math.random() * 160 - 80), 'gold'), Math.random() * 800);
                }
                game.saveGame();
                draw();
            });
        } else if (rewardType === 'cash') {
            playAd(() => {
                let hourlyProfit = typeof game.getEarningsPerSecond === 'function' ? game.getEarningsPerSecond() * 3600 : 0;
                let cashReward = Math.ceil(hourlyProfit * 0.30);

                game.state.cash = Math.round((game.state.cash + cashReward + Number.EPSILON) * 100) / 100;
                game.state.lifetimeCash = Math.round((game.state.lifetimeCash + cashReward + Number.EPSILON) * 100) / 100;
                const msg = \`💵 +\${formatMoney(cashReward)} 💵\`;
                spawnFloating(msg, window.innerWidth / 2, window.innerHeight / 2 - 40, 'green');
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => spawnFloating('💵', window.innerWidth / 2 + (Math.random() * 160 - 80), window.innerHeight / 2 + (Math.random() * 160 - 80), 'green'), Math.random() * 800);
                }
                game.saveGame();
                draw();
            });
        } else {
            game.saveGame();
            draw();
        }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync(file, code);
console.log('Successfully updated ui-events.js');
