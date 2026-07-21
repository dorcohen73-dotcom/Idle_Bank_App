// Entry Point Module for Idle Bank Empire
import './ui/draw/index.js';
import { initUIEvents, applyLanguage, applyTheme, tick } from './ui/events/index.js';
import { refreshAllTabs } from './ui/tabs/index.js';

(() => {
    'use strict';

    // Defensive fallback for window.gameAudio to prevent crashes if audio.js is delayed/blocked
    if (!window.gameAudio) {
        window.gameAudio = {
            playClick: () => {},
            playUnlock: () => {},
            playChaChing: () => {},
            toggleMute: () => false,
            isMuted: true,
            init: () => {}
        };
    }

    // Reports fatal errors to Firebase Crashlytics on native platforms (no-op on web / if plugin isn't synced yet)
    function reportCrash(message, stack) {
        try {
            const isNative = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
            const crashlytics = isNative && window.Capacitor.Plugins && window.Capacitor.Plugins.FirebaseCrashlytics;
            if (crashlytics) {
                const fullMessage = stack ? `${message}\n${stack}` : String(message);
                crashlytics.recordException({ message: fullMessage.slice(0, 2000) });
            }
        } catch {
            // Crashlytics unavailable — never let crash reporting itself throw
        }
    }

    window.reportCrash = reportCrash;

    // Explicitly expose required global variables on window object
    window.game = undefined;
    window.currentUpgradeMode = 'x1';
    window.lastTime = undefined;
    window.rafId = undefined;

    window.prevCustomerQueueString = '';
    window.prevTellerClientStates = {};

    // DOM Cache container
    window.DOM_CACHE = {
        cash: null,
        eps: null,
        shares: null,
        multiplier: null,
        branchName: null,
        muteBtn: null,
        resetBtn: null,
        advSlider: null,
        advDisplay: null,
        boostBtn: null,
        analyticsBtn: null,
        vaultInfoBtn: null,
        fortuneWheelBtn: null,
        vaultMiniLabel: null,
        skipLink: null,
        resetConfirmLabel: null,
        vaultMiniBtn: null,
        doubleIncomeLabel: null,
        analyticsFromSettingsBtn: null,
        footerPrivacyLink: null,
        footerTermsLink: null,
        controlPanelSection: null,
        controlPanelSrHeading: null,
        tabsNav: null,
        bottomNav: null,
        vaultMiniIcon: null,
        vaultMiniFillEl: null,
        bankFloorSection: null,
        langBtn: null,
        langModal: null,
        langModalClose: null,
        bulkSelector: null,
        customerLine: null,
        tellersZone: null,
        securityPath: null,
        guardAvatar: null,
        guardStatus: null,
        guardLoad: null,
        vaultGraphic: null,
        vaultFill: null,
        vaultStats: null,
        vaultEmptyBtn: null,
        queueLabel: null,
        queueZone: null,
        tabBranches: null,
        advLimitMax: null,
        floatingContainer: null,
        vaultCapValue: null,
        vaultYieldValue: null,
        vaultProgressLabel: null,
        prestigePreviewLabel: null,
        offlineModalClaimBtn: null,
        appTitle: null,
        labelCash: null,
        labelPerSecond: null,
        labelShares: null,
        labelMultiplier: null,
        labelSimulatorTitle: null,
        labelPanelBadge: null,
        labelAdvTitle: null,
        labelAdvLimitOff: null,
        labelGuardClickHint: null,
        labelVaultTitle: null,
        labelVaultLoading: null,
        labelVaultSubtitle: null,
        labelVaultYieldTitle: null,
        labelVaultYieldSub: null,
        labelVaultCapTitle: null,
        labelVaultVolumeTitle: null,
        labelCollectVaultBtn: null,
        tabBtnUpgrades: null,
        tabBtnManagers: null,
        tabBtnDepartments: null,
        tabBtnMissions: null,
        tabBtnBranches: null,
        labelFooter: null,
        bulkLabelText: null,
        offlineModalTitle: null,
        offlineModalText: null,
        langModalTitle: null,
        langModalText: null,
        settingsDangerTitle: null,
        settingsThemeTitle: null,
        labelAdvControl: null,
        vaultGraphicLabel: null,
        cashLiveBadge: null,
        splashSubtitle: null
    };

    document.addEventListener('DOMContentLoaded', () => { try {
        // Populate the cache once
        window.DOM_CACHE.cash = document.getElementById('cash-value');
        window.DOM_CACHE.eps = document.getElementById('eps-value');
        window.DOM_CACHE.shares = document.getElementById('shares-value');
        window.DOM_CACHE.multiplier = document.getElementById('multiplier-value');
        window.DOM_CACHE.branchName = document.getElementById('branch-name');
        window.DOM_CACHE.muteBtn = document.getElementById('mute-btn');
        window.DOM_CACHE.resetBtn = document.getElementById('reset-game-btn');
        window.DOM_CACHE.advSlider = document.getElementById('adv-budget-slider');
        window.DOM_CACHE.advDisplay = document.getElementById('adv-budget-display');
        window.DOM_CACHE.boostBtn = document.getElementById('boost-btn');
        window.DOM_CACHE.analyticsBtn = document.getElementById('analytics-btn');
        window.DOM_CACHE.vaultInfoBtn = document.getElementById('vault-info-btn');
        window.DOM_CACHE.fortuneWheelBtn = document.getElementById('fortune-wheel-btn');
        window.DOM_CACHE.vaultMiniLabel = document.getElementById('vault-mini-label');
        window.DOM_CACHE.skipLink = document.getElementById('skip-link');
        window.DOM_CACHE.resetConfirmLabel = document.getElementById('reset-confirm-label');
        window.DOM_CACHE.vaultMiniBtn = document.getElementById('vault-mini-btn');
        window.DOM_CACHE.doubleIncomeLabel = document.getElementById('double-income-label');
        window.DOM_CACHE.analyticsFromSettingsBtn = document.getElementById('analytics-from-settings-btn');
        window.DOM_CACHE.footerPrivacyLink = document.getElementById('footer-privacy-link');
        window.DOM_CACHE.footerTermsLink = document.getElementById('footer-terms-link');
        window.DOM_CACHE.controlPanelSection = document.getElementById('control-panel-section');
        window.DOM_CACHE.controlPanelSrHeading = document.getElementById('control-panel-sr-heading');
        window.DOM_CACHE.tabsNav = document.getElementById('tabs-nav');
        window.DOM_CACHE.bottomNav = document.getElementById('bottom-nav');
        window.DOM_CACHE.vaultMiniIcon = document.getElementById('vault-mini-icon');
        window.DOM_CACHE.vaultMiniFillEl = document.getElementById('vault-mini-fill');
        window.DOM_CACHE.bankFloorSection = document.getElementById('bank-floor-section');
        window.DOM_CACHE.langBtn = document.getElementById('lang-btn');
        window.DOM_CACHE.langModal = document.getElementById('lang-modal');
        window.DOM_CACHE.langModalClose = document.getElementById('lang-modal-close');
        window.DOM_CACHE.bulkSelector = document.getElementById('global-bulk-selector');
        window.DOM_CACHE.customerLine = document.getElementById('customer-line');
        window.DOM_CACHE.tellersZone = document.getElementById('tellers-zone');


        window.DOM_CACHE.vaultGraphic = document.getElementById('vault-graphic');
        window.DOM_CACHE.vaultFill = document.getElementById('vault-fill');
        window.DOM_CACHE.vaultStats = document.getElementById('vault-stats');
        window.DOM_CACHE.vaultEmptyBtn = document.getElementById('collect-vault-btn');
        window.DOM_CACHE.queueLabel = document.getElementById('queue-label');
        window.DOM_CACHE.queueZone = document.querySelector('.queue-zone');
        window.DOM_CACHE.tabBranches = document.getElementById('tab-branches');
        window.DOM_CACHE.advLimitMax = document.getElementById('label-adv-limit-max');
        window.DOM_CACHE.floatingContainer = document.getElementById('floating-container');
        window.DOM_CACHE.vaultCapValue = document.getElementById('vault-cap-value');
        window.DOM_CACHE.vaultYieldValue = document.getElementById('vault-yield-value');
        window.DOM_CACHE.vaultProgressLabel = document.getElementById('vault-progress-label');
        window.DOM_CACHE.prestigePreviewLabel = document.getElementById('prestige-preview-label');

        window.DOM_CACHE.offlineModal = document.getElementById('offline-modal');
        window.DOM_CACHE.offlineModalAmount = document.getElementById('modal-amount');
        window.DOM_CACHE.offlineModalDoubleBtn = document.getElementById('offline-double-btn');
        window.DOM_CACHE.offlineModalClaimBtn = document.getElementById('offline-claim-btn');

        window.DOM_CACHE.appTitle = document.getElementById('app-title');
        window.DOM_CACHE.labelCash = document.getElementById('label-cash');
        window.DOM_CACHE.labelPerSecond = document.getElementById('label-per-second');
        window.DOM_CACHE.labelShares = document.getElementById('label-shares');
        window.DOM_CACHE.labelMultiplier = document.getElementById('label-multiplier');
        window.DOM_CACHE.labelSimulatorTitle = document.getElementById('label-simulator-title');
        window.DOM_CACHE.labelPanelBadge = document.getElementById('label-panel-badge');
        window.DOM_CACHE.labelAdvTitle = document.getElementById('label-adv-title');
        window.DOM_CACHE.labelAdvLimitOff = document.getElementById('label-adv-limit-off');
        window.DOM_CACHE.labelGuardClickHint = document.getElementById('label-guard-click-hint');
        window.DOM_CACHE.labelVaultTitle = document.getElementById('label-vault-title');
        window.DOM_CACHE.labelVaultLoading = document.getElementById('label-vault-loading');
        window.DOM_CACHE.labelVaultSubtitle = document.getElementById('label-vault-subtitle');
        window.DOM_CACHE.labelVaultYieldTitle = document.getElementById('label-vault-yield-title');
        window.DOM_CACHE.labelVaultYieldSub = document.getElementById('label-vault-yield-sub');
        window.DOM_CACHE.labelVaultCapTitle = document.getElementById('label-vault-cap-title');
        window.DOM_CACHE.labelVaultVolumeTitle = document.getElementById('label-vault-volume-title');
        window.DOM_CACHE.labelCollectVaultBtn = document.getElementById('label-collect-vault-btn');
        window.DOM_CACHE.tabBtnUpgrades = document.getElementById('tab-btn-upgrades');
        window.DOM_CACHE.tabBtnManagers = document.getElementById('tab-btn-managers');
        window.DOM_CACHE.tabBtnDepartments = document.getElementById('tab-btn-departments');
        window.DOM_CACHE.tabBtnMissions = document.getElementById('tab-btn-missions');
        window.DOM_CACHE.tabBtnBranches = document.getElementById('tab-btn-branches');
        window.DOM_CACHE.labelFooter = document.getElementById('label-footer');
        window.DOM_CACHE.bulkLabelText = document.getElementById('bulk-label-text');
        window.DOM_CACHE.offlineModalTitle = document.getElementById('offline-modal-title');
        window.DOM_CACHE.offlineModalText = document.getElementById('offline-modal-text');
        window.DOM_CACHE.langModalTitle = document.getElementById('lang-modal-title');
        window.DOM_CACHE.langModalText = document.getElementById('lang-modal-text');
        window.DOM_CACHE.settingsDangerTitle = document.getElementById('settings-danger-title');
        window.DOM_CACHE.settingsThemeTitle = document.getElementById('settings-theme-title');
        window.DOM_CACHE.labelAdvControl = document.getElementById('label-adv-control');
        window.DOM_CACHE.vaultGraphicLabel = document.getElementById('vault-graphic-label');
        window.DOM_CACHE.cashLiveBadge = document.getElementById('cash-live-badge');
        window.DOM_CACHE.splashSubtitle = document.getElementById('splash-subtitle');
        window.DOM_CACHE.queueCapLabel  = document.getElementById('queue-capacity-label');
        window.DOM_CACHE.queueFillBar   = document.getElementById('queue-progress-fill');
        window.DOM_CACHE.queueStatText  = document.getElementById('queue-status-text');
        window.DOM_CACHE.queueStatIcon  = document.getElementById('queue-status-icon');

        // Instantiate game logic and secure global IdleBankGame class
        if (typeof window.IdleBankGame !== 'function') {
            console.error('IdleBankGame class is not defined. game.js may have failed to load.');
            throw new Error('IdleBankGame not defined — caught by boot try/catch');
        }
        window.game = new window.IdleBankGame();
        delete window.IdleBankGame;

        // Instantiate Daily Challenge Controller
        if (typeof window.DailyChallengeController === 'function') {
            window.dailyChallengeController = new window.DailyChallengeController(window.game);
            window.dailyChallengeController.checkAndReset();
        }

        // Register event listeners
        initUIEvents();

        // Set up language choice on load
        const chosenLang = window.game.state.language || 'en';
        const isFirstTime = !window.localStorage.getItem('idle_bank_language_chosen');
        
        if (isFirstTime) {
            window.game.setLanguage('en');
            applyLanguage('en');
            if (DOM_CACHE.langModalClose) DOM_CACHE.langModalClose.style.display = 'none'; // Force choice first time
            const showLangModal = () => { if (DOM_CACHE.langModal) DOM_CACHE.langModal.classList.add('active'); };
            if (window.NotificationQueue) {
                window.NotificationQueue.request('lang-modal', window.NotificationQueue.PRIORITY.CRITICAL, showLangModal);
            } else {
                showLangModal();
            }
        } else {
            applyLanguage(chosenLang);
        }

        // Set up theme choice on load
        const savedTheme = window.localStorage.getItem('idle_bank_theme') || 'blue';
        applyTheme(savedTheme);

        // Set up performance mode UI on load
        const savedPerfMode = window.game.state.perfMode || 'auto';
        const urlParams = new URLSearchParams(window.location.search);
        const urlMode = urlParams.get('perf');
        const activeMode = (urlMode === 'eco' || urlMode === 'full') ? urlMode : savedPerfMode;
        
        document.querySelectorAll('.perf-option-btn').forEach(b => {
            if (b.getAttribute('data-perf') === activeMode) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        const notifCheckbox = document.getElementById('settings-notif-checkbox');
        if (notifCheckbox) {
            notifCheckbox.checked = window.game.state.notificationsEnabled !== false;
        }

        if (window.NotificationService) window.NotificationService.init();
        if (window.ReviewService) window.ReviewService.init();

        // visibilitychange listener for offline calculations when returning to tab
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(window.rafId);
                // Save game immediately on hidden tab
                if (window.game) {
                    window.game.saveGame(true);
                    
                    // Trigger notifications when leaving
                    if (window.NotificationService) {
                        // Request permission on exit if tutorial is complete
                        if (window.game.state.tutorialCompleted) {
                            window.NotificationService.requestPermission().then(() => {
                                window.NotificationService.scheduleReminders(window.game);
                            });
                        }
                    }
                }
                if (window.gameAudio && typeof window.gameAudio.suspend === 'function') {
                    window.gameAudio.suspend();
                }
            } else {
                if (window.NotificationService) window.NotificationService.cancelAll();
                if (window.gameAudio && typeof window.gameAudio.resume === 'function') {
                    window.gameAudio.resume();
                }
                window.game.recalculateEps();
                window.game.calculateOfflineEarnings();
                
                if (typeof window.showOfflineEarningsModal === 'function') {
                    window.showOfflineEarningsModal();
                }

                window.lastTime = performance.now();
                refreshAllTabs();
                
                cancelAnimationFrame(window.rafId);
                window.rafId = requestAnimationFrame(tick);
            }
        });

        // Display offline earnings modal if pending
        if (typeof window.showOfflineEarningsModal === 'function') {
            window.showOfflineEarningsModal();
        }

        // Ensure vault-door image is present in vault-graphic (JS fallback)
        const vaultGraphicEl = document.getElementById('vault-graphic');
        if (vaultGraphicEl) {
            if (!vaultGraphicEl.querySelector('.vault-door-img')) {
                const vaultImg = document.createElement('img');
                vaultImg.className = 'vault-door-img';
                vaultImg.src = 'images/vault-door.png';
                vaultImg.alt = '';
                vaultGraphicEl.insertBefore(vaultImg, vaultGraphicEl.firstChild);
            }
        }
        window.DOM_CACHE.vaultDoorImg = document.querySelector('.vault-door-img');

        // Splash Screen: render everything once, immediately, then run a purely
        // cosmetic progress bar. Spreading the heavy tab-rendering calls across the
        // interval ticks made each tick compete with the splash's CSS animations for
        // the main thread — on weaker Android devices that showed up as constant
        // flicker/stutter for the whole splash duration, not a one-time hitch.
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            if (typeof window.rebuildTellersDOM === 'function') window.rebuildTellersDOM();
            if (typeof initCoinPool === 'function') initCoinPool();
            if (typeof window.renderUpgradesTab === 'function') window.renderUpgradesTab();
            if (typeof window.renderManagersTab === 'function') window.renderManagersTab();
            if (typeof window.renderDepartmentsTab === 'function') window.renderDepartmentsTab();
            if (typeof window.renderMissionsTab === 'function') window.renderMissionsTab();
            if (typeof window.renderBranchesTab === 'function') window.renderBranchesTab();

            if (window.Capacitor && window.Capacitor.Plugins) {
                if (window.Capacitor.Plugins.SplashScreen) {
                    window.Capacitor.Plugins.SplashScreen.hide();
                }

                // Native mobile fixes (Edge-to-edge & back button)
                const SB = window.Capacitor.Plugins.StatusBar;
                if (SB) {
                    try {
                        SB.setOverlaysWebView({ overlay: true }).catch(() => {});
                        SB.setStyle({ style: 'DARK' }).catch(() => {});
                    } catch (_e) {
                        // ignore
                    }
                }

                const CapApp = window.Capacitor.Plugins.App;
                if (CapApp) {
                    try {
                        CapApp.addListener('backButton', ({ canGoBack }) => {
                            // Find the topmost active modal
                            const modals = Array.from(document.querySelectorAll('.modal.active, .modal:not([hidden]).show, .tutorial-modal.active'));
                            if (modals.length > 0) {
                                const topModal = modals[modals.length - 1];
                                // Don't close if it's a forced onboarding modal without a close button (e.g. offline earnings)
                                // But usually offline has a collect button. Let's just remove active class.
                                topModal.classList.remove('active', 'show');
                                topModal.setAttribute('hidden', 'true');
                                return;
                            }
                            // Otherwise exit app
                            CapApp.exitApp();
                        });
                    } catch (_e) {
                        // ignore
                    }
                }
            }

            const finishSplash = () => {
                setTimeout(() => {
                    splashScreen.style.opacity = '0';
                    splashScreen.style.transform = 'scale(1.05)';
                    splashScreen.style.visibility = 'hidden';
                    setTimeout(() => splashScreen.remove(), 800);
                }, 500);
            };

            const fill = document.getElementById('splash-progress-fill');
            const pText = document.getElementById('splash-progress-text');
            if (fill && pText) {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.floor(Math.random() * 12) + 8;
                    if (progress >= 100) progress = 100;
                    fill.style.width = progress + '%';
                    pText.innerText = progress + '%';

                    if (progress === 100) {
                        clearInterval(interval);
                        finishSplash();
                    }
                }, 80);
            } else {
                finishSplash();
            }
        }

        // Show GDPR consent banner on first visit
        if (!localStorage.getItem('gdpr_consent')) {
            setTimeout(() => {
                const banner = document.getElementById('gdpr-banner');
                if (banner) banner.style.display = 'flex';
            }, 1800);
        }

        // Start tick loop
        window.lastTime = performance.now();
        cancelAnimationFrame(window.rafId);
        window.rafId = requestAnimationFrame(tick);

        // Performance mode probe
        if (window.PerformanceManager) {
            const urlParams = new URLSearchParams(window.location.search);
            const forcePerf = urlParams.get('perf');

            // Apply immediately (URL override / saved mode / hardware hints):
            // background tabs pause rAF, so waiting for the probe could mean the
            // chosen mode is never applied at all.
            window.PerformanceManager.apply(forcePerf || window.game.state.perfMode);
            
            window.PerformanceManager.probe().then(fps => {
                if (typeof fps === 'number') window.game.state.lastMeasuredFps = fps;
                const finalMode = forcePerf || window.game.state.perfMode;
                window.PerformanceManager.apply(finalMode, fps);
            });
        }

        // Register PWA Service Worker (with file:// protocol protection and Capacitor guard)
        if (window.Capacitor && 'serviceWorker' in navigator) {
            // Disable and unregister Service Worker in native apps to prevent infinite reload loops
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for(let reg of registrations) {
                    reg.unregister();
                }
            });
        } else if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
            navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
                .then(reg => {
                    reg.update();
                })
                .catch(err => console.error('Service Worker registration failed', err));

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (typeof window.game !== 'undefined' && window.game && typeof window.game.saveGame === 'function') {
                    window.game.saveGame(true);
                }
                window.location.reload();
            });
        }
    } catch(bootErr) {
        console.error('[IDLE BANK BOOT ERROR]', bootErr);
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) { splashScreen.style.opacity = '0'; splashScreen.style.visibility = 'hidden'; setTimeout(() => splashScreen.remove(), 800); }
        // Any boot failure must still release the native splash — otherwise the
        // app is stuck on the logo forever with no way for the user to recover.
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen) {
            window.Capacitor.Plugins.SplashScreen.hide();
        }
    }
    });

    // Forced save on page close/reload
    window.addEventListener('beforeunload', () => {
        if (window.game) {
            window.game.saveGame(true);
        }
    });

    // Global exception and promise rejection handlers to capture runtime crashes and save state
    window.onerror = function(message, source, lineno, colno, error) {
        console.error("Global crash intercepted:", message, "at", source, ":", lineno);
        reportCrash(`${message} at ${source}:${lineno}:${colno}`, error && error.stack);
        const activeGame = window.game;
        if (activeGame) {
            try {
                activeGame.saveGame(true); // Force immediate save on crash
            } catch (saveErr) {
                console.error("Failed to save state during window.onerror crash recovery:", saveErr);
            }
        }
        return false;
    };

    window.addEventListener('unhandledrejection', function(event) {
        console.error("Unhandled promise rejection intercepted:", event.reason);
        const reason = event.reason;
        reportCrash(reason && reason.message ? reason.message : String(reason), reason && reason.stack);
        const activeGame = window.game;
        if (activeGame) {
            try {
                activeGame.saveGame(true); // Force immediate save on crash
            } catch (saveErr) {
                console.error("Failed to save state during unhandledrejection crash recovery:", saveErr);
            }
        }
    });
})();
