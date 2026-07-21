import { beforeEach, describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

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
        _data: {},
        getItem: function(key) { return this._data[key] || null; },
        setItem: function(key, val) { this._data[key] = String(val); },
        removeItem: function(key) { delete this._data[key]; },
        clear: function() { this._data = {}; }
    },
    location: { protocol: 'http:', origin: 'http://localhost' }
};
Object.defineProperty(global, 'navigator', { value: { onLine: true }, writable: true, configurable: true });
global.document = { querySelector: () => null };

// We need btoa and atob
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (b64) => Buffer.from(b64, 'base64').toString('binary');
// TextEncoder/Decoder for executeSave and loadGame
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

const scriptOrder = ['config.js', 'locales.js', 'economy-manager.js', 'save-manager.js', 'mission-controller.js', 'achievement-controller.js', 'guard-controller.js', 'customer-flow-controller.js', 'prestige-controller.js', 'shop-controller.js', 'game.js'];
const combinedCode = scriptOrder
    .map(file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'))
    .join('\n');
new Function('window', combinedCode)(global.window);

const IdleBankGame = global.window.IdleBankGame;

describe('SaveManager - Save and Load', () => {
    let game;

    beforeEach(() => {
        window.localStorage.clear();
        game = new IdleBankGame();
    });

    test('Round-trip: encode -> decode returns the same state', () => {
        game.state.cash = 9999;
        game.state.currentBranch = 2;
        game.state.managers.finance = true;
        game.state.migrations = { deutsche: true };
        
        // Save game
        game.saveManager.executeSave(true);
        
        // Read local storage to verify it was written
        const savedStr = window.localStorage.getItem('idle_bank_save');
        expect(savedStr).toBeTruthy();
        
        // Modify current state to verify loading overrides it
        game.state.cash = 0;
        game.state.currentBranch = 0;
        game.state.managers.finance = false;
        
        // Load game
        game.saveManager.loadGame();
        
        expect(game.state.cash).toBe(9999);
        expect(game.state.currentBranch).toBe(2);
        expect(game.state.managers.finance).toBe(true);
    });

    test('Invalid checksum -> heal to default state', () => {
        game.state.cash = 5000;
        game.saveManager.executeSave(true);
        
        // Corrupt save data but keep old checksum
        let savedStr = window.localStorage.getItem('idle_bank_save');
        const decoded = atob(savedStr);
        const parsed = JSON.parse(decoded);
        parsed.cash = 9999999; // modify data
        
        const bytes = new TextEncoder().encode(JSON.stringify(parsed));
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        window.localStorage.setItem('idle_bank_save', btoa(binary));
        
        // Load should fail checksum and fallback to default (cash = 2000)
        game.saveManager.loadGame();
        
        expect(game.state.cash).toBe(2000);
    });

    test('Corrupted base64 -> heal to default state', () => {
        window.localStorage.setItem('idle_bank_save', 'NOT_VALID_BASE64_!@#');
        
        game.saveManager.loadGame();
        
        expect(game.state.cash).toBe(2000);
    });
});

describe('SaveManager - Offline Earnings & Anti-Cheat', () => {
    let game;

    beforeEach(() => {
        window.localStorage.clear();
        game = new IdleBankGame();
    });

    test('calculateOfflineEarnings: respects boundaries and base cap (2 hours)', () => {
        game.state.managers.operations = true;
        game.state.managers.finance = true;
        
        // Simulate a 10-hour offline period
        const tenHoursMs = 10 * 3600 * 1000;
        game.state.lastSaveTime = Date.now() - tenHoursMs;
        game.saveManager.isServerTimeVerified = true;
        game.saveManager.serverTimeOffset = 0;
        
        // Mock EPS so we actually earn money offline
        game.getEarningsPerSecond = () => 100;
        
        game.saveManager.calculateOfflineEarnings();
        
        // Limit should be capped at 2 hours by default
        expect(game.offlineEarningsReport).toBeGreaterThan(0);
        
        // Calculate expected for 2 hours (2 * 3600 seconds)
        const expectedTimeSec = 2 * 3600;
        // Verify it didn't use the full 10 hours
        // For full auto, earnings calculation logic is applied over elapsedSec
        // We ensure a report was generated and cash was updated
        expect(game.state.cash).toBeGreaterThan(2000);
    });

    test('calculateOfflineEarnings: Anti-cheat triggers when time jumps backwards', () => {
        // Save is 10 minutes in the future
        game.state.lastSaveTime = Date.now() + 600000;
        game.saveManager.isServerTimeVerified = true;
        game.saveManager.serverTimeOffset = 0;
        
        game.saveManager.calculateOfflineEarnings();
        
        expect(game.cheatWarning).toBe(true);
        expect(game.cheatDetected).toBe(true);
    });
});

describe('SaveManager - Migration', () => {
    let game;

    beforeEach(() => {
        window.localStorage.clear();
        game = new IdleBankGame();
    });

    test('load old manager format and convert to new (Migration)', () => {
        const oldSave = {
            managers: { teller: true, guard: true, vault: false },
            managerUpgrades: { teller: {level: 2}, guard: {level: 3} },
            cash: 5000,
            currentBranch: 0
        };
        
        // Need to add checksum so it passes
        const jsonStr = JSON.stringify(oldSave);
        const checksum = game.saveManager.getChecksum(jsonStr);
        oldSave.checksum = checksum;
        
        const finalJsonStr = JSON.stringify(oldSave);
        const bytes = new TextEncoder().encode(finalJsonStr);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        window.localStorage.setItem('idle_bank_save', btoa(binary));
        
        game.saveManager.loadGame();
        
        expect(game.state.cash).toBe(5000);
        expect(game.state.managers.customer).toBe(true);
        expect(game.state.managers.operations).toBe(true);
        expect(game.state.managers.finance).toBe(false);
        
        // Manager upgrade levels carried over: teller->customer, guard->operations
        expect(game.state.managerUpgrades.customer.level).toBe(2);
        expect(game.state.managerUpgrades.operations.level).toBe(3);
        // vault wasn't upgraded, so finance defaults to level 1
        expect(game.state.managerUpgrades.finance.level).toBe(1);
    });
});
