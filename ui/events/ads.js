import { resetBoostOfferTimer } from './main-loop.js';

let soundInitialized = false;
let contextualBannerShown = false;
let contextualOfferTimeout = null;

export var AdService = {
    _isShowing: false,
    lastWatchedAt: 0,
    AD_OFFER_COOLDOWN_MS: 7 * 60 * 1000,
    adMobAvailable: false,
    _currentCallback: null,
    
    isInCooldown: function() {
        return AdService.lastWatchedAt > 0 &&
            (Date.now() - AdService.lastWatchedAt) < AdService.AD_OFFER_COOLDOWN_MS;
    },
    
    initAdMob: async function() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
            try {
                await window.Capacitor.Plugins.AdMob.initialize({
                    requestTrackingAuthorization: true
                });
                AdService.adMobAvailable = true;
                
                // Add listeners
                window.Capacitor.Plugins.AdMob.addListener('rewardedVideoAdReward', () => {
                    if (AdService._currentCallback) {
                        AdService._currentCallback();
                        AdService._currentCallback = null;
                    }
                    AdService.lastWatchedAt = Date.now();
                    resetBoostOfferTimer();
                });
                
                window.Capacitor.Plugins.AdMob.addListener('rewardedVideoAdDismissed', () => {
                    AdService._isShowing = false;
                    AdService._currentCallback = null;
                    AdService.prepareAd();
                });

                await AdService.prepareAd();
            } catch (e) {
                console.error('AdMob init failed', e);
            }
        }
    },
    
    prepareAd: async function() {
        if (!AdService.adMobAvailable) return;
        try {
            await window.Capacitor.Plugins.AdMob.prepareRewardVideoAd({
                adId: "ca-app-pub-1189054329275307/1609550976",
                isTesting: false
            });
        } catch (e) {
            console.error('Failed to prepare ad', e);
        }
    },

    show: async function(callback) {
        if (AdService._isShowing) return;
        AdService._isShowing = true;

        if (AdService.adMobAvailable) {
            try {
                AdService._currentCallback = callback;
                await window.Capacitor.Plugins.AdMob.showRewardVideoAd();
                return; // The listeners will handle completion and reward
            } catch (e) {
                console.error("AdMob show failed, falling back to mock:", e);
                AdService._isShowing = false;
                AdService._currentCallback = null;
                // Fall through to mock ad
            }
        }

        // --- FALLBACK MOCK AD (For Web / Errors) ---
        AdService._isShowing = true;
        let interval = null;
        let settled = false;

        const removeOverlay = () => {
            const el = document.querySelector('.ad-playing-overlay');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        };

        const complete = (grantReward) => {
            if (settled) return;
            settled = true;
            if (interval) clearInterval(interval);
            AdService._isShowing = false;
            removeOverlay();
            if (grantReward) {
                AdService.lastWatchedAt = Date.now();
                resetBoostOfferTimer();
                if (callback) callback();
            }
        };

        setTimeout(() => complete(true), 15000);

        try {
            const overlay = document.createElement('div');
            overlay.className = 'ad-playing-overlay';

            const lang = (window.game && window.game.state && window.game.state.language) || 'en';
            const tObj = translations[lang] || translations['he'];
            const titleText = tObj.adTitle || 'Watching Sponsored Ad...';
            const subtitleText = tObj.adSubtitle || 'Reward unlocks in:';
            const closeText = tObj.adCloseBtn || 'Close ❌ (No Reward)';

            overlay.innerHTML = `
                <div class="ad-playing-box" style="position: relative;">
                    <button class="ad-close-btn" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.4); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; z-index: 10;">${closeText}</button>
                    <div class="ad-spinner-container">
                        <div class="ad-spinner-outer"></div>
                        <div class="ad-spinner-inner"></div>
                        <div class="ad-countdown">5</div>
                    </div>
                    <h2 style="font-size:1.3rem; margin-top:1rem;">${titleText}</h2>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${subtitleText}</p>
                </div>
            `;
            document.body.appendChild(overlay);

            let timeLeft = 5;
            interval = setInterval(() => {
                timeLeft--;
                const countdownEl = overlay.querySelector('.ad-countdown');
                if (countdownEl) countdownEl.innerText = timeLeft;

                if (timeLeft <= 0) {
                    complete(true);
                }
            }, 1000);

            const closeBtn = overlay.querySelector('.ad-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => complete(false));
            }
        } catch (err) {
            console.error("AdService failed to display:", err);
            complete(true);
        }
    }
};

// Initialize AdMob asynchronously
setTimeout(() => AdService.initAdMob(), 1000);

export function playAd(callback) {
    AdService.show(callback);
}

export function formatTime(sec) {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function updateAdvDisplay(budget) {
    if (!DOM_CACHE.advDisplay) return;
    const lang = game.state.language || 'en';
    const tObj = translations[lang];
    if (budget === 0) {
        DOM_CACHE.advDisplay.innerText = tObj.advValueOff;
        DOM_CACHE.advDisplay.classList.remove('insufficient');
    } else {
        DOM_CACHE.advDisplay.innerText = formatMoney(budget) + tObj.perMinute;
        if (!game.state.advActive) {
            DOM_CACHE.advDisplay.innerText += tObj.advSuspended;
            DOM_CACHE.advDisplay.classList.add('insufficient');
        } else {
            DOM_CACHE.advDisplay.classList.remove('insufficient');
        }
    }
}

export function updateMuteButton() {
    if (!DOM_CACHE.muteBtn) return;
    const lang = window.gameLanguage || 'en';
    const tObj = translations[lang] || translations.en;
    const isMuted = window.gameAudio ? window.gameAudio.isMuted : true;
    if (isMuted) {
        DOM_CACHE.muteBtn.innerText = '🔇';
        DOM_CACHE.muteBtn.title = tObj.unmute;
        DOM_CACHE.muteBtn.setAttribute('aria-label', tObj.unmute);
        DOM_CACHE.muteBtn.classList.add('muted');
    } else {
        DOM_CACHE.muteBtn.innerText = '🔊';
        DOM_CACHE.muteBtn.title = tObj.mute;
        DOM_CACHE.muteBtn.setAttribute('aria-label', tObj.mute);
        DOM_CACHE.muteBtn.classList.remove('muted');
    }
}

export function initSound() {
    if (!soundInitialized) {
        if (window.gameAudio && typeof window.gameAudio.init === 'function') {
            window.gameAudio.init();
            if (!window.gameAudio.isMuted && typeof window.gameAudio.startMusic === 'function') {
                window.gameAudio.startMusic();
            }
        }
        soundInitialized = true;
    }
}

export function showContextualAdBanner() {
    if (AdService.isInCooldown()) return;
    if (game.state.boost2xTimeLeft > 0) return;
    if (document.querySelector('.modal-overlay.active')) return;
    if (contextualBannerShown) return;

    const lang = (game.state && game.state.language) || 'en';
    const existing = document.getElementById('contextual-offer-banner');
    if (existing) existing.remove();

    const tObj = translations[lang] || translations.en;
    const msg = tObj.boostMilestoneMsg || '🎉 Cash milestone! Activate x2 boost?';

    const banner = document.createElement('div');
    banner.id = 'contextual-offer-banner';
    banner.innerHTML = `
        <span style="font-size:0.82rem; color:var(--text-main); flex:1;">${msg}</span>
        <button id="ctx-offer-yes" style="background:var(--primary-gold,#dfab29); color:#000; border:none; padding:0.28rem 0.7rem; border-radius:8px; font-size:0.78rem; cursor:pointer; font-weight:700; white-space:nowrap;">${tObj.ctxWatchBtn || '🎬 Watch'}</button>
        <button id="ctx-offer-no" style="background:transparent; border:1px solid var(--border-color,rgba(255,255,255,0.1)); color:var(--text-muted,#9ca3af); padding:0.28rem 0.5rem; border-radius:8px; font-size:0.78rem; cursor:pointer;">✕</button>
    `;
    Object.assign(banner.style, {
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        position: 'fixed', bottom: '70px', left: '0', right: '0', margin: '0 auto',
        background: 'var(--surface-color,rgba(20,24,36,0.95))',
        border: '1px solid var(--primary-gold,#dfab29)',
        borderRadius: '12px', padding: '0.65rem 0.85rem',
        zIndex: '2000', maxWidth: '340px', width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'slideUpIn 0.3s ease'
    });

    document.body.appendChild(banner);
    contextualBannerShown = true;

    const removeBanner = () => {
        if (banner.parentNode) banner.remove();
        contextualBannerShown = false;
        if (contextualOfferTimeout) clearTimeout(contextualOfferTimeout);
    };

    document.getElementById('ctx-offer-yes').addEventListener('click', () => {
        initSound();
        removeBanner();
        playAd(() => {
            game.addBoost2x(2);
            draw();
            spawnFloating(tObj.boostActivatedMsg || '⚡ Boost x2 activated!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    document.getElementById('ctx-offer-no').addEventListener('click', () => {
        initSound();
        removeBanner();
    });

    contextualOfferTimeout = setTimeout(removeBanner, 9000);
}
