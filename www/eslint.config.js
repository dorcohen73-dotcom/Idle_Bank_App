const globals = require('globals');

// Names exported across game script files via `window.X = ...` (or declared at
// top level of a file that isn't IIFE-wrapped). Since these files load as plain
// <script> tags (not ES modules), `window.X` assignments become real global
// identifiers usable bare in any other file loaded after it.
const sharedGameGlobals = [
    'AchievementController', 'AdService', 'AudioEngine', 'DOM_CACHE', 'DailyChallengeController', 'EconomyManager',
    'NotificationQueue',
    'GAME_CONFIG', 'IdleBankGame', 'MissionController', 'SaveManager',
    '_boostOfferEndTime', '_footerFlavorInterval', '_vipBannerRetryTimeout',
    'activeCoins', 'animateCoins', 'applyLanguage', 'applyTheme',
    'checkPrestigeTip', 'clearActiveCoins', 'completeTutorial',
    'currentUpgradeMode', 'dailyChallengeController', 'draw', 'fastFormat',
    'formatMoney', 'formatTime', 'game', 'gameAudio', 'gameLanguage',
    'getClientSVG', 'handleCrowdEvent', 'handleInvestorEvent',
    'handleMissionRedirect', 'handlePurchaseFeedback', 'handleRescueEvent',
    'handleRushHoursEvent', 'handleSecurityEvent', 'initCoinPool', 'initSound',
    'reportCrash',
    'initUIEvents', 'invalidateTabHashes', 'lastTime', 'maybeStartTutorial',
    'openAnalyticsModal', 'openBoostModal', 'openFortuneWheel',
    'openPrestigeModal', 'playAd', 'prevCustomerQueueString',
    'prevTellerClientStates', 'rafId', 'rebuildTellersDOM',
    'recalcGuardAnchors', 'refreshAllTabs', 'removeVipVisitBanner',
    'renderBranchesTab', 'renderDailyChallengesSection', 'renderDepartmentsTab',
    'renderManagersTab', 'renderMissionsTab', 'renderUpgradesTab',
    'roundCents', 'serveVipVisitor', 'showDiscoveryTip',
    'showLoginRewardModal', 'showToast',
    'showTutorialStep', 'spawnFloating', 'spawnParticles', 'spawnVaultCoins',
    'startPromoRecording', 'syncBottomNav', 'tick', 'translations',
    'triggerPrestigeCeremony', 'triggerRandomEvent', 'triggerVipVisitBanner',
    'updateActiveCoins', 'updateAdvDisplay', 'updateButtonAffordability',
    'updateCachedSuffixes', 'updateFloatingText', 'updateMuteButton',
    'updateVaultMiniBar',
];

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'android/**',
            'www/**',
            'dist/**',
            'scratch/**',
            'marketing/**',
            'agents-library/**',
            '.agents/**',
            '.netlify/**',
            '*.min.js',
            'app.bundle.js',
            'app.bundle.js.map',
        ],
    },
    {
        // Browser game scripts, loaded via plain <script> tags (non-module, shared global scope)
        files: [
            'achievement-controller.js',
            'audio.js',
            'notification-queue.js',
            'config.js',
            'economy-manager.js',
            'game.js',
            'locales.js',
            'mission-controller.js',
            'save-manager.js',
            'sw.js',
        ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.serviceworker,
                ...Object.fromEntries(sharedGameGlobals.map((name) => [name, 'writable'])),
            },
        },
        rules: {
            'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
            'no-undef': 'error',
            // builtinGlobals:false — the shared-global names above are predeclared for
            // cross-file no-undef resolution; their single real declaration in the
            // owning file isn't a redeclaration bug.
            'no-redeclare': ['warn', { builtinGlobals: false }],
            'no-fallthrough': 'warn',
            'no-empty': 'warn',
            'no-constant-condition': ['warn', { checkLoops: false }],
        },
    },
    {
        // Entry-point and UI scripts, loaded via <script type="module"> and native
        // import/export between them, but still reading game/config/locale
        // globals set up by the classic scripts above (see build plan).
        files: ['app.js', 'ui/tabs/**/*.js', 'ui/events/**/*.js', 'ui/draw/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...Object.fromEntries(sharedGameGlobals.map((name) => [name, 'writable'])),
            },
        },
        rules: {
            'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-redeclare': ['warn', { builtinGlobals: false }],
            'no-fallthrough': 'warn',
            'no-empty': 'warn',
            'no-constant-condition': ['warn', { checkLoops: false }],
        },
    },
    {
        // Node.js tooling scripts (CommonJS)
        files: ['tools/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
            },
        },
    },
    {
        // Vitest test files (ESM)
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
    },
];
