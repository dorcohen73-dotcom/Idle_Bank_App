(function(window) {
// Tab Rendering & Updates Module for Idle Bank Empire

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
        
        let capacity, speed, nextCapacity, nextSpeed, avatarStyle, title, desc, speedLabel, capLabel;
        if (type === 'teller') {
            capacity = game.getTellerCapacity(entity.level);
            speed = game.getTellerSpeed(entity.level).toFixed(1);
            nextCapacity = game.getTellerCapacity(nextLevel);
            nextSpeed = game.getTellerSpeed(nextLevel).toFixed(1);
            avatarStyle = `background-image: url('תמונות/teller-${(id % 7) + 1}.png');`;
            title = tObj.tellerTitle(id + 1, entity.level);
            desc = tObj.tellerDesc;
            speedLabel = tObj.tellerSpeed;
            capLabel = tObj.tellerCap;
        } else {
            capacity = game.getGuardCapacity(entity.level);
            speed = game.getGuardSpeed(entity.level).toFixed(1);
            nextCapacity = game.getGuardCapacity(nextLevel);
            nextSpeed = game.getGuardSpeed(nextLevel).toFixed(1);
            avatarStyle = `background-image: url('תמונות/guard.png'); background-size: 80%; background-repeat: no-repeat; background-position: center; background-color: rgba(255, 255, 255, 0.03);`;
            title = tObj.guardTitle(id + 1, entity.level);
            desc = tObj.guardDesc;
            speedLabel = tObj.guardSpeed;
            capLabel = tObj.guardCap;
        }

        const canBuy = details.canAfford;
        
        card.innerHTML = `
            <div class="card-left-section">
                <div class="card-avatar" style="${avatarStyle}"></div>
                <div class="card-details">
                    <div class="card-title">${title}${levelsToBuy > 1 ? ` (+${levelsToBuy})` : ''}</div>
                    <div class="card-desc">${desc}</div>
                    <div class="card-stats">
                        ${speedLabel}: <span>${speed}${lang === 'he' ? " ש'" : "s"} ➔ ${nextSpeed}${lang === 'he' ? " ש'" : "s"}</span> | 
                        ${capLabel}: <span>${formatMoney(capacity)} ➔ ${formatMoney(nextCapacity)}</span>
                    </div>
                </div>
            </div>
            <button class="buy-btn ${canBuy ? '' : 'disabled'}" data-type="${type}" data-id="${id}" ${canBuy ? '' : 'disabled'}>
                ${translations[lang].upgradeLabel}${levelsToBuy > 1 ? ' +' + levelsToBuy : ''}<br>${formatMoney(cost)}
            </button>
        `;
    } else {
        let cost, avatarStyle, title, desc, unlockAction, unlockText;
        if (type === 'teller') {
            cost = game.tellerUnlockCosts[id];
            avatarStyle = `background-image: url('תמונות/teller-${(id % 7) + 1}.png');`;
            title = tObj.tellerLocked(id + 1);
            desc = tObj.tellerLockedDesc;
            unlockAction = 'unlock-teller';
            unlockText = translations[lang].unlockLabel;
        } else {
            cost = game.guardUnlockCosts[id];
            avatarStyle = `background-image: url('תמונות/guard.png'); background-size: 80%; background-repeat: no-repeat; background-position: center; background-color: rgba(0,0,0,0.2);`;
            title = tObj.guardLocked(id + 1);
            desc = tObj.guardLockedDesc;
            unlockAction = 'unlock-guard';
            unlockText = tObj.guardUnlockBtn;
        }
        
        const canBuy = game.state.cash >= cost;

        card.innerHTML = `
            <div class="card-left-section">
                <div class="card-avatar locked" style="${avatarStyle}">
                    <div class="lock-overlay">🔒</div>
                </div>
                <div class="card-details">
                    <div class="card-title">${title}</div>
                    <div class="card-desc">${desc}</div>
                </div>
            </div>
            <button class="buy-btn ${canBuy ? '' : 'disabled'}" data-action="${unlockAction}" data-id="${id}" ${canBuy ? '' : 'disabled'}>
                ${unlockText}<br>${formatMoney(cost)}
            </button>
        `;
    }
    return card;
}

// Dynamic builder for Upgrades Tab
function renderUpgradesTab() {
    const container = document.getElementById('tab-upgrades');
    if (!container) return;
    container.innerHTML = '';

    const lang = game.state.language || 'he';
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
    vaultCard.className = 'upgrade-card';
    vaultCard.innerHTML = `
        <div class="card-left-section">
            <div class="card-avatar" style="background-image: url('תמונות/vault-door.png');"></div>
            <div class="card-details">
                <div class="card-title">${tObj.vaultTitle(vault.level)}${vLevelsToBuy > 1 ? ` (+${vLevelsToBuy})` : ''}</div>
                <div class="card-desc">${tObj.vaultDesc}</div>
                <div class="card-stats">
                    ${tObj.vaultCap}: <span>${formatMoney(vCap)} ➔ ${formatMoney(nextVCap)}</span>
                </div>
            </div>
        </div>
        <button class="buy-btn ${vCanBuy ? '' : 'disabled'}" id="upgrade-vault-btn" ${vCanBuy ? '' : 'disabled'}>
            ${translations[lang].upgradeLabel}${vLevelsToBuy > 1 ? ' +' + vLevelsToBuy : ''}<br>${formatMoney(vCost)}
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

    if (queueLvl >= 4) {
        queueCard.innerHTML = `
            <div class="card-left-section">
                <div class="card-avatar" style="background-image: url('תמונות/client-1.png');"></div>
                <div class="card-details">
                    <div class="card-title">${tObj.queueMaxTitle}</div>
                    <div class="card-desc">${tObj.queueMaxDesc(qCap)}</div>
                </div>
            </div>
            <button class="buy-btn disabled" disabled>
                ${translations[lang].maxLevel}
            </button>
        `;
    } else {
        queueCard.innerHTML = `
            <div class="card-left-section">
                <div class="card-avatar" style="background-image: url('תמונות/client-1.png');"></div>
                <div class="card-details">
                    <div class="card-title">${tObj.queueTitle(queueLvl)}${qLevelsToBuy > 1 ? ` (+${qLevelsToBuy})` : ''}</div>
                    <div class="card-desc">${tObj.queueDesc}</div>
                    <div class="card-stats">
                        ${tObj.queueCap}: <span>${qCap} ${tObj.clientsShort} ➔ ${nextQCap} ${tObj.clientsShort}</span>
                    </div>
                </div>
            </div>
            <button class="buy-btn ${qCanBuy ? '' : 'disabled'}" id="upgrade-queue-btn" ${qCanBuy ? '' : 'disabled'}>
                ${tObj.queueUpgradeBtn}${qLevelsToBuy > 1 ? ' +' + qLevelsToBuy : ''}<br>${formatMoney(qCost)}
            </button>
        `;
    }
    container.appendChild(queueCard);
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
        hourlyProfit: "רווח נוסף:",
        perHour: "לשעה",
        lockedLabel: "נעול",
        hireBtn: "גיוס",
        upgradeBtn: "שדרג",
        activeLabel: "פעיל"
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
        hourlyProfit: "Extra Yield:",
        perHour: "/ hr",
        lockedLabel: "Locked",
        hireBtn: "Hire",
        upgradeBtn: "Upgrade",
        activeLabel: "Active"
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
        hourlyProfit: "Rendimiento Extra:",
        perHour: "/ h",
        lockedLabel: "Bloqueado",
        hireBtn: "Contratar",
        upgradeBtn: "Mejorar",
        activeLabel: "Activo"
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
        hourlyProfit: "Доп. доход:",
        perHour: "/ ч",
        lockedLabel: "Закрыто",
        hireBtn: "Нанять",
        upgradeBtn: "Улучшить",
        activeLabel: "Активно"
    }
};

// Dynamic builder for Managers Tab
function renderManagersTab() {
    const container = document.getElementById('tab-managers');
    if (!container) return;
    container.innerHTML = '';

    const lang = game.state.language || 'he';
    const tObj = translations[lang].managers;

    const managersKeys = ['customer', 'finance', 'operations', 'service', 'vip', 'marketing', 'logistics', 'risk', 'tech', 'compliance'];
    const managerConfigs = {
        customer: { theme: 'theme-gold', gem: '👑', img: 'manager-1.png' },
        finance: { theme: 'theme-blue', gem: '💎', img: 'manager-2.png' },
        operations: { theme: 'theme-purple', gem: '🔮', img: 'manager-3.png' },
        service: { theme: 'theme-amber', gem: '🔸', img: 'manager-4.png' },
        vip: { theme: 'theme-red', gem: '💰', img: 'manager-5.png' },
        marketing: { theme: 'theme-green', gem: '🔹', img: 'manager-6.png' },
        logistics: { theme: 'theme-teal', gem: '🚚', img: 'manager-3.png' },
        risk: { theme: 'theme-purple', gem: '⚠️', img: 'manager-5.png' },
        tech: { theme: 'theme-blue', gem: '💻', img: 'manager-2.png' },
        compliance: { theme: 'theme-red', gem: '⚖️', img: 'manager-6.png' }
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
        card.className = `upgrade-card manager-card ${config.theme} ${isUnlocked ? (isHired ? 'active' : '') : 'locked'}`;

        let bodyHtml = '';
        let footerHtml = '';

        if (!isUnlocked) {
            // Locked Manager layout
            const deptName = (type === 'finance' ? translations[lang].departments.names[1] :
                              (type === 'service' ? translations[lang].departments.names[2] :
                               (type === 'vip' ? translations[lang].departments.names[3] :
                                (type === 'marketing' ? translations[lang].departments.names[4] :
                                 (type === 'risk' ? translations[lang].departments.names[1] :
                                  (type === 'tech' ? translations[lang].departments.names[2] :
                                   (type === 'compliance' ? translations[lang].departments.names[3] : '')))))));

            bodyHtml = `
                <div class="mgr-body-row">
                    <div class="mgr-portrait-box">
                        <img src="תמונות/${config.img}" class="mgr-portrait-img">
                        <div class="mgr-gem-badge">${config.gem}</div>
                    </div>
                    <div class="mgr-info-box">
                        <div class="mgr-title">${tObj.names[type]}</div>
                        <div class="mgr-stars-box">
                            <span class="star gray-star">★</span>
                            <span class="star gray-star">★</span>
                            <span class="star gray-star">★</span>
                            <span class="star gray-star">★</span>
                            <span class="star gray-star">★</span>
                        </div>
                        <div class="mgr-lvl-badge">Lv 0</div>
                        <div class="mgr-stats-list">
                            <div class="mgr-stat-item" style="color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">
                                🔒 ${lang === 'he' ? 'דורש פתיחת מחלקת:' : 'Requires unlocking:'} <br>
                                <span style="color: var(--primary-gold);">${deptName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            footerHtml = `
                <div class="mgr-footer-row">
                    <div class="mgr-footer-info">
                        <div class="mgr-footer-lbl">${statLabels[lang].hourlyProfit}</div>
                        <div class="mgr-footer-val" style="color: var(--text-muted); font-family: inherit;">-</div>
                    </div>
                    <button class="buy-btn mgr-buy-btn disabled" disabled>
                        ${statLabels[lang].lockedLabel} 🔒
                    </button>
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
            if (type === 'customer') {
                stat1Lbl = statLabels[lang].client_speed;
                stat2Lbl = statLabels[lang].satisfaction;
            } else if (type === 'finance') {
                stat1Lbl = statLabels[lang].auto_vault;
                stat2Lbl = statLabels[lang].bank_yield;
            } else if (type === 'operations') {
                stat1Lbl = statLabels[lang].courier_speed;
                stat2Lbl = statLabels[lang].teller_speed;
            } else if (type === 'service') {
                stat1Lbl = statLabels[lang].counter_cap;
                stat2Lbl = statLabels[lang].base_income;
            } else if (type === 'vip') {
                stat1Lbl = statLabels[lang].dept_yields;
                stat2Lbl = statLabels[lang].gold_shares;
            } else if (type === 'marketing') {
                stat1Lbl = statLabels[lang].ad_bonus;
                stat2Lbl = statLabels[lang].offline_time;
            } else if (type === 'logistics') {
                stat1Lbl = lang === 'he' ? 'קיבולת שומר' : 'Guard capacity';
                stat2Lbl = lang === 'he' ? 'רמה' : 'Level';
            } else if (type === 'risk') {
                stat1Lbl = lang === 'he' ? 'הכנסות מחלקות' : 'Dept income';
                stat2Lbl = lang === 'he' ? 'רמה' : 'Level';
            } else if (type === 'tech') {
                stat1Lbl = lang === 'he' ? 'EPS כולל' : 'Total EPS';
                stat2Lbl = lang === 'he' ? 'שעות אופליין' : 'Offline hours';
            } else if (type === 'compliance') {
                stat1Lbl = lang === 'he' ? 'מניות בפרסטיג׳' : 'Prestige shares';
                stat2Lbl = lang === 'he' ? 'רמה' : 'Level';
            }

            bodyHtml = `
                <div class="mgr-body-row">
                    <div class="mgr-portrait-box">
                        <img src="תמונות/${config.img}" class="mgr-portrait-img">
                        <div class="mgr-gem-badge">${config.gem}</div>
                    </div>
                    <div class="mgr-info-box">
                        <div class="mgr-title">${tObj.names[type]}</div>
                        <div class="mgr-stars-box">
                            ${starsHtml}
                        </div>
                        <div class="mgr-lvl-badge">Lv ${level}</div>
                        <div class="mgr-stats-list">
                            <div class="mgr-stat-item">
                                <span class="mgr-stat-val">${mData.stat1Val}</span> ${stat1Lbl}
                            </div>
                            <div class="mgr-stat-item">
                                <span class="mgr-stat-val">${mData.stat2Val}</span> ${stat2Lbl}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Action button
            let actionBtnHtml = '';
            if (!isHired) {
                actionBtnHtml = `
                    <button class="buy-btn buy-mgr-btn mgr-buy-btn ${canBuy ? '' : 'disabled'}" data-mgr="${type}" ${canBuy ? '' : 'disabled'}>
                        ${statLabels[lang].hireBtn}<br>${formatMoney(cost)}
                    </button>
                `;
            } else if (level < 5) {
                const details = game.getBulkUpgradeDetails('manager', type, currentUpgradeMode, level, game.state.cash);
                const costToUpgrade = details.cost;
                const canUpgrade = details.canAfford;
                const levelsToBuy = details.levels;
                
                actionBtnHtml = `
                    <button class="buy-btn upgrade-mgr-btn mgr-buy-btn ${canUpgrade ? '' : 'disabled'}" data-mgr-type="${type}" ${canUpgrade ? '' : 'disabled'}>
                        ${statLabels[lang].upgradeBtn}${levelsToBuy > 1 ? ' +' + levelsToBuy : ''}<br>${formatMoney(costToUpgrade)}
                    </button>
                `;
            } else {
                actionBtnHtml = `
                    <div class="mgr-active-badge">
                        ${statLabels[lang].activeLabel} ✓
                    </div>
                `;
            }

            footerHtml = `
                <div class="mgr-footer-row">
                    <div class="mgr-footer-info">
                        <div class="mgr-footer-lbl">${statLabels[lang].hourlyProfit}</div>
                        <div class="mgr-footer-val">${isHired ? formatMoney(mData.extraHourly) : formatMoney(0)} ${statLabels[lang].perHour}</div>
                    </div>
                    ${actionBtnHtml}
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

    const lang = game.state.language || 'he';
    const tObj = translations[lang].departments;
    game.state.departments.forEach((d) => {
        const isUnlocked = d.unlocked;
        const canBuy = game.state.cash >= d.cost;
        
        const card = document.createElement('div');
        card.className = `upgrade-card department-card ${isUnlocked ? 'active' : 'locked'}`;

        const reward = game.getDepartmentReward(d.id);
        const iconSvg = getDepartmentIconSvg(d.id, isUnlocked);

        const activeBadgeHtml = isUnlocked ? `
            <span class="dept-active-badge">
                <span class="badge-dot"></span>
                <span>${lang === 'he' ? 'פעיל' : 'Active'}</span>
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
                    <span class="btn-lbl">${lang === 'he' ? 'שדרג' : tObj.unlock}</span>
                    <span class="btn-cost">${formatMoney(d.cost)}</span>
                </button>
            `;
        } else {
            actionBtnHtml = `
                <button class="dept-action-btn active disabled" disabled>
                    <span class="btn-arrow">✓</span>
                    <span class="btn-lbl">${lang === 'he' ? 'פעיל' : 'Active'}</span>
                    <span class="btn-cost">MAX</span>
                </button>
            `;
        }

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
                        <span class="dept-title-text">${tObj.names[d.id]}</span>
                        ${activeBadgeHtml}
                    </div>
                    <div class="dept-stats-row">
                        ${baseProfitHtml}
                        ${adjustedProfitHtml}
                    </div>
                </div>
            </div>
            <div class="dept-card-action">
                ${actionBtnHtml}
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.dept-action-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            initSound();
            const idx = parseInt(btn.getAttribute('data-dept-idx'));
            const beforeCash = game.state.cash;
            const dept = game.state.departments.find(d => d.id === idx);
            const beforeUnlocked = dept ? dept.unlocked : false;

            game.unlockDepartment(idx);

            handlePurchaseFeedback(btn, e, beforeCash, beforeUnlocked, 'unlock-dept', idx);
            renderDepartmentsTab();
        });
    });
}

// Dynamic builder for Branches / Prestige Tab
function renderBranchesTab() {
    const container = document.getElementById('tab-branches');
    if (!container) return;
    container.innerHTML = '';

    const lang = game.state.language || 'he';
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
            ${lang === 'he' ? `מינימום כסף: ${formatMoney(currentReq)}` : tObj.prestigeMinLabel(formatMoney(currentReq))}
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
        if (isCurrent) {
            actionBtnHtml = `<span class="branch-status-label">${translations[lang].branches.active.replace(' 🏛', '')}</span>`;
        } else if (isSold) {
            actionBtnHtml = `
                <button class="branch-action-btn disabled" disabled>
                    ${translations[lang].branches.sold.replace(' 💰', '')}
                </button>
            `;
        } else if (isNext) {
            actionBtnHtml = `
                <button class="branch-action-btn ${canPrestige ? '' : 'disabled'}" data-prestige-branch="${idx}" ${canPrestige ? '' : 'disabled'}>
                    ${lang === 'he' ? 'מכור' : translations[lang].branches.sellAndBuild.replace('!', '')}
                </button>
            `;
        } else {
            actionBtnHtml = `<span class="branch-status-label disabled">${translations[lang].branches.locked.split('(')[0].trim()}</span>`;
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
                <div class="branch-name">${tObj.names[idx]}</div>
                <div class="branch-desc">${b.desc}</div>
                <div class="branch-req">${requirementText}</div>
                ${statusPillHtml}
            </div>
            <div class="branch-card-left">
                <div class="branch-multiplier-badge">${translations[lang].multiplier}: ${b.baseMultiplier}x</div>
                <div class="branch-action-wrapper" style="margin-top: auto;">
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
            const startingCashOptions = [150, 1000, 5000, 25000, 100000];
            const nextVal = startingCashOptions[currentLvl + 1] || 100000;
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
                <div class="gold-up-icon-box">
                    <img class="gold-up-icon-img" src="${iconSrc}" alt="${upgradeData.title}">
                </div>
                <div class="gold-upgrade-details">
                    <div class="gold-upgrade-title">${upgradeData.title}</div>
                    <div class="gold-upgrade-desc">${desc}</div>
                    <div class="gold-upgrade-level">
                        ${translations[lang].levelLabel || 'רמה'}: 
                        <span class="gold-level-val">${currentLvl}/${maxLvl}</span>
                        ${isMax ? `<span class="gold-checkmark">✔</span>` : ''}
                    </div>
                </div>
                <div class="gold-upgrade-action">
                    ${isMax ? `
                        <span class="manager-status hired" style="background: rgba(223, 171, 41, 0.15); color: var(--gold-light); border: 1px solid rgba(223,171,41,0.3); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem;">MAX</span>
                    ` : `
                        <button class="buy-btn ${canAfford ? '' : 'disabled'} buy-gold-btn" data-gold-up="${key}" ${canAfford ? '' : 'disabled'}>
                            ${cost} 🪙
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    
    const startingCashLvl = (game.state.goldUpgrades && game.state.goldUpgrades.startingCash) ? game.state.goldUpgrades.startingCash : 0;
    const startingCashOptions = [150, 1000, 5000, 25000, 100000];
    const startingCashVal = startingCashOptions[startingCashLvl] || 150;
    
    const premiumYieldLvl = (game.state.goldUpgrades && game.state.goldUpgrades.premiumYield) ? game.state.goldUpgrades.premiumYield : 0;
    const branchProfitsPct = premiumYieldLvl * 10;
    
    const guardSpeedLvl = (game.state.goldUpgrades && game.state.goldUpgrades.guardSpeed) ? game.state.goldUpgrades.guardSpeed : 0;
    const courierSpeedPct = guardSpeedLvl * 10;
    
    const prestigeBonusPct = Math.round((game.getPrestigeMultiplier() - 1) * 100);

    const tTotalEffect = translations[lang].goldTotalEffect || 'האפקט הכולל שלך';
    const tBranchProfits = translations[lang].goldBranchProfits || 'רווחים בסניפים';
    const tCourierSpeed = translations[lang].goldCourierSpeed || 'מהירות שליחים';
    const tStartingCapital = translations[lang].goldStartingCapital || 'הון התחלתי';
    
    let grandBonusHtml = '';
    if (typeof translations[lang].goldGrandBonus === 'function') {
        grandBonusHtml = translations[lang].goldGrandBonus(prestigeBonusPct);
    } else {
        grandBonusHtml = `בונוס כולל מכל שדרוגי היוקרה: <span class="gold-grand-bonus-val">+${prestigeBonusPct}% לרווחים בכל הסניפים ⬆</span>`;
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

    const lang = game.state.language || 'he';
    const tObj = translations[lang].missions;
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
            if (m.type === 'earn_eps' || m.type === 'accumulate_cash' || m.type === 'earn_cash') {
                progressDesc = descFn(formatMoney(m.target));
            } else if (m.type === 'upgrade_teller' || m.type === 'upgrade_guard') {
                progressDesc = descFn(m.target, (m.targetId !== undefined ? m.targetId + 1 : 1));
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
            'upgrade_guard': './תמונות/guard.png',
            'upgrade_vault': './תמונות/vault.png',
            'unlock_departments': './תמונות/gold-truck.png',
            'hire_managers': './תמונות/manager-1.png',
            'earn_eps': './תמונות/gold-vip.png',
            'earn_cash': './תמונות/gold-bars.png',
            'serve_rich_vip': './תמונות/client-6.png'
        };
        const imgSrc = imgMap[m.type] || './תמונות/icon.png';

        let btnHtml = '';
        if (m.completed && !m.claimed) {
            btnHtml = `
                <button class="claim-reward-btn" data-mission-id="${m.id}">
                    ${lang === 'he' ? 'אסוף פרס!' : 'Claim!'}
                </button>
            `;
        } else {
            btnHtml = `
                <div class="mission-progress-box">
                    <span class="box-progress-fraction">
                        ${m.type === 'earn_eps' || m.type === 'accumulate_cash' || m.type === 'earn_cash' ? formatMoney(progressVal) : progressVal}
                        /
                        ${m.type === 'earn_eps' || m.type === 'accumulate_cash' || m.type === 'earn_cash' ? formatMoney(targetVal) : targetVal}
                    </span>
                    <span class="box-progress-percent">${Math.round(percent)}%</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="mission-reward-badge">
                <span>${lang === 'he' ? 'רווח:' : 'Reward:'} +${formatMoney(m.reward)} 💰</span>
            </div>
            <div class="mission-action-zone">
                ${btnHtml}
            </div>
            <div class="mission-details">
                <div class="mission-title">${title}</div>
                <div class="mission-desc">${progressDesc}</div>
                <div class="mission-progress-row">
                    <div class="mission-progress-outer">
                        <div class="mission-progress-bar" style="width: ${percent}%"></div>
                        <div class="progress-text-overlay">
                            ${m.type === 'earn_eps' || m.type === 'accumulate_cash' || m.type === 'earn_cash' ? formatMoney(progressVal) : progressVal}
                            /
                            ${m.type === 'earn_eps' || m.type === 'accumulate_cash' || m.type === 'earn_cash' ? formatMoney(targetVal) : targetVal}
                        </div>
                    </div>
                    <div class="mission-progress-pct">${Math.round(percent)}%</div>
                </div>
            </div>
            <div class="mission-image-box">
                <div class="mission-image-glow"></div>
                <img class="mission-illustration" src="${imgSrc}" alt="" />
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

    // Bind claim reward event handlers
    container.querySelectorAll('.claim-reward-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            initSound();
            const missionId = btn.getAttribute('data-mission-id');
            const collected = game.claimMissionReward(missionId);
            
            if (collected > 0) {
                const rectBtn = btn.getBoundingClientRect();
                const rectCashBox = document.getElementById('stat-cash').getBoundingClientRect();
                animateCoins(rectBtn, rectCashBox, 10, 'cash');
                spawnFloating('+' + formatMoney(collected), rectBtn.left + rectBtn.width/2, rectBtn.top, 'green');
                
                renderMissionsTab();
            }
        });
    });
}

// Refresh all active tabs
function refreshAllTabs() {
    const activeTabEl = document.querySelector('.tab-btn.active');
    const activeTab = activeTabEl ? activeTabEl.getAttribute('data-tab') : 'upgrades';
    if (activeTab === 'upgrades') renderUpgradesTab();
    else if (activeTab === 'managers') renderManagersTab();
    else if (activeTab === 'departments') renderDepartmentsTab();
    else if (activeTab === 'missions') renderMissionsTab();
    else if (activeTab === 'branches') renderBranchesTab();
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
        const buttons = container.querySelectorAll('.buy-btn');
        buttons.forEach(btn => {
            const type = btn.getAttribute('data-type');
            const id = parseInt(btn.getAttribute('data-id'));
            if (type === 'teller') {
                const t = game.state.tellers[id];
                if (t.unlocked) {
                    const details = game.getBulkUpgradeDetails('teller', id, currentUpgradeMode, t.level, game.state.cash);
                    btn.classList.toggle('disabled', !details.canAfford);
                    btn.disabled = !details.canAfford;
                    const newText = `${translations[game.state.language || 'he'].upgradeLabel}${details.levels > 1 ? ' +' + details.levels : ''}<br>${formatMoney(details.cost)}`;
                    if (btn.innerHTML !== newText) {
                        btn.innerHTML = newText;
                        const card = btn.closest('.upgrade-card');
                        if (card) {
                            const titleEl = card.querySelector('.card-title');
                            if (titleEl) {
                                titleEl.innerText = `${translations[game.state.language || 'he'].upgrades.tellerTitle(id + 1, t.level)}${details.levels > 1 ? ` (+${details.levels})` : ''}`;
                            }
                            const statsSpans = card.querySelectorAll('.card-stats span');
                            if (statsSpans.length >= 2) {
                                const capacity = game.getTellerCapacity(t.level);
                                const speed = game.getTellerSpeed(t.level).toFixed(1);
                                const nextCapacity = game.getTellerCapacity(t.level + details.levels);
                                const nextSpeed = game.getTellerSpeed(t.level + details.levels).toFixed(1);
                                const lang = game.state.language || 'he';
                                statsSpans[0].innerText = `${speed}${lang === 'he' ? " ש'" : "s"} ➔ ${nextSpeed}${lang === 'he' ? " ש'" : "s"}`;
                                statsSpans[1].innerText = `${formatMoney(capacity)} ➔ ${formatMoney(nextCapacity)}`;
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
                    const newText = `${translations[game.state.language || 'he'].upgradeLabel}${details.levels > 1 ? ' +' + details.levels : ''}<br>${formatMoney(details.cost)}`;
                    if (btn.innerHTML !== newText) {
                        btn.innerHTML = newText;
                        const card = btn.closest('.upgrade-card');
                        if (card) {
                            const titleEl = card.querySelector('.card-title');
                            if (titleEl) {
                                titleEl.innerText = `${translations[game.state.language || 'he'].upgrades.guardTitle(id + 1, g.level)}${details.levels > 1 ? ` (+${details.levels})` : ''}`;
                            }
                            const statsSpans = card.querySelectorAll('.card-stats span');
                            if (statsSpans.length >= 2) {
                                const speed = game.getGuardSpeed(g.level).toFixed(1);
                                const capacity = game.getGuardCapacity(g.level);
                                const nextSpeed = game.getGuardSpeed(g.level + details.levels).toFixed(1);
                                const nextCapacity = game.getGuardCapacity(g.level + details.levels);
                                const lang = game.state.language || 'he';
                                statsSpans[0].innerText = `${speed}${lang === 'he' ? " ש'" : "s"} ➔ ${nextSpeed}${lang === 'he' ? " ש'" : "s"}`;
                                statsSpans[1].innerText = `${formatMoney(capacity)} ➔ ${formatMoney(nextCapacity)}`;
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
                const newText = `${translations[game.state.language || 'he'].upgradeLabel}${details.levels > 1 ? ' +' + details.levels : ''}<br>${formatMoney(details.cost)}`;
                if (btn.innerHTML !== newText) {
                    btn.innerHTML = newText;
                    const card = btn.closest('.upgrade-card');
                    if (card) {
                        const titleEl = card.querySelector('.card-title');
                        if (titleEl) {
                            titleEl.innerText = `${translations[game.state.language || 'he'].upgrades.vaultTitle(game.state.vault.level)}${details.levels > 1 ? ` (+${details.levels})` : ''}`;
                        }
                        const statsSpan = card.querySelector('.card-stats span');
                        if (statsSpan) {
                            const capacity = game.getVaultCapacity(game.state.vault.level);
                            const nextCapacity = game.getVaultCapacity(game.state.vault.level + details.levels);
                            statsSpan.innerText = `${formatMoney(capacity)} ➔ ${formatMoney(nextCapacity)}`;
                        }
                    }
                }
            } else if (btn.id === 'upgrade-queue-btn') {
                const details = game.getBulkUpgradeDetails('queue', null, currentUpgradeMode, game.state.queueUpgradeLevel || 1, game.state.cash);
                btn.classList.toggle('disabled', !details.canAfford);
                btn.disabled = !details.canAfford;
                const newText = `${translations[game.state.language || 'he'].upgrades.queueUpgradeBtn}${details.levels > 1 ? ' +' + details.levels : ''}<br>${formatMoney(details.cost)}`;
                if (btn.innerHTML !== newText) {
                    btn.innerHTML = newText;
                    const card = btn.closest('.upgrade-card');
                    if (card) {
                        const titleEl = card.querySelector('.card-title');
                        if (titleEl) {
                            titleEl.innerText = `${translations[game.state.language || 'he'].upgrades.queueTitle(game.state.queueUpgradeLevel || 1)}${details.levels > 1 ? ` (+${details.levels})` : ''}`;
                        }
                        const statsSpan = card.querySelector('.card-stats span');
                        if (statsSpan) {
                            const capacity = game.getQueueCapacity(game.state.queueUpgradeLevel || 1);
                            const nextCapacity = game.getQueueCapacity((game.state.queueUpgradeLevel || 1) + details.levels);
                            statsSpan.innerText = `${capacity} ${translations[game.state.language || 'he'].upgrades.clientsShort} ➔ ${nextCapacity} ${translations[game.state.language || 'he'].upgrades.clientsShort}`;
                        }
                    }
                }
            }
        });
    } else if (activeTab === 'managers') {
        const container = document.getElementById('tab-managers');
        if (!container) return;
        const buttons = container.querySelectorAll('.buy-btn');
        const lang = game.state.language || 'he';
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
                    const newText = `${translations[lang].upgradeLabel}${details.levels > 1 ? ' +' + details.levels : ''}<br>${formatMoney(details.cost)}`;
                    if (btn.innerHTML !== newText) {
                        btn.innerHTML = newText;
                    }

                    const card = btn.closest('.upgrade-card');
                    if (card) {
                        const lvlBadge = card.querySelector('.mgr-lvl-badge');
                        if (lvlBadge) {
                            lvlBadge.innerText = `Lv ${mgr.level}${details.levels > 1 ? ` (+${details.levels})` : ''}`;
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
                            let s1 = '', s2 = '';
                            if (type === 'customer') {
                                s1 = `+${6 * mgr.level}%`;
                                s2 = `+${3 * mgr.level}%`;
                            } else if (type === 'finance') {
                                s1 = lang === 'he' ? 'אוטומטי' : (lang === 'es' ? 'Auto' : (lang === 'ru' ? 'Авто' : 'Auto'));
                                s2 = `+${5 * mgr.level}%`;
                            } else if (type === 'operations') {
                                s1 = `+${4 * mgr.level}%`;
                                s2 = `+${3 * mgr.level}%`;
                            } else if (type === 'service') {
                                s1 = `+${5 * mgr.level}%`;
                                s2 = `+${4 * mgr.level}%`;
                            } else if (type === 'vip') {
                                s1 = `+${7 * mgr.level}%`;
                                s2 = `+${4 * mgr.level}%`;
                            } else if (type === 'marketing') {
                                s1 = `+${10 * mgr.level}%`;
                                s2 = `+${mgr.level}`;
                            }
                            statVals[0].innerText = s1;
                            statVals[1].innerText = s2;
                        }

                        const footerVal = card.querySelector('.mgr-footer-val');
                        if (footerVal) {
                            const eps = game.getEarningsPerSecond();
                            let contribution = 0;
                            if (isHired) {
                                if (type === 'customer') contribution = 0.03 * mgr.level;
                                else if (type === 'finance') contribution = 0.05 * mgr.level;
                                else if (type === 'operations') contribution = 0.02 * mgr.level;
                                else if (type === 'service') contribution = 0.04 * mgr.level;
                                else if (type === 'vip') contribution = 0.07 * mgr.level;
                                else if (type === 'marketing') contribution = 0.05 * mgr.level;
                            }
                            const extraHourly = eps * 3600 * contribution;
                            const perHourStr = lang === 'he' ? 'לשעה' : (lang === 'es' ? '/ h' : (lang === 'ru' ? '/ ч' : '/ hr'));
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
                const canBuy = game.state.cash >= cost;
                btn.classList.toggle('disabled', !canBuy);
                btn.disabled = !canBuy;
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
    window.refreshAllTabs = refreshAllTabs;
    window.updateButtonAffordability = updateButtonAffordability;
})(window);







