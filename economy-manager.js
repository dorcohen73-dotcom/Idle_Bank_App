class EconomyManager {
    constructor(game) {
        this.game = game;
    }

    getPrestigeMultiplier() {
        const goldUpgrades = this.game.state.goldUpgrades || {};
        const shareEfficiency = goldUpgrades.shareEfficiency || 0;
        const shares = this.game.state.shares || 0;
        const shareVal = 0.05 + shareEfficiency * 0.01;
        return 1 + (shares * shareVal);
    }

    getBranchMultiplier() {
        const branchIndex = this.game.state.currentBranch || 0;
        const branch = GAME_CONFIG.BRANCHES[branchIndex] || GAME_CONFIG.BRANCHES[0];
        return branch.baseMultiplier;
    }

    getMaxTellers() {
        const branchIndex = this.game.state.currentBranch || 0;
        return 4 + branchIndex;
    }

    getTotalMultiplier() {
        let mult = this.getBranchMultiplier() * this.getPrestigeMultiplier();
        
        // Add premiumYield gold upgrade boost (+10% per level)
        if (this.game.state.goldUpgrades && this.game.state.goldUpgrades.premiumYield) {
            mult *= (1 + this.game.state.goldUpgrades.premiumYield * 0.10);
        }
        
        // Add 2x Income Boost!
        if (this.game.state.boost2xTimeLeft && this.game.state.boost2xTimeLeft > 0) {
            mult *= 2.0;
        }

        // Manager Yield Boosts
        if (this.game.state.managers && this.game.state.managerUpgrades) {
            if (this.game.state.managers.customer && this.game.state.managerUpgrades.customer) {
                mult *= (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.customer.incomeBoost * this.game.state.managerUpgrades.customer.level);
            }
            if (this.game.state.managers.finance && this.game.state.managerUpgrades.finance) {
                mult *= (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.finance.incomeBoost * this.game.state.managerUpgrades.finance.level);
            }
            if (this.game.state.managers.service && this.game.state.managerUpgrades.service) {
                mult *= (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.service.incomeBoost * this.game.state.managerUpgrades.service.level);
            }
            if (this.game.state.managers.vip && this.game.state.managerUpgrades.vip) {
                mult *= (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.vip.incomeBoost * this.game.state.managerUpgrades.vip.level);
            }
        }
        return mult;
    }

    // Tellers Formulas
    getTellerSpeed(level) {
        const baseSpeed = Math.max(GAME_CONFIG.TELLER_MIN_SPEED, GAME_CONFIG.TELLER_BASE_SPEED * Math.pow(GAME_CONFIG.TELLER_SPEED_DECAY, level - 1));
        let speedFactor = 1.0;
        
        if (this.game.state.managers && this.game.state.managers.operations && this.game.state.managerUpgrades && this.game.state.managerUpgrades.operations) {
            const opsLvl = this.game.state.managerUpgrades.operations.level;
            speedFactor *= Math.max(0.10, 1 - (opsLvl - 1) * GAME_CONFIG.TELLER_SKILL_SPEED_DECAY); // -3% processing duration per level starting from lvl 1
        }
        
        let finalSpeed = baseSpeed * speedFactor;

        if (this.game.state.tellerSpeedBoostTimer && this.game.state.tellerSpeedBoostTimer > 0) {
            const boostFactor = this.game.state.tellerSpeedBoostFactor || 1;
            finalSpeed = finalSpeed / boostFactor;
        }
        
        return Math.max(GAME_CONFIG.TELLER_ABSOLUTE_MIN_SPEED, finalSpeed);
    }

    getTellerCapacity(level) {
        let cap = Math.round(GAME_CONFIG.TELLER_BASE_CAPACITY * Math.pow(GAME_CONFIG.TELLER_CAPACITY_GROWTH, level - 1));
        
        if (this.game.state.managers && this.game.state.managers.service && this.game.state.managerUpgrades && this.game.state.managerUpgrades.service) {
            const svcLvl = this.game.state.managerUpgrades.service.level;
            cap = Math.round(cap * (1 + GAME_CONFIG.MANAGER_COEFFICIENTS.service.capacityBoost * svcLvl)); // +5% desk capacity per level
        }
        
        if (this.game.state.goldUpgrades && this.game.state.goldUpgrades.tellerCapacityBoost) {
            cap = Math.round(cap * (1 + 0.10 * this.game.state.goldUpgrades.tellerCapacityBoost)); // +10% per level
        }
        
        return cap;
    }

    getTellerUpgradeCost(level) {
        return Math.round(GAME_CONFIG.TELLER_BASE_UPGRADE_COST * Math.pow(GAME_CONFIG.TELLER_UPGRADE_COST_GROWTH, level - 1));
    }

    // Guards Formulas
    getGuardSpeed(level) {
        const baseSpeed = Math.max(GAME_CONFIG.GUARD_MIN_SPEED, GAME_CONFIG.GUARD_BASE_SPEED * Math.pow(GAME_CONFIG.GUARD_SPEED_DECAY, level - 1));
        let speedFactor = 1.0;
        
        if (this.game.state.managers && this.game.state.managers.operations && this.game.state.managerUpgrades && this.game.state.managerUpgrades.operations) {
            const opsLvl = this.game.state.managerUpgrades.operations.level;
            speedFactor *= Math.max(0.10, 1 - (opsLvl - 1) * GAME_CONFIG.GUARD_SKILL_SPEED_DECAY); // -4% transit time per level starting from lvl 1
        }
        
        // Guard speed gold upgrade: -10% per level
        if (this.game.state.goldUpgrades && this.game.state.goldUpgrades.guardSpeed) {
            speedFactor *= Math.max(0.10, 1 - this.game.state.goldUpgrades.guardSpeed * GAME_CONFIG.GUARD_SPEED_GOLD_UPGRADE_FACTOR);
        }
        
        return Math.max(GAME_CONFIG.GUARD_ABSOLUTE_MIN_SPEED, baseSpeed * speedFactor);
    }

    getGuardCapacity(level) {
        const baseCap = Math.round(GAME_CONFIG.GUARD_BASE_CAPACITY * Math.pow(GAME_CONFIG.GUARD_CAPACITY_GROWTH, level - 1));
        let cap = (this.game.state.managers && this.game.state.managers.operations) ? Math.round(baseCap * GAME_CONFIG.GUARD_AUTO_CAPACITY_FACTOR) : baseCap;
        return cap;
    }

    getGuardUpgradeCost(level) {
        return Math.round(GAME_CONFIG.GUARD_BASE_UPGRADE_COST * Math.pow(GAME_CONFIG.GUARD_UPGRADE_COST_GROWTH, level - 1));
    }

    // Vault Formulas
    getVaultCapacity(level) {
        let cap = Math.round(GAME_CONFIG.VAULT_BASE_CAPACITY * Math.pow(GAME_CONFIG.VAULT_CAPACITY_GROWTH, level - 1));
        
        if (this.game.state.goldUpgrades && this.game.state.goldUpgrades.vaultCapacityBoost) {
            cap = Math.round(cap * (1 + 0.10 * this.game.state.goldUpgrades.vaultCapacityBoost)); // +10% per level
        }
        
        return cap;
    }

    getVaultUpgradeCost(level) {
        return Math.round(GAME_CONFIG.VAULT_BASE_UPGRADE_COST * Math.pow(GAME_CONFIG.VAULT_UPGRADE_COST_GROWTH, level - 1));
    }

    // Queue Lobby Formulas
    getQueueCapacity(level) {
        const branchBonus = (this.game.state.currentBranch || 0) * GAME_CONFIG.QUEUE_BRANCH_BONUS_FACTOR;
        const base = GAME_CONFIG.QUEUE_BASE_CAPACITY + (level - 1) * GAME_CONFIG.QUEUE_CAPACITY_STEP + branchBonus;
        return base + (this.game.tempQueueBonus || 0);
    }

    getQueueUpgradeCost(level) {
        return Math.round(GAME_CONFIG.QUEUE_BASE_UPGRADE_COST * Math.pow(GAME_CONFIG.QUEUE_UPGRADE_COST_GROWTH, level - 1));
    }

    getCumulativeUpgradeCost(type, startLevel, targetLevel) {
        let total = 0;
        for (let lvl = startLevel; lvl < targetLevel; lvl++) {
            if (type === 'teller') {
                total += this.getTellerUpgradeCost(lvl);
            } else if (type === 'guard') {
                total += this.getGuardUpgradeCost(lvl);
            } else if (type === 'vault') {
                total += this.getVaultUpgradeCost(lvl);
            } else if (type === 'queue') {
                total += this.getQueueUpgradeCost(lvl);
            }
        }
        return total;
    }

    getUpgradeCost(type, id, level) {
        if (type === 'teller') return this.getTellerUpgradeCost(level);
        if (type === 'guard') return this.getGuardUpgradeCost(level);
        if (type === 'vault') return this.getVaultUpgradeCost(level);
        if (type === 'queue') return this.getQueueUpgradeCost(level);
        if (type === 'manager') {
            const costs = GAME_CONFIG.MANAGER_UPGRADE_COSTS[id] || GAME_CONFIG.MANAGER_UPGRADE_COSTS_DEFAULT;
            let cost = costs[level] || 0;
            if (this.game.state.goldUpgrades && this.game.state.goldUpgrades.managerDiscount) {
                cost = Math.round(cost * (1 - 0.05 * this.game.state.goldUpgrades.managerDiscount)); // -5% per level
            }
            return cost;
        }
        return 0;
    }

    getBulkUpgradeDetails(type, id, mode, currentLevel, cash) {
        const startLevel = currentLevel;
        let maxLvl = 999;
        if (type === 'queue') maxLvl = 4;
        if (type === 'manager') maxLvl = 5;

        let levels = 0;
        let totalCost = 0;
        let nextLvl = startLevel;

        if (mode === 'x1') {
            if (nextLvl < maxLvl) {
                levels = 1;
                totalCost = this.getUpgradeCost(type, id, startLevel);
            }
        } else if (mode === 'x10') {
            const target = Math.min(startLevel + 10, maxLvl);
            levels = Math.max(0, target - startLevel);
            for (let lvl = startLevel; lvl < target; lvl++) {
                totalCost += this.getUpgradeCost(type, id, lvl);
            }
        } else if (mode === 'max') {
            while (nextLvl < maxLvl) {
                const cost = this.getUpgradeCost(type, id, nextLvl);
                if (totalCost + cost <= cash) {
                    totalCost += cost;
                    levels++;
                    nextLvl++;
                } else {
                    break;
                }
            }
            if (levels === 0) {
                if (startLevel < maxLvl) {
                    return {
                        levels: 1,
                        cost: this.getUpgradeCost(type, id, startLevel),
                        canAfford: false
                    };
                }
            }
        }

        const canAfford = (totalCost > 0) && (cash >= totalCost);
        return {
            levels,
            cost: totalCost,
            canAfford
        };
    }

    getCurrentBaseReward() {
        let maxVal = 0;
        this.game.state.departments.forEach(d => {
            if (d.unlocked && d.baseReward > maxVal) {
                maxVal = d.baseReward;
            }
        });
        return maxVal;
    }

    getDepartmentReward(id) {
        const d = this.game.state.departments.find(dept => dept.id === id);
        if (!d) return 0;
        return d.baseReward * this.getTotalMultiplier();
    }

    getEarningsPerSecond() {
        return this.game.cachedEps;
    }

    recalculateEps() {
        let totalVal = 0;
        const baseRewardWithMultiplier = this.getCurrentBaseReward() * this.getTotalMultiplier();
        this.game.state.tellers.forEach(t => {
            if (t.unlocked) {
                const speed = this.getTellerSpeed(t.level);
                totalVal += (baseRewardWithMultiplier / speed);
            }
        });
        this.game.cachedEps = Math.round(totalVal);
    }
}

window.EconomyManager = EconomyManager;
