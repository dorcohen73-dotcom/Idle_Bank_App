import { beforeEach, describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock global window and browser environment
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

// Evaluate the game.js code in global context
const gameCode = fs.readFileSync(path.resolve(__dirname, '../game.js'), 'utf8');
new Function('window', gameCode)(global.window);

const IdleBankGame = global.window.IdleBankGame;

describe('IdleBankGame Logic Tests', () => {
    let game;

    beforeEach(() => {
        // Reset window.localStorage mock
        global.window.localStorage.getItem = () => null;
        global.window.localStorage.setItem = () => {};
        
        // Instantiate a new game instance
        game = new IdleBankGame();
    });

    test('validateAndHealState should heal missing properties in state', () => {
        // Corrupt state by deleting key fields
        delete game.state.tellers;
        delete game.state.guards;
        delete game.state.goldUpgrades;

        // Trigger heal
        game.validateAndHealState(game.state);

        // Assert they are restored with defaults
        expect(game.state.tellers).toBeDefined();
        expect(game.state.tellers.length).toBe(4);
        expect(game.state.guards).toBeDefined();
        expect(game.state.guards.length).toBe(3);
        expect(game.state.goldUpgrades).toBeDefined();
        expect(game.state.goldUpgrades.startingCash).toBe(0);
    });

    test('prestige calculations should return correct gold shares', () => {
        // Set lifetime cash to 10M
        game.state.lifetimeCash = 10000000;
        game.state.shares = 10; // 10 shares already owned

        // Calculate gold shares to get
        const sharesToGet = game.calculatePrestigeShares(game.state.lifetimeCash, game.state.shares);
        
        // Assert it is calculated and returns a valid positive number
        expect(sharesToGet).toBeGreaterThan(0);
    });

    test('getBulkUpgradeDetails should properly calculate levels and costs within budget', () => {
        const tellerId = 0;
        
        // Let's test x1
        const detailX1 = game.getBulkUpgradeDetails('teller', tellerId, 'x1', 1, 1000);
        expect(detailX1.levels).toBe(1);
        expect(detailX1.cost).toBeGreaterThan(0);
        expect(detailX1.canAfford).toBe(true);

        // Let's test x10
        const detailX10 = game.getBulkUpgradeDetails('teller', tellerId, 'x10', 1, 1000000);
        expect(detailX10.levels).toBe(10);
        expect(detailX10.cost).toBeGreaterThan(0);

        // Let's test MAX with limited cash
        const limitedCash = 500;
        const detailMax = game.getBulkUpgradeDetails('teller', tellerId, 'max', 1, limitedCash);
        expect(detailMax.cost).toBeLessThanOrEqual(limitedCash);
    });

    test('generateMission should always generate a unique mission not currently active', () => {
        // Set up active missions list
        game.state.missions = [
            { id: 0, type: 'serve_clients', target: 50, reward: 200, progress: 0, completed: false }
        ];

        // Generate a new mission
        const newMission = game.generateMission();
        
        if (newMission) {
            // Verify the generated mission type is not equal to serve_clients OR has a different target
            const isDuplicate = game.state.missions.some(
                m => m.type === newMission.type && m.target === newMission.target
            );
            expect(isDuplicate).toBe(false);
        }
    });

    test('validateAndHealState should migrate old managers to new structure', () => {
        const oldState = {
            cash: 500,
            managers: {
                teller: true,
                guard: false,
                vault: true
            },
            managerUpgrades: {
                teller: { level: 3, skill: 'speed' },
                guard: { level: 2, skill: 'capacity' },
                vault: { level: 4, skill: 'investment' }
            }
        };

        game.validateAndHealState(oldState);

        expect(oldState.managers.customer).toBe(true);
        expect(oldState.managers.operations).toBe(false);
        expect(oldState.managers.finance).toBe(true);
        expect(oldState.managers.service).toBe(false);
        expect(oldState.managers.vip).toBe(false);
        expect(oldState.managers.marketing).toBe(false);

        expect(oldState.managerUpgrades.customer.level).toBe(3);
        expect(oldState.managerUpgrades.operations.level).toBe(2);
        expect(oldState.managerUpgrades.finance.level).toBe(4);
        expect(oldState.managerUpgrades.service.level).toBe(1);
        expect(oldState.managerUpgrades.customer.skill).toBeNull();
    });

    test('isManagerUnlocked should check department unlocks', () => {
        expect(game.isManagerUnlocked('customer')).toBe(true);
        expect(game.isManagerUnlocked('operations')).toBe(true);

        game.state.departments.forEach((dept, index) => {
            if (index > 0) dept.unlocked = false;
        });

        expect(game.isManagerUnlocked('finance')).toBe(false);

        game.state.departments[1].unlocked = true;
        expect(game.isManagerUnlocked('finance')).toBe(true);
    });

    test('checkMissions should properly update and complete serve_rich_vip mission', () => {
        // Clear existing missions and add a specific serve_rich_vip mission
        game.state.missions = [
            { id: 'm_test_1', type: 'serve_rich_vip', target: 5, reward: 1000, progress: 0, completed: false, startProgress: 0 }
        ];
        
        // Assert initial state
        expect(game.state.missions[0].completed).toBe(false);
        expect(game.state.missions[0].progress).toBe(0);

        // Simulate serving 3 VIP clients
        game.state.stats.vipServed = 3;
        game.checkMissions();
        expect(game.state.missions[0].completed).toBe(false);
        expect(game.state.missions[0].progress).toBe(3);

        // Achieve the target of 5 VIP clients
        game.state.stats.vipServed = 5;
        game.checkMissions();
        expect(game.state.missions[0].completed).toBe(true);
        expect(game.state.missions[0].progress).toBe(5);
    });
});
