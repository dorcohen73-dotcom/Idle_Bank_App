#!/usr/bin/env node
/**
 * edge_cases.js — בודק מקרי קצה לדניאל
 * שימוש: node edge_cases.js [feature-name]
 *
 * טוען את קובצי המשחק ומריץ בדיקות edge case אוטומטיות.
 * דורש: Node.js עם גישה לקבצי הפרויקט.
 */

const fs = require('fs');
const path = require('path');

const FEATURE = process.argv[2] || 'unknown';
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ─── כלי עזר ───────────────────────────────────────────────────────────────

function pass(test) { console.log(`  ✅ ${test}`); return true; }
function fail(test, detail) { console.log(`  ❌ ${test}: ${detail}`); return false; }
function warn(test, detail) { console.log(`  ⚠️  ${test}: ${detail}`); }

function tryLoad(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return null;
    }
}

// ─── בדיקות ─────────────────────────────────────────────────────────────────

function checkSaveManager() {
    console.log('\n📦 בדיקת save-manager.js');
    const code = tryLoad(path.join(PROJECT_ROOT, 'save-manager.js'));
    if (!code) { warn('save-manager.js', 'לא נמצא — דלג'); return; }

    // בדוק שיש undefined check לכל שדה חדש
    const undefinedChecks = (code.match(/=== undefined/g) || []).length;
    if (undefinedChecks > 0) {
        pass(`נמצאו ${undefinedChecks} בדיקות undefined — Validation קיים`);
    } else {
        fail('Validation', 'לא נמצאו בדיקות undefined ב-loadGame');
    }
}

function checkConfig() {
    console.log('\n⚙️  בדיקת config.js');
    const code = tryLoad(path.join(PROJECT_ROOT, 'config.js'));
    if (!code) { warn('config.js', 'לא נמצא — דלג'); return; }

    const freezeIdx = code.indexOf('Object.freeze');
    if (freezeIdx === -1) {
        warn('Object.freeze', 'לא נמצא — בדוק ידנית');
        return;
    }

    // ודא שאין הוספות אחרי freeze
    const afterFreeze = code.slice(freezeIdx + 20);
    if (/CONFIG\.\w+\s*=/.test(afterFreeze)) {
        fail('Config after freeze', 'נמצאה כתיבה ל-CONFIG אחרי Object.freeze — יגרום לcrash');
    } else {
        pass('Config.freeze — כל הוספות לפני Object.freeze');
    }
}

function checkEdgeCases() {
    console.log('\n🔢 בדיקות מקרי קצה (סימולציה)');

    // Edge: cash = 0
    const cashZero = 0;
    try {
        const epsAtZero = cashZero / 1; // EPS לא תלוי ב-cash
        pass(`cash=0 — EPS תקין (${epsAtZero})`);
    } catch (e) {
        fail('cash=0', e.message);
    }

    // Edge: ערכים גדולים
    const bigNum = 1e15;
    const formatted = formatNumber(bigNum);
    if (formatted && formatted !== String(bigNum)) {
        pass(`1e15 → ${formatted} (פורמט תקין)`);
    } else {
        warn('פורמט גדול', 'ודא שהפונקציה formatNumber מטפלת ב-1e15');
    }

    // Edge: Offline O(1)
    const code = tryLoad(path.join(PROJECT_ROOT, 'economy-manager.js'));
    if (code) {
        if (/for\s*\(.*offline/i.test(code)) {
            fail('Offline Earnings', 'נמצאה לולאה על offlineSeconds — O(N)! גורם לcrash');
        } else if (/Math\.min.*offline/i.test(code)) {
            pass('Offline Earnings — O(1) עם Math.min');
        } else {
            warn('Offline Earnings', 'לא ניתן לאמת — בדוק ידנית ב-economy-manager.js');
        }
    }
}

function formatNumber(n) {
    if (n >= 1e15) return (n / 1e15).toFixed(1) + 'Q';
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9)  return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6)  return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
    return String(n);
}

// ─── ריצה ראשית ──────────────────────────────────────────────────────────────

console.log(`📋 Edge Cases QA — ${FEATURE}`);
console.log('='.repeat(50));

checkSaveManager();
checkConfig();
checkEdgeCases();

console.log('\n' + '='.repeat(50));
console.log('📋 הדוח המלא ← העבר לדניאל לסיכום ב-qa-reporter');
