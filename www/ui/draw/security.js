import { formatMoney } from './format.js';

let anchorCache = null;
let lastCacheTime = 0;

function getCourierPos(segmentPosition, isMovingToVault = false, lastTellerIdx = -1) {
    const now = Date.now();
    if (!anchorCache || now - lastCacheTime > 2000) {
        const floorEl = document.getElementById('bank-floor-section');
        if (floorEl) {
            const floorRect = floorEl.getBoundingClientRect();
            const points = [];
            
            // Teller anchors: val 0.1, 0.2, 0.3, ... 0.8
            const fallback = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
            const tellerEls = document.querySelectorAll('.teller-counter');
            tellerEls.forEach((el, idx) => {
                const rect = el.getBoundingClientRect();
                points.push({
                    val: fallback[idx] || 0.9,
                    x: rect.left - floorRect.left + rect.width / 2,
                    y: rect.top - floorRect.top + rect.height / 2 + 40 // Offset slightly below teller desk
                });
            });
            
            points.sort((a,b) => a.val - b.val);
            anchorCache = points;
            lastCacheTime = now;
        }
    }
    
    const floorEl = document.getElementById('bank-floor-section');
    if (!floorEl || !anchorCache || anchorCache.length === 0) return {x: 0, y: 0};
    
    // Dynamically calculate vault position every frame because on mobile it may be fixed/sticky
    let vaultEl = document.getElementById('vault-graphic');
    if (window.innerWidth <= 768) {
        const miniVault = document.getElementById('vault-mini-icon');
        if (miniVault && miniVault.offsetParent !== null) vaultEl = miniVault;
    }
    
    const floorRect = floorEl.getBoundingClientRect();
    const vaultRect = vaultEl ? vaultEl.getBoundingClientRect() : {left: 0, top: 0, width: 0, height: 0};
    const dynamicVault = {
        val: 0.0,
        x: vaultRect.left - floorRect.left + (vaultRect.width / 2),
        y: vaultRect.top - floorRect.top + (vaultRect.height / 2)
    };

    const points = [dynamicVault, ...anchorCache];
    
    if (isMovingToVault && lastTellerIdx >= 0 && points.length > 1) {
        const vault = points[0];
        // lastTellerIdx is 0-indexed, but points[0] is vault. So points[lastTellerIdx + 1] is the teller.
        const startPoint = points[lastTellerIdx + 1] || points[points.length - 1];
        
        const totalDist = startPoint.val - vault.val;
        let t = 0;
        if (totalDist > 0) {
            t = (startPoint.val - segmentPosition) / totalDist;
        }
        t = Math.max(0, Math.min(1, t));
        
        return {
            x: startPoint.x + t * (vault.x - startPoint.x),
            y: startPoint.y + t * (vault.y - startPoint.y)
        };
    }
    
    if (segmentPosition <= points[0].val) return {x: points[0].x, y: points[0].y};
    if (segmentPosition >= points[points.length-1].val) return {x: points[points.length-1].x, y: points[points.length-1].y};
    
    for (let i = 0; i < points.length - 1; i++) {
        if (segmentPosition >= points[i].val && segmentPosition <= points[i+1].val) {
            const p1 = points[i];
            const p2 = points[i+1];
            let t = (segmentPosition - p1.val) / (p2.val - p1.val);
            
            // Check if they are on the same vertical row or close to it
            if (Math.abs(p1.y - p2.y) < 60) {
                return {
                    x: p1.x + t * (p2.x - p1.x),
                    y: p1.y + t * (p2.y - p1.y)
                };
            }
            
            // Manhattan routing with an aisle
            let aisleY;
            if (p1.val === 0.0 || p2.val === 0.0) {
                // If moving from/to vault, use the vault's Y as the main aisle
                aisleY = (p1.val === 0.0) ? p1.y : p2.y;
            } else {
                // Between two teller rows, aisle is in the middle
                aisleY = (p1.y + p2.y) / 2;
            }
            
            const dist1 = Math.abs(aisleY - p1.y);
            const dist2 = Math.abs(p2.x - p1.x);
            const dist3 = Math.abs(p2.y - aisleY);
            const totalDist = dist1 + dist2 + dist3;
            
            if (totalDist === 0) return {x: p1.x, y: p1.y};
            
            const t1 = dist1 / totalDist;
            const t2 = dist2 / totalDist;
            
            if (t <= t1) {
                const subT = t1 === 0 ? 0 : t / t1;
                return { x: p1.x, y: p1.y + subT * (aisleY - p1.y) };
            } else if (t <= t1 + t2) {
                const subT = t2 === 0 ? 0 : (t - t1) / t2;
                return { x: p1.x + subT * (p2.x - p1.x), y: aisleY };
            } else {
                const t3 = 1 - t1 - t2;
                const subT = t3 <= 0 ? 0 : (t - t1 - t2) / t3;
                return { x: p2.x, y: aisleY + subT * (p2.y - aisleY) };
            }
        }
    }
    return {x: 0, y: 0};
}

// Per-frame refresh of the security guard runners
export function updateGuardsDisplay(lang) {
    const unlockedGuards = game.state.guards.filter(g => g.unlocked);
    const bankFloor = document.getElementById('bank-floor-section');
    if (!bankFloor) return;

    if (unlockedGuards.length > 0) {
        // Reconciliation: remove extra guard-runner elements
        const currentGuardIds = unlockedGuards.map(g => g.id.toString());
        const existingRunners = Array.from(bankFloor.querySelectorAll('.guard-runner'));
        existingRunners.forEach(node => {
            const gid = node.getAttribute('data-guard-id');
            if (!currentGuardIds.includes(gid)) {
                bankFloor.removeChild(node);
            }
        });

        // Sync and render each unlocked guard
        unlockedGuards.forEach(g => {
            const gData = game.getGuardRenderData(g.id);
            if (!gData) return;

            let runner = bankFloor.querySelector(`.guard-runner[data-guard-id="${gData.id}"]`);
            if (!runner) {
                runner = document.createElement('div');
                runner.className = 'guard-runner';
                runner.setAttribute('data-guard-id', gData.id.toString());
                runner.style.zIndex = '310';
                runner.style.willChange = 'transform, left, top';
                runner.style.position = 'absolute';
                
                const avatarEl = document.createElement('div');
                avatarEl.className = 'guard-runner-avatar';
                runner.appendChild(avatarEl);

                const loadEl = document.createElement('div');
                loadEl.className = 'guard-runner-load';
                runner.appendChild(loadEl);

                bankFloor.appendChild(runner);
            }

            const isMovingToTeller = gData.state.startsWith('moving_to_teller_');
            const isCollecting = gData.state.startsWith('collecting_from_teller_');
            
            const isMovingToVault = gData.state === 'moving_to_vault';
            
            const pos = getCourierPos(gData.position, isMovingToVault, gData.lastCollectedTellerIndex);
            
            // Stagger position so guards don't exactly overlap
            const offsetX = (gData.id * 10);
            const offsetY = (gData.id * 10);
            
            runner.style.left = `${pos.x + offsetX}px`;
            runner.style.top = `${pos.y + offsetY}px`;
            runner.style.transform = `translate(-50%, -50%)`;

            // Clean previous state and direction classes
            runner.className = 'guard-runner';
            runner.classList.add(`state-${gData.state}`);
            if (isMovingToTeller) runner.classList.add('state-moving_to_tellers');
            if (isCollecting) runner.classList.add('state-collecting');

            // Figure out facing direction: if X is moving left or right
            // We can infer direction from previous position or just look at state
            if (isMovingToTeller) {
                runner.classList.add('moving-left');
            } else if (gData.state === 'moving_to_vault') {
                runner.classList.add('moving-right');
            }

            // Update load label bubble
            const loadEl = runner.querySelector('.guard-runner-load');
            const loadText = gData.loadedCash > 0 ? formatMoney(gData.loadedCash) : '';
            if (loadEl.innerText !== loadText) {
                loadEl.innerText = loadText;
                loadEl.style.display = gData.loadedCash > 0 ? 'block' : 'none';
            }
        });

    } else {
        // Cleanup if no guards
        const existingRunners = Array.from(bankFloor.querySelectorAll('.guard-runner'));
        existingRunners.forEach(node => bankFloor.removeChild(node));
    }
}
