# רשימת בדיקות QA — Idle Bank Empire

## לאחר כל שינוי קוד — בדוק את הרשימה הזו

---

## 1. שמירה ותאימות לאחור

**כל שדה חדש ב-`this.state` חייב:**
- [ ] להופיע ב-`initDefaultState()` ב-`game.js`
- [ ] לקבל validation ב-`save-manager.js` (בבלוק הגדול של `if (!isNum(...))`)
- [ ] לקבל ערך ברירת מחדל הגיוני אם חסר (לא `undefined`)

**בדיקה:** לפתוח את הקונסול ולהריץ `JSON.parse(localStorage.getItem('idleBank_v2'))` — לוודא שהשדות החדשים קיימים.

---

## 2. מנהלים חדשים — צ'קליסט מלא

כל מנהל חדש חייב להופיע ב-**6 מקומות**:

| מקום | קובץ | פונקציה |
|------|------|---------|
| state הגדרה | `game.js` | `initDefaultState()` — `managers` + `managerUpgrades` |
| בדיקת פתיחה | `game.js` | `isManagerUnlocked(type)` |
| נתוני רינדור | `game.js` | `getManagerRenderData(type)` |
| לוגיקה כלכלית | `economy-manager.js` | `getTotalMultiplier()` או פונקציה רלוונטית |
| validation | `save-manager.js` | `newMgrKeys` array + default objects |
| ממשק | `ui-tabs.js` | `managersKeys` + `managerConfigs` + stat labels |

---

## 3. config.js — אובייקטים קפואים

`GAME_CONFIG` הוא **frozen**. אחרי `Object.freeze(GAME_CONFIG)`:
- [ ] לא ניתן להוסיף מפתחות חדשים ב-runtime
- [ ] כל תוספת חייבת להיות **לפני** שורת ה-freeze בקובץ
- [ ] sub-objects כמו `MANAGER_COEFFICIENTS` גם הם frozen בנפרד

**בדיקה:** לאחר שינוי ב-config.js, לרענן ולבדוק שאין שגיאות `Cannot add property` בקונסול.

---

## 4. Prestige Logic — רגיש מאוד

**אחרי שינוי ב-`calculatePrestigeShares` או `prestige()`:**
- [ ] מניות לא עולות ביותר מ-1000 בפרסטיג' אחד (cap קיים ב-game.js)
- [ ] אחרי פרסטיג', `lifetimeCash` מתאפס לכסף ההתחלתי
- [ ] מניות נשמרות אחרי פרסטיג' (`savedShares`)
- [ ] `isResetting = true` בזמן פרסטיג' (מונע double-save)

---

## 5. Economy Chain — סדר חישוב

`getTotalMultiplier()` מחשב לפי הסדר הזה:
1. branchMultiplier
2. prestigeMultiplier (shares)
3. premiumYield gold upgrade
4. boost2x
5. Manager boosts (customer, finance, service, vip)
6. Marketing (רק כש-advBudget > 0 AND advActive)
7. Tech manager

**אחרי שינוי ב-economy-manager.js:**
- [ ] לבדוק שה-EPS מחושב נכון בדשבורד
- [ ] לבדוק שהגדלת EPS לא שוברת offline earnings

---

## 6. Offline Earnings — נקודות כשל נפוצות

- [ ] שינוי ב-`calculateOfflineEarnings` — לבדוק שהחישוב לא מכפיל פעמיים
- [ ] טיימר boost2x יורד נכון בזמן offline
- [ ] מנהל tech מוסיף שעות אופליין בנוסף למנהל marketing (לא במקומו)
- [ ] ב-`lastSaveTime` — תמיד timestamp של שרת, לא של לקוח

---

## 7. Anti-Cheat

- [ ] `cheatWarning` מדלק אם השינוי בזמן < -60 שניות
- [ ] הכנסות offline מוגבלות ל-1 שעה אם אין אימות שרת
- [ ] `lifetimeCash` לא יכול לקטון מהשלב הנוכחי

---

## 8. בדיקות Edge Cases

- [ ] **מה קורה עם 0 כסף?** — לחיצה על upgrade, hire manager
- [ ] **מה קורה עם מיליארד כסף?** — formatMoney מציג נכון?
- [ ] **שינוי שפה באמצע?** — כל הטקסטים מתעדכנים?
- [ ] **פרסטיג' בלי כסף מינימלי?** — הכפתור disabled?
- [ ] **מנהל חדש עם קוד שמור ישן?** — backward compat עובד?
