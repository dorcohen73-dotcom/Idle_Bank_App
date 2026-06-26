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
    TELLER_UPGRADE_COST_GROWTH: 1.20,

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
    GUARD_UPGRADE_COST_GROWTH: 1.25,

    // Vault Formulas
    VAULT_BASE_CAPACITY: 1500,
    VAULT_CAPACITY_GROWTH: 1.45,

    VAULT_BASE_UPGRADE_COST: 350,
    VAULT_UPGRADE_COST_GROWTH: 1.30,

    // Queue Lobby Formulas
    QUEUE_BASE_CAPACITY: 5,
    QUEUE_CAPACITY_STEP: 5,
    QUEUE_BRANCH_BONUS_FACTOR: 5,
    QUEUE_BASE_UPGRADE_COST: 100,
    QUEUE_UPGRADE_COST_GROWTH: 1.8,
    QUEUE_MAX_LEVEL: 6,

    // Timers & Intervals
    EVENT_INTERVAL_SEC: 300,
    AUTO_SAVE_INTERVAL_SEC: 5.0,
    TAB_REFRESH_INTERVAL_SEC: 1.0,

    // SVG Cache limits
    SVG_CACHE_MAX_SIZE: 200,

    // Branches and prestige constants
    BRANCHES: [
        { name: "סיטיבנק (סניף מקומי)", baseMultiplier: 1, minCashToPrestige: 30000, desc: "הבנק המקומי הראשון שלך. כאן הכל מתחיל." },
        { name: "אייץ'-אס-בי-סי (סניף פיננסי)", baseMultiplier: 5, minCashToPrestige: 2500000, desc: "ענק פיננסי גלובלי. לקוחות עשירים יותר ותנועת כספים מהירה." },
        { id: 'deutsche', name: "דויטשה בנק (פרנקפורט)", baseMultiplier: 15, minCashToPrestige: 500000000, desc: "לב הפיננסים האירופאי. עסקות נדל\"ן ו-corporate banking." },
        { name: "ג'יי פי מורגן (וול סטריט)", baseMultiplier: 30, minCashToPrestige: 250000000000, desc: "מרכז העסקים של וול סטריט. עסקאות ענק, הלוואות מפלצתיות ורווחים אדירים." },
        { name: "גולדמן זקס (אימפריית השקעות)", baseMultiplier: 200, minCashToPrestige: 100000000000000, desc: "אימפריית ההשקעות העולמית. רווחים אגדיים שממלאים את כספות הזהב בשניות." }
    ],

    TELLER_UNLOCK_COSTS: [0, 800, 20000, 600000, 18000000, 500000000, 12500000000, 300000000000],
    GUARD_UNLOCK_COSTS: [0, 4000, 120000],
    
    MANAGER_COSTS: {
        customer: 50,
        operations: 5000,
        finance: 100000,
        service: 1500000,
        vip: 50000000,
        marketing: 2000000000
    },

    MANAGER_UPGRADE_COSTS: {
        customer: [0, 300, 1000, 5000, 25000],
        operations: [0, 15000, 50000, 180000, 600000],
        finance: [0, 300000, 1000000, 3200000, 10000000],
        service: [0, 4500000, 15000000, 50000000, 150000000],
        vip: [0, 150000000, 500000000, 1600000000, 5000000000],
        marketing: [0, 6000000000, 20000000000, 60000000000, 200000000000]
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
    STARTING_CASH_OPTIONS: [180, 1000, 5000, 25000, 100000],
    PRESTIGE_ASSETS_DIVIDER: 8,
    DEPT_ID_CASH: 0,
    DEPT_ID_LOANS: 1,
    DEPT_ID_VIP: 2,
    DEPT_ID_STOCK: 3,
    DEPT_ID_LAUNDERING: 4,
    MANAGER_COEFFICIENTS: {
        customer: { spawnIntervalBoost: 0.06, incomeBoost: 0.06 },
        finance: { incomeBoost: 0.10, deptIncomeBoost: 0.12 },
        operations: { guardSpeedBoost: 0.04, tellerSpeedBoost: 0.03, guardCapBoost: 0.20 },
        service: { capacityBoost: 0.05, incomeBoost: 0.08, epsBoost: 0.05, offlineLimitBoost: 2 },
        vip: { incomeBoost: 0.07, prestigeBoost: 0.04, prestigeSharesBoost: 0.08 },
        marketing: { adBoost: 0.10, offlineLimitBoost: 1 }
    },

    WHEEL_PRIZES: [
        { type: 'cash',   label: 'cash_small',  weight: 35, value: 120, minValue: 120 },
        { type: 'cash',   label: 'cash_big',    weight: 20, value: 600, minValue: 300 },
        { type: 'boost',  label: 'boost_2x',    weight: 20, value: 2   },
        { type: 'gold',   label: 'gold_1',      weight: 12, value: 1   },
        { type: 'gold',   label: 'gold_2',      weight: 6,  value: 2   },
        { type: 'shares', label: 'shares_1',    weight: 5,  value: 1   },
        { type: 'shares', label: 'shares_3',    weight: 2,  value: 3   }
    ],

    // AdMob configuration IDs
    ADMOB_CONFIG: {
        APP_ID: "ca-app-pub-1189054329275307~5576716143",
        REWARDED_AD_UNIT_ID: "ca-app-pub-1189054329275307/1609550976"
    },

    // Multi-stop guard route anchors — fractional position (0.0–1.0) along #security-path
    // Centers for a 4-column equal-grid (1fr each): (i + 0.5) / 4 in RTL visual order.
    // DOM-computed values override these at runtime via _recalcGuardAnchors().
    GUARD_TELLER_ANCHORS: [0.125, 0.375, 0.625, 0.875],
    GUARD_VAULT_ANCHOR: 0.05
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
GAME_CONFIG.WHEEL_PRIZES.forEach(p => Object.freeze(p));
Object.freeze(GAME_CONFIG.WHEEL_PRIZES);
Object.freeze(GAME_CONFIG.GUARD_TELLER_ANCHORS);
Object.freeze(GAME_CONFIG);
