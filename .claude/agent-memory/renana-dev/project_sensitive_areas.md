---
name: project-sensitive-areas
description: אזורים רגישים בקוד שדורשים זהירות מיוחדת — caps, hardcoded limits, cache structures
metadata:
  type: project
---

**Queue maxLevel:** מוגדר ב-`GAME_CONFIG.QUEUE_MAX_LEVEL` (config.js). כל hardcode של `4` בקוד הישן כבר הוחלף. גם `economy-manager.js` וגם `game.js` (שני מקומות) וגם `save-manager.js` משתמשים ב-`GAME_CONFIG.QUEUE_MAX_LEVEL`.

**Prestige shares caps:** `calculatePrestigeShares()` (game.js) כבר מחזיר מקסימום 1000 ל-non-doubleShares. ב-`prestige()` עם doubleShares: cap נוסף של 1000 לאחר ×3, ו-cap כולל של 3000 ל-`state.shares`.

**Manager level cap:** מקסימום 5. מוגדר ב-`upgradeManager()` (game.js שורה 999) וגם ב-`validateAndHealState` (save-manager.js שורה 329).

**svgCache:** שונה ל-Map ב-ui-draw.js. לא להשתמש ב-`svgCache[key]` או `svgCacheKeys` — אלו לא קיימים יותר. להשתמש ב-`svgCache.has()`, `.get()`, `.set()`, `.delete()`, `.size`.

**cashSpent:** חייב להופיע ב-`initDefaultState().stats` ב-game.js (תוקן). save-manager.js מאמת אותו בשורה 419.

**tempQueueBonus:** volatile property על ה-game instance (לא נשמר). מאותחל ל-0 ב-`initDefaultState`. הגנה ב-`triggerTempQueueBonus` עם `Math.max(0, ...)`.

**Why:** כל הנ"ל נמצא כבאגים פעילים במהלך סקירת תיקונים מסודרת, יוני 2026.

**How to apply:** לפני כל שינוי ב-prestige logic, queue upgrades, svgCache, או manager upgrades — לוודא שה-caps והמבנים מעודכנים בכל הקבצים הרלוונטיים.
