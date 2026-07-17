import { checkBranchesHashUnchanged } from './tab-shared.js';
import { refreshAllTabs } from './index.js';

// Dynamic builder for Branches / Prestige Tab
export function renderBranchesTab() {
    const container = document.getElementById('tab-branches');
    if (!container) return;
    let hash = null;
    try {
        hash = JSON.stringify({
            currentBranch: game.state.currentBranch,
            shares: game.state.shares,
            cash: Math.floor(game.state.cash / 1000)
        });
    } catch { /* render unconditionally on serialization error */ }
    if (checkBranchesHashUnchanged(hash)) return;
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

        <button class="prestige-beveled-btn main-prestige-btn ${canPrestige ? '' : 'disabled'}" id="main-prestige-btn">
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
        
        const card = document.createElement('div');
        card.className = `branch-card bg-branch-${idx} ${isCurrent ? 'current' : ''}`;
        
        let actionBtnHtml = '';
        if (!isSold && !isCurrent) {
            // The card you're already on has nothing to "sell & rebuild" into (it IS
            // the current branch) — that action belongs to #main-prestige-btn, which
            // targets currentBranch+1. Showing a self-targeting button here just
            // confused taps meant for the next branch's card right below it.
            actionBtnHtml = `
                <button class="branch-action-btn ghost-gold ${canPrestige ? '' : 'disabled'}" data-prestige-branch="${idx}">
                    ${translations[lang].branches.sellAndBuild.replace('!', '')}
                </button>
            `;
        }

        const costToEnter = idx > 0 ? game.branches[idx - 1].minCashToPrestige : 0;
        const requirementText = isSold ? translations[lang].branches.sold : (idx === 0 ? translations[lang].branches.active.replace(' 🏛', '') : `${translations[lang].branches.minCash(formatMoney(costToEnter))}`);
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
                ${idx > 0 ? `
                <div class="branch-req-row">
                    <span class="crown-icon">👑</span>
                    <span class="branch-req-text">${requirementText}</span>
                </div>
                ` : ''}
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
    // Wrapped defensively: two independent user reports (two separate screen
    // recordings) show taps on this button producing zero visible reaction on
    // real devices, despite the same code working correctly in every browser
    // simulation run so far. If something throws here, surface it visibly
    // instead of failing silently — that turns the next report into a
    // diagnosable error message instead of another "nothing happens".
    const presBtns = container.querySelectorAll('[data-prestige-branch]');
    presBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            try {
                const currentCanPrestige = game.state.cash >= game.branches[game.state.currentBranch].minCashToPrestige;
                if (!currentCanPrestige) {
                    if (typeof showToast === 'function') showToast('עדיין אין מספיק כסף כדי לעבור סניף', 'danger');
                    return;
                }
                initSound();
                const target = parseInt(btn.getAttribute('data-prestige-branch'));
                openPrestigeModal(target);
            } catch (err) {
                console.error('[Prestige branch button] click failed:', err);
                if (typeof showToast === 'function') showToast('שגיאה בפתיחת המסך: ' + err.message, 'danger');
                if (typeof reportCrash === 'function') reportCrash('branch prestige btn click: ' + err.message, err.stack);
            }
        });
    });

    // Bind Main Prestige Button (same defensive wrapping — see comment above)
    const mainPresBtn = container.querySelector('#main-prestige-btn');
    if (mainPresBtn) {
        mainPresBtn.addEventListener('click', () => {
            try {
                const currentCanPrestige = game.state.cash >= game.branches[game.state.currentBranch].minCashToPrestige;
                if (!currentCanPrestige) {
                    if (typeof showToast === 'function') showToast('עדיין אין מספיק כסף כדי לעבור סניף', 'danger');
                    return;
                }
                initSound();

                // By default, progress to the next branch if available
                let targetBranch = game.state.currentBranch;
                if (game.state.currentBranch < game.branches.length - 1) {
                    targetBranch = game.state.currentBranch + 1;
                }
                // If they are playing an old branch but already unlocked higher ones, take them to the max unlocked + 1 (if within bounds)
                if (game.state.maxBranchUnlocked > game.state.currentBranch && game.state.maxBranchUnlocked < game.branches.length - 1) {
                    targetBranch = game.state.maxBranchUnlocked + 1;
                } else if (game.state.maxBranchUnlocked === game.branches.length - 1) {
                    targetBranch = game.state.maxBranchUnlocked; // max possible
                }

                openPrestigeModal(targetBranch);
            } catch (err) {
                console.error('[Main prestige button] click failed:', err);
                if (typeof showToast === 'function') showToast('שגיאה בפתיחת המסך: ' + err.message, 'danger');
                if (typeof reportCrash === 'function') reportCrash('main prestige btn click: ' + err.message, err.stack);
            }
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
        startingCash: 'images/gold-chest.png',
        guardSpeed: 'images/gold-truck.png',
        premiumYield: 'images/gold-vip.png',
        shareEfficiency: 'images/gold-bars.png',
        offlineEarnings: 'images/vault.png',
        tellerCapacityBoost: 'images/manager-4.png',
        vaultCapacityBoost: 'images/vault-door.png',
        eventBonus: 'images/client-9.png',
        managerDiscount: 'images/manager-1.png'
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
        
        desc = translations[lang].goldUpgradesDesc && translations[lang].goldUpgradesDesc[key] 
            ? translations[lang].goldUpgradesDesc[key] 
            : upgradeData.desc;

        let cleanTitle = upgradeData.title.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();

        goldCardsHtml += `
            <div class="gold-upgrade-card">
                ${isMax ? `<div class="gold-max-badge">MAX</div>` : ''}
                <div class="gold-card-right">
                    <img class="gold-big-illustration" src="${iconSrc}" alt="${upgradeData.title}">
                </div>
                <div class="gold-card-middle">
                    <div class="gold-upgrade-title">${cleanTitle}</div>
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
    let rawTitle = translations[lang].goldShopTitle.replace('🏛️', '').trim();
    let parts = rawTitle.split('(');
    let formattedTitle = parts[0].trim();
    if (parts.length > 1) {
        formattedTitle += `<br><span class="prestige-subtitle">(${parts[1]}</span>`;
    }

    goldShopSection.innerHTML = `
        <div class="prestige-shop-header">
            <div class="prestige-shop-bg-stars"></div>
            <div class="prestige-title-wrapper">
                <img src="images/golden_temple.png" class="prestige-temple-img" alt="Temple" />
                <div class="prestige-title-text">${formattedTitle}</div>
            </div>
        </div>
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
