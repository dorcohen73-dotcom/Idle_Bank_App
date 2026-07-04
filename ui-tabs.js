(function(window) {
// Tab Rendering & Updates Module for Idle Bank Empire

var _buyBtnCache = null;
var _lastManagersHash = null;
var _lastBranchesHash = null;

function invalidateTabHashes() {
    _lastManagersHash = null;
    _lastBranchesHash = null;
    _buyBtnCache = null;
}

// Helper to create a visual separator HR
function createSeparator(container) {
    const hr = document.createElement('hr');
    hr.style.border = '0';
    hr.style.borderTop = '1px solid var(--border-color)';
    container.appendChild(hr);
}

// Helper to build teller/guard upgrade/unlock cards
function buildEntityCard(type, entity, lang, tObj, currentUpgradeMode) {
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    const id = entity.id;

    if (entity.unlocked) {
        const details = game.getBulkUpgradeDetails(type, id, currentUpgradeMode, entity.level, game.state.cash);
        const levelsToBuy = details.levels;
        const nextLevel = entity.level + levelsToBuy;
        const cost = details.cost;
        
        let capacity, speed, nextCapacity, nextSpeed, avatarImg, title, desc, speedLabel, capLabel;
        let avatarBgUrl = '', avatarBgPos = 'center 25%', avatarBgSize = 'cover';
        if (type === 'teller') {
            capacity = game.getTellerCapacity(entity.level);
            speed = game.getTellerSpeed(entity.level).toFixed(1);
            nextCapacity = game.getTellerCapacity(nextLevel);
            nextSpeed = game.getTellerSpeed(nextLevel).toFixed(1);
            avatarImg = '';
            avatarBgUrl = `תמונות/teller-${(id % 8) + 1}.png`;
            avatarBgPos = 'center';
            avatarBgSize = 'cover';
            title = tObj.tellerTitle(id + 1, entity.level);
            desc = tObj.tellerDesc;
            speedLabel = tObj.tellerSpeed;
            capLabel = tObj.tellerCap;
        } else {
            capacity = game.getGuardCapacity(entity.level);
            speed = game.getGuardSpeed(entity.level).toFixed(1);
            nextCapacity = game.getGuardCapacity(nextLevel);
            nextSpeed = game.getGuardSpeed(nextLevel).toFixed(1);
            avatarImg = '';
            avatarBgUrl = 'תמונות/guard.png';
            avatarBgPos = 'center 8%';
            avatarBgSize = '220%';
            title = tObj.guardTitle(id + 1, entity.level);
            desc = tObj.guardDesc;
            speedLabel = tObj.guardSpeed;
            capLabel = tObj.guardCap;
        }

        const canBuy = details.canAfford;

        card.className = 'upgrade-card premium-upg-card';
        const eps = capacity / speed;
        const nextEps = nextCapacity / nextSpeed;
        
        card.innerHTML = `
            <div class="upg-v2-info">
                <div class="upg-v2-avatar-wrap">
                    <div class="upg-v2-avatar" style="background-image: url('${avatarBgUrl}'); background-position: ${avatarBgPos}; background-size: ${avatarBgSize};"></div>
                </div>
                <div class="upg-v2-details">
                    <div class="upg-v2-title">${title} <span class="upg-v2-level-up">${levelsToBuy > 1 ? '(+'+levelsToBuy+')' : ''}</span></div>
                    <div class="upg-v2-desc">${desc}</div>
                    
                    <div class="upg-v2-divider"></div>
                    
                    <div class="upg-v2-stats">
                        <div class="upg-v2-stat">
                            <div class="upg-v2-stat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <div class="upg-v2-stat-text">
                                <div class="upg-v2-stat-label">${speedLabel}</div>
                                <div class="upg-v2-stat-val">${speed} <span class="arrow">➔</span> ${nextSpeed}</div>
                            </div>
                        </div>
                        <div class="upg-v2-stat">
                            <div class="upg-v2-stat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                            </div>
                            <div class="upg-v2-stat-text">
                                <div class="upg-v2-stat-label">${capLabel}</div>
                                <div class="upg-v2-stat-val">${formatMoney(capacity)} <span class="arrow">➔</span> ${formatMoney(nextCapacity)}</div>
                            </div>
                        </div>
                        <div class="upg-v2-stat">
                            <div class="upg-v2-stat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                            </div>
                            <div class="upg-v2-stat-text">
                                <div class="upg-v2-stat-label">${(statLabels[lang] || statLabels.en).totalYield}</div>
                                <div class="upg-v2-stat-val">${formatMoney(eps)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="upg-v2-buy-btn buy-btn ${canBuy ? '' : 'disabled'}" data-type="${type}" data-id="${id}" ${canBuy ? '' : 'disabled'} aria-label="${translations[lang].upgradeLabel} ${title} — ${formatMoney(cost)}">
                <div class="upg-v2-btn-left-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dfab29" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                </div>
                <div class="upg-v2-btn-content">
                    <div class="upg-v2-btn-top">
                        <span class="upg-v2-btn-upgrade-text">${translations[lang].upgradeLabel}</span>
                        <span class="upg-v2-btn-amount">+${levelsToBuy}</span>
                    </div>
                    <div class="upg-v2-btn-divider"></div>
                    <div class="upg-v2-btn-bottom">
                        <span class="upg-v2-btn-sub">${(statLabels[lang] || statLabels.en).totalUpgrade}</span>
                        <span class="upg-v2-btn-cost">${formatMoney(cost)}</span>
                    </div>
                </div>
                <div class="upg-v2-btn-sparkles">✨</div>
            </button>
        `;
        if (avatarBgUrl) {
            const avEl = card.querySelector('.card-avatar');
            if (avEl) { avEl.style.backgroundImage = `url('${avatarBgUrl}')`; avEl.style.backgroundPosition = avatarBgPos; avEl.style.backgroundSize = avatarBgSize; }
        }
    } else {
        let cost, avatarBgUrl2 = '', avatarBgPos2 = 'center 25%', avatarBgSize2 = 'cover', title, desc, unlockAction, unlockText;
        if (type === 'teller') {
            cost = game.tellerUnlockCosts[id];
            avatarBgUrl2 = `תמונות/teller-${(id % 8) + 1}.png`;
            avatarBgPos2 = 'center';
            avatarBgSize2 = 'cover';
            title = tObj.tellerLocked(id + 1);
            desc = tObj.tellerLockedDesc;
            unlockAction = 'unlock-teller';
            unlockText = translations[lang].unlockLabel;
        } else {
            cost = game.guardUnlockCosts[id];
            avatarBgUrl2 = 'תמונות/guard.png';
            avatarBgPos2 = 'center 8%';
            avatarBgSize2 = '220%';
            title = tObj.guardLocked(id + 1);
            desc = tObj.guardLockedDesc;
            unlockAction = 'unlock-guard';
            unlockText = tObj.guardUnlockBtn;
        }

        const canBuy = game.state.cash >= cost;

        card.className = 'upgrade-card premium-upg-card locked-card';
        card.innerHTML = `
            <div class="upg-v2-info">
                <div class="upg-v2-avatar-wrap locked">
                    <div class="upg-v2-avatar" style="background-image: url('${avatarBgUrl2}'); background-position: ${avatarBgPos2}; background-size: ${avatarBgSize2};"></div>
                    <div class="lock-overlay">🔒</div>
                </div>
                <div class="upg-v2-details">
                    <div class="upg-v2-title">${title}</div>
                    <div class="upg-v2-desc">${desc}</div>
                </div>
            </div>
            <button class="upg-v2-buy-btn buy-btn ${canBuy ? '' : 'disabled'}" data-action="${unlockAction}" data-id="${id}" ${canBuy ? '' : 'disabled'} aria-label="${translations[lang].unlockLabel} ${id + 1} — ${formatMoney(cost)}">
                <div class="upg-v2-btn-left-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dfab29" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <div class="upg-v2-btn-content">
                    <div class="upg-v2-btn-top">
                        <span class="upg-v2-btn-upgrade-text">${unlockText}</span>
                    </div>
                    <div class="upg-v2-btn-divider"></div>
                    <div class="upg-v2-btn-bottom">
                        <span class="upg-v2-btn-sub">${(statLabels[lang] || statLabels.en).unlockCost}</span>
                        <span class="upg-v2-btn-cost">${formatMoney(cost)}</span>
                    </div>
                </div>
            </button>
        `;
        if (avatarBgUrl2) {
            const avEl2 = card.querySelector('.card-avatar');
            if (avEl2) { avEl2.style.backgroundImage = `url('${avatarBgUrl2}')`; avEl2.style.backgroundPosition = avatarBgPos2; avEl2.style.backgroundSize = avatarBgSize2; }
        }
    }
    return card;
}

// Dynamic builder for Upgrades Tab
function renderUpgradesTab() {
    const container = document.getElementById('tab-upgrades');
    if (!container) return;
    _buyBtnCache = null;
    container.innerHTML = '';

    const lang = game.state.language || 'en';
    const tObj = translations[lang].upgrades;

    // Teller upgrade cards
    game.state.tellers.forEach(t => {
        const card = buildEntityCard('teller', t, lang, tObj, currentUpgradeMode);
        container.appendChild(card);
    });

    // Separator line
    createSeparator(container);

    // Guard upgrade cards
    game.state.guards.forEach(g => {
        const card = buildEntityCard('guard', g, lang, tObj, currentUpgradeMode);
        container.appendChild(card);
    });

    // Separator line
    createSeparator(container);

    // Vault upgrade card
    const vault = game.state.vault;
    const details = game.getBulkUpgradeDetails('vault', null, currentUpgradeMode, vault.level, game.state.cash);
    const vLevelsToBuy = details.levels;
    const vCost = details.cost;
    const vCap = game.getVaultCapacity(vault.level);
    const nextVCap = game.getVaultCapacity(vault.level + vLevelsToBuy);
    const vCanBuy = details.canAfford;

    const vaultCard = document.createElement('div');
    vaultCard.className = 'upgrade-card premium-upg-card';
    vaultCard.innerHTML = `
        <div class="upg-v2-info">
            <div class="upg-v2-avatar-wrap">
                <div class="upg-v2-avatar" style="background-image: url('תמונות/vault-door.png');"></div>
            </div>
            <div class="upg-v2-details">
                <div class="upg-v2-title">${tObj.vaultTitle(vault.level)} <span class="upg-v2-level-up">${vLevelsToBuy > 1 ? '(+'+vLevelsToBuy+')' : ''}</span></div>
                <div class="upg-v2-desc">${tObj.vaultDesc}</div>
                
                <div class="upg-v2-divider"></div>
                
                <div class="upg-v2-stats">
                    <div class="upg-v2-stat">
                        <div class="upg-v2-stat-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                        </div>
                        <div class="upg-v2-stat-text">
                            <div class="upg-v2-stat-label">${tObj.vaultCap}</div>
                            <div class="upg-v2-stat-val">${formatMoney(vCap)} <span class="arrow">➔</span> ${formatMoney(nextVCap)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <button class="upg-v2-buy-btn buy-btn ${vCanBuy ? '' : 'disabled'}" id="upgrade-vault-btn" ${vCanBuy ? '' : 'disabled'} aria-label="${translations[lang].upgradeLabel} ${translations[lang].vaultTitle} — ${formatMoney(vCost)}">
            <div class="upg-v2-btn-left-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dfab29" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
            </div>
            <div class="upg-v2-btn-content">
                <div class="upg-v2-btn-top">
                    <span class="upg-v2-btn-upgrade-text">${translations[lang].upgradeLabel}</span>
                    <span class="upg-v2-btn-amount">+${vLevelsToBuy}</span>
                </div>
                <div class="upg-v2-btn-divider"></div>
                <div class="upg-v2-btn-bottom">
                    <span class="upg-v2-btn-sub">${(statLabels[lang] || statLabels.en).totalUpgrade}</span>
                    <span class="upg-v2-btn-cost">${formatMoney(vCost)}</span>
                </div>
            </div>
            <div class="upg-v2-btn-sparkles">✨</div>
        </button>
    `;
    container.appendChild(vaultCard);

    // Separator line
    createSeparator(container);

    // Lobby Queue Capacity upgrade card
    const queueLvl = game.state.queueUpgradeLevel || 1;
    const qDetails = game.getBulkUpgradeDetails('queue', null, currentUpgradeMode, queueLvl, game.state.cash);
    const qLevelsToBuy = qDetails.levels;
    const qCost = qDetails.cost;
    const qCap = game.getQueueCapacity(queueLvl);
    const nextQCap = game.getQueueCapacity(queueLvl + qLevelsToBuy);
    const qCanBuy = qDetails.canAfford;

    const queueCard = document.createElement('div');
    queueCard.className = 'upgrade-card';

    if (queueLvl >= GAME_CONFIG.QUEUE_MAX_LEVEL) {
        queueCard.className = 'upgrade-card premium-upg-card';
        queueCard.innerHTML = `
            <div class="upg-v2-info">
                <div class="upg-v2-avatar-wrap">
                    <div class="upg-v2-avatar" style="background-image: url('תמונות/client-1.png');"></div>
                </div>
                <div class="upg-v2-details">
                    <div class="upg-v2-title">${tObj.queueMaxTitle}</div>
                    <div class="upg-v2-desc">${tObj.queueMaxDesc(qCap)}</div>
                </div>
            </div>
            <button class="upg-v2-buy-btn buy-btn disabled" disabled>
                <div class="upg-v2-btn-left-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div class="upg-v2-btn-content">
                    <div class="upg-v2-btn-top">
                        <span class="upg-v2-btn-upgrade-text">${translations[lang].maxLevel}</span>
                    </div>
                </div>
            </button>
        `;
    } else {
        queueCard.className = 'upgrade-card premium-upg-card';
        queueCard.innerHTML = `
            <div class="upg-v2-info">
                <div class="upg-v2-avatar-wrap">
                    <div class="upg-v2-avatar" style="background-image: url('תמונות/client-1.png');"></div>
                </div>
                <div class="upg-v2-details">
                    <div class="upg-v2-title">${tObj.queueTitle(queueLvl)} <span class="upg-v2-level-up">${qLevelsToBuy > 1 ? '(+'+qLevelsToBuy+')' : ''}</span></div>
                    <div class="upg-v2-desc">${tObj.queueDesc}</div>
                    
                    <div class="upg-v2-divider"></div>
                    
                    <div class="upg-v2-stats">
                        <div class="upg-v2-stat">
                            <div class="upg-v2-stat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <div class="upg-v2-stat-text">
                                <div class="upg-v2-stat-label">${tObj.queueCap}</div>
                                <div class="upg-v2-stat-val">${qCap} <span class="arrow">➔</span> ${nextQCap}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button class="upg-v2-buy-btn buy-btn ${qCanBuy ? '' : 'disabled'}" id="upgrade-queue-btn" ${qCanBuy ? '' : 'disabled'}>
                <div class="upg-v2-btn-left-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dfab29" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                </div>
                <div class="upg-v2-btn-content">
                    <div class="upg-v2-btn-top">
                        <span class="upg-v2-btn-upgrade-text">${tObj.queueUpgradeBtn}</span>
                        <span class="upg-v2-btn-amount">+${qLevelsToBuy}</span>
                    </div>
                    <div class="upg-v2-btn-divider"></div>
                    <div class="upg-v2-btn-bottom">
                        <span class="upg-v2-btn-sub">${(statLabels[lang] || statLabels.en).totalUpgrade}</span>
                        <span class="upg-v2-btn-cost">${formatMoney(qCost)}</span>
                    </div>
                </div>
                <div class="upg-v2-btn-sparkles">✨</div>
            </button>
        `;
    }
    container.appendChild(queueCard);

    // Smart Recommendation Highlight
    let bestBtnSelector = null;
    let maxRatio = -1;

    // Check tellers for best EPS/Cost ratio
    game.state.tellers.forEach(t => {
        if (!t.unlocked) return;
        const details = game.getBulkUpgradeDetails('teller', t.id, currentUpgradeMode, t.level, game.state.cash);
        if (details.canAfford && details.cost > 0) {
            const nextLvl = t.level + details.levels;
            const nextSpeed = Math.max(0.1, game.getTellerSpeed(nextLvl));
            const currentSpeed = Math.max(0.1, game.getTellerSpeed(t.level));
            const epsIncrease = (1 / nextSpeed) - (1 / currentSpeed);
            
            let ratio = epsIncrease / details.cost;
            if (epsIncrease === 0) {
                // If speed is maxed out, fallback to most levels per cost
                ratio = (details.levels * 0.0000001) / details.cost;
            }
            if (ratio > maxRatio) {
                maxRatio = ratio;
                bestBtnSelector = `.buy-btn[data-type="teller"][data-id="${t.id}"]`;
            }
        }
    });

    if (bestBtnSelector) {
        const btn = container.querySelector(bestBtnSelector);
        if (btn) {
            const card = btn.closest('.upgrade-card');
            if (card) {
                card.classList.add('smart-recommendation-glow');
                card.style.position = 'relative';
                const badge = document.createElement('div');
                badge.className = 'recommended-badge';
                badge.innerText = (statLabels[lang] || statLabels.en).bestValue;
                card.appendChild(badge);
            }
        }
    } else {
        // Fallback: Just highlight the first affordable upgrade
        const firstAffordable = container.querySelector('.buy-btn:not(.disabled)');
        if (firstAffordable) {
            const card = firstAffordable.closest('.upgrade-card');
            if (card) {
                card.classList.add('smart-recommendation-glow');
                card.style.position = 'relative';
                const badge = document.createElement('div');
                badge.className = 'recommended-badge';
                badge.innerText = (statLabels[lang] || statLabels.en).bestValue;
                card.appendChild(badge);
            }
        }
    }
}

const statLabels = {
    he: {
        satisfaction: "שביעות רצון",
        client_speed: "מהירות לקוחות",
        auto_vault: "ריקון כספת אוטומטי",
        bank_yield: "הכנסות הבנק",
        courier_speed: "מהירות בלדרים",
        teller_speed: "מהירות כספרים",
        counter_cap: "קיבולת עמדות",
        base_income: "רווח בסיסי",
        dept_yields: "הכנסות מחלקות",
        gold_shares: "מניות זהב בפרסטיז'",
        ad_bonus: "בונוס פרסום",
        offline_time: "שעות אופליין מקסימליות",
        offline_income: "הכנסות אופליין",
        hourlyProfit: "רווח נוסף:",
        perHour: "לשעה",
        lockedLabel: "נעול",
        hireBtn: "גיוס",
        upgradeBtn: "שדרג",
        activeLabel: "פעיל",
        totalYield: "תגמול כולל",
        totalUpgrade: 'סה"כ שדרוג',
        unlockCost: "עלות פתיחה",
        autoText: "אוטומטי",
        maxLabel: "מקסימלי",
        bestValue: "🔥 הכי משתלם"
    },
    en: {
        satisfaction: "Satisfaction",
        client_speed: "Client Speed",
        auto_vault: "Auto Vault Collect",
        bank_yield: "Bank Yield",
        courier_speed: "Courier Speed",
        teller_speed: "Teller Speed",
        counter_cap: "Desk Capacity",
        base_income: "Base Yield",
        dept_yields: "Dept Yields",
        gold_shares: "Prestige Gold Shares",
        ad_bonus: "Ad Campaign Boost",
        offline_time: "Max Offline Hours",
        offline_income: "Offline Income",
        hourlyProfit: "Extra Yield:",
        perHour: "/ hr",
        lockedLabel: "Locked",
        hireBtn: "Hire",
        upgradeBtn: "Upgrade",
        activeLabel: "Active",
        totalYield: "Total Yield",
        totalUpgrade: "Total Upgrade",
        unlockCost: "Unlock Cost",
        autoText: "Auto",
        maxLabel: "Maximum",
        bestValue: "🔥 Best Value"
    },
    es: {
        satisfaction: "Satisfacción",
        client_speed: "Vel. de Clientes",
        auto_vault: "Recogida de Caja Auto",
        bank_yield: "Rendimiento del Banco",
        courier_speed: "Vel. de Courier",
        teller_speed: "Vel. de Cajeros",
        counter_cap: "Capacidad de Desk",
        base_income: "Rendimiento Base",
        dept_yields: "Ingresos de Depts",
        gold_shares: "Acciones de Oro",
        ad_bonus: "Bono de Publicidad",
        offline_time: "Horas Offline Máx",
        offline_income: "Ingresos Offline",
        hourlyProfit: "Rendimiento Extra:",
        perHour: "/ h",
        lockedLabel: "Bloqueado",
        hireBtn: "Contratar",
        upgradeBtn: "Mejorar",
        activeLabel: "Activo",
        totalYield: "Rendimiento Total",
        totalUpgrade: "Total Mejora",
        unlockCost: "Costo de Apertura",
        autoText: "Auto",
        maxLabel: "Máximo",
        bestValue: "🔥 Mejor Oferta"
    },
    ru: {
        satisfaction: "Удовлетворение",
        client_speed: "Скорость клиентов",
        auto_vault: "Авто-сбор сейфа",
        bank_yield: "Доход банка",
        courier_speed: "Скорость курьеров",
        teller_speed: "Скорость кассиров",
        counter_cap: "Лимит касс",
        base_income: "Базовый доход",
        dept_yields: "Доход отделов",
        gold_shares: "Золотые акции",
        ad_bonus: "Бонус рекламы",
        offline_time: "Макс. часов оффлайн",
        offline_income: "Оффлайн доход",
        hourlyProfit: "Доп. доход:",
        perHour: "/ ч",
        lockedLabel: "Закрыто",
        hireBtn: "Нанять",
        upgradeBtn: "Улучшить",
        activeLabel: "Активно",
        totalYield: "Общий доход",
        totalUpgrade: "Итого улучшений",
        unlockCost: "Стоимость открытия",
        autoText: "Авто",
        maxLabel: "Максимум",
        bestValue: "🔥 Лучшая цена"
    }
};

// Dynamic builder for Managers Tab
function renderManagersTab() {
    const container = document.getElementById('tab-managers');
    if (!container) return;
    let hash = null;
    try {
        hash = JSON.stringify({
            managers: game.state.managers,
            managerUpgrades: game.state.managerUpgrades,
            cash: Math.floor(game.state.cash / 1000)
        });
    } catch (e) { /* render unconditionally on serialization error */ }
    if (hash && hash === _lastManagersHash) return;
    _lastManagersHash = hash;
    _buyBtnCache = null;
    container.innerHTML = '';

    const lang = game.state.language || 'en';
    const tObj = translations[lang].managers;

    const managersKeys = ['customer', 'operations', 'finance', 'accountant', 'service', 'vip', 'marketing'];
    const managerConfigs = {
        customer: { theme: 'theme-gold', gem: '👑', img: 'manager-1.png' },
        finance: { theme: 'theme-blue', gem: '💎', img: 'manager-2.png' },
        accountant: { theme: 'theme-teal', gem: '⏱️', img: 'manager-7.png' },
        operations: { theme: 'theme-purple', gem: '🔮', img: 'manager-3.png' },
        service: { theme: 'theme-amber', gem: '🔸', img: 'manager-4.png' },
        vip: { theme: 'theme-red', gem: '💰', img: 'manager-5.png' },
        marketing: { theme: 'theme-green', gem: '🔹', img: 'manager-6.png' }
    };

    const grid = document.createElement('div');
    grid.className = 'managers-grid';
    container.appendChild(grid);

    managersKeys.forEach(type => {
        const config = managerConfigs[type];
        const mData = game.getManagerRenderData(type);
        if (!mData) return;

        const isUnlocked = mData.isUnlocked;
        const isHired = mData.isHired;
        const cost = mData.cost;
        const canBuy = game.state.cash >= cost;
        const level = mData.level;

        const card = document.createElement('div');
        card.className = `upgrade-card manager-card feature-card ${config.theme} ${isUnlocked ? (isHired ? 'active' : '') : 'locked'}`;

        let bodyHtml = '';
        let footerHtml = '';

        if (!isUnlocked) {
            // Locked Manager layout
            const deptName = (type === 'finance' ? translations[lang].departments.names[1] :
                              (type === 'service' ? translations[lang].departments.names[2] :
                               (type === 'vip' ? translations[lang].departments.names[3] :
                                (type === 'marketing' ? translations[lang].departments.names[4] : ''))));

            bodyHtml = `
                <div class="mgr-card-bg"></div>
                <div class="mgr-layout-wrapper">
                    <div class="mgr-portrait-col" style="filter: grayscale(1) brightness(0.5);">
                        <img src="תמונות/${config.img}" class="mgr-portrait-img">
                        <div class="mgr-gem-badge">${config.gem}</div>
                    </div>
                    <div class="mgr-content-col">
                        <div class="mgr-top-row">
                            <div class="mgr-title-group">
                                <div class="mgr-title">${tObj.names[type]}</div>
                                <div class="mgr-stars"><span class="star gray-star">★</span><span class="star gray-star">★</span><span class="star gray-star">★</span><span class="star gray-star">★</span><span class="star gray-star">★</span></div>
                                <div class="mgr-lvl-badge">${translations[lang].levelAbbr || 'Lv'} 0</div>
                            </div>
                            <div class="mgr-hex-icon"><div class="hex-inner">🔒</div></div>
                        </div>
                        <div class="mgr-stats-list">
                            <div class="mgr-stat-pill" style="justify-content: center; padding: 1rem 0;">
                                <div style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500; text-align: center;">
                                    🔒 ${translations[lang].requiresUnlocking || 'Requires unlocking:'} <br>
                                    <span style="color: var(--primary-gold); margin-top: 0.2rem; display: inline-block;">${deptName}</span>
                                </div>
                            </div>
                        </div>
            `;

            footerHtml = `
                        <div class="mgr-footer-row">
                            <div class="mgr-footer-info">
                                <div class="mgr-footer-lbl">${statLabels[lang].hourlyProfit}</div>
                                <div class="mgr-footer-val-box">
                                    <span class="mgr-footer-val" style="color: var(--text-muted);">-</span>
                                </div>
                            </div>
                            <button class="buy-btn mgr-buy-btn disabled" disabled>
                                ${statLabels[lang].lockedLabel} 🔒
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Unlocked Manager layout
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<span class="star ${i <= level ? 'gold-star' : 'gray-star'}">★</span>`;
            }

            // Determine custom statistics descriptions
            let stat1Lbl = '', stat2Lbl = '';
            let icon1 = '', icon2 = '';
            if (type === 'customer') {
                stat1Lbl = statLabels[lang].client_speed;
                stat2Lbl = statLabels[lang].satisfaction;
                icon1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';
                icon2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
            } else if (type === 'finance') {
                stat1Lbl = statLabels[lang].auto_vault;
                stat2Lbl = statLabels[lang].bank_yield;
                icon1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
                icon2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>';
            } else if (type === 'operations') {
                stat1Lbl = statLabels[lang].courier_speed;
                stat2Lbl = statLabels[lang].counter_cap;
                icon1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>';
                icon2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
            } else if (type === 'service') {
                stat1Lbl = statLabels[lang].counter_cap;
                stat2Lbl = statLabels[lang].base_income;
                icon1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
                icon2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
            } else if (type === 'vip') {
                stat1Lbl = statLabels[lang].dept_yields;
                stat2Lbl = statLabels[lang].gold_shares;
                icon1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
                icon2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>';
            } else if (type === 'marketing') {
                stat1Lbl = statLabels[lang].ad_bonus;
                stat2Lbl = statLabels[lang].offline_time;
                icon1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12A10 10 0 0 0 11 2v20a10 10 0 0 0 11-10z"></path></svg>';
                icon2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
            } else if (type === 'accountant') {
                stat1Lbl = statLabels[lang].offline_time;
                stat2Lbl = statLabels[lang].offline_income;
                icon1 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
                icon2 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>';
                
                // Fallback in case game.js cache fails to update
                if (!mData.stat1Val || mData.stat1Val === '') {
                    const c = GAME_CONFIG.MANAGER_COEFFICIENTS['accountant'];
                    if (c) {
                        mData.stat1Val = `+${c.offlineLimitBoost * level}h`;
                        mData.stat2Val = `+${Math.round(c.offlineIncomeBoost * 100 * level)}%`;
                    }
                }
            }

            bodyHtml = `
                <div class="mgr-card-bg"></div>
                <div class="mgr-layout-wrapper">
                    <div class="mgr-portrait-col">
                        <img src="תמונות/${config.img}" class="mgr-portrait-img">
                        <div class="mgr-gem-badge">${config.gem}</div>
                    </div>
                    <div class="mgr-content-col">
                        <div class="mgr-top-row">
                            <div class="mgr-title-group">
                                <div class="mgr-title">${tObj.names[type]}</div>
                                <div class="mgr-stars">${starsHtml}</div>
                                <div class="mgr-lvl-badge">${translations[lang].levelAbbr || 'Lv'} ${level}</div>
                            </div>
                            <div class="mgr-hex-icon"><div class="hex-inner">💎</div></div>
                        </div>
                        <div class="mgr-stats-list">
                            <div class="mgr-stat-pill">
                                <div class="mgr-stat-val">${mData.stat1Val}</div>
                                <div class="mgr-stat-label-group">
                                    <span class="mgr-stat-label">${stat1Lbl}</span>
                                    <div class="mgr-stat-icon-circle">${icon1}</div>
                                </div>
                            </div>
                            <div class="mgr-stat-pill">
                                <div class="mgr-stat-val">${mData.stat2Val}</div>
                                <div class="mgr-stat-label-group">
                                    <span class="mgr-stat-label">${stat2Lbl}</span>
                                    <div class="mgr-stat-icon-circle">${icon2}</div>
                                </div>
                            </div>
                        </div>
            `;

            // Action button
            let actionBtnHtml = '';
            if (!isHired) {
                actionBtnHtml = `
                    <button class="buy-btn buy-mgr-btn mgr-buy-btn ${canBuy ? '' : 'disabled'}" data-mgr="${type}" ${canBuy ? '' : 'disabled'} aria-label="${statLabels[lang].hireBtn} ${tObj.names[type]} — ${formatMoney(cost)}">
                        ${statLabels[lang].hireBtn}<br>${formatMoney(cost)}
                    </button>
                `;
            } else if (level < 5) {
                const details = game.getBulkUpgradeDetails('manager', type, currentUpgradeMode, level, game.state.cash);
                const costToUpgrade = details.cost;
                const canUpgrade = details.canAfford;
                const levelsToBuy = details.levels;
                
                actionBtnHtml = `
                    <button class="buy-btn upgrade-mgr-btn mgr-buy-btn ${canUpgrade ? '' : 'disabled'}" data-mgr-type="${type}" ${canUpgrade ? '' : 'disabled'} aria-label="${statLabels[lang].upgradeBtn} ${tObj.names[type]} — ${formatMoney(costToUpgrade)}">
                        ${statLabels[lang].upgradeBtn}${levelsToBuy > 1 ? ` <span class="upgrade-amount-text">+${levelsToBuy}</span>` : ''}<br>${formatMoney(costToUpgrade)}
                    </button>
                `;
            } else {
                actionBtnHtml = `
                    <div class="mgr-active-badge">
                        ${statLabels[lang].activeLabel} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                `;
            }

            footerHtml = `
                        <div class="mgr-footer-row">
                            <div class="mgr-footer-info">
                                <div class="mgr-footer-lbl">${statLabels[lang].hourlyProfit}</div>
                                <div class="mgr-footer-val-box">
                                    <span class="mgr-footer-val">${isHired ? formatMoney(mData.extraHourly) : formatMoney(0)}</span>
                                    <span class="per-hour-lbl">${statLabels[lang].perHour}</span>
                                </div>
                            </div>
                            ${actionBtnHtml}
                        </div>
                    </div>
                </div>
            `;
        }

        card.innerHTML = bodyHtml + footerHtml;
        grid.appendChild(card);
    });

    // Add Hired/Upgrade Event Listeners
    container.querySelectorAll('.buy-mgr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            initSound();
            const type = btn.getAttribute('data-mgr');
            const beforeCash = game.state.cash;
            const beforeHired = game.state.managers[type];

            game.hireManager(type);

            // Discovery tip on first manager hire
            if (!beforeHired && game.state.managers[type] && typeof window.showDiscoveryTip === 'function') {
                window.showDiscoveryTip('manager');
            }

            handlePurchaseFeedback(btn, e, beforeCash, beforeHired, 'hire-manager', type);
            renderManagersTab();
        });
    });

    container.querySelectorAll('.upgrade-mgr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            initSound();
            const type = btn.getAttribute('data-mgr-type');
            const beforeCash = game.state.cash;
            const beforeLevel = game.state.managerUpgrades[type] ? game.state.managerUpgrades[type].level : 1;

            game.upgradeManagerBulk(type, currentUpgradeMode);

            handlePurchaseFeedback(btn, e, beforeCash, beforeLevel, 'upgrade-manager', type);
            updateButtonAffordability();
        });
    });
}

// Helper to get SVG icon for a department
function getDepartmentIconSvg(id, isUnlocked) {
    const shadow = isUnlocked ? 'filter: drop-shadow(0 0 8px rgba(223, 171, 41, 0.75)) brightness(1.15);' : 'filter: grayscale(1) opacity(0.3);';
    const size = 44;
    const strokeAttr = isUnlocked ? 'stroke="rgba(255, 223, 128, 0.5)" stroke-width="0.6" stroke-linejoin="round"' : '';
    
    switch(id) {
        case 0: // Basic Teller Services (Cash Register)
            return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#goldGrad-${id})" ${strokeAttr} style="${shadow}">
                <defs>
                    <linearGradient id="goldGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f5cf6d" />
                        <stop offset="50%" stop-color="#dfab29" />
                        <stop offset="100%" stop-color="#9a7211" />
                    </linearGradient>
                </defs>
                <path d="M4 17h16v3H4v-3zm2-8h12v7H6v-7zm1-5h10v3H7V5zM9 11h2v2H9v-2zm4 0h2v2h-2v-2zm-4 3h2v2H9v-2zm4 0h2v2h-2v-2z" />
            </svg>`;
        case 1: // Loans & Mortgages (Document + House)
            return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#goldGrad-${id})" ${strokeAttr} style="${shadow}">
                <defs>
                    <linearGradient id="goldGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f5cf6d" />
                        <stop offset="50%" stop-color="#dfab29" />
                        <stop offset="100%" stop-color="#9a7211" />
                    </linearGradient>
                </defs>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v-2zm0-4H8v-2h8v-2zm-3-5V3.5L17.5 8H13z" />
                <path d="M16 16.5l3.5-3 3.5 3v4.5h-7v-4.5z" />
            </svg>`;
        case 2: // VIP Private Banking (Crown)
            return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#goldGrad-${id})" ${strokeAttr} style="${shadow}">
                <defs>
                    <linearGradient id="goldGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f5cf6d" />
                        <stop offset="50%" stop-color="#dfab29" />
                        <stop offset="100%" stop-color="#9a7211" />
                    </linearGradient>
                </defs>
                <path d="M2 4l4 6 6-7 6 7 4-6-2 13H4L2 4zm2 15h16v2H4v-2z" />
            </svg>`;
        case 3: // Stocks & Crypto (Bar Chart + Trend line)
            return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#goldGrad-${id})" ${strokeAttr} style="${shadow}">
                <defs>
                    <linearGradient id="goldGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f5cf6d" />
                        <stop offset="50%" stop-color="#dfab29" />
                        <stop offset="100%" stop-color="#9a7211" />
                    </linearGradient>
                </defs>
                <path d="M4 16h3v5H4v-5zm5-6h3v11H9V10zm5-4h3v15h-3V6zm5-4h3v19h-3V2z" />
                <path d="M2 11l6-6 4 3 8-8h-4V1h6v6h-1l-9 9-4-3-7 7z" />
            </svg>`;
        case 4: // Creative Tax Planning (Bank Building)
            return `
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="url(#goldGrad-${id})" ${strokeAttr} style="${shadow}">
                <defs>
                    <linearGradient id="goldGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f5cf6d" />
                        <stop offset="50%" stop-color="#dfab29" />
                        <stop offset="100%" stop-color="#9a7211" />
                    </linearGradient>
                </defs>
                <path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z" />
            </svg>`;
        default:
            return '';
    }
}

// Dynamic builder for Departments Tab
function renderDepartmentsTab() {
    const container = document.getElementById('tab-departments');
    if (!container) return;
    container.innerHTML = '';

    const lang = game.state.language || 'en';
    const tObj = translations[lang].departments;
    game.state.departments.forEach((d) => {
        const isUnlocked = d.unlocked;
        const canBuy = game.state.cash >= d.cost;
        
        const card = document.createElement('div');
        card.className = `upgrade-card department-card feature-card ${isUnlocked ? 'active' : 'locked'}`;

        const reward = game.getDepartmentReward(d.id);
        const iconSvg = getDepartmentIconSvg(d.id, isUnlocked);

        const activeBadgeHtml = isUnlocked ? `
            <span class="dept-active-badge">
                <span class="badge-dot"></span>
                <span>${translations[lang].activeLabel || 'Active'}</span>
            </span>
        ` : '';

        const baseProfitHtml = `
            <div class="dept-stat-item">
                <span class="dept-stat-label">${translations[lang].departments.descLabel}:</span>
                <div class="dept-stat-value-box">
                    <span>${formatMoney(d.baseReward)}</span>
                </div>
            </div>
        `;
        const adjustedProfitHtml = isUnlocked ? `
            <div class="dept-stat-item">
                <span class="dept-stat-label">${translations[lang].departments.statsLabel}:</span>
                <div class="dept-stat-value-box">
                    <span>${formatMoney(reward)}</span>
                </div>
            </div>
        ` : '';

        let actionBtnHtml = '';
        if (!isUnlocked) {
            actionBtnHtml = `
                <button class="dept-action-btn buy-btn ${canBuy ? '' : 'disabled'}" data-dept-idx="${d.id}" ${canBuy ? '' : 'disabled'}>
                    <span class="btn-arrow">▲</span>
                    <span class="btn-lbl">${tObj.unlock}</span>
                    <span class="btn-cost">${formatMoney(d.cost)}</span>
                </button>
            `;
        } else {
            actionBtnHtml = `
                <div class="max-jewel-container">
                    <div class="max-jewel">
                        <div class="jewel-content">
                            <div class="jewel-check">✓</div>
                            <div class="jewel-text">MAX</div>
                        </div>
                    </div>
                    <div class="max-jewel-label">${(statLabels[lang] || statLabels.en).maxLabel}</div>
                </div>
            `;
        }

        const titleShieldHtml = isUnlocked ? `<span class="dept-title-shield"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polygon points="12 8 13.5 10.5 16 11 14 13 14.5 15.5 12 14.5 9.5 15.5 10 13 8 11 10.5 10.5 12 8" fill="currentColor" stroke="none"/></svg></span>` : '';

        card.innerHTML = `
            <div class="dept-card-body">
                <div class="dept-icon-frame">
                    <div class="dept-ring dept-ring-1"></div>
                    <div class="dept-ring dept-ring-2"></div>
                    <div class="dept-ring dept-ring-3"></div>
                    <div class="dept-icon-content">
                        ${iconSvg}
                    </div>
                </div>
                <div class="dept-details">
                    <div class="dept-title-row">
                        ${titleShieldHtml}
                        <span class="dept-title-text">${tObj.names[d.id]}</span>
                        ${activeBadgeHtml}
                    </div>
                    <div class="dept-stats-row">
                        ${baseProfitHtml}
                        ${adjustedProfitHtml}
                    </div>
                </div>
            </div>
            <div class="dept-card-divider"></div>
            <div class="dept-card-action">
                ${actionBtnHtml}
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.dept-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('disabled') || btn.disabled) return;
            initSound();
            const idx = parseInt(btn.getAttribute('data-dept-idx'));
            const beforeCash = game.state.cash;
            const dept = game.state.departments.find(d => d.id === idx);
            const beforeUnlocked = dept ? dept.unlocked : false;

            game.unlockDepartment(idx);

            // Discovery tip on first department unlock
            if (!beforeUnlocked && typeof window.showDiscoveryTip === 'function') {
                window.showDiscoveryTip('dept');
            }

            handlePurchaseFeedback(btn, e, beforeCash, beforeUnlocked, 'unlock-dept', idx);
            renderDepartmentsTab();
        });
    });
}

// Dynamic builder for Branches / Prestige Tab
function renderBranchesTab() {
    const container = document.getElementById('tab-branches');
    if (!container) return;
    let hash = null;
    try {
        hash = JSON.stringify({
            currentBranch: game.state.currentBranch,
            shares: game.state.shares,
            cash: Math.floor(game.state.cash / 1000)
        });
    } catch (e) { /* render unconditionally on serialization error */ }
    if (hash && hash === _lastBranchesHash) return;
    _lastBranchesHash = hash;
    _buyBtnCache = null;
    container.innerHTML = '';

    const lang = game.state.language || 'en';
    const tObj = translations[lang].branches;
    const sharesGained = game.calculatePrestigeShares();
    const canPrestige = game.state.cash >= game.branches[game.state.currentBranch].minCashToPrestige;
    const currentReq = game.branches[game.state.currentBranch].minCashToPrestige;

    const percent = Math.round((0.05 + (game.state.goldUpgrades.shareEfficiency || 0) * 0.01) * 100);
    const dynamicBoostText = tObj.prestigeBoost.replace('5%', `${percent}%`).replace('+5%', `+${percent}%`);

    const prestigeCard = document.createElement('div');
    prestigeCard.className = 'prestige-panel';
    prestigeCard.innerHTML = `
        <div class="prestige-title">${tObj.prestigeTitle}</div>
        <div class="prestige-description">
            ${tObj.prestigeDesc}
            <br>
            <span style="color: var(--primary-gold)">${dynamicBoostText}</span>
        </div>
        
        <div class="prestige-showcase-box">
            <div class="prestige-particle"></div>
            <div class="prestige-particle"></div>
            <div class="prestige-particle"></div>
            <div class="prestige-particle"></div>
            <div class="showcase-label">${tObj.prestigeRewardLabel}</div>
            <div class="showcase-value">${tObj.prestigeRewardValue(sharesGained)}</div>
        </div>

        <button class="prestige-beveled-btn main-prestige-btn ${canPrestige ? '' : 'disabled'}" id="main-prestige-btn" ${canPrestige ? '' : 'disabled="true"'}>
            ${tObj.sellAndBuild}
        </button>
        <div class="prestige-btn-subtext">
            ${typeof tObj.prestigeMinLabel === 'function' ? tObj.prestigeMinLabel(formatMoney(currentReq)) : formatMoney(currentReq)}
        </div>
    `;
    container.appendChild(prestigeCard);

    // Branch Carousel
    game.branches.forEach((b, idx) => {
        const isCurrent = game.state.currentBranch === idx;
        const isSold = idx < game.state.currentBranch;
        const isNext = idx === game.state.currentBranch + 1;
        
        const card = document.createElement('div');
        card.className = `branch-card bg-branch-${idx} ${isCurrent ? 'current' : ''}`;
        
        let actionBtnHtml = '';
        if (!isSold) {
            const btnClass = isCurrent ? 'branch-action-btn solid-gold' : 'branch-action-btn ghost-gold';
            actionBtnHtml = `
                <button class="${btnClass}">
                    ${translations[lang].branches.sellAndBuild.replace('!', '')}
                </button>
            `;
        }

        const requirementText = isSold ? translations[lang].branches.sold : `${translations[lang].branches.minCash(formatMoney(b.minCashToPrestige))}`;
        const statusPillHtml = isCurrent ? `
            <div class="branch-status-pill">
                <span class="pulse-dot"></span>
                <span>${translations[lang].branches.active.replace(' 🏛', '')}</span>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="branch-card-right">
                <div class="branch-header-row">
                    <div class="branch-nav-arrow-icon" dir="ltr"><i class="fas fa-chevron-right"></i></div>
                    <div class="branch-name">${tObj.names[idx]}</div>
                </div>
                <div class="branch-desc">${tObj.descs[idx] || b.desc}</div>
                <div class="branch-req-row">
                    <span class="crown-icon">👑</span>
                    <span class="branch-req-text">${requirementText}</span>
                </div>
                ${statusPillHtml}
            </div>
            <div class="branch-card-left">
                <div class="multiplier-glass-badge">
                    <div class="mult-val">${b.baseMultiplier}x</div>
                    <div class="mult-lbl">${translations[lang].multiplier}</div>
                </div>
                <div class="branch-action-wrapper">
                    ${actionBtnHtml}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Bind Prestige Button
    const presBtns = container.querySelectorAll('[data-prestige-branch]');
    presBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentCanPrestige = game.state.cash >= game.branches[game.state.currentBranch].minCashToPrestige;
            if (!currentCanPrestige) return;
            initSound();
            const target = parseInt(btn.getAttribute('data-prestige-branch'));
            openPrestigeModal(target);
        });
    });

    // Bind Main Prestige Button (restating current branch)
    const mainPresBtn = container.querySelector('#main-prestige-btn');
    if (mainPresBtn) {
        mainPresBtn.addEventListener('click', () => {
            const currentCanPrestige = game.state.cash >= game.branches[game.state.currentBranch].minCashToPrestige;
            if (!currentCanPrestige) return;
            initSound();
            openPrestigeModal(game.state.currentBranch);
        });
    }

    // Bind Go Back Button
    const goBtns = container.querySelectorAll('[data-go-branch]');
    goBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            initSound();
            const target = parseInt(btn.getAttribute('data-go-branch'));
            prevCustomerQueueString = '';
            prevTellerClientStates = {};
            game.travelToBranch(target);
            refreshAllTabs();
        });
    });

    // Golden Upgrades Shop Section
    const goldShopSection = document.createElement('div');
    goldShopSection.className = 'gold-shop-panel';
    
    const goldUpgradesKeys = ['startingCash', 'guardSpeed', 'premiumYield', 'shareEfficiency', 'offlineEarnings', 'tellerCapacityBoost', 'vaultCapacityBoost', 'eventBonus', 'managerDiscount'];
    let goldCardsHtml = '';
    
    const iconMapping = {
        startingCash: 'תמונות/gold-chest.png',
        guardSpeed: 'תמונות/gold-truck.png',
        premiumYield: 'תמונות/gold-vip.png',
        shareEfficiency: 'תמונות/gold-bars.png',
        offlineEarnings: 'תמונות/vault.png',
        tellerCapacityBoost: 'תמונות/manager-4.png',
        vaultCapacityBoost: 'תמונות/vault-door.png',
        eventBonus: 'תמונות/client-9.png',
        managerDiscount: 'תמונות/manager-1.png'
    };
    
    goldUpgradesKeys.forEach(key => {
        const currentLvl = (game.state.goldUpgrades && game.state.goldUpgrades[key]) ? game.state.goldUpgrades[key] : 0;
        const upgradeData = translations[lang].goldUpgrades[key];
        let maxLvl = 5;
        const cost = game.getGoldUpgradeCost(key);
        let desc = '';
        
        if (key === 'startingCash') {
            maxLvl = 4;
            const startingCashOptions = GAME_CONFIG.STARTING_CASH_OPTIONS;
            const nextVal = startingCashOptions[currentLvl + 1] || startingCashOptions[startingCashOptions.length - 1];
            desc = upgradeData.desc(currentLvl, nextVal);
        } else if (key === 'guardSpeed' || key === 'premiumYield' || key === 'offlineEarnings' || key === 'tellerCapacityBoost' || key === 'vaultCapacityBoost' || key === 'eventBonus') {
            maxLvl = 5;
            desc = upgradeData.desc(currentLvl);
        } else if (key === 'shareEfficiency' || key === 'managerDiscount') {
            maxLvl = 4;
            desc = upgradeData.desc(currentLvl);
        }
        
        const isMax = currentLvl >= maxLvl;
        const canAfford = game.state.shares >= cost;
        const iconSrc = iconMapping[key];
        
        goldCardsHtml += `
            <div class="gold-upgrade-card">
                ${isMax ? `<div class="gold-max-badge">MAX</div>` : ''}
                <div class="gold-card-right">
                    <img class="gold-big-illustration" src="${iconSrc}" alt="${upgradeData.title}">
                </div>
                <div class="gold-card-middle">
                    <div class="gold-upgrade-title">${upgradeData.title}</div>
                    <div class="gold-upgrade-desc">${desc}</div>
                    <div class="gold-upgrade-action-row">
                        <span class="gold-level-pill ${isMax ? 'max' : ''}">
                            ${currentLvl}/${maxLvl}
                            ${isMax ? `<span class="gold-checkmark">✔</span>` : ''}
                        </span>
                        ${isMax ? `
                            <span style="background: rgba(223,171,41,0.15); color: var(--gold-light); border: 1px solid rgba(223,171,41,0.3); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem;">MAX</span>
                        ` : `
                            <button class="buy-btn ${canAfford ? '' : 'disabled'} buy-gold-btn" data-gold-up="${key}" ${canAfford ? '' : 'disabled'}>
                                ${cost} 🪙
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    });
    
    const startingCashLvl = (game.state.goldUpgrades && game.state.goldUpgrades.startingCash) ? game.state.goldUpgrades.startingCash : 0;
    const startingCashOptions = GAME_CONFIG.STARTING_CASH_OPTIONS;
    const startingCashVal = startingCashOptions[startingCashLvl] || startingCashOptions[0];
    
    const premiumYieldLvl = (game.state.goldUpgrades && game.state.goldUpgrades.premiumYield) ? game.state.goldUpgrades.premiumYield : 0;
    const branchProfitsPct = premiumYieldLvl * 10;
    
    const guardSpeedLvl = (game.state.goldUpgrades && game.state.goldUpgrades.guardSpeed) ? game.state.goldUpgrades.guardSpeed : 0;
    const courierSpeedPct = guardSpeedLvl * 10;
    
    const prestigeBonusPct = Math.round((game.getPrestigeMultiplier() - 1) * 100);

    const tTotalEffect = translations[lang].goldTotalEffect || translations.en.goldTotalEffect;
    const tBranchProfits = translations[lang].goldBranchProfits || translations.en.goldBranchProfits;
    const tCourierSpeed = translations[lang].goldCourierSpeed || translations.en.goldCourierSpeed;
    const tStartingCapital = translations[lang].goldStartingCapital || translations.en.goldStartingCapital;
    
    let grandBonusHtml = '';
    if (typeof translations[lang].goldGrandBonus === 'function') {
        grandBonusHtml = translations[lang].goldGrandBonus(prestigeBonusPct);
    } else {
        grandBonusHtml = translations.en.goldGrandBonus(prestigeBonusPct);
    }

    const summaryPanelHtml = `
        <div class="gold-summary-box">
            <div class="gold-summary-title">📈 ${tTotalEffect}</div>
            <div class="gold-summary-grid">
                <div class="gold-stat-box">
                    <span class="gold-stat-val">+${branchProfitsPct}%</span>
                    <span class="gold-stat-desc">${tBranchProfits}</span>
                </div>
                <div class="gold-stat-box">
                    <span class="gold-stat-val">+${courierSpeedPct}%</span>
                    <span class="gold-stat-desc">${tCourierSpeed}</span>
                </div>
                <div class="gold-stat-box">
                    <span class="gold-stat-val">${formatMoney(startingCashVal)}</span>
                    <span class="gold-stat-desc">${tStartingCapital}</span>
                </div>
            </div>
            <div class="gold-grand-bonus-row">
                ${grandBonusHtml}
            </div>
        </div>
    `;
    
    goldShopSection.innerHTML = `
        <div class="prestige-title" style="margin-top: 1.5rem; border-top: 1px dashed var(--border-color); padding-top: 1.5rem;">${translations[lang].goldShopTitle}</div>
        <p class="prestige-description" style="margin-bottom: 1rem;">${translations[lang].goldShopDesc}</p>
        <div class="gold-upgrades-grid">
            ${goldCardsHtml}
        </div>
        ${summaryPanelHtml}
    `;
    
    container.appendChild(goldShopSection);
    
    // Bind Gold Upgrade Buttons
    container.querySelectorAll('.buy-gold-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            initSound();
            const key = btn.getAttribute('data-gold-up');
            game.buyGoldUpgrade(key);
            renderBranchesTab();
        });
    });
}

// Dynamic builder for Missions Tab
function renderMissionsTab() {
    const container = document.getElementById('tab-missions');
    if (!container) return;
    container.innerHTML = '';

    const lang = game.state.language || 'en';
    const tObj = translations[lang].missions;
    const rootT = translations[lang];
    const completedCount = game.state.missionsCompleted || 0;
    
    // Top Board Pannel (Brushed Silver with Gold Border)
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'missions-summary-header';
    summaryHeader.innerHTML = `
        <div class="summary-badge">
            <span class="trophy-icon">🏆</span>
            <span>${translations[lang].missionCompletedTitle}: ${completedCount}</span>
        </div>
        <p class="summary-desc">${translations[lang].missionCompletedDesc}</p>
    `;
    container.appendChild(summaryHeader);

    // Render active missions (now up to 5) - sorted so completed but unclaimed missions bubble to the top
    const sortedMissions = [...game.state.missions].sort((a, b) => {
        const aReady = a.completed && !a.claimed;
        const bReady = b.completed && !b.claimed;
        if (aReady && !bReady) return -1;
        if (!aReady && bReady) return 1;
        return 0;
    });
    sortedMissions.forEach(m => {
        const card = document.createElement('div');
        card.className = `mission-card ${m.completed ? 'completed' : ''}`;

        const targetVal = m.target || 1;
        const progressVal = m.progress || 0;
        const percent = Math.min(100, (progressVal / targetVal) * 100);

        // Resolve titleKey for mapping legacy/game structure to locales
        let titleKey = m.type;
        if (m.type === 'upgrade_teller') titleKey = 'teller';
        else if (m.type === 'upgrade_guard') titleKey = 'guard';
        else if (m.type === 'upgrade_vault') titleKey = 'vault';
        else if (m.type === 'accumulate_cash') titleKey = 'cash';

        const title = tObj[titleKey + "Title"] || tObj.defaultTitle;
        let progressDesc = '';
        const descFn = tObj[titleKey + "Desc"] || tObj.defaultDesc;
        if (typeof descFn === 'function') {
            if (m.type === 'earn_eps' || m.type === 'accumulate_cash' || m.type === 'earn_cash' || m.type === 'boost_run') {
                progressDesc = descFn(formatMoney(m.target));
            } else if (m.type === 'upgrade_teller' || m.type === 'upgrade_guard') {
                progressDesc = descFn(m.target, (m.targetId !== undefined ? m.targetId + 1 : 1));
            } else if (m.type === 'department_grind') {
                progressDesc = descFn(m.target, m.targetId);
            } else {
                progressDesc = descFn(m.target);
            }
        } else {
            progressDesc = descFn;
        }

        // 3D Illustration Mapping
        const imgMap = {
            'clients': './תמונות/client-10.png',
            'accumulate_cash': './תמונות/gold-chest.png',
            'upgrade_teller': './תמונות/teller-7.png',
            'upgrade_guard': './תמונות/guard_circle.png',
            'upgrade_vault': './תמונות/vault.png',
            'unlock_departments': './תמונות/gold-truck.png',
            'hire_managers': './תמונות/manager_circle.png',
            'earn_eps': './תמונות/eps_circle.png',
            'earn_cash': './תמונות/gold-bars.png',
            'serve_rich_vip': './תמונות/client-6.png',
            'vip_marathon': './תמונות/gold-vip.png',
            'vip_collector': './תמונות/gold-vip.png',
            'department_unlock': './תמונות/gold-truck.png',
            'upgrade_managers': './תמונות/manager_circle.png',
            'manager_hire': './תמונות/manager_circle.png',
            'break_the_wall': './תמונות/manager-7.png',
            'upgrade_arrows': './תמונות/upgrade-arrows.png',
            'guard_trips': './תמונות/guard_circle.png',
            'all_managers': './תמונות/manager_circle.png',
            'department_grind': './תמונות/manager-1.png',
            'missions_veteran': './תמונות/gold-chest.png',
            'boost_run': './תמונות/boost_run_circle.png'
        };
        const imgSrc = imgMap[m.type] || './תמונות/icon.png';

        let rewardAmtHtml = '';
        if (m.reward && typeof m.reward === 'object' && m.reward.type) {
            const shareLbl = rootT.sharesLabel || 'Gold Shares';
            rewardAmtHtml = `<span class="claim-reward-amount">+${m.reward.amount} ${shareLbl} 🪙</span>`;
        } else {
            rewardAmtHtml = `<span class="claim-reward-amount">+${formatMoney(m.reward)} 💰</span>`;
        }

        let actionZoneHtml = '';
        if (m.completed && !m.claimed) {
            actionZoneHtml = `
            <div class="mission-action-zone">
                <button class="claim-reward-btn" data-mission-id="${m.id}">
                    ${rootT.claimReward || 'Claim!'}
                    ${rewardAmtHtml}
                </button>
            </div>
            `;
        }

        // Resolve reward display (may be cash number or {type,amount} object)
        let rewardBadgeHtml = '';
        if (m.reward && typeof m.reward === 'object' && m.reward.type) {
            const shareLbl = rootT.sharesLabel || 'Gold Shares';
            rewardBadgeHtml = `<span>${rootT.rewardLabel || 'Reward:'} +${m.reward.amount} ${shareLbl} 🪙</span>`;
        } else {
            rewardBadgeHtml = `<span>${rootT.profitLabel || 'Profit:'} +${formatMoney(m.reward)} 💰</span>`;
        }

        const circleRadius = 24;
        const circleCircumference = 2 * Math.PI * circleRadius;
        const strokeDashoffset = circleCircumference - (percent / 100) * circleCircumference;

        card.innerHTML = `
            <div class="mission-reward-badge">
                ${rewardBadgeHtml}
            </div>
            ${actionZoneHtml}
            <div class="mission-image-box">
                <div class="mission-image-glow"></div>
                <img class="mission-illustration" src="${imgSrc}" alt="" />
            </div>
            <div class="mission-content-middle">
                <div class="mission-details">
                    <div class="mission-title">${title}</div>
                    <div class="mission-desc">${progressDesc}</div>
                </div>
                <div class="mission-progress-row">
                    <div class="mission-progress-outer">
                        <div class="mission-progress-bar" style="width: ${percent}%"></div>
                        <div class="progress-text-overlay">
                            ${['earn_eps','accumulate_cash','earn_cash','boost_run'].includes(m.type) ? formatMoney(progressVal) : progressVal}
                            /
                            ${['earn_eps','accumulate_cash','earn_cash','boost_run'].includes(m.type) ? formatMoney(targetVal) : targetVal}
                        </div>
                    </div>
                </div>
            </div>
            <div class="mission-circle-progress">
                <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle class="circle-bg" cx="32" cy="32" r="${circleRadius}" stroke-width="5" fill="none" />
                    <circle class="circle-value" cx="32" cy="32" r="${circleRadius}" stroke-width="5" fill="none" stroke-dasharray="${circleCircumference}" stroke-dashoffset="${strokeDashoffset}" />
                </svg>
                <div class="circle-text">${Math.round(percent)}%</div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.claim-reward-btn')) {
                return;
            }
            handleMissionRedirect(m.type, m.targetId);
        });

        container.appendChild(card);
    });

    container.querySelectorAll('.claim-reward-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window._isClaimingMission) return;
            window._isClaimingMission = true;
            setTimeout(() => { window._isClaimingMission = false; }, 500);

            initSound();
            const missionId = btn.getAttribute('data-mission-id');
            const collected = game.claimMissionReward(missionId);
            if (collected && collected.type !== 'none' && collected.amount > 0) {
                btn.disabled = true;
                const rectBtn = btn.getBoundingClientRect();
                if (collected.type === 'cash') {
                    const rectCashBox = document.getElementById('stat-cash').getBoundingClientRect();
                    animateCoins(rectBtn, rectCashBox, 10, 'cash_silent');
                    spawnFloating('+' + formatMoney(collected.amount), rectBtn.left + rectBtn.width/2, rectBtn.top, 'green', '2.2rem');
                } else {
                    // shares / gold reward
                    const rectSharesBox = document.getElementById('stat-shares');
                    if (rectSharesBox) {
                        const rectShares = rectSharesBox.getBoundingClientRect();
                        animateCoins(rectBtn, rectShares, collected.amount, 'gold');
                    }
                    const lang = (game.state && game.state.language) || 'en';
                    const shareLbl = (translations[lang] || translations.en).sharesLabel || 'Gold Shares';
                    spawnFloating('+' + collected.amount + ' ' + shareLbl + ' 🪙', rectBtn.left + rectBtn.width/2, rectBtn.top, 'gold', '2.2rem');
                }

                if (window.gameAudio && typeof window.gameAudio.playUnlock === 'function') {
                    window.gameAudio.playUnlock();
                }

                renderMissionsTab();
            }
        });
    });
}

// Fires coin/float/sound feedback for achievements unlocked on a live tick (never for the silent
// load-time backfill). Called from ui-events.js's tabRefreshTimer right after game.checkAchievements().
function playAchievementUnlockFeedback(achievement) {
    const targetEl = document.getElementById('eps-value-container') || document.getElementById('stat-cash');
    const toRect = targetEl ? targetEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const cardEl = document.querySelector(`.achievement-card[data-achievement-id="${achievement.id}"]`);
    const fromRect = cardEl ? cardEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };

    animateCoins(fromRect, toRect, 8, 'gold');
    spawnFloating('🏆 +' + (achievement.bonusPercent * 100).toFixed(2).replace(/\.?0+$/, '') + '%', fromRect.left + fromRect.width / 2, fromRect.top, 'gold', '2.2rem');
    if (window.gameAudio && typeof window.gameAudio.playUnlock === 'function') {
        window.gameAudio.playUnlock();
    }
}

function renderAchievementsTab() {
    const container = document.getElementById('tab-achievements');
    if (!container) return;
    container.innerHTML = '';

    const lang = game.state.language || 'en';
    const tObj = translations[lang].achievements || {};
    const rootT = translations[lang];
    const unlocked = (game.state.achievements && game.state.achievements.unlocked) || {};
    const claimed = (game.state.achievements && game.state.achievements.claimed) || {};
    const bonusPercent = (game.state.achievements && game.state.achievements.bonusPercent) || 0;
    const unlockedCount = GAME_CONFIG.ACHIEVEMENTS.filter(a => unlocked[a.id]).length;
    const totalCount = GAME_CONFIG.ACHIEVEMENTS.length;

    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'missions-summary-header achievements-summary-header';
    summaryHeader.innerHTML = `
        <div class="summary-badge">
            <span class="trophy-icon">🏆</span>
            <span>${rootT.achievementsCompletedTitle || 'Achievements'}: ${unlockedCount}/${totalCount}</span>
        </div>
        <p class="summary-desc">${rootT.achievementsCompletedDesc || ''} (+${(bonusPercent * 100).toFixed(2).replace(/\.?0+$/, '')}%)</p>
    `;
    container.appendChild(summaryHeader);

    // Sort: ready-to-claim (unlocked & unclaimed) bubble to the top, locked stay in natural
    // config order in the middle, already-claimed sink to the bottom and out of the way.
    const sortPriority = (a) => {
        if (unlocked[a.id] && !claimed[a.id]) return 0;
        if (!unlocked[a.id]) return 1;
        return 2;
    };
    const sortedAchievements = [...GAME_CONFIG.ACHIEVEMENTS].sort((a, b) => sortPriority(a) - sortPriority(b));

    const cashCategories = ['cash'];
    sortedAchievements.forEach(a => {
        const isUnlocked = !!unlocked[a.id];
        const isClaimed = !!claimed[a.id];
        const progress = game.getAchievementProgress(a.id);

        const card = document.createElement('div');
        card.className = `achievement-card mission-card ${isUnlocked ? 'unlocked' : ''} ${isClaimed ? 'claimed' : ''}`;
        card.setAttribute('data-achievement-id', a.id);

        const title = tObj[a.i18nKey + 'Title'] || a.id;
        const descFn = tObj[a.i18nKey + 'Desc'];
        const targetDisplay = cashCategories.includes(a.category) ? formatMoney(a.threshold) : a.threshold;
        const desc = typeof descFn === 'function' ? descFn(targetDisplay) : (descFn || '');

        const circleRadius = 24;
        const circleCircumference = 2 * Math.PI * circleRadius;
        const strokeDashoffset = circleCircumference - (progress.percent / 100) * circleCircumference;

        const progressCurrentDisplay = cashCategories.includes(a.category) ? formatMoney(progress.current) : progress.current;
        const shareLbl = rootT.sharesLabel || 'Gold Shares';

        let statusHtml;
        if (isUnlocked && !isClaimed) {
            statusHtml = `
                <div class="mission-action-zone">
                    <button class="claim-achievement-btn" data-achievement-id="${a.id}">
                        ${rootT.claimReward || 'Claim!'}
                        <span class="claim-reward-amount">+${a.rewardShares} ${shareLbl} 🪙</span>
                    </button>
                </div>`;
        } else if (isUnlocked && isClaimed) {
            statusHtml = `<div class="achievement-unlocked-badge">✓ +${(a.bonusPercent * 100).toFixed(2).replace(/\.?0+$/, '')}%</div>`;
        } else {
            statusHtml = `<div class="mission-progress-row">
                   <div class="mission-progress-outer">
                       <div class="mission-progress-bar" style="width: ${progress.percent}%"></div>
                       <div class="progress-text-overlay">${progressCurrentDisplay} / ${targetDisplay}</div>
                   </div>
               </div>`;
        }

        const rewardBadgeHtml = (isUnlocked && !isClaimed)
            ? `<div class="mission-reward-badge"><span>+${a.rewardShares} ${shareLbl} 🪙</span></div>`
            : '';

        card.innerHTML = `
            ${rewardBadgeHtml}
            <div class="mission-image-box achievement-icon-box">
                <div class="mission-image-glow"></div>
                <span class="achievement-icon">${a.icon}</span>
            </div>
            <div class="mission-content-middle">
                <div class="mission-details">
                    <div class="mission-title">${title}</div>
                    <div class="mission-desc">${desc}</div>
                </div>
                ${statusHtml}
            </div>
            <div class="mission-circle-progress">
                <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle class="circle-bg" cx="32" cy="32" r="${circleRadius}" stroke-width="5" fill="none" />
                    <circle class="circle-value" cx="32" cy="32" r="${circleRadius}" stroke-width="5" fill="none" stroke-dasharray="${circleCircumference}" stroke-dashoffset="${isUnlocked ? 0 : strokeDashoffset}" />
                </svg>
                <div class="circle-text">${isUnlocked ? '✓' : Math.round(progress.percent) + '%'}</div>
            </div>
        `;

        container.appendChild(card);
    });

    container.querySelectorAll('.claim-achievement-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window._isClaimingAchievement) return;
            window._isClaimingAchievement = true;
            setTimeout(() => { window._isClaimingAchievement = false; }, 500);

            initSound();
            const achId = btn.getAttribute('data-achievement-id');
            const collected = game.claimAchievementReward(achId);
            if (collected && collected.type !== 'none' && collected.amount > 0) {
                btn.disabled = true;
                const rectBtn = btn.getBoundingClientRect();
                const rectSharesBox = document.getElementById('stat-shares');
                if (rectSharesBox) {
                    animateCoins(rectBtn, rectSharesBox.getBoundingClientRect(), collected.amount, 'gold');
                }
                const lang2 = (game.state && game.state.language) || 'en';
                const shareLbl2 = (translations[lang2] || translations.en).sharesLabel || 'Gold Shares';
                spawnFloating('+' + collected.amount + ' ' + shareLbl2 + ' 🪙', rectBtn.left + rectBtn.width / 2, rectBtn.top, 'gold', '2.2rem');

                if (window.gameAudio && typeof window.gameAudio.playUnlock === 'function') {
                    window.gameAudio.playUnlock();
                }

                renderAchievementsTab();
            }
        });
    });
}

// Refresh all active tabs
function refreshAllTabs() {
    invalidateTabHashes();
    const activeTabEl = document.querySelector('.tab-btn.active');
    const activeTab = activeTabEl ? activeTabEl.getAttribute('data-tab') : 'upgrades';
    if (activeTab === 'upgrades') renderUpgradesTab();
    else if (activeTab === 'managers') renderManagersTab();
    else if (activeTab === 'departments') renderDepartmentsTab();
    else if (activeTab === 'missions') renderMissionsTab();
    else if (activeTab === 'branches') renderBranchesTab();
    else if (activeTab === 'daily') {
        if (typeof window.renderDailyChallengesSection === 'function') window.renderDailyChallengesSection();
        renderAchievementsTab();
    }
    rebuildTellersDOM();
}

// Lightweight inline updater to refresh buy buttons, text and enabled states dynamically without DOM recreation
function updateButtonAffordability() {
    const activeTabEl = document.querySelector('.tab-btn.active');
    if (!activeTabEl) return;
    const activeTab = activeTabEl.getAttribute('data-tab');
    
    if (activeTab === 'upgrades') {
        const container = document.getElementById('tab-upgrades');
        if (!container) return;
        if (!_buyBtnCache) _buyBtnCache = container.querySelectorAll('.buy-btn');
        const buttons = _buyBtnCache;
        buttons.forEach(btn => {
            const type = btn.getAttribute('data-type');
            const id = parseInt(btn.getAttribute('data-id'));
            if (type === 'teller') {
                const t = game.state.tellers[id];
                if (t.unlocked) {
                    const details = game.getBulkUpgradeDetails('teller', id, currentUpgradeMode, t.level, game.state.cash);
                    btn.classList.toggle('disabled', !details.canAfford);
                    btn.disabled = !details.canAfford;
                    
                    if (btn.classList.contains('upg-v2-buy-btn')) {
                        const amtEl = btn.querySelector('.upg-v2-btn-amount');
                        const costEl = btn.querySelector('.upg-v2-btn-cost');
                        if (amtEl) amtEl.innerText = details.levels > 1 ? '+' + details.levels : '';
                        if (costEl) costEl.innerText = formatMoney(details.cost);
                        
                        const card = btn.closest('.premium-upg-card');
                        if (card) {
                            const titleAmtEl = card.querySelector('.upg-v2-level-up');
                            if (titleAmtEl) titleAmtEl.innerText = details.levels > 1 ? '(+' + details.levels + ')' : '';
                            
                            const statVals = card.querySelectorAll('.upg-v2-stat-val');
                            if (statVals.length >= 2) {
                                const capacity = game.getTellerCapacity(t.level);
                                const speed = game.getTellerSpeed(t.level).toFixed(1);
                                const nextCapacity = game.getTellerCapacity(t.level + details.levels);
                                const nextSpeed = game.getTellerSpeed(t.level + details.levels).toFixed(1);
                                statVals[0].innerHTML = speed + ' <span class="arrow">➔</span> ' + nextSpeed;
                                statVals[1].innerHTML = formatMoney(capacity) + ' <span class="arrow">➔</span> ' + formatMoney(nextCapacity);
                                if (statVals[2]) statVals[2].innerHTML = formatMoney(capacity / speed);
                            }
                        }
                    }
                } else {
                    const cost = game.tellerUnlockCosts[id];
                    const canBuy = game.state.cash >= cost;
                    btn.classList.toggle('disabled', !canBuy);
                    btn.disabled = !canBuy;
                }
            } else if (type === 'guard') {
                const g = game.state.guards[id];
                if (g.unlocked) {
                    const details = game.getBulkUpgradeDetails('guard', id, currentUpgradeMode, g.level, game.state.cash);
                    btn.classList.toggle('disabled', !details.canAfford);
                    btn.disabled = !details.canAfford;
                    
                    if (btn.classList.contains('upg-v2-buy-btn')) {
                        const amtEl = btn.querySelector('.upg-v2-btn-amount');
                        const costEl = btn.querySelector('.upg-v2-btn-cost');
                        if (amtEl) amtEl.innerText = details.levels > 1 ? '+' + details.levels : '';
                        if (costEl) costEl.innerText = formatMoney(details.cost);
                        
                        const card = btn.closest('.premium-upg-card');
                        if (card) {
                            const titleAmtEl = card.querySelector('.upg-v2-level-up');
                            if (titleAmtEl) titleAmtEl.innerText = details.levels > 1 ? '(+' + details.levels + ')' : '';
                            
                            const statVals = card.querySelectorAll('.upg-v2-stat-val');
                            if (statVals.length >= 2) {
                                const capacity = game.getGuardCapacity(g.level);
                                const speed = game.getGuardSpeed(g.level).toFixed(1);
                                const nextCapacity = game.getGuardCapacity(g.level + details.levels);
                                const nextSpeed = game.getGuardSpeed(g.level + details.levels).toFixed(1);
                                statVals[0].innerHTML = speed + ' <span class="arrow">➔</span> ' + nextSpeed;
                                statVals[1].innerHTML = formatMoney(capacity) + ' <span class="arrow">➔</span> ' + formatMoney(nextCapacity);
                                if (statVals[2]) statVals[2].innerHTML = formatMoney(capacity / speed);
                            }
                        }
                    }
                } else {
                    const cost = game.guardUnlockCosts[id];
                    const canBuy = game.state.cash >= cost;
                    btn.classList.toggle('disabled', !canBuy);
                    btn.disabled = !canBuy;
                }
            } else if (type === 'vault' || btn.id === 'upgrade-vault-btn') {
                const details = game.getBulkUpgradeDetails('vault', null, currentUpgradeMode, game.state.vault.level, game.state.cash);
                btn.classList.toggle('disabled', !details.canAfford);
                btn.disabled = !details.canAfford;
                if (btn.classList.contains('upg-v2-buy-btn')) {
                    const amtEl = btn.querySelector('.upg-v2-btn-amount');
                    const costEl = btn.querySelector('.upg-v2-btn-cost');
                    if (amtEl) amtEl.innerText = details.levels > 1 ? '+' + details.levels : '';
                    if (costEl) costEl.innerText = formatMoney(details.cost);
                    
                    const card = btn.closest('.premium-upg-card');
                    if (card) {
                        const titleAmtEl = card.querySelector('.upg-v2-level-up');
                        if (titleAmtEl) titleAmtEl.innerText = details.levels > 1 ? '(+' + details.levels + ')' : '';
                        
                        const statVals = card.querySelectorAll('.upg-v2-stat-val');
                        if (statVals.length >= 1) {
                            const capacity = game.getVaultCapacity(game.state.vault.level);
                            const nextCapacity = game.getVaultCapacity(game.state.vault.level + details.levels);
                            statVals[0].innerHTML = formatMoney(capacity) + ' <span class="arrow">➔</span> ' + formatMoney(nextCapacity);
                        }
                    }
                }
            } else if (btn.id === 'upgrade-queue-btn') {
                const details = game.getBulkUpgradeDetails('queue', null, currentUpgradeMode, game.state.queueUpgradeLevel || 1, game.state.cash);
                btn.classList.toggle('disabled', !details.canAfford);
                btn.disabled = !details.canAfford;
                if (btn.classList.contains('upg-v2-buy-btn')) {
                    const amtEl = btn.querySelector('.upg-v2-btn-amount');
                    const costEl = btn.querySelector('.upg-v2-btn-cost');
                    if (amtEl) amtEl.innerText = details.levels > 1 ? '+' + details.levels : '';
                    if (costEl) costEl.innerText = formatMoney(details.cost);
                    
                    const card = btn.closest('.premium-upg-card');
                    if (card) {
                        const titleAmtEl = card.querySelector('.upg-v2-level-up');
                        if (titleAmtEl) titleAmtEl.innerText = details.levels > 1 ? '(+' + details.levels + ')' : '';
                        
                        const statVals = card.querySelectorAll('.upg-v2-stat-val');
                        if (statVals.length >= 1) {
                            const capacity = game.getQueueCapacity(game.state.queueUpgradeLevel || 1);
                            const nextCapacity = game.getQueueCapacity((game.state.queueUpgradeLevel || 1) + details.levels);
                            statVals[0].innerHTML = capacity + ' <span class="arrow">➔</span> ' + nextCapacity;
                        }
                    }
                }
            }
        });
    } else if (activeTab === 'managers') {
        const container = document.getElementById('tab-managers');
        if (!container) return;
        const buttons = container.querySelectorAll('.buy-btn');
        const lang = game.state.language || 'en';
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            const type = btn.getAttribute('data-type') || btn.getAttribute('data-mgr-type');
            if (type) {
                const mgr = game.state.managerUpgrades[type];
                if (mgr) {
                    if (mgr.level >= 5) {
                        renderManagersTab();
                        return;
                    }
                    const isHired = game.state.managers[type];
                    const details = game.getBulkUpgradeDetails('manager', type, currentUpgradeMode, mgr.level, game.state.cash);
                    btn.classList.toggle('disabled', !details.canAfford);
                    btn.disabled = !details.canAfford;
                    const newText = `${translations[lang].upgradeLabel}${details.levels > 1 ? ` <span class="upgrade-amount-text">+${details.levels}</span>` : ''}<br>${formatMoney(details.cost)}`;
                    if (btn.innerHTML !== newText) {
                        btn.innerHTML = newText;
                    }

                    const card = btn.closest('.upgrade-card');
                    if (card) {
                        const lvlBadge = card.querySelector('.mgr-lvl-badge');
                        if (lvlBadge) {
                            lvlBadge.innerText = `${translations[lang].levelAbbr || 'Lv'} ${mgr.level}${details.levels > 1 ? ` (+${details.levels})` : ''}`;
                        }

                        const starsBox = card.querySelector('.mgr-stars-box');
                        if (starsBox) {
                            let starsHtml = '';
                            for (let j = 1; j <= 5; j++) {
                                starsHtml += `<span class="star ${j <= mgr.level ? 'gold-star' : 'gray-star'}">★</span>`;
                            }
                            starsBox.innerHTML = starsHtml;
                        }

                        const statVals = card.querySelectorAll('.mgr-stat-val');
                        if (statVals.length >= 2) {
                            const coefs = GAME_CONFIG.MANAGER_COEFFICIENTS[type];
                            let s1 = '', s2 = '';
                            if (coefs) {
                                if (type === 'customer') {
                                    s1 = `+${Math.round(coefs.spawnIntervalBoost * 100 * mgr.level)}%`;
                                    s2 = `+${Math.round(coefs.incomeBoost * 100 * mgr.level)}%`;
                                } else if (type === 'finance') {
                                    s1 = (statLabels[lang] || statLabels.en).autoText;
                                    s2 = `+${Math.round(coefs.deptIncomeBoost * 100 * mgr.level)}%`;
                                } else if (type === 'operations') {
                                    s1 = `+${Math.round(coefs.guardSpeedBoost * 100 * mgr.level)}%`;
                                    s2 = `+${Math.round(coefs.guardCapBoost * 100 * mgr.level)}%`;
                                } else if (type === 'service') {
                                    s1 = `+${Math.round(coefs.capacityBoost * 100 * mgr.level)}%`;
                                    s2 = `+${Math.round(coefs.epsBoost * 100 * mgr.level)}%`;
                                } else if (type === 'vip') {
                                    s1 = `+${Math.round(coefs.incomeBoost * 100 * mgr.level)}%`;
                                    s2 = `+${Math.round(coefs.prestigeSharesBoost * 100 * mgr.level)}%`;
                                } else if (type === 'marketing') {
                                    s1 = `+${Math.round(coefs.adBoost * 100 * mgr.level)}%`;
                                    s2 = `+${coefs.offlineLimitBoost * mgr.level}`;
                                } else if (type === 'accountant') {
                                    s1 = `+${coefs.offlineLimitBoost * mgr.level}h`;
                                    s2 = `+${Math.round(coefs.offlineIncomeBoost * 100 * mgr.level)}%`;
                                }
                            }
                            statVals[0].innerText = s1;
                            statVals[1].innerText = s2;
                        }

                        const footerVal = card.querySelector('.mgr-footer-val');
                        if (footerVal) {
                            const eps = game.getEarningsPerSecond();
                            let contribution = 0;
                            const coefsFV = GAME_CONFIG.MANAGER_COEFFICIENTS[type];
                            if (isHired && coefsFV && coefsFV.incomeBoost) {
                                contribution = coefsFV.incomeBoost * mgr.level;
                            }
                            const extraHourly = eps * 3600 * contribution;
                            const perHourStr = (statLabels[lang] || statLabels.en).perHour;
                            footerVal.innerText = `${isHired ? formatMoney(extraHourly) : formatMoney(0)} ${perHourStr}`;
                        }
                    }
                }
            } else {
                const mgrType = btn.getAttribute('data-mgr');
                if (mgrType) {
                    const cost = game.managerCosts[mgrType];
                    const canBuy = game.state.cash >= cost;
                    btn.classList.toggle('disabled', !canBuy);
                    btn.disabled = !canBuy;
                }
            }
        }
    } else if (activeTab === 'departments') {
        const container = document.getElementById('tab-departments');
        if (!container) return;
        const buttons = container.querySelectorAll('.buy-btn');
        buttons.forEach(btn => {
            const deptId = parseInt(btn.getAttribute('data-dept-idx'));
            const dept = game.state.departments.find(d => d.id === deptId);
            if (dept && !dept.unlocked) {
                const cost = dept.cost;
                const canBuy = window.game.state.cash >= cost;
                
                if (canBuy) {
                    btn.classList.remove('disabled');
                    btn.removeAttribute('disabled');
                    btn.disabled = false;
                } else {
                    btn.classList.add('disabled');
                    btn.setAttribute('disabled', 'disabled');
                    btn.disabled = true;
                }
            }
        });
    }
}

    // Exports
    window.renderUpgradesTab = renderUpgradesTab;
    window.renderManagersTab = renderManagersTab;
    window.renderDepartmentsTab = renderDepartmentsTab;
    window.renderBranchesTab = renderBranchesTab;
    window.renderMissionsTab = renderMissionsTab;
    window.renderAchievementsTab = renderAchievementsTab;
    window.playAchievementUnlockFeedback = playAchievementUnlockFeedback;
    window.refreshAllTabs = refreshAllTabs;
    window.updateButtonAffordability = updateButtonAffordability;
    window.invalidateTabHashes = invalidateTabHashes;
})(window);







