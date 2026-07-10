(function(window) {
// UI Events & main loop module for Idle Bank Empire

var soundInitialized = false;
var autoSaveTimer = 0;
var eventTimer = 0;
var tabRefreshTimer = 0;
var fortuneWheelBtnTimer = 0;
var contextualOfferTimeout = null;
var contextualBannerShown = false;
var boostOfferEndTime = 0;
var boostOfferNextTime = 0;
var drawTimer = 0;

// Focus trap: map from modal element -> keydown handler, for clean removal on close
var _focusTrapHandlers = new Map();

function _getFocusableElements(container) {
    return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.closest('[hidden]') && el.offsetParent !== null);
}

function trapFocus(modal) {
    if (_focusTrapHandlers.has(modal)) return; // already trapped
    const handler = function(e) {
        if (e.key !== 'Tab') return;
        const focusable = _getFocusableElements(modal);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };
    _focusTrapHandlers.set(modal, handler);
    modal.addEventListener('keydown', handler);
    // Move focus to first focusable element inside modal
    const focusable = _getFocusableElements(modal);
    if (focusable.length > 0) focusable[0].focus();
}

function releaseFocus(modal) {
    const handler = _focusTrapHandlers.get(modal);
    if (!handler) return;
    modal.removeEventListener('keydown', handler);
    _focusTrapHandlers.delete(modal);
}

function applyLanguage(lang) {
    window.gameLanguage = lang;
    if (typeof updateCachedSuffixes === 'function') {
        updateCachedSuffixes(lang);
    }
    document.documentElement.dir = (lang === 'he') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    const pageTitles = {
        he: 'אימפריית הבנקים - משחק Idle Bank יוקרתי',
        en: 'Bank Empire - Premium Idle Game',
        es: 'Imperio Bancario - Juego Idle Premium',
        ru: 'Банковская Империя - Премиум Idle Игра'
    };
    document.title = pageTitles[lang] || pageTitles.he;

    const metaDescriptions = {
        he: 'הפוך מטייקון מתחיל למנהל אימפריית בנקים עולמית. משחק קליל וממכר עם גרפיקה יוקרתית, שדרוגים, מנהלים וסניפים ברחבי העולם!',
        en: 'Go from a starting tycoon to the manager of a global bank empire. An easy and addictive game with premium graphics, upgrades, managers, and branches worldwide!',
        es: 'Pasa de ser un magnate principiante a dirigir un imperio bancario global. ¡Un juego fácil y adictivo con gráficos premium, mejoras, gerentes y sucursales en todo el mundo!',
        ru: 'Пройдите путь от начинающего магната до управляющего глобальной банковской империей. Легкая и захватывающая игра с премиальной графикой, улучшениями, менеджерами и филиалами по всему миру!'
    };
    const metaDescEl = document.querySelector('meta[name="description"]');
    if (metaDescEl) {
        metaDescEl.setAttribute('content', metaDescriptions[lang] || metaDescriptions.he);
    }
    
    const tObj = translations[lang];
    if (!tObj) return;

    if (DOM_CACHE.appTitle) DOM_CACHE.appTitle.innerText = tObj.appName;
    if (DOM_CACHE.labelCash) DOM_CACHE.labelCash.innerText = tObj.cashLabel;
    if (DOM_CACHE.labelPerSecond) DOM_CACHE.labelPerSecond.innerText = tObj.perSecond;
    if (DOM_CACHE.labelShares) DOM_CACHE.labelShares.innerText = tObj.sharesLabel;
    if (DOM_CACHE.labelMultiplier) DOM_CACHE.labelMultiplier.innerText = tObj.multiplier;
    if (DOM_CACHE.labelSimulatorTitle) DOM_CACHE.labelSimulatorTitle.innerText = tObj.simulatorTitle;
    if (DOM_CACHE.labelPanelBadge) DOM_CACHE.labelPanelBadge.innerText = tObj.activeFlow;
    if (DOM_CACHE.labelAdvTitle) DOM_CACHE.labelAdvTitle.innerText = tObj.advTitle;
    if (DOM_CACHE.labelAdvLimitOff) DOM_CACHE.labelAdvLimitOff.innerText = tObj.advValueOff;
    if (DOM_CACHE.labelVaultTitle) DOM_CACHE.labelVaultTitle.innerText = tObj.vaultTitle;
    if (DOM_CACHE.labelVaultLoading) DOM_CACHE.labelVaultLoading.innerText = tObj.vaultLoading;
    if (DOM_CACHE.vaultEmptyBtn) DOM_CACHE.vaultEmptyBtn.innerText = tObj.collectVault;
    if (DOM_CACHE.labelVaultSubtitle) DOM_CACHE.labelVaultSubtitle.innerText = tObj.vaultSubtitle;
    if (DOM_CACHE.labelVaultYieldTitle) DOM_CACHE.labelVaultYieldTitle.innerText = tObj.vaultYieldTitle;
    if (DOM_CACHE.labelVaultYieldSub) DOM_CACHE.labelVaultYieldSub.innerText = tObj.vaultYieldSub;
    if (DOM_CACHE.labelVaultCapTitle) DOM_CACHE.labelVaultCapTitle.innerText = tObj.vaultCapLabel || tObj.vaultCap;
    if (DOM_CACHE.labelVaultVolumeTitle) DOM_CACHE.labelVaultVolumeTitle.innerText = tObj.vaultVolume;
    if (DOM_CACHE.labelCollectVaultBtn) DOM_CACHE.labelCollectVaultBtn.innerText = tObj.collectVault;
    
    const updateTabLabel = (btn, text) => {
        if (!btn) return;
        const lbl = btn.querySelector('.tab-label');
        const cleanText = text.replace(/🏆|📅|📆/g, '').trim();
        if (lbl) lbl.innerText = cleanText;
        else btn.innerText = cleanText;
    };
    
    updateTabLabel(DOM_CACHE.tabBtnUpgrades, tObj.tabUpgrades);
    updateTabLabel(DOM_CACHE.tabBtnManagers, tObj.tabManagers);
    updateTabLabel(DOM_CACHE.tabBtnDepartments, tObj.tabDepartments);
    updateTabLabel(DOM_CACHE.tabBtnMissions, tObj.tabMissions);
    updateTabLabel(DOM_CACHE.tabBtnBranches, tObj.tabBranches);

    // Update bottom nav labels
    const bnavMap = {
        'upgrades':    tObj.tabUpgrades,
        'managers':    tObj.tabManagers,
        'departments': tObj.tabDepartments,
        'missions':    tObj.tabMissions,
        'daily':       tObj.dailyTabBtn,
        'branches':    tObj.tabBranches
    };
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        const lbl = btn.querySelector('.bnav-label');
        if (lbl && bnavMap[btn.dataset.tab]) {
            const cleanLbl = bnavMap[btn.dataset.tab].replace(/🏆|📅|📆/g, '').trim();
            lbl.textContent = cleanLbl;
            btn.setAttribute('aria-label', cleanLbl);
        }
    });
    if (DOM_CACHE.bottomNav) DOM_CACHE.bottomNav.setAttribute('aria-label', tObj.bottomNavLabel || 'Bottom navigation');
    
    const tabBtnDaily = document.getElementById('tab-btn-daily');
    if (tObj.dailyTabBtn) updateTabLabel(tabBtnDaily, tObj.dailyTabBtn);
    
    if (DOM_CACHE.labelFooter) {
        const flavorEl = document.getElementById('footer-flavor');
        if (flavorEl) {
            const flavors = tObj.footer_flavors;
            if (flavors && flavors.length) {
                if (window._footerFlavorInterval) clearInterval(window._footerFlavorInterval);
                let fi = 0;
                flavorEl.textContent = flavors[fi];
                window._footerFlavorInterval = setInterval(function() {
                    fi = (fi + 1) % flavors.length;
                    flavorEl.textContent = flavors[fi];
                }, 8000);
            } else {
                flavorEl.textContent = tObj.footerText;
            }
        } else {
            DOM_CACHE.labelFooter.innerText = tObj.footerText;
        }
    }
    if (DOM_CACHE.bulkLabelText) {
        DOM_CACHE.bulkLabelText.innerText = tObj.bulkLabel;
    }

    if (DOM_CACHE.offlineModalTitle) DOM_CACHE.offlineModalTitle.innerText = tObj.offlineModalTitle;
    if (DOM_CACHE.offlineModalText) DOM_CACHE.offlineModalText.innerText = tObj.offlineModalText;
    if (DOM_CACHE.offlineModalDoubleBtn) DOM_CACHE.offlineModalDoubleBtn.innerText = tObj.offlineDoubleBtn;
    if (DOM_CACHE.offlineModalClaimBtn) DOM_CACHE.offlineModalClaimBtn.innerText = tObj.offlineClaimBtn;
    
    if (DOM_CACHE.langModalTitle) DOM_CACHE.langModalTitle.innerText = tObj.langModalTitle;
    if (DOM_CACHE.langModalText) DOM_CACHE.langModalText.innerText = tObj.langModalText;
    if (DOM_CACHE.langModalClose) DOM_CACHE.langModalClose.innerText = tObj.langModalClose;
    
    if (DOM_CACHE.settingsDangerTitle) {
        const base = (tObj.dangerZoneTitle || 'אזור מסוכן').replace('⚠️', '').trim();
        DOM_CACHE.settingsDangerTitle.innerHTML = `${base} <span aria-hidden="true">⚠️</span>`;
    }
    if (DOM_CACHE.settingsThemeTitle) DOM_CACHE.settingsThemeTitle.innerText = tObj.themeTitle || 'בחר צבע רקע';
    if (DOM_CACHE.resetBtn) {
        const base = (tObj.resetGameBtn || 'איפוס משחק מוחלט').replace('⚠️', '').trim();
        DOM_CACHE.resetBtn.innerHTML = `<span aria-hidden="true">⚠️</span> ${base}`;
    }
    if (DOM_CACHE.resetConfirmLabel) DOM_CACHE.resetConfirmLabel.innerText = tObj.resetConfirmLabel || 'I confirm full reset';

    const gdprTextEl = document.getElementById('gdpr-text');
    if (gdprTextEl) gdprTextEl.innerText = tObj.gdprText || 'Your data is stored on your device only.';
    const gdprAcceptEl = document.getElementById('gdpr-accept-btn');
    if (gdprAcceptEl) gdprAcceptEl.innerText = tObj.gdprAcceptBtn || 'Got it ✓';
    const gdprPrivacyLinkEl = document.getElementById('gdpr-privacy-link');
    if (gdprPrivacyLinkEl) gdprPrivacyLinkEl.innerText = tObj.privacyPolicyLink || '🔒 Privacy Policy';
    const settingsPrivacyLink = document.getElementById('settings-privacy-link');
    if (settingsPrivacyLink) settingsPrivacyLink.innerText = tObj.privacyPolicyLink || '🔒 Privacy Policy';

    const elLangOptions = document.querySelectorAll('.lang-option-card');
    elLangOptions.forEach(opt => {
        if (opt.getAttribute('data-lang') === lang) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });

    const activeTabEl = document.querySelector('.tab-btn.active');
    const activeTab = activeTabEl ? activeTabEl.getAttribute('data-tab') : 'upgrades';
    if (typeof window.invalidateTabHashes === 'function') window.invalidateTabHashes();
    if (activeTab === 'upgrades' && typeof window.renderUpgradesTab === 'function') window.renderUpgradesTab();
    else if (activeTab === 'managers' && typeof window.renderManagersTab === 'function') window.renderManagersTab();
    else if (activeTab === 'departments' && typeof window.renderDepartmentsTab === 'function') window.renderDepartmentsTab();
    else if (activeTab === 'missions' && typeof window.renderMissionsTab === 'function') window.renderMissionsTab();
    else if (activeTab === 'branches' && typeof window.renderBranchesTab === 'function') window.renderBranchesTab();
    else if (activeTab === 'daily') {
        if (typeof window.renderDailyChallengesSection === 'function') window.renderDailyChallengesSection();
        if (typeof window.renderAchievementsTab === 'function') window.renderAchievementsTab();
    }

    if (DOM_CACHE.labelAdvControl) DOM_CACHE.labelAdvControl.title = tObj.tooltips.adv;
    if (DOM_CACHE.securityPath) {
        DOM_CACHE.securityPath.title = tObj.tooltips.guard;
        DOM_CACHE.securityPath.setAttribute('aria-label', tObj.tooltips.guard);
    }
    if (DOM_CACHE.vaultGraphic) {
        DOM_CACHE.vaultGraphic.title = tObj.tooltips.vault;
        DOM_CACHE.vaultGraphic.setAttribute('aria-label', tObj.tooltips.vault);
    }
    if (DOM_CACHE.vaultGraphicLabel) DOM_CACHE.vaultGraphicLabel.innerText = tObj.vaultBankLabel || 'BANK';
    if (DOM_CACHE.vaultMiniLabel) DOM_CACHE.vaultMiniLabel.innerText = tObj.vaultMiniLabel || 'Vault';
    if (DOM_CACHE.cashLiveBadge) DOM_CACHE.cashLiveBadge.innerText = tObj.cashLiveBadge || '● LIVE';
    // splashSubtitle override removed to keep splash screen in English
    if (DOM_CACHE.skipLink) DOM_CACHE.skipLink.innerText = tObj.skipLinkText || 'Skip to content';
    if (DOM_CACHE.analyticsBtn) {
        DOM_CACHE.analyticsBtn.title = tObj.analyticsBtnTitle || 'Metrics & Analytics';
        DOM_CACHE.analyticsBtn.setAttribute('aria-label', tObj.analyticsBtnTitle || 'Metrics & Analytics');
    }
    if (DOM_CACHE.boostBtn) {
        DOM_CACHE.boostBtn.title = tObj.boostBtnTitle || '2x Income Booster';
        DOM_CACHE.boostBtn.setAttribute('aria-label', tObj.boostBtnTitle || '2x Income Booster');
    }
    if (DOM_CACHE.vaultInfoBtn) {
        DOM_CACHE.vaultInfoBtn.title = tObj.vaultInfoBtnTitle || 'Vault interest info';
        DOM_CACHE.vaultInfoBtn.setAttribute('aria-label', tObj.vaultInfoBtnTitle || 'Vault interest info');
    }
    if (DOM_CACHE.fortuneWheelBtn) {
        DOM_CACHE.fortuneWheelBtn.title = tObj.fortuneWheelTitle || 'Daily Fortune Wheel';
        DOM_CACHE.fortuneWheelBtn.setAttribute('aria-label', tObj.fortuneWheelTitle || 'Daily Fortune Wheel');
    }
    if (DOM_CACHE.langBtn) DOM_CACHE.langBtn.setAttribute('aria-label', tObj.langModalTitle || 'Settings & Language');
    if (DOM_CACHE.vaultMiniBtn) {
        DOM_CACHE.vaultMiniBtn.innerText = tObj.vaultMiniCollectBtn || '💰 Collect';
        DOM_CACHE.vaultMiniBtn.setAttribute('aria-label', tObj.tooltips.vault);
    }
    if (DOM_CACHE.doubleIncomeLabel) DOM_CACHE.doubleIncomeLabel.innerText = tObj.doubleIncomeLabel || 'Double Income';
    if (DOM_CACHE.analyticsFromSettingsBtn) DOM_CACHE.analyticsFromSettingsBtn.innerText = tObj.analyticsShortcutBtn || '📊 Analytics Summary';
    if (DOM_CACHE.footerPrivacyLink) DOM_CACHE.footerPrivacyLink.innerText = tObj.footerPrivacyLink || 'Privacy Policy';
    if (DOM_CACHE.controlPanelSection) DOM_CACHE.controlPanelSection.setAttribute('aria-label', tObj.controlPanelLabel || 'Control Panel & Upgrades');
    if (DOM_CACHE.controlPanelSrHeading) DOM_CACHE.controlPanelSrHeading.innerText = tObj.controlPanelLabel || 'Control Panel & Upgrades';
    if (DOM_CACHE.tabsNav) DOM_CACHE.tabsNav.setAttribute('aria-label', tObj.tabsNavLabel || 'Internal navigation menu');
    if (DOM_CACHE.vaultEmptyBtn) DOM_CACHE.vaultEmptyBtn.setAttribute('aria-label', tObj.collectVault);
    if (DOM_CACHE.cash) DOM_CACHE.cash.setAttribute('aria-label', tObj.cashLabel);
    if (DOM_CACHE.vaultMiniIcon) DOM_CACHE.vaultMiniIcon.setAttribute('alt', tObj.vaultMiniLabel || 'Vault');
    if (DOM_CACHE.vaultMiniFillEl) DOM_CACHE.vaultMiniFillEl.setAttribute('aria-label', tObj.vaultMiniFillLabel || 'Side vault fill');
    if (DOM_CACHE.bankFloorSection) DOM_CACHE.bankFloorSection.setAttribute('aria-label', tObj.bankFloorLabel || 'Bank branch view');
    if (DOM_CACHE.queueFillBar) DOM_CACHE.queueFillBar.setAttribute('aria-label', tObj.queueAriaLabel || 'Customer queue');
    if (DOM_CACHE.advSlider) DOM_CACHE.advSlider.setAttribute('aria-label', tObj.advSliderLabel || 'Ad campaign budget');

    updateMuteButton();
    rebuildTellersDOM();
    draw();
}

function applyTheme(themeName) {
    const root = document.documentElement;
    if (themeName === 'white') {
        root.style.setProperty('--bg-color', '#faf9f6');
        root.style.setProperty('--surface-color', 'rgba(244, 242, 237, 0.92)');
        root.style.setProperty('--surface-hover', 'rgba(255, 255, 255, 0.98)');
        root.style.setProperty('--border-color', 'rgba(184, 134, 11, 0.25)');
        root.style.setProperty('--border-glow', 'rgba(184, 134, 11, 0.08)');
        root.style.setProperty('--text-main', '#2c2a25');
        root.style.setProperty('--text-muted', '#7a766a');
        root.style.setProperty('--glass-blur', 'blur(12px)');
        document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, rgba(212, 175, 55, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(250, 249, 246, 1) 0px, transparent 100%)';
    } else if (themeName === 'blue') {
        root.style.setProperty('--bg-color', '#080c1d');
        root.style.setProperty('--surface-color', 'rgba(13, 22, 54, 0.78)');
        root.style.setProperty('--surface-hover', 'rgba(20, 32, 75, 0.92)');
        root.style.setProperty('--border-color', 'rgba(223, 171, 41, 0.22)');
        root.style.setProperty('--border-glow', 'rgba(223, 171, 41, 0.12)');
        root.style.setProperty('--text-main', '#f3f4f6');
        root.style.setProperty('--text-muted', '#9ca3af');
        root.style.setProperty('--glass-blur', 'blur(16px)');
        document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, rgba(223, 171, 41, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.06) 0px, transparent 50%)';
    } else {
        root.style.setProperty('--bg-color', '#06070a');
        root.style.setProperty('--surface-color', 'rgba(13, 15, 23, 0.82)');
        root.style.setProperty('--surface-hover', 'rgba(22, 25, 38, 0.95)');
        root.style.setProperty('--border-color', 'rgba(168, 85, 247, 0.35)');
        root.style.setProperty('--border-glow', 'rgba(223, 171, 41, 0.25)');
        root.style.setProperty('--text-main', '#f3f4f6');
        root.style.setProperty('--text-muted', '#9ca3af');
        root.style.setProperty('--glass-blur', 'blur(12px)');
        document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(223, 171, 41, 0.12) 0px, transparent 50%)';
    }
    
    document.querySelectorAll('.theme-option-btn-choice').forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    try {
        window.localStorage.setItem('idle_bank_theme', themeName);
    } catch (e) {
        console.warn('Could not save theme preference:', e);
    }
}

var AdService = {
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
                    boostOfferEndTime = 0;
                    if (window._boostOfferEndTime) window._boostOfferEndTime = 0;
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
                boostOfferEndTime = 0;
                window._boostOfferEndTime = 0;
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

function playAd(callback) {
    AdService.show(callback);
}

function formatTime(sec) {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function openPrestigeModal(target) {
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
    
    if (elTitle) elTitle.innerText = tObj.branches.names[target];
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

function openBoostModal() {
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

function openAnalyticsModal() {
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

const EVENT_HANDLERS = {
    crowd: handleCrowdEvent,
    security: handleSecurityEvent,
    rescue: handleRescueEvent,
    rush_hours: handleRushHoursEvent,
    investor: handleInvestorEvent,
    audit: handleAuditEvent,
    maintenance: handleMaintenanceEvent,
    power_outage: handlePowerOutageEvent,
    robbery_attempt: handleRobberyAttemptEvent,
    celebrity_visit: handleCelebrityVisitEvent,
    lottery_winner: handleLotteryWinnerEvent,
    competitor_news: handleCompetitorNewsEvent,
    economic_boom: handleEconomicBoomEvent,
    atm_malfunction: handleAtmMalfunctionEvent
};

function handleCrowdEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(500 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.02));
    
    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        game.triggerTempQueueBonus(15, 120000);
        game.triggerSpeedBoost(120, 2.0);
        eventModal.classList.remove('active');
        spawnFloating('CROWD MANAGED! +15 slots, 2x SPEED', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });
    
    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        game.shiftQueue(3);
        eventModal.classList.remove('active');
    });
    
    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            const reward = game.getCurrentBaseReward() * game.getTotalMultiplier() * 5.0;
            const clientsCount = Math.max(10, game.customerQueue.length);
            const totalGained = Math.round(reward * clientsCount * game.getEventBonusMultiplier());
            game.clearQueue();
            game.addCash(totalGained);
            spawnFloating(`+$${formatMoney(totalGained)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });
    
    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleSecurityEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1000 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.02));
    
    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        const bounty = Math.round(game.getEarningsPerSecond() * 300 * game.getEventBonusMultiplier());
        game.addCash(bounty);
        spawnFloating(`+$${formatMoney(bounty)} Reputation Bounty!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });
    
    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        if (Math.random() < 0.5) {
            const lost = Math.round(game.state.vault.cashStored * 0.10);
            game.deductVaultCash(lost);
            const msg = typeof tObj.securityBreachMsg === 'function' ? tObj.securityBreachMsg(formatMoney(lost)) : `Break-in occurred! You lost ${formatMoney(lost)} from the vault.`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, 'warning');
            } else {
                console.warn(msg);
            }
        } else {
            const payout = Math.round(game.state.cash * 0.05 * game.getEventBonusMultiplier());
            game.addCash(payout);
            const msg = typeof tObj.securityDefenseMsg === 'function' ? tObj.securityDefenseMsg(formatMoney(payout)) : `Security held the line! You received an insurance payout of ${formatMoney(payout)}.`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, 'success');
            }
            spawnFloating(`+$${formatMoney(payout)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        }
    });
    
    const securityGrant = Math.round(Math.max(5000 * Math.pow(6, game.state.currentBranch), game.getEarningsPerSecond() * 60, game.state.cash * 0.15)) * 3 * game.getEventBonusMultiplier();
    
    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc(formatMoney(securityGrant))}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.addCash(securityGrant);
            spawnFloating(`+$${formatMoney(securityGrant)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });
    
    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleRescueEvent(container, lang, tObj, eObj, eventModal) {
    const bailoutAmount = 15000 * Math.pow(6, game.state.currentBranch) * 3 * game.getEventBonusMultiplier();
    
    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn ad-option';
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(bailoutAmount))}</div>
        <div class="event-option-desc">${eObj.optADesc(formatMoney(bailoutAmount))}</div>
    `;
    btnA.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.addCash(bailoutAmount);
            spawnFloating(`+$${formatMoney(bailoutAmount)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });
    
    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
    });
    
    container.appendChild(btnA);
    container.appendChild(btnB);
}

function handleRushHoursEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1000 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.03));
    
    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        game.triggerSpeedBoost(120, 4.0);
        eventModal.classList.remove('active');
        spawnFloating('RUSH SPEED ACTIVATE! 4x SPEED', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });
    
    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
    });
    
    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.triggerSpeedBoost(120, 10.0);
            spawnFloating('TURBO 10x SPEED!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });
    
    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleInvestorEvent(container, lang, tObj, eObj, eventModal) {
    const cashVal = Math.round(Math.max(150, Math.round(game.getEarningsPerSecond() * 1200)) * game.getEventBonusMultiplier());

    let eligibleManagers = [];
    const newMgrKeys = ['customer', 'finance', 'operations', 'service', 'vip', 'marketing'];
    newMgrKeys.forEach(k => {
        if (game.state.managers[k] && game.state.managerUpgrades[k] && game.state.managerUpgrades[k].level < 5) {
            eligibleManagers.push(k);
        }
    });

    let chosenManager = null;
    if (eligibleManagers.length > 0) {
        chosenManager = eligibleManagers[Math.floor(Math.random() * eligibleManagers.length)];
    }

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn ad-option';
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cashVal))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.addCash(cashVal);
            spawnFloating(`+$${formatMoney(cashVal)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn ad-option';

    if (chosenManager !== null) {
        const nextLevel = game.state.managerUpgrades[chosenManager].level + 1;
        const mName = tObj.managers.names[chosenManager];
        btnB.innerHTML = `
            <div class="event-option-title">${eObj.optBUpgrade(mName, nextLevel)}</div>
            <div class="event-option-desc">${eObj.optBDesc}</div>
        `;
        btnB.addEventListener('click', () => {
            initSound();
            eventModal.classList.remove('active');
            playAd(() => {
                game.upgradeManagerLevelDirectly(chosenManager, nextLevel);
                spawnFloating(`${mName} UPGRADED to Lv ${nextLevel}!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
            });
        });
    } else {
        btnB.innerHTML = `
            <div class="event-option-title">${eObj.optBShares}</div>
            <div class="event-option-desc">${eObj.optBDesc}</div>
        `;
        btnB.addEventListener('click', () => {
            initSound();
            eventModal.classList.remove('active');
            playAd(() => {
                game.addShares(5);
                spawnFloating(`+5 GOLDEN SHARES!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
            });
        });
    }

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

// ===== 9 NEW EVENT HANDLERS =====

function handleAuditEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(800 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.03));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        spawnFloating(tObj.auditCleanMsg || 'Audit closed clean!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        const penalty = Math.round(game.state.cash * 0.08);
        game.spendCash(penalty);
        game.addShares(3);
        spawnFloating(typeof tObj.auditPenaltyMsg === 'function' ? tObj.auditPenaltyMsg(formatMoney(penalty)) : `-${formatMoney(penalty)} | +3 Gold Shares`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            if (Math.random() < 0.5) {
                const bonus = Math.round(game.getEarningsPerSecond() * 120 * game.getEventBonusMultiplier());
                game.addCash(bonus);
                spawnFloating(`+${formatMoney(bonus)} APPEAL WON!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
            } else {
                const fine = Math.round(game.state.cash * 0.16);
                game.spendCash(fine);
                spawnFloating(`-${formatMoney(fine)} Appeal lost!`, window.innerWidth / 2, window.innerHeight / 2, 'red');
            }
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleMaintenanceEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(600 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.025));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        game.triggerSpeedBoost(600, 1.15);
        spawnFloating(tObj.equipmentFixedMsg || 'Fixed! +15% speed', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        game.triggerSpeedBoost(300, 0.7);
        spawnFloating(tObj.equipmentWaitMsg || '-30% speed for 5 min', window.innerWidth / 2, window.innerHeight / 2, 'red');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.triggerSpeedBoost(300, 1.5);
            spawnFloating(tObj.contractorMsg || 'Contractor arrived! +50% speed', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handlePowerOutageEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1200 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.04));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        spawnFloating(tObj.generatorActiveMsg || 'Generator running!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        game.triggerSpeedBoost(300, 0.5);
        spawnFloating(tObj.powerHalfMsg || '50% output for 5 min', window.innerWidth / 2, window.innerHeight / 2, 'red');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.triggerSpeedBoost(600, 1.25);
            spawnFloating(tObj.generatorFundedMsg || 'Generator funded! +25% speed', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleRobberyAttemptEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1500 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.03));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        const bounty = Math.round(game.getEarningsPerSecond() * 180 * game.getEventBonusMultiplier());
        game.addCash(bounty);
        spawnFloating(`+${formatMoney(bounty)} Security Bounty!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        spawnFloating(tObj.policeOnWayMsg || 'Police en route!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            const insuranceBonus = Math.round(game.getEarningsPerSecond() * 240 * game.getEventBonusMultiplier());
            game.addCash(insuranceBonus);
            spawnFloating(`+${formatMoney(insuranceBonus)} Insurance!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleCelebrityVisitEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(2000 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.05));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        // VIP visit: give a speed boost (faster tellers = more clients served effectively)
        game.triggerSpeedBoost(3600, 1.15);
        spawnFloating(tObj.vipSpeedMsg || 'VIP +15% speed for 1 hour!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        const reward = Math.round(game.getEarningsPerSecond() * 120 * game.getEventBonusMultiplier());
        game.addCash(reward);
        spawnFloating(`+${formatMoney(reward)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.triggerSpeedBoost(3600, 1.15);
            const bonus = Math.round(game.getEarningsPerSecond() * 180 * game.getEventBonusMultiplier());
            game.addCash(bonus);
            spawnFloating(`VIP BOOST + +${formatMoney(bonus)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleLotteryWinnerEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(2500 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.04));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        // Investment package: large speed boost simulating recurring income
        const investPayout = Math.round(game.getEarningsPerSecond() * 30 * 6 * game.getEventBonusMultiplier());
        game.addCash(investPayout);
        game.triggerSpeedBoost(3600, 1.3);
        spawnFloating(`+${formatMoney(investPayout)} INVESTMENT!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        const payout = Math.round(game.getEarningsPerSecond() * 60 * game.getEventBonusMultiplier());
        game.addCash(payout);
        spawnFloating(`+${formatMoney(payout)} DEPOSIT!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            const investPayout = Math.round(game.getEarningsPerSecond() * 30 * 6 * game.getEventBonusMultiplier());
            const stdPayout = Math.round(game.getEarningsPerSecond() * 60 * game.getEventBonusMultiplier());
            game.addCash(investPayout + stdPayout);
            game.triggerSpeedBoost(3600, 1.3);
            spawnFloating(`+${formatMoney(investPayout + stdPayout)} VIP PACKAGE!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleCompetitorNewsEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1800 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.04));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        // More clients = faster processing speed + queue bonus
        game.triggerSpeedBoost(3600, 1.5);
        game.triggerTempQueueBonus(10, 3600000);
        spawnFloating(tObj.clientWave15Msg || 'Client wave! x1.5 for 1h', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        game.triggerSpeedBoost(1800, 1.05);
        spawnFloating(tObj.clientBoost5Msg || '+5% clients for 30 min', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.triggerSpeedBoost(3600, 2.0);
            game.triggerTempQueueBonus(15, 3600000);
            spawnFloating(tObj.clientWave2Msg || 'Client wave! x2 for 1h', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleEconomicBoomEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(2200 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.05));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        game.triggerSpeedBoost(3600, 1.2);
        spawnFloating(tObj.eps20Msg || 'EPS +20% for 1h!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        game.triggerSpeedBoost(1800, 1.1);
        spawnFloating(tObj.eps10Msg || 'EPS +10% for 30 min', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.triggerSpeedBoost(3600, 1.3);
            spawnFloating(tObj.eps30Msg || 'EPS +30% for 1h!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleAtmMalfunctionEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1000 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.03));

    const btnA = document.createElement('button');
    btnA.className = 'event-option-btn';
    const canAfford = game.state.cash >= cost;
    if (!canAfford) btnA.classList.add('disabled');
    btnA.innerHTML = `
        <div class="event-option-title">${eObj.optA(formatMoney(cost))}</div>
        <div class="event-option-desc">${eObj.optADesc}</div>
    `;
    btnA.addEventListener('click', () => {
        if (!canAfford) return;
        initSound();
        game.spendCash(cost);
        eventModal.classList.remove('active');
        // ATMs fixed: bonus customers arrive (speed boost + queue expansion)
        game.triggerSpeedBoost(600, 1.3);
        game.triggerTempQueueBonus(8, 600000);
        spawnFloating(tObj.atmBackMsg || 'ATMs back online!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
    });

    const btnB = document.createElement('button');
    btnB.className = 'event-option-btn';
    btnB.innerHTML = `
        <div class="event-option-title">${eObj.optB}</div>
        <div class="event-option-desc">${eObj.optBDesc}</div>
    `;
    btnB.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        // Temporary slowdown while ATMs are offline
        game.triggerSpeedBoost(300, 0.8);
        spawnFloating(tObj.speed20MinusMsg || '-20% speed for 5 min', window.innerWidth / 2, window.innerHeight / 2, 'red');
    });

    const btnC = document.createElement('button');
    btnC.className = 'event-option-btn ad-option';
    btnC.innerHTML = `
        <div class="event-option-title">${eObj.optC}</div>
        <div class="event-option-desc">${eObj.optCDesc}</div>
    `;
    btnC.addEventListener('click', () => {
        initSound();
        eventModal.classList.remove('active');
        playAd(() => {
            game.triggerSpeedBoost(600, 1.25);
            game.triggerTempQueueBonus(8, 600000);
            spawnFloating(tObj.atmFixedWaveMsg || 'ATMs fixed — client wave!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

// ===== END NEW EVENT HANDLERS =====

function triggerRandomEvent() {
    if (document.querySelector('.modal-overlay.active')) return;
    
    const lang = game.state.language || 'en';
    const tObj = translations[lang];
    
    let eventType = 'crowd';
    const rescueThreshold = 2000 * Math.pow(6, game.state.currentBranch);
    const currentEps = game.getEarningsPerSecond();
    if (game.state.cash < rescueThreshold &&
        game.state.vault.cashStored < rescueThreshold &&
        currentEps * 30 < rescueThreshold) {
        eventType = 'rescue';
    } else {
        // Pool of all normal events with equal weight
        const normalEvents = [
            'crowd', 'security', 'rush_hours', 'investor',
            'audit', 'maintenance', 'power_outage', 'robbery_attempt',
            'celebrity_visit', 'lottery_winner', 'competitor_news',
            'economic_boom', 'atm_malfunction'
        ];
        eventType = normalEvents[Math.floor(Math.random() * normalEvents.length)];
    }

    const eventModal = document.getElementById('event-modal');
    if (!eventModal) return;
    const modalBox = eventModal.querySelector('.modal-box');
    if (!modalBox) return;

    // Remove all known event classes
    const allEventClasses = [
        'event-crowd', 'event-security', 'event-rescue', 'event-rush_hours', 'event-investor',
        'event-audit', 'event-maintenance', 'event-power_outage', 'event-robbery_attempt',
        'event-celebrity_visit', 'event-lottery_winner', 'event-competitor_news',
        'event-economic_boom', 'event-atm_malfunction'
    ];
    modalBox.classList.remove(...allEventClasses);
    modalBox.classList.add(`event-${eventType}`);

    const iconEl = document.getElementById('event-icon');
    const titleEl = document.getElementById('event-title');
    const textEl = document.getElementById('event-text');
    const container = document.getElementById('event-options-container');
    if (!iconEl || !titleEl || !textEl || !container) return;

    const eventCashValEl = document.getElementById('event-cash-val');
    if (eventCashValEl) {
        const labelText = tObj.cashLabel || 'יתרת מזומנים';
        const displayBox = document.getElementById('event-cash-display-box');
        if (displayBox) {
            displayBox.innerHTML = `${labelText}: <span id="event-cash-val" style="color:var(--money-green); font-family:'Outfit', sans-serif;">${formatMoney(game.state.cash)}</span>`;
        }
    }

    // Resolve event text: new events live in events_extended, originals in events
    const eObj = (tObj.events && tObj.events[eventType])
        || (tObj.events_extended && tObj.events_extended[eventType]);
    if (!eObj) return;

    const EVENT_ICONS = {
        crowd: '👥',
        security: '🚨',
        rescue: '🏛️',
        rush_hours: '⚡',
        investor: '💼',
        audit: '📋',
        maintenance: '🔧',
        power_outage: '🔌',
        robbery_attempt: '🚔',
        celebrity_visit: '🌟',
        lottery_winner: '🎰',
        competitor_news: '📰',
        economic_boom: '📈',
        atm_malfunction: '💳'
    };
    iconEl.innerText = EVENT_ICONS[eventType] || '📢';
    titleEl.innerText = eObj.title;
    textEl.innerText = eObj.desc;
    container.innerHTML = '';

    const handler = EVENT_HANDLERS[eventType];
    if (handler) {
        handler(container, lang, tObj, eObj, eventModal);
    }

    if (AdService.isInCooldown()) {
        container.querySelectorAll('.ad-option').forEach(btn => btn.remove());

        const adDependentEvents = ['rescue', 'investor'];
        if (adDependentEvents.includes(eventType) && container.children.length <= 1) {
            return;
        }
    }

    if (window.NotificationQueue) {
        // Casual priority + dropIfBusy: an event whose content (cash amounts, etc.)
        // was built now would go stale if delayed and shown minutes later — skip
        // this cycle instead, the same as before the queue existed.
        window.NotificationQueue.request('event-modal', window.NotificationQueue.PRIORITY.CASUAL, () => {
            eventModal.classList.add('active');
        }, { dropIfBusy: true });
    } else {
        eventModal.classList.add('active');
    }
}

function updateAdvDisplay(budget) {
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

function updateMuteButton() {
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

function initSound() {
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

function triggerMilestoneConfetti(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const container = document.getElementById('floating-container') || document.body;

    const colors = ['#dfab29', '#ffd700', '#10b981', '#3b82f6', '#ec4899', '#a855f7'];
    const MAX_CONFETTI = window.innerWidth <= 768 ? 15 : 30;

    const particles = [];
    for (let i = 0; i < MAX_CONFETTI; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';

        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 110;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance - (30 + Math.random() * 40);

        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;

        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        const size = 5 + Math.random() * 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        if (Math.random() > 0.5) {
            particle.style.borderRadius = '0px';
        }

        container.appendChild(particle);
        particles.push(particle);
    }
    setTimeout(() => particles.forEach(p => p.remove()), 1200);
}

function handlePurchaseFeedback(btn, e, beforeCash, beforeLevelOrUnlocked, type, extraId) {
    const afterCash = game.state.cash;
    const spent = beforeCash - afterCash;
    
    let afterLevelOrUnlocked = false;
    let isUnlock = false;
    
    if (type === 'teller') {
        afterLevelOrUnlocked = game.state.tellers[extraId].level;
    } else if (type === 'guard') {
        afterLevelOrUnlocked = game.state.guards[extraId].level;
    } else if (type === 'unlock-teller') {
        afterLevelOrUnlocked = game.state.tellers[extraId].unlocked;
        isUnlock = true;
    } else if (type === 'unlock-guard') {
        afterLevelOrUnlocked = game.state.guards[extraId].unlocked;
        isUnlock = true;
    } else if (type === 'vault') {
        afterLevelOrUnlocked = game.state.vault.level;
    } else if (type === 'queue') {
        afterLevelOrUnlocked = game.state.queueUpgradeLevel;
    } else if (type === 'hire-manager') {
        afterLevelOrUnlocked = game.state.managers[extraId];
        isUnlock = true;
    } else if (type === 'upgrade-manager') {
        afterLevelOrUnlocked = game.state.managerUpgrades[extraId].level;
    } else if (type === 'unlock-dept') {
        const deptObj = game.state.departments.find(d => d.id === extraId);
        afterLevelOrUnlocked = deptObj ? deptObj.unlocked : false;
        isUnlock = true;
    }
    
    const rect = btn.getBoundingClientRect();
    const x = (e && e.clientX) ? e.clientX : (rect.left + rect.width / 2);
    const y = (e && e.clientY) ? e.clientY : rect.top;
    
    // Trigger card gold flash animation
    const card = btn.closest('.upgrade-card') || btn.closest('.upg-new-layout') || btn.closest('.mgr-new-layout');
    if (card) {
        card.classList.remove('sparkle-flash');
        void card.offsetWidth; // trigger reflow
        card.classList.add('sparkle-flash');
    }
    
    if (spent > 0) {
        spawnFloating(`-$${formatMoney(spent)}`, x, y, 'red');
        if (typeof spawnParticles === 'function') {
            spawnParticles(x, y, 8, 'sparkle');
        }
    }
    
    if (isUnlock) {
        if (afterLevelOrUnlocked && !beforeLevelOrUnlocked) {
            setTimeout(() => {
                spawnFloating(`UNLOCKED! 🔓`, x, y - 25, 'gold');
            }, 150);
        }
    } else {
        const levelDiff = afterLevelOrUnlocked - beforeLevelOrUnlocked;
        if (levelDiff > 0) {
            setTimeout(() => {
                spawnFloating(`LEVEL UP! +${levelDiff} ⚡`, x, y - 25, 'gold');
            }, 150);
            
            // Check for Milestone celebration
            if (type === 'teller') {
                const milestones = [10, 25, 50, 100];
                const reached = milestones.find(m => beforeLevelOrUnlocked < m && afterLevelOrUnlocked >= m);
                if (reached) {
                    setTimeout(() => {
                        triggerMilestoneConfetti(btn);
                        spawnFloating(`MILESTONE Lv ${reached}! 🏆🎉`, x, y - 55, '#dfab29');
                        if (typeof rebuildTellersDOM === 'function') rebuildTellersDOM();
                    }, 250);
                }
            }
        }
    }
}

function handleMissionRedirect(missionType, targetId) {
    let tabName = 'upgrades';
    let selector = '';

    switch (missionType) {
        case 'upgrade_teller': {
            tabName = 'upgrades';
            const tId = targetId !== undefined ? targetId : 0;
            selector = `.buy-btn[data-type="teller"][data-id="${tId}"], .buy-btn[data-action="unlock-teller"][data-id="${tId}"]`;
            break;
        }
        case 'upgrade_guard': {
            tabName = 'upgrades';
            const gId = targetId !== undefined ? targetId : 0;
            selector = `.buy-btn[data-type="guard"][data-id="${gId}"], .buy-btn[data-action="unlock-guard"][data-id="${gId}"]`;
            break;
        }
        case 'upgrade_vault':
            tabName = 'upgrades';
            selector = '#upgrade-vault-btn';
            break;
        case 'clients':
            tabName = 'upgrades';
            selector = '#upgrade-queue-btn';
            break;
        case 'accumulate_cash':
        case 'earn_cash':
        case 'earn_eps':
        case 'serve_rich_vip':
        case 'vip_collector':
        case 'spend_cash':
        case 'break_the_wall':
            tabName = 'upgrades';
            selector = '.buy-btn[data-type="teller"][data-id="0"], .buy-btn[data-action="unlock-teller"][data-id="0"]';
            break;
        case 'hire_managers':
        case 'upgrade_managers':
        case 'manager_hire':
        case 'all_managers':
            tabName = 'managers';
            selector = '.buy-mgr-btn, .upgrade-mgr-btn';
            break;
        case 'unlock_departments':
        case 'department_unlock':
            tabName = 'departments';
            selector = '.dept-action-btn:not(.active)';
            break;
        case 'teller_max':
            tabName = 'upgrades';
            selector = '.buy-btn[data-type="teller"][data-id="0"], .buy-btn[data-action="unlock-teller"][data-id="0"]';
            break;
        case 'guard_trips':
            tabName = 'upgrades';
            selector = '.buy-btn[data-type="guard"][data-id="0"]';
            break;
        case 'boost_run':
            tabName = 'upgrades';
            selector = '.buy-btn[data-type="teller"][data-id="0"]';
            break;
        case 'department_grind':
            tabName = 'managers';
            selector = `.upgrade-mgr-btn[data-type="${targetId}"], .buy-mgr-btn[data-type="${targetId}"]`;
            break;
        case 'missions_veteran':
            tabName = 'missions';
            break;
    }

    const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (tabBtn) {
        tabBtn.click();
    }

    setTimeout(() => {
        if (!selector) return;

        const targetBtn = document.querySelector(selector);
        if (targetBtn) {
            const card = targetBtn.closest('.new-upg-wrapper, .upgrade-card, .manager-card, .department-card, .prestige-panel, .gold-upgrade-card');
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('mission-highlight');
                setTimeout(() => {
                    card.classList.remove('mission-highlight');
                }, 2500);
            }
        }
    }, 300);
}

function showContextualAdBanner() {
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

function openWeeklyRewardModal() {
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

function checkWeeklyReward() {
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const last = (game.state && game.state.lastWeeklyReward) || 0;
    if (Date.now() - last >= ONE_WEEK_MS) {
        // NotificationQueue waits for any other automatic pop-up to close first.
        setTimeout(openWeeklyRewardModal, 4000);
    }
}

function tick(timestamp) {
    try {
        const dt = (timestamp - lastTime) / 1000.0;
        lastTime = timestamp;

        const cappedDt = Math.min(1.0, dt);

        game.update(cappedDt);

        // Contextual ad offer
        if (game._contextualAdPending) {
            game._contextualAdPending = null;
            showContextualAdBanner();
        }

        // Boost offer window management
        {
            const now = Date.now();
            if (game.state.boost2xTimeLeft > 0) {
                // Boost active — reset offer cycle to start fresh after boost ends
                boostOfferEndTime = 0;
                boostOfferNextTime = 0;
            } else {
                if (boostOfferEndTime > 0 && now > boostOfferEndTime) {
                    // Offer expired — schedule next window in 15-30 min
                    boostOfferEndTime = 0;
                    boostOfferNextTime = now + (900 + Math.random() * 900) * 1000;
                } else if (boostOfferEndTime === 0 && (boostOfferNextTime === 0 || now > boostOfferNextTime)) {
                    if (!AdService.isInCooldown()) {
                        // Start new offer window: 10-20 min duration
                        boostOfferEndTime = now + (600 + Math.random() * 600) * 1000;
                        boostOfferNextTime = 0;
                    }
                }
            }
            window._boostOfferEndTime = boostOfferEndTime;
        }

        eventTimer += cappedDt;
        if (eventTimer >= GAME_CONFIG.EVENT_INTERVAL_SEC) {
            eventTimer = 0;
            triggerRandomEvent();
        }

        tabRefreshTimer += cappedDt;
        if (tabRefreshTimer >= GAME_CONFIG.TAB_REFRESH_INTERVAL_SEC) {
            tabRefreshTimer = 0;
            const _activeTabEl = document.querySelector('.tab-btn.active');
            if (_activeTabEl && _activeTabEl.getAttribute('data-tab') === 'missions') {
                game.checkMissions();
                if (typeof window.renderMissionsTab === 'function') window.renderMissionsTab();
            }

            // Achievements: checked unconditionally (the income bonus must apply globally and
            // promptly regardless of which tab is open), rendered only when its tab is active.
            const _newlyUnlockedAchievements = game.checkAchievements();
            if (_newlyUnlockedAchievements && _newlyUnlockedAchievements.length > 0) {
                _newlyUnlockedAchievements.forEach(a => {
                    if (typeof window.playAchievementUnlockFeedback === 'function') window.playAchievementUnlockFeedback(a);
                });
                game.saveGame();
            }
            if (_activeTabEl && _activeTabEl.getAttribute('data-tab') === 'daily' && typeof window.renderAchievementsTab === 'function') {
                window.renderAchievementsTab();
            }

            updateButtonAffordability();

            // Near-miss prestige glow: light up prestige buttons when >= 70% of threshold
            const _nmBranch = game.branches && game.branches[game.state.currentBranch];
            if (_nmBranch) {
                const _nmThreshold = _nmBranch.minCashToPrestige * 0.7;
                const _nmActive = game.state.lifetimeCash >= _nmThreshold && game.state.cash < _nmBranch.minCashToPrestige;
                document.querySelectorAll('[data-prestige-branch], #main-prestige-btn').forEach(el => {
                    el.classList.toggle('prestige-near-miss-glow', _nmActive);
                });
            }
        }

        fortuneWheelBtnTimer += cappedDt;
        if (fortuneWheelBtnTimer >= 30) {
            fortuneWheelBtnTimer = 0;
            updateFortuneWheelBtnState();
        }

        // Mobile Performance Throttling
        drawTimer += cappedDt;
        const isMobile = window.innerWidth <= 768;
        const targetFpsInterval = isMobile ? (1.0 / 15.0) : 0; // 15 fps on mobile, unlimited on desktop

        if (drawTimer >= targetFpsInterval) {
            updateActiveCoins(drawTimer);
            if (typeof updateFloatingText === 'function') updateFloatingText(drawTimer);
            drawTimer = 0;
            draw();
        }

        autoSaveTimer += cappedDt;
        if (autoSaveTimer >= GAME_CONFIG.AUTO_SAVE_INTERVAL_SEC) {
            autoSaveTimer = 0;
            game.saveGame();
        }

        rafId = requestAnimationFrame(tick);
    } catch(e) {
        console.error("Critical error in game loop!", e);
        try {
            game.saveGame();
        } catch(saveErr) {
            console.error("Failed to auto-save during crash recovery", saveErr);
        }
        
        if (typeof window.showToast === 'function') {
            const _toastLang = (game.state && game.state.language) || 'en';
            const _toastT = (typeof translations !== 'undefined' && translations[_toastLang]) ? translations[_toastLang] : translations.en;
            const crashMsg = _toastT.errorDesc || 'A critical error occurred! Game progress was saved.';
            window.showToast(crashMsg, 'danger');
        }
        
        let overlay = document.getElementById('crash-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'crash-overlay';
            
            const _crashLang = window.gameLanguage || 'en';
            const _crashT = (typeof translations !== 'undefined' && translations[_crashLang]) ? translations[_crashLang] : translations.en;
            const title = document.createElement('h1');
            title.innerText = _crashT.errorTitle || 'Oops! Something went wrong';

            const desc = document.createElement('p');
            desc.innerText = _crashT.errorDesc || 'An unexpected error occurred in the game loop. Your progress has been saved.';

            const reloadBtn = document.createElement('button');
            reloadBtn.innerText = _crashT.reloadBtn || 'Reload Game 🔄';
            reloadBtn.addEventListener('click', () => window.location.reload());
            
            overlay.appendChild(title);
            overlay.appendChild(desc);
            overlay.appendChild(reloadBtn);
            document.body.appendChild(overlay);
        }
    }
}

// סנכרון Bottom Navigation עם הטאבים
function syncBottomNav(activeTab) {
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === activeTab);
    });
    const headerDailyBtn = document.getElementById('header-daily-btn');
    if (headerDailyBtn) {
        headerDailyBtn.classList.toggle('active', activeTab === 'daily');
    }
}

// עדכון vault mini bar ב-portrait
function updateVaultMiniBar(pct, isReady, cashStored, capacity, yieldPerHour, vaultLevel) {
    const miniPct = document.getElementById('vault-mini-pct');
    const miniFill = document.getElementById('vault-mini-fill');
    const miniBtn = document.getElementById('vault-mini-btn');
    const miniBar = document.getElementById('vault-mini-bar');
    if (!miniPct) return;
    miniPct.textContent = Math.round(pct) + '%';
    if (miniFill) {
        miniFill.style.width = pct + '%';
        miniFill.setAttribute('aria-valuenow', Math.round(pct));
    }
    if (miniBtn) {
        miniBtn.disabled = !isReady;
    }
    const fmt = (typeof window.formatMoney === 'function') ? window.formatMoney : (v => '$' + Math.round(v));
    const miniStored = document.getElementById('vault-mini-stored');
    const miniCap = document.getElementById('vault-mini-cap');
    const miniYield = document.getElementById('vault-mini-yield');
    const miniLevel = document.getElementById('vault-mini-level');
    if (miniStored && cashStored !== undefined) miniStored.textContent = fmt(cashStored);
    if (miniCap && capacity !== undefined) miniCap.textContent = fmt(capacity);
    if (miniYield && yieldPerHour !== undefined) miniYield.textContent = '+' + fmt(yieldPerHour) + '/h';
    if (miniLevel && vaultLevel !== undefined) miniLevel.textContent = 'Lv.' + vaultLevel;
    // CSS classes לפס מילוי (ללא inline style — ה-CSS מטפל בצבע)
    if (miniFill) {
        miniFill.style.background = '';
        miniFill.classList.toggle('is-full', pct >= 95);
        miniFill.classList.toggle('is-warm', pct >= 60 && pct < 95);
    }
    // classes על הבר לאנימציות גלו
    if (miniBar) {
        miniBar.classList.toggle('is-full', pct >= 95);
        miniBar.classList.toggle('is-ready', isReady && pct < 95);
    }
}

// Single entry point for showing the offline-earnings modal. Both the initial
// (unverified-clock) check and the later server-time-verified check funnel through
// here, so the popup only ever queues/shows once instead of racing/stacking.
function showOfflineEarningsModal() {
    if (!window.game || !window.game.offlineEarningsReport || window.game.offlineEarningsReport <= 0) return;

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
window.showOfflineEarningsModal = showOfflineEarningsModal;

function showLoginRewardModal() {
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

function _applyLoginReward(reward) {
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

// ==========================================
// PRESTIGE CEREMONY
// ==========================================

function triggerPrestigeCeremony(sharesGained, branchName, callback) {
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

let uiEventsInitialized = false;

function initFocusTrapObserver() {
    // MutationObserver על כל modal-overlay — מפעיל/משחרר focus trap בהוספה/הסרת class 'active'
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        const obs = new MutationObserver(() => {
            if (modal.classList.contains('active')) {
                trapFocus(modal);
            } else {
                releaseFocus(modal);
                if (window.NotificationQueue) window.NotificationQueue.notifyClosed(modal.id);
            }
        });
        obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
}

function initUIEvents() {
    if (uiEventsInitialized) return;
    uiEventsInitialized = true;
    initFocusTrapObserver();

    // Escape key closes the topmost open modal
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const modals = [
            { id: 'fortune-wheel-modal', closeId: 'fortune-close-btn' },
            { id: 'prestige-modal',      closeId: 'prestige-cancel-btn' },
            { id: 'lang-modal',          closeId: 'lang-modal-close' },
            { id: 'login-reward-modal',  closeId: 'login-reward-collect-btn' },
            { id: 'offline-modal',       closeId: 'offline-claim-btn' },
            { id: 'weekly-modal',        closeId: 'weekly-close-btn' },
            { id: 'analytics-modal',     closeId: 'analytics-close-btn' },
        ];
        for (const { id, closeId } of modals) {
            const el = document.getElementById(id);
            if (el && el.classList.contains('active')) {
                const closeBtn = document.getElementById(closeId);
                if (closeBtn) closeBtn.click();
                break;
            }
        }
    });
    if (DOM_CACHE.resetBtn) {
        const confirmCheck = document.getElementById('reset-confirm-checkbox');
        if (confirmCheck) {
            confirmCheck.addEventListener('change', (e) => {
                DOM_CACHE.resetBtn.disabled = !e.target.checked;
            });
        }
        DOM_CACHE.resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            initSound();
            if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }
            
            const lang = game.state.language || 'en';
            let confirmMsg = 'האם אתה בטוח שברצונך לאפס את המשחק ולהתחיל מ-0? כל ההתקדמות שלך תימחק לחלוטין!';
            if (lang === 'en') {
                confirmMsg = 'Are you sure you want to reset the game and start from 0? All your progress will be completely deleted!';
            } else if (lang === 'es') {
                confirmMsg = '¿Estás seguro de que quieres restablecer el juego y empezar desde 0? ¡Todo tu progreso se eliminará por completo!';
            } else if (lang === 'ru') {
                confirmMsg = 'Вы уверены, что хотите сбросить игру и начать с 0? Весь ваш прогресс будет полностью удален!';
            }
            
            if (confirm(confirmMsg)) {
                game.clearSave();
                location.reload();
            }
        });
    }

    if (DOM_CACHE.langBtn) {
        DOM_CACHE.langBtn.addEventListener('click', () => {
            initSound();
            if (DOM_CACHE.langModalClose) DOM_CACHE.langModalClose.style.display = 'inline-block';
            if (DOM_CACHE.langModal) DOM_CACHE.langModal.classList.add('active');
        });
    }

    if (DOM_CACHE.langModalClose) {
        DOM_CACHE.langModalClose.addEventListener('click', () => {
            initSound();
            if (DOM_CACHE.langModal) DOM_CACHE.langModal.classList.remove('active');
        });
    }

    if (DOM_CACHE.boostBtn) {
        DOM_CACHE.boostBtn.addEventListener('click', () => {
            initSound();
            openBoostModal();
        });
    }

    if (DOM_CACHE.analyticsBtn) {
        DOM_CACHE.analyticsBtn.addEventListener('click', () => {
            initSound();
            openAnalyticsModal();
        });
    }

    const analyticsFromSettingsBtn = document.getElementById('analytics-from-settings-btn');
    if (analyticsFromSettingsBtn) {
        analyticsFromSettingsBtn.addEventListener('click', () => {
            if (DOM_CACHE.langModal) DOM_CACHE.langModal.classList.remove('active');
            openAnalyticsModal();
        });
    }

    const fortuneWheelBtn = document.getElementById('fortune-wheel-btn');
    if (fortuneWheelBtn) {
        fortuneWheelBtn.addEventListener('click', () => {
            initSound();
            openFortuneWheel();
        });
    }

    const headerDailyBtn = document.getElementById('header-daily-btn');
    if (headerDailyBtn) {
        headerDailyBtn.addEventListener('click', () => {
            initSound();
            try { navigator.vibrate && navigator.vibrate(5); } catch { /* vibration unsupported */ }
            const existingTabBtn = document.querySelector('.tab-btn[data-tab="daily"]');
            if (existingTabBtn) {
                existingTabBtn.click();
            }
            syncBottomNav('daily');
        });
    }
    updateFortuneWheelBtnState();

    if (DOM_CACHE.muteBtn) {
        DOM_CACHE.muteBtn.addEventListener('click', () => {
            initSound();
            if (window.gameAudio && typeof window.gameAudio.toggleMute === 'function') {
                window.gameAudio.toggleMute();
            }
            updateMuteButton();
            if (window.gameAudio && !window.gameAudio.isMuted && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }
        });
    }

    const elLangOptions = document.querySelectorAll('.lang-option-card');
    elLangOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            try {
                initSound();
                const selectedLang = opt.getAttribute('data-lang');
                game.setLanguage(selectedLang);
                window.localStorage.setItem('idle_bank_language_chosen', 'true');
                DOM_CACHE.langModal.classList.remove('active');
                applyLanguage(selectedLang);
            } catch (err) {
                console.error("Error inside language options selection click handler:", err);
            }
        });
    });

    document.querySelectorAll('.theme-option-btn-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            try {
                initSound();
                const theme = btn.getAttribute('data-theme');
                applyTheme(theme);
                if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                    window.gameAudio.playClick();
                }
            } catch (err) {
                console.error("Error inside theme options selection click handler:", err);
            }
        });
    });

    if (DOM_CACHE.langModal) {
        DOM_CACHE.langModal.addEventListener('click', (e) => {
            try {
                if (e.target === DOM_CACHE.langModal && window.localStorage.getItem('idle_bank_language_chosen')) {
                    initSound();
                    DOM_CACHE.langModal.classList.remove('active');
                }
            } catch (err) {
                console.error("Error closing language modal on overlay click:", err);
            }
        });
    }

    if (DOM_CACHE.advSlider) {
        DOM_CACHE.advSlider.addEventListener('input', () => {
            const sliderVal = parseInt(DOM_CACHE.advSlider.value);
            const dynamicMax = game.getAdMaxBudget();
            let budget = 0;
            if (sliderVal > 0) {
                budget = Math.round(dynamicMax * (sliderVal / 1000));
                budget = Math.max(1, Math.round(budget));
            }
            game.setAdvBudget(budget);
            updateAdvDisplay(budget);
        });
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${tabId}`);

            // Update ARIA for accessibility
            document.querySelectorAll('.tab-btn[role="tab"]').forEach(b => {
                b.setAttribute('aria-selected', b.classList.contains('active') ? 'true' : 'false');
            });
            if (targetPane) targetPane.classList.add('active');

            if (DOM_CACHE.bulkSelector) {
                if (tabId === 'upgrades' || tabId === 'managers') {
                    DOM_CACHE.bulkSelector.style.display = 'flex';
                } else {
                    DOM_CACHE.bulkSelector.style.display = 'none';
                }
            }

            if (tabId === 'daily' && typeof window.renderDailyChallengesSection === 'function') {
                window.renderDailyChallengesSection();
            }

            if (typeof window.invalidateTabHashes === 'function') window.invalidateTabHashes();
            if (tabId === 'upgrades' && typeof window.renderUpgradesTab === 'function') window.renderUpgradesTab();
            else if (tabId === 'managers' && typeof window.renderManagersTab === 'function') window.renderManagersTab();
            else if (tabId === 'departments' && typeof window.renderDepartmentsTab === 'function') window.renderDepartmentsTab();
            else if (tabId === 'missions' && typeof window.renderMissionsTab === 'function') window.renderMissionsTab();
            else if (tabId === 'daily') {
                if (typeof window.renderDailyChallengesSection === 'function') window.renderDailyChallengesSection();
                if (typeof window.renderAchievementsTab === 'function') window.renderAchievementsTab();
            }
            else if (tabId === 'branches' && typeof window.renderBranchesTab === 'function') window.renderBranchesTab();

            // סנכרון Bottom Nav
            syncBottomNav(tabId);

            initSound();
            if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }
        });
    });

    // Bottom Nav click handlers
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            try { navigator.vibrate && navigator.vibrate(5); } catch { /* vibration unsupported */ }
            const tab = btn.dataset.tab;
            // מפעיל את הלוגיקה הקיימת של הטאבים
            const existingTabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
            if (existingTabBtn) {
                existingTabBtn.click();
            }
            syncBottomNav(tab);
        });
    });

    // Vault Mini Btn — מחובר לאותה לוגיקה של collect vault
    const vaultMiniBtn = document.getElementById('vault-mini-btn');
    if (vaultMiniBtn) {
        vaultMiniBtn.addEventListener('click', () => {
            try { navigator.vibrate && navigator.vibrate([8, 30, 8]); } catch { /* vibration unsupported */ }
            const mainVaultBtn = document.getElementById('collect-vault-btn');
            if (mainVaultBtn) mainVaultBtn.click();
        });
    }

    if (DOM_CACHE.bulkSelector) {
        DOM_CACHE.bulkSelector.addEventListener('click', (e) => {
            const btn = e.target.closest('.bulk-btn-option');
            if (!btn) return;
            
            initSound();
            currentUpgradeMode = btn.getAttribute('data-mode');
            DOM_CACHE.bulkSelector.querySelectorAll('.bulk-btn-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (typeof refreshAllTabs === 'function') {
                const scrollPos = document.getElementById('tab-upgrades') ? document.getElementById('tab-upgrades').scrollTop : 0;
                refreshAllTabs();
                if (document.getElementById('tab-upgrades')) document.getElementById('tab-upgrades').scrollTop = scrollPos;
            } else if (typeof updateButtonAffordability === 'function') {
                updateButtonAffordability();
            }
        });
    }

    const tabUpgrades = document.getElementById('tab-upgrades');
    if (tabUpgrades) {
        tabUpgrades.addEventListener('click', (e) => {
            const btn = e.target.closest('.buy-btn');
            if (!btn || btn.classList.contains('disabled')) return;

            initSound();
            try { navigator.vibrate && navigator.vibrate(12); } catch { /* vibration unsupported */ }
            const type = btn.getAttribute('data-type');
            const id = parseInt(btn.getAttribute('data-id'));
            if (isNaN(id) && (type === 'teller' || type === 'guard')) return;
            const action = btn.getAttribute('data-action');

            const beforeCash = game.state.cash;
            let beforeVal = 0;
            let feedType = '';

            if (type === 'teller') {
                beforeVal = game.state.tellers[id].level;
                feedType = 'teller';
                game.upgradeTellerBulk(id, currentUpgradeMode);
            } else if (type === 'guard') {
                beforeVal = game.state.guards[id].level;
                feedType = 'guard';
                game.upgradeGuardBulk(id, currentUpgradeMode);
            } else if (action === 'unlock-teller') {
                beforeVal = game.state.tellers[id].unlocked;
                feedType = 'unlock-teller';
                game.unlockTeller(id);
            } else if (action === 'unlock-guard') {
                beforeVal = game.state.guards[id].unlocked;
                feedType = 'unlock-guard';
                game.unlockGuard(id);
                if (!beforeVal) showDiscoveryTip('guard');
            } else if (btn.id === 'upgrade-vault-btn') {
                beforeVal = game.state.vault.level;
                feedType = 'vault';
                game.upgradeVaultBulk(currentUpgradeMode);
            } else if (btn.id === 'upgrade-queue-btn') {
                beforeVal = game.state.queueUpgradeLevel || 1;
                feedType = 'queue';
                game.upgradeQueueBulk(currentUpgradeMode);
            } else {
                return;
            }

            if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }

            handlePurchaseFeedback(btn, e, beforeCash, beforeVal, feedType, id);
            if (feedType === 'unlock-teller' || feedType === 'unlock-guard') {
                renderUpgradesTab();
                if (feedType === 'unlock-teller' && typeof window.rebuildTellersDOM === 'function') {
                    window.rebuildTellersDOM();
                    if (typeof window.recalcGuardAnchors === 'function') window.recalcGuardAnchors();
                }
            } else {
                const scrollPos = tabUpgrades.scrollTop;
                if (typeof refreshAllTabs === 'function') {
                    refreshAllTabs();
                } else if (typeof updateButtonAffordability === 'function') {
                    updateButtonAffordability();
                }
                tabUpgrades.scrollTop = scrollPos;
            }
        });
    }

    if (DOM_CACHE.offlineModalDoubleBtn) {
        DOM_CACHE.offlineModalDoubleBtn.addEventListener('click', () => {
            initSound();
            if (DOM_CACHE.offlineModal) DOM_CACHE.offlineModal.classList.remove('active');
            playAd(() => {
                if (game.offlineEarningsReport && game.offlineEarningsReport > 0) {
                    const extra = game.offlineEarningsReport * 2;
                    game.state.cash = Math.round((game.state.cash + extra + Number.EPSILON) * 100) / 100;
                    game.state.lifetimeCash = Math.round((game.state.lifetimeCash + extra + Number.EPSILON) * 100) / 100;
                    if (window.gameAudio && typeof window.gameAudio.playChaChing === 'function') {
                        window.gameAudio.playChaChing();
                    }
                    const rect = DOM_CACHE.offlineModalDoubleBtn.getBoundingClientRect();
                    spawnFloating('+$' + formatMoney(extra), rect.left + rect.width / 2, rect.top, 'green');
                }
                game.offlineEarningsReport = 0;
                game.saveGame();
                draw();
            });
        });
    }

    const gdprAcceptBtn = document.getElementById('gdpr-accept-btn');
    if (gdprAcceptBtn) {
        gdprAcceptBtn.addEventListener('click', () => {
            localStorage.setItem('gdpr_consent', '1');
            const banner = document.getElementById('gdpr-banner');
            if (banner) banner.style.display = 'none';
        });
    }

    if (DOM_CACHE.offlineModalClaimBtn) {
        DOM_CACHE.offlineModalClaimBtn.addEventListener('click', () => {
            initSound();
            if (DOM_CACHE.offlineModal) DOM_CACHE.offlineModal.classList.remove('active');
            game.offlineEarningsReport = 0;
            game.saveGame();
            draw();
        });
    }

    const prestigeModal = document.getElementById('prestige-modal');
    const prestigeAdBtn = document.getElementById('prestige-ad-btn');
    const prestigeRegularBtn = document.getElementById('prestige-regular-btn');
    const prestigeCancelBtn = document.getElementById('prestige-cancel-btn');

    if (prestigeAdBtn) {
        prestigeAdBtn.addEventListener('click', () => {
            initSound();
            if (prestigeModal) {
                const target = parseInt(prestigeModal.getAttribute('data-target-branch'));
                const sharesPreview = game.calculatePrestigeShares() * 3;
                const _prT = translations[(game.state && game.state.language) || 'en'] || translations.en;
                const branchName = (game.branches && game.branches[target]) ? game.branches[target].name : ((_prT.branchLabel || 'Branch') + ' ' + target);
                prestigeModal.classList.remove('active');
                playAd(() => {
                    triggerPrestigeCeremony(Math.min(1000, sharesPreview), branchName, () => {
                        game.prestige(target, true);
                        game.saveGame();
                        if (typeof syncBottomNav === 'function') syncBottomNav('upgrades');
                        const firstTabBtn = document.querySelector('.tab-btn');
                        if (firstTabBtn) firstTabBtn.click();
                        draw();
                    });
                });
            }
        });
    }

    if (prestigeRegularBtn) {
        prestigeRegularBtn.addEventListener('click', () => {
            initSound();
            if (prestigeModal) {
                const target = parseInt(prestigeModal.getAttribute('data-target-branch'));
                const sharesPreview = game.calculatePrestigeShares();
                const _prT2 = translations[(game.state && game.state.language) || 'en'] || translations.en;
                const branchName = (game.branches && game.branches[target]) ? game.branches[target].name : ((_prT2.branchLabel || 'Branch') + ' ' + target);
                prestigeModal.classList.remove('active');
                triggerPrestigeCeremony(sharesPreview, branchName, () => {
                    game.prestige(target, false);
                    game.saveGame();
                    if (typeof syncBottomNav === 'function') syncBottomNav('upgrades');
                    const firstTabBtn = document.querySelector('.tab-btn');
                    if (firstTabBtn) firstTabBtn.click();
                    draw();
                });
            }
        });
    }

    if (prestigeCancelBtn) {
        prestigeCancelBtn.addEventListener('click', () => {
            initSound();
            if (prestigeModal) {
                prestigeModal.classList.remove('active');
            }
        });
    }

    if (DOM_CACHE.vaultEmptyBtn) {
        DOM_CACHE.vaultEmptyBtn.addEventListener('click', () => {
            initSound();
            const collected = game.collectVault();
            if (collected > 0) {
                const rectBtn = DOM_CACHE.vaultEmptyBtn.getBoundingClientRect();
                const elStatCash = document.getElementById('stat-cash');
                const rectCashBox = elStatCash ? elStatCash.getBoundingClientRect() : { left: window.innerWidth / 2, top: 20, width: 0, height: 0 };
                animateCoins(rectBtn, rectCashBox, 8, 'cash');
                spawnFloating('+' + formatMoney(collected), rectBtn.left + rectBtn.width / 2, rectBtn.top, 'green');
                // Gold coins rain effect on vault collect
                spawnVaultCoins(collected, rectBtn);
                game.saveGame();
                draw();
                // Discovery tip: first time vault is collected (after start tip was already shown)
                var tips = game.state.discoveredTips || {};
                if (!tips.vault && tips.start) showDiscoveryTip('vault');
            }
        });
    }

    const vaultInfoBtn = document.getElementById('vault-info-btn');
    if (vaultInfoBtn) {
        vaultInfoBtn.addEventListener('click', () => {
            initSound();
            const lang = game.state.language || 'en';
            const tObj = translations[lang];
            if (tObj && typeof window.showToast === 'function') {
                window.showToast(tObj.vaultInfoMsg, 'info');
            }
        });
    }

    if (DOM_CACHE.securityPath) {
        DOM_CACHE.securityPath.addEventListener('click', () => {
            initSound();
            for (let i = 0; i < game.state.guards.length; i++) {
                const g = game.state.guards[i];
                if (g.unlocked && g.state === 'idle') {
                    if (game.triggerGuard(g.id)) {
                        break;
                    }
                }
            }
        });
        // Keyboard support for non-button interactive div
        DOM_CACHE.securityPath.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                DOM_CACHE.securityPath.click();
            }
        });
    }

    const vaultGraphicEl = DOM_CACHE.vaultGraphic;
    if (vaultGraphicEl) {
        // Keyboard support for non-button interactive div
        vaultGraphicEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (DOM_CACHE.vaultEmptyBtn) DOM_CACHE.vaultEmptyBtn.click();
            }
        });
    }

    const triggerFirstInteraction = () => {
        initSound();
        document.removeEventListener('click', triggerFirstInteraction);
        document.removeEventListener('touchstart', triggerFirstInteraction);
        document.removeEventListener('keydown', triggerFirstInteraction);
    };
    document.addEventListener('click', triggerFirstInteraction);
    document.addEventListener('touchstart', triggerFirstInteraction);
    document.addEventListener('keydown', triggerFirstInteraction);

    // Decoration interactions (Living Bank Simulator)
    const camera = document.querySelector('.security-camera');
    if (camera) {
        camera.style.cursor = 'pointer';
        camera.addEventListener('click', (e) => {
            initSound();
            camera.classList.remove('camera-wiggle');
            void camera.offsetWidth; // trigger reflow
            camera.classList.add('camera-wiggle');
            
            const bonus = 10 * (game.state.currentBranch + 1);
            game.addCash(bonus);
            
            const rect = camera.getBoundingClientRect();
            spawnFloating('+$' + bonus, rect.left + rect.width / 2, rect.top, 'green');
            if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }
            draw();
        });
    }

    const atm = document.querySelector('.atm-machine');
    if (atm) {
        atm.style.cursor = 'pointer';
        atm.addEventListener('click', (e) => {
            initSound();
            atm.classList.remove('atm-vibrate');
            void atm.offsetWidth; // trigger reflow
            atm.classList.add('atm-vibrate');
            
            // Create falling/sliding receipt
            const receipt = document.createElement('div');
            receipt.className = 'atm-receipt';
            receipt.innerText = '$' + (15 * (game.state.currentBranch + 1));
            atm.appendChild(receipt);
            setTimeout(() => receipt.remove(), 1200);

            const bonus = 15 * (game.state.currentBranch + 1);
            game.addCash(bonus);
            
            const rect = atm.getBoundingClientRect();
            spawnFloating('+$' + bonus, rect.left + rect.width / 2, rect.top, 'green');
            if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }
            draw();
        });
    }

    const plants = document.querySelectorAll('.potted-plant');
    plants.forEach(plant => {
        plant.style.cursor = 'pointer';
        plant.addEventListener('click', (e) => {
            initSound();
            plant.classList.remove('plant-shake');
            void plant.offsetWidth; // trigger reflow
            plant.classList.add('plant-shake');
            
            // Create falling leaf
            const leaf = document.createElement('div');
            leaf.className = 'falling-leaf';
            leaf.innerText = '🍃';
            plant.appendChild(leaf);
            setTimeout(() => leaf.remove(), 1500);

            const bonus = 2 * (game.state.currentBranch + 1);
            game.addCash(bonus);
            
            const rect = plant.getBoundingClientRect();
            spawnFloating('+$' + bonus, rect.left + rect.width / 2, rect.top, 'green');
            draw();
        });
    });

    // Check weekly reward on game start
    setTimeout(() => {
        if (window.game && window.game.state) {
            checkWeeklyReward();
        }
    }, 2000);

    // Initialize tutorial system
    initTutorialEvents();
    maybeStartTutorial();
}

    // ==========================================
    // FORTUNE WHEEL
    // ==========================================

    function _wheelWeightedRandom(prizes) {
        const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const prize of prizes) {
            rand -= prize.weight;
            if (rand <= 0) return prize;
        }
        return prizes[prizes.length - 1];
    }

    function updateFortuneWheelBtnState() {
        const btn = document.getElementById('fortune-wheel-btn');
        if (!btn) return;
        const lastSpin = (game.state && game.state.lastSpinTime) || 0;
        const canSpin = (Date.now() - lastSpin) >= 86400000;
        btn.classList.toggle('fortune-wheel-ready', canSpin);
    }

    function openFortuneWheel() {
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
                });
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

    // ==========================================
    // VIP VISITOR BANNER
    // ==========================================

    var vipBannerCountdownInterval = null;

    window.triggerVipVisitBanner = function() {
        if (document.getElementById('vip-visit-banner')) return;

        const lang = (game.state && game.state.language) || 'en';
        const tObj = translations[lang] || translations.en;

        const banner = document.createElement('div');
        banner.id = 'vip-visit-banner';
        banner.className = 'vip-visit-banner';

        let prestigeAmount = typeof game.calculatePrestigeShares === 'function' ? game.calculatePrestigeShares() : 10;
        let ownedShares = (game.state && game.state.shares) ? game.state.shares : 0;
        let totalEffectiveShares = ownedShares + prestigeAmount;
        
        // VIP Share Reward Rules:
        // 1. 30% of potential prestige gain
        // 2. 5% of total effective shares (so it's always relevant even if gain is 0)
        // 3. Absolute minimum of 3 shares
        let shareReward = Math.max(3, Math.ceil(prestigeAmount * 0.30), Math.ceil(totalEffectiveShares * 0.05));

        let hourlyProfit = typeof game.getEarningsPerSecond === 'function' ? game.getEarningsPerSecond() * 3600 : 0;
        let cashReward = Math.ceil(hourlyProfit * 0.30);

        const serveText = tObj.vipCloseBtn || 'המשך כרגיל';
        const rewardType = Math.random() < 0.5 ? 'shares' : 'cash';
        
        let premiumText = '';
        if (rewardType === 'shares') {
            premiumText = typeof tObj.vipPremiumBtn === 'function' ? tObj.vipPremiumBtn(shareReward) : (tObj.vipPremiumBtn || 'VIP Premium');
        } else {
            premiumText = tObj.vipPremiumCashBtn ? tObj.vipPremiumCashBtn(formatMoney(cashReward)) : `VIP Premium (פרסומת + ${formatMoney(cashReward)})`;
        }

        const vipName = tObj.vipBannerTitle || 'לקוח עסקי';

        banner.innerHTML = `
            <div class="vip-premium-content">
                <div class="vip-red-carpet"></div>
                <div class="vip-shimmer"></div>
                <div class="vip-profile">
                    <div class="vip-avatar">💎</div>
                    <div class="vip-ring"></div>
                </div>
                <div class="vip-info">
                    <div class="vip-title-wrap"><span class="vip-badge">VIP</span> <span class="vip-name">${vipName}</span></div>
                </div>
                <div class="vip-progress-wrap">
                    <div class="vip-progress-bar" id="vip-progress-bar"></div>
                </div>
                <div class="vip-actions">
                    ${!AdService.isInCooldown() ? `
                    <button class="vip-btn vip-serve-premium" id="vip-serve-ad"><span class="btn-icon">🎬</span> ${premiumText}</button>
                    ` : ''}
                    <button class="vip-btn vip-serve-cash" id="vip-serve-cash">${serveText}</button>
                </div>
            </div>
        `;
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
        game.state.nextVipVisit = Date.now() + (600 + Math.random() * 60) * 1000;
        game.state.vipVisitExpiry = 0;
        game.state.vipServedTotal = (game.state.vipServedTotal || 0) + 1;
        game.missionsDirty = true;

        if (rewardType === 'shares') {
            playAd(() => {
                let prestigeAmount = typeof game.calculatePrestigeShares === 'function' ? game.calculatePrestigeShares() : 10;
                let shareReward = Math.max(1, Math.ceil(prestigeAmount * 0.30));
                
                game.state.shares = Math.min((game.state.shares || 0) + shareReward, 1000000000);
                const msg = `⭐ ${shareReward} VIP Shares ⭐`;
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
                const msg = `💵 +${formatMoney(cashReward)} 💵`;
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
    }

    // ==========================================
    // DAILY CHALLENGES
    // ==========================================

    function renderDailyChallengesSection() {
        if (!window.game || !window.game.state) return;
        if (!window.dailyChallengeController) return;

        window.dailyChallengeController.checkAndReset();

        const lang = (game.state && game.state.language) || 'en';
        const tObj = translations[lang] || translations.en;
        const container = document.getElementById('daily-challenges-content');
        if (!container) return;

        container.innerHTML = '';

        // Countdown to midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const msToMidnight = tomorrow - now;
        const hToMidnight = Math.floor(msToMidnight / 3600000).toString().padStart(2, '0');
        const mToMidnight = Math.floor((msToMidnight % 3600000) / 60000).toString().padStart(2, '0');
        const resetText = tObj.dailyResetLabel ? tObj.dailyResetLabel(hToMidnight, mToMidnight) : `${hToMidnight}:${mToMidnight}`;

        const headerEl = document.createElement('div');
        headerEl.className = 'daily-header-ai';
        headerEl.innerHTML = `
            <div class="daily-header-title">
                <i class="fas fa-calendar-alt" style="color:var(--text-light); margin-left:8px;"></i> ${tObj.dailyChallengesTitle || 'אתגרי היום'}
            </div>
            <div class="daily-header-box">
                <span class="daily-subtitle">${tObj.dailyChallengesSubtitle || '3 אתגרים קשים שמתאפסים בחצות'}</span>
                <span class="daily-reset-timer">מתאפס בעוד ${resetText}</span>
            </div>
        `;
        container.appendChild(headerEl);

        const challenges = game.state.dailyChallenges || [];

        if (challenges.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.style.color = 'var(--text-muted)';
            emptyEl.style.textAlign = 'center';
            emptyEl.style.padding = '1rem';
            emptyEl.textContent = tObj.loadingChallengesMsg || 'Loading...';
            container.appendChild(emptyEl);
            return;
        }

        challenges.forEach((c, idx) => {
            const typeLabel = (tObj.dailyChallengeTypes && tObj.dailyChallengeTypes[c.type]) || c.type;
            const pct = c.target > 0 ? Math.min(100, Math.floor((c.progress / c.target) * 100)) : 0;
            const rewardText = c.reward && c.reward.type === 'gold'
                ? (tObj.dailyRewardGold ? tObj.dailyRewardGold(c.reward.amount) : `+${c.reward.amount} gold`)
                : (tObj.dailyRewardShares ? tObj.dailyRewardShares(c.reward.amount) : `+${c.reward.amount}`);

            const card = document.createElement('div');
            card.className = 'daily-challenge-card' + (c.completed ? ' completed' : '') + (c.claimed ? ' claimed' : '');
            card.innerHTML = `
                <div class="daily-card-top">
                    <span class="daily-reward-pill">${rewardText}</span>
                    <span class="daily-card-title">${typeLabel} <i class="fas fa-star" style="color:#fde047; margin-right:5px;"></i></span>
                </div>
                <div class="daily-card-progress">
                    <div class="daily-progress-wrap">
                        <div class="daily-progress-fill" style="width:${pct}%"></div>
                    </div>
                </div>
                <div class="daily-card-bottom">
                    ${c.completed && !c.claimed
                        ? `<button class="daily-claim-btn" data-idx="${idx}">${tObj.dailyClaimBtn || 'קבל פרס'}</button>
                           <span class="daily-amount-text">${formatMoney(c.progress)} / ${formatMoney(c.target)}</span>`
                        : c.claimed
                            ? `<span class="daily-claimed-label">${tObj.dailyClaimedLabel || 'נאסף'}</span>
                               <span class="daily-amount-text">${formatMoney(c.progress)} / ${formatMoney(c.target)}</span>`
                            : `<span class="daily-pct-text">${pct}%</span>
                               <span class="daily-amount-text">${formatMoney(c.progress)} / ${formatMoney(c.target)}</span>`
                    }
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.daily-claim-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window._isClaimingDaily) return;
                window._isClaimingDaily = true;
                setTimeout(() => { window._isClaimingDaily = false; }, 500);

                initSound();
                const idx = parseInt(btn.getAttribute('data-idx'));
                const claimed = window.dailyChallengeController.claimReward(idx);
                if (claimed) {
                    btn.disabled = true;
                    const lang2 = (game.state && game.state.language) || 'en';
                    const tObj2 = translations[lang2] || translations.en;
                    const c = game.state.dailyChallenges[idx];
                    let msg = '+1';
                    if (c && c.reward) {
                        msg = c.reward.type === 'gold'
                            ? (tObj2.dailyRewardGold ? tObj2.dailyRewardGold(c.reward.amount) : `+${c.reward.amount}`)
                            : (tObj2.dailyRewardShares ? tObj2.dailyRewardShares(c.reward.amount) : `+${c.reward.amount}`);
                    }
                    spawnFloating(msg, window.innerWidth / 2, window.innerHeight / 2 - 40, 'gold');
                    if (window.gameAudio && typeof window.gameAudio.playUnlock === 'function') window.gameAudio.playUnlock();
                    renderDailyChallengesSection();
                    draw();
                }
            });
        });
    }

    // ==========================================
    // END OF NEW FEATURES
    // ==========================================

    // Exports
    window.applyLanguage = applyLanguage;
    window.applyTheme = applyTheme;
    window.playAd = playAd;
    window.formatTime = formatTime;
    window.openPrestigeModal = openPrestigeModal;
    window.openBoostModal = openBoostModal;
    window.openAnalyticsModal = openAnalyticsModal;
    window.handleCrowdEvent = handleCrowdEvent;
    window.handleSecurityEvent = handleSecurityEvent;
    window.startPromoRecording = function(durationMs = 15000) {
        // Create a 'Start Recording' button to satisfy Chrome's user gesture requirement
        const startBtn = document.createElement('button');
        startBtn.innerHTML = '🔴 התחל הקלטה עכשיו!';
        startBtn.style.cssText = 'position:fixed; top:40%; left:50%; transform:translate(-50%, -50%); z-index:999999; padding:20px 40px; font-size:24px; font-weight:bold; background:#e74c3c; color:white; border:4px solid white; border-radius:15px; cursor:pointer; box-shadow:0 10px 40px rgba(0,0,0,0.8);';
        
        startBtn.onclick = async () => {
            startBtn.remove(); // Remove this button
            
            // Optimize for recording: force English and remove heavy backdrop filter
            if (game) { game.state.language = 'en'; draw(); }
            const s = document.createElement('style');
            s.innerHTML = '* { backdrop-filter: none !important; }';
            document.head.appendChild(s);

            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: { ideal: 60 } },
                    audio: false
                });
                let mediaRecorder;
                try { mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9', videoBitsPerSecond: 8000000 }); }
                catch { mediaRecorder = new MediaRecorder(stream); }
                
                const chunks = [];
                mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    
                    // Show a giant download button on screen to bypass browser auto-download blocks
                    const btn = document.createElement('button');
                    btn.innerHTML = '🎥 הסרטון מוכן! לחץ כאן להורדה';
                    btn.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:999999; padding:20px 40px; font-size:24px; font-weight:bold; background:#4CAF50; color:white; border:4px solid white; border-radius:15px; cursor:pointer; box-shadow:0 10px 40px rgba(0,0,0,0.8);';
                    
                    btn.onclick = () => {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'idle_bank_promo_en.webm';
                        document.body.appendChild(a);
                        a.click();
                        btn.innerHTML = '✅ מעולה! הקובץ יורד';
                        setTimeout(() => btn.remove(), 3000);
                    };
                    document.body.appendChild(btn);

                    stream.getTracks().forEach(track => track.stop());
                    console.log("🎬 Promo Recording ready! Waiting for user to click download button.");
                    s.remove(); // Restore styling after recording
                };
                mediaRecorder.start();
                console.log(`🎥 Recording started! Will automatically stop and download after ${durationMs / 1000} seconds.`);
                setTimeout(() => mediaRecorder.stop(), durationMs);
            } catch(err) {
                console.error("Screen recording was cancelled or failed:", err);
                s.remove();
            }
        };
        document.body.appendChild(startBtn);
        console.log("Waiting for user to click the start button...");
    };

    // ==========================================
    // PARTICLE EFFECTS — spawnVaultCoins
    // ==========================================

    function spawnVaultCoins(amount, btnRect) {
        if (!btnRect) return;
        const count = Math.min(8, Math.max(2, Math.floor(Math.log10(amount + 1))));
        const cx = btnRect.left + btnRect.width / 2;
        const cy = btnRect.top;
        for (var i = 0; i < count; i++) {
            (function(idx) {
                setTimeout(function() {
                    const drift = (Math.random() - 0.5) * 80;
                    spawnFloating('💰', cx + drift, cy - 10 - Math.random() * 20, 'gold');
                }, idx * 80);
            })(i);
        }
    }

    // ==========================================
    // DISCOVERY TIPS SYSTEM
    // ==========================================
    // Shows a contextual bottom panel the first time a player
    // reaches something new. Tips are queued and shown one at a time.

    var DISCOVERY_TIPS = {
        start: {
            he: { icon: '🏦', title: 'ברוכים הבאים לבנק שלך!', body: 'לחץ "אסוף" על הדלפק כדי לאסוף כסף מלקוחות. לאחר מכן לחץ "רוקן כספת" להוסיף את הכסף ליתרה שלך.' },
            en: { icon: '🏦', title: 'Welcome to your bank!', body: 'Tap "Collect" on a teller desk to gather cash from customers. Then tap "Empty Vault" to add it to your balance.' },
            es: { icon: '🏦', title: '¡Bienvenido a tu banco!', body: 'Toca "Cobrar" en una caja para recolectar dinero. Luego toca "Vaciar Bóveda" para añadirlo a tu saldo.' },
            ru: { icon: '🏦', title: 'Добро пожаловать в банк!', body: 'Нажми «Собрать» у кассы, чтобы собрать деньги. Потом нажми «Опустошить хранилище», чтобы добавить их на счёт.' }
        },
        vault: {
            he: { icon: '🔐', title: 'הכספת מחכה לך!', body: 'הדלפקים שלחו כסף לכספת. לחץ "רוקן כספת" להוסיף אותו ליתרה. שדרג את הכספת כדי שתחזיק יותר כסף.' },
            en: { icon: '🔐', title: 'The vault is waiting!', body: 'Tellers have sent cash to the vault. Tap "Empty Vault" to add it to your balance. Upgrade the vault to hold more.' },
            es: { icon: '🔐', title: '¡La bóveda te espera!', body: 'Las cajas han enviado dinero a la bóveda. Toca "Vaciar Bóveda" para añadirlo a tu saldo. Mejora la bóveda para que guarde más.' },
            ru: { icon: '🔐', title: 'Хранилище ждёт!', body: 'Кассы отправили деньги в хранилище. Нажми «Опустошить», чтобы добавить их на счёт. Улучши хранилище, чтобы оно вмещало больше.' }
        },
        guard: {
            he: { icon: '🚐', title: 'גילית: בלדרים!', body: 'הבלדר מעביר כסף מהדלפקים לכספת אוטומטית — בלי שתצטרך ללחוץ. שדרג אותו כדי שיעביר מהר יותר ויכיל יותר.' },
            en: { icon: '🚐', title: 'Discovered: Couriers!', body: 'The courier automatically transfers cash from tellers to the vault — no tapping needed. Upgrade it for faster and larger transfers.' },
            es: { icon: '🚐', title: '¡Descubriste: Mensajeros!', body: 'El mensajero transfiere dinero de las cajas a la bóveda automáticamente. ¡Mejóralo para transferencias más rápidas y mayores!' },
            ru: { icon: '🚐', title: 'Открытие: Курьеры!', body: 'Курьер автоматически переносит деньги из касс в хранилище — без нажатий. Улучши его для большей скорости и вместимости.' }
        },
        dept: {
            he: { icon: '🏢', title: 'גילית: מחלקות!', body: 'כל מחלקה שפותחים מכפילה את ההכנסה הכוללת של הבנק. פתח כמה שיותר מחלקות כדי לגדול מהר יותר.' },
            en: { icon: '🏢', title: 'Discovered: Departments!', body: 'Each department you unlock multiplies your total income. Open as many as possible to grow faster.' },
            es: { icon: '🏢', title: '¡Descubriste: Departamentos!', body: 'Cada departamento que abres multiplica los ingresos totales. Abre tantos como puedas para crecer más rápido.' },
            ru: { icon: '🏢', title: 'Открытие: Отделы!', body: 'Каждый открытый отдел умножает общий доход банка. Открывай как можно больше, чтобы расти быстрее.' }
        },
        manager: {
            he: { icon: '👔', title: 'גילית: מנהלים!', body: 'המנהל ממשיך לעבוד גם כשסוגרים את המשחק! שכור מנהלים לדלפקים ולבלדרים כדי שהבנק ירוץ לגמרי אוטומטי.' },
            en: { icon: '👔', title: 'Discovered: Managers!', body: 'The manager keeps working even when you close the game! Hire managers for tellers and couriers so the bank runs fully automatically.' },
            es: { icon: '👔', title: '¡Descubriste: Gerentes!', body: '¡El gerente sigue trabajando aunque cierres el juego! Contrata gerentes para cajas y mensajeros para automatizar el banco.' },
            ru: { icon: '👔', title: 'Открытие: Менеджеры!', body: 'Менеджер продолжает работать даже когда ты закрываешь игру! Нанимай менеджеров для касс и курьеров, чтобы банк работал автоматически.' }
        },
        prestige: {
            he: { icon: '⭐', title: 'הגיע הזמן ל-Prestige!', body: 'הבנק צמח מספיק. לחץ על "סניפים" ובחר Prestige — הבנק יתאפס, אבל תקבל מניות זהב שמגדילות את כל ההכנסה לצמיתות!' },
            en: { icon: '⭐', title: "Time to Prestige!", body: 'Your bank is big enough. Go to "Branches" and choose Prestige — the bank resets, but you earn Gold Shares that permanently multiply all income!' },
            es: { icon: '⭐', title: '¡Hora del Prestige!', body: 'Tu banco ya es suficientemente grande. Ve a "Sucursales" y elige Prestige — el banco se reinicia, pero obtienes Acciones de Oro que multiplican permanentemente todos los ingresos.' },
            ru: { icon: '⭐', title: 'Время для Prestige!', body: 'Банк достаточно вырос. Перейди в «Филиалы» и выбери Prestige — банк сбросится, но ты получишь Золотые Акции, которые навсегда умножат доход!' }
        },
        fortune: {
            he: { icon: '🎡', title: 'גילית: גלגל המזל!', body: 'הגלגל מתאפס כל 24 שעות. חזור כל יום לסובב ולזכות בכסף, מניות, או בונוסים.' },
            en: { icon: '🎡', title: 'Discovered: Fortune Wheel!', body: 'The wheel resets every 24 hours. Come back daily to spin and win cash, shares, or bonuses.' },
            es: { icon: '🎡', title: '¡Descubriste: la Ruleta!', body: 'La ruleta se reinicia cada 24 horas. Vuelve cada día para girarla y ganar dinero, acciones o bonificaciones.' },
            ru: { icon: '🎡', title: 'Открытие: Колесо Фортуны!', body: 'Колесо перезаряжается каждые 24 часа. Возвращайся каждый день, чтобы крутить и выигрывать деньги, акции или бонусы.' }
        }
    };

    var _discoveryQueue = [];
    var _discoveryActive = false;

    function showDiscoveryTip(key) {
        if (!window.game || !window.game.state) return;
        if (!DISCOVERY_TIPS[key]) return;

        if (!window.game.state.discoveredTips) window.game.state.discoveredTips = {};
        if (window.game.state.discoveredTips[key]) return;

        window.game.state.discoveredTips[key] = true;
        window.game.saveGame();

        _discoveryQueue.push(key);
        if (!_discoveryActive) _nextDiscoveryTip();
    }

    function _nextDiscoveryTip() {
        if (_discoveryQueue.length === 0) { _discoveryActive = false; return; }
        _discoveryActive = true;
        var key = _discoveryQueue.shift();
        var tipSet = DISCOVERY_TIPS[key];
        if (!tipSet) { _nextDiscoveryTip(); return; }

        var lang = (window.game && window.game.state && window.game.state.language) || 'en';
        var tip = tipSet[lang] || tipSet.he;

        var panel   = document.getElementById('discovery-tip-panel');
        var iconEl  = document.getElementById('discovery-tip-icon');
        var titleEl = document.getElementById('discovery-tip-title');
        var bodyEl  = document.getElementById('discovery-tip-body');
        if (!panel || !iconEl || !titleEl || !bodyEl) { _discoveryActive = false; return; }

        iconEl.textContent  = tip.icon;
        titleEl.textContent = tip.title;
        bodyEl.textContent  = tip.body;

        var btnLabels = { he: 'הבנתי!', en: 'Got it!', es: '¡Entendido!', ru: 'Понял!' };
        var tipBtn = document.getElementById('discovery-tip-btn');
        if (tipBtn) tipBtn.textContent = btnLabels[lang] || 'Got it!';

        panel.classList.add('visible');
    }

    function _dismissDiscoveryTip() {
        var panel = document.getElementById('discovery-tip-panel');
        if (panel) panel.classList.remove('visible');
        _discoveryActive = false;
        if (_discoveryQueue.length > 0) setTimeout(_nextDiscoveryTip, 500);
    }

    function initTutorialEvents() {
        var btn = document.getElementById('discovery-tip-btn');
        if (btn) btn.addEventListener('click', function() { initSound(); _dismissDiscoveryTip(); });
    }

    function maybeStartTutorial() {
        if (!window.game || !window.game.state) return;
        if (!window.game.state.discoveredTips) window.game.state.discoveredTips = {};
        var tips = window.game.state.discoveredTips;
        var isNew = !tips.start &&
                    window.game.state.lifetimeCash <= 300 &&
                    !window.game.state.shares &&
                    !(window.game.state.missionsCompleted > 0);
        if (isNew) setTimeout(function() {
            // Wait for the language/offline/login-reward modal cascade to clear before showing the first tip
            var tryShow = function() {
                if (document.querySelector('.modal-overlay.active')) {
                    setTimeout(tryShow, 1000);
                    return;
                }
                showDiscoveryTip('start');
            };
            tryShow();
        }, 2500);
    }

    function checkPrestigeTip() {
        if (!window.game || !window.game.state) return;
        if (!window.game.state.discoveredTips) window.game.state.discoveredTips = {};
        if (window.game.state.discoveredTips.prestige) return;
        var branch = window.game.branches && window.game.branches[window.game.state.currentBranch];
        if (branch && window.game.state.cash >= branch.minCashToPrestige) {
            showDiscoveryTip('prestige');
        }
    }

    window.showDiscoveryTip   = showDiscoveryTip;
    window.checkPrestigeTip   = checkPrestigeTip;
    window.showTutorialStep   = function() {};
    window.completeTutorial   = function() {};
    window.maybeStartTutorial = maybeStartTutorial;
    window.spawnVaultCoins = spawnVaultCoins;

    window.handleRescueEvent = handleRescueEvent;
    window.handleRushHoursEvent = handleRushHoursEvent;
    window.handleInvestorEvent = handleInvestorEvent;
    window.triggerRandomEvent = triggerRandomEvent;
    window.updateAdvDisplay = updateAdvDisplay;
    window.updateMuteButton = updateMuteButton;
    window.initSound = initSound;
    window.handlePurchaseFeedback = handlePurchaseFeedback;
    window.handleMissionRedirect = handleMissionRedirect;
    window.tick = tick;
    window.initUIEvents = initUIEvents;
    window.syncBottomNav = syncBottomNav;
    window.updateVaultMiniBar = updateVaultMiniBar;
    window.openFortuneWheel = openFortuneWheel;
    window.triggerVipVisitBanner = triggerVipVisitBanner;
    window.removeVipVisitBanner = removeVipVisitBanner;
    window.serveVipVisitor = serveVipVisitor;
    window.renderDailyChallengesSection = renderDailyChallengesSection;
    window.showLoginRewardModal = showLoginRewardModal;
    window.triggerPrestigeCeremony = triggerPrestigeCeremony;
})(window);

