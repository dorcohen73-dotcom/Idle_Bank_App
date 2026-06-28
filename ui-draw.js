(function(window) {
// Visual Drawing & Formatting Module for Idle Bank Empire

// LRU cache for SVG/HTML client portraits — Map preserves insertion order, giving O(1) lookup and eviction
var svgCache = new Map();
var activeCoins = [];
var TELLER_DOM_CACHE = {};
var prevQueueLength = -1;
var prevLastCustomerId = null;
var lastVaultPercent = -1;
var prevQueueLabelHtml = '';
var prevTellerCashHtml = {};
var prevVaultStatsHtml = '';
var prevTellerClientStates = {};
var prevGuardStates = {};
var lastCash = -1;
var lastEps = -1;
var lastShares = -1;
var lastMultiplier = -1;
var lastBranch = -1;
var lastLang = '';
var lastGuardStatusText = '';

// Module-scope statics — allocated once, reused every frame
var _guardAnimTriggers = [];
var _lastNotifMissions = null;
var _lastNotifUpgrades = null;
var _prestigePreviewTexts = {
    he: (val) => `אם תעשה Prestige עכשיו: +${val} מניות 🏅`,
    en: (val) => `Prestige now: +${val} shares 🏅`,
    es: (val) => `Prestigio ahora: +${val} acciones 🏅`,
    ru: (val) => `Престиж сейчас: +${val} акций 🏅`
};

function getVaultTargetRect() {
    let targetEl = DOM_CACHE.vaultGraphic;
    if (window.innerWidth <= 768) {
        const miniIcon = document.querySelector('.vault-mini-icon');
        if (miniIcon && window.getComputedStyle(miniIcon).display !== 'none') {
            targetEl = miniIcon;
        }
    }
    return targetEl ? targetEl.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0, x: 0, y: 0 };
}

var cachedSuffixes = ['', ' אלף', ' מיליון', ' מיליארד', ' טריליון', ' קוודריליון'];
var cachedFallback = ' מפלצתי';
var cachedLang = 'he';
var vaultFullToastShown = false;

function updateCachedSuffixes(lang) {
    cachedLang = lang || 'he';
    if (cachedLang === 'en') {
        cachedSuffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
        cachedFallback = ' monstrous';
    } else if (cachedLang === 'es') {
        cachedSuffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
        cachedFallback = ' monstruoso';
    } else if (cachedLang === 'ru') {
        cachedSuffixes = ['', ' тыс.', ' млн', ' млрд', ' трлн', ' квдрлн'];
        cachedFallback = ' огромное';
    } else {
        cachedSuffixes = ['', ' אלף', ' מיליון', ' מיליארד', ' טריליון', ' קוודריליון'];
        cachedFallback = ' מפלצתי';
    }
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Trigger reflow & animate
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function fastFormat(num, lang) {
    const separator = (lang === 'ru') ? ' ' : ',';
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
}

// Big numbers formatter
function formatMoney(num) {
    if (num === null || num === undefined || isNaN(num)) return '$0';
    if (num < 1000) {
        return '$' + fastFormat(Math.floor(num), cachedLang);
    }
    const i = Math.floor(Math.log10(num) / 3);
    const suffix = cachedSuffixes[i] !== undefined ? cachedSuffixes[i] : cachedFallback;
    const rawVal = num / Math.pow(10, i * 3);
    const formattedVal = parseFloat(rawVal.toFixed(2));
    return '$' + fastFormat(formattedVal, cachedLang) + suffix;
}

function getClientSVG(type, seed) {
    if (seed === undefined || seed === null || isNaN(seed)) {
        seed = 0;
    }
    if (!type) {
        type = 'normal';
    }
    
    const cleanType = type.replace(/[^a-zA-Z0-9]/g, '');
    const cacheKey = `${cleanType}_${seed}`;
    
    if (svgCache.has(cacheKey)) {
        // LRU: move to end by delete+re-set (Map preserves insertion order)
        const cached = svgCache.get(cacheKey);
        svgCache.delete(cacheKey);
        svgCache.set(cacheKey, cached);
        return cached;
    }

    // Choose which client portrait (1 to 10) to show based on client type and seed
    let imgNum = 1;
    if (type === 'rich') {
        imgNum = 9; // Rich client
    } else if (type === 'vip') {
        imgNum = 10; // VIP client
    } else {
        // Normal clients get 1 to 8 based on seed
        imgNum = (seed % 8) + 1;
    }
    
    let borderColor = 'rgba(255, 255, 255, 0.15)';
    let borderWidth = '1.5px';
    let glow = '';
    
    if (type === 'rich') {
        borderColor = 'rgba(251, 191, 36, 0.85)';
        borderWidth = '2px';
        glow = 'box-shadow: 0 0 8px rgba(251, 191, 36, 0.4);';
    } else if (type === 'vip') {
        borderColor = 'rgba(192, 132, 252, 0.85)';
        borderWidth = '2px';
        glow = 'box-shadow: 0 0 8px rgba(192, 132, 252, 0.4);';
    }
    
    const resultHtml = `
        <div style="position: absolute; inset: 0; border-radius: 50%; overflow: hidden; border: ${borderWidth} solid ${borderColor}; ${glow} background: #0c0f1d;">
            <img src="תמונות/client-${imgNum}.png" alt="Client" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
    `;
    
    if (svgCache.size >= GAME_CONFIG.SVG_CACHE_MAX_SIZE) {
        // Evict the oldest entry (first key in Map iteration order)
        svgCache.delete(svgCache.keys().next().value);
    }
    svgCache.set(cacheKey, resultHtml);
    
    return resultHtml;
}

// Unified floating text animator
var floatingTextPool = [];
const FLOATING_POOL_SIZE = 40;
var activeFloatingText = [];

function initFloatingPool() {
    const floatContainer = DOM_CACHE.floatingContainer || document.getElementById('floating-container');
    if (!floatContainer) return;
    
    for (let i = 0; i < FLOATING_POOL_SIZE; i++) {
        const div = document.createElement('div');
        div.className = 'floating-cash';
        div.style.cssText = 'display:none;opacity:0;will-change:transform,opacity;position:absolute;left:0;top:0;';
        floatContainer.appendChild(div);
        floatingTextPool.push({
            element: div,
            active: false
        });
    }
}

function getFloatingFromPool() {
    if (floatingTextPool.length === 0) initFloatingPool();
    for (let i = 0; i < floatingTextPool.length; i++) {
        if (!floatingTextPool[i].active) return floatingTextPool[i];
    }
    if (activeFloatingText.length > 0) {
        const oldest = activeFloatingText[0];
        activeFloatingText.shift();
        oldest.poolObj.active = false;
        oldest.element.style.display = 'none';
        return oldest.poolObj;
    }
    return floatingTextPool[0];
}

function spawnFloating(text, x, y, type = 'gold', fontSize = null) {
    const floatObj = getFloatingFromPool();
    if (!floatObj) return;
    floatObj.active = true;
    const div = floatObj.element;

    let colorStr = type;
    if (type === 'gold') colorStr = 'var(--primary-gold)';
    else if (type === 'red' || type === 'danger') colorStr = 'var(--danger-red)';
    else if (type === 'green' || type === 'money') colorStr = 'var(--green-light)';

    div.innerText = text;

    activeFloatingText.push({
        poolObj: floatObj,
        element: div,
        startX: x,
        startY: y,
        colorStr: colorStr,
        fontSize: fontSize || '1.2rem',
        progress: 0,
        duration: 1.2
    });
}

function updateFloatingText(dt) {
    for (let i = activeFloatingText.length - 1; i >= 0; i--) {
        const f = activeFloatingText[i];
        f.progress += dt;
        const t = Math.min(1.0, f.progress / f.duration);
        
        const easeT = 1 - Math.pow(1 - t, 3);
        const currentY = f.startY - easeT * 50;
        
        let opacity = 1;
        if (t < 0.15) opacity = t / 0.15;
        else if (t > 0.7) opacity = 1 - ((t - 0.7) / 0.3);
        
        f.element.style.cssText = `transform:translate3d(${f.startX}px,${currentY}px,0) scale(${1 + (1-easeT)*0.2});opacity:${opacity};display:block;color:${f.colorStr};font-size:${f.fontSize || '1.2rem'};will-change:transform,opacity;position:absolute;left:0;top:0;`;
        
        if (t >= 1.0) {
            f.element.style.display = 'none';
            f.poolObj.active = false;
            activeFloatingText.splice(i, 1);
        }
    }
}

// updateActiveCoins handles updating all coin animations per tick (requestAnimationFrame) to prevent memory leaks and setTimeout issues when backgrounded.
var coinPool = [];
const COIN_POOL_SIZE = 120;

function initCoinPool() {
    const floatContainer = DOM_CACHE.floatingContainer || document.getElementById('floating-container');
    if (!floatContainer) return;
    
    for (let i = 0; i < COIN_POOL_SIZE; i++) {
        const coin = document.createElement('div');
        coin.className = 'flying-coin';
        coin.style.cssText = 'display:none;opacity:0;will-change:transform,opacity;';
        floatContainer.appendChild(coin);
        coinPool.push({
            element: coin,
            active: false
        });
    }
}

function getCoinFromPool() {
    if (coinPool.length === 0) {
        initCoinPool();
    }
    for (let i = 0; i < coinPool.length; i++) {
        if (!coinPool[i].active) {
            return coinPool[i];
        }
    }
    if (activeCoins.length > 0) {
        const oldestCoin = activeCoins[0];
        activeCoins.shift();
        oldestCoin.poolObj.active = false;
        oldestCoin.element.style.display = 'none';
        return oldestCoin.poolObj;
    }
    return coinPool[0];
}

function clearActiveCoins() {
    activeCoins.forEach(c => {
        c.element.style.display = 'none';
        c.element.style.opacity = '0';
        if (c.poolObj) {
            c.poolObj.active = false;
        }
    });
    activeCoins.length = 0;
}

function updateActiveCoins(dt) {
    const floatContainer = DOM_CACHE.floatingContainer || document.getElementById('floating-container');
    if (!floatContainer) return;

    for (let i = activeCoins.length - 1; i >= 0; i--) {
        const c = activeCoins[i];
        
        if (c.delay > 0) {
            c.delay -= dt;
            if (c.delay <= 0) {
                c.element.style.cssText = `transform:translate3d(${c.startX}px,${c.startY}px,0);opacity:1;display:block;position:absolute;left:0;top:0;`;
            }
            continue;
        }
        
        c.progress += dt;
        const t = Math.min(1.0, c.progress / c.duration);
        const easeT = t * (2 - t);
        
        const currentX = c.startX + (c.endX - c.startX) * easeT;
        const arcY = -c.arcHeight * Math.sin(t * Math.PI);
        const currentY = c.startY + (c.endY - c.startY) * easeT + arcY;
        
        let transformStr = "";
        let opacity = 1.0 - t * 0.65;
        
        if (c.type === 'particle') {
            const spin = c.randomPhase * 40 + t * 360;
            const scale = 1.0 - t * 0.8;
            transformStr = `scale(${scale}) rotate(${spin}deg)`;
            opacity = 1.0 - Math.pow(t, 2);
        } else if (c.type === 'cash') {
            const wiggle = Math.sin(t * Math.PI * 4.5 + c.randomPhase) * 22;
            transformStr = `scale(${1.2 - t * 0.25}) rotate(${wiggle}deg)`;
        } else {
            const spin = c.randomPhase * 40 + t * 480;
            transformStr = `scale(${1.1 - t * 0.25}) rotate(${spin}deg)`;
        }
        
        c.element.style.cssText = `transform:translate3d(${currentX}px,${currentY}px,0) ${transformStr};opacity:${opacity};display:block;position:absolute;left:0;top:0;will-change:transform,opacity;`;
        
        if (t >= 1.0) {
            c.element.style.cssText = 'display:none;opacity:0;';
            c.poolObj.active = false;
            if (c.isLast && !c.playedSound) {
                c.playedSound = true;
                if (c.type === 'cash') {
                    window.gameAudio.playChaChing();
                }
            }
            activeCoins.splice(i, 1);
        }
    }
}

function spawnParticles(x, y, count = 10, type = 'gold') {
    const floatContainer = DOM_CACHE.floatingContainer || document.getElementById('floating-container');
    if (!floatContainer) return;
    if (coinPool.length === 0) initCoinPool();

    for (let i = 0; i < count; i++) {
        const coinObj = getCoinFromPool();
        if (!coinObj) continue;
        coinObj.active = true;
        const coin = coinObj.element;
        coin.innerText = type === 'star' ? '✨' : (type === 'sparkle' ? '🌟' : '💰');
        coin.style.display = 'none';

        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 80;
        
        activeCoins.push({
            poolObj: coinObj,
            element: coin,
            startX: x,
            startY: y,
            endX: x + Math.cos(angle) * distance,
            endY: y + Math.sin(angle) * distance,
            duration: 0.6 + Math.random() * 0.4,
            progress: 0,
            delay: 0,
            type: 'particle',
            isLast: false,
            playedSound: true,
            arcHeight: -20 + Math.random() * 40,
            randomPhase: Math.random() * Math.PI * 2
        });
    }
}

function animateCoins(fromRect, toRect, count = 6, type = 'coin') {
    const floatContainer = DOM_CACHE.floatingContainer || document.getElementById('floating-container');
    if (!floatContainer) return;

    if (coinPool.length === 0) {
        initCoinPool();
    }

    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    for (let i = 0; i < count; i++) {
        const coinObj = getCoinFromPool();
        if (!coinObj) continue;

        coinObj.active = true;
        const coin = coinObj.element;
        coin.innerText = type === 'cash' ? '💵' : '🪙';
        coin.style.display = 'none';
        coin.style.opacity = '0';

        const offsetX = (Math.random() - 0.5) * 35;
        const offsetY = (Math.random() - 0.5) * 35;

        activeCoins.push({
            poolObj: coinObj,
            element: coin,
            startX: startX,
            startY: startY,
            endX: endX + offsetX,
            endY: endY + offsetY,
            duration: 0.65,
            progress: 0,
            delay: i * 0.04,
            type: type,
            isLast: i === count - 1,
            playedSound: false,
            arcHeight: 60 + Math.random() * 80,
            randomPhase: Math.random() * Math.PI * 2
        });
    }
}

// Create & cache Teller DOM containers
function rebuildTellersDOM() {
    const lang = game.state.language || 'he';
    DOM_CACHE.tellersZone.innerHTML = '';
    DOM_CACHE.tellersZone.className = `tellers-zone count-${game.state.tellers.length}`;
    
    // Reset cached teller elements
    for (let id = 0; id < 4; id++) {
        delete TELLER_DOM_CACHE[id];
    }
    
    game.state.tellers.forEach(t => {
        const div = document.createElement('div');
        div.id = `teller-node-${t.id}`;
        div.className = `teller-counter ${t.unlocked ? 'active' : 'locked'}`;
        div.setAttribute('data-id', t.id);
        
        if (t.unlocked) {
            div.innerHTML = `
                <div class="glass-showcase">
                    <img class="teller-bg-img" src="תמונות/teller-${(t.id % 8) + 1}.png?v=20260626" alt="" />
                    <div class="client-slot-3d" id="teller-client-${t.id}" title="${translations[lang].servingClientLabel}"></div>
                </div>
                <div class="gold-plaque">
                    <div class="plaque-header">
                        <span class="plaque-title">${translations[lang].tellerLabel} ${t.id + 1}</span>
                        <span class="plaque-level${t.level >= 10 ? ' milestone-active' : ''}" id="teller-lvl-lbl-${t.id}">${translations[lang].levelLabel} ${t.level}</span>
                    </div>
                    <div class="plaque-body">
                        <div class="plaque-cash" id="teller-cash-${t.id}">$0</div>
                        <button class="plaque-collect-btn" id="teller-collect-${t.id}">${translations[lang].collectShortLabel}</button>
                    </div>
                    <div class="plaque-progress-container">
                        <div class="plaque-progress-fill" id="teller-progress-${t.id}"></div>
                    </div>
                </div>
            `;

            // Cache DOM elements for Game Loop performance optimization
            TELLER_DOM_CACHE[t.id] = {
                node: div,
                progress: div.querySelector(`#teller-progress-${t.id}`),
                cash: div.querySelector(`#teller-cash-${t.id}`),
                lvl: div.querySelector(`#teller-lvl-lbl-${t.id}`),
                collect: div.querySelector(`#teller-collect-${t.id}`),
                client: div.querySelector(`#teller-client-${t.id}`),
                lastPercent: -1,
                lastLevel: -1,
                lastCollectDisabled: null,
                lastVaultFullAlert: null
            };

            // Handle manual process start if NO manager
            div.addEventListener('click', (e) => {
                if (e.target.className !== 'collect-btn') {
                    initSound();
                    game.clickTeller(t.id);
                }
            });

            // Handle manual desk collect
            const collectBtn = div.querySelector(`#teller-collect-${t.id}`);
            collectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                initSound();
                const collected = game.collectTellerCash(t.id);
                if (collected > 0) {
                    const rectBtn = collectBtn.getBoundingClientRect();
                    const rectVault = getVaultTargetRect();
                    animateCoins(rectBtn, rectVault, 6, 'coin');
                    spawnFloating('+' + formatMoney(collected), rectBtn.left + rectBtn.width/2, rectBtn.top, 'green');
                }
            });
        } else {
            const cost = game.tellerUnlockCosts[t.id];
            div.innerHTML = `
                <div class="lock-info">
                    <div class="lock-icon">🔒</div>
                    <div style="font-size:0.8rem; margin-bottom: 0.15rem;">${translations[lang].unlockLabel}</div>
                    <div class="lock-cost">${formatMoney(cost)}</div>
                </div>
            `;

            div.addEventListener('click', () => {
                initSound();
                if (game.unlockTeller(t.id)) {
                    rebuildTellersDOM();
                    renderUpgradesTab();
                }
            });
        }

        DOM_CACHE.tellersZone.appendChild(div);
    });
}

// Refresh UI values per tick
function draw() {
    const lang = game.state.language || 'he';
    const tObj = translations[lang];
    const vaultData = game.getVaultRenderData();

    if (game.cheatWarning) {
        game.cheatWarning = false;
        showToast(tObj.cheatDetectedMsg || "⚠️ Save editing detected!", 'danger');
    }

    // Upper stats bar with caching to prevent Forced Reflows
    if (game.state.cash !== lastCash || lang !== lastLang) {
        lastCash = game.state.cash;
        DOM_CACHE.cash.innerText = formatMoney(game.state.cash);
        if (typeof window.checkPrestigeTip === 'function') window.checkPrestigeTip();
    }
    
    const currentEps = game.getEarningsPerSecond();
    if (currentEps !== lastEps || lang !== lastLang) {
        lastEps = currentEps;
        DOM_CACHE.eps.innerText = formatMoney(currentEps);
    }
    
    if (game.state.shares !== lastShares || lang !== lastLang) {
        lastShares = game.state.shares;
        DOM_CACHE.shares.innerText = game.state.shares.toLocaleString();
    }
    
    const mult = game.getTotalMultiplier();
    if (mult !== lastMultiplier || lang !== lastLang) {
        lastMultiplier = mult;
        DOM_CACHE.multiplier.innerText = fastFormat(parseFloat(mult.toFixed(1)), cachedLang) + 'x';
    }

    // Ad Boost UI logic
    if (DOM_CACHE.btnWatchAd && DOM_CACHE.adBoostTimer) {
        if (game.state.boost2xTimeLeft > 0) {
            DOM_CACHE.btnWatchAd.classList.add('hidden');
            DOM_CACHE.adBoostTimer.classList.remove('hidden');
            
            const hours = Math.floor(game.state.boost2xTimeLeft / 3600);
            const minutes = Math.floor((game.state.boost2xTimeLeft % 3600) / 60);
            const seconds = Math.floor(game.state.boost2xTimeLeft % 60);
            
            const hStr = hours < 10 ? '0' + hours : hours;
            const mStr = minutes < 10 ? '0' + minutes : minutes;
            const sStr = seconds < 10 ? '0' + seconds : seconds;
            
            DOM_CACHE.adBoostTimer.innerText = `${tObj.timeLeftLabel || 'Remaining'}: ${hStr}:${mStr}:${sStr}`;
        } else {
            DOM_CACHE.btnWatchAd.classList.remove('hidden');
            DOM_CACHE.adBoostTimer.classList.add('hidden');
        }
    }
    
    if (game.state.currentBranch !== lastBranch || lang !== lastLang) {
        lastBranch = game.state.currentBranch;
        DOM_CACHE.branchName.innerText = (tObj.bankPrefix || '') + tObj.branches.names[game.state.currentBranch];
    }
    
    lastLang = lang;
    
    // Refresh advertising campaign dynamic display state
    if (DOM_CACHE.advSlider) {
        const maxBudget = game.getAdMaxBudget();
        const budget = game.state.advBudget || 0;
        if (budget === 0) {
            DOM_CACHE.advSlider.value = 0;
        } else {
            DOM_CACHE.advSlider.value = Math.round(1000 * (budget / maxBudget));
        }
        
        const maxLabelEl = DOM_CACHE.advLimitMax;
        if (maxLabelEl) {
            maxLabelEl.innerText = formatMoney(maxBudget);
        }
    }
    updateAdvDisplay(game.state.advBudget || 0);

    // Refresh 2x Boost display
    if (DOM_CACHE.boostBtn) {
        if (game.state.boost2xTimeLeft && game.state.boost2xTimeLeft > 0) {
            DOM_CACHE.boostBtn.innerText = tObj.boostActive(formatTime(game.state.boost2xTimeLeft));
            DOM_CACHE.boostBtn.setAttribute('data-time', formatTime(game.state.boost2xTimeLeft));
            DOM_CACHE.boostBtn.classList.add('active');
            DOM_CACHE.boostBtn.classList.remove('offer');
        } else {
            DOM_CACHE.boostBtn.removeAttribute('data-time');
            const nowMs = Date.now();
            const offerEnd = window._boostOfferEndTime || 0;
            if (offerEnd > nowMs) {
                const offerSec = Math.ceil((offerEnd - nowMs) / 1000);
                const boostOfferFn = tObj.boostOfferText;
                DOM_CACHE.boostBtn.innerText = typeof boostOfferFn === 'function'
                    ? boostOfferFn(formatTime(offerSec))
                    : `⚡ OFFER! ${formatTime(offerSec)}`;
                DOM_CACHE.boostBtn.classList.add('offer');
                DOM_CACHE.boostBtn.classList.remove('active');
            } else {
                DOM_CACHE.boostBtn.innerText = tObj.boostBtn || "⚡ BOOST x2";
                DOM_CACHE.boostBtn.classList.remove('active', 'offer');
            }
        }
    }

    // Update customer queue count display and visual status indicators (Premium Redesign)
    const capLabel = DOM_CACHE.queueCapLabel;
    const fillBar  = DOM_CACHE.queueFillBar;
    const statText = DOM_CACHE.queueStatText;
    const statIcon = DOM_CACHE.queueStatIcon;
    const elQueueZone = DOM_CACHE.queueZone;
    
    if (capLabel) {
        const queueData = game.getQueueRenderData();
        const maxCap = queueData.capacity;
        const currentLen = queueData.currentLen;
        
        capLabel.textContent = `${currentLen}/${maxCap}`;
        
        if (fillBar) {
            const pct = Math.min(100, Math.max(0, (currentLen / maxCap) * 100));
            fillBar.style.width = `${pct}%`;
        }
        
        const isTooLow = currentLen <= 1;
        const isTooHigh = currentLen >= maxCap - 1 || currentLen / maxCap >= 0.8;
        
        if (isTooLow) {
            if (elQueueZone) {
                elQueueZone.classList.remove('status-ok');
                elQueueZone.classList.add('status-alert');
            }
            if (statText) statText.textContent = tObj.alertQueueEmpty;
            if (statIcon) {
                statIcon.textContent = '❕';
                statIcon.style.color = 'var(--danger-red)';
            }
        } else if (isTooHigh) {
            if (elQueueZone) {
                elQueueZone.classList.remove('status-ok');
                elQueueZone.classList.add('status-alert');
            }
            const spotsLeft = maxCap - currentLen;
            if (statText) statText.textContent = tObj.alertQueueAlmostFull ? tObj.alertQueueAlmostFull(spotsLeft) : spotsLeft + ' left';
            if (statIcon) {
                statIcon.textContent = '❕';
                statIcon.style.color = 'var(--danger-red)';
            }
        } else {
            if (elQueueZone) {
                elQueueZone.classList.remove('status-alert');
                elQueueZone.classList.add('status-ok');
            }
            if (statText) statText.textContent = tObj.alertQueueOk;
            if (statIcon) {
                statIcon.textContent = '✔';
                statIcon.style.color = 'var(--money-green)';
            }
        }
    }

    // Removed customer line rendering logic per user request

    // Tellers loading bars & values
    game.state.tellers.forEach(t => {
        if (!t.unlocked) return;

        const tCache = TELLER_DOM_CACHE[t.id];
        if (!tCache) return;

        const tNode = tCache.node;
        const progressFill = tCache.progress;
        const cashLabel = tCache.cash;
        const lvlLabel = tCache.lvl;
        const collectBtn = tCache.collect;

        if (tNode) {
            const tData = game.getTellerRenderData(t.id);
            if (lvlLabel && tData.level !== tCache.lastLevel) {
                lvlLabel.innerText = `${tObj.levelLabel} ${tData.level}`;
                if (tData.level >= 10) {
                    lvlLabel.classList.add('milestone-active');
                } else {
                    lvlLabel.classList.remove('milestone-active');
                }
                tCache.lastLevel = tData.level;
            }

            if (tData.isProcessing) {
                tNode.classList.add('processing');
                if (tData.progressPercent !== tCache.lastPercent) {
                    tCache.lastPercent = tData.progressPercent;
                    if (progressFill) progressFill.style.transform = `scaleX(${tData.progressPercent / 100})`;
                }
            } else {
                tNode.classList.remove('processing');
                if (tCache.lastPercent !== 0) {
                    tCache.lastPercent = 0;
                    if (progressFill) progressFill.style.transform = 'scaleX(0)';
                }
            }

            if (cashLabel) {
                let cashIcons = '';
                if (tData.cashStored > 0) {
                    if (tData.fillPercent >= 80) {
                        cashIcons = '💵💵💵 ';
                    } else if (tData.fillPercent >= 40) {
                        cashIcons = '💵💵 ';
                    } else {
                        cashIcons = '💵 ';
                    }
                }
                const newCashHtml = `<span style="font-size:0.9rem; margin-left:0.25rem;">${cashIcons}</span>${formatMoney(tData.cashStored)}`;
                if (prevTellerCashHtml[tData.id] !== newCashHtml) {
                    cashLabel.innerHTML = newCashHtml;
                    prevTellerCashHtml[tData.id] = newCashHtml;
                }
            }

            const clientSlot = tCache.client;
            if (clientSlot) {
                const cacheKey = `${tData.id}:${tData.isProcessing}:${tData.customerType}:${tData.customerSeed}`;
                if (prevTellerClientStates[tData.id] !== cacheKey) {
                    if (tData.isProcessing) {
                        clientSlot.classList.add('active');
                        const _t = tData.customerType || 'normal';
                        const _s = (tData.customerSeed === undefined || tData.customerSeed === null || isNaN(tData.customerSeed)) ? 0 : tData.customerSeed;
                        const _n = (_t === 'rich') ? 9 : (_t === 'vip') ? 10 : ((_s % 8) + 1);
                        clientSlot.style.setProperty('background-image', `url('תמונות/client-${_n}.png')`, 'important');
                        clientSlot.style.setProperty('background-size', 'cover', 'important');
                        clientSlot.style.setProperty('background-position', 'center top', 'important');
                        clientSlot.innerHTML = '';

                        // VIP & Rich serving glow effects — batch read then write
                        tNode.classList.remove('vip-serving-glow', 'rich-serving-glow');
                        if (tData.customerType === 'vip') {
                            tNode.classList.add('vip-serving-glow');
                            const rect = tNode.getBoundingClientRect();
                            spawnFloating('★ VIP ★', rect.left + rect.width / 2, rect.top + 20, 'rgba(192, 132, 252, 1)');
                        } else if (tData.customerType === 'rich') {
                            tNode.classList.add('rich-serving-glow');
                            const rect = tNode.getBoundingClientRect();
                            spawnFloating('$$ RICH $$', rect.left + rect.width / 2, rect.top + 20, 'rgba(251, 191, 36, 1)');
                        }
                    } else {
                        clientSlot.classList.remove('active');
                        clientSlot.innerHTML = '<div class="idle-zzz">Zzz</div>';
                        clientSlot.style.removeProperty('background-image');
                        clientSlot.style.removeProperty('background-size');
                        clientSlot.style.removeProperty('background-position');
                        tNode.classList.remove('vip-serving-glow', 'rich-serving-glow');
                    }
                    prevTellerClientStates[tData.id] = cacheKey;
                }
            }

            const isFull = tData.fillPercent >= 100;
            if (isFull !== tCache.lastVaultFullAlert) {
                if (isFull) {
                    tNode.classList.add('vault-full-alert');
                } else {
                    tNode.classList.remove('vault-full-alert');
                }
                tCache.lastVaultFullAlert = isFull;
            }

            if (collectBtn) {
                const vaultSpace = vaultData.capacity - vaultData.cashStored;
                const isDisabled = tData.cashStored <= 0 || vaultSpace <= 0;
                if (isDisabled !== tCache.lastCollectDisabled) {
                    if (isDisabled) {
                        collectBtn.classList.add('disabled');
                    } else {
                        collectBtn.classList.remove('disabled');
                    }
                    tCache.lastCollectDisabled = isDisabled;
                }
            }
        }
    });

    // Security guards rendering
    const unlockedGuards = game.state.guards.filter(g => g.unlocked);
    if (unlockedGuards.length > 0) {
        DOM_CACHE.securityPath.style.display = 'flex';
        
        // Hide old static avatar and load
        if (DOM_CACHE.guardAvatar) DOM_CACHE.guardAvatar.style.display = 'none';
        if (DOM_CACHE.guardLoad) DOM_CACHE.guardLoad.style.display = 'none';

        // Reconciliation: remove extra guard-runner elements
        const currentGuardIds = unlockedGuards.map(g => g.id.toString());
        const existingRunners = Array.from(DOM_CACHE.securityPath.querySelectorAll('.guard-runner'));
        existingRunners.forEach(node => {
            const gid = node.getAttribute('data-guard-id');
            if (!currentGuardIds.includes(gid)) {
                DOM_CACHE.securityPath.removeChild(node);
            }
        });

        // Sync and render each unlocked guard
        unlockedGuards.forEach(g => {
            const gData = game.getGuardRenderData(g.id);
            if (!gData) return;

            let runner = DOM_CACHE.securityPath.querySelector(`.guard-runner[data-guard-id="${gData.id}"]`);
            if (!runner) {
                runner = document.createElement('div');
                runner.className = 'guard-runner';
                runner.setAttribute('data-guard-id', gData.id);
                runner.style.willChange = 'transform';

                const avatarEl = document.createElement('div');
                avatarEl.className = 'guard-runner-avatar';
                
                runner.appendChild(avatarEl);

                const loadEl = document.createElement('div');
                loadEl.className = 'guard-runner-load';
                runner.appendChild(loadEl);

                DOM_CACHE.securityPath.appendChild(runner);
            }

            // Stagger position and height to create a convoy/row effect so guards don't overlap
            let visualPosition = gData.position;
            const isMovingToTeller = gData.state.startsWith('moving_to_teller_');
            const isCollecting = gData.state.startsWith('collecting_from_teller_');

            if (isMovingToTeller) {
                visualPosition = Math.max(0, gData.position - (gData.id * 0.07));
            } else if (gData.state === 'moving_to_vault') {
                visualPosition = Math.min(1.0, gData.position + (gData.id * 0.07));
            } else if (gData.state === 'idle' || gData.state === 'depositing') {
                visualPosition = gData.position + (gData.id * 0.04);
            } else if (isCollecting) {
                visualPosition = gData.position - (gData.id * 0.04);
            }

            const percentRight = 10 + (visualPosition * 75);
            const isLtr = document.documentElement.dir === 'ltr';
            if (isLtr) {
                runner.style.right = '';
                runner.style.left = `${percentRight}%`;
            } else {
                runner.style.left = '';
                runner.style.right = `${percentRight}%`;
            }
            // Vertical offset to avoid overlapping
            runner.style.top = `calc(50% + ${(gData.id - 1) * 12}px)`;

            // Clean previous state and direction classes
            runner.className = 'guard-runner';
            runner.classList.add(`state-${gData.state}`);
            if (isMovingToTeller) runner.classList.add('state-moving_to_tellers');
            if (isCollecting) runner.classList.add('state-collecting');

            if (isMovingToTeller) {
                runner.classList.add('moving-left');
            } else if (gData.state === 'moving_to_vault') {
                runner.classList.add('moving-right');
            }

            // Update avatar text (empty since we use background image)
            const avatarEl = runner.querySelector('.guard-runner-avatar');
            // Removed innerText clearing to preserve emoji fallback

            // Update load label bubble above
            const loadEl = runner.querySelector('.guard-runner-load');
            const loadText = gData.loadedCash > 0 ? formatMoney(gData.loadedCash) : '';
            if (loadEl.innerText !== loadText) {
                loadEl.innerText = loadText;
                loadEl.style.display = gData.loadedCash > 0 ? 'block' : 'none';
            }
        });

        // Update security status label based on the active runner
        const firstMoving = unlockedGuards.find(g => {
            const gData = game.getGuardRenderData(g.id);
            return gData && gData.state !== 'idle';
        });
        const activeGuard = firstMoving || unlockedGuards[0];
        const activeData = activeGuard ? game.getGuardRenderData(activeGuard.id) : null;
        const tObjGuard = translations[lang].guardStates;
        if (DOM_CACHE.guardStatus && activeData) {
            const unlockedCount = unlockedGuards.length;
            const totalCount = game.state.guards.length;
            
            // Map the language-specific singular/plural label (from locales.js)
            const tObjLang = translations[lang];
            const courierLabel = unlockedCount > 1
                ? (tObjLang.guardsLabel || "Couriers")
                : (tObjLang.guardLabel || "Courier");
            
            // Get raw state text
            let stateText = tObjGuard[activeData.state] || tObjGuard.idle;
            
            // Clean up redundant subjects if they exist at the beginning of the translation state text
            if (lang === 'he') {
                stateText = stateText.replace(/^(בלדר|שומר)\s+/, '');
            } else if (lang === 'en') {
                stateText = stateText.replace(/^Guard\s+/, '');
            } else if (lang === 'es') {
                stateText = stateText.replace(/^Guardia\s+/, '');
            } else if (lang === 'ru') {
                stateText = stateText.replace(/^(Охранник|Инкассатор)\s+/, '');
            }
            
            // Capitalize first letter if necessary (English/Spanish)
            if (lang === 'en' || lang === 'es') {
                stateText = stateText.charAt(0).toUpperCase() + stateText.slice(1);
            }
            
            const newGuardStatusText = `${courierLabel} (${unlockedCount}/${totalCount}): ${stateText}`;
            if (lastGuardStatusText !== newGuardStatusText) {
                DOM_CACHE.guardStatus.innerText = newGuardStatusText;
                lastGuardStatusText = newGuardStatusText;
            }
        }
    } else {
        DOM_CACHE.securityPath.style.display = 'none';
    }

    // Dynamic Coin animations for parallel guards - Batched Reads/Writes to avoid layout reflows
    _guardAnimTriggers.length = 0;

    game.state.guards.forEach((g, idx) => {
        if (!g.unlocked) return;
        const gData = game.getGuardRenderData(g.id);
        if (!gData) return;
        const prevState = prevGuardStates[idx];
        if (prevState !== gData.state) {
            _guardAnimTriggers.push({
                g,
                gData,
                idx,
                prevState
            });
        }
    });

    if (_guardAnimTriggers.length > 0) {
        // Step 1: Batch all DOM Reads (getBoundingClientRect)
        const reads = [];
        _guardAnimTriggers.forEach(item => {
            const { g, gData, prevState } = item;
            const prevIsMoving = prevState && prevState.startsWith('moving_to_teller_');
            const currIsCollecting = gData.state.startsWith('collecting_from_teller_');

            if (prevIsMoving && currIsCollecting) {
                const runner = DOM_CACHE.securityPath.querySelector(`.guard-runner[data-guard-id="${g.id}"]`);
                const rectGuard = runner ? runner.getBoundingClientRect() : (DOM_CACHE.guardAvatar ? DOM_CACHE.guardAvatar.getBoundingClientRect() : null);
                
                const tellerRects = [];
                game.state.tellers.forEach(t => {
                    const tData = game.getTellerRenderData(t.id);
                    if (tData && tData.unlocked && tData.cashStored > 0) {
                        const tCache = TELLER_DOM_CACHE[t.id];
                        const tNode = tCache ? tCache.node : null;
                        if (tNode) {
                            tellerRects.push({
                                node: tNode
                            });
                        }
                    }
                });
                
                reads.push({
                    type: 'collecting',
                    g,
                    rectGuard,
                    tellers: tellerRects.map(tInfo => ({
                        rect: tInfo.node.getBoundingClientRect()
                    }))
                });
            } else if (prevState === 'moving_to_vault' && gData.state === 'depositing') {
                const runner = DOM_CACHE.securityPath.querySelector(`.guard-runner[data-guard-id="${g.id}"]`);
                const rectGuard = runner ? runner.getBoundingClientRect() : (DOM_CACHE.guardAvatar ? DOM_CACHE.guardAvatar.getBoundingClientRect() : null);
                const rectVault = getVaultTargetRect();
                
                reads.push({
                    type: 'depositing',
                    g,
                    rectGuard,
                    rectVault
                });
            }
        });

        // Step 2: Batch all DOM Writes (triggering animations)
        reads.forEach(read => {
            if (read.type === 'collecting') {
                if (read.rectGuard) {
                    read.tellers.forEach(tInfo => {
                        animateCoins(tInfo.rect, read.rectGuard, 4, 'coin');
                    });
                }
            } else if (read.type === 'depositing') {
                if (read.rectGuard && read.rectVault) {
                    animateCoins(read.rectGuard, read.rectVault, 6, 'coin');
                }
            }
        });

        // Update previous state cache
        _guardAnimTriggers.forEach(item => {
            prevGuardStates[item.idx] = item.gData.state;
        });
    }

    // Vault fill bar
    const vPercent = vaultData.fillPercent;
    const vCap = vaultData.capacity;
    
    if (vPercent !== lastVaultPercent) {
        lastVaultPercent = vPercent;
        if (DOM_CACHE.vaultFill) DOM_CACHE.vaultFill.style.width = `${vPercent}%`;
        // עדכון vault mini bar ב-portrait mode
        if (typeof window.updateVaultMiniBar === 'function') {
            window.updateVaultMiniBar(vPercent, vaultData.cashStored > 0, vaultData.cashStored, vaultData.capacity, vaultData.yieldPerHour);
        }
    }
    
    if (vPercent >= 95) {
        if (DOM_CACHE.vaultGraphic) DOM_CACHE.vaultGraphic.classList.add('vault-full');
        if (!vaultFullToastShown) {
            showToast(tObj.vaultFullMsg || "Vault is full — empty it", 'danger');
            vaultFullToastShown = true;
        }
    } else {
        if (DOM_CACHE.vaultGraphic) DOM_CACHE.vaultGraphic.classList.remove('vault-full');
        vaultFullToastShown = false;
    }

    if (vaultData.cashStored >= vCap) {
        if (DOM_CACHE.vaultFill) DOM_CACHE.vaultFill.classList.add('full');
        if (DOM_CACHE.vaultGraphic) DOM_CACHE.vaultGraphic.classList.add('full');
    } else {
        if (DOM_CACHE.vaultFill) DOM_CACHE.vaultFill.classList.remove('full');
        if (DOM_CACHE.vaultGraphic) DOM_CACHE.vaultGraphic.classList.remove('full');
    }

    const newVaultStatsHtml = `
        <div>
            <span class="vault-current-value">${formatMoney(vaultData.cashStored)}</span> / <span class="vault-limit-label">${formatMoney(vCap)}</span>
        </div>
    `;
    if (prevVaultStatsHtml !== newVaultStatsHtml) {
        if (DOM_CACHE.vaultStats) DOM_CACHE.vaultStats.innerHTML = newVaultStatsHtml;
        prevVaultStatsHtml = newVaultStatsHtml;
    }

    // Update new premium elements: capacity label, yield per hour, progress label
    const elVaultCapValue = DOM_CACHE.vaultCapValue;
    if (elVaultCapValue) {
        const newCapText = formatMoney(vCap);
        if (elVaultCapValue.innerText !== newCapText) {
            elVaultCapValue.innerText = newCapText;
        }
    }

    const elVaultYieldValue = DOM_CACHE.vaultYieldValue;
    if (elVaultYieldValue) {
        const newYieldText = `+${formatMoney(vaultData.yieldPerHour)}`;
        if (elVaultYieldValue.innerText !== newYieldText) {
            elVaultYieldValue.innerText = newYieldText;
        }
    }

    const elVaultProgressLabel = DOM_CACHE.vaultProgressLabel;
    if (elVaultProgressLabel) {
        const progressLabelFn = tObj.vaultProgressLabel;
        const newProgressText = typeof progressLabelFn === 'function' ? progressLabelFn(vPercent) : `${vPercent}%`;
        if (elVaultProgressLabel.innerText !== newProgressText) {
            elVaultProgressLabel.innerText = newProgressText;
        }
    }

    if (DOM_CACHE.vaultEmptyBtn) {
        if (vaultData.cashStored <= 0) {
            DOM_CACHE.vaultEmptyBtn.classList.add('disabled');
        } else {
            DOM_CACHE.vaultEmptyBtn.classList.remove('disabled');
        }
    }

    // Update prestige buttons state visually
    const branchTab = DOM_CACHE.tabBranches;
    if (branchTab && branchTab.classList.contains('active')) {
        const currentCanPrestige = game.state.cash >= game.branches[game.state.currentBranch].minCashToPrestige;
        const prestigeBtns = branchTab.querySelectorAll('.prestige-btn');
        const prestigeReq = game.branches[game.state.currentBranch].minCashToPrestige;
        prestigeBtns.forEach(btn => {
            if (currentCanPrestige) {
                btn.classList.remove('disabled');
                btn.removeAttribute('disabled');
                btn.innerText = tObj.branches.sellAndBuild;
            } else {
                btn.classList.add('disabled');
                btn.setAttribute('disabled', 'true');
                btn.innerText = tObj.branches.minCash(formatMoney(prestigeReq));
            }
        });
    }

    // Update prestige shares preview (_prestigePreviewTexts is defined at module scope)
    const pendingShares = game.calculatePrestigeShares();
    const previewEl = DOM_CACHE.prestigePreviewLabel;
    if (previewEl) {
        const textFn = _prestigePreviewTexts[cachedLang] || _prestigePreviewTexts.he;
        previewEl.innerText = textFn(pendingShares);
    }

    // Dynamic vault visual progression
    const vaultImg = DOM_CACHE.vaultDoorImg;
    if (vaultImg) {
        if (vaultData.level >= 50) {
            vaultImg.style.filter = 'drop-shadow(0 0 20px gold) hue-rotate(45deg) brightness(1.2)';
            vaultImg.style.transform = 'scale(1.05)';
        } else if (vaultData.level >= 25) {
            vaultImg.style.filter = 'drop-shadow(0 0 10px silver) brightness(1.1)';
            vaultImg.style.transform = 'scale(1.02)';
        } else {
            vaultImg.style.filter = 'none';
            vaultImg.style.transform = 'scale(1)';
        }
    }

    updateNotifications();
}

function updateTabDot(tabId, show) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (!btn) return;
    let dot = btn.querySelector('.notification-dot');
    if (show) {
        if (!dot) {
            dot = document.createElement('div');
            dot.className = 'notification-dot';
            btn.style.position = 'relative';
            btn.appendChild(dot);
        }
    } else {
        if (dot) dot.remove();
    }
    
    // Also update bottom nav if it exists
    const bottomBtn = document.querySelector(`.bottom-nav-btn[data-tab="${tabId}"]`);
    if (bottomBtn) {
        let bottomDot = bottomBtn.querySelector('.notification-dot');
        if (show) {
            if (!bottomDot) {
                bottomDot = document.createElement('div');
                bottomDot.className = 'notification-dot';
                bottomBtn.style.position = 'relative';
                bottomBtn.appendChild(bottomDot);
            }
        } else {
            if (bottomDot) bottomDot.remove();
        }
    }
}

function updateNotifications() {
    let hasMissions = false;
    if (game.state.missions) {
        for (let i=0; i<game.state.missions.length; i++) {
            if (game.state.missions[i].status === 'completed') {
                hasMissions = true;
                break;
            }
        }
    }
    
    let hasUpgrades = false;
    if (game.state.cash > 0) {
        if (game.state.cash >= game.getVaultUpgradeCost()) hasUpgrades = true;
        else if (game.state.cash >= game.getQueueUpgradeCost()) hasUpgrades = true;
        else {
            for (let i=0; i<game.state.tellers.length; i++) {
                if (game.state.tellers[i].unlocked && game.state.cash >= game.getTellerUpgradeCost(game.state.tellers[i].id)) {
                    hasUpgrades = true; break;
                }
            }
            if (!hasUpgrades) {
                for (let i=0; i<game.state.guards.length; i++) {
                    if (game.state.guards[i].unlocked && game.state.cash >= game.getGuardUpgradeCost(game.state.guards[i].id)) {
                        hasUpgrades = true; break;
                    }
                }
            }
        }
    }

    if (hasMissions !== _lastNotifMissions) {
        _lastNotifMissions = hasMissions;
        updateTabDot('missions', hasMissions);
    }
    if (hasUpgrades !== _lastNotifUpgrades) {
        _lastNotifUpgrades = hasUpgrades;
        updateTabDot('upgrades', hasUpgrades);
    }
}

    // Exports
    window.updateCachedSuffixes = updateCachedSuffixes;
    window.showToast = showToast;
    window.fastFormat = fastFormat;
    window.formatMoney = formatMoney;
    window.getClientSVG = getClientSVG;
    window.spawnFloating = spawnFloating;
    window.updateActiveCoins = updateActiveCoins;
    window.animateCoins = animateCoins;
    window.rebuildTellersDOM = rebuildTellersDOM;
    window.draw = draw;
    window.clearActiveCoins = clearActiveCoins;
    window.activeCoins = activeCoins;
})(window);

