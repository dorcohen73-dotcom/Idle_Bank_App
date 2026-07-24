import { updateMuteButton } from './ads.js';
import { updateCachedSuffixes } from '../draw/format.js';

export function applyLanguage(lang) {
    window.gameLanguage = lang;
    updateCachedSuffixes(lang);
    if (typeof window.updateCachedSuffixes === 'function') {
        window.updateCachedSuffixes(lang);
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
    const notifLabel = document.getElementById('settings-notif-label');
    if (notifLabel) {
        notifLabel.innerText = tObj.settingsNotifLabel || 'התראות דחיפה';
    }
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
    const settingsTermsLink = document.getElementById('settings-terms-link');
    if (settingsTermsLink) settingsTermsLink.innerText = tObj.termsOfServiceLink || '📜 Terms of Service';

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
    if (DOM_CACHE.footerTermsLink) DOM_CACHE.footerTermsLink.innerText = tObj.footerTermsLink || 'Terms of Service';
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

export function applyTheme(themeName) {
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
