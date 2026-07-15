import { buildEntityCard, createSeparator, statLabels, resetBuyBtnCache } from './tab-shared.js';

// Dynamic builder for Upgrades Tab
export function renderUpgradesTab() {
    const container = document.getElementById('tab-upgrades');
    if (!container) return;
    resetBuyBtnCache();
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
                <div class="upg-v2-avatar" style="background-image: url('images/vault-door.png');"></div>
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
                    <div class="upg-v2-avatar" style="background-image: url('images/client-1.png');"></div>
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
                    <div class="upg-v2-avatar" style="background-image: url('images/client-1.png');"></div>
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
