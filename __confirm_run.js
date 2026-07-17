const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const SCRATCH = 'C:\\Users\\dorco\\AppData\\Local\\Temp\\claude\\C--Users-dorco-Desktop-Antigravity-IdleBank\\c1a542df-4ea5-485a-b318-034fba3eff8f\\scratchpad';
const URL = 'http://localhost:8936/index.html';
const SESSION_MS = 110 * 1000; // ~110 real seconds - enough to reach teller level 6-7 per the sim
const POLL_MS = 8 * 1000;

const log = [];
let startTime;
function record(msg, extra) {
  const t = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[t=${t}s] ${msg}` + (extra ? ' ' + JSON.stringify(extra) : ''));
  log.push({ t: parseFloat(t), msg, extra: extra || null });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'load' });
  startTime = Date.now();
  record('Fresh load - CONFIRMATION RUN (rational value-based buying: guard vs teller)');

  await page.waitForTimeout(1000);
  const heButton = await page.$('.lang-option-card[data-lang="he"]');
  if (heButton) { await heButton.click(); record('Chose Hebrew'); }
  await page.waitForTimeout(1000);

  async function dismissModals() {
    for (let i = 0; i < 6; i++) {
      const m = await page.$('.modal-overlay.active');
      if (!m) break;
      const id = await m.getAttribute('id').catch(() => '?');
      const btn = await m.$('.modal-close, .close-btn, button.close, [data-close], .btn-close, .claim-btn, .modal-btn-primary') || await m.$('button');
      if (btn) { await btn.click().catch(()=>{}); record(`Dismissed modal ${id}`); }
      await page.waitForTimeout(400);
    }
    const tip = await page.$('#discovery-tip-btn');
    if (tip && await tip.isVisible().catch(()=>false)) { await tip.click().catch(()=>{}); record('Dismissed discovery tip'); }
  }

  await dismissModals();
  await page.screenshot({ path: path.join(SCRATCH, '__confirm_t000.png') });

  let purchases = [];
  let firstGuardBuyTellerLevel = null;
  let elapsed = 0;

  while (elapsed < SESSION_MS) {
    await page.waitForTimeout(POLL_MS);
    elapsed = Date.now() - startTime;
    const tSec = (elapsed / 1000).toFixed(1);
    await dismissModals();

    // Collect from teller 0 desk + empty vault to keep cash flowing (manual mechanic)
    const collectBtn = await page.$('#teller-collect-0');
    if (collectBtn && await collectBtn.isVisible().catch(()=>false)) await collectBtn.click().catch(()=>{});
    await page.waitForTimeout(150);
    const vaultBtn = await page.$('#collect-vault-btn');
    if (vaultBtn && await vaultBtn.isVisible().catch(()=>false)) {
      const disabled = await vaultBtn.evaluate(el => el.disabled || el.classList.contains('disabled')).catch(()=>true);
      if (!disabled) await vaultBtn.click().catch(()=>{});
    }
    await page.waitForTimeout(150);

    // Read real state + real formulas from the live game object
    const info = await page.evaluate(() => {
      const g = window.game;
      const t = g.state.tellers[0];
      const gd = g.state.guards[0];
      return {
        cash: g.state.cash,
        tellerLevel: t.level,
        guardLevel: gd.level,
        tellerCap: g.getTellerCapacity(t.level),
        guardCap: g.getGuardCapacity(gd.level),
        nextTellerCost: g.getTellerUpgradeCost(t.level),
        nextGuardCost: g.getGuardUpgradeCost(gd.level),
      };
    });
    record('State', info);

    // Rational decision: if guard capacity is no longer comfortably ahead of teller capacity
    // (within 5%) AND the guard upgrade isn't drastically pricier (<=1.5x) than the next teller
    // upgrade, prefer buying the guard - a value-conscious player who notices the capacity
    // squeeze and finds the guard upgrade still roughly cost-competitive. Otherwise default to
    // whichever is affordable, preferring teller (matches the game's own "best value" heuristic).
    const guardIsBottleneck = info.guardCap < info.tellerCap * 1.05;
    const guardCostCompetitive = info.nextGuardCost <= info.nextTellerCost * 1.5;
    let preferGuard = guardIsBottleneck && guardCostCompetitive;

    let bought = false;
    if (preferGuard && info.cash >= info.nextGuardCost) {
      const btn = await page.$('#tab-upgrades .buy-btn[data-type="guard"][data-id="0"]');
      if (btn && await btn.isVisible().catch(()=>false)) {
        await btn.click({ timeout: 2000 }).catch(()=>{});
        bought = true;
        if (firstGuardBuyTellerLevel === null) firstGuardBuyTellerLevel = info.tellerLevel;
        purchases.push({ t: tSec, type: 'guard', fromLevel: info.guardLevel, cost: info.nextGuardCost, reason: 'guard is bottleneck & cost-competitive', tellerLevelAtPurchase: info.tellerLevel });
        record('BUY GUARD (rational choice)', purchases[purchases.length - 1]);
      }
    }
    if (!bought && info.cash >= info.nextTellerCost) {
      const btn = await page.$('#tab-upgrades .buy-btn[data-type="teller"][data-id="0"]');
      if (btn && await btn.isVisible().catch(()=>false)) {
        await btn.click({ timeout: 2000 }).catch(()=>{});
        bought = true;
        purchases.push({ t: tSec, type: 'teller', fromLevel: info.tellerLevel, cost: info.nextTellerCost });
        record('BUY TELLER', purchases[purchases.length - 1]);
      }
    }
    if (!bought && info.cash >= info.nextGuardCost) {
      const btn = await page.$('#tab-upgrades .buy-btn[data-type="guard"][data-id="0"]');
      if (btn && await btn.isVisible().catch(()=>false)) {
        await btn.click({ timeout: 2000 }).catch(()=>{});
        bought = true;
        if (firstGuardBuyTellerLevel === null) firstGuardBuyTellerLevel = info.tellerLevel;
        purchases.push({ t: tSec, type: 'guard', fromLevel: info.guardLevel, cost: info.nextGuardCost, reason: 'opportunistic (teller unaffordable)', tellerLevelAtPurchase: info.tellerLevel });
        record('BUY GUARD (opportunistic)', purchases[purchases.length - 1]);
      }
    }
  }

  await page.screenshot({ path: path.join(SCRATCH, '__confirm_tFINAL.png') });
  const finalInfo = await page.evaluate(() => {
    const g = window.game;
    return { cash: g.state.cash, tellerLevel: g.state.tellers[0].level, guardLevel: g.state.guards[0].level };
  });
  record('FINAL', finalInfo);
  record('SUMMARY', { firstGuardBuyTellerLevel, totalPurchases: purchases.length, consoleErrorCount: consoleErrors.length, consoleErrors });

  fs.writeFileSync(path.join(SCRATCH, '__confirm_log.json'), JSON.stringify({ log, purchases, finalInfo, firstGuardBuyTellerLevel, consoleErrors }, null, 2));
  await browser.close();

  console.log('===CONFIRM_RESULT_JSON_START===');
  console.log(JSON.stringify({ purchases, finalInfo, firstGuardBuyTellerLevel, consoleErrors }, null, 2));
  console.log('===CONFIRM_RESULT_JSON_END===');
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
