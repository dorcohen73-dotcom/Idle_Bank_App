// Shared helpers and state for the ui/tabs/* render modules.
// game, translations, formatMoney, GAME_CONFIG stay classic-script globals (see build plan).

let _buyBtnCache = null;
let _lastManagersHash = null;
let _lastBranchesHash = null;

export function invalidateTabHashes() {
    _lastManagersHash = null;
    _lastBranchesHash = null;
    _buyBtnCache = null;
}

export function resetBuyBtnCache() {
    _buyBtnCache = null;
}

export function getBuyBtnCache(container) {
    if (!_buyBtnCache) _buyBtnCache = container.querySelectorAll('.buy-btn');
    return _buyBtnCache;
}

// Returns true (and leaves cached state untouched) when the tab's hash hasn't
// changed since the last render, so the caller can skip re-rendering.
export function checkManagersHashUnchanged(hash) {
    if (hash && hash === _lastManagersHash) return true;
    _lastManagersHash = hash;
    _buyBtnCache = null;
    return false;
}

export function checkBranchesHashUnchanged(hash) {
    if (hash && hash === _lastBranchesHash) return true;
    _lastBranchesHash = hash;
    _buyBtnCache = null;
    return false;
}

export const statLabels = {
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
        gold_shares: "מניות זהב בפרסטיג'",
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

// Helper to build teller/guard upgrade/unlock cards
export function createSeparator(container) {
    const hr = document.createElement('hr');
    hr.style.border = '0';
    hr.style.borderTop = '1px solid var(--border-color)';
    container.appendChild(hr);
}

export function buildEntityCard(type, entity, lang, tObj, currentUpgradeMode) {
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    const id = entity.id;

    if (entity.unlocked) {
        const details = game.getBulkUpgradeDetails(type, id, currentUpgradeMode, entity.level, game.state.cash);
        const levelsToBuy = details.levels;
        const nextLevel = entity.level + levelsToBuy;
        const cost = details.cost;
        
        let capacity, speed, nextCapacity, nextSpeed, title, desc, speedLabel, capLabel;
        let avatarBgUrl = '', avatarBgPos = 'center 25%', avatarBgSize = 'cover';
        if (type === 'teller') {
            capacity = game.getTellerCapacity(entity.level);
            speed = game.getTellerSpeed(entity.level).toFixed(1);
            nextCapacity = game.getTellerCapacity(nextLevel);
            nextSpeed = game.getTellerSpeed(nextLevel).toFixed(1);
            avatarBgUrl = `images/teller-${(id % 8) + 1}.png`;
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
            avatarBgUrl = 'images/guard.png';
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
            avatarBgUrl2 = `images/teller-${(id % 8) + 1}.png`;
            avatarBgPos2 = 'center';
            avatarBgSize2 = 'cover';
            title = tObj.tellerLocked(id + 1);
            desc = tObj.tellerLockedDesc;
            unlockAction = 'unlock-teller';
            unlockText = translations[lang].unlockLabel;
        } else {
            cost = game.guardUnlockCosts[id];
            avatarBgUrl2 = 'images/guard.png';
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
