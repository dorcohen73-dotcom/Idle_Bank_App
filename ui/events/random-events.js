import { initSound, playAd, AdService } from './ads.js';

const EVENT_HANDLERS = {
    crowd: handleCrowdEvent,
    security: handleSecurityEvent,
    rescue: handleRescueEvent,
    rush_hours: handleRushHoursEvent,
    investor: handleInvestorEvent,
    audit: handleAuditEvent,
    maintenance: handleMaintenanceEvent,
    power_outage: handlePowerOutageEvent,
    robbery_attempt: handleRobberyAttemptEvent,
    celebrity_visit: handleCelebrityVisitEvent,
    lottery_winner: handleLotteryWinnerEvent,
    competitor_news: handleCompetitorNewsEvent,
    economic_boom: handleEconomicBoomEvent,
    atm_malfunction: handleAtmMalfunctionEvent
};

export function handleCrowdEvent(container, lang, tObj, eObj, eventModal) {
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

export function handleSecurityEvent(container, lang, tObj, eObj, eventModal) {
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
            const msg = typeof tObj.securityBreachMsg === 'function' ? tObj.securityBreachMsg(formatMoney(lost)) : `Break-in occurred! You lost ${formatMoney(lost)} from the vault.`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, 'warning');
            } else {
                console.warn(msg);
            }
        } else {
            const payout = Math.round(game.state.cash * 0.05 * game.getEventBonusMultiplier());
            game.addCash(payout);
            const msg = typeof tObj.securityDefenseMsg === 'function' ? tObj.securityDefenseMsg(formatMoney(payout)) : `Security held the line! You received an insurance payout of ${formatMoney(payout)}.`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg, 'success');
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

export function handleRescueEvent(container, lang, tObj, eObj, eventModal) {
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

export function handleRushHoursEvent(container, lang, tObj, eObj, eventModal) {
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

export function handleInvestorEvent(container, lang, tObj, eObj, eventModal) {
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

// ===== 9 NEW EVENT HANDLERS =====

export function handleAuditEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(800 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.03));

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
        spawnFloating(tObj.auditCleanMsg || 'Audit closed clean!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        const penalty = Math.round(game.state.cash * 0.08);
        game.spendCash(penalty);
        game.addShares(3);
        spawnFloating(typeof tObj.auditPenaltyMsg === 'function' ? tObj.auditPenaltyMsg(formatMoney(penalty)) : `-${formatMoney(penalty)} | +3 Gold Shares`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
            if (Math.random() < 0.5) {
                const bonus = Math.round(game.getEarningsPerSecond() * 120 * game.getEventBonusMultiplier());
                game.addCash(bonus);
                spawnFloating(`+${formatMoney(bonus)} APPEAL WON!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
            } else {
                const fine = Math.round(game.state.cash * 0.16);
                game.spendCash(fine);
                spawnFloating(`-${formatMoney(fine)} Appeal lost!`, window.innerWidth / 2, window.innerHeight / 2, 'red');
            }
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

export function handleMaintenanceEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(600 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.025));

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
        game.triggerSpeedBoost(600, 1.15);
        spawnFloating(tObj.equipmentFixedMsg || 'Fixed! +15% speed', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        game.triggerSpeedBoost(300, 0.7);
        spawnFloating(tObj.equipmentWaitMsg || '-30% speed for 5 min', window.innerWidth / 2, window.innerHeight / 2, 'red');
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
            game.triggerSpeedBoost(300, 1.5);
            spawnFloating(tObj.contractorMsg || 'Contractor arrived! +50% speed', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

export function handlePowerOutageEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1200 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.04));

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
        spawnFloating(tObj.generatorActiveMsg || 'Generator running!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        game.triggerSpeedBoost(300, 0.5);
        spawnFloating(tObj.powerHalfMsg || '50% output for 5 min', window.innerWidth / 2, window.innerHeight / 2, 'red');
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
            game.triggerSpeedBoost(600, 1.25);
            spawnFloating(tObj.generatorFundedMsg || 'Generator funded! +25% speed', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

export function handleRobberyAttemptEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1500 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.03));

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
        const bounty = Math.round(game.getEarningsPerSecond() * 180 * game.getEventBonusMultiplier());
        game.addCash(bounty);
        spawnFloating(`+${formatMoney(bounty)} Security Bounty!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        spawnFloating(tObj.policeOnWayMsg || 'Police en route!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
            const insuranceBonus = Math.round(game.getEarningsPerSecond() * 240 * game.getEventBonusMultiplier());
            game.addCash(insuranceBonus);
            spawnFloating(`+${formatMoney(insuranceBonus)} Insurance!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

export function handleCelebrityVisitEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(2000 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.05));

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
        // VIP visit: give a speed boost (faster tellers = more clients served effectively)
        game.triggerSpeedBoost(3600, 1.15);
        spawnFloating(tObj.vipSpeedMsg || 'VIP +15% speed for 1 hour!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        const reward = Math.round(game.getEarningsPerSecond() * 120 * game.getEventBonusMultiplier());
        game.addCash(reward);
        spawnFloating(`+${formatMoney(reward)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
            game.triggerSpeedBoost(3600, 1.15);
            const bonus = Math.round(game.getEarningsPerSecond() * 180 * game.getEventBonusMultiplier());
            game.addCash(bonus);
            spawnFloating(`VIP BOOST + +${formatMoney(bonus)}`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

export function handleLotteryWinnerEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(2500 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.04));

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
        // Investment package: large speed boost simulating recurring income
        const investPayout = Math.round(game.getEarningsPerSecond() * 30 * 6 * game.getEventBonusMultiplier());
        game.addCash(investPayout);
        game.triggerSpeedBoost(3600, 1.3);
        spawnFloating(`+${formatMoney(investPayout)} INVESTMENT!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        const payout = Math.round(game.getEarningsPerSecond() * 60 * game.getEventBonusMultiplier());
        game.addCash(payout);
        spawnFloating(`+${formatMoney(payout)} DEPOSIT!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
            const investPayout = Math.round(game.getEarningsPerSecond() * 30 * 6 * game.getEventBonusMultiplier());
            const stdPayout = Math.round(game.getEarningsPerSecond() * 60 * game.getEventBonusMultiplier());
            game.addCash(investPayout + stdPayout);
            game.triggerSpeedBoost(3600, 1.3);
            spawnFloating(`+${formatMoney(investPayout + stdPayout)} VIP PACKAGE!`, window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

export function handleCompetitorNewsEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(1800 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.04));

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
        // More clients = faster processing speed + queue bonus
        game.triggerSpeedBoost(3600, 1.5);
        game.triggerTempQueueBonus(10, 3600000);
        spawnFloating(tObj.clientWave15Msg || 'Client wave! x1.5 for 1h', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        game.triggerSpeedBoost(1800, 1.05);
        spawnFloating(tObj.clientBoost5Msg || '+5% clients for 30 min', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
            game.triggerSpeedBoost(3600, 2.0);
            game.triggerTempQueueBonus(15, 3600000);
            spawnFloating(tObj.clientWave2Msg || 'Client wave! x2 for 1h', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

export function handleEconomicBoomEvent(container, lang, tObj, eObj, eventModal) {
    const cost = Math.round(Math.max(2200 * Math.pow(4, game.state.currentBranch), game.state.cash * 0.05));

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
        game.triggerSpeedBoost(3600, 1.2);
        spawnFloating(tObj.eps20Msg || 'EPS +20% for 1h!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        game.triggerSpeedBoost(1800, 1.1);
        spawnFloating(tObj.eps10Msg || 'EPS +10% for 30 min', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
            game.triggerSpeedBoost(3600, 1.3);
            spawnFloating(tObj.eps30Msg || 'EPS +30% for 1h!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

function handleAtmMalfunctionEvent(container, lang, tObj, eObj, eventModal) {
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
        eventModal.classList.remove('active');
        // ATMs fixed: bonus customers arrive (speed boost + queue expansion)
        game.triggerSpeedBoost(600, 1.3);
        game.triggerTempQueueBonus(8, 600000);
        spawnFloating(tObj.atmBackMsg || 'ATMs back online!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
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
        // Temporary slowdown while ATMs are offline
        game.triggerSpeedBoost(300, 0.8);
        spawnFloating(tObj.speed20MinusMsg || '-20% speed for 5 min', window.innerWidth / 2, window.innerHeight / 2, 'red');
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
            game.triggerSpeedBoost(600, 1.25);
            game.triggerTempQueueBonus(8, 600000);
            spawnFloating(tObj.atmFixedWaveMsg || 'ATMs fixed — client wave!', window.innerWidth / 2, window.innerHeight / 2, 'gold');
        });
    });

    container.appendChild(btnA);
    container.appendChild(btnB);
    container.appendChild(btnC);
}

// ===== END NEW EVENT HANDLERS =====

export function triggerRandomEvent() {
    if (document.querySelector('.modal-overlay.active')) return;
    
    const lang = game.state.language || 'en';
    const tObj = translations[lang];
    
    let eventType = 'crowd';
    const rescueThreshold = 2000 * Math.pow(6, game.state.currentBranch);
    const currentEps = game.getEarningsPerSecond();
    if (game.state.cash < rescueThreshold &&
        game.state.vault.cashStored < rescueThreshold &&
        currentEps * 30 < rescueThreshold) {
        eventType = 'rescue';
    } else {
        // Pool of all normal events with equal weight
        const normalEvents = [
            'crowd', 'security', 'rush_hours', 'investor',
            'audit', 'maintenance', 'power_outage', 'robbery_attempt',
            'celebrity_visit', 'lottery_winner', 'competitor_news',
            'economic_boom', 'atm_malfunction'
        ];
        eventType = normalEvents[Math.floor(Math.random() * normalEvents.length)];
    }

    const eventModal = document.getElementById('event-modal');
    if (!eventModal) return;
    const modalBox = eventModal.querySelector('.modal-box');
    if (!modalBox) return;

    // Remove all known event classes
    const allEventClasses = [
        'event-crowd', 'event-security', 'event-rescue', 'event-rush_hours', 'event-investor',
        'event-audit', 'event-maintenance', 'event-power_outage', 'event-robbery_attempt',
        'event-celebrity_visit', 'event-lottery_winner', 'event-competitor_news',
        'event-economic_boom', 'event-atm_malfunction'
    ];
    modalBox.classList.remove(...allEventClasses);
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

    // Resolve event text: new events live in events_extended, originals in events
    const eObj = (tObj.events && tObj.events[eventType])
        || (tObj.events_extended && tObj.events_extended[eventType]);
    if (!eObj) return;

    const EVENT_ICONS = {
        crowd: '👥',
        security: '🚨',
        rescue: '🏛️',
        rush_hours: '⚡',
        investor: '💼',
        audit: '📋',
        maintenance: '🔧',
        power_outage: '🔌',
        robbery_attempt: '🚔',
        celebrity_visit: '🌟',
        lottery_winner: '🎰',
        competitor_news: '📰',
        economic_boom: '📈',
        atm_malfunction: '💳'
    };
    iconEl.innerText = EVENT_ICONS[eventType] || '📢';
    titleEl.innerText = eObj.title;
    textEl.innerText = eObj.desc;
    container.innerHTML = '';

    const handler = EVENT_HANDLERS[eventType];
    if (handler) {
        handler(container, lang, tObj, eObj, eventModal);
    }

    if (AdService.isInCooldown()) {
        container.querySelectorAll('.ad-option').forEach(btn => btn.remove());

        const adDependentEvents = ['rescue', 'investor'];
        if (adDependentEvents.includes(eventType) && container.children.length <= 1) {
            return;
        }
    }

    if (window.NotificationQueue) {
        // Casual priority + dropIfBusy: an event whose content (cash amounts, etc.)
        // was built now would go stale if delayed and shown minutes later — skip
        // this cycle instead, the same as before the queue existed.
        window.NotificationQueue.request('event-modal', window.NotificationQueue.PRIORITY.CASUAL, () => {
            eventModal.classList.add('active');
        }, { dropIfBusy: true });
    } else {
        eventModal.classList.add('active');
    }
}
