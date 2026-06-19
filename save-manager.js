const roundCents = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveTimeout = null;
        this.lastSaveTime = 0;
        this.saveDelay = 3000; // Throttle saves to at most once per 3 seconds
        this.serverTimeOffset = 0;
        this.isServerTimeVerified = false;
    }

    async fetchServerTime() {
        // Only attempt to fetch server time if online and not under file:// protocol
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return null;
        }
        if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
            return null;
        }

        try {
            // HEAD request with cache-busting query parameter to force fetching real Date header from server
            const response = await fetch(window.location.origin + window.location.pathname + '?cb=' + Date.now(), { 
                method: 'HEAD',
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            });
            const dateStr = response.headers.get('Date');
            if (dateStr) {
                const parsedDate = new Date(dateStr);
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                    return parsedDate.getTime();
                }
            }
        } catch (e) {
            console.warn("Failed to fetch server time, using unverified local time.", e);
        }
        return null;
    }

    async initServerTime() {
        const serverTime = await this.fetchServerTime();
        if (serverTime) {
            this.serverTimeOffset = serverTime - Date.now();
            this.isServerTimeVerified = true;
            console.log(`Server time verified. Local clock offset: ${this.serverTimeOffset}ms`);
        } else {
            this.serverTimeOffset = 0;
            this.isServerTimeVerified = false;
            console.log("Using unverified local clock for time calculations.");
        }
        
        // Execute offline calculations now that time verification status is settled
        this.calculateOfflineEarnings();
        
        // Trigger offline earnings modal if there is a pending report
        if (this.game.offlineEarningsReport && this.game.offlineEarningsReport > 0) {
            const elModal = document.getElementById('offline-modal');
            const elModalAmount = document.getElementById('modal-amount');
            if (elModal && elModalAmount) {
                elModalAmount.innerText = formatMoney(this.game.offlineEarningsReport);
                elModal.classList.add('active');
            }
        }

        // Re-check missions after offline progress is loaded
        this.game.checkMissions();

        // Refresh UI elements
        if (typeof window.refreshAllTabs === 'function') {
            window.refreshAllTabs();
        }
    }

    getChecksum(dataString) {
        const salt = atob("QjRua0VtUDFyM19TM2NyM3RfUzRsdF8yMDI2");
        const combined = dataString + salt;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }

    saveGame(force = false) {
        if (force) {
            this.executeSave();
        } else {
            this.queueSave();
        }
    }

    queueSave() {
        if (this.saveTimeout) {
            return;
        }

        const now = Date.now();
        const elapsed = now - this.lastSaveTime;

        if (elapsed >= this.saveDelay) {
            this.executeSave();
        } else {
            const remaining = this.saveDelay - elapsed;
            this.saveTimeout = setTimeout(() => {
                this.executeSave();
            }, remaining);
        }
    }

    executeSave(force = false) {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }

        if (this.game.isResetting && !force) return;
        
        // Use verified server time if available to prevent local system clock modifications from changing save timestamps
        const now = this.isServerTimeVerified ? (Date.now() + this.serverTimeOffset) : Date.now();
        this.game.state.lastSaveTime = now;

        // Remove checksum key before stringifying to get original data string
        delete this.game.state.checksum;

        const jsonStr = JSON.stringify(this.game.state);
        const checksum = this.getChecksum(jsonStr);
        this.game.state.checksum = checksum;

        // Construct final JSON string by inserting checksum directly to avoid a second expensive stringify
        const finalJsonStr = jsonStr.slice(0, -1) + `,"checksum":"${checksum}"}`;
        
        // CRIT-1: Prevent stack overflow for large saves by encoding bytes using a loop
        const bytes = new TextEncoder().encode(finalJsonStr);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const encryptedState = btoa(binary);
        window.localStorage.setItem('idle_bank_save', encryptedState);
        
        this.lastSaveTime = Date.now();
    }

    clearSave() {
        this.game.isResetting = true;
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        window.localStorage.removeItem('idle_bank_save');
        this.game.initDefaultState();
        // CRIT-4: Pass force=true to allow saving default state even while isResetting is true, and only disable isResetting afterward
        this.executeSave(true); // Force save default state immediately
        this.game.isResetting = false;
    }

    deepMerge(target, source) {
        if (!source || typeof source !== 'object') return target;
        if (!target || typeof target !== 'object') return source;
        
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (source[key] instanceof Array) {
                    if (!(target[key] instanceof Array)) {
                        target[key] = [];
                    }
                    for (let i = 0; i < source[key].length; i++) {
                        if (typeof source[key][i] === 'object' && source[key][i] !== null) {
                            target[key][i] = this.deepMerge(target[key][i] || {}, source[key][i]);
                        } else {
                            target[key][i] = source[key][i];
                        }
                    }
                } else if (typeof source[key] === 'object' && source[key] !== null) {
                    target[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    validateAndHealState(state) {
        if (!state || typeof state !== 'object') {
            this.game.initDefaultState();
            return;
        }

        const isNum = (v) => typeof v === 'number' && !isNaN(v) && isFinite(v);
        const isBool = (v) => typeof v === 'boolean';
        const isString = (v) => typeof v === 'string';

        // General numbers
        if (!isNum(state.cash) || state.cash < 0) state.cash = 180;
        else state.cash = roundCents(state.cash);

        if (!isNum(state.lifetimeCash) || state.lifetimeCash < 0) state.lifetimeCash = state.cash;
        else state.lifetimeCash = roundCents(state.lifetimeCash);

        if (!isNum(state.shares) || state.shares < 0) state.shares = 0;
        else state.shares = Math.floor(state.shares);

        if (!isNum(state.currentBranch) || state.currentBranch < 0 || state.currentBranch > 3) state.currentBranch = 0;
        if (!isNum(state.maxBranchUnlocked) || state.maxBranchUnlocked < 0) state.maxBranchUnlocked = state.currentBranch;
        if (!isString(state.language)) state.language = 'he';

        // Timers
        if (!isNum(state.boost2xTimeLeft) || state.boost2xTimeLeft < 0) state.boost2xTimeLeft = 0;
        if (!isNum(state.lastWeeklyReward) || state.lastWeeklyReward < 0) state.lastWeeklyReward = 0;
        if (!isNum(state.tellerSpeedBoostTimer) || state.tellerSpeedBoostTimer < 0) state.tellerSpeedBoostTimer = 0;
        if (!isNum(state.tellerSpeedBoostFactor) || state.tellerSpeedBoostFactor < 1) state.tellerSpeedBoostFactor = 1;
        if (!isNum(state.advBudget) || state.advBudget < 0) state.advBudget = 0;
        if (!isBool(state.advActive)) state.advActive = false;
        if (!isNum(state.queueUpgradeLevel) || state.queueUpgradeLevel < 1) state.queueUpgradeLevel = 1;
        if (!isNum(state.missionsCompleted) || state.missionsCompleted < 0) state.missionsCompleted = 0;
        if (!isNum(state.lastSaveTime)) state.lastSaveTime = Date.now();

        // goldUpgrades
        const goldUpgradeMaxLevels = {
            startingCash: 4,
            guardSpeed: 5,
            premiumYield: 5,
            shareEfficiency: 4,
            offlineEarnings: 5,
            tellerCapacityBoost: 5,
            vaultCapacityBoost: 5,
            eventBonus: 5,
            managerDiscount: 4
        };

        if (!state.goldUpgrades || typeof state.goldUpgrades !== 'object') {
            state.goldUpgrades = {
                startingCash: 0, guardSpeed: 0, premiumYield: 0, shareEfficiency: 0,
                offlineEarnings: 0, tellerCapacityBoost: 0, vaultCapacityBoost: 0,
                eventBonus: 0, managerDiscount: 0
            };
        } else {
            Object.keys(goldUpgradeMaxLevels).forEach(k => {
                if (!isNum(state.goldUpgrades[k]) || state.goldUpgrades[k] < 0) {
                    state.goldUpgrades[k] = 0;
                } else {
                    const max = goldUpgradeMaxLevels[k];
                    if (state.goldUpgrades[k] > max) {
                        state.goldUpgrades[k] = max; // CRIT-17: Cap levels to prevent exploit
                    }
                }
            });
        }

        // Backward compatibility migration from Rachel, Alan, Dan to 6 managers:
        if (state.managers && (state.managers.teller !== undefined || state.managers.guard !== undefined || state.managers.vault !== undefined)) {
            const oldT = state.managers.teller || false;
            const oldG = state.managers.guard !== undefined ? state.managers.guard : true;
            const oldV = state.managers.vault || false;
            
            const oldTUp = (state.managerUpgrades && state.managerUpgrades.teller) ? state.managerUpgrades.teller : { level: 1, skill: null };
            const oldGUp = (state.managerUpgrades && state.managerUpgrades.guard) ? state.managerUpgrades.guard : { level: 1, skill: null };
            const oldVUp = (state.managerUpgrades && state.managerUpgrades.vault) ? state.managerUpgrades.vault : { level: 1, skill: null };
            
            state.managers = {
                customer: oldT,
                finance: oldV,
                operations: oldG,
                service: false,
                vip: false,
                marketing: false
            };
            
            state.managerUpgrades = {
                customer: { level: oldTUp.level || 1, skill: null },
                finance: { level: oldVUp.level || 1, skill: null },
                operations: { level: oldGUp.level || 1, skill: null },
                service: { level: 1, skill: null },
                vip: { level: 1, skill: null },
                marketing: { level: 1, skill: null }
            };
        }

        const newMgrKeys = ['customer', 'finance', 'operations', 'service', 'vip', 'marketing', 'logistics', 'risk', 'tech', 'compliance'];

        // managers
        if (!state.managers || typeof state.managers !== 'object') {
            state.managers = {
                customer: false,
                finance: false,
                operations: true,
                service: false,
                vip: false,
                marketing: false,
                logistics: false,
                risk: false,
                tech: false,
                compliance: false
            };
        } else {
            newMgrKeys.forEach(k => {
                if (!isBool(state.managers[k])) {
                    state.managers[k] = (k === 'operations'); // Operations default true
                }
            });
        }

        // managerUpgrades
        if (!state.managerUpgrades || typeof state.managerUpgrades !== 'object') {
            state.managerUpgrades = {
                customer: { level: 1, skill: null },
                finance: { level: 1, skill: null },
                operations: { level: 1, skill: null },
                service: { level: 1, skill: null },
                vip: { level: 1, skill: null },
                marketing: { level: 1, skill: null },
                logistics: { level: 1, skill: null },
                risk: { level: 1, skill: null },
                tech: { level: 1, skill: null },
                compliance: { level: 1, skill: null }
            };
        } else {
            newMgrKeys.forEach(k => {
                if (!state.managerUpgrades[k] || typeof state.managerUpgrades[k] !== 'object') {
                    state.managerUpgrades[k] = { level: 1, skill: null };
                } else {
                    if (!isNum(state.managerUpgrades[k].level) || state.managerUpgrades[k].level < 1) state.managerUpgrades[k].level = 1;
                    state.managerUpgrades[k].skill = null; // Skill paths are obsolete
                }
            });
        }

        // vault
        if (!state.vault || typeof state.vault !== 'object') {
            state.vault = { level: 1, cashStored: 0 };
        } else {
            if (!isNum(state.vault.level) || state.vault.level < 1) state.vault.level = 1;
            if (!isNum(state.vault.cashStored) || state.vault.cashStored < 0) state.vault.cashStored = 0;
            else state.vault.cashStored = roundCents(state.vault.cashStored);
        }

        // tellers
        if (!Array.isArray(state.tellers)) {
            state.tellers = [
                { id: 0, unlocked: true, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false },
                { id: 1, unlocked: false, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false },
                { id: 2, unlocked: false, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false },
                { id: 3, unlocked: false, level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false }
            ];
        } else {
            state.tellers.forEach((t, i) => {
                if (!t || typeof t !== 'object') {
                    state.tellers[i] = { id: i, unlocked: (i === 0), level: 1, cashStored: 0, processingTimeLeft: 0, isProcessing: false };
                } else {
                    if (!isNum(t.id)) t.id = i;
                    if (!isBool(t.unlocked)) t.unlocked = (i === 0);
                    if (!isNum(t.level) || t.level < 1) t.level = 1;
                    if (!isNum(t.cashStored) || t.cashStored < 0) t.cashStored = 0;
                    else t.cashStored = roundCents(t.cashStored);
                    if (!isNum(t.processingTimeLeft) || t.processingTimeLeft < 0) t.processingTimeLeft = 0;
                    if (!isBool(t.isProcessing)) t.isProcessing = false;
                }
            });
        }

        // guards
        if (!Array.isArray(state.guards)) {
            state.guards = [
                { id: 0, unlocked: true, level: 1, loadedCash: 0, position: 0, state: 'idle', timer: 0 },
                { id: 1, unlocked: false, level: 1, loadedCash: 0, position: 0, state: 'idle', timer: 0 },
                { id: 2, unlocked: false, level: 1, loadedCash: 0, position: 0, state: 'idle', timer: 0 }
            ];
        } else {
            state.guards.forEach((g, i) => {
                if (!g || typeof g !== 'object') {
                    state.guards[i] = { id: i, unlocked: (i === 0), level: 1, loadedCash: 0, position: 0, state: 'idle', timer: 0 };
                } else {
                    if (!isNum(g.id)) g.id = i;
                    if (!isBool(g.unlocked)) g.unlocked = (i === 0);
                    if (!isNum(g.level) || g.level < 1) g.level = 1;
                    if (!isNum(g.loadedCash) || g.loadedCash < 0) g.loadedCash = 0;
                    else g.loadedCash = roundCents(g.loadedCash);
                    if (!isNum(g.position) || g.position < 0) g.position = 0;
                    if (!isString(g.state)) g.state = 'idle';
                    if (!isNum(g.timer) || g.timer < 0) g.timer = 0;
                }
            });
        }

        // departments
        const defaultDepartments = [
            { id: 0, name: 'שירותי קופה בסיסיים', unlocked: true, baseReward: 10, cost: 0 },
            { id: 1, name: 'מחלקת הלוואות ומשכנתאות', unlocked: false, baseReward: 60, cost: 3500 },
            { id: 2, name: 'VIP בנקאות פרטית', unlocked: false, baseReward: 450, cost: 80000 },
            { id: 3, name: 'מסחר במניות וקריפטו', unlocked: false, baseReward: 3500, cost: 1200000 },
            { id: 4, name: 'הלבנת הון "חוקית"', unlocked: false, baseReward: 30000, cost: 25000000 }
        ];
        if (!Array.isArray(state.departments) || state.departments.length === 0) {
            state.departments = defaultDepartments.map(d => Object.assign({}, d));
        } else {
            defaultDepartments.forEach((def) => {
                const match = state.departments.find(d => d && d.id === def.id);
                if (!match) {
                    state.departments.push(Object.assign({}, def));
                } else {
                    if (!isBool(match.unlocked)) match.unlocked = def.unlocked;
                    if (!isNum(match.baseReward)) match.baseReward = def.baseReward;
                    if (!isNum(match.cost)) match.cost = def.cost;
                    if (!isString(match.name)) match.name = def.name;
                }
            });
            state.departments = state.departments.filter(d => d && isNum(d.id)).sort((a, b) => a.id - b.id);
        }

        // stats
        if (!state.stats || typeof state.stats !== 'object') {
            state.stats = { clientsServed: 0, tellerUpgrades: 0, guardUpgrades: 0, vaultUpgrades: 0, vipServed: 0, cashSpent: 0 };
        } else {
            ['clientsServed', 'tellerUpgrades', 'guardUpgrades', 'vaultUpgrades', 'vipServed', 'cashSpent'].forEach(k => {
                if (!isNum(state.stats[k]) || state.stats[k] < 0) state.stats[k] = 0;
            });
        }

        // missions
        if (!Array.isArray(state.missions)) {
            state.missions = [];
        } else {
            state.missions.forEach((m, i) => {
                if (!m || typeof m !== 'object') {
                    state.missions[i] = null;
                } else {
                    if (!isString(m.id)) m.id = 'm_' + Math.random();
                    if (!isString(m.type)) m.type = 'clients';
                    
                    if (m.type === 'gold_shares' || m.type === 'accumulate_vault_cash') {
                        m.type = 'earn_cash';
                        m.startProgress = state.lifetimeCash || 0;
                        const eps = Math.max(10, (state.cash || 0) / 100);
                        m.target = Math.max(500, Math.round(eps * 180));
                        m.progress = 0;
                        m.completed = false;
                        m.claimed = false;
                    }

                    if (!isNum(m.target) || m.target <= 0 || isNaN(m.target)) m.target = 1;
                    if (!isNum(m.progress) || isNaN(m.progress)) m.progress = 0;
                    if (!isNum(m.reward) || isNaN(m.reward)) m.reward = 100;
                    if (!isBool(m.completed)) m.completed = false;
                    if (!isBool(m.claimed)) m.claimed = false;
                    if (m.type === 'clients' && (m.startProgress !== undefined && (!isNum(m.startProgress) || m.startProgress < 0 || m.startProgress > state.stats.clientsServed))) {
                        m.startProgress = undefined;
                    }
                }
            });
            state.missions = state.missions.filter(m => m !== null);
        }
    }

    loadGame() {
        const saved = window.localStorage.getItem('idle_bank_save');
        if (!saved) {
            this.game.checkMissions();
            // Start async server time query anyway
            this.initServerTime();
            return;
        }

        try {
            let parsed;
            if (saved.trim().startsWith('{')) {
                parsed = JSON.parse(saved);
            } else {
                let decryptedSaved;
                try {
                    const binary = atob(saved);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    decryptedSaved = new TextDecoder('utf-8').decode(bytes);
                } catch (e) {
                    console.error("UTF-8 decoding failed, falling back to raw binary string:", e);
                    decryptedSaved = atob(saved);
                }
                parsed = JSON.parse(decryptedSaved);
            }
            
            // CRIT-2: Verify checksum if it exists
            if (parsed && typeof parsed === 'object') {
                const savedChecksum = parsed.checksum;
                if (savedChecksum) {
                    delete parsed.checksum;
                    const jsonStr = JSON.stringify(parsed);
                    const computedChecksum = this.getChecksum(jsonStr);
                    if (computedChecksum !== savedChecksum) {
                        this.game.cheatWarning = true;
                        this.game.cheatDetected = true;
                        throw new Error("Checksum mismatch: save data has been modified or corrupted.");
                    }
                    parsed.checksum = savedChecksum;
                }
            }

            // Re-bind parsed data to state
            this.game.state = this.deepMerge(this.game.state, parsed);
            
            // Heal and validate state
            this.validateAndHealState(this.game.state);

            // Dynamically heal maxBranchUnlocked based on lifetimeCash and currentBranch
            let maxBranch = this.game.state.maxBranchUnlocked !== undefined ? this.game.state.maxBranchUnlocked : (this.game.state.currentBranch || 0);
            const lc = this.game.state.lifetimeCash || 0;
            if (lc >= 1000000000) maxBranch = Math.max(maxBranch, 3);
            else if (lc >= 50000000) maxBranch = Math.max(maxBranch, 2);
            else if (lc >= 1000000) maxBranch = Math.max(maxBranch, 1);
            this.game.state.maxBranchUnlocked = maxBranch;

            if (this.game.state.currentBranch < this.game.state.maxBranchUnlocked) {
                this.game.state.currentBranch = this.game.state.maxBranchUnlocked;
            }

            this.game.recalculateEps();
            this.game.ensureTellersCount();
            this.game.sanitizeQueueAndTellers();

            // Kick off async server time validation (this will run calculateOfflineEarnings inside it when done)
            this.initServerTime();

        } catch (e) {
            console.error("Failed to load saved game state, resetting.", e);
            // CRIT-3: Gracefully reset to default state on load failure to avoid broken states
            this.game.initDefaultState();
            this.initServerTime();
        }
    }

    calculateOfflineEarnings() {
        this.game.offlineEarningsReport = 0;
        
        // Anti-Cheat: calculate delta using verified server time if available
        const now = this.isServerTimeVerified ? (Date.now() + this.serverTimeOffset) : Date.now();
        const lastSaveTime = this.game.state.lastSaveTime;
        
        const timePassedMs = now - lastSaveTime;
        if (timePassedMs < -60000) {
            this.game.cheatWarning = true;
            this.game.cheatDetected = true;
        }
        if (timePassedMs <= 0 || isNaN(timePassedMs)) return;
        const timePassedSec = Math.floor(timePassedMs / 1000);
        
        if (timePassedSec < 15) return;

        let offlineCashEarned = 0;
        let limitHours = 8;
        if (this.game.state.managers && this.game.state.managers.marketing && this.game.state.managerUpgrades.marketing) {
            limitHours += (GAME_CONFIG.MANAGER_COEFFICIENTS.marketing.offlineLimitBoost * this.game.state.managerUpgrades.marketing.level); // +1 hour per level
        }
        const techMgr = this.game.state.managers && this.game.state.managers.tech && this.game.state.managerUpgrades && this.game.state.managerUpgrades.tech;
        const techLvl = techMgr ? (this.game.state.managerUpgrades.tech.level || 1) : 0;
        const techOfflineBonus = this.game.state.managers && this.game.state.managers.tech ? (GAME_CONFIG.MANAGER_COEFFICIENTS.tech.offlineLimitBoost * techLvl) : 0;
        limitHours += techOfflineBonus;
        if (this.game.state.goldUpgrades && this.game.state.goldUpgrades.offlineEarnings) {
            limitHours += (this.game.state.goldUpgrades.offlineEarnings * 2); // +2 hours per level
        }
        
        let maxAllowedSec = limitHours * 3600;
        
        // Anti-Cheat Time-Travel prevention: limit offline earnings to 1 hour max if clock is unverified
        if (!this.isServerTimeVerified) {
            maxAllowedSec = Math.min(maxAllowedSec, 3600); // Capped at 1 hour max
            console.warn("Offline earnings calculated using unverified local clock, capped at 1 hour max.");
        }

        const elapsedSec = Math.min(timePassedSec, maxAllowedSec);

        if (this.game.state.managers && this.game.state.managers.operations && this.game.state.managers.finance) {
            // Full automation
            let boostTimeActiveOffline = 0;
            if (this.game.state.boost2xTimeLeft > 0) {
                boostTimeActiveOffline = Math.min(elapsedSec, this.game.state.boost2xTimeLeft);
                this.game.state.boost2xTimeLeft = Math.max(0, this.game.state.boost2xTimeLeft - elapsedSec);
            }

            const eps = this.game.getEarningsPerSecond();
            // CRIT-18: Prevent 2x boost double-counting and post-boost 2x earnings exploit
            const baseEps = boostTimeActiveOffline > 0 ? (eps / 2.0) : eps;
            const normalTime = elapsedSec - boostTimeActiveOffline;
            offlineCashEarned = (baseEps * boostTimeActiveOffline * 2.0) + (baseEps * normalTime);
            
            this.game.state.cash = roundCents(this.game.state.cash + offlineCashEarned);
            this.game.state.lifetimeCash = roundCents(this.game.state.lifetimeCash + offlineCashEarned);
            this.game.offlineEarningsReport = roundCents(offlineCashEarned);
        } 
        else if (this.game.state.managers && this.game.state.managers.operations) {
            // Vault accumulates up to capacity
            const vaultCapacity = this.game.economyManager.getVaultCapacity(this.game.state.vault.level);
            const vaultSpaceLeft = Math.max(0, vaultCapacity - this.game.state.vault.cashStored);
            
            let boostTimeActiveOffline = 0;
            if (this.game.state.boost2xTimeLeft > 0) {
                boostTimeActiveOffline = Math.min(elapsedSec, this.game.state.boost2xTimeLeft);
                this.game.state.boost2xTimeLeft = Math.max(0, this.game.state.boost2xTimeLeft - elapsedSec);
            }
            
            const eps = this.game.getEarningsPerSecond();
            // CRIT-18: Correctly apply 2x boost multiplier to vault offline earnings
            const baseEps = boostTimeActiveOffline > 0 ? (eps / 2.0) : eps;
            const normalTime = elapsedSec - boostTimeActiveOffline;
            const potentialOfflineCash = (baseEps * boostTimeActiveOffline * 2.0) + (baseEps * normalTime);
            
            offlineCashEarned = Math.min(vaultSpaceLeft, potentialOfflineCash);
            this.game.state.vault.cashStored = roundCents(this.game.state.vault.cashStored + offlineCashEarned);
            
            this.game.offlineEarningsReport = roundCents(offlineCashEarned);
        } 
        else {
            // Tellers process up to capacity
            let totalAdded = 0;
            let boostTimeActiveOffline = 0;
            if (this.game.state.boost2xTimeLeft > 0) {
                boostTimeActiveOffline = Math.min(elapsedSec, this.game.state.boost2xTimeLeft);
                this.game.state.boost2xTimeLeft = Math.max(0, this.game.state.boost2xTimeLeft - elapsedSec);
            }
            
            this.game.state.tellers.forEach(t => {
                if (t.unlocked) {
                    const capacity = this.game.economyManager.getTellerCapacity(t.level);
                    const spaceLeft = Math.max(0, capacity - t.cashStored);
                    const speed = this.game.economyManager.getTellerSpeed(t.level);
                    
                    const totalMult = this.game.economyManager.getTotalMultiplier();
                    const isBoosted = boostTimeActiveOffline > 0;
                    const baseMult = isBoosted ? (totalMult / 2.0) : totalMult;
                    
                    const baseReward = this.game.economyManager.getCurrentBaseReward() * baseMult;
                    const boostedReward = baseReward * 2.0;
                    
                    const clientsProcessedBoost = Math.floor(boostTimeActiveOffline / speed);
                    const clientsProcessedNormal = Math.floor((elapsedSec - boostTimeActiveOffline) / speed);
                    
                    const added = Math.min(spaceLeft, (clientsProcessedBoost * boostedReward) + (clientsProcessedNormal * baseReward));
                    t.cashStored = roundCents(t.cashStored + added);
                    totalAdded += added;
                }
            });
            this.game.offlineEarningsReport = roundCents(totalAdded);
        }
        
        // Sync last save time to now to prevent double-claiming
        this.game.state.lastSaveTime = now;
    }
}

window.SaveManager = SaveManager;
