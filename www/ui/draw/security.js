import { getVaultTargetRect, animateCoins } from './animations.js';
import { formatMoney } from './format.js';
import { TELLER_DOM_CACHE } from './bank-floor.js';

let _guardAnimTriggers = [];
let prevGuardStates = {};
let lastGuardStatusText = '';

// Per-frame refresh of the security guard runners (position/state), the courier
// status label, and the coin-carrying animations triggered by guard state changes.
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

    // Dynamic Coin animations for parallel guards - Batched Reads/Writes to avoid layout reflows
    _guardAnimTriggers.length = 0;

    game.state.guards.forEach((g, idx) => {
        if (!g.unlocked) return;
        const gData = game.getGuardRenderData(g.id);
        if (!gData) return;
        const prevState = prevGuardStates[idx];
        if (prevState !== gData.state) {
            _guardAnimTriggers.push({
                g,
                gData,
                idx,
                prevState
            });
        }
    });

    if (_guardAnimTriggers.length > 0) {
        // Step 1: Batch all DOM Reads (getBoundingClientRect)
        const reads = [];
        _guardAnimTriggers.forEach(item => {
            const { g, gData, prevState } = item;
            const prevIsMoving = prevState && prevState.startsWith('moving_to_teller_');
            const currIsCollecting = gData.state.startsWith('collecting_from_teller_');

            if (prevIsMoving && currIsCollecting) {
                const runner = DOM_CACHE.securityPath.querySelector(`.guard-runner[data-guard-id="${g.id}"]`);
                const rectGuard = runner ? runner.getBoundingClientRect() : (DOM_CACHE.guardAvatar ? DOM_CACHE.guardAvatar.getBoundingClientRect() : null);

                const tellerRects = [];
                game.state.tellers.forEach(t => {
                    const tData = game.getTellerRenderData(t.id);
                    if (tData && tData.unlocked && tData.cashStored > 0) {
                        const tCache = TELLER_DOM_CACHE[t.id];
                        const tNode = tCache ? tCache.node : null;
                        if (tNode) {
                            tellerRects.push({
                                node: tNode
                            });
                        }
                    }
                });

                reads.push({
                    type: 'collecting',
                    g,
                    rectGuard,
                    tellers: tellerRects.map(tInfo => ({
                        rect: tInfo.node.getBoundingClientRect()
                    }))
                });
            } else if (prevState === 'moving_to_vault' && gData.state === 'depositing') {
                const runner = DOM_CACHE.securityPath.querySelector(`.guard-runner[data-guard-id="${g.id}"]`);
                const rectGuard = runner ? runner.getBoundingClientRect() : (DOM_CACHE.guardAvatar ? DOM_CACHE.guardAvatar.getBoundingClientRect() : null);
                const rectVault = getVaultTargetRect();

                reads.push({
                    type: 'depositing',
                    g,
                    rectGuard,
                    rectVault
                });
            }
        });

        // Step 2: Batch all DOM Writes (triggering animations)
        reads.forEach(read => {
            if (read.type === 'collecting') {
                if (read.rectGuard) {
                    read.tellers.forEach(tInfo => {
                        animateCoins(tInfo.rect, read.rectGuard, 4, 'coin');
                    });
                }
            } else if (read.type === 'depositing') {
                if (read.rectGuard && read.rectVault) {
                    animateCoins(read.rectGuard, read.rectVault, 6, 'coin');
                }
            }
        });

        // Update previous state cache
        _guardAnimTriggers.forEach(item => {
            prevGuardStates[item.idx] = item.gData.state;
        });
    }
}
