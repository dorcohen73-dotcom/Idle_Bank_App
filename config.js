// Game Configuration Constants for Idle Bank Empire
const GAME_CONFIG = {
    // Tellers Formulas
    TELLER_BASE_SPEED: 5.0,
    TELLER_SPEED_DECAY: 0.93,
    TELLER_MIN_SPEED: 0.2,
    TELLER_ABSOLUTE_MIN_SPEED: 0.05,
    TELLER_AUTO_SPEED_FACTOR: 0.7,
    TELLER_SKILL_SPEED_DECAY: 0.03, // Rachel's level upgrades: -3% per level

    TELLER_BASE_CAPACITY: 150,
    TELLER_CAPACITY_GROWTH: 1.35,

    TELLER_BASE_UPGRADE_COST: 80,
    TELLER_UPGRADE_COST_GROWTH: 1.32,

    // Guards Formulas
    GUARD_BASE_SPEED: 8.0,
    GUARD_SPEED_DECAY: 0.92,
    GUARD_MIN_SPEED: 0.8,
    GUARD_ABSOLUTE_MIN_SPEED: 1.0,
    GUARD_AUTO_SPEED_FACTOR: 0.7,
    GUARD_SKILL_SPEED_DECAY: 0.04, // Alon's level upgrades: -4% per level
    GUARD_SPEED_GOLD_UPGRADE_FACTOR: 0.10, // Guard speed gold upgrade: -10% per level

    GUARD_BASE_CAPACITY: 250,
    GUARD_CAPACITY_GROWTH: 1.4,
    GUARD_AUTO_CAPACITY_FACTOR: 1.5, // Alon manager auto capacity multiplier (+50%)

    GUARD_BASE_UPGRADE_COST: 180,
    GUARD_UPGRADE_COST_GROWTH: 1.30,

    // Vault Formulas
    VAULT_BASE_CAPACITY: 1500,
    VAULT_CAPACITY_GROWTH: 1.45,

    VAULT_BASE_UPGRADE_COST: 350,
    VAULT_UPGRADE_COST_GROWTH: 1.34,

    // Queue Lobby Formulas
    QUEUE_BASE_CAPACITY: 5,
    QUEUE_CAPACITY_STEP: 5,
    QUEUE_BRANCH_BONUS_FACTOR: 5,
    QUEUE_BASE_UPGRADE_COST: 150,
    QUEUE_UPGRADE_COST_GROWTH: 5.2,

    // Timers & Intervals
    EVENT_INTERVAL_SEC: 300,
    AUTO_SAVE_INTERVAL_SEC: 5.0,
    TAB_REFRESH_INTERVAL_SEC: 1.0,

    // SVG Cache limits
    SVG_CACHE_MAX_SIZE: 200,

    // Branches and prestige constants
    BRANCHES: [
        { name: "סיטיבנק (סניף מקומי)", baseMultiplier: 1, minCashToPrestige: 50000, desc: "הבנק המקומי הראשון שלך. כאן הכל מתחיל." },
        { name: "אייץ'-אס-בי-סי (סניף פיננסי)", baseMultiplier: 5, minCashToPrestige: 1000000, desc: "ענק פיננסי גלובלי. לקוחות עשירים יותר ותנועת כספים מהירה." },
        { name: "ג'יי פי מורגן (וול סטריט)", baseMultiplier: 30, minCashToPrestige: 50000000, desc: "מרכז העסקים של וול סטריט. עסקאות ענק, הלוואות מפלצתיות ורווחים אדירים." },
        { name: "גולדמן זקס (אימפריית השקעות)", baseMultiplier: 200, minCashToPrestige: 1000000000, desc: "אימפריית ההשקעות העולמית. רווחים אגדיים שממלאים את כספות הזהב בשניות." }
    ],

    TELLER_UNLOCK_COSTS: [0, 800, 20000, 600000, 18000000, 500000000, 12500000000, 300000000000],
    GUARD_UNLOCK_COSTS: [0, 4000, 120000],
    
    MANAGER_COSTS: {
        customer: 1000,
        finance: 25000,
        operations: 5000,
        service: 150000,
        vip: 2500000,
        marketing: 30000000
    },

    MANAGER_UPGRADE_COSTS: {
        customer: [0, 3000, 10000, 35000, 120000],
        operations: [0, 15000, 50000, 180000, 600000],
        finance: [0, 75000, 250000, 800000, 2500000],
        service: [0, 450000, 1500000, 5000000, 15000000],
        vip: [0, 7500000, 25000000, 80000000, 250000000],
        marketing: [0, 90000000, 300000000, 1000000000, 3000000000]
    },

    MANAGER_UPGRADE_COSTS_DEFAULT: [0, 15000, 80000, 400000, 2000000],
    GOLD_UPGRADE_COSTS: { 
        startingCash: 5, 
        guardSpeed: 10, 
        premiumYield: 15, 
        shareEfficiency: 25,
        offlineEarnings: 15,
        tellerCapacityBoost: 20,
        vaultCapacityBoost: 20,
        eventBonus: 30,
        managerDiscount: 50
    },
    STARTING_CASH_OPTIONS: [150, 1000, 5000, 25000, 100000],
    PRESTIGE_ASSETS_DIVIDER: 8,
    DEPT_ID_CASH: 0,
    DEPT_ID_LOANS: 1,
    DEPT_ID_VIP: 2,
    DEPT_ID_STOCK: 3,
    DEPT_ID_LAUNDERING: 4,
    MANAGER_COEFFICIENTS: {
        customer: { spawnIntervalBoost: 0.06, incomeBoost: 0.03 },
        finance: { incomeBoost: 0.05 },
        operations: { guardSpeedBoost: 0.04, tellerSpeedBoost: 0.03 },
        service: { capacityBoost: 0.05, incomeBoost: 0.04 },
        vip: { incomeBoost: 0.07, prestigeBoost: 0.04 },
        marketing: { adBoost: 0.10, offlineLimitBoost: 1 }
    }
};

Object.freeze(GAME_CONFIG.BRANCHES);
GAME_CONFIG.BRANCHES.forEach(b => Object.freeze(b));
Object.freeze(GAME_CONFIG.TELLER_UNLOCK_COSTS);
Object.freeze(GAME_CONFIG.GUARD_UNLOCK_COSTS);
Object.freeze(GAME_CONFIG.MANAGER_COSTS);
Object.freeze(GAME_CONFIG.MANAGER_UPGRADE_COSTS);
Object.freeze(GAME_CONFIG.GOLD_UPGRADE_COSTS);
Object.freeze(GAME_CONFIG.STARTING_CASH_OPTIONS);
Object.freeze(GAME_CONFIG.MANAGER_COEFFICIENTS);
Object.keys(GAME_CONFIG.MANAGER_COEFFICIENTS).forEach(k => Object.freeze(GAME_CONFIG.MANAGER_COEFFICIENTS[k]));
Object.freeze(GAME_CONFIG);
