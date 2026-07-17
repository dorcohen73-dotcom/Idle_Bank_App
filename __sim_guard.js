// Fast deterministic simulation using the REAL config.js + economy-manager.js source
// (loaded via Node's vm module, not reimplemented) to find guard-capacity tuning.
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const configSrcOrig = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
const ecoSrc = fs.readFileSync(path.join(__dirname, 'economy-manager.js'), 'utf8');

function buildEconomy(overrides) {
  // overrides: { GUARD_BASE_CAPACITY, GUARD_CAPACITY_GROWTH, GUARD_BASE_UPGRADE_COST, GUARD_UPGRADE_COST_GROWTH }
  let src = configSrcOrig;
  for (const [key, val] of Object.entries(overrides || {})) {
    const re = new RegExp(`(${key}:\\s*)[0-9.]+`);
    if (!re.test(src)) throw new Error('pattern not found for ' + key);
    src = src.replace(re, `$1${val}`);
  }
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.console = console;
  const context = vm.createContext(sandbox);
  vm.runInContext(src, context, { filename: 'config.js' });
  vm.runInContext('window.GAME_CONFIG = GAME_CONFIG;', context);
  vm.runInContext(ecoSrc, context, { filename: 'economy-manager.js' });
  return context; // context.GAME_CONFIG, context.EconomyManager available
}

function makeGame(context, opts) {
  opts = opts || {};
  const game = {
    state: {
      managers: Object.assign({ operations: true, service: false, finance: false, customer: false, vip: false, marketing: false, accountant: false }, opts.managers || {}),
      managerUpgrades: Object.assign({ operations: { level: opts.opsLevel || 1 }, service: { level: 1 } }, opts.managerUpgrades || {}),
      goldUpgrades: opts.goldUpgrades || {},
      currentBranch: opts.branch || 0,
      shares: opts.shares || 0,
      achievements: { bonusPercent: 0 }
    },
    tellerUnlockCosts: [0, 800, 20000, 600000, 18000000, 500000000, 12500000000, 300000000000],
    tempQueueBonus: 0
  };
  return new context.EconomyManager(game);
}

// ---------- 1) Baseline: reproduce current (already-shipped) numbers to validate the harness ----------
console.log('=== VALIDATION: reproducing coordinator\'s reference numbers with CURRENT config ===');
{
  const ctx = buildEconomy({}); // no overrides = current shipped values
  const eco = makeGame(ctx, {});
  const tellerCap9 = eco.getTellerCapacity(9);
  const guardCapL1 = eco.getGuardCapacity(1);
  console.log(`teller level 9 capacity (no service mgr): ${tellerCap9}  [expect ~277]`);
  console.log(`guard level 1 effective capacity (ops mgr default hired): ${guardCapL1}  [expect ~450]`);

  // find crossover: single teller capacity vs single guard (level 1, fixed) capacity
  let crossoverLevel = null;
  for (let L = 1; L <= 40; L++) {
    const tc = eco.getTellerCapacity(L);
    if (tc > guardCapL1 && crossoverLevel === null) crossoverLevel = L;
  }
  console.log(`CURRENT crossover level (teller cap first exceeds guard L1 effective cap): ${crossoverLevel}  [coordinator said ~16]`);

  // Reproduce "teller level 30, 4 tellers vs 1 guard also at level 30" checkpoint
  const teller30x4 = eco.getTellerCapacity(30) * 4;
  const guard30 = eco.getGuardCapacity(30);
  console.log(`4 tellers @ lvl30 combined: ${teller30x4}  [expect ~5592],  1 guard @ lvl30: ${guard30}  [expect ~1853]`);
}

// ---------- 2) Search for GUARD_BASE_CAPACITY that puts single-teller-vs-guard-L1 crossover at level 6-7 ----------
console.log('\n=== SEARCH: GUARD_BASE_CAPACITY sweep (GUARD_CAPACITY_GROWTH kept at current 1.05) ===');
const candidates = [];
for (let gbc = 90; gbc <= 180; gbc += 5) {
  const ctx = buildEconomy({ GUARD_BASE_CAPACITY: gbc });
  const eco = makeGame(ctx, {});
  const guardCapL1 = eco.getGuardCapacity(1);
  let crossoverLevel = null;
  for (let L = 1; L <= 40; L++) {
    const tc = eco.getTellerCapacity(L);
    if (tc > guardCapL1 && crossoverLevel === null) { crossoverLevel = L; break; }
  }
  candidates.push({ gbc, guardCapL1, crossoverLevel });
}
candidates.forEach(c => console.log(`GUARD_BASE_CAPACITY=${c.gbc} -> guard L1 effective cap=${c.guardCapL1}, crossover at teller level ${c.crossoverLevel}`));
