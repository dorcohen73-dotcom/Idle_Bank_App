const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

  await page.goto('http://localhost:8937/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const langBtn = await page.$('[data-lang="he"], .lang-option, #language-modal button');
  if (langBtn) { try { await langBtn.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(1500);

  const log = [];
  const t0 = Date.now();
  const elapsed = () => Math.round((Date.now() - t0) / 1000);

  // Dismiss overlays + one greedy-value buy cycle
  const cycle = async () => {
    return await page.evaluate(() => {
      // dismiss any active modal (welcome tip / daily bonus / etc.)
      const ov = document.querySelector('.modal-overlay.active');
      if (ov) { const b = ov.querySelector('button'); if (b) b.click(); }

      const g = window.game;
      if (!g) return { noGame: true };
      g.collectVault();

      const tLvl = g.state.tellers[0].level;
      const gLvl = g.state.guards[0].level;
      const tCost = g.economyManager.getTellerUpgradeCost(tLvl);
      const gCost = g.economyManager.getGuardUpgradeCost(gLvl);
      const cash = g.state.cash;

      let bought = null;
      // Greedy-value rational player: buy whichever of the two next upgrades is cheaper, if affordable.
      if (cash >= tCost && cash >= gCost) {
        if (gCost <= tCost) { if (g.upgradeGuard(0)) bought = { type: 'guard', fromLevel: gLvl, cost: gCost }; }
        else { if (g.upgradeTeller(0)) bought = { type: 'teller', fromLevel: tLvl, cost: tCost }; }
      } else if (cash >= tCost) {
        if (g.upgradeTeller(0)) bought = { type: 'teller', fromLevel: tLvl, cost: tCost };
      } else if (cash >= gCost) {
        if (g.upgradeGuard(0)) bought = { type: 'guard', fromLevel: gLvl, cost: gCost };
      }

      return {
        cash: Math.round(cash), tellerLevel: tLvl, guardLevel: gLvl,
        nextTellerCost: tCost, nextGuardCost: gCost, bought
      };
    });
  };

  const DURATION_S = 340;
  while (elapsed() < DURATION_S) {
    const snap = await cycle();
    if (snap.bought) {
      log.push({ t: elapsed(), ...snap.bought });
      console.log(`[t=${elapsed()}s] BOUGHT ${snap.bought.type} lvl${snap.bought.fromLevel}->${snap.bought.fromLevel + 1} for $${snap.bought.cost}`);
    }
    await page.waitForTimeout(4000);
  }

  const finalState = await page.evaluate(() => {
    const g = window.game;
    return {
      cash: Math.round(g.state.cash),
      tellerLevel: g.state.tellers[0].level,
      guardLevel: g.state.guards[0].level,
      guardTrips: g.state.guardTripsTotal || 0,
      clientsServed: g.state.stats ? g.state.stats.clientsServed : null
    };
  });

  console.log('\nFINAL STATE:', JSON.stringify(finalState, null, 2));
  console.log('PURCHASE LOG:', JSON.stringify(log, null, 2));
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors, null, 2));

  await browser.close();
})();
