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


class IdleBankGame {
    constructor() {
        this.cheatDetected = false;
        this.cheatWarning = false;
        
        // Expose configuration properties for public API backward compatibility with ui-draw/ui-tabs
        this.branches = GAME_CONFIG.BRANCHES;
        this.tellerUnlockCosts = GAME_CONFIG.TELLER_UNLOCK_COSTS;
        this.guardUnlockCosts = GAME_CONFIG.GUARD_UNLOCK_COSTS;
        this.managerCosts = GAME_CONFIG.MANAGER_COSTS;
        this.managerUpgradeCosts = GAME_CONFIG.MANAGER_UPGRADE_COSTS;

        this.initDefaultState();
        
        // Instantiate helper managers
        this.saveManager = new SaveManager(this);
        this.economyManager = new EconomyManager(this);
        this.missionController = new MissionController(this);
        this.achievementController = new AchievementController(this);

        // Load state
        this.loadGame();
    }

    initDefaultState() {
        this.isResetting = false;
        this.cheatDetected = false;
        this.cheatWarning = false;
        this.missionCounter = 0; // Built-in counter to prevent mission ID collisions
        this.lastTellerOffset = 0;
        this.customerCounter = 0;
        this.missionsDirty = false;
        this.cachedEps = 0;
        
        this.state = {
            cash: 180,                     // Starting cash
            lifetimeCash: 180,             // For prestige calculations
            shares: 0,                     // Golden Shares
            currentBranch: 0,              // 0: Jerusalem, 1: Tel Aviv, 2: NY, 3: London
            maxBranchUnlocked: 0,
            language: 'en',
            goldUpgrades: {
                startingCash: 0,
                guardSpeed: 0,
                premiumYield: 0,
                shareEfficiency: 0,
                offlineEarnings: 0,
                tellerCapacityBoost: 0,
                vaultCapacityBoost: 0,
                eventBonus: 0,
                managerDiscount: 0
            },
            boost2xTimeLeft: 0,
            tellerSpeedBoostTimer: 0,
            tellerSpeedBoostFactor: 1,

            vault: {
                level: 1,
                cashStored: 0
            },

            tellers: [
                { id: 0, unlocked: true, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false },
                { id: 1, unlocked: false, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false },
                { id: 2, unlocked: false, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false },
                { id: 3, unlocked: false, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false }
            ],

            guards: [
                { id: 0, unlocked: true,  level: 1, loadedCash: 0, position: 0, state: 'idle', timer: 0, targetTellerIndex: 0, tellerVisitQueue: [], segmentPosition: 0, carriedAmount: 0 },
                { id: 1, unlocked: false, level: 1, loadedCash: 0, position: 0, state: 'idle', timer: 0, targetTellerIndex: 0, tellerVisitQueue: [], segmentPosition: 0, carriedAmount: 0 },
                { id: 2, unlocked: false, level: 1, loadedCash: 0, position: 0, state: 'idle', timer: 0, targetTellerIndex: 0, tellerVisitQueue: [], segmentPosition: 0, carriedAmount: 0 }
            ],

            managers: {
                customer: false,
                operations: true,  // operations (guard/couriers) starts hired by default to keep automation running
                finance: false,
                service: false,
                vip: false,
                marketing: false,
                accountant: false
            },
            managerUpgrades: {
                customer: { level: 1, skill: null },
                operations: { level: 1, skill: null },
                finance: { level: 1, skill: null },
                service: { level: 1, skill: null },
                vip: { level: 1, skill: null },
                marketing: { level: 1, skill: null },
                accountant: { level: 1, skill: null }
            },

            departments: [
                { id: 0, name: 'שירותי קופה בסיסיים', unlocked: true, baseReward: 10, cost: 0 },
                { id: 1, name: 'מחלקת הלוואות ומשכנתאות', unlocked: false, baseReward: 60, cost: 3500 },
                { id: 2, name: 'VIP בנקאות פרטית', unlocked: false, baseReward: 450, cost: 80000 },
                { id: 3, name: 'מסחר במניות וקריפטו', unlocked: false, baseReward: 3500, cost: 1200000 },
                { id: 4, name: 'הלבנת הון "חוקית"', unlocked: false, baseReward: 30000, cost: 25000000 }
            ],

            missions: [],
            missionsCompleted: 0,
            achievements: { unlocked: {}, claimed: {}, bonusPercent: 0 },
            stats: {
                clientsServed: 0,
                tellerUpgrades: 0,
                guardUpgrades: 0,
                vaultUpgrades: 0,
                vipServed: 0,
                cashSpent: 0
            },
            advBudget: 0,
            advActive: false,
            queueUpgradeLevel: 1,

            lastSaveTime: Date.now(),
            lastWeeklyReward: 0,

            // Fortune Wheel
            lastSpinTime: 0,
            lastAdSpinTime: 0,

            // VIP Visitor
            nextVipVisit: 0,
            vipVisitActive: false,
            vipVisitExpiry: 0,
            vipServedTotal: 0,
            guardTripsTotal: 0,
            boost2xUsedEver: false,

            // Daily Challenges
            dailyChallenges: [],
            lastDailyReset: 0,

            // Daily Login Bonus
            lastLoginDate: 0,
            loginStreak: 0,
            pendingLoginReward: null,

            // Branch Welcome Bonus
            visitedBranches: [],

            // Migration flags — prevent re-running one-time data migrations on old saves
            migrations: {},

            // Tutorial (legacy — kept for save compatibility)
            tutorialStep: 0,
            tutorialCompleted: false,

            // Discovery tips — tracks which contextual tips were already shown
            discoveredTips: {}
        };

        this._contextualAdPending = null;
        this.tempQueueBonus = 0;

        this.customerQueue = [];
        this.maxQueueLength = 20;
        this.customerSpawnTimer = 0;
    }

    // --- SAVE AND LOAD DELEGATES ---
    saveGame(force = false) {
        this.saveManager.saveGame(force);
    }

    loadGame() {
        this.saveManager.loadGame();
    }

    clearSave() {
        this.saveManager.clearSave();
    }

    calculateOfflineEarnings() {
        this.saveManager.calculateOfflineEarnings();
    }

    validateAndHealState(state) {
        this.saveManager.validateAndHealState(state);
    }

    // --- ECONOMY DELEGATES ---
    getPrestigeMultiplier() {
        return this.economyManager.getPrestigeMultiplier();
    }

    getBranchMultiplier() {
        return this.economyManager.getBranchMultiplier();
    }

    getMaxTellers() {
        return this.economyManager.getMaxTellers();
    }

    getTotalMultiplier() {
        return this.economyManager.getTotalMultiplier();
    }

    getTellerSpeed(level) {
        return this.economyManager.getTellerSpeed(level);
    }

    getTellerCapacity(level) {
        return this.economyManager.getTellerCapacity(level);
    }

    getEventBonusMultiplier() {
        return (this.state.goldUpgrades && this.state.goldUpgrades.eventBonus) 
            ? 1 + (0.20 * this.state.goldUpgrades.eventBonus) 
            : 1;
    }

    getTellerUpgradeCost(level) {
        return this.economyManager.getTellerUpgradeCost(level);
    }

    getGuardSpeed(level) {
        return this.economyManager.getGuardSpeed(level);
    }

    getGuardCapacity(level) {
        return this.economyManager.getGuardCapacity(level);
    }

    getGuardUpgradeCost(level) {
        return this.economyManager.getGuardUpgradeCost(level);
    }

    getVaultCapacity(level) {
        return this.economyManager.getVaultCapacity(level);
    }

    getVaultUpgradeCost(level) {
        return this.economyManager.getVaultUpgradeCost(level);
    }

    getQueueCapacity(level) {
        return this.economyManager.getQueueCapacity(level);
    }

    getQueueUpgradeCost(level) {
        return this.economyManager.getQueueUpgradeCost(level);
    }

    getCumulativeUpgradeCost(type, startLevel, targetLevel) {
        return this.economyManager.getCumulativeUpgradeCost(type, startLevel, targetLevel);
    }

    getUpgradeCost(type, id, level) {
        return this.economyManager.getUpgradeCost(type, id, level);
    }

    getBulkUpgradeDetails(type, id, mode, currentLevel, cash) {
        return this.economyManager.getBulkUpgradeDetails(type, id, mode, currentLevel, cash);
    }

    getCurrentBaseReward() {
        return this.economyManager.getCurrentBaseReward();
    }

    getDepartmentReward(id) {
        return this.economyManager.getDepartmentReward(id);
    }

    getEarningsPerSecond() {
        return this.economyManager.getEarningsPerSecond();
    }

    recalculateEps() {
        if (this.economyManager) {
            this.economyManager.recalculateEps();
        }
    }

    // --- MISSION DELEGATES ---
    generateMission() {
        return this.missionController.generateMission();
    }

    checkMissions() {
        if (this.missionController) {
            this.missionController.checkMissions();
        }
    }

    claimMissionReward(id) {
        return this.missionController.claimMissionReward(id);
    }

    // --- ACHIEVEMENT DELEGATES ---
    checkAchievements() {
        return this.achievementController ? this.achievementController.checkAchievements() : [];
    }

    getAchievementProgress(id) {
        return this.achievementController ? this.achievementController.getProgress(id) : { current: 0, target: 1, percent: 0 };
    }

    claimAchievementReward(id) {
        return this.achievementController ? this.achievementController.claimReward(id) : { type: 'none', amount: 0 };
    }

    // --- STATE MANAGEMENT ---
    ensureTellersCount() {
        if (!this.state || !this.state.tellers) return;
        const maxTellers = this.getMaxTellers();
        // Trim excess tellers from old/corrupted saves
        if (this.state.tellers.length > maxTellers) {
            this.state.tellers = this.state.tellers.slice(0, maxTellers);
        }
        while (this.state.tellers.length < maxTellers) {
            const nextId = this.state.tellers.length;
            this.state.tellers.push({
                id: nextId,
                unlocked: false,
                level: 1,
                cashStored: 0,
                processingTimeLeft: 0,
                isProcessing: false
            });
        }
    }

    isManagerUnlocked(type) {
        // 'customer' is unlocked from the start.
        // 'operations' (Alon) is also unlocked by default (and starts hired to automate guards).
        // Other managers unlock only when their corresponding department is unlocked.
        if (type === 'customer' || type === 'operations' || type === 'accountant') return true;
        if (type === 'finance') return this.state.departments[1] && this.state.departments[1].unlocked;
        if (type === 'service') return this.state.departments[2] && this.state.departments[2].unlocked;
        if (type === 'vip') return !!(this.state.departments && this.state.departments.find(d => d.id === 3)?.unlocked);
        if (type === 'marketing') return !!(this.state.departments && this.state.departments.find(d => d.id === 4)?.unlocked);
        return false;
    }


    getGoldUpgradeCost(type) {
        const baseCost = GAME_CONFIG.GOLD_UPGRADE_COSTS[type] || 999;
        const currentLvl = (this.state.goldUpgrades && this.state.goldUpgrades[type]) ? this.state.goldUpgrades[type] : 0;
        // Costs double per level (1x, 2x, 4x, 8x, 16x...)
        const multiplier = Math.pow(2, currentLvl);
        return Math.round(baseCost * multiplier);
    }

    getAdMaxBudget() {
        const branch = this.state.currentBranch || 0;
        const branchMaxBudget = 1000 * Math.pow(10, branch);
        const floorBudget = 100 * Math.pow(10, branch);
        const epsBasis = this.getEarningsPerSecond() * 60 * 1.5;
        return Math.min(branchMaxBudget, Math.max(floorBudget, epsBasis));
    }

    spendCash(amount) {
        this.state.cash = Math.round((this.state.cash + Number.EPSILON) * 100) / 100;
        if (this.state.cash >= amount) {
            this.state.cash = Math.round((this.state.cash - amount + Number.EPSILON) * 100) / 100;
            if (!this.state.stats.cashSpent) {
                this.state.stats.cashSpent = 0;
            }
            this.state.stats.cashSpent = Math.round((this.state.stats.cashSpent + amount + Number.EPSILON) * 100) / 100;
            return true;
        }
        return false;
    }

    // --- GAME ACTIONS ---
    upgradeEntity(type, id) {
        let entity, cost, statsKey;
        if (type === 'teller') {
            entity = this.state.tellers[id];
            if (!entity || !entity.unlocked) return false;
            cost = this.getTellerUpgradeCost(entity.level);
            statsKey = 'tellerUpgrades';
        } else if (type === 'guard') {
            entity = this.state.guards[id];
            if (!entity || !entity.unlocked) return false;
            cost = this.getGuardUpgradeCost(entity.level);
            statsKey = 'guardUpgrades';
        } else if (type === 'vault') {
            entity = this.state.vault;
            cost = this.getVaultUpgradeCost(entity.level);
            statsKey = 'vaultUpgrades';
        } else {
            return false;
        }

        if (this.spendCash(cost)) {
            entity.level++;
            this.state.stats[statsKey]++;
            this.missionsDirty = true;
            window.gameAudio.playClick();
            if (type === 'teller') {
                this.recalculateEps();
            } else if (type === 'vault' && this.economyManager) {
                this.economyManager._cachedVaultCap = new Map();
            }
            this.saveGame();
            return true;
        }
        return false;
    }

    upgradeEntityBulk(type, id, mode) {
        let entity, statsKey;
        if (type === 'teller') {
            entity = this.state.tellers[id];
            if (!entity || !entity.unlocked) return false;
            statsKey = 'tellerUpgrades';
        } else if (type === 'guard') {
            entity = this.state.guards[id];
            if (!entity || !entity.unlocked) return false;
            statsKey = 'guardUpgrades';
        } else if (type === 'vault') {
            entity = this.state.vault;
            statsKey = 'vaultUpgrades';
        } else {
            return false;
        }

        const details = this.getBulkUpgradeDetails(type, id, mode, entity.level, this.state.cash);
        if (details.canAfford && details.levels > 0) {
            if (this.spendCash(details.cost)) {
                entity.level += details.levels;
                this.state.stats[statsKey] += details.levels;
                this.missionsDirty = true;
                window.gameAudio.playClick();
                if (type === 'teller') {
                    this.recalculateEps();
                } else if (type === 'vault' && this.economyManager) {
                    this.economyManager._cachedVaultCap = new Map();
                }
                this.saveGame();
                return true;
            }
        }
        return false;
    }

    upgradeTeller(id) {
        return this.upgradeEntity('teller', id);
    }

    unlockTeller(id) {
        const teller = this.state.tellers[id];
        if (!teller || teller.unlocked) return false;

        const cost = this.tellerUnlockCosts[id];
        if (this.spendCash(cost)) {
            teller.unlocked = true;
            this.missionsDirty = true;
            teller.level = 1;
            window.gameAudio.playUnlock();
            this.recalculateEps();
            this.saveGame();
            return true;
        }
        return false;
    }

    upgradeGuard(id) {
        return this.upgradeEntity('guard', id);
    }

    unlockGuard(id) {
        const guard = this.state.guards[id];
        if (!guard || guard.unlocked) return false;

        const cost = this.guardUnlockCosts[id];
        if (this.spendCash(cost)) {
            guard.unlocked = true;
            this.missionsDirty = true;
            guard.level = 1;
            window.gameAudio.playUnlock();
            this.saveGame();
            return true;
        }
        return false;
    }

    upgradeVault() {
        return this.upgradeEntity('vault');
    }

    upgradeQueue() {
        const level = this.state.queueUpgradeLevel || 1;
        if (level >= GAME_CONFIG.QUEUE_MAX_LEVEL) return false;

        const cost = this.getQueueUpgradeCost(level);
        if (this.spendCash(cost)) {
            this.state.queueUpgradeLevel = level + 1;
            this.missionsDirty = true;
            window.gameAudio.playClick();
            this.saveGame();
            return true;
        }
        return false;
    }

    upgradeTellerBulk(id, mode) {
        return this.upgradeEntityBulk('teller', id, mode);
    }

    upgradeGuardBulk(id, mode) {
        return this.upgradeEntityBulk('guard', id, mode);
    }

    upgradeVaultBulk(mode) {
        return this.upgradeEntityBulk('vault', null, mode);
    }

    upgradeQueueBulk(mode) {
        const queueLvl = this.state.queueUpgradeLevel || 1;
        if (queueLvl >= GAME_CONFIG.QUEUE_MAX_LEVEL) return false;

        const details = this.getBulkUpgradeDetails('queue', null, mode, queueLvl, this.state.cash);
        if (details.canAfford && details.levels > 0) {
            if (this.spendCash(details.cost)) {
                this.state.queueUpgradeLevel += details.levels;
                this.missionsDirty = true;
                window.gameAudio.playClick();
                this.saveGame();
                return true;
            }
        }
        return false;
    }

    hireManager(type) {
        if (!this.isManagerUnlocked(type)) return false;
        if (this.state.managers[type]) return false;

        const cost = this.managerCosts[type];
        if (this.spendCash(cost)) {
            this.state.managers[type] = true;
            this.missionsDirty = true;
            window.gameAudio.playUnlock();
            this.recalculateEps();
            this.saveGame();
            return true;
        }
        return false;
    }

    unlockDepartment(id) {
        const dept = this.state.departments.find(d => d.id === id);
        if (!dept || dept.unlocked) return false;

        if (this.spendCash(dept.cost)) {
            dept.unlocked = true;
            this.missionsDirty = true;
            window.gameAudio.playUnlock();
            this.recalculateEps();
            this.saveGame();
            return true;
        }
        return false;
    }

    clickTeller(id) {
        const teller = this.state.tellers[id];
        if (!teller || !teller.unlocked || teller.isProcessing) return false;
        
        if (this.customerQueue.length > 0 && teller.cashStored < this.getTellerCapacity(teller.level)) {
            const client = this.customerQueue.shift();
            teller.isProcessing = true;
            teller.customerType = client.type;
            teller.customerSeed = client.seed !== undefined ? client.seed : Math.floor(Math.random() * 1000);
            teller.processingTimeLeft = this.getTellerSpeed(teller.level);
            window.gameAudio.playClick();
            return true;
        }
        return false;
    }

    collectTellerCash(id) {
        const teller = this.state.tellers[id];
        if (!teller || !teller.unlocked || teller.cashStored <= 0) return 0;

        const amountToCollect = teller.cashStored;
        const vaultCapacity = this.getVaultCapacity(this.state.vault.level);
        const vaultAvailableSpace = vaultCapacity - this.state.vault.cashStored;

        if (vaultAvailableSpace <= 0) {
            return 0; // Vault full
        }

        const transAmount = Math.min(amountToCollect, vaultAvailableSpace);
        teller.cashStored = Math.round((teller.cashStored - transAmount + Number.EPSILON) * 100) / 100;
        this.state.vault.cashStored = Math.round((this.state.vault.cashStored + transAmount + Number.EPSILON) * 100) / 100;
        return transAmount;
    }

    collectVault() {
        if (this.state.vault.cashStored <= 0) return 0;
        
        const amount = this.state.vault.cashStored;
        this.state.cash = Math.round((this.state.cash + amount + Number.EPSILON) * 100) / 100;
        this.state.lifetimeCash = Math.round((this.state.lifetimeCash + amount + Number.EPSILON) * 100) / 100;
        this.state.vault.cashStored = 0;
        
        window.gameAudio.playChaChing();
        this.saveGame();
        return amount;
    }

    calculateTotalAssets() {
        let total = 0;
        if (this.state.tellers) {
            this.state.tellers.forEach(t => {
                if (t.unlocked) total += t.level;
            });
        }
        if (this.state.guards) {
            this.state.guards.forEach(g => {
                if (g.unlocked) total += g.level;
            });
        }
        if (this.state.vault) {
            total += this.state.vault.level || 1;
        }
        total += this.state.queueUpgradeLevel || 1;
        if (this.state.departments) {
            this.state.departments.forEach(d => {
                if (d.unlocked) total += 5;
            });
        }
        if (this.state.managers) {
            Object.keys(this.state.managers).forEach(k => {
                if (k !== 'operations' && this.state.managers[k]) {
                    total += 5;
                }
            });
        }
        return total;
    }

    calculatePrestigeShares() {
        // H-06: cache result — invalidate only when lifetimeCash or shares change
        const lifetimeCash = this.state.lifetimeCash || 180;
        
        // Ensure stats object exists
        if (!this.state.stats) this.state.stats = {};
        
        const vipHired = !!(this.state.managers && this.state.managers.vip);
        const vipLvl = (this.state.managerUpgrades && this.state.managerUpgrades.vip) ? this.state.managerUpgrades.vip.level : 1;
        
        // Smarter Scaling Formula: grows reasonably but very hard to hit the 10k cap instantly in late game
        let rawGain = 1500 * Math.pow(lifetimeCash / 1000000000, 0.22);
        
        if (vipHired && this.state.managerUpgrades && this.state.managerUpgrades.vip) {
            rawGain = rawGain * (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.vip.prestigeBoost * vipLvl);
            rawGain = rawGain * (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.vip.prestigeSharesBoost * vipLvl);
        }

        // Initialize claimedPrestigeShares for existing players to prevent sudden infinite shares
        // We set it such that they get exactly 800 base shares right now to "un-stick" them from 0.
        if (typeof this.state.stats.claimedPrestigeShares === 'undefined') {
             this.state.stats.claimedPrestigeShares = Math.max(0, Math.floor(rawGain) - 800);
        }
        
        const claimedShares = this.state.stats.claimedPrestigeShares;
        
        const cacheKey = `${lifetimeCash}:${claimedShares}:${vipHired}:${vipLvl}`;
        if (this._cachedPrestigeSharesKey === cacheKey && this._cachedPrestigeShares !== undefined) {
            return this._cachedPrestigeShares;
        }
        
        let gain = Math.floor(rawGain) - claimedShares;
        
        // Reverted cap to 10,000 per user request
        const result = Math.min(10000, Math.max(0, gain));
        this._cachedPrestigeSharesKey = cacheKey;
        this._cachedPrestigeShares = result;
        return result;
    }

    getDailyLoginReward(streak) {
        const eps = this.getEarningsPerSecond();
        if (streak >= 30) return { type: 'shares', value: 10 };
        if (streak >= 14) return { type: 'shares', value: 3 };
        if (streak >= 7)  return { type: 'shares', value: 1 };
        if (streak >= 5)  return { type: 'boost', value: 1800 };
        if (streak >= 3)  return { type: 'gold', value: 1 };
        if (streak >= 2)  return { type: 'cash', value: Math.max(500, eps * 1800) };
        return { type: 'cash', value: Math.max(180, eps * 300) };
    }

    prestige(targetBranchIndex, doubleShares = false, bypassCashCheck = false) {
        this.isResetting = true;
        let baseSharesGained = this.calculatePrestigeShares();
        let sharesGained = baseSharesGained;
        
        if (doubleShares) {
            // HIGH-3: The parameter name is 'doubleShares', but the UI displays and awards a 3x multiplier (triple shares) by design. We preserve the 3x behavior to match the UI.
            sharesGained *= 3;
            // CAP: reverted to 10000 per user request
            sharesGained = Math.min(10000, sharesGained);
        }
        if (!bypassCashCheck && this.state.cash < this.branches[this.state.currentBranch].minCashToPrestige) {
            this.isResetting = false;
            return false;
        }

        // Apply Prestige — total wallet shares capped at 100,000 (reverted)
        this.state.shares = Math.min(100000, (this.state.shares || 0) + sharesGained);
        
        // IMPORTANT: Increment claimedPrestigeShares by the BASE amount, NOT the ad-boosted amount
        if (!this.state.stats) this.state.stats = {};
        if (typeof this.state.stats.claimedPrestigeShares === 'undefined') {
             // Fallback initialization just in case calculatePrestigeShares didn't do it
             this.state.stats.claimedPrestigeShares = Math.max(0, (this.state.shares || 0) - sharesGained);
        }
        this.state.stats.claimedPrestigeShares += baseSharesGained;

        this.state.currentBranch = targetBranchIndex;
        this.state.maxBranchUnlocked = Math.max(this.state.maxBranchUnlocked || 0, targetBranchIndex);
        
        // Reset cash based on starting cash options in GAME_CONFIG
        const startingCashLevel = (this.state.goldUpgrades && this.state.goldUpgrades.startingCash) ? this.state.goldUpgrades.startingCash : 0;
        const startingCashOptions = GAME_CONFIG.STARTING_CASH_OPTIONS;

        // Branch Welcome Bonus: isNewBranch checked before reset, amount computed after recalculateEps
        const isNewBranch = !this.state.visitedBranches || !this.state.visitedBranches.includes(targetBranchIndex);

        const savedShares = this.state.shares;
        const savedMaxBranch = this.state.maxBranchUnlocked;
        const savedGoldUpgrades = this.state.goldUpgrades;
        const savedLanguage = this.state.language;
        const savedStats = this.state.stats;
        const savedMissionsCompleted = this.state.missionsCompleted;
        const savedLastWeeklyReward = this.state.lastWeeklyReward;
        const savedLastSpinTime = this.state.lastSpinTime;
        const savedLastAdSpinTime = this.state.lastAdSpinTime || 0;
        const savedVisitedBranches = Array.isArray(this.state.visitedBranches) ? [...this.state.visitedBranches] : [];
        const savedLoginDate = this.state.lastLoginDate || 0;
        const savedLoginStreak = this.state.loginStreak || 0;
        const savedPendingLoginReward = this.state.pendingLoginReward || null;
        const savedBoost2xUsedEver = this.state.boost2xUsedEver || false;
        const savedDailyChallenges = this.state.dailyChallenges;
        const savedLastDailyReset = this.state.lastDailyReset;
        const savedMigrations = this.state.migrations ? Object.assign({}, this.state.migrations) : {};
        const savedTutorialCompleted = this.state.tutorialCompleted || false;
        const savedTutorialStep = this.state.tutorialStep || 0;
        const savedDiscoveredTips = this.state.discoveredTips ? Object.assign({}, this.state.discoveredTips) : {};

        if (this._tempQueueBonusTimeout) { clearTimeout(this._tempQueueBonusTimeout); this._tempQueueBonusTimeout = null; }
        this.initDefaultState();

        this.state.shares = savedShares;
        this.state.currentBranch = targetBranchIndex;
        this.state.maxBranchUnlocked = savedMaxBranch;
        this.state.goldUpgrades = savedGoldUpgrades;
        this.state.language = savedLanguage;
        this.state.stats = savedStats;
        this.state.missionsCompleted = savedMissionsCompleted;
        this.state.lastWeeklyReward = savedLastWeeklyReward;
        this.state.lastSpinTime = savedLastSpinTime;
        this.state.lastAdSpinTime = savedLastAdSpinTime;
        this.state.lastLoginDate = savedLoginDate;
        this.state.loginStreak = savedLoginStreak;
        this.state.pendingLoginReward = savedPendingLoginReward;
        this.state.boost2xUsedEver = savedBoost2xUsedEver;
        this.state.dailyChallenges = savedDailyChallenges;
        this.state.lastDailyReset = savedLastDailyReset;
        this.state.migrations = savedMigrations;
        this.state.tutorialCompleted = savedTutorialCompleted;
        this.state.tutorialStep = savedTutorialStep;
        this.state.discoveredTips = savedDiscoveredTips;

        // Restore visitedBranches and add targetBranch if new
        if (!savedVisitedBranches.includes(targetBranchIndex)) {
            savedVisitedBranches.push(targetBranchIndex);
        }
        this.state.visitedBranches = savedVisitedBranches;

        // Reset cash based on starting cash options in GAME_CONFIG
        this.state.cash = Math.round(((startingCashOptions[startingCashLevel] || 180) + Number.EPSILON) * 100) / 100;
        this.state.lifetimeCash = this.state.cash;

        // Generate initial missions
        this.state.missions = [];
        for (let i = 0; i < 5; i++) {
            this.state.missions.push(this.generateMission());
        }
        
        this.sanitizeQueueAndTellers();
        this.customerSpawnTimer = 0;
        
        // Spawn 3 initial customers immediately
        for (let i = 0; i < 3; i++) {
            this.customerCounter++;
            this.customerQueue.push({ id: 'c_' + this.customerCounter, type: 'normal', seed: Math.floor(Math.random() * 1000) });
        }
        
        window.gameAudio.playUnlock();
        this.recalculateEps();

        // Branch Welcome Bonus: computed here so EPS reflects the new branch
        const welcomeBonusCash = isNewBranch ? (this.getEarningsPerSecond() * 60) : 0;
        if (isNewBranch && welcomeBonusCash > 0) {
            this.state.cash = Math.round((this.state.cash + welcomeBonusCash + Number.EPSILON) * 100) / 100;
            this.state.lifetimeCash = Math.round((this.state.lifetimeCash + welcomeBonusCash + Number.EPSILON) * 100) / 100;
            if (typeof window.showToast === 'function') {
                const lang = this.state.language || 'en';
                const tObj = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : null;
                const branchName = (tObj && tObj.branches && tObj.branches.names && tObj.branches.names[targetBranchIndex])
                    ? tObj.branches.names[targetBranchIndex]
                    : (this.branches && this.branches[targetBranchIndex] ? this.branches[targetBranchIndex].name : ('Branch ' + targetBranchIndex));
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
        this.state.dailyChallenges.forEach(c => {
            if (c.completed || c.claimed || c.type !== 'daily_earn_cash') return;
            c.baseProgress = (c.baseProgress || 0) + (c.progress || 0);
            c.startProgress = this.state.lifetimeCash;
        });

        this.isResetting = false;
        this.saveGame(true); // Force save immediately during prestige
        return true;
    }

    triggerGuard(id) {
        const guard = this.state.guards[id];
        if (!guard || !guard.unlocked || guard.state !== 'idle') return false;

        const vaultCapacity = this.getVaultCapacity(this.state.vault.level);
        const vaultSpaceLeft = vaultCapacity - this.state.vault.cashStored;

        // Build ordered queue of ALL unlocked tellers for visual patrol
        const queue = [];
        this.state.tellers.forEach((t, idx) => {
            if (t.unlocked) queue.push(idx);
        });

        if (queue.length > 0 && vaultSpaceLeft > 0) {
            guard.tellerVisitQueue = queue;
            guard.targetTellerIndex = queue[0];
            guard.carriedAmount = 0;
            guard.loadedCash = 0;
            guard.segmentPosition = guard.segmentPosition || guard.position || GAME_CONFIG.GUARD_VAULT_ANCHOR;
            guard.state = 'moving_to_teller_' + queue[0];
            guard.timer = 0;
            window.gameAudio.playClick();
            return true;
        }
        return false;
    }

    tickTimer(stateField, dt, onExpire) {
        if (this.state[stateField] && this.state[stateField] > 0) {
            this.state[stateField] -= dt;
            if (this.state[stateField] <= 0.01) {
                this.state[stateField] = 0;
                if (typeof onExpire === 'function') {
                    onExpire();
                }
            }
        }
    }

    // --- GAME LOOP UPDATE ---
    update(dt) {
        this.tickTimer('boost2xTimeLeft', dt, () => { if (this.economyManager) this.economyManager.cachedTotalMult = null; });
        this.tickTimer('tellerSpeedBoostTimer', dt, () => this.recalculateEps());

        const advBudget = this.state.advBudget || 0;
        if (advBudget > 0) {
            const costThisFrame = advBudget * dt / 60;
            if (this.state.cash >= costThisFrame) {
                this.state.cash = Math.round((this.state.cash - costThisFrame + Number.EPSILON) * 100) / 100;
                this.state.advActive = true;
            } else {
                this.state.advBudget = 0;
                this.state.advActive = false;
                this.saveGame();
            }
        } else {
            this.state.advActive = false;
        }

        // Spawning customers
        this.customerSpawnTimer += dt;
        let spawnInterval = 4.0;
        if (this.state.managers && this.state.managers.customer && this.state.managerUpgrades.customer) {
            const customerLvl = this.state.managerUpgrades.customer.level;
            spawnInterval = 1.5 / (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.customer.spawnIntervalBoost * (customerLvl - 1));
        }
        
        let adMaxBudget = 0;
        if (this.state.advActive && advBudget > 0) {
            adMaxBudget = this.getAdMaxBudget();
            const normalizedBudget = advBudget / adMaxBudget;
            
            let totalServiceRate = 0;
            this.state.tellers.forEach(t => {
                if (t.unlocked) {
                    const speed = this.getTellerSpeed(t.level);
                    totalServiceRate += (1 / speed);
                }
            });
            
            const baseSpawnRate = 1 / spawnInterval;
            const maxSpawnRate = Math.max(1.5, totalServiceRate * 1.3);
            const maxBoostFactor = maxSpawnRate / baseSpawnRate;
            
            let boostFactor = 1 + normalizedBudget * (maxBoostFactor - 1);
            if (this.state.managers && this.state.managers.marketing && this.state.managerUpgrades.marketing) {
                boostFactor *= (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.marketing.adBoost * this.state.managerUpgrades.marketing.level);
            }
            spawnInterval = spawnInterval / boostFactor;
        }

        if (this.customerSpawnTimer >= spawnInterval) {
            this.customerSpawnTimer = 0;
            const maxQueue = this.getQueueCapacity(this.state.queueUpgradeLevel || 1);
            if (this.customerQueue.length < maxQueue) {
                let type = 'normal';
                const rand = Math.random();
                
                let vipThreshold = 0.95;
                let richThreshold = 0.80;
                if (this.state.advActive && advBudget > 0) {
                    const normalizedBudget = Math.min(1.0, advBudget / adMaxBudget);
                    vipThreshold -= (normalizedBudget * 0.15);
                    richThreshold -= (normalizedBudget * 0.30);
                }

                const deptLaundering = this.state.departments.find(d => d.id === GAME_CONFIG.DEPT_ID_LAUNDERING);
                const deptVip = this.state.departments.find(d => d.id === GAME_CONFIG.DEPT_ID_VIP);
                if (deptVip && deptVip.unlocked && rand > vipThreshold) {
                    type = 'vip';
                } else if (deptLaundering && deptLaundering.unlocked && rand > richThreshold) {
                    type = 'rich';
                }
                
                this.customerCounter++;
                this.customerQueue.push({ id: 'c_' + this.customerCounter, type, seed: Math.floor(Math.random() * 1000) });
            }
        }

        // Automating Teller actions
        let checkedCount = 0;
        let tellerIndex = this.lastTellerOffset;
        let assignedCount = 0;
        
        while (checkedCount < this.state.tellers.length && assignedCount < this.customerQueue.length) {
            const t = this.state.tellers[tellerIndex];
            if (t.unlocked && !t.isProcessing && t.cashStored < this.getTellerCapacity(t.level)) {
                const client = this.customerQueue[assignedCount];
                t.isProcessing = true;
                t.customerType = client.type;
                t.customerSeed = client.seed !== undefined ? client.seed : Math.floor(Math.random() * 1000);
                t.processingTimeLeft = this.getTellerSpeed(t.level);
                assignedCount++;
                tellerIndex = (tellerIndex + 1) % this.state.tellers.length;
            } else {
                tellerIndex = (tellerIndex + 1) % this.state.tellers.length;
            }
            checkedCount++;
        }
        this.lastTellerOffset = tellerIndex;
        if (assignedCount > 0) {
            this.customerQueue = this.customerQueue.slice(assignedCount);
        }

        const baseRewardForTick = this.getCurrentBaseReward();
        const finalRewardForTick = baseRewardForTick * this.getTotalMultiplier();

        // Updating Teller processing timers
        let _tickVipCount = 0;
        let _tickHadNonVip = false;
        this.state.tellers.forEach(t => {
            if (t.unlocked && t.isProcessing) {
                t.processingTimeLeft -= dt;
                if (t.processingTimeLeft <= 0) {
                    t.isProcessing = false;
                    t.processingTimeLeft = 0;
                    this.state.stats.clientsServed++;
                    if (t.customerType === 'vip' || t.customerType === 'rich') {
                        if (!this.state.stats.vipServed) this.state.stats.vipServed = 0;
                        this.state.stats.vipServed++;
                        _tickVipCount++;
                    } else {
                        _tickHadNonVip = true;
                    }
                    this.missionsDirty = true;

                    // boost_run tracking: accumulate cash earned while boost is active
                    if (this.state.boost2xTimeLeft > 0) {
                        this.state.boost2xUsedEver = true;
                        this.state.missions.forEach(m => {
                            if (m.type === 'boost_run' && !m.completed) {
                                m.boostCashAccumulator = (m.boostCashAccumulator || 0) + finalRewardForTick;
                            }
                        });
                    }

                    t.cashStored = Math.round((t.cashStored + finalRewardForTick + Number.EPSILON) * 100) / 100;

                    const cap = this.getTellerCapacity(t.level);
                    if (t.cashStored > cap) {
                        t.cashStored = cap;
                    }
                }
            }
        });



        // Update Guards state machine — multi-stop route
        // Route: idle → moving_to_teller_N → collecting_from_teller_N (repeat per teller) → moving_to_vault → depositing → idle
        const vaultCapacity = this.getVaultCapacity(this.state.vault.level);

        const _getTellerAnchor = (ti) => {
            const anchors = GAME_CONFIG.GUARD_TELLER_ANCHORS;
            if (anchors && anchors[ti] !== undefined) return anchors[ti];
            // Fallback for 8 tellers
            const fallback = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
            return fallback[ti] !== undefined ? fallback[ti] : 0.5;
        };
        const VAULT_ANCHOR = GAME_CONFIG.GUARD_VAULT_ANCHOR;

        this.state.guards.forEach(g => {
            if (!g.unlocked) return;

            const transitDuration = this.getGuardSpeed(g.level);
            const capacity = this.getGuardCapacity(g.level);
            const vaultSpaceLeft = vaultCapacity - this.state.vault.cashStored;

            // Ensure new fields exist (migration safety)
            if (!Array.isArray(g.tellerVisitQueue)) g.tellerVisitQueue = [];
            if (typeof g.level !== 'number' || isNaN(g.level)) g.level = 1;
            if (g.segmentPosition === undefined || isNaN(g.segmentPosition)) {
                g.segmentPosition = g.position || GAME_CONFIG.GUARD_VAULT_ANCHOR;
            }
            if (g.position === undefined || isNaN(g.position)) {
                g.position = g.segmentPosition;
            }
            if (typeof g.segmentPosition !== 'number' || isNaN(g.segmentPosition)) g.segmentPosition = g.position || 0;
            if (typeof g.carriedAmount !== 'number' || isNaN(g.carriedAmount))   g.carriedAmount = g.loadedCash || 0;
            if (typeof g.targetTellerIndex !== 'number' || isNaN(g.targetTellerIndex)) g.targetTellerIndex = 0;

            // Normalise legacy states that no longer exist
            if (g.state === 'moving_to_tellers' || g.state === 'collecting') {
                g.state = 'idle';
            }

            if (g.state === 'idle') {
                // ── IDLE ──────────────────────────────────────────────────────
                if (g.carriedAmount > 0) {
                    // Had leftover cargo (e.g. vault was full) — try depositing now
                    if (vaultSpaceLeft > 0) {
                        g.state = 'moving_to_vault';
                    }
                } else if (this.state.managers.operations && vaultSpaceLeft > 0) {
                    let hasCash = false;
                    for (let i = 0; i < this.state.tellers.length; i++) {
                        if (this.state.tellers[i] && this.state.tellers[i].unlocked && this.state.tellers[i].cashStored > 0) {
                            hasCash = true;
                            break;
                        }
                    }
                    if (hasCash) {
                        const queue = [];
                        this.state.tellers.forEach((t, idx) => {
                            if (t.unlocked) queue.push(idx);
                        });
                        g.tellerVisitQueue = queue;
                        g.targetTellerIndex = queue[0];
                        g.carriedAmount = 0;
                        g.state = 'moving_to_teller_' + queue[0];
                    }
                }

            } else if (g.state.startsWith('moving_to_teller_')) {
                // ── MOVING TO TELLER N ────────────────────────────────────────
                const ti = parseInt(g.state.slice('moving_to_teller_'.length), 10);
                const targetAnchor = _getTellerAnchor(ti);
                const curPos = g.segmentPosition;
                const dir = targetAnchor > curPos ? 1 : -1;
                const step = dt / transitDuration;
                g.segmentPosition = curPos + dir * step;

                const reached = dir > 0 ? g.segmentPosition >= targetAnchor
                                         : g.segmentPosition <= targetAnchor;
                if (reached) {
                    g.segmentPosition = targetAnchor;
                    g.targetTellerIndex = ti;
                    g.state = 'collecting_from_teller_' + ti;
                    g.timer = 0.4;
                }
                g.position = g.segmentPosition;

            } else if (g.state.startsWith('collecting_from_teller_')) {
                // ── COLLECTING FROM TELLER N ──────────────────────────────────
                g.timer -= dt;
                if (g.timer <= 0) {
                    const ti = parseInt(g.state.slice('collecting_from_teller_'.length), 10);
                    const teller = this.state.tellers[ti];
                    if (teller && teller.unlocked && teller.cashStored > 0) {
                        const spaceLeft = capacity - g.carriedAmount;
                        const taken = Math.min(teller.cashStored, spaceLeft);
                        teller.cashStored = Math.round((teller.cashStored - taken + Number.EPSILON) * 100) / 100;
                        g.carriedAmount = Math.round((g.carriedAmount + taken + Number.EPSILON) * 100) / 100;
                        // Store actual collected amount and source teller so ui-draw can display
                        // the correct floating text and coin animation when this state transition
                        // is detected (prev=collecting_from_teller_N → cur=moving_to_* or moving_to_vault).
                        g.lastCollectedAmount = taken;
                        g.lastCollectedTellerIndex = ti;
                    } else {
                        g.lastCollectedAmount = 0;
                        g.lastCollectedTellerIndex = ti;
                    }
                    // Remove this teller from the visit queue
                    g.tellerVisitQueue = g.tellerVisitQueue.filter(idx => idx !== ti);

                    // Find next teller in order (1, 2, 3...)
                    let nextTi = -1;
                    for (let i = ti + 1; i < this.state.tellers.length; i++) {
                        const t = this.state.tellers[i];
                        if (t && t.unlocked) {
                            nextTi = i;
                            break;
                        }
                    }

                    if (nextTi >= 0) {
                        g.targetTellerIndex = nextTi;
                        g.state = 'moving_to_teller_' + nextTi;
                    } else {
                        // Done collecting — head to vault
                        g.tellerVisitQueue = [];
                        g.state = 'moving_to_vault';
                    }
                    // Sync loadedCash for UI / save compatibility
                    g.loadedCash = g.carriedAmount;
                }

            } else if (g.state === 'moving_to_vault') {
                // ── MOVING TO VAULT ───────────────────────────────────────────
                const curPos = g.segmentPosition;
                const dir = VAULT_ANCHOR > curPos ? 1 : -1;
                const step = dt / transitDuration;
                g.segmentPosition = curPos + dir * step;

                const reached = dir > 0 ? g.segmentPosition >= VAULT_ANCHOR
                                         : g.segmentPosition <= VAULT_ANCHOR;
                if (reached) {
                    g.segmentPosition = VAULT_ANCHOR;
                    g.state = 'depositing';
                    g.timer = 0.5;
                }
                g.position = g.segmentPosition;

            } else if (g.state === 'depositing') {
                // ── DEPOSITING ────────────────────────────────────────────────
                // C-12: vault completely full — go idle immediately
                if (vaultSpaceLeft <= 0) {
                    g.state = 'idle';
                } else {
                    g.timer -= dt;
                    if (g.timer <= 0) {
                        const spaceInVault = vaultCapacity - this.state.vault.cashStored;
                        if (spaceInVault <= 0) {
                            g.state = 'idle';
                        } else {
                            const depositAmount = Math.min(g.carriedAmount, spaceInVault);
                            this.state.vault.cashStored = Math.round((this.state.vault.cashStored + depositAmount + Number.EPSILON) * 100) / 100;
                            g.carriedAmount = Math.round((g.carriedAmount - depositAmount + Number.EPSILON) * 100) / 100;
                            g.loadedCash = g.carriedAmount;

                            if (g.carriedAmount > 0) {
                                // Vault partially full — retry next tick
                                g.timer = 0.5;
                            } else {
                                g.state = 'idle';
                                // guard_trips tracking: count completed deposit trips
                                this.state.guardTripsTotal = (this.state.guardTripsTotal || 0) + 1;
                            }
                        }
                    }
                }
            }
        });

        // Automating Vault emptying (Finance Manager)
        if (this.state.managers.finance && this.state.vault.cashStored > 0) {
            const amt = this.state.vault.cashStored;
            this.state.cash = Math.round((this.state.cash + amt + Number.EPSILON) * 100) / 100;
            this.state.lifetimeCash = Math.round((this.state.lifetimeCash + amt + Number.EPSILON) * 100) / 100;
            this.state.vault.cashStored = 0;
        }

        if (this.missionsDirty) {
            this.checkMissions();
            this.missionsDirty = false;
        }

        // VIP Visitor logic
        const nowMs = Date.now();
        if (!this.state.vipVisitActive) {
            if (!this.state.nextVipVisit || this.state.nextVipVisit === 0) {
                this.state.nextVipVisit = nowMs + (600 + Math.random() * 60) * 1000;
            } else if (nowMs >= this.state.nextVipVisit) {
                if (this.state.boost2xTimeLeft <= 0) {
                    this.state.vipVisitActive = true;
                    this.state.vipVisitExpiry = nowMs + 25000;
                    if (typeof window.triggerVipVisitBanner === 'function') {
                        window.triggerVipVisitBanner();
                    }
                } else {
                    // Boost פעיל — דחה ב-2 דקות
                    this.state.nextVipVisit = nowMs + 120000;
                }
            }
        } else if (this.state.vipVisitExpiry && nowMs > this.state.vipVisitExpiry) {
            this.state.vipVisitActive = false;
            this.state.nextVipVisit = nowMs + (300 + Math.random() * 30) * 1000;
            this.state.vipVisitExpiry = 0;
            if (typeof window.removeVipVisitBanner === 'function') {
                window.removeVipVisitBanner();
            }
        }
    }

    buyGoldUpgrade(type) {
        if (!this.state.goldUpgrades || typeof this.state.goldUpgrades.managerDiscount === 'undefined') {
            this.state.goldUpgrades = Object.assign({
                startingCash: 0, guardSpeed: 0, premiumYield: 0, shareEfficiency: 0,
                offlineEarnings: 0, tellerCapacityBoost: 0, vaultCapacityBoost: 0,
                eventBonus: 0, managerDiscount: 0
            }, this.state.goldUpgrades || {});
        }
        
        const currentLvl = this.state.goldUpgrades[type] || 0;
        let maxLvl = 5;
        if (type === 'startingCash') maxLvl = 4;
        else if (type === 'shareEfficiency') maxLvl = 4;
        else if (type === 'managerDiscount') maxLvl = 4;

        if (currentLvl >= maxLvl) return false;
        
        const cost = this.getGoldUpgradeCost(type);
        if (this.state.shares >= cost) {
            this.state.shares -= cost;
            this.state.goldUpgrades[type]++;
            if ((type === 'vaultCapacityBoost' || type === 'tellerCapacityBoost') && this.economyManager) {
                this.economyManager._cachedVaultCap = new Map();
                this.economyManager._cachedTellerCap = null;
            }
            window.gameAudio.playUnlock();
            this.recalculateEps();
            this.saveGame();
            return true;
        }
        return false;
    }

    upgradeManager(type) {
        if (!this.state.managerUpgrades) {
            // CRIT-9: Initialize managerUpgrades fallback with the correct manager keys instead of tellers/guards/vault
            this.state.managerUpgrades = {
                customer: { level: 1, skill: null },
                finance: { level: 1, skill: null },
                operations: { level: 1, skill: null },
                service: { level: 1, skill: null },
                vip: { level: 1, skill: null },
                marketing: { level: 1, skill: null }
            };
        }

        const mgr = this.state.managerUpgrades[type];
        if (!mgr) return false;
        if (mgr.level >= 5) return false;
        
        const costs = this.managerUpgradeCosts[type] || GAME_CONFIG.MANAGER_UPGRADE_COSTS_DEFAULT;
        const cost = costs[mgr.level] || 100000;
        
        if (this.spendCash(cost)) {
            mgr.level++;
            this.missionsDirty = true;
            window.gameAudio.playUnlock();
            this.recalculateEps();
            this.saveGame();
            return true;
        }
        return false;
    }

    upgradeManagerBulk(type, mode) {
        if (!this.state.managerUpgrades) return false;
        const mgr = this.state.managerUpgrades[type];
        if (!mgr) return false;
        if (mgr.level >= 5) return false;

        const details = this.getBulkUpgradeDetails('manager', type, mode, mgr.level, this.state.cash);
        if (details.canAfford && details.levels > 0 && this.spendCash(details.cost)) {
            mgr.level += details.levels;
            this.missionsDirty = true;
            window.gameAudio.playUnlock();
            this.recalculateEps();
            this.saveGame();
            return true;
        }
        return false;
    }

    selectManagerSkill(type, skill) {
        if (!this.state.managerUpgrades) return false;
        const mgr = this.state.managerUpgrades[type];
        if (!mgr) return false;
        
        if (mgr.skill === skill) {
            return false;
        } else {
            mgr.skill = skill;
        }
        window.gameAudio.playClick();
        this.recalculateEps();
        this.saveGame();
        return true;
    }

    resetManagerSkill(type, free = false) {
        if (!this.state.managerUpgrades) return false;
        const mgr = this.state.managerUpgrades[type];
        if (!mgr || !mgr.skill) return false;
        
        const cost = 5000;
        if (free || this.spendCash(cost)) {
            mgr.skill = null;
            window.gameAudio.playClick();
            this.recalculateEps();
            this.saveGame();
            return true;
        }
        return false;
    }

    addBoost2x(hours) {
        const secondsToAdd = hours * 3600;
        const maxSeconds = 8 * 3600;
        this.state.boost2xTimeLeft = Math.min(maxSeconds, (this.state.boost2xTimeLeft || 0) + secondsToAdd);
        if (this.economyManager) this.economyManager.cachedTotalMult = null;
        window.gameAudio.playUnlock();
        this.saveGame();
        return true;
    }

    // --- ENCAPSULATION API METHODS FOR MVC COMPLIANCE ---
    addCash(amount) {
        const prev = this.state.lifetimeCash;
        this.state.cash = Math.round((this.state.cash + amount + Number.EPSILON) * 100) / 100;
        this.state.lifetimeCash = Math.round((this.state.lifetimeCash + amount + Number.EPSILON) * 100) / 100;
        // Trigger contextual ad on cash milestones
        const MILESTONES = [5000, 50000, 500000, 5000000, 50000000, 500000000];
        for (const m of MILESTONES) {
            if (prev < m && this.state.lifetimeCash >= m) {
                this._contextualAdPending = 'milestone';
                break;
            }
        }
        this.saveGame();
    }

    deductVaultCash(amount) {
        if (this.state.vault) {
            this.state.vault.cashStored = Math.max(0, this.state.vault.cashStored - amount);
            this.saveGame();
        }
    }

    triggerSpeedBoost(duration, factor) {
        if (!this.state.tellerSpeedBoostTimer || this.state.tellerSpeedBoostTimer <= 0 || factor >= this.state.tellerSpeedBoostFactor) {
            this.state.tellerSpeedBoostTimer = duration;
            this.state.tellerSpeedBoostFactor = factor;
            this.recalculateEps();
            this.saveGame();
        }
    }

    addShares(amount) {
        // Same 100K wallet cap enforced by prestige()
        this.state.shares = Math.min(100000, (this.state.shares || 0) + amount);
        this.saveGame();
    }

    setLanguage(lang) {
        this.state.language = lang;
        this.saveGame();
    }

    setAdvBudget(budget) {
        this.state.advBudget = budget;
        this.saveGame();
    }

    travelToBranch(branchIndex) {
        if (branchIndex < this.state.currentBranch) {
            console.warn("Traveling back to older branches is disabled.");
            return;
        }
        this.state.currentBranch = branchIndex;
        this.state.missions = [];
        this.ensureTellersCount();
        this.checkMissions();
        this.sanitizeQueueAndTellers();
        this.recalculateEps();
        this.saveGame(true); // Force save on travel
    }

    upgradeManagerLevelDirectly(type, level) {
        if (this.state.managerUpgrades && this.state.managerUpgrades[type]) {
            this.state.managerUpgrades[type].level = level;
            this.recalculateEps();
            this.saveGame();
        }
    }

    triggerTempQueueBonus(amount, durationMs) {
        // NOTE: tempQueueBonus is intentionally a volatile property on the game instance.
        // It does not persist across page reloads. If a reload occurs while active,
        // the bonus resets. The Math.max(0, ...) guard below prevents negative values
        // if a timeout clears after a reload/reset.
        this.tempQueueBonus = (this.tempQueueBonus || 0) + amount;
        if (this._tempQueueBonusTimeout) {
            clearTimeout(this._tempQueueBonusTimeout);
            this._tempQueueBonusTimeout = null;
        }
        this._tempQueueBonusTimeout = setTimeout(() => {
            this.tempQueueBonus = Math.max(0, (this.tempQueueBonus || 0) - amount);
            this._tempQueueBonusTimeout = null;
        }, durationMs);
    }

    shiftQueue(count = 1) {
        if (this.customerQueue.length > 0) {
            const shiftCount = Math.min(count, this.customerQueue.length);
            this.customerQueue = this.customerQueue.slice(shiftCount);
        }
    }

    clearQueue() {
        this.customerQueue = [];
    }

    sanitizeQueueAndTellers() {
        if (!this.state || !this.state.departments) return;
        const richDept = this.state.departments.find(d => d.id === GAME_CONFIG.DEPT_ID_LAUNDERING);
        const vipDept = this.state.departments.find(d => d.id === GAME_CONFIG.DEPT_ID_VIP);
        const richUnlocked = richDept ? richDept.unlocked : false;
        const vipUnlocked = vipDept ? vipDept.unlocked : false;

        if (this.customerQueue) {
            this.customerQueue.forEach(client => {
                if (client.type === 'vip' && !vipUnlocked) {
                    client.type = 'normal';
                }
                if (client.type === 'rich' && !richUnlocked) {
                    client.type = 'normal';
                }
            });
        }

        if (this.state.tellers) {
            this.state.tellers.forEach(t => {
                if (t.isProcessing) {
                    if (t.customerType === 'vip' && !vipUnlocked) {
                        t.customerType = 'normal';
                    }
                    if (t.customerType === 'rich' && !richUnlocked) {
                        t.customerType = 'normal';
                    }
                }
            });
        }
    }

    // --- MVC RENDER DATA GETTERS ---
    getTellerRenderData(id) {
        const t = this.state.tellers[id];
        if (!t) return null;
        const speed = this.getTellerSpeed(t.level);
        const capacity = this.getTellerCapacity(t.level);
        const reward = this.getCurrentBaseReward() * this.getTotalMultiplier();
        const ratio = t.cashStored / capacity;
        const fillPercent = Math.min(100, Math.floor(ratio * 100));
        const elapsed = speed - t.processingTimeLeft;
        const progressPercent = t.isProcessing ? Math.min(100, Math.floor((elapsed / speed) * 100)) : 0;
        return {
            id: t.id,
            unlocked: t.unlocked,
            level: t.level,
            cashStored: t.cashStored,
            capacity,
            speed,
            reward,
            fillPercent,
            progressPercent,
            isProcessing: t.isProcessing,
            customerType: t.customerType,
            customerSeed: t.customerSeed
        };
    }

    getGuardRenderData(id) {
        const g = this.state.guards[id];
        if (!g) return null;
        const speed = this.getGuardSpeed(g.level);
        const capacity = this.getGuardCapacity(g.level);
        return {
            id: g.id,
            unlocked: g.unlocked,
            level: g.level,
            loadedCash: g.loadedCash,
            capacity,
            speed,
            position: g.segmentPosition !== undefined ? g.segmentPosition : g.position,
            state: g.state,
            timer: g.timer,
            targetTellerIndex: g.targetTellerIndex || 0,
            carriedAmount: g.carriedAmount || 0,
            tellerVisitQueue: g.tellerVisitQueue || []
        };
    }

    getVaultRenderData() {
        const vault = this.state.vault;
        const capacity = this.getVaultCapacity(vault.level);
        const fillRatio = vault.cashStored / capacity;
        const fillPercent = Math.min(100, Math.floor(fillRatio * 100));
        const yieldPerHour = this.getEarningsPerSecond() * 3600;
        return {
            level: vault.level,
            cashStored: vault.cashStored,
            capacity,
            fillPercent,
            yieldPerHour
        };
    }

    getQueueRenderData() {
        const level = this.state.queueUpgradeLevel || 1;
        const capacity = this.getQueueCapacity(level);
        const currentLen = this.customerQueue.length;
        const fillRatio = currentLen / capacity;
        const fillPercent = Math.min(100, Math.floor(fillRatio * 100));
        return {
            level,
            capacity,
            currentLen,
            fillPercent
        };
    }

    getManagerRenderData(type) {
        const isUnlocked = this.isManagerUnlocked(type);
        const isHired = this.state.managers[type];
        const cost = this.managerCosts[type];
        const mgrDetails = this.state.managerUpgrades[type] || { level: 1, skill: null };
        const level = mgrDetails.level || 1;

        // Calculate contribution and extraHourly
        const eps = this.getEarningsPerSecond();
        let contribution = 0;
        const coefs = GAME_CONFIG.MANAGER_COEFFICIENTS[type];
        if (isHired && coefs && coefs.incomeBoost) {
            contribution = coefs.incomeBoost * level;
        }
        const extraHourly = eps * 3600 * contribution;

        // Stats calculation
        let stat1Val = '';
        let stat2Val = '';
        if (!coefs) {
            return { type, isUnlocked, isHired, cost, level, extraHourly, stat1Val, stat2Val };
        }
        if (type === 'customer') {
            stat1Val = `+${Math.round(coefs.spawnIntervalBoost * 100 * level)}%`;
            stat2Val = `+${Math.round(coefs.incomeBoost * 100 * level)}%`;
        } else if (type === 'finance') {
            const lang = this.state.language || 'en';
            const tAuto = (typeof translations !== 'undefined' && translations[lang] && translations[lang].autoText) ? translations[lang].autoText : 'Auto';
            stat1Val = tAuto;
            stat2Val = `+${Math.round(coefs.deptIncomeBoost * 100 * level)}%`;
        } else if (type === 'operations') {
            stat1Val = `+${Math.round(coefs.guardSpeedBoost * 100 * level)}%`;
            stat2Val = `+${Math.round(coefs.guardCapBoost * 100 * level)}%`;
        } else if (type === 'service') {
            stat1Val = `+${Math.round(coefs.capacityBoost * 100 * level)}%`;
            stat2Val = `+${Math.round(coefs.epsBoost * 100 * level)}%`;
        } else if (type === 'vip') {
            stat1Val = `+${Math.round(coefs.incomeBoost * 100 * level)}%`;
            stat2Val = `+${Math.round(coefs.prestigeSharesBoost * 100 * level)}%`;
        } else if (type === 'marketing') {
            stat1Val = `+${Math.round(coefs.adBoost * 100 * level)}%`;
            stat2Val = `+${coefs.offlineLimitBoost * level}`;
        } else if (type === 'accountant') {
            stat1Val = `+${coefs.offlineLimitBoost * level}h`;
            stat2Val = `+${Math.round(coefs.offlineIncomeBoost * 100 * level)}%`;
        }

        return {
            type,
            isUnlocked,
            isHired,
            cost,
            level,
            extraHourly,
            stat1Val,
            stat2Val
        };
    }
}

window.IdleBankGame = IdleBankGame;
