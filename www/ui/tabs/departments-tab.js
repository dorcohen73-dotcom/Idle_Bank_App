import { statLabels } from './tab-shared.js';

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
export function renderDepartmentsTab() {
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
