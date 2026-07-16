import { formatMoney, fastFormat, cachedLang } from './format.js';

let lastCash = -1;
let lastEps = -1;
let lastShares = -1;
let lastMultiplier = -1;
let lastBranch = -1;
let lastLang = '';

// Upper stats bar: cash / EPS / shares / multiplier / branch name.
export function updateHeaderStats(lang, tObj) {
    if (game.state.cash !== lastCash || lang !== lastLang) {
        lastCash = game.state.cash;
        DOM_CACHE.cash.innerText = formatMoney(game.state.cash);
        if (typeof window.checkPrestigeTip === 'function') window.checkPrestigeTip();
    }

    const currentEps = game.getEarningsPerSecond();
    if (currentEps !== lastEps || lang !== lastLang) {
        lastEps = currentEps;
        DOM_CACHE.eps.innerText = formatMoney(currentEps);
    }

    if (game.state.shares !== lastShares || lang !== lastLang) {
        lastShares = game.state.shares;
        DOM_CACHE.shares.innerText = game.state.shares.toLocaleString();
    }

    const mult = game.getTotalMultiplier();
    if (mult !== lastMultiplier || lang !== lastLang) {
        lastMultiplier = mult;
        DOM_CACHE.multiplier.innerText = fastFormat(parseFloat(mult.toFixed(1)), cachedLang) + 'x';
    }

    if (game.state.currentBranch !== lastBranch || lang !== lastLang) {
        lastBranch = game.state.currentBranch;
        DOM_CACHE.branchName.innerText = (tObj.bankPrefix || '') + tObj.branches.names[game.state.currentBranch];
    }

    lastLang = lang;
}

// Refresh advertising campaign dynamic display state (slider + max label).
export function updateAdCampaignDisplay() {
    if (DOM_CACHE.advSlider) {
        const maxBudget = game.getAdMaxBudget();
        const budget = game.state.advBudget || 0;
        if (budget === 0) {
            DOM_CACHE.advSlider.value = 0;
        } else {
            DOM_CACHE.advSlider.value = Math.round(1000 * (budget / maxBudget));
        }

        const maxLabelEl = DOM_CACHE.advLimitMax;
        if (maxLabelEl) {
            maxLabelEl.innerText = formatMoney(maxBudget);
        }
    }
    updateAdvDisplay(game.state.advBudget || 0);
}

// Refresh the 2x boost button — active countdown, offer countdown, or idle label.
export function updateBoostButtonDisplay(tObj) {
    if (DOM_CACHE.boostBtn) {
        if (game.state.boost2xTimeLeft && game.state.boost2xTimeLeft > 0) {
            DOM_CACHE.boostBtn.innerText = tObj.boostActive(formatTime(game.state.boost2xTimeLeft));
            DOM_CACHE.boostBtn.setAttribute('data-time', formatTime(game.state.boost2xTimeLeft));
            DOM_CACHE.boostBtn.classList.add('active');
            DOM_CACHE.boostBtn.classList.remove('offer');
        } else {
            DOM_CACHE.boostBtn.removeAttribute('data-time');
            const nowMs = Date.now();
            const offerEnd = window._boostOfferEndTime || 0;
            if (offerEnd > nowMs) {
                const offerSec = Math.ceil((offerEnd - nowMs) / 1000);
                const boostOfferFn = tObj.boostOfferText;
                DOM_CACHE.boostBtn.innerText = typeof boostOfferFn === 'function'
                    ? boostOfferFn(formatTime(offerSec))
                    : `⚡ OFFER! ${formatTime(offerSec)}`;
                DOM_CACHE.boostBtn.classList.add('offer');
                DOM_CACHE.boostBtn.classList.remove('active');
            } else {
                DOM_CACHE.boostBtn.innerText = tObj.boostBtn || "⚡ BOOST x2";
                DOM_CACHE.boostBtn.classList.remove('active', 'offer');
            }
        }
    }
}

// Update customer queue count display and visual status indicators (Premium Redesign)
export function updateQueueDisplay(tObj) {
    const capLabel = DOM_CACHE.queueCapLabel;
    const fillBar  = DOM_CACHE.queueFillBar;
    const statText = DOM_CACHE.queueStatText;
    const statIcon = DOM_CACHE.queueStatIcon;
    const elQueueZone = DOM_CACHE.queueZone;

    if (capLabel) {
        const queueData = game.getQueueRenderData();
        const maxCap = queueData.capacity;
        const currentLen = queueData.currentLen;

        capLabel.textContent = `${currentLen}/${maxCap}`;

        if (fillBar) {
            const pct = Math.min(100, Math.max(0, (currentLen / maxCap) * 100));
            fillBar.style.width = `${pct}%`;
            fillBar.setAttribute('aria-valuenow', Math.round(pct));
        }

        const isTooLow = currentLen <= 1;
        const isTooHigh = currentLen >= maxCap - 1 || currentLen / maxCap >= 0.8;

        if (isTooLow) {
            if (elQueueZone) {
                elQueueZone.classList.remove('status-ok');
                elQueueZone.classList.add('status-alert');
            }
            if (statText) statText.textContent = tObj.alertQueueEmpty;
            if (statIcon) {
                statIcon.textContent = '❕';
                statIcon.style.color = 'var(--danger-red)';
            }
        } else if (isTooHigh) {
            if (elQueueZone) {
                elQueueZone.classList.remove('status-ok');
                elQueueZone.classList.add('status-alert');
            }
            const spotsLeft = maxCap - currentLen;
            if (statText) statText.textContent = tObj.alertQueueAlmostFull ? tObj.alertQueueAlmostFull(spotsLeft) : spotsLeft + ' left';
            if (statIcon) {
                statIcon.textContent = '❕';
                statIcon.style.color = 'var(--danger-red)';
            }
        } else {
            if (elQueueZone) {
                elQueueZone.classList.remove('status-alert');
                elQueueZone.classList.add('status-ok');
            }
            if (statText) statText.textContent = tObj.alertQueueOk;
            if (statIcon) {
                statIcon.textContent = '✔';
                statIcon.style.color = 'var(--money-green)';
            }
        }
    }
}
