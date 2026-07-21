/*
 * tools/balance-sim.js — Balance / progression-pacing simulator
 * Run: node tools/balance-sim.js
 *
 * WHAT IT DOES
 *   Simulates a "sensible player" from a fresh game and reports how much GAME-TIME it takes
 *   to reach each milestone (first prestige, then each branch clear), plus EPS/balance/counts.
 *
 * MODEL & ASSUMPTIONS (read these before trusting numbers)
 *   - Cash accrues at the game's REAL theoretical EPS (mirrors economy-manager.js recalculateEps):
 *     eps = maxUnlockedDeptBaseReward * totalMultiplier * sum(1/tellerSpeed(level)).
 *     This assumes the teller->guard->vault flow runs at full rate (active or fully-automated
 *     play) and is NOT bottlenecked by tap cadence or vault/guard/queue capacity. Real wall-clock
 *     time is therefore >= these numbers (offline is capped, players aren't on 24/7).
 *   - Costs/formulas are mirrored verbatim from config.js + economy-manager.js + shop-controller.js.
 *   - Prestige shares mirror prestige-controller.js calculatePrestigeShares (floor(1500*(lifetime/1e9)^0.22)
 *     - claimed, capped 10000). On prestige, cash/tellers/depts/managers reset; shares/claimed persist;
 *     lifetimeCash resets to 2000 (matches the prestige reset in prestige-controller.js).
 *   - Purchase policy: unlock next dept -> next teller -> hire income managers -> cheapest manager
 *     upgrade -> upgrade lowest teller (caps at level 55), all within ~95% of the branch's prestige
 *     gate; then bank to the gate and prestige. This is "a sensible player", not a proven optimum.
 *
 * IMPORTANT: constants below are copied from config.js / game.js. If you change balance numbers
 * there, update this block too (or wire it to load config.js). The GATE array must match
 * GAME_CONFIG.BRANCHES[*].minCashToPrestige.
 */

const C = {
  T_BASE_SPEED: 5.0, T_DECAY: 0.93, T_MIN_SPEED: 0.2, T_ABS_MIN: 0.05,
  T_BASE_UP: 60, T_UP_GROWTH: 1.13, T_SKILL_DECAY: 0.03,
  T_UNLOCK: [0, 800, 20000, 600000, 18000000, 500000000, 12500000000, 300000000000],
  BRANCH_MULT: [1, 5, 15, 30, 200],
  // === must match GAME_CONFIG.BRANCHES[*].minCashToPrestige ===
  GATE: [300000, 25000000, 5000000000, 2500000000000, 1000000000000000],
  DEPT_REWARD: [10, 60, 450, 3500, 30000],
  DEPT_COST: [0, 10500, 240000, 3600000, 75000000],
  MGR_COST: { customer: 150, operations: 15000, finance: 300000, accountant: 900000, service: 4500000, vip: 150000000, marketing: 6000000000 },
  MGR_UP: {
    customer: [0, 900, 3000, 15000, 75000], operations: [0, 45000, 150000, 540000, 1800000],
    finance: [0, 900000, 3000000, 9600000, 30000000], service: [0, 13500000, 45000000, 150000000, 450000000],
    vip: [0, 450000000, 1500000000, 4800000000, 15000000000],
  },
  START_CASH: 180, TELLER_LCAP: 55,
};

function tellerSpeed(level, opsLvl) {
  const base = Math.max(C.T_MIN_SPEED, C.T_BASE_SPEED * Math.pow(C.T_DECAY, level - 1));
  const factor = Math.max(0.10, 1 - (opsLvl - 1) * C.T_SKILL_DECAY);
  return Math.max(C.T_ABS_MIN, base * factor);
}
const tellerUpCost = (level) => Math.round(C.T_BASE_UP * Math.pow(C.T_UP_GROWTH, level - 1));

function newState() {
  return {
    cash: 2000, lifetime: 2000, shares: 0, claimed: 0, branch: 0,
    tellers: Array.from({ length: 8 }, (_, i) => ({ u: i === 0, lvl: 1 })),
    depts: [true, false, false, false, false],
    mgr: { customer: { h: false, l: 1 }, operations: { h: true, l: 1 }, finance: { h: false, l: 1 }, service: { h: false, l: 1 }, vip: { h: false, l: 1 } },
  };
}
const maxTellers = (s) => Math.min(8, 4 + s.branch);
function baseReward(s) { let m = 0; for (let i = 0; i < 5; i++) if (s.depts[i]) m = Math.max(m, C.DEPT_REWARD[i]); return m; }
function mult(s) {
  let m = C.BRANCH_MULT[s.branch] * (1 + s.shares * 0.05);
  if (s.mgr.customer.h) m *= (1 + 0.06 * s.mgr.customer.l);
  if (s.mgr.finance.h) { m *= (1 + 0.10 * s.mgr.finance.l); if (s.depts.slice(1).some((x) => x)) m *= (1 + 0.12 * s.mgr.finance.l); }
  if (s.mgr.service.h) { m *= (1 + 0.08 * s.mgr.service.l); m *= (1 + 0.05 * s.mgr.service.l); }
  if (s.mgr.vip.h) m *= (1 + 0.07 * s.mgr.vip.l);
  return m;
}
function eps(s) { const br = baseReward(s) * mult(s), ops = s.mgr.operations.l; let e = 0; for (const t of s.tellers) if (t.u) e += br / tellerSpeed(t.lvl, ops); return Math.round(e); }
function prestigeShares(s) {
  const raw = 1500 * Math.pow(Math.max(1, s.lifetime) / 1e9, 0.22);
  let vip = 1; if (s.mgr.vip.h) vip = (1 + 0.04 * s.mgr.vip.l) * (1 + 0.08 * s.mgr.vip.l);
  return Math.min(10000, Math.max(0, Math.floor(raw * vip) - s.claimed));
}
function nextDev(s) {
  const gate = C.GATE[s.branch], budget = gate * 0.95;
  for (let i = 1; i < 5; i++) if (!s.depts[i] && C.DEPT_COST[i] < budget) return { cost: C.DEPT_COST[i], ap: () => (s.depts[i] = true) };
  const mt = maxTellers(s);
  for (let i = 1; i < mt; i++) if (!s.tellers[i].u && C.T_UNLOCK[i] < budget) return { cost: C.T_UNLOCK[i], ap: () => { s.tellers[i].u = true; s.tellers[i].lvl = 1; } };
  for (const g of ['customer', 'finance', 'service', 'vip']) if (!s.mgr[g].h && C.MGR_COST[g] < gate * 0.6) return { cost: C.MGR_COST[g], ap: () => (s.mgr[g].h = true) };
  let best = null;
  for (const g of ['customer', 'finance', 'service', 'vip', 'operations']) { const st = s.mgr[g]; if ((st.h || g === 'operations') && st.l < 5) { const c = (C.MGR_UP[g] || [])[st.l]; if (c && c < budget && (!best || c < best.cost)) best = { cost: c, ap: () => st.l++ }; } }
  if (best) return best;
  let lt = null; for (const t of s.tellers) if (t.u && t.lvl < C.TELLER_LCAP) if (!lt || t.lvl < lt.lvl) lt = t;
  if (lt) { const c = tellerUpCost(lt.lvl); if (c < budget) return { cost: c, ap: () => lt.lvl++ }; }
  return null;
}
const addCash = (s, a) => { s.cash += a; s.lifetime += a; };
const fmtT = (x) => x < 60 ? x.toFixed(0) + 's' : x < 3600 ? (x / 60).toFixed(1) + 'm' : x < 86400 ? (x / 3600).toFixed(1) + 'h' : (x / 86400).toFixed(1) + 'd';
function fmtN(n) { if (n < 1e3) return n.toFixed(0); const u = ['K', 'M', 'B', 'T', 'Q']; let i = -1; while (n >= 1e3 && i < 4) { n /= 1e3; i++; } return n.toFixed(2) + u[i]; }

function run(gates) {
  C.GATE = gates; const s = newState(); let t = 0, prevT = 0; const rows = []; const SAFETY = 5e7;
  for (let b = 0; b < 5; b++) {
    let guard = 0;
    while (s.cash < C.GATE[s.branch]) {
      const e = eps(s); if (e <= 0) { t = Infinity; break; }
      const dev = nextDev(s), gate = C.GATE[s.branch];
      if (dev && dev.cost > s.cash) { const dt = (dev.cost - s.cash) / e; addCash(s, e * dt); t += dt; s.cash -= dev.cost; dev.ap(); }
      else if (dev) { s.cash -= dev.cost; dev.ap(); }
      else { const dt = (gate - s.cash) / e; addCash(s, e * dt); t += dt; }
      if (++guard > SAFETY) { t = Infinity; break; }
    }
    rows.push({ ms: b === 0 ? 'Prestige #1 (branch 0 clear)' : 'Branch ' + b + ' clear', t, dt: t - prevT, eps: eps(s), bal: s.cash, tel: s.tellers.filter((x) => x.u).length, dep: s.depts.filter(Boolean).length, mgr: Object.values(s.mgr).filter((m) => m.h).length });
    prevT = t; if (!isFinite(t)) break;
    const g = prestigeShares(s); s.shares += g; s.claimed += g; s.branch++; if (s.branch > 4) break;
    s.cash = C.START_CASH; s.lifetime = 2000; s.tellers = newState().tellers; s.depts = [true, false, false, false, false];
    s.mgr = { customer: { h: false, l: 1 }, operations: { h: true, l: 1 }, finance: { h: false, l: 1 }, service: { h: false, l: 1 }, vip: { h: false, l: 1 } };
  }
  return rows;
}
function table(title, gates) {
  console.log('\n=== ' + title + ' ===');
  console.log('milestone'.padEnd(30), 'time'.padStart(9), 'Δ prev'.padStart(9), 'EPS'.padStart(11), 'balance'.padStart(11), 'tel', 'dep', 'mgr');
  const rows = run(gates);
  for (const r of rows) console.log(r.ms.padEnd(30), fmtT(r.t).padStart(9), fmtT(r.dt).padStart(9), fmtN(r.eps).padStart(11), fmtN(r.bal).padStart(11), String(r.tel).padStart(3), String(r.dep).padStart(3), String(r.mgr).padStart(3));
  return rows;
}
const NEW = [300000, 25000000, 5000000000, 2500000000000, 1000000000000000];
const rn = table('Current config gates', NEW);
const ro = table('Old gates (x0.1) — comparison', NEW.map((x) => x / 10));
const wall = (rows) => rows.reduce((a, r, i) => (i > 0 && r.dt > (a?.dt || 0) ? r : a), null);
console.log('\n--- Summary ---');
const wn = wall(rn), wo = wall(ro);
console.log('Current: first prestige', fmtT(rn[0]?.t || 0), '| biggest jump', wn ? wn.ms + ' (' + fmtT(wn.dt) + ')' : 'n/a', '| clear-all', fmtT(rn[rn.length - 1]?.t || 0));
console.log('Old x0.1: first prestige', fmtT(ro[0]?.t || 0), '| clear-all', fmtT(ro[ro.length - 1]?.t || 0));
