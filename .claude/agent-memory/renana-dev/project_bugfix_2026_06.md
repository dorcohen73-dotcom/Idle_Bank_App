---
name: bugfix-batch-2026-06
description: תיקון 9 באגים קריטיים שבוצע ביוני 2026 — קבצים שנגעו בהם ותוצאות
metadata:
  type: project
---

תיקון קבוצת באגים קריטיים בוצע ב-2026-06-21.

**Why:** תיקון 10 באגים שזוהו בפרויקט — חלקם שגיאות לוגיקה, חלקם UI לא עקבי עם config.

**How to apply:** לפני עריכה של ui-tabs.js — לבדוק שכל אחוזי מנהלים נלקחים מ-GAME_CONFIG.MANAGER_COEFFICIENTS ולא hardcoded.

## תוצאות:

- **C-01 (VIP כפול)** — לא נמצא. economy-manager.js מחשב VIP פעם אחת בלבד. לא בוצע תיקון.
- **C-02 (Labels מנהלים)** — תוקן ב-ui-tabs.js: operations stat2 שונה מ-teller_speed ל-counter_cap; כל מספרי ה-stat hardcoded ב-updateButtonAffordability הוחלפו בקריאה דינמית מ-GAME_CONFIG.MANAGER_COEFFICIENTS; footerVal contribution הוחלף בדינמי.
- **C-03 (Queue MAX)** — תוקן: `queueLvl >= 4` → `queueLvl >= GAME_CONFIG.QUEUE_MAX_LEVEL` ב-ui-tabs.js.
- **C-04 (startingCash)** — תוקן: שני מקומות ב-ui-tabs.js שהיו עם `[150,...]` hardcoded הוחלפו ב-GAME_CONFIG.STARTING_CASH_OPTIONS.
- **C-05 (שיתוף/מניה)** — תוקן ב-locales.js: `shares_1` ו-`shares_3` בעברית.
- **C-06 (localStorage crash)** — תוקן ב-save-manager.js: עטוף ב-try/catch עם console.warn.
- **C-07 (cash כפול בprestige)** — תוקן ב-game.js: הסרת ההשמה הכפולה של this.state.cash לפני initDefaultState().
- **C-08 (hire_managers < 10)** — תוקן ב-mission-controller.js: שונה ל-< 6 ו-Math.min(6,...).
- **C-09 (PWA reload)** — תוקן ב-app.js: שמירה לפני reload ב-controllerchange event.
- **C-10 (אחוזים hardcoded)** — תוקן כחלק מ-C-02.

## קבצים שנערכו:
- ui-tabs.js (C-02, C-03, C-04, C-10)
- locales.js (C-05)
- save-manager.js (C-06)
- game.js (C-07)
- mission-controller.js (C-08)
- app.js (C-09)
