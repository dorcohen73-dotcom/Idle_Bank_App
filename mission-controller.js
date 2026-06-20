class MissionController {
    constructor(game) {
        this.game = game;
    }

    generateMission() {
        const branchIndex = this.game.state.currentBranch || 0;
        const scale = Math.pow(6, branchIndex); // Scale up targets/rewards by branch multiplier
        
        const tellerLvl = this.game.state.tellers[0] ? this.game.state.tellers[0].level : 1;
        const guardLvl = this.game.state.guards[0] ? this.game.state.guards[0].level : 1;
        const vaultLvl = this.game.state.vault ? this.game.state.vault.level : 1;
        const referenceCash = Math.max(this.game.state.cash, this.game.getEarningsPerSecond() * 60, 150);

        const pool = [
            {
                type: 'clients',
                target: () => {
                    const base = 50 + Math.floor(Math.random() * 51);
                    const branchMult = Math.pow(2.2, branchIndex);
                    const epsFactor = Math.max(1, Math.floor(Math.log10(Math.max(1, this.game.getEarningsPerSecond()))));
                    return Math.round(base * branchMult * (1 + 0.5 * epsFactor));
                },
                reward: (t) => Math.round(t * 15 * scale + referenceCash * 0.20)
            },
            {
                type: 'upgrade_teller',
                target: (targetId) => {
                    const tId = targetId !== undefined ? targetId : 0;
                    const teller = this.game.state.tellers[tId] || { level: 1 };
                    return teller.level + 2 + Math.floor(Math.random() * 5);
                },
                reward: (t) => Math.round(t * 300 * scale + referenceCash * 0.25)
            },
            {
                type: 'upgrade_guard',
                target: (targetId) => {
                    const gId = targetId !== undefined ? targetId : 0;
                    const guard = this.game.state.guards[gId] || { level: 1 };
                    return guard.level + 2 + Math.floor(Math.random() * 4);
                },
                reward: (t) => Math.round(t * 350 * scale + referenceCash * 0.25)
            },
            {
                type: 'upgrade_vault',
                target: () => {
                    const currentLvl = this.game.state.vault ? this.game.state.vault.level : 1;
                    return currentLvl + 1 + Math.floor(Math.random() * 3);
                },
                reward: (t) => Math.round(t * 400 * scale + referenceCash * 0.25)
            }
        ];

        // Unlock Departments (Only if not all 5 departments are unlocked)
        const unlockedDeptsCount = (this.game.state.departments || []).filter(d => d && d.unlocked).length;
        if (unlockedDeptsCount < 5) {
            pool.push({
                type: 'unlock_departments',
                target: () => Math.min(5, unlockedDeptsCount + 1),
                reward: (t) => Math.round(1500 * scale + referenceCash * 0.30)
            });
        }

        // Hire Managers (Only if not all 10 managers are hired)
        const hiredMgrsCount = this.game.state.managers ? Object.values(this.game.state.managers).filter(v => v === true).length : 0;
        if (hiredMgrsCount < 10) {
            pool.push({
                type: 'hire_managers',
                target: () => Math.min(10, hiredMgrsCount + 1),
                reward: (t) => Math.round(1000 * scale + referenceCash * 0.25)
            });
        }

        // Target Earnings per Second (EPS)
        pool.push({
            type: 'earn_eps',
            target: () => {
                const currentEps = Math.max(this.game.getEarningsPerSecond(), 10);
                return Math.round(currentEps * 1.5 + 50 * scale);
            },
            reward: (t) => Math.round(t * 10 + referenceCash * 0.30)
        });

        // Earn Cash (Accumulating cash over time)
        pool.push({
            type: 'earn_cash',
            target: () => {
                const eps = Math.max(this.game.getEarningsPerSecond(), 10);
                const durationSeconds = 180 + Math.floor(Math.random() * 241); // 3 to 7 minutes of earnings
                return Math.max(500, Math.round(eps * durationSeconds));
            },
            reward: (t) => Math.round(referenceCash * 0.30 + t * 0.15)
        });

        // Serve VIP / Rich clients
        pool.push({
            type: 'serve_rich_vip',
            target: () => {
                const base = 5 + Math.floor(Math.random() * 6);
                const branchMult = Math.pow(2.0, branchIndex);
                const epsFactor = Math.max(1, Math.floor(Math.log10(Math.max(1, this.game.getEarningsPerSecond()))));
                return Math.round(base * branchMult * (1 + 0.4 * epsFactor));
            },
            reward: (t) => Math.round(t * 80 * scale + referenceCash * 0.25)
        });

        // Spend Cash on upgrades
        pool.push({
            type: 'spend_cash',
            target: () => {
                const eps = Math.max(this.game.getEarningsPerSecond(), 10);
                const durationSeconds = 180 + Math.floor(Math.random() * 301); // 3 to 8 minutes of earnings
                return Math.max(500, Math.round(eps * durationSeconds));
            },
            reward: (t) => Math.round(referenceCash * 0.30 + t * 0.15)
        });

        // Upgrade managers (only if total level is under 30)
        const currentTotalManagerLevels = this.game.state.managerUpgrades ? Object.values(this.game.state.managerUpgrades).reduce((sum, m) => sum + ((m && m.level) || 1), 0) : 0;
        if (currentTotalManagerLevels < 30) {
            pool.push({
                type: 'upgrade_managers',
                target: () => Math.min(30 - currentTotalManagerLevels, 2 + Math.floor(Math.random() * 4)),
                reward: (t) => Math.round(t * 30000 * scale + referenceCash * 0.25)
            });
        }

        // Pick random mission template ensuring no duplicate active types
        const activeTypes = (this.game.state.missions || []).map(m => m.type);
        let availablePool = pool.filter(t => !activeTypes.includes(t.type));
        if (availablePool.length === 0) {
            availablePool = pool;
        }
        const template = availablePool[Math.floor(Math.random() * availablePool.length)];

        let targetId = undefined;
        if (template.type === 'upgrade_teller') {
            const unlockedTellers = (this.game.state.tellers || []).filter(t => t && t.unlocked);
            const lowestTeller = unlockedTellers.reduce((min, t) => t.level < min.level ? t : min, unlockedTellers[0] || { id: 0 });
            targetId = lowestTeller.id;
        } else if (template.type === 'upgrade_guard') {
            const unlockedGuards = (this.game.state.guards || []).filter(g => g && g.unlocked);
            const lowestGuard = unlockedGuards.reduce((min, g) => g.level < min.level ? g : min, unlockedGuards[0] || { id: 0 });
            targetId = lowestGuard.id;
        }

        const targetVal = template.target(targetId);
        const rewardVal = template.reward(targetVal);

        this.game.missionCounter++;
        return {
            id: 'm_' + this.game.missionCounter + '_' + Math.floor(Math.random() * 10000),
            type: template.type,
            target: targetVal,
            targetId: targetId,
            progress: 0,
            reward: rewardVal,
            completed: false,
            claimed: false
        };
    }

    checkMissions() {
        // Ensure we always have 5 active missions
        while (this.game.state.missions.length < 5) {
            this.game.state.missions.push(this.generateMission());
        }

        this.game.state.missions.forEach(m => {
            if (m.completed) return;

            // Healing check to prevent freezes or NaN loops
            if (isNaN(m.target) || !isFinite(m.target) || m.target <= 0) {
                m.target = 1; 
            }

            let currentProgress = 0;
            switch (m.type) {
                case 'clients':
                    if (m.startProgress === undefined) {
                        m.startProgress = this.game.state.stats.clientsServed;
                    }
                    currentProgress = this.game.state.stats.clientsServed - m.startProgress;
                    break;
                case 'accumulate_cash':
                    currentProgress = this.game.state.cash;
                    break;
                case 'upgrade_teller': {
                    const tId = m.targetId !== undefined ? m.targetId : 0;
                    const teller = this.game.state.tellers[tId] || this.game.state.tellers[0] || { level: 1 };
                    currentProgress = teller.level;
                    break;
                }
                case 'upgrade_guard': {
                    const gId = m.targetId !== undefined ? m.targetId : 0;
                    const guard = this.game.state.guards[gId] || this.game.state.guards[0] || { level: 1 };
                    currentProgress = guard.level;
                    break;
                }
                case 'upgrade_vault':
                    currentProgress = this.game.state.vault ? this.game.state.vault.level : 1;
                    break;
                case 'unlock_departments':
                    currentProgress = this.game.state.departments.filter(d => d.unlocked).length;
                    break;
                case 'hire_managers':
                    currentProgress = Object.values(this.game.state.managers).filter(v => v === true).length;
                    break;
                case 'earn_eps':
                    currentProgress = this.game.getEarningsPerSecond();
                    break;
                case 'earn_cash':
                    if (m.startProgress === undefined) {
                        m.startProgress = this.game.state.lifetimeCash || 0;
                    }
                    currentProgress = (this.game.state.lifetimeCash || 0) - m.startProgress;
                    break;
                case 'serve_rich_vip':
                    if (m.startProgress === undefined) {
                        m.startProgress = this.game.state.stats.vipServed || 0;
                    }
                    currentProgress = (this.game.state.stats.vipServed || 0) - m.startProgress;
                    break;
                case 'spend_cash': {
                    const totalSpent = this.game.state.stats.cashSpent || 0;
                    if (m.startProgress === undefined) {
                        m.startProgress = totalSpent;
                    }
                    currentProgress = totalSpent - m.startProgress;
                    break;
                }
                case 'upgrade_managers': {
                    const currentLevels = Object.values(this.game.state.managerUpgrades).reduce((sum, m) => sum + (m.level || 1), 0);
                    if (m.startProgress === undefined) {
                        m.startProgress = currentLevels;
                    }
                    currentProgress = currentLevels - m.startProgress;
                    break;
                }
            }

            m.progress = Math.min(m.target, currentProgress);
            
            if (isNaN(m.progress) || !isFinite(m.progress)) {
                m.progress = 0;
            }

            if (m.progress >= m.target) {
                m.progress = m.target;
                m.completed = true;
            }
        });
    }

    claimMissionReward(id) {
        const mIndex = this.game.state.missions.findIndex(m => m.id === id);
        if (mIndex === -1) return 0;

        const m = this.game.state.missions[mIndex];
        if (!m.completed || m.claimed) return 0;

        m.claimed = true;
        const rewardAmt = m.reward;

        this.game.state.cash = Math.round((this.game.state.cash + rewardAmt + Number.EPSILON) * 100) / 100;
        this.game.state.lifetimeCash = Math.round((this.game.state.lifetimeCash + rewardAmt + Number.EPSILON) * 100) / 100;
        this.game.state.missionsCompleted++;

        // Remove and replace with a fresh mission
        this.game.state.missions.splice(mIndex, 1);
        this.game.state.missions.push(this.generateMission());

        this.game.missionsDirty = true;
        this.game.saveGame();
        return rewardAmt;
    }
}

window.MissionController = MissionController;

class DailyChallengeController {
    constructor(game) {
        this.game = game;
    }

    _generate3Challenges() {
        const branchIndex = this.game.state.currentBranch || 0;
        const eps = Math.max(this.game.getEarningsPerSecond(), 10);

        const pool = [
            {
                type: 'daily_earn_cash',
                target: Math.round(eps * 3600 * 4),
                reward: { type: 'gold', amount: 1 }
            },
            {
                type: 'daily_clients',
                target: Math.round(500 * Math.pow(2, branchIndex)),
                reward: { type: 'gold', amount: 1 }
            },
            {
                type: 'daily_spend',
                target: Math.round(eps * 1800 * 3),
                reward: { type: 'shares', amount: 1 }
            },
            {
                type: 'daily_vip',
                target: Math.max(10, Math.round(20 * Math.pow(1.8, branchIndex))),
                reward: { type: 'gold', amount: 2 }
            },
            {
                type: 'daily_eps',
                target: Math.round(eps * 6),
                reward: { type: 'shares', amount: 2 }
            }
        ];

        // ערבוב ובחירת 3 שונות
        const shuffled = pool.slice().sort(() => Math.random() - 0.5);
        const chosen = shuffled.slice(0, 3);

        return chosen.map(c => ({
            type: c.type,
            target: Math.max(1, c.target),
            reward: c.reward,
            progress: 0,
            startProgress: this._getStartProgress(c.type),
            completed: false,
            claimed: false
        }));
    }

    _getStartProgress(type) {
        const s = this.game.state;
        switch (type) {
            case 'daily_earn_cash': return s.lifetimeCash || 0;
            case 'daily_clients':   return (s.stats && s.stats.clientsServed) || 0;
            case 'daily_spend':     return (s.stats && s.stats.cashSpent) || 0;
            case 'daily_vip':       return s.vipServedTotal || (s.stats && s.stats.vipServed) || 0;
            case 'daily_eps':       return 0; // EPS נוכחי, לא delta
            default: return 0;
        }
    }

    checkAndReset() {
        const now = Date.now();
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        if (!this.game.state.lastDailyReset || this.game.state.lastDailyReset < todayMidnight.getTime()) {
            this.game.state.dailyChallenges = this._generate3Challenges();
            this.game.state.lastDailyReset = now;
        }

        // עדכון progress
        this.game.state.dailyChallenges.forEach(c => {
            if (c.completed) return;

            let currentProgress = 0;
            const s = this.game.state;

            switch (c.type) {
                case 'daily_earn_cash':
                    currentProgress = (s.lifetimeCash || 0) - (c.startProgress || 0);
                    break;
                case 'daily_clients':
                    currentProgress = ((s.stats && s.stats.clientsServed) || 0) - (c.startProgress || 0);
                    break;
                case 'daily_spend':
                    currentProgress = ((s.stats && s.stats.cashSpent) || 0) - (c.startProgress || 0);
                    break;
                case 'daily_vip':
                    currentProgress = (s.vipServedTotal || (s.stats && s.stats.vipServed) || 0) - (c.startProgress || 0);
                    break;
                case 'daily_eps':
                    currentProgress = this.game.getEarningsPerSecond();
                    break;
            }

            c.progress = Math.max(0, Math.min(c.target, currentProgress));
            if (isNaN(c.progress)) c.progress = 0;
            if (c.progress >= c.target) {
                c.progress = c.target;
                c.completed = true;
            }
        });
    }

    claimReward(index) {
        const c = this.game.state.dailyChallenges[index];
        if (!c || !c.completed || c.claimed) return false;
        c.claimed = true;

        if (c.reward.type === 'gold') {
            this.game.state.shares = (this.game.state.shares || 0) + c.reward.amount;
        } else if (c.reward.type === 'shares') {
            this.game.state.shares = (this.game.state.shares || 0) + c.reward.amount;
        }

        this.game.saveGame();
        return true;
    }
}

window.DailyChallengeController = DailyChallengeController;