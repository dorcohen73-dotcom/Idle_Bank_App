import { formatMoney } from './format.js';

let lastGuardStatusText = '';

// Per-frame refresh of the security guard runners (position/state) and the
// courier status label.
export function updateGuardsDisplay(lang) {
    const unlockedGuards = game.state.guards.filter(g => g.unlocked);
    if (unlockedGuards.length > 0) {
        DOM_CACHE.securityPath.style.display = 'flex';

        // Hide old static avatar and load
        if (DOM_CACHE.guardAvatar) DOM_CACHE.guardAvatar.style.display = 'none';
        if (DOM_CACHE.guardLoad) DOM_CACHE.guardLoad.style.display = 'none';

        // Reconciliation: remove extra guard-runner elements
        const currentGuardIds = unlockedGuards.map(g => g.id.toString());
        const existingRunners = Array.from(DOM_CACHE.securityPath.querySelectorAll('.guard-runner'));
        existingRunners.forEach(node => {
            const gid = node.getAttribute('data-guard-id');
            if (!currentGuardIds.includes(gid)) {
                DOM_CACHE.securityPath.removeChild(node);
            }
        });

        // Sync and render each unlocked guard
        unlockedGuards.forEach(g => {
            const gData = game.getGuardRenderData(g.id);
            if (!gData) return;

            let runner = DOM_CACHE.securityPath.querySelector(`.guard-runner[data-guard-id="${gData.id}"]`);
            if (!runner) {
                runner = document.createElement('div');
                runner.className = 'guard-runner';
                runner.setAttribute('data-guard-id', gData.id);
                runner.style.willChange = 'transform';

                const avatarEl = document.createElement('div');
                avatarEl.className = 'guard-runner-avatar';

                runner.appendChild(avatarEl);

                const loadEl = document.createElement('div');
                loadEl.className = 'guard-runner-load';
                runner.appendChild(loadEl);

                DOM_CACHE.securityPath.appendChild(runner);
            }

            // Stagger position and height to create a convoy/row effect so guards don't overlap
            let visualPosition = gData.position;
            const isMovingToTeller = gData.state.startsWith('moving_to_teller_');
            const isCollecting = gData.state.startsWith('collecting_from_teller_');

            if (isMovingToTeller) {
                visualPosition = Math.max(0, gData.position - (gData.id * 0.07));
            } else if (gData.state === 'moving_to_vault') {
                visualPosition = Math.min(1.0, gData.position + (gData.id * 0.07));
            } else if (gData.state === 'idle' || gData.state === 'depositing') {
                visualPosition = gData.position + (gData.id * 0.04);
            } else if (isCollecting) {
                visualPosition = gData.position - (gData.id * 0.04);
            }

            const percentRight = 10 + (visualPosition * 75);
            const isLtr = document.documentElement.dir === 'ltr';
            if (isLtr) {
                runner.style.right = '';
                runner.style.left = `${percentRight}%`;
            } else {
                runner.style.left = '';
                runner.style.right = `${percentRight}%`;
            }
            // Vertical offset to avoid overlapping
            runner.style.top = `calc(50% + ${(gData.id - 1) * 12}px)`;

            // Clean previous state and direction classes
            runner.className = 'guard-runner';
            runner.classList.add(`state-${gData.state}`);
            if (isMovingToTeller) runner.classList.add('state-moving_to_tellers');
            if (isCollecting) runner.classList.add('state-collecting');

            if (isMovingToTeller) {
                runner.classList.add('moving-left');
            } else if (gData.state === 'moving_to_vault') {
                runner.classList.add('moving-right');
            }

            // Avatar text intentionally not cleared to preserve emoji fallback

            // Update load label bubble above
            const loadEl = runner.querySelector('.guard-runner-load');
            const loadText = gData.loadedCash > 0 ? formatMoney(gData.loadedCash) : '';
            if (loadEl.innerText !== loadText) {
                loadEl.innerText = loadText;
                loadEl.style.display = gData.loadedCash > 0 ? 'block' : 'none';
            }
        });

        // Update security status label based on the active runner
        const firstMoving = unlockedGuards.find(g => {
            const gData = game.getGuardRenderData(g.id);
            return gData && gData.state !== 'idle';
        });
        const activeGuard = firstMoving || unlockedGuards[0];
        const activeData = activeGuard ? game.getGuardRenderData(activeGuard.id) : null;
        const tObjGuard = translations[lang].guardStates;
        if (DOM_CACHE.guardStatus && activeData) {
            const unlockedCount = unlockedGuards.length;
            const totalCount = game.state.guards.length;

            // Map the language-specific singular/plural label (from locales.js)
            const tObjLang = translations[lang];
            const courierLabel = unlockedCount > 1
                ? (tObjLang.guardsLabel || "Couriers")
                : (tObjLang.guardLabel || "Courier");

            // Get raw state text
            let stateText = tObjGuard[activeData.state] || tObjGuard.idle;

            // Clean up redundant subjects if they exist at the beginning of the translation state text
            if (lang === 'he') {
                stateText = stateText.replace(/^(בלדר|שומר)\s+/, '');
            } else if (lang === 'en') {
                stateText = stateText.replace(/^Guard\s+/, '');
            } else if (lang === 'es') {
                stateText = stateText.replace(/^Guardia\s+/, '');
            } else if (lang === 'ru') {
                stateText = stateText.replace(/^(Охранник|Инкассатор)\s+/, '');
            }

            // Capitalize first letter if necessary (English/Spanish)
            if (lang === 'en' || lang === 'es') {
                stateText = stateText.charAt(0).toUpperCase() + stateText.slice(1);
            }

            const newGuardStatusText = `${courierLabel} (${unlockedCount}/${totalCount}): ${stateText}`;
            if (lastGuardStatusText !== newGuardStatusText) {
                DOM_CACHE.guardStatus.innerText = newGuardStatusText;
                lastGuardStatusText = newGuardStatusText;
            }
        }
    } else {
        DOM_CACHE.securityPath.style.display = 'none';
    }
}
