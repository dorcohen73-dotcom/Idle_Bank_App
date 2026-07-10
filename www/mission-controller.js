class MissionController {
    constructor(game) {
        this.game = game;
    }

    generateMission() {
        const branchIndex = this.game.state.currentBranch || 0;
        const scale = Math.pow(6, branchIndex); // Used strictly for targets now, not cash rewards
        
        // --- REWARD DIMINISHING RETURNS ---
        // As the player progresses through branches or completes many missions, rewards become less effective.
        // Base is 300 seconds (5 minutes) of EPS.
        // Branch 0: 300s. Branch 1: 240s. Branch 3: 150s. Branch 5+: 60s.
        const diminishingFactor = Math.max(0.2, 1 - (branchIndex * 0.15));
        const currentEps = Math.max(this.game.getEarningsPerSecond(), 1);
        const referenceReward = Math.max(currentEps * 300 * diminishingFactor, 150);

        const pool = [
            {
                type: 'clients',
                target: () => {
                    const base = 50 + Math.floor(Math.random() * 51);
                    const branchMult = Math.pow(2.2, branchIndex);
                    const epsFactor = Math.max(1, Math.floor(Math.log10(Math.max(1, this.game.getEarningsPerSecond()))));
                    return Math.round(base * branchMult * (1 + 0.5 * epsFactor));
                },
                reward: (t) => Math.round(referenceReward * 1.0)
            },
            {
                type: 'upgrade_teller',
                target: (targetId) => {
                    const tId = targetId !== undefined ? targetId : 0;
                    const teller = this.game.state.tellers[tId] || { level: 1 };
                    return teller.level + 2 + Math.floor(Math.random() * 5);
                },
                reward: (t) => Math.round(referenceReward * 1.2)
            },
            {
                type: 'upgrade_guard',
                target: (targetId) => {
                    const gId = targetId !== undefined ? targetId : 0;
                    const guard = this.game.state.guards[gId] || { level: 1 };
                    return guard.level + 2 + Math.floor(Math.random() * 4);
                },
                reward: (t) => Math.round(referenceReward * 1.2)
            },
            {
                type: 'upgrade_vault',
                target: () => {
                    const currentLvl = this.game.state.vault ? this.game.state.vault.level : 1;
                    return currentLvl + 1 + Math.floor(Math.random() * 3);
                },
                reward: (t) => Math.round(referenceReward * 1.25)
            }
        ];

        // Unlock Departments (Only if not all 5 departments are unlocked)
        const unlockedDeptsCount = (this.game.state.departments || []).filter(d => d && d.unlocked).length;
        if (unlockedDeptsCount < 5) {
            pool.push({
                type: 'unlock_departments',
                target: () => Math.min(5, unlockedDeptsCount + 1),
                reward: (t) => Math.round(referenceReward * 2.5)
            });
        }

        // Hire Managers (Only if not all 7 managers are hired)
        const hiredMgrsCount = this.game.state.managers ? Object.values(this.game.state.managers).filter(v => v === true).length : 0;
        if (hiredMgrsCount < 7) {
            pool.push({
                type: 'hire_managers',
                target: () => Math.min(7, hiredMgrsCount + 1),
                reward: (t) => Math.round(referenceReward * 1.5)
            });
        }

        // Target Earnings per Second (EPS)
        pool.push({
            type: 'earn_eps',
            target: () => {
                const currentEps = Math.max(this.game.getEarningsPerSecond(), 10);
                return Math.round(currentEps * 1.5 + 50 * scale);
            },
            reward: (t) => Math.round(referenceReward * 1.5)
        });

        // Earn Cash (Accumulating cash over time)
        pool.push({
            type: 'earn_cash',
            target: () => {
                const eps = Math.max(this.game.getEarningsPerSecond(), 10);
                const durationSeconds = 180 + Math.floor(Math.random() * 241); // 3 to 7 minutes of earnings
                return Math.max(500, Math.round(eps * durationSeconds));
            },
            // Reward is directly related to how long it takes to earn the cash, capped by diminishing factor
            reward: (t) => Math.round((t * 0.15) * diminishingFactor + referenceReward * 0.5)
        });

        // Serve VIP / Rich clients — only from the 2nd branch onward (branchIndex 0 = first branch has no VIP/rich clients yet); suppressed once VIP dept is unlocked, vip_collector takes over
        const vipDeptAlreadyUnlocked = !!(this.game.state.departments && this.game.state.departments.find(d => d.id === GAME_CONFIG.DEPT_ID_VIP)?.unlocked);
        if (branchIndex >= 1 && !vipDeptAlreadyUnlocked) {
            pool.push({
                type: 'serve_rich_vip',
                target: () => {
                    const base = 5 + Math.floor(Math.random() * 6);
                    const branchMult = Math.pow(2.0, branchIndex);
                    const epsFactor = Math.max(1, Math.floor(Math.log10(Math.max(1, this.game.getEarningsPerSecond()))));
                    return Math.round(base * branchMult * (1 + 0.4 * epsFactor));
                },
                reward: (t) => Math.round(referenceReward * 1.2)
            });
        }

        // Spend Cash on upgrades
        pool.push({
            type: 'spend_cash',
            target: () => {
                const eps = Math.max(this.game.getEarningsPerSecond(), 10);
                const durationSeconds = 180 + Math.floor(Math.random() * 301); // 3 to 8 minutes of earnings
                return Math.max(500, Math.round(eps * durationSeconds));
            },
            reward: (t) => Math.round((t * 0.15) * diminishingFactor + referenceReward * 0.5)
        });

        // Upgrade managers (only if total level is under 30)
        const currentTotalManagerLevels = this.game.state.managerUpgrades ? Object.values(this.game.state.managerUpgrades).reduce((sum, m) => sum + ((m && m.level) || 1), 0) : 0;
        if (currentTotalManagerLevels < 30) {
            pool.push({
                type: 'upgrade_managers',
                target: () => Math.min(30 - currentTotalManagerLevels, 2 + Math.floor(Math.random() * 4)),
                reward: (t) => Math.round(referenceReward * 2.0)
            });
        }

        // === NEW MISSION TYPES ===



        // 1. vip_collector — only if VIP dept is unlocked
        const vipDeptUnlocked = !!(this.game.state.departments && this.game.state.departments.find(d => d.id === GAME_CONFIG.DEPT_ID_VIP)?.unlocked);
        if (vipDeptUnlocked) {
            pool.push({
                type: 'vip_collector',
                target: () => {
                    const branchMult = Math.pow(1.5, branchIndex);
                    const epsFactor = Math.max(1, Math.floor(Math.log10(Math.max(1, this.game.getEarningsPerSecond()))));
                    return Math.round(20 * branchMult * (1 + 0.2 * epsFactor));
                },
                reward: () => ({ type: 'shares', amount: 2 })
            });
        }

        // 2. department_unlock — only if there's a locked dept AND player has >= 50% of its cost
        const lockedDepts = (this.game.state.departments || []).filter(d => d && !d.unlocked);
        if (lockedDepts.length > 0) {
            const cheapestLocked = lockedDepts.reduce((min, d) => d.cost < min.cost ? d : min, lockedDepts[0]);
            const playerHasHalfCost = this.game.state.cash >= cheapestLocked.cost * 0.5;
            if (playerHasHalfCost) {
                pool.push({
                    type: 'department_unlock',
                    target: () => 1,
                    reward: () => Math.round(this.game.getEarningsPerSecond() * 300)
                });
            }
        }

        // 3. manager_hire — only if at least 1 manager is already hired and there are managers left to hire
        const alreadyHiredCount = this.game.state.managers ? Object.values(this.game.state.managers).filter(v => v === true).length : 0;
        const managersLeftToHire = 7 - alreadyHiredCount;
        if (alreadyHiredCount >= 1 && managersLeftToHire >= 1) {
            pool.push({
                type: 'manager_hire',
                target: () => Math.min(3, managersLeftToHire),
                reward: () => ({ type: 'shares', amount: 1 })
            });
        }

        // 4. teller_max — only if highest teller level >= 5; target always 5 levels ahead to prevent instant completion
        const unlockedTellerLevels = (this.game.state.tellers || []).filter(t => t && t.unlocked).map(t => t.level);
        const highestTellerLevel = unlockedTellerLevels.length > 0 ? Math.max(...unlockedTellerLevels) : 0;
        if (highestTellerLevel >= 5) {
            pool.push({
                type: 'teller_max',
                target: () => highestTellerLevel + 5,
                reward: () => ({ type: 'gold', amount: 1 })
            });
        }

        // 5. boost_run — only if boost2x has ever been activated (timeLeft > 0 or boost2xUsedEver flag)
        const boostEverUsed = (this.game.state.boost2xTimeLeft > 0) || (this.game.state.boost2xUsedEver === true);
        if (boostEverUsed) {
            const boostEps = this.game.getEarningsPerSecond();
            const boostTarget = Math.round(boostEps * 1800);
            pool.push({
                type: 'boost_run',
                target: () => Math.max(500, boostTarget),
                reward: () => Math.round(boostEps * 600)
            });
        }

        // 6. guard_trips — only if at least 1 guard is unlocked
        const unlockedGuardsCount = (this.game.state.guards || []).filter(g => g && g.unlocked).length;
        if (unlockedGuardsCount >= 1) {
            pool.push({
                type: 'guard_trips',
                target: () => Math.round(50 * Math.pow(1.5, branchIndex)),
                reward: () => ({ type: 'gold', amount: 1 })
            });
        }

        // 7. all_managers — only if at least 4 managers are hired (late game)
        if (alreadyHiredCount >= 4 && alreadyHiredCount < 7) {
            pool.push({
                type: 'all_managers',
                target: () => 7,
                reward: () => ({ type: 'shares', amount: 3 })
            });
        }

        // 8. break_the_wall — Mid-game cash burst to help afford the 4th/5th teller
        const unlockedTellersCount = (this.game.state.tellers || []).filter(t => t && t.unlocked).length;
        if (unlockedTellersCount >= 3 && unlockedTellersCount < 5) {
            pool.push({
                type: 'break_the_wall',
                target: () => 150 + Math.floor(Math.random() * 50),
                reward: () => Math.round(this.game.getEarningsPerSecond() * 1800 + referenceReward * 3) // 30 mins worth of cash + base
            });
        }

        // 9. missions_veteran — complete X missions in total (meta-progression milestone)
        const completedSoFar = this.game.state.missionsCompleted || 0;
        if (completedSoFar >= 5) {
            pool.push({
                type: 'missions_veteran',
                target: () => completedSoFar + 5 + Math.floor(Math.random() * 6),
                reward: () => ({ type: 'shares', amount: 2 })
            });
        }

        // 10. department_grind — upgrade a specific unlocked department's manager N times
        const deptMgrMap = [
            { mgrType: 'finance',   deptIdx: 1 },
            { mgrType: 'service',   deptIdx: 2 },
            { mgrType: 'vip',       deptIdx: 3 },
            { mgrType: 'marketing', deptIdx: 4 }
        ];
        const availableDeptMgrs = deptMgrMap.filter(({ mgrType, deptIdx }) => {
            const deptUnlocked = this.game.state.departments[deptIdx] && this.game.state.departments[deptIdx].unlocked;
            const mgr = this.game.state.managerUpgrades && this.game.state.managerUpgrades[mgrType];
            return deptUnlocked && mgr && mgr.level < 5; // max level is 5
        });
        if (availableDeptMgrs.length > 0) {
            const chosen = availableDeptMgrs[Math.floor(Math.random() * availableDeptMgrs.length)];
            pool.push({
                type: 'department_grind',
                _deptMgrType: chosen.mgrType,
                target: () => 1 + Math.floor(Math.random() * 2),
                reward: (t) => Math.round(referenceReward * 4.0)
            });
        }

        // Pick random mission template ensuring no duplicate active types.
        // Conflict groups prevent semantically-equivalent types from co-existing.
        const conflictGroups = [
            ['hire_managers', 'manager_hire'],
            ['unlock_departments', 'department_unlock'],
        ];
        const activeTypes = (this.game.state.missions || []).map(m => m.type);
        const blockedTypes = new Set(activeTypes);
        conflictGroups.forEach(group => {
            if (group.some(t => activeTypes.includes(t))) {
                group.forEach(t => blockedTypes.add(t));
            }
        });
        let availablePool = pool.filter(t => !blockedTypes.has(t.type));
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
        } else if (template.type === 'department_grind') {
            targetId = template._deptMgrType;
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
            // reward may be a number (cash) or { type:'shares'/'gold', amount:N }
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

        let anyNewlyCompleted = false;

        this.game.state.missions.forEach(m => {
            if (m.completed) return;

            // Healing check to prevent freezes or NaN loops
            if (isNaN(m.target) || !isFinite(m.target) || m.target <= 0) {
                m.target = 1; 
            }

            // Migrate legacy vip_marathon to vip_collector
            if (m.type === 'vip_marathon') {
                m.type = 'vip_collector';
                m.startProgress = this.game.state.stats.vipServed || 0;
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
                    const currentLevels = Object.values(this.game.state.managerUpgrades).reduce((sum, upg) => sum + (upg.level || 1), 0);
                    if (m.startProgress === undefined) {
                        m.startProgress = currentLevels;
                    }
                    currentProgress = currentLevels - m.startProgress;
                    break;
                }

                // === NEW MISSION TRACKING ===



                case 'vip_collector':
                    if (m.startProgress === undefined) {
                        m.startProgress = this.game.state.stats.vipServed || 0;
                    }
                    currentProgress = (this.game.state.stats.vipServed || 0) - m.startProgress;
                    break;

                case 'department_unlock': {
                    // Track whether a new department was unlocked after mission start
                    const deptCountNow = (this.game.state.departments || []).filter(d => d && d.unlocked).length;
                    if (m.startProgress === undefined) {
                        m.startProgress = deptCountNow;
                    }
                    currentProgress = deptCountNow > m.startProgress ? 1 : 0;
                    break;
                }

                case 'manager_hire': {
                    // Count managers hired since mission start
                    const hiredNow = this.game.state.managers ? Object.values(this.game.state.managers).filter(v => v === true).length : 0;
                    if (m.startProgress === undefined) {
                        m.startProgress = hiredNow;
                    }
                    currentProgress = hiredNow - m.startProgress;
                    break;
                }

                case 'teller_max': {
                    // Progress = highest level among unlocked tellers (target is 10)
                    const tellerLevels = (this.game.state.tellers || []).filter(t => t && t.unlocked).map(t => t.level);
                    currentProgress = tellerLevels.length > 0 ? Math.max(...tellerLevels) : 0;
                    break;
                }

                case 'boost_run': {
                    // Accumulate cash earned while boost2x is active
                    if (m.startProgress === undefined) {
                        m.startProgress = 0;
                    }
                    // boostCashAccumulator is updated by the game loop when boost is active
                    currentProgress = m.boostCashAccumulator || 0;
                    break;
                }

                case 'guard_trips': {
                    // guardTripsTotal is incremented externally when a guard transitions depositing -> idle
                    currentProgress = this.game.state.guardTripsTotal || 0;
                    if (m.startProgress === undefined) {
                        m.startProgress = currentProgress;
                    }
                    currentProgress = (this.game.state.guardTripsTotal || 0) - m.startProgress;
                    break;
                }

                case 'all_managers': {
                    const totalHired = this.game.state.managers ? Object.values(this.game.state.managers).filter(v => v === true).length : 0;
                    currentProgress = totalHired;
                    break;
                }

                case 'break_the_wall': {
                    if (m.startProgress === undefined) {
                        m.startProgress = this.game.state.stats.clientsServed || 0;
                    }
                    currentProgress = (this.game.state.stats.clientsServed || 0) - m.startProgress;
                    break;
                }

                case 'department_grind': {
                    const mgrType = m.targetId;
                    const mgr = this.game.state.managerUpgrades && this.game.state.managerUpgrades[mgrType];
                    const currentLevel = mgr ? mgr.level : 1;
                    if (m.startProgress === undefined) {
                        m.startProgress = currentLevel;
                    }
                    currentProgress = currentLevel - m.startProgress;
                    break;
                }

                case 'missions_veteran':
                    currentProgress = this.game.state.missionsCompleted || 0;
                    break;
            }

            m.progress = Math.min(m.target, currentProgress);
            
            if (isNaN(m.progress) || !isFinite(m.progress)) {
                m.progress = 0;
            }

            if (m.progress >= m.target) {
                m.progress = m.target;
                m.completed = true;
                anyNewlyCompleted = true;
                if (typeof window.showToast === 'function') {
                    const lang = this.game.state.language || 'en';
                    const msg = lang === 'he' ? '🏆 משימה הושלמה! לחץ אסוף פרס' :
                               (lang === 'ru' ? '🏆 Миссия завершена!' :
                               (lang === 'es' ? '🏆 ¡Misión completada!' : '🏆 Mission Completed!'));
                    window.showToast(msg, 'success');
                }
            }
        });

        if (anyNewlyCompleted) {
            const activeTabEl = document.querySelector && document.querySelector('.tab-btn.active');
            const activeTab = activeTabEl ? activeTabEl.getAttribute('data-tab') : '';
            if (activeTab === 'missions' && typeof window.renderMissionsTab === 'function') {
                window.renderMissionsTab();
            }
        }
    }

    claimMissionReward(id) {
        const mIndex = this.game.state.missions.findIndex(m => m.id === id);
        if (mIndex === -1) return { type: 'none', amount: 0 };

        const m = this.game.state.missions[mIndex];
        if (!m.completed || m.claimed) return { type: 'none', amount: 0 };

        m.claimed = true;
        const reward = m.reward;

        let result;
        if (reward && typeof reward === 'object' && reward.type) {
            // Shares / gold reward
            const shareAmt = reward.amount || 1;
            this.game.state.shares = (this.game.state.shares || 0) + shareAmt;
            result = { type: reward.type, amount: shareAmt };
        } else {
            // Cash reward (legacy: reward is a number)
            const rewardAmt = typeof reward === 'number' ? reward : 0;
            this.game.state.cash = Math.round((this.game.state.cash + rewardAmt + Number.EPSILON) * 100) / 100;
            this.game.state.lifetimeCash = Math.round((this.game.state.lifetimeCash + rewardAmt + Number.EPSILON) * 100) / 100;
            result = { type: 'cash', amount: rewardAmt };
        }

        this.game.state.missionsCompleted++;

        // Remove and replace with a fresh mission
        this.game.state.missions.splice(mIndex, 1);
        this.game.state.missions.push(this.generateMission());

        this.game.missionsDirty = true;
        this.game.saveGame();
        return result;
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
            case 'daily_vip':       return (s.stats && s.stats.vipServed) || 0;
            case 'daily_eps':       return 0; // EPS נוכחי, לא delta
            default: return 0;
        }
    }

    checkAndReset() {
        // Daily reset is calendar-day based, so use LOCAL time consistently — mixing
        // server-adjusted timestamps with local midnight caused off-by-one resets.
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        if (!this.game.state.lastDailyReset || this.game.state.lastDailyReset < todayMidnight.getTime()) {
            this.game.state.dailyChallenges = this._generate3Challenges();
            this.game.state.lastDailyReset = Date.now();
        }

        // עדכון progress
        this.game.state.dailyChallenges.forEach(c => {
            if (c.completed) return;

            let currentProgress = 0;
            const s = this.game.state;

            switch (c.type) {
                case 'daily_earn_cash':
                    // baseProgress banks progress earned before a prestige reset (see game.js prestige())
                    currentProgress = ((s.lifetimeCash || 0) - (c.startProgress || 0)) + (c.baseProgress || 0);
                    break;
                case 'daily_clients':
                    currentProgress = ((s.stats && s.stats.clientsServed) || 0) - (c.startProgress || 0);
                    break;
                case 'daily_spend':
                    currentProgress = ((s.stats && s.stats.cashSpent) || 0) - (c.startProgress || 0);
                    break;
                case 'daily_vip':
                    currentProgress = ((s.stats && s.stats.vipServed) || 0) - (c.startProgress || 0);
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

        // NOTE: reward.type 'gold' and 'shares' both add to state.shares (gold shares).
        // 'gold' is the legacy name used in daily challenge definitions; both types
        // represent the same prestige currency. Do not rename 'gold' without updating
        // _generate3Challenges() and all UI rendering that reads c.reward.type.
        if (c.reward.type === 'gold' || c.reward.type === 'shares') {
            this.game.state.shares = (this.game.state.shares || 0) + c.reward.amount;
        }

        this.game.saveGame();
        return true;
    }
}

window.DailyChallengeController = DailyChallengeController;