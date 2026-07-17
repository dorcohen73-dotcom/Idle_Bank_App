const vm = require('vm');
const fs = require('fs');
const path = require('path');

const configSrcOrig = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
const ecoSrc = fs.readFileSync(path.join(__dirname, 'economy-manager.js'), 'utf8');

function buildEconomy(overrides) {
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
  return context;
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

const CANDIDATE_GBC = Number(process.argv[2] || 120);

console.log(`\n########## CANDIDATE: GUARD_BASE_CAPACITY=${CANDIDATE_GBC} (growth stays 1.05) ##########\n`);
const eco = makeGame(buildEconomy({ GUARD_BASE_CAPACITY: CANDIDATE_GBC }), {});

console.log('--- Table: single teller (1 unlocked) vs single guard @ level 1 (fixed, default ops mgr), levels 1-15 ---');
console.log('lvl | tellerCap | guardCapL1 | gap(t-g) | tellerUpgCost | guardUpgCost(1->2, fixed) | costRatio(g/t)');
const guardCapL1 = eco.getGuardCapacity(1);
const guardUpgCost1 = eco.getGuardUpgradeCost(1);
for (let L = 1; L <= 15; L++) {
  const tc = eco.getTellerCapacity(L);
  const tCost = eco.getTellerUpgradeCost(L);
  console.log(`${String(L).padStart(3)} | ${String(tc).padStart(9)} | ${String(guardCapL1).padStart(10)} | ${String(tc - guardCapL1).padStart(8)} | ${String(tCost).padStart(13)} | ${String(guardUpgCost1).padStart(24)} | ${(guardUpgCost1 / tCost).toFixed(2)}`);
}

console.log('\n--- Recurring pressure check: teller level vs a guard that is periodically upgraded to "catch back up" ---');
console.log('Simulates: guard starts at level 1; whenever teller capacity would exceed guard capacity by >20%, guard is upgraded by however many levels needed to get back to >=teller capacity. Shows how often/how expensive this recurs, single-teller scenario.');
{
  let guardLevel = 1;
  let totalGuardSpend = 0;
  const events = [];
  for (let L = 1; L <= 40; L++) {
    const tc = eco.getTellerCapacity(L);
    let gc = eco.getGuardCapacity(guardLevel);
    if (tc > gc * 1.2) {
      const startGuardLevel = guardLevel;
      let spend = 0;
      while (eco.getGuardCapacity(guardLevel) < tc) {
        spend += eco.getGuardUpgradeCost(guardLevel);
        guardLevel++;
      }
      totalGuardSpend += spend;
      events.push({ tellerLevel: L, tellerCap: tc, guardLevelBefore: startGuardLevel, guardLevelAfter: guardLevel, spend });
    }
  }
  events.forEach(e => console.log(`teller lvl ${e.tellerLevel} (cap ${e.tellerCap}) forces guard ${e.guardLevelBefore}->${e.guardLevelAfter}, costing ${e.spend}`));
  console.log(`Total catch-up events: ${events.length}, total guard spend across run: ${totalGuardSpend}`);
}

console.log('\n--- Multi-teller / later-branch checkpoint (coordinator\'s level-30 reference), with NEW base capacity ---');
{
  const teller30x4 = eco.getTellerCapacity(30) * 4;
  const guard30 = eco.getGuardCapacity(30);
  console.log(`4 tellers @ lvl30 combined: ${teller30x4}, 1 guard @ lvl30 (leveled in parallel): ${guard30}, ratio teller/guard: ${(teller30x4/guard30).toFixed(2)}`);
  const teller20x4 = eco.getTellerCapacity(20) * 4;
  const guard20 = eco.getGuardCapacity(20);
  console.log(`4 tellers @ lvl20 combined: ${teller20x4}, 1 guard @ lvl20: ${guard20}, ratio: ${(teller20x4/guard20).toFixed(2)}`);
  const teller40x4 = eco.getTellerCapacity(40) * 4;
  const guard40 = eco.getGuardCapacity(40);
  console.log(`4 tellers @ lvl40 combined: ${teller40x4}, 1 guard @ lvl40: ${guard40}, ratio: ${(teller40x4/guard40).toFixed(2)}`);
}

console.log('\n--- Cost-competitiveness at the crossover: guard upgrade cost vs teller upgrade cost, levels 5-10 ---');
for (let L = 5; L <= 10; L++) {
  const tCost = eco.getTellerUpgradeCost(L);
  const gCost = eco.getGuardUpgradeCost(1); // guard still at level 1 realistically at this point
  console.log(`teller lvl${L}->${L+1} cost=${tCost}   vs   guard lvl1->2 cost=${gCost}   (guard/teller ratio=${(gCost/tCost).toFixed(2)})`);
}
