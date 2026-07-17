import { initSound, playAd, AdService } from './ads.js';
import { showDiscoveryTip } from './engagement.js';

export function openPrestigeModal(target) {
    const lang = game.state.language || 'en';
    const tObj = translations[lang];
    const sharesGained = game.calculatePrestigeShares();
    
    const elTitle = document.getElementById('prestige-modal-title');
    const elGained = document.getElementById('prestige-shares-gained');
    const elDoubled = document.getElementById('prestige-shares-doubled');
    const elAdBtn = document.getElementById('prestige-ad-btn');
    const elRegularBtn = document.getElementById('prestige-regular-btn');
    const elCancelBtn = document.getElementById('prestige-cancel-btn');
    const elRewardLabel = document.getElementById('prestige-reward-label');
    
    if (elTitle) {
          if (tObj.branches && tObj.branches.names && tObj.branches.names[target]) {
              elTitle.innerText = tObj.branches.names[target];
          } else if (game.branches && game.branches[target] && game.branches[target].name) {
              elTitle.innerText = game.branches[target].name;
          } else {
              elTitle.innerText = (tObj.branchLabel || 'Branch') + ' ' + (parseInt(target) + 1);
          }
      }
    if (elGained) elGained.innerText = `+${sharesGained.toLocaleString('en-US')}`;
    if (elDoubled) elDoubled.innerText = `${(sharesGained * 3).toLocaleString('en-US')}`;
    if (elAdBtn) elAdBtn.innerText = tObj.prestigeAdBtn((sharesGained * 3).toLocaleString('en-US'));
    if (elRegularBtn) elRegularBtn.innerText = tObj.prestigeRegularBtn;
    if (elCancelBtn) elCancelBtn.innerText = tObj.prestigeCancelBtn;
    if (elRewardLabel) elRewardLabel.innerText = tObj.prestigeRewardLabel;
    
    const modal = document.getElementById('prestige-modal');
    if (modal) {
        modal.setAttribute('data-target-branch', target);
        modal.classList.add('active');
    }
    // Discovery tip: first time player opens prestige modal
    if (typeof window.showDiscoveryTip === 'function') window.showDiscoveryTip('prestige');
}

export function openBoostModal() {
    const lang = game.state.language || 'en';
    const tObj = translations[lang];
    
    const eventModal = document.getElementById('event-modal');
    const iconEl = document.getElementById('event-icon');
    const titleEl = document.getElementById('event-title');
    const textEl = document.getElementById('event-text');
    const container = document.getElementById('event-options-container');
    
    iconEl.innerText = "⚡";
    titleEl.innerText = tObj.boostModalTitle;
    textEl.innerText = tObj.boostModalText;
    
    const cashValEl = document.getElementById('event-cash-val');
    if (cashValEl) {
        cashValEl.innerText = formatMoney(game.state.cash);
    }

    container.innerHTML = '';
    
    const _boostEps = game.getEarningsPerSecond() || 0;
    const _projectedEarnings = Math.floor(_boostEps * 4 * 3600);
    const _earningsHint = _projectedEarnings > 0 && typeof tObj.boostEventEarningsHint === 'function'
        ? tObj.boostEventEarningsHint(formatMoney(_projectedEarnings))
        : '';
    const btnAd = document.createElement('button');
    btnAd.className = 'event-option-btn ad-option';
    btnAd.innerHTML = `
        <div class="event-option-title">${tObj.boostEventAdTitle || '🎬 Watch Ad & Activate'}</div>
        <div class="event-option-desc">${tObj.boostEventAdDesc || 'Adds 4 hours of double earnings (up to 8h)'}${_earningsHint}</div>
    `;
    btnAd.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.addBoost2x(4);
            draw();
        });
    });
    
    const btnCancel = document.createElement('button');
    btnCancel.className = 'event-option-btn';
    btnCancel.innerHTML = `
        <div class="event-option-title">${tObj.cancelLabel || 'Cancel'}</div>
        <div class="event-option-desc">${tObj.backToGameLabel || 'Back to game'}</div>
    `;
    btnCancel.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
    });
    
    container.appendChild(btnAd);
    container.appendChild(btnCancel);
    
    eventModal.classList.add('active');
}

export function openAnalyticsModal() {
    const modal = document.getElementById('analytics-modal');
    if (!modal) return;
    
    const lang = game.state.language || 'en';
    const tObj = translations[lang];
    
    document.getElementById('analytics-modal-title').innerText = tObj.analyticsTitle;
    document.getElementById('analytics-title-general').innerText = tObj.analyticsGeneralStats || 'General Stats';
    document.getElementById('analytics-label-eps').innerText = tObj.analyticsTotalEps;
    document.getElementById('analytics-label-vault').innerText = tObj.analyticsVaultUtil;
    document.getElementById('analytics-title-tellers').innerText = tObj.analyticsTellersTitle;
    document.getElementById('analytics-title-warnings').innerText = tObj.analyticsBottlenecksTitle;
    document.getElementById('analytics-close-btn').innerText = tObj.analyticsCloseBtn;
    
    document.getElementById('analytics-total-eps').innerText = formatMoney(game.getEarningsPerSecond());
    
    const vCap = game.getVaultCapacity(game.state.vault.level);
    const vaultUtil = Math.round((game.state.vault.cashStored / vCap) * 100);
    document.getElementById('analytics-vault-util').innerText = `${vaultUtil}%`;
    
    const tellersListEl = document.getElementById('analytics-tellers-list');
    tellersListEl.innerHTML = '';
    const tellersFragment = document.createDocumentFragment();
    const currentBaseReward = game.getCurrentBaseReward();
    const totalMultiplier = game.getTotalMultiplier();
    
    game.state.tellers.forEach(t => {
        if (t.unlocked) {
            const row = document.createElement('div');
            row.className = 'analytic-teller-row';
            
            const speed = game.getTellerSpeed(t.level);
            const reward = currentBaseReward * totalMultiplier;
            const tellerEps = reward / speed;
            
            row.innerHTML = `
                <span>${tObj.tellerLabel} ${t.id + 1} (${tObj.levelLabel} ${t.level}):</span>
                <strong>${formatMoney(tellerEps)}/${tObj.secLabel || 'sec'}</strong>
            `;
            tellersFragment.appendChild(row);
        }
    });
    tellersListEl.appendChild(tellersFragment);
    
    const warningsListEl = document.getElementById('analytics-warnings-list');
    warningsListEl.innerHTML = '';
    
    const warnings = [];
    if (game.state.vault.cashStored >= vCap) {
        warnings.push(tObj.analyticsWarningVaultFull);
    }
    
    const qCap = game.getQueueCapacity(game.state.queueUpgradeLevel || 1);
    if (game.customerQueue.length >= qCap) {
        warnings.push(tObj.analyticsWarningQueueFull);
    }
    
    const anyTellerFull = game.state.tellers.some(t => t.unlocked && t.cashStored >= game.getTellerCapacity(t.level) * 0.8);
    if (anyTellerFull) {
        warnings.push(tObj.analyticsWarningGuardsSlow);
    }
    
    if (game.customerQueue.length >= 5) {
        warnings.push(tObj.analyticsWarningTellersSlow);
    }
    
    if (warnings.length === 0) {
        warningsListEl.innerHTML = `<div class="analytic-no-warning">${tObj.analyticsNoBottlenecks}</div>`;
    } else {
        const warningsFragment = document.createDocumentFragment();
        warnings.forEach(w => {
            const item = document.createElement('div');
            item.className = 'analytic-warning-item';
            item.innerText = w;
            warningsFragment.appendChild(item);
        });
        warningsListEl.appendChild(warningsFragment);
    }
    
    modal.classList.add('active');
    
    const closeBtn = document.getElementById('analytics-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            initSound();
            modal.classList.remove('active');
        };
    }
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            initSound();
            modal.classList.remove('active');
        }
    };
}

export function openWeeklyRewardModal() {
    const lang = (game.state && game.state.language) || 'en';
    const tObj = translations[lang] || translations.en;
    const modal = document.getElementById('weekly-modal');
    if (!modal) return;

    const titleEl = document.getElementById('weekly-modal-title');
    const textEl = document.getElementById('weekly-modal-text');
    const statsBox = document.getElementById('weekly-stats-box');

    if (titleEl) titleEl.innerText = tObj.weeklyTitle || '🏆 Great Week!';
    if (textEl) textEl.innerText = tObj.weeklyText || 'A full week of running your empire! Your team is ready for a boost!';

    if (statsBox) {
        const eps = game.getEarningsPerSecond ? game.getEarningsPerSecond() : 0;
        const served = (game.state.stats && game.state.stats.clientsServed) || 0;
        const shares = game.state.shares || 0;
        statsBox.innerHTML = typeof tObj.weeklyStats === 'function'
            ? tObj.weeklyStats(formatMoney(eps), served.toLocaleString(), shares)
            : `💰 EPS: <strong>${formatMoney(eps)}</strong><br>👥 Clients served: <strong>${served.toLocaleString()}</strong><br>⭐ Gold shares: <strong>${shares}</strong>`;
    }

    const adBtn = document.getElementById('weekly-ad-btn');
    const closeBtn = document.getElementById('weekly-close-btn');

    if (adBtn) {
        if (AdService.isInCooldown()) {
            adBtn.style.display = 'none';
        } else {
            adBtn.style.display = '';
            adBtn.onclick = () => {
                initSound();
                modal.classList.remove('active');
                playAd(() => {
                    game.addBoost2x(8);
                    game.state.lastWeeklyReward = Date.now();
                    draw();
                    spawnFloating(tObj.boost8hMsg || '⚡ 8h Boost!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
                });
            };
        }
    }
    if (closeBtn) {
        closeBtn.onclick = () => {
            initSound();
            modal.classList.remove('active');
            game.state.lastWeeklyReward = Date.now();
        };
    }
    modal.onclick = (e) => {
        if (e.target === modal) {
            initSound();
            modal.classList.remove('active');
            game.state.lastWeeklyReward = Date.now();
        }
    };

    if (window.NotificationQueue) {
        window.NotificationQueue.request('weekly-modal', window.NotificationQueue.PRIORITY.IMPORTANT, () => {
            modal.classList.add('active');
        });
    } else {
        modal.classList.add('active');
    }
}

export function checkWeeklyReward() {
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const last = (game.state && game.state.lastWeeklyReward) || 0;
    if (Date.now() - last >= ONE_WEEK_MS) {
        // NotificationQueue waits for any other automatic pop-up to close first.
        setTimeout(openWeeklyRewardModal, 4000);
    }
}

export function showOfflineEarningsModal() {
    if (!window.game || !window.game.offlineEarningsReport || isNaN(window.game.offlineEarningsReport) || window.game.offlineEarningsReport <= 0) return;

    const displayFn = () => {
        if (DOM_CACHE.offlineModalAmount) DOM_CACHE.offlineModalAmount.innerText = formatMoney(window.game.offlineEarningsReport);
        if (DOM_CACHE.offlineModalDoubleBtn) DOM_CACHE.offlineModalDoubleBtn.style.display = (typeof AdService !== 'undefined' && AdService.isInCooldown()) ? 'none' : '';
        if (DOM_CACHE.offlineModal) DOM_CACHE.offlineModal.classList.add('active');
    };

    if (window.NotificationQueue) {
        window.NotificationQueue.request('offline-modal', window.NotificationQueue.PRIORITY.IMPORTANT, displayFn);
    } else {
        displayFn();
    }
}

export function showLoginRewardModal() {
    if (!window.game || !window.game.state || !window.game.state.pendingLoginReward) return;
    const modal = document.getElementById('login-reward-modal');
    if (!modal) return;

    const reward = window.game.state.pendingLoginReward;
    const streak = window.game.state.loginStreak || 1;
    const lang = (window.game.state.language) || 'en';
    const tObj = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : translations.he;

    const streakTextEl = document.getElementById('login-reward-streak-text');
    const amountEl = document.getElementById('login-reward-amount');
    const descEl = document.getElementById('login-reward-desc');
    const titleEl = document.getElementById('login-reward-title');

    const lm = (typeof translations !== 'undefined' && translations[lang] && translations[lang].loginModal)
        ? translations[lang].loginModal
        : translations.he.loginModal;

    if (titleEl) titleEl.innerText = lm.title;
    if (streakTextEl) {
        streakTextEl.textContent = typeof lm.streakLabel === 'function' ? lm.streakLabel(streak) : ('Streak: ' + streak + ' days');
    }

    let displayText = '';
    let descText = '';

    if (reward.type === 'cash') {
        displayText = '+$' + formatMoney(reward.value);
        descText = lm.cashDesc;
    } else if (reward.type === 'boost') {
        const mins = Math.round(reward.value / 60);
        displayText = typeof lm.boostLabel === 'function' ? lm.boostLabel(mins) : ('+' + mins + ' min Boost x2');
        descText = lm.boostDesc;
    } else if (reward.type === 'gold' || reward.type === 'shares') {
        displayText = '+' + reward.value + (tObj.goldSharesUnit || ' Gold Shares');
        descText = lm.sharesDesc;
    }

    if (amountEl) amountEl.innerText = displayText;
    if (descEl) descEl.innerText = descText;

    const collectBtn = document.getElementById('login-reward-collect-btn');
    if (collectBtn) {
        collectBtn.innerText = lm.collectBtn;
        collectBtn.onclick = () => {
            initSound();
            modal.classList.remove('active');
            _applyLoginReward(reward);
        };
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            initSound();
            modal.classList.remove('active');
            _applyLoginReward(reward);
        }
    };

    if (window.NotificationQueue) {
        window.NotificationQueue.request('login-reward-modal', window.NotificationQueue.PRIORITY.IMPORTANT, () => {
            modal.classList.add('active');
        });
    } else {
        modal.classList.add('active');
    }
}

export function _applyLoginReward(reward) {
    if (!reward) return;
    if (reward.type === 'cash') {
        window.game.addCash(Math.round(reward.value));
        spawnFloating('+$' + formatMoney(reward.value), window.innerWidth / 2, window.innerHeight / 2, 'green');
    } else if (reward.type === 'boost') {
        window.game.addBoost2x(reward.value / 3600);
        spawnFloating('BOOST x2 +' + Math.round(reward.value / 60) + 'min', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    } else if (reward.type === 'gold' || reward.type === 'shares') {
        window.game.addShares(reward.value);
        spawnFloating('+' + reward.value + ' Shares', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    }
    window.game.state.pendingLoginReward = null;
    window.game.saveGame();
    draw();
}

export function triggerPrestigeCeremony(sharesGained, branchName, callback) {
    const _pLang = (game.state && game.state.language) || 'en';
    const _pT = translations[_pLang] || translations.en;
    const overlay = document.createElement('div');
    overlay.className = 'prestige-ceremony-overlay';
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('role', 'status');

    const line1 = document.createElement('div');
    line1.className = 'ceremony-line1';
    line1.style.cssText = 'font-size:1.5rem; margin-bottom:0.5rem; opacity:0; transition:opacity 0.4s ease;';
    line1.innerText = branchName + ' ' + (_pT.prestigeResetLabel || 'resetting...');

    const line2 = document.createElement('div');
    line2.className = 'ceremony-line2';
    line2.style.cssText = 'font-size:2.5rem; margin:0.5rem 0; opacity:0; transition:opacity 0.4s ease;';
    line2.innerText = '0';

    const line3 = document.createElement('div');
    line3.className = 'ceremony-line3';
    line3.style.cssText = 'font-size:1rem; color:#dfab29; opacity:0; transition:opacity 0.4s ease;';
    line3.innerText = _pT.goldSharesLabel || 'Gold Shares';

    overlay.appendChild(line1);
    overlay.appendChild(line2);
    overlay.appendChild(line3);
    document.body.appendChild(overlay);

    // Phase 1: show "branch resetting..."
    setTimeout(() => { line1.style.opacity = '1'; }, 50);

    // Phase 2: counter animation + fireworks
    setTimeout(() => {
        line2.style.opacity = '1';
        line3.style.opacity = '1';
        // Fireworks particle effect during prestige ceremony
        ['🎆','✨','🌟','💫','🎇'].forEach(function(emoji, i) {
            setTimeout(function() {
                spawnFloating(emoji, Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1, window.innerHeight * 0.3, 'gold');
            }, i * 200);
        });
        const duration = 1000;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            const current = Math.floor(progress * sharesGained);
            line2.innerText = '+' + current;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                line2.innerText = '+' + sharesGained;
            }
        };
        requestAnimationFrame(animate);
    }, 500);

    // Phase 3: fade out and invoke callback
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.5s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (typeof callback === 'function') callback();
        }, 500);
    }, 2000);
}

    export function _wheelWeightedRandom(prizes) {
        const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const prize of prizes) {
            rand -= prize.weight;
            if (rand <= 0) return prize;
        }
        return prizes[prizes.length - 1];
    }

    export function updateFortuneWheelBtnState() {
        const btn = document.getElementById('fortune-wheel-btn');
        if (!btn) return;
        const lastSpin = (game.state && game.state.lastSpinTime) || 0;
        const canSpin = (Date.now() - lastSpin) >= 86400000;
        btn.classList.toggle('fortune-wheel-ready', canSpin);
    }

    export function openFortuneWheel() {
        initSound();
        const lang = (game.state && game.state.language) || 'en';
        const tObj = translations[lang] || translations.en;

        const modal = document.getElementById('fortune-wheel-modal');
        if (!modal) return;

        // Update i18n strings in static HTML
        const titleEl = document.getElementById('fortune-wheel-title');
        if (titleEl) titleEl.textContent = tObj.fortuneWheelTitle || 'גלגל המזל היומי';
        const subtitleEl = document.getElementById('fortune-wheel-subtitle');
        if (subtitleEl) subtitleEl.textContent = tObj.fortuneWheelSubtitle || 'סובב פעם ביום וזכה בפרס!';
        const spinHintEl = document.getElementById('fortune-spin-hint');
        if (spinHintEl) spinHintEl.textContent = tObj.fortuneWheelSpinHint || '👇 לחץ על הכפתור למטה כדי לסובב את הגלגל';
        const closeBtnEl = document.getElementById('fortune-close-btn');
        if (closeBtnEl) closeBtnEl.textContent = tObj.fortuneWheelClose || '✕ סגור וחזור למשחק';

        const now = Date.now();
        const lastSpin = game.state.lastSpinTime || 0;
        const cooldownMs = 86400000; // 24 hours
        const timeLeft = cooldownMs - (now - lastSpin);
        const canSpin = timeLeft <= 0;
        let adSpinGranted = false;

        const spinBtn = document.getElementById('fortune-spin-btn');
        const cooldownEl = document.getElementById('fortune-cooldown');
        const resultEl = document.getElementById('fortune-result');

        if (resultEl) resultEl.style.display = 'none';



        function formatShortAmount(num) {
            if (num < 1000) return '$' + Math.ceil(num);
            const i = Math.floor(Math.log10(num) / 3);
            const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd'];
            const suffix = suffixes[i] || '?';
            const rawVal = num / Math.pow(10, i * 3);
            return '$' + Math.ceil(rawVal) + suffix;
        }

        const segmentsContainer = document.getElementById('wheel-segments-container');
        const wheelGraphic = document.querySelector('.fortune-wheel-graphic');
        if (segmentsContainer && wheelGraphic) {
            segmentsContainer.innerHTML = '';
            let currentAngle = 0;
            const colors = ['#dfab29', '#10b981', '#3b82f6', '#a855f7', '#ef4444', '#06b6d4'];
            let gradientString = 'conic-gradient(';

GAME_CONFIG.WHEEL_PRIZES.forEach((p, index) => {
            if (index >= 6) return;

            const sliceAngle = (p.weight / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;

            gradientString += `${colors[index]} ${startAngle}deg ${endAngle}deg${index === 5 ? '' : ', '}`;

            const seg = document.createElement('div');
            seg.className = `wheel-seg seg-${index + 1}`;

            const middleAngle = startAngle + (sliceAngle / 2);
            seg.style.transform = `rotate(${middleAngle}deg) translateY(-115px)`;

            let icon = '🎁';
            let text = '';

            if (p.type === 'cash') {
                icon = p.label === 'cash_small' ? '💰' : (p.label === 'cash_medium' ? '💵' : '💸');
                const eps = game.getEarningsPerSecond();
                const timeAmount = 3600 * eps * p.value;
                const pct = p.label === 'cash_big' ? 0.30 : (p.label === 'cash_medium' ? 0.20 : 0.10);
                const pctAmount = Math.round(game.state.cash * pct);
                text = `+${formatShortAmount(Math.max(timeAmount, pctAmount))}`;
            } else if (p.type === 'boost') {
                icon = '⚡';
                text = `+${p.value}h`;
            } else if (p.type === 'shares') {
                icon = '📈';
                const isSmall = (p.label === 'shares_1');
                let sharesAmount = Math.max(p.value, Math.floor((game.state.shares || 0) * (isSmall ? 0.25 : 0.50)));
                sharesAmount = Math.min(10000, sharesAmount);
                text = `+${sharesAmount >= 1000 ? (sharesAmount/1000)+'K' : sharesAmount}`;
            }

            const isNarrow = p.weight <= 5;
            const textSize = isNarrow ? '0.9rem' : '1.15rem';
            const iconSize = isNarrow ? '1.2rem' : '1.6rem';
            const gapSize = isNarrow ? '4px' : '6px';
            
            seg.innerHTML = `
                <div style="display:flex; flex-direction:row; align-items:center; gap:${gapSize}; transform: rotate(90deg); text-shadow: 1px 1px 4px rgba(0,0,0,0.8);">
                    <span style="font-size:${iconSize}; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.6));">${icon}</span>
                    <span dir="ltr" style="font-size:${textSize}; font-weight:900;">${text}</span>
                </div>
            `;
            segmentsContainer.appendChild(seg);
            currentAngle = endAngle;
        });
            
            gradientString += ')';
            wheelGraphic.style.background = gradientString;
        }

        if (spinBtn) {
            if (canSpin) {
                spinBtn.disabled = false;
                spinBtn.textContent = tObj.fortuneWheelSpinBtn || 'סובב!';
                if (cooldownEl) cooldownEl.style.display = 'none';
            } else {
                spinBtn.disabled = true;
                const hoursLeft = Math.floor(timeLeft / 3600000);
                const minsLeft = Math.floor((timeLeft % 3600000) / 60000);
                const hStr = hoursLeft.toString().padStart(2, '0');
                const mStr = minsLeft.toString().padStart(2, '0');
                const cdText = (tObj.fortuneWheelCooldown && tObj.fortuneWheelCooldown(hStr, mStr)) || `${hStr}:${mStr}`;
                spinBtn.textContent = cdText;
                if (cooldownEl) { cooldownEl.textContent = cdText; cooldownEl.style.display = 'block'; }
            }

            spinBtn.onclick = () => {
                if (spinBtn.disabled) return;
                initSound();

                const hintEl = document.getElementById('fortune-spin-hint');
                if (hintEl) hintEl.style.display = 'none';

                spinBtn.disabled = true;
                spinBtn.textContent = tObj.fortuneWheelSpinning || 'מסתובב...';

                const prizePool = GAME_CONFIG.WHEEL_PRIZES;
                const prize = _wheelWeightedRandom(prizePool);

                let currentAngle = 0;
                let targetAngle = 0;
                for (let i = 0; i < GAME_CONFIG.WHEEL_PRIZES.length; i++) {
                    const p = GAME_CONFIG.WHEEL_PRIZES[i];
                    const sliceAngle = (p.weight / 100) * 360;
                    if (p === prize) {
                        const minAngle = currentAngle + (sliceAngle * 0.1);
                        const maxAngle = currentAngle + (sliceAngle * 0.9);
                        const landedAngle = minAngle + Math.random() * (maxAngle - minAngle);
                        targetAngle = 360 - landedAngle;
                        break;
                    }
                    currentAngle += sliceAngle;
                }

                const wheelEl = document.getElementById('fortune-wheel-graphic');
                if (wheelEl) {
                    wheelEl.classList.remove('wheel-spin');
                    const totalRotation = 1800 + targetAngle;
                    wheelEl.style.setProperty('--stop-angle', `${totalRotation}deg`);
                    void wheelEl.offsetWidth;
                    wheelEl.classList.add('wheel-spin');
                }

                setTimeout(() => {
                    let prizeText = '';
                    const lang2 = (game.state && game.state.language) || 'en';
                    const tObj2 = translations[lang2] || translations.en;
                    const prizeLabel = (tObj2.wheelPrizes && tObj2.wheelPrizes[prize.label]) || prize.label;

                    if (prize.type === 'cash') {
                        const eps = game.getEarningsPerSecond();
                        const timeAmount = 3600 * eps * prize.value; // value is now 1 or 4 hours
                        const pctAmount = Math.round(game.state.cash * (prize.label === 'cash_small' ? 0.10 : (prize.label === 'cash_medium' ? 0.20 : 0.30)));
                        const amount = Math.max(timeAmount, pctAmount);
                        game.state.cash = Math.round((game.state.cash + amount + Number.EPSILON) * 100) / 100;
                        game.state.lifetimeCash = Math.round((game.state.lifetimeCash + amount + Number.EPSILON) * 100) / 100;
                        prizeText = `${prizeLabel}: +${formatMoney(amount)}`;
                        spawnFloating(`+${formatMoney(amount)}`, window.innerWidth / 2, window.innerHeight / 2 - 60, 'green');
                    } else if (prize.type === 'boost') {
                        game.addBoost2x(prize.value);
                        prizeText = `${prizeLabel}: +${prize.value}h BOOST`;
                        spawnFloating(`⚡ +${prize.value}h`, window.innerWidth / 2, window.innerHeight / 2 - 60, 'gold');
                    } else if (prize.type === 'gold' || prize.type === 'shares') {
                        const isSmall = (prize.label === 'gold_1' || prize.label === 'shares_1');
                        let sharesAmount = Math.max(prize.value, Math.floor((game.state.shares || 0) * (isSmall ? 0.25 : 0.50)));
                        sharesAmount = Math.min(10000, sharesAmount); // Max 10,000 per spin
                        game.state.shares = Math.min((game.state.shares || 0) + sharesAmount, 100000);
                        const sharesLabel = `+${sharesAmount}`;
                        prizeText = `${prizeLabel}: ${sharesLabel} ${tObj2.goldSharesLabel || 'Gold Shares'}`;

                        const icon = prize.type === 'gold' ? '🥇' : '📈';
                        spawnFloating(`${icon} ${sharesLabel}`, window.innerWidth / 2, window.innerHeight / 2 - 60, 'gold');
                    }

                    const wasAdSpin = adSpinGranted;
                    if (wasAdSpin) {
                        game.state.lastAdSpinTime = Date.now();
                        adSpinGranted = false;
                    } else {
                        game.state.lastSpinTime = Date.now();
                    }
                    game.saveGame();
                    updateFortuneWheelBtnState();
                    draw();
                    // Discovery tip: first fortune wheel spin
                    showDiscoveryTip('fortune');

                    if (resultEl) {
                        const titleText = (tObj2.fortuneWheelPrizeTitle || 'זכית ב') + ':';
                    resultEl.innerHTML = `
                        <div class="wheel-result-title">👑 ${titleText}</div>
                        <div class="wheel-result-prize-container">
                            <div class="laurel laurel-left">🌿</div>
                            <div class="wheel-result-prize">${prizeText}</div>
                            <div class="laurel laurel-right">🌿</div>
                        </div>
                    `;
                        resultEl.style.display = 'block';
                    }

                    const spinBtn2 = document.getElementById('fortune-spin-btn');
                    if (spinBtn2) {
                        const lastSpin2 = (game.state && game.state.lastSpinTime) || 0;
                        let newTimeLeft2 = 86400000 - (Date.now() - lastSpin2);
                        if (newTimeLeft2 < 0) newTimeLeft2 = 0;
                        const h2 = Math.floor(newTimeLeft2 / 3600000).toString().padStart(2, '0');
                        const m2 = Math.floor((newTimeLeft2 % 3600000) / 60000).toString().padStart(2, '0');
                        const cd2 = tObj2.fortuneWheelCooldown ? tObj2.fortuneWheelCooldown(h2, m2) : `${h2}:${m2}`;
                        spinBtn2.textContent = cd2;
                        if (cooldownEl) { cooldownEl.textContent = cd2; cooldownEl.style.display = 'block'; }
                    }

                    // Show ad-spin button immediately after ANY spin
                    const adSpinEl = document.getElementById('fortune-ad-spin-btn');
                    if (adSpinEl) {
                        adSpinEl.disabled = false;
                        adSpinEl.style.display = 'block';
                        adSpinEl.textContent = tObj2.fortuneWheelAdSpinBtn || '📺 סיבוב נוסף — צפה בפרסומת';
                    }
                }, 4000);
            };
        }

        // Ad spin button: visible on open if spin is on cooldown and ad spin available
        const adSpinBtn = document.getElementById('fortune-ad-spin-btn');
        if (adSpinBtn) {
            adSpinBtn.disabled = false;
            if (!canSpin) {
                adSpinBtn.style.display = 'block';
                adSpinBtn.textContent = tObj.fortuneWheelAdSpinBtn || '📺 סיבוב נוסף — צפה בפרסומת';
            } else {
                adSpinBtn.style.display = 'none';
            }

            adSpinBtn.onclick = () => {
                if (adSpinBtn.disabled) return;
                adSpinBtn.disabled = true;
                adSpinBtn.style.display = 'none';
                playAd(() => {
                    adSpinGranted = true;
                    const sp = document.getElementById('fortune-spin-btn');
                    if (sp) {
                        sp.disabled = false;
                        const lang3 = (game.state && game.state.language) || 'en';
                        const t3 = translations[lang3] || translations.en;
                        sp.textContent = t3.fortuneWheelSpinBtn || 'סובב!';
                    }
                    if (resultEl) resultEl.style.display = 'none';
                    if (cooldownEl) cooldownEl.style.display = 'none';
                    const hintEl2 = document.getElementById('fortune-spin-hint');
                    if (hintEl2) hintEl2.style.display = 'block';
                }, 'short');
            };
        }

        modal.classList.add('active');
        modal.onclick = (e) => {
            if (e.target === modal) {
                initSound();
                modal.classList.remove('active');
            }
        };

        const closeBtn = document.getElementById('fortune-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                initSound();
                modal.classList.remove('active');
            };
        }
    }
