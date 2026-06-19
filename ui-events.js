(function(window) {
// UI Events & main loop module for Idle Bank Empire

var soundInitialized = false;
var autoSaveTimer = 0;
var eventTimer = 0;
var tabRefreshTimer = 0;
var contextualOfferTimeout = null;
var contextualBannerShown = false;
var boostOfferEndTime = 0;
var boostOfferNextTime = 0;

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
    if (DOM_CACHE.labelGuardClickHint) DOM_CACHE.labelGuardClickHint.innerText = tObj.guardClickHint;
    if (DOM_CACHE.labelVaultTitle) DOM_CACHE.labelVaultTitle.innerText = tObj.vaultTitle;
    if (DOM_CACHE.labelVaultLoading) DOM_CACHE.labelVaultLoading.innerText = tObj.vaultLoading;
    if (DOM_CACHE.vaultEmptyBtn) DOM_CACHE.vaultEmptyBtn.innerText = tObj.collectVault;
    if (DOM_CACHE.labelVaultSubtitle) DOM_CACHE.labelVaultSubtitle.innerText = tObj.vaultSubtitle;
    if (DOM_CACHE.labelVaultYieldTitle) DOM_CACHE.labelVaultYieldTitle.innerText = tObj.vaultYieldTitle;
    if (DOM_CACHE.labelVaultYieldSub) DOM_CACHE.labelVaultYieldSub.innerText = tObj.vaultYieldSub;
    if (DOM_CACHE.labelVaultCapTitle) DOM_CACHE.labelVaultCapTitle.innerText = tObj.vaultCapLabel || tObj.vaultCap;
    if (DOM_CACHE.labelVaultVolumeTitle) DOM_CACHE.labelVaultVolumeTitle.innerText = tObj.vaultVolume;
    if (DOM_CACHE.labelCollectVaultBtn) DOM_CACHE.labelCollectVaultBtn.innerText = tObj.collectVault;
    
    if (DOM_CACHE.tabBtnUpgrades) DOM_CACHE.tabBtnUpgrades.innerText = tObj.tabUpgrades;
    if (DOM_CACHE.tabBtnManagers) DOM_CACHE.tabBtnManagers.innerText = tObj.tabManagers;
    if (DOM_CACHE.tabBtnDepartments) DOM_CACHE.tabBtnDepartments.innerText = tObj.tabDepartments;
    if (DOM_CACHE.tabBtnMissions) {
        const baseText = tObj.tabMissions.replace('🏆', '').trim();
        DOM_CACHE.tabBtnMissions.innerHTML = `${baseText} <span aria-hidden="true">🏆</span>`;
    }
    if (DOM_CACHE.tabBtnBranches) DOM_CACHE.tabBtnBranches.innerText = tObj.tabBranches;
    
    if (DOM_CACHE.labelFooter) DOM_CACHE.labelFooter.innerText = tObj.footerText;
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
    if (activeTab === 'upgrades' && typeof window.renderUpgradesTab === 'function') window.renderUpgradesTab();
    else if (activeTab === 'managers' && typeof window.renderManagersTab === 'function') window.renderManagersTab();
    else if (activeTab === 'departments' && typeof window.renderDepartmentsTab === 'function') window.renderDepartmentsTab();
    else if (activeTab === 'missions' && typeof window.renderMissionsTab === 'function') window.renderMissionsTab();
    else if (activeTab === 'branches' && typeof window.renderBranchesTab === 'function') window.renderBranchesTab();
    
    if (DOM_CACHE.labelAdvControl) DOM_CACHE.labelAdvControl.title = tObj.tooltips.adv;
    if (DOM_CACHE.securityPath) DOM_CACHE.securityPath.title = tObj.tooltips.guard;
    if (DOM_CACHE.vaultGraphic) DOM_CACHE.vaultGraphic.title = tObj.tooltips.vault;

    updateMuteButton();
    rebuildTellersDOM();
    draw();
}

function applyTheme(themeName) {
    const root = document.documentElement;
    if (themeName === 'white') {
        root.style.setProperty('--bg-color', '#f3f4f6');
        root.style.setProperty('--surface-color', 'rgba(255, 255, 255, 0.85)');
        root.style.setProperty('--surface-hover', 'rgba(255, 255, 255, 0.98)');
        root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
        root.style.setProperty('--text-main', '#1f2937');
        root.style.setProperty('--text-muted', '#6b7280');
        document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, rgba(223, 171, 41, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%)';
    } else if (themeName === 'blue') {
        root.style.setProperty('--bg-color', '#0a1128');
        root.style.setProperty('--surface-color', 'rgba(12, 24, 68, 0.75)');
        root.style.setProperty('--surface-hover', 'rgba(20, 38, 100, 0.9)');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--text-main', '#f3f4f6');
        root.style.setProperty('--text-muted', '#9ca3af');
        document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, rgba(0, 100, 255, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%)';
    } else {
        root.style.setProperty('--bg-color', '#0c0e14');
        root.style.setProperty('--surface-color', 'rgba(20, 24, 36, 0.7)');
        root.style.setProperty('--surface-hover', 'rgba(30, 36, 52, 0.85)');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--text-main', '#f3f4f6');
        root.style.setProperty('--text-muted', '#9ca3af');
        document.body.style.backgroundImage = 'radial-gradient(at 0% 0%, rgba(223, 171, 41, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(20, 24, 36, 0.3) 0px, transparent 100%)';
    }
    
    document.querySelectorAll('.theme-option-btn-choice').forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    window.localStorage.setItem('idle_bank_theme', themeName);
}

var AdService = {
    _isShowing: false,
    show: function(callback) {
        if (AdService._isShowing) return;
        AdService._isShowing = true;

        // Safety timeout to force _isShowing = false after max 15 seconds if overlay is missing
        setTimeout(() => {
            if (AdService._isShowing && !document.querySelector('.ad-playing-overlay')) {
                AdService._isShowing = false;
            }
        }, 15000);

        try {
            const overlay = document.createElement('div');
            overlay.className = 'ad-playing-overlay';
            
            const lang = (window.game && window.game.state && window.game.state.language) || 'he';
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
            const interval = setInterval(() => {
                timeLeft--;
                const countdownEl = overlay.querySelector('.ad-countdown');
                if (countdownEl) countdownEl.innerText = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    AdService._isShowing = false;
                    if (overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                    if (callback) callback();
                }
            }, 1000);

            const closeBtn = overlay.querySelector('.ad-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    clearInterval(interval);
                    AdService._isShowing = false;
                    if (overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                });
            }
        } catch (err) {
            console.error("AdService failed to display:", err);
            AdService._isShowing = false;
        }
    }
};

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
    const lang = game.state.language || 'he';
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
    if (elGained) elGained.innerText = `+${sharesGained}`;
    if (elDoubled) elDoubled.innerText = `${sharesGained * 3}`;
    if (elAdBtn) elAdBtn.innerText = tObj.prestigeAdBtn(sharesGained * 3);
    if (elRegularBtn) elRegularBtn.innerText = tObj.prestigeRegularBtn;
    if (elCancelBtn) elCancelBtn.innerText = tObj.prestigeCancelBtn;
    if (elRewardLabel) elRewardLabel.innerText = tObj.prestigeRewardLabel;
    
    const modal = document.getElementById('prestige-modal');
    if (modal) {
        modal.setAttribute('data-target-branch', target);
        modal.classList.add('active');
    }
}

function openBoostModal() {
    const lang = game.state.language || 'he';
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
    
    const btnAd = document.createElement('button');
    btnAd.className = 'event-option-btn ad-option';
    btnAd.innerHTML = `
        <div class="event-option-title">${lang === 'he' ? '🎬 צפה בפרסומת והפעל בוסט' : '🎬 Watch Ad & Activate'}</div>
        <div class="event-option-desc">${lang === 'he' ? 'מוסיף 4 שעות של רווח כפול (עד 8 שעות)' : 'Adds 4 hours of double earnings (up to 8h)'}</div>
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
        <div class="event-option-title">${lang === 'he' ? 'ביטול' : 'Cancel'}</div>
        <div class="event-option-desc">${lang === 'he' ? 'חזור למשחק' : 'Back to game'}</div>
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
    
    const lang = game.state.language || 'he';
    const tObj = translations[lang];
    
    document.getElementById('analytics-modal-title').innerText = tObj.analyticsTitle;
    document.getElementById('analytics-title-general').innerText = lang === 'he' ? 'נתונים כלליים' : 'General Stats';
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
                <strong>${formatMoney(tellerEps)}/${lang === 'he' ? 'שנייה' : 'sec'}</strong>
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
    investor: handleInvestorEvent
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
            const msg = lang === 'he' ? `התרחשה פריצה! איבדת ${formatMoney(lost)} מהכספת.` : `Break-in occurred! You lost ${formatMoney(lost)} from the vault.`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, 'warning');
            } else {
                console.warn(msg);
            }
        } else {
            const payout = Math.round(game.state.cash * 0.05 * game.getEventBonusMultiplier());
            game.addCash(payout);
            const msg = lang === 'he' ? `האבטחה הדפה את הפורצים! קיבלת מענק ביטוחי של ${formatMoney(payout)}.` : `Security held the line! You received an insurance payout of ${formatMoney(payout)}.`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, 'success');
            } else {
                console.log(msg);
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

function triggerRandomEvent() {
    if (document.querySelector('.modal-overlay.active')) return;
    
    const lang = game.state.language || 'he';
    const tObj = translations[lang];
    
    let eventType = 'crowd';
    const rescueThreshold = 2000 * Math.pow(6, game.state.currentBranch);
    const currentEps = game.getEarningsPerSecond();
    if (game.state.cash < rescueThreshold && 
        game.state.vault.cashStored < rescueThreshold && 
        currentEps * 30 < rescueThreshold) {
        eventType = 'rescue';
    } else {
        const rand = Math.random();
        if (rand < 0.25) {
            eventType = 'crowd';
        } else if (rand < 0.50) {
            eventType = 'security';
        } else if (rand < 0.75) {
            eventType = 'rush_hours';
        } else {
            eventType = 'investor';
        }
    }
    
    const eventModal = document.getElementById('event-modal');
    if (!eventModal) return;
    const modalBox = eventModal.querySelector('.modal-box');
    if (!modalBox) return;
    
    modalBox.classList.remove('event-crowd', 'event-security', 'event-rescue', 'event-rush_hours', 'event-investor');
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
    
    const eObj = tObj.events[eventType];
    
    iconEl.innerText = eventType === 'crowd' ? '👥' : (eventType === 'security' ? '🚨' : (eventType === 'rush_hours' ? '⚡' : (eventType === 'investor' ? '💼' : '🏛️')));
    titleEl.innerText = eObj.title;
    textEl.innerText = eObj.desc;
    container.innerHTML = '';
    
    const handler = EVENT_HANDLERS[eventType];
    if (handler) {
        handler(container, lang, tObj, eObj, eventModal);
    }
    
    eventModal.classList.add('active');
}

function updateAdvDisplay(budget) {
    if (!DOM_CACHE.advDisplay) return;
    const lang = game.state.language || 'he';
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
    const lang = window.gameLanguage || 'he';
    const tObj = translations[lang] || translations.he;
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
        }
        soundInitialized = true;
    }
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
    
    if (spent > 0) {
        spawnFloating(`-$${formatMoney(spent)}`, x, y, 'red');
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
        case 'spend_cash':
            tabName = 'upgrades';
            selector = '.buy-btn[data-type="teller"][data-id="0"], .buy-btn[data-action="unlock-teller"][data-id="0"]';
            break;
        case 'hire_managers':
        case 'upgrade_managers':
            tabName = 'managers';
            selector = '.mgr-buy-btn';
            break;
        case 'unlock_departments':
            tabName = 'departments';
            selector = '.dept-action-btn:not(.active)';
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
            const card = targetBtn.closest('.upgrade-card, .prestige-panel, .gold-upgrade-card');
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('mission-highlight');
                setTimeout(() => {
                    card.classList.remove('mission-highlight');
                }, 2500);
            }
        }
    }, 150);
}

function showContextualAdBanner(type) {
    if (game.state.boost2xTimeLeft > 0) return;
    if (document.querySelector('.modal-overlay.active')) return;
    if (contextualBannerShown) return;

    const lang = (game.state && game.state.language) || 'he';
    const existing = document.getElementById('contextual-offer-banner');
    if (existing) existing.remove();

    const msgs = {
        vip: lang === 'he' ? '💎 לקוח VIP שורת! הכפל רווח עם פרסומת?' : '💎 VIP served! Double your reward?',
        milestone: lang === 'he' ? '🎉 יעד כסף הושג! הפעל בוסט x2?' : '🎉 Cash milestone! Activate x2 boost?'
    };
    const msg = msgs[type] || msgs.vip;

    const banner = document.createElement('div');
    banner.id = 'contextual-offer-banner';
    banner.innerHTML = `
        <span style="font-size:0.82rem; color:var(--text-main); flex:1;">${msg}</span>
        <button id="ctx-offer-yes" style="background:var(--primary-gold,#dfab29); color:#000; border:none; padding:0.28rem 0.7rem; border-radius:8px; font-size:0.78rem; cursor:pointer; font-weight:700; white-space:nowrap;">🎬 צפה</button>
        <button id="ctx-offer-no" style="background:transparent; border:1px solid var(--border-color,rgba(255,255,255,0.1)); color:var(--text-muted,#9ca3af); padding:0.28rem 0.5rem; border-radius:8px; font-size:0.78rem; cursor:pointer;">✕</button>
    `;
    Object.assign(banner.style, {
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
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
            spawnFloating(lang === 'he' ? '⚡ בוסט x2 הופעל!' : '⚡ Boost x2 activated!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    document.getElementById('ctx-offer-no').addEventListener('click', () => {
        initSound();
        removeBanner();
    });

    contextualOfferTimeout = setTimeout(removeBanner, 9000);
}

function openWeeklyRewardModal() {
    const lang = (game.state && game.state.language) || 'he';
    const modal = document.getElementById('weekly-modal');
    if (!modal) return;

    const titleEl = document.getElementById('weekly-modal-title');
    const textEl = document.getElementById('weekly-modal-text');
    const statsBox = document.getElementById('weekly-stats-box');

    if (titleEl) titleEl.innerText = lang === 'he' ? '🏆 שבוע מצוין!' : '🏆 Great Week!';
    if (textEl) textEl.innerText = lang === 'he'
        ? 'עברת שבוע מלא של ניהול אימפריה. הצוות שלך ממתין לדרבן!'
        : 'A full week of running your empire! Your team is ready for a boost!';

    if (statsBox) {
        const eps = game.getEarningsPerSecond ? game.getEarningsPerSecond() : 0;
        const served = (game.state.stats && game.state.stats.clientsServed) || 0;
        const shares = game.state.shares || 0;
        statsBox.innerHTML = lang === 'he'
            ? `💰 רווח לשנייה: <strong>${formatMoney(eps)}</strong><br>👥 לקוחות שטופלו: <strong>${served.toLocaleString()}</strong><br>⭐ מניות זהב: <strong>${shares}</strong>`
            : `💰 EPS: <strong>${formatMoney(eps)}</strong><br>👥 Clients served: <strong>${served.toLocaleString()}</strong><br>⭐ Gold shares: <strong>${shares}</strong>`;
    }

    const adBtn = document.getElementById('weekly-ad-btn');
    const closeBtn = document.getElementById('weekly-close-btn');

    if (adBtn) {
        adBtn.onclick = () => {
            initSound();
            modal.classList.remove('active');
            playAd(() => {
                game.addBoost2x(8);
                game.state.lastWeeklyReward = Date.now();
                draw();
                spawnFloating(lang === 'he' ? '⚡ בוסט 8 שעות!' : '⚡ 8h Boost!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
            });
        };
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

    modal.classList.add('active');
}

function checkWeeklyReward() {
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const last = (game.state && game.state.lastWeeklyReward) || 0;
    if (Date.now() - last >= ONE_WEEK_MS) {
        const tryShow = () => {
            if (!document.querySelector('.modal-overlay.active')) {
                openWeeklyRewardModal();
            } else {
                setTimeout(tryShow, 1500);
            }
        };
        setTimeout(tryShow, 4000);
    }
}

function tick(timestamp) {
    try {
        const dt = (timestamp - lastTime) / 1000.0;
        lastTime = timestamp;

        const cappedDt = Math.min(1.0, dt);

        game.update(cappedDt);
        updateActiveCoins(cappedDt);

        // Contextual ad offer
        if (game._contextualAdPending) {
            const pendingType = game._contextualAdPending;
            game._contextualAdPending = null;
            showContextualAdBanner(pendingType);
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
                    // Start new offer window: 10-20 min duration
                    boostOfferEndTime = now + (600 + Math.random() * 600) * 1000;
                    boostOfferNextTime = 0;
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
            updateButtonAffordability();
        }

        draw();

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
            const crashMsg = (game.state && game.state.language === 'en') ? 
                'A critical error occurred! Game progress was saved.' : 
                'שגיאה קריטית התרחשה! המשחק נשמר.';
            window.showToast(crashMsg, 'danger');
        }
        
        let overlay = document.getElementById('crash-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'crash-overlay';
            
            const title = document.createElement('h1');
            title.innerText = window.gameLanguage === 'he' ? 'אופס! משהו השתבש' : 'Oops! Something went wrong';
            
            const desc = document.createElement('p');
            desc.innerText = window.gameLanguage === 'he' ? 
                'התרחשה שגיאה בלתי צפויה בלולאת המשחק. ההתקדמות שלך נשמרה בבטחה.' : 
                'An unexpected error occurred in the game loop. Your progress has been saved.';
            
            const reloadBtn = document.createElement('button');
            reloadBtn.innerText = window.gameLanguage === 'he' ? 'טען מחדש 🔄' : 'Reload Game 🔄';
            reloadBtn.addEventListener('click', () => window.location.reload());
            
            overlay.appendChild(title);
            overlay.appendChild(desc);
            overlay.appendChild(reloadBtn);
            document.body.appendChild(overlay);
        }
    }
}

let uiEventsInitialized = false;

function initUIEvents() {
    if (uiEventsInitialized) return;
    uiEventsInitialized = true;
    if (DOM_CACHE.resetBtn) {
        DOM_CACHE.resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            initSound();
            if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }
            
            const lang = game.state.language || 'he';
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
            if (e.target === DOM_CACHE.langModal && window.localStorage.getItem('idle_bank_language_chosen')) {
                try {
                    initSound();
                    DOM_CACHE.langModal.classList.remove('active');
                } catch (err) {
                    console.error("Error closing language modal on overlay click:", err);
                }
            }
        });
    }

    if (DOM_CACHE.advSlider) {
        DOM_CACHE.advSlider.addEventListener('input', () => {
            const sliderVal = parseInt(DOM_CACHE.advSlider.value);
            const dynamicMax = game.getAdMaxBudget();
            let budget = 0;
            if (sliderVal > 0) {
                budget = Math.round(dynamicMax * Math.pow(sliderVal / 1000, 3));
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
            if (targetPane) targetPane.classList.add('active');
            
            if (DOM_CACHE.bulkSelector) {
                if (tabId === 'upgrades' || tabId === 'managers') {
                    DOM_CACHE.bulkSelector.style.display = 'flex';
                } else {
                    DOM_CACHE.bulkSelector.style.display = 'none';
                }
            }
            
            if (tabId === 'upgrades' && typeof window.renderUpgradesTab === 'function') window.renderUpgradesTab();
            else if (tabId === 'managers' && typeof window.renderManagersTab === 'function') window.renderManagersTab();
            else if (tabId === 'departments' && typeof window.renderDepartmentsTab === 'function') window.renderDepartmentsTab();
            else if (tabId === 'missions' && typeof window.renderMissionsTab === 'function') window.renderMissionsTab();
            else if (tabId === 'branches' && typeof window.renderBranchesTab === 'function') window.renderBranchesTab();
            
            initSound();
            if (window.gameAudio && typeof window.gameAudio.playClick === 'function') {
                window.gameAudio.playClick();
            }
        });
    });

    if (DOM_CACHE.bulkSelector) {
        DOM_CACHE.bulkSelector.addEventListener('click', (e) => {
            const btn = e.target.closest('.bulk-btn-option');
            if (!btn) return;
            
            initSound();
            currentUpgradeMode = btn.getAttribute('data-mode');
            DOM_CACHE.bulkSelector.querySelectorAll('.bulk-btn-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (typeof updateButtonAffordability === 'function') {
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
            const type = btn.getAttribute('data-type');
            const id = parseInt(btn.getAttribute('data-id'));
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
            } else {
                updateButtonAffordability();
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
                prestigeModal.classList.remove('active');
                playAd(() => {
                    game.prestige(target, true);
                    game.saveGame();
                    
                    const firstTabBtn = document.querySelector('.tab-btn');
                    if (firstTabBtn) firstTabBtn.click();
                    
                    draw();
                });
            }
        });
    }

    if (prestigeRegularBtn) {
        prestigeRegularBtn.addEventListener('click', () => {
            initSound();
            if (prestigeModal) {
                const target = parseInt(prestigeModal.getAttribute('data-target-branch'));
                prestigeModal.classList.remove('active');
                game.prestige(target, false);
                game.saveGame();
                
                const firstTabBtn = document.querySelector('.tab-btn');
                if (firstTabBtn) firstTabBtn.click();
                
                draw();
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
                game.saveGame();
                draw();
            }
        });
    }

    const vaultInfoBtn = document.getElementById('vault-info-btn');
    if (vaultInfoBtn) {
        vaultInfoBtn.addEventListener('click', () => {
            initSound();
            const lang = game.state.language || 'he';
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

    // Check weekly reward on game start
    setTimeout(() => {
        if (window.game && window.game.state) {
            checkWeeklyReward();
        }
    }, 2000);
}

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
})(window);

