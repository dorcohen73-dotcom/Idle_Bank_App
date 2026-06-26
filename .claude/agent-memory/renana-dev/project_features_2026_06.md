---
name: project-features-2026-06
description: פיצ'רים שנוספו ביוני 2026 — Daily Login Bonus, Branch Welcome Bonus, Prestige Ceremony, Particle Effects, Tutorial
metadata:
  type: project
---

## Daily Login Bonus (פיצ'ר 94)

**נוסף ב:**
- `game.js` → `initDefaultState`: שדות `lastLoginDate`, `loginStreak`, `pendingLoginReward`
- `game.js` → מתודה `getDailyLoginReward(streak)`: טבלת פרסים לפי ימי רצף
- `save-manager.js` → `validateAndHealState`: ולידציה לשדות החדשים
- `save-manager.js` → `checkDailyLogin()`: מתודה חדשה שנקראת מ-`initServerTime()` אחרי `calculateOfflineEarnings`
- `save-manager.js` → `initServerTime()`: קריאה ל-`checkDailyLogin` + פתיחת modal עם delay
- `index.html` → `#login-reward-modal`: modal חדש לפני offline-modal
- `ui-events.js` → `showLoginRewardModal()` + `_applyLoginReward()`: לוגיקת הצגה + הענקת פרס
- `ui-events.js` → ייצוא `window.showLoginRewardModal`

**Why:** בונוס יומי מעודד חזרה יומיומית למשחק עם רצף עולה.

## Branch Welcome Bonus (פיצ'ר 95)

**נוסף ב:**
- `game.js` → `initDefaultState`: שדה `visitedBranches: []`
- `game.js` → `prestige()`: בדיקת `isNewBranch`, חישוב `welcomeBonusCash = EPS * 60` לפני ה-reset, שחזור `visitedBranches` אחרי initDefaultState, הוספת branch חדש, הענקת מזומן + toast
- `save-manager.js` → `validateAndHealState`: ולידציה ל-`visitedBranches`

**Why:** מתגמלת שחקנים על חקירת סניפים חדשים.

## Prestige Ceremony (פיצ'ר 92)

**נוסף ב:**
- `ui-events.js` → `triggerPrestigeCeremony(sharesGained, branchName, callback)`: overlay עם 3 שלבים (fade in, counter, fade out)
- `ui-events.js` → עטיפת `prestigeAdBtn` + `prestigeRegularBtn` בקריאה ל-`triggerPrestigeCeremony` עם callback שמפעיל את `game.prestige()`
- `ui-events.js` → ייצוא `window.triggerPrestigeCeremony`
- `style.css` → `.prestige-ceremony-overlay`, `.ceremony-line1/2/3`, `@keyframes prestigeCeremonyFadeIn`

**Why:** אנימציית ceremony לפני ה-reset הופכת את ה-prestige לחוויה ויזואלית משמעותית.

**How to apply:** הטקסט בטקסט overlay הוא עברי hardcoded. אם מוסיפים שפות — צריך להעביר lang לפונקציה.

## Particle Effects (פיצ'ר 91) — יוני 2026

**א. Gold coins rain על vault collect:**
- `ui-events.js` → `spawnVaultCoins(amount, btnRect)`: מחשבת count לפי `log10(amount)`, מדפיסה 💰 במרווחים של 80ms עם drift אקראי
- `ui-events.js` → vault collect handler: הוספת קריאה ל-`spawnVaultCoins` אחרי `animateCoins`

**ב. Confetti burst על VIP:**
- `ui-draw.js` → בתוך בדיקת `tData.customerType === 'vip'`: הוספת 3x `spawnFloating('🎊', ...)` בצבעים שונים (סגול, זהב, ירוק)

**ג. Fireworks על prestige:**
- `ui-events.js` → תוך `triggerPrestigeCeremony` — בתחילת Phase 2 (counter animation): 5 emojis ['🎆','✨','🌟','💫','🎇'] עם setTimeout של 200ms בין כל אחד

**Why:** `spawnFloating` לא תומך ב-options מורחבים (duration/drift/rise) — כל האפקטים מיושמים כ-calls פשוטים למתודה הקיימת.

## Tutorial System (פיצ'ר 93) — יוני 2026

**State:**
- `game.js` → `initDefaultState`: שדות `tutorialStep: 0`, `tutorialCompleted: false`

**HTML:**
- `index.html` → `#tutorial-overlay`: div עם `role="dialog"` לפני scripts (לא modal-overlay — z-index 8000)

**Logic:**
- `ui-events.js` → `TUTORIAL_STEPS[]`: 7 שלבים עם text ו-target selector
- `ui-events.js` → `showTutorialStep(stepIndex)`: מציגה overlay, מוסיפה `tutorial-highlight-pulse` ל-target
- `ui-events.js` → `completeTutorial()`: מסתיר overlay, שומרת state
- `ui-events.js` → `initTutorialEvents()`: מחבר כפתורות "הבנתי" ו-"דלג"
- `ui-events.js` → `maybeStartTutorial()`: נקרא מ-`initUIEvents`. **בדיקת ותיק:** אם `lifetimeCash > 5000 || shares > 0 || missionsCompleted > 0` — מסמן completed מיד ולא מציג tutorial

**CSS:**
- `style.css` → `.tutorial-overlay`, `.tutorial-tooltip`, `#tutorial-next`, `#tutorial-skip`, `.tutorial-highlight-pulse`, `@keyframes tutorial-pulse`

**How to apply:** tutorial מתחיל 2 שניות אחרי initUIEvents. שחקנים ותיקים עם save קיים לא יראו אותו.
