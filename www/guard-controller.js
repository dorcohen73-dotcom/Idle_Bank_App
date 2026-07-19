// Guard patrol state machine — extracted verbatim from IdleBankGame.update() and
// IdleBankGame.triggerGuard() (REFACTOR_PLAN phase 1). Operates directly on
// game.state.guards / game.state.tellers / game.state.vault; no state-shape or
// behavior changes. game.js keeps thin facades (triggerGuard) for the UI layer.
class GuardController {
    constructor(game) {
        this.game = game;
    }

    // Manual "send guard now" action (dispatch button in the UI).
    trigger(id) {
        const game = this.game;
        const guard = game.state.guards[id];
        if (!guard || !guard.unlocked || guard.state !== 'idle') return false;

        const vaultCapacity = game.getVaultCapacity(game.state.vault.level);
        const vaultSpaceLeft = vaultCapacity - game.state.vault.cashStored;

        // Build ordered queue of ALL unlocked tellers for visual patrol
        const queue = [];
        game.state.tellers.forEach((t, idx) => {
            if (t.unlocked) queue.push(idx);
        });

        if (queue.length > 0 && vaultSpaceLeft > 0) {
            guard.tellerVisitQueue = queue;
            guard.targetTellerIndex = queue[0];
            guard.carriedAmount = 0;
            guard.loadedCash = 0;
            guard.segmentPosition = guard.segmentPosition || guard.position || GAME_CONFIG.GUARD_VAULT_ANCHOR;
            guard.state = 'moving_to_teller_' + queue[0];
            guard.timer = 0;
            window.gameAudio.playClick();
            return true;
        }
        return false;
    }

    // Per-tick state machine: idle → moving_to_teller_N → collecting_from_teller_N
    // (repeat per teller) → moving_to_vault → depositing → idle
    update(dt) {
        const game = this.game;
        // Update Guards state machine — multi-stop route
        // Route: idle → moving_to_teller_N → collecting_from_teller_N (repeat per teller) → moving_to_vault → depositing → idle
        const vaultCapacity = game.getVaultCapacity(game.state.vault.level);

        const _getTellerAnchor = (ti) => {
            const anchors = GAME_CONFIG.GUARD_TELLER_ANCHORS;
            if (anchors && anchors[ti] !== undefined) return anchors[ti];
            // Fallback for 8 tellers
            const fallback = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
            return fallback[ti] !== undefined ? fallback[ti] : 0.5;
        };
        const VAULT_ANCHOR = GAME_CONFIG.GUARD_VAULT_ANCHOR;

        game.state.guards.forEach(g => {
            if (!g.unlocked) return;

            const transitDuration = game.getGuardSpeed(g.level);
            const capacity = game.getGuardCapacity(g.level);
            const vaultSpaceLeft = vaultCapacity - game.state.vault.cashStored;

            // Ensure new fields exist (migration safety)
            if (!Array.isArray(g.tellerVisitQueue)) g.tellerVisitQueue = [];
            if (typeof g.level !== 'number' || isNaN(g.level)) g.level = 1;
            if (g.segmentPosition === undefined || isNaN(g.segmentPosition)) {
                g.segmentPosition = g.position || GAME_CONFIG.GUARD_VAULT_ANCHOR;
            }
            if (g.position === undefined || isNaN(g.position)) {
                g.position = g.segmentPosition;
            }
            if (typeof g.segmentPosition !== 'number' || isNaN(g.segmentPosition)) g.segmentPosition = g.position || 0;
            if (typeof g.carriedAmount !== 'number' || isNaN(g.carriedAmount))   g.carriedAmount = g.loadedCash || 0;
            if (typeof g.targetTellerIndex !== 'number' || isNaN(g.targetTellerIndex)) g.targetTellerIndex = 0;

            // Normalise legacy states that no longer exist
            if (g.state === 'moving_to_tellers' || g.state === 'collecting') {
                g.state = 'idle';
            }

            if (g.state === 'idle') {
                // ── IDLE ──────────────────────────────────────────────────────
                if (g.carriedAmount > 0) {
                    // Had leftover cargo (e.g. vault was full) — try depositing now
                    if (vaultSpaceLeft > 0) {
                        g.state = 'moving_to_vault';
                    }
                } else if (game.state.managers.operations && vaultSpaceLeft > 0) {
                    let hasCash = false;
                    for (let i = 0; i < game.state.tellers.length; i++) {
                        if (game.state.tellers[i] && game.state.tellers[i].unlocked && game.state.tellers[i].cashStored > 0) {
                            hasCash = true;
                            break;
                        }
                    }
                    if (hasCash) {
                        const queue = [];
                        game.state.tellers.forEach((t, idx) => {
                            if (t.unlocked) queue.push(idx);
                        });
                        g.tellerVisitQueue = queue;
                        g.targetTellerIndex = queue[0];
                        g.carriedAmount = 0;
                        g.state = 'moving_to_teller_' + queue[0];
                    }
                }

            } else if (g.state.startsWith('moving_to_teller_')) {
                // ── MOVING TO TELLER N ────────────────────────────────────────
                const ti = parseInt(g.state.slice('moving_to_teller_'.length), 10);
                const targetAnchor = _getTellerAnchor(ti);
                const curPos = g.segmentPosition;
                const dir = targetAnchor > curPos ? 1 : -1;
                const step = dt / transitDuration;
                g.segmentPosition = curPos + dir * step;

                const reached = dir > 0 ? g.segmentPosition >= targetAnchor
                                         : g.segmentPosition <= targetAnchor;
                if (reached) {
                    g.segmentPosition = targetAnchor;
                    g.targetTellerIndex = ti;
                    g.state = 'collecting_from_teller_' + ti;
                    g.timer = 0.4;
                }
                g.position = g.segmentPosition;

            } else if (g.state.startsWith('collecting_from_teller_')) {
                // ── COLLECTING FROM TELLER N ──────────────────────────────────
                g.timer -= dt;
                if (g.timer <= 0) {
                    const ti = parseInt(g.state.slice('collecting_from_teller_'.length), 10);
                    const teller = game.state.tellers[ti];
                    if (teller && teller.unlocked && teller.cashStored > 0) {
                        const spaceLeft = capacity - g.carriedAmount;
                        const taken = Math.min(teller.cashStored, spaceLeft);
                        teller.cashStored = Math.round((teller.cashStored - taken + Number.EPSILON) * 100) / 100;
                        g.carriedAmount = Math.round((g.carriedAmount + taken + Number.EPSILON) * 100) / 100;
                        // Store actual collected amount and source teller so ui-draw can display
                        // the correct floating text and coin animation when this state transition
                        // is detected (prev=collecting_from_teller_N → cur=moving_to_* or moving_to_vault).
                        g.lastCollectedAmount = taken;
                        g.lastCollectedTellerIndex = ti;
                    } else {
                        g.lastCollectedAmount = 0;
                        g.lastCollectedTellerIndex = ti;
                    }
                    // Remove this teller from the visit queue
                    g.tellerVisitQueue = g.tellerVisitQueue.filter(idx => idx !== ti);

                    // Check if capacity is already full
                    if (g.carriedAmount >= capacity) {
                        g.tellerVisitQueue = [];
                        g.state = 'moving_to_vault';
                    } else {
                        // Find next teller in order (1, 2, 3...)
                        let nextTi = -1;
                        for (let i = ti + 1; i < game.state.tellers.length; i++) {
                            const t = game.state.tellers[i];
                            if (t && t.unlocked) {
                                nextTi = i;
                                break;
                            }
                        }

                        if (nextTi >= 0) {
                            g.targetTellerIndex = nextTi;
                            g.state = 'moving_to_teller_' + nextTi;
                        } else {
                            // Done collecting — head to vault
                            g.tellerVisitQueue = [];
                            g.state = 'moving_to_vault';
                        }
                    }
                    // Sync loadedCash for UI / save compatibility
                    g.loadedCash = g.carriedAmount;
                }

            } else if (g.state === 'moving_to_vault') {
                // ── MOVING TO VAULT ───────────────────────────────────────────
                const curPos = g.segmentPosition;
                const dir = VAULT_ANCHOR > curPos ? 1 : -1;
                const step = dt / transitDuration;
                g.segmentPosition = curPos + dir * step;

                const reached = dir > 0 ? g.segmentPosition >= VAULT_ANCHOR
                                         : g.segmentPosition <= VAULT_ANCHOR;
                if (reached) {
                    g.segmentPosition = VAULT_ANCHOR;
                    g.state = 'depositing';
                    g.timer = 0.5;
                }
                g.position = g.segmentPosition;

            } else if (g.state === 'depositing') {
                // ── DEPOSITING ────────────────────────────────────────────────
                // C-12: vault completely full — go idle immediately
                if (vaultSpaceLeft <= 0) {
                    g.state = 'idle';
                } else {
                    g.timer -= dt;
                    if (g.timer <= 0) {
                        const spaceInVault = vaultCapacity - game.state.vault.cashStored;
                        if (spaceInVault <= 0) {
                            g.state = 'idle';
                        } else {
                            const depositAmount = Math.min(g.carriedAmount, spaceInVault);
                            game.state.vault.cashStored = Math.round((game.state.vault.cashStored + depositAmount + Number.EPSILON) * 100) / 100;
                            g.carriedAmount = Math.round((g.carriedAmount - depositAmount + Number.EPSILON) * 100) / 100;
                            g.loadedCash = g.carriedAmount;

                            if (g.carriedAmount > 0) {
                                // Vault partially full — retry next tick
                                g.timer = 0.5;
                            } else {
                                g.state = 'idle';
                                // guard_trips tracking: count completed deposit trips
                                game.state.guardTripsTotal = (game.state.guardTripsTotal || 0) + 1;
                            }
                        }
                    }
                }
            }
        });
    }
}
