// Prestige & branch progression — extracted verbatim from IdleBankGame
// (REFACTOR_PLAN phase 3): total-assets valuation, gold-share calculation,
// daily-login reward table, the full prestige reset flow, and branch travel.
// Operates directly on game.state; no state-shape or save-format changes.
// game.js keeps thin facades for the UI layer and SaveManager.
class PrestigeController {
    constructor(game) {
        this.game = game;
    }

    calculateTotalAssets() {
        const game = this.game;
        let total = 0;
        if (game.state.tellers) {
            game.state.tellers.forEach(t => {
                if (t.unlocked) total += t.level;
            });
        }
        if (game.state.guards) {
            game.state.guards.forEach(g => {
                if (g.unlocked) total += g.level;
            });
        }
        if (game.state.vault) {
            total += game.state.vault.level || 1;
        }
        total += game.state.queueUpgradeLevel || 1;
        if (game.state.departments) {
            game.state.departments.forEach(d => {
                if (d.unlocked) total += 5;
            });
        }
        if (game.state.managers) {
            Object.keys(game.state.managers).forEach(k => {
                if (k !== 'operations' && game.state.managers[k]) {
                    total += 5;
                }
            });
        }
        return total;
    }

    calculatePrestigeShares() {
        const game = this.game;
        // H-06: cache result — invalidate only when lifetimeCash or shares change
        const lifetimeCash = game.state.lifetimeCash || 2000;
        
        // Ensure stats object exists
        if (!game.state.stats) game.state.stats = {};
        
        const vipHired = !!(game.state.managers && game.state.managers.vip);
        const vipLvl = (game.state.managerUpgrades && game.state.managerUpgrades.vip) ? game.state.managerUpgrades.vip.level : 1;
        
        // Smarter Scaling Formula: grows reasonably but very hard to hit the 10k cap instantly in late game
        let rawGain = 1500 * Math.pow(lifetimeCash / 1000000000, 0.22);
        
        if (vipHired && game.state.managerUpgrades && game.state.managerUpgrades.vip) {
            rawGain = rawGain * (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.vip.prestigeBoost * vipLvl);
            rawGain = rawGain * (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.vip.prestigeSharesBoost * vipLvl);
        }

        // Initialize claimedPrestigeShares for existing players to prevent sudden infinite shares
        // We set it such that they get exactly 800 base shares right now to "un-stick" them from 0.
        if (typeof game.state.stats.claimedPrestigeShares === 'undefined') {
             game.state.stats.claimedPrestigeShares = Math.max(0, Math.floor(rawGain) - 800);
        }
        
        const claimedShares = game.state.stats.claimedPrestigeShares;
        
        const cacheKey = `${lifetimeCash}:${claimedShares}:${vipHired}:${vipLvl}`;
        if (game._cachedPrestigeSharesKey === cacheKey && game._cachedPrestigeShares !== undefined) {
            return game._cachedPrestigeShares;
        }
        
        let gain = Math.floor(rawGain) - claimedShares;
        
        // Reverted cap to 10,000 per user request
        const result = Math.min(10000, Math.max(0, gain));
        game._cachedPrestigeSharesKey = cacheKey;
        game._cachedPrestigeShares = result;
        return result;
    }

    getDailyLoginReward(streak) {
        const game = this.game;
        const eps = game.getEarningsPerSecond();
        // Share/gold tiers used to be flat numbers that stayed relevant early on but became
        // trivial once a player's prestige gain grows into the thousands. Scale them against
        // calculatePrestigeShares() (the same "shares you'd gain by prestiging right now" metric
        // used elsewhere) so late-game players still get a meaningful daily reward, while the
        // Math.max floor keeps new players' rewards identical to the old fixed values.
        const prestigeShares = typeof game.calculatePrestigeShares === 'function' ? game.calculatePrestigeShares() : 0;
        if (streak >= 30) return { type: 'shares', value: Math.max(10, Math.ceil(prestigeShares * 0.05)) };
        if (streak >= 14) return { type: 'shares', value: Math.max(3, Math.ceil(prestigeShares * 0.02)) };
        if (streak >= 7)  return { type: 'shares', value: Math.max(1, Math.ceil(prestigeShares * 0.01)) };
        if (streak >= 5)  return { type: 'boost', value: 1800 };
        if (streak >= 3)  return { type: 'gold', value: Math.max(1, Math.ceil(prestigeShares * 0.005)) };
        if (streak >= 2)  return { type: 'cash', value: Math.max(500, eps * 1800) };
        return { type: 'cash', value: Math.max(180, eps * 300) };
    }

    prestige(targetBranchIndex, doubleShares = false, bypassCashCheck = false) {
        const game = this.game;
        game.isResetting = true;
        let baseSharesGained = game.calculatePrestigeShares();
        let sharesGained = baseSharesGained;
        
        if (doubleShares) {
            // HIGH-3: The parameter name is 'doubleShares', but the UI displays and awards a 3x multiplier (triple shares) by design. We preserve the 3x behavior to match the UI.
            sharesGained *= 3;
            // CAP: reverted to 10000 per user request
            sharesGained = Math.min(10000, sharesGained);
        }
        if (!bypassCashCheck && game.state.cash < game.branches[game.state.currentBranch].minCashToPrestige) {
            game.isResetting = false;
            return false;
        }

        // Apply Prestige — total wallet shares capped at 100,000 (reverted)
        game.state.shares = Math.min(100000, (game.state.shares || 0) + sharesGained);
        
        // IMPORTANT: Increment claimedPrestigeShares by the BASE amount, NOT the ad-boosted amount
        if (!game.state.stats) game.state.stats = {};
        if (typeof game.state.stats.claimedPrestigeShares === 'undefined') {
             // Fallback initialization just in case calculatePrestigeShares didn't do it
             game.state.stats.claimedPrestigeShares = Math.max(0, (game.state.shares || 0) - sharesGained);
        }
        game.state.stats.claimedPrestigeShares += baseSharesGained;
        game.state.stats.prestigeCount = (game.state.stats.prestigeCount || 0) + 1;

        game.state.currentBranch = targetBranchIndex;
        game.state.maxBranchUnlocked = Math.max(game.state.maxBranchUnlocked || 0, targetBranchIndex);
        
        // Reset cash based on starting cash options in GAME_CONFIG
        const startingCashLevel = (game.state.goldUpgrades && game.state.goldUpgrades.startingCash) ? game.state.goldUpgrades.startingCash : 0;
        const startingCashOptions = GAME_CONFIG.STARTING_CASH_OPTIONS;

        // Branch Welcome Bonus: isNewBranch checked before reset, amount computed after recalculateEps
        const isNewBranch = !game.state.visitedBranches || !game.state.visitedBranches.includes(targetBranchIndex);

        const savedShares = game.state.shares;
        const savedMaxBranch = game.state.maxBranchUnlocked;
        const savedGoldUpgrades = game.state.goldUpgrades;
        const savedLanguage = game.state.language;
        const savedStats = game.state.stats;
        const savedMissionsCompleted = game.state.missionsCompleted;
        const savedLastWeeklyReward = game.state.lastWeeklyReward;
        const savedLastSpinTime = game.state.lastSpinTime;
        const savedLastAdSpinTime = game.state.lastAdSpinTime || 0;
        const savedVisitedBranches = Array.isArray(game.state.visitedBranches) ? [...game.state.visitedBranches] : [];
        const savedLoginDate = game.state.lastLoginDate || 0;
        const savedLoginStreak = game.state.loginStreak || 0;
        const savedPendingLoginReward = game.state.pendingLoginReward || null;
        const savedBoost2xUsedEver = game.state.boost2xUsedEver || false;
        const savedBoost2xTimeLeft = game.state.boost2xTimeLeft || 0;
        const savedDailyChallenges = game.state.dailyChallenges;
        const savedLastDailyReset = game.state.lastDailyReset;
        const savedMigrations = game.state.migrations ? Object.assign({}, game.state.migrations) : {};
        const savedTutorialCompleted = game.state.tutorialCompleted || false;
        const savedTutorialStep = game.state.tutorialStep || 0;
        const savedDiscoveredTips = game.state.discoveredTips ? Object.assign({}, game.state.discoveredTips) : {};

        if (game._tempQueueBonusTimeout) { clearTimeout(game._tempQueueBonusTimeout); game._tempQueueBonusTimeout = null; }
        game.initDefaultState();

        game.state.shares = savedShares;
        game.state.currentBranch = targetBranchIndex;
        game.state.maxBranchUnlocked = savedMaxBranch;
        game.state.goldUpgrades = savedGoldUpgrades;
        game.state.language = savedLanguage;
        game.state.stats = savedStats;
        game.state.missionsCompleted = savedMissionsCompleted;
        game.state.lastWeeklyReward = savedLastWeeklyReward;
        game.state.lastSpinTime = savedLastSpinTime;
        game.state.lastAdSpinTime = savedLastAdSpinTime;
        game.state.lastLoginDate = savedLoginDate;
        game.state.loginStreak = savedLoginStreak;
        game.state.pendingLoginReward = savedPendingLoginReward;
        game.state.boost2xUsedEver = savedBoost2xUsedEver;
        game.state.boost2xTimeLeft = savedBoost2xTimeLeft;
        game.state.dailyChallenges = savedDailyChallenges;
        game.state.lastDailyReset = savedLastDailyReset;
        game.state.migrations = savedMigrations;
        game.state.tutorialCompleted = savedTutorialCompleted;
        game.state.tutorialStep = savedTutorialStep;
        game.state.discoveredTips = savedDiscoveredTips;

        // Restore visitedBranches and add targetBranch if new
        if (!savedVisitedBranches.includes(targetBranchIndex)) {
            savedVisitedBranches.push(targetBranchIndex);
        }
        game.state.visitedBranches = savedVisitedBranches;

        // Auto-discover all basic tutorial tips to prevent them from showing after prestige
        game.state.discoveredTips.start = true;
        game.state.discoveredTips.vault = true;
        game.state.discoveredTips.guard = true;
        game.state.discoveredTips.dept = true;
        game.state.discoveredTips.manager = true;
        game.state.discoveredTips.prestige = true;

        // Reset cash based on starting cash options in GAME_CONFIG
        game.state.cash = Math.round(((startingCashOptions[startingCashLevel] || 180) + Number.EPSILON) * 100) / 100;
        game.state.lifetimeCash = game.state.cash;

        // Generate initial missions
        game.state.missions = [];
        for (let i = 0; i < 5; i++) {
            game.state.missions.push(game.generateMission());
        }
        
        game.sanitizeQueueAndTellers();
        game.customerSpawnTimer = 0;
        
        // Spawn 3 initial customers immediately
        for (let i = 0; i < 3; i++) {
            game.customerCounter++;
            game.customerQueue.push({ id: 'c_' + game.customerCounter, type: 'normal', seed: Math.floor(Math.random() * 1000) });
        }
        
        window.gameAudio.playUnlock();
        game.recalculateEps();

        // Branch Welcome Bonus: computed here so EPS reflects the new branch
        const welcomeBonusCash = isNewBranch ? (game.getEarningsPerSecond() * 60) : 0;
        if (isNewBranch && welcomeBonusCash > 0) {
            game.state.cash = Math.round((game.state.cash + welcomeBonusCash + Number.EPSILON) * 100) / 100;
            game.state.lifetimeCash = Math.round((game.state.lifetimeCash + welcomeBonusCash + Number.EPSILON) * 100) / 100;
            if (typeof window.showToast === 'function') {
                const lang = game.state.language || 'en';
                const tObj = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : null;
                const branchName = (tObj && tObj.branches && tObj.branches.names && tObj.branches.names[targetBranchIndex])
                    ? tObj.branches.names[targetBranchIndex]
                    : (game.branches && game.branches[targetBranchIndex] ? game.branches[targetBranchIndex].name : ('Branch ' + targetBranchIndex));
                const amt = Math.round(welcomeBonusCash).toLocaleString();
                const msg = (tObj && typeof tObj.welcomeBonusMsg === 'function')
                    ? tObj.welcomeBonusMsg(branchName, amt)
                    : ('Welcome to ' + branchName + '! You received $' + amt + ' as an opening gift.');
                window.showToast(msg, 'success');
            }
        }

        // Rebase daily_earn_cash so progress earned before prestige survives.
        // Accumulated progress is banked in baseProgress (always >= 0) instead of encoding it
        // as a negative startProgress, which validateAndHealState() would clamp back to 0.
        game.state.dailyChallenges.forEach(c => {
            if (c.completed || c.claimed || c.type !== 'daily_earn_cash') return;
            c.baseProgress = (c.baseProgress || 0) + (c.progress || 0);
            c.startProgress = game.state.lifetimeCash;
        });

        game.isResetting = false;
        game.saveGame(true); // Force save immediately during prestige
        return true;
    }

    travelToBranch(branchIndex) {
        const game = this.game;
        if (branchIndex < game.state.currentBranch) {
            console.warn("Traveling back to older branches is disabled.");
            return;
        }
        game.state.currentBranch = branchIndex;
        game.state.missions = [];
        game.ensureTellersCount();
        game.checkMissions();
        game.sanitizeQueueAndTellers();
        game.recalculateEps();
        game.saveGame(true); // Force save on travel
    }
}
