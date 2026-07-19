import { beforeEach, describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Same environment bootstrap as game.test.js — see comments there.
global.window = {
    gameAudio: {
        playClick: () => {},
        playUnlock: () => {},
        playChaChing: () => {},
        toggleMute: () => false,
        isMuted: true,
        init: () => {}
    },
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    }
};
global.document = { querySelector: () => null };

const scriptOrder = ['config.js', 'locales.js', 'economy-manager.js', 'save-manager.js', 'mission-controller.js', 'achievement-controller.js', 'guard-controller.js', 'customer-flow-controller.js', 'prestige-controller.js', 'shop-controller.js', 'game.js'];
const combinedCode = scriptOrder
    .map(file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'))
    .join('\n');
new Function('window', combinedCode)(global.window);

const IdleBankGame = global.window.IdleBankGame;
const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

// Regression suite for the "tellers stuck at $0" family of bugs: the money path
// teller tick reward -> guard collection -> vault deposit must neither lose nor
// invent cash, and must never leave NaN behind.
describe('Tick loop — teller cash generation', () => {
    let game;

    beforeEach(() => {
        game = new IdleBankGame();
        game.customerQueue = [];
        game.customerSpawnTimer = 0;
    });

    test('teller banks exactly one tick reward when finishing a customer', () => {
        const t = game.state.tellers[0];
        t.unlocked = true;
        t.isProcessing = true;
        t.processingTimeLeft = 0.01;
        t.cashStored = 0;
        t.customerType = 'normal';
        const servedBefore = game.state.stats.clientsServed;

        // Mirror update()'s reward formula
        const base = game.getCurrentBaseReward() || 10;
        let expectedReward = base * (game.getTotalMultiplier() || 1);
        if (isNaN(expectedReward)) expectedReward = 10;
        const cap = game.getTellerCapacity(t.level) || 150;
        const expected = Math.min(round2(expectedReward), cap);

        game.update(0.02);

        expect(t.isProcessing).toBe(false);
        expect(t.cashStored).toBeCloseTo(expected, 2);
        expect(game.state.stats.clientsServed).toBe(servedBefore + 1);
    });

    test('VIP customer pays 3x and bumps vipServed', () => {
        const t = game.state.tellers[0];
        t.unlocked = true;
        t.isProcessing = true;
        t.processingTimeLeft = 0.01;
        t.cashStored = 0;
        t.customerType = 'vip';
        const vipBefore = game.state.stats.vipServed || 0;

        const base = game.getCurrentBaseReward() || 10;
        let reward = base * (game.getTotalMultiplier() || 1);
        if (isNaN(reward)) reward = 10;
        const cap = game.getTellerCapacity(t.level) || 150;
        const expected = Math.min(round2(reward * 3.0), cap);

        game.update(0.02);

        expect(t.cashStored).toBeCloseTo(expected, 2);
        expect(game.state.stats.vipServed).toBe(vipBefore + 1);
    });

    test('cashStored is clamped to teller capacity', () => {
        const t = game.state.tellers[0];
        const cap = game.getTellerCapacity(t.level) || 150;
        t.unlocked = true;
        t.isProcessing = true;
        t.processingTimeLeft = 0.01;
        t.cashStored = cap - 0.01;
        t.customerType = 'normal';

        game.update(0.02);

        expect(t.cashStored).toBe(cap);
    });

    test('NaN cashStored is healed, never rendered', () => {
        const t = game.state.tellers[0];
        t.unlocked = true;
        t.isProcessing = false;
        t.cashStored = NaN;
        t.processingTimeLeft = NaN;
        // The NaN-heal pass runs inside the customer-assignment loop, so a
        // customer must be waiting for the heal to trigger.
        game.customerQueue = [{ type: 'normal', seed: 1 }];

        game.update(0.05);

        expect(Number.isNaN(t.cashStored)).toBe(false);
        expect(Number.isNaN(t.processingTimeLeft)).toBe(false);
    });
});

describe('Guard state machine — collection & deposit', () => {
    let game;

    beforeEach(() => {
        game = new IdleBankGame();
        game.customerQueue = [];
        game.customerSpawnTimer = 0;
        // Finance manager auto-drains the vault every tick — disable so deposit
        // assertions can read vault.cashStored directly.
        game.state.managers.finance = false;
    });

    test('guard sweeps a teller: takes min(cash, capacity), nothing lost', () => {
        const g = game.state.guards[0];
        const t = game.state.tellers[0];
        g.unlocked = true;
        g.level = 1;
        g.carriedAmount = 0;
        g.tellerVisitQueue = [0];
        g.state = 'collecting_from_teller_0';
        g.timer = 0.01;
        const capacity = game.getGuardCapacity(g.level);
        t.unlocked = true;
        t.isProcessing = false;
        t.cashStored = 500;
        const expectedTaken = round2(Math.min(500, capacity));

        game.update(0.02);

        expect(t.cashStored).toBe(round2(500 - expectedTaken));
        expect(g.carriedAmount).toBe(expectedTaken);
        expect(g.lastCollectedAmount).toBe(expectedTaken);
        expect(g.loadedCash).toBe(g.carriedAmount);
        // Conservation: teller + cargo unchanged in total
        expect(round2(t.cashStored + g.carriedAmount)).toBe(500);
    });

    test('collection respects guard capacity and conserves money', () => {
        const g = game.state.guards[0];
        const t = game.state.tellers[0];
        const capacity = game.getGuardCapacity(g.level || 1);
        t.unlocked = true;
        t.isProcessing = false;
        t.cashStored = 500;
        g.unlocked = true;
        g.carriedAmount = round2(capacity - 100);
        g.tellerVisitQueue = [0];
        g.state = 'collecting_from_teller_0';
        g.timer = 0.01;
        const totalBefore = round2(t.cashStored + g.carriedAmount);

        game.update(0.02);

        expect(g.carriedAmount).toBe(capacity);
        expect(t.cashStored).toBe(400);
        expect(round2(t.cashStored + g.carriedAmount)).toBe(totalBefore);
        // Full guard must head to the vault, not keep collecting
        expect(g.state).toBe('moving_to_vault');
    });

    test('deposit moves full cargo into the vault and completes the trip', () => {
        const g = game.state.guards[0];
        g.unlocked = true;
        g.carriedAmount = 300;
        g.state = 'depositing';
        g.timer = 0.01;
        game.state.vault.cashStored = 0;
        const tripsBefore = game.state.guardTripsTotal || 0;

        game.update(0.02);

        expect(game.state.vault.cashStored).toBe(300);
        expect(g.carriedAmount).toBe(0);
        expect(g.state).toBe('idle');
        expect(game.state.guardTripsTotal).toBe(tripsBefore + 1);
    });

    test('full vault: guard goes idle and keeps its cargo (no money destroyed)', () => {
        const g = game.state.guards[0];
        const vaultCap = game.getVaultCapacity(game.state.vault.level);
        g.unlocked = true;
        g.carriedAmount = 300;
        g.state = 'depositing';
        g.timer = 0.5;
        game.state.vault.cashStored = vaultCap;

        game.update(0.02);

        expect(g.state).toBe('idle');
        expect(g.carriedAmount).toBe(300);
        expect(game.state.vault.cashStored).toBe(vaultCap);
    });
});
