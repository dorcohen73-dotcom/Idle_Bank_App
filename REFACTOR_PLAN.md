# תוכנית פיצול game.js — לאישור לפני ביצוע

> מסמך לסקירה (נכתב ע"י Claude, מיועד לביקורת של Antigravity לפני ביצוע).
> נכון להיום: game.js = 1,820 שורות, מחלקה אחת `IdleBankGame` שמרכזת הכל.

## 1. מטרה

לפצל את `IdleBankGame` לקונטרולרים ממוקדים, לפי אותו דפוס שכבר קיים ועובד בפרויקט
(`EconomyManager`, `SaveManager`, `MissionController`, `AchievementController`):
מחלקה נפרדת בקובץ נפרד, שמקבלת את `game` בבנאי, ו-game.js שומר מתודות facade דקות.

**עיקרון מנחה: אפס שינוי התנהגות.** הזזת קוד verbatim בלבד — שום שינוי לוגיקה,
שום שינוי במבנה ה-state או בפורמט השמירה, שום שינוי ב-API הציבורי של `game`
(ה-UI bundle והבדיקות תלויים בו).

## 2. אילוצים (חשוב לוודא בסקירה)

- הסקריפטים נטענים כ-`<script defer>` רגילים החולקים scope אחד — סדר טעינה קריטי.
  כל קובץ חדש חייב להיכנס ל-index.html **לפני** game.js.
- `tests/game.test.js` ו-`tests/tick-guard.test.js` משכפלים את סדר הטעינה
  ב-`scriptOrder` — חייבים להתעדכן באותו קומיט.
- `tools/build.js` (hash ל-SW) קולט קבצי js חדשים אוטומטית — אין צורך בעדכון.
- root `build.js` מעתיק הכל ל-www — אין צורך בעדכון.
- eslint config מגדיר globals בין הקבצים — ייתכן עדכון קטן.
- CLAUDE.md מתעד את סדר הטעינה — לעדכן.

## 3. חלוקה מוצעת

| קובץ חדש | מה עובר אליו | שורות במקור (בקירוב) |
|---|---|---|
| `guard-controller.js` | מכונת המצבים של השומרים מתוך `update()` (idle → moving_to_teller_N → collecting → moving_to_vault → depositing), `triggerGuard` | ‎~1190–1410, 918–944 |
| `customer-flow-controller.js` | ספאון לקוחות, ניהול תור, שיבוץ לטלרים, טיק עיבוד הטלרים (כולל VIP/rich), `clickTeller`, `shiftQueue`, `clearQueue`, `sanitizeQueueAndTellers` | ‎~982–1185, 636–651, 1640–1683 |
| `prestige-controller.js` | `prestige`, `calculatePrestigeShares`, `calculateTotalAssets`, `travelToBranch`, `getDailyLoginReward` | ‎~683–917, 1602–1615 |
| `shop-controller.js` (אופציונלי, פאזה 4) | כל פעולות הקנייה: `upgradeEntity*`, `unlock*`, `hireManager`, `buyGoldUpgrade`, `upgradeManager*`, `selectManagerSkill` | ‎~430–635, 1412–1553 |

**נשאר ב-game.js:** בנאי, `initDefaultState`, `validateAndHealState` (מואצל ל-SaveManager כבר היום),
getters/facades, `update(dt)` כמתאם דק שקורא לקונטרולרים לפי סדר, `getXRenderData` (ממשק ל-UI),
פעולות מטבע בסיסיות (`addCash`, `spendCash`, `tickTimer`).

צפי: game.js יורד לאזור ‎600–700 שורות; אף קובץ חדש לא עובר ‎450.

## 4. סדר ביצוע — פאזה = קומיט נפרד שניתן לשחרר לבד

כל פאזה עוברת את אותו טקס:
1. העתקת הקוד verbatim למחלקה חדשה (שדות `g.`/`t.` נשארים זהים — עובדים על אותו state).
2. ב-game.js: המתודות המקוריות הופכות ל-delegation חד-שורתי (כמו `getTellerSpeed` היום).
3. עדכון index.html (script tag + ‎?v=), שני קבצי הבדיקות, CLAUDE.md.
4. `npm test` + `npm run test:e2e` + `npm run lint` — הכל ירוק לפני קומיט.
5. בדיקה ידנית: טעינת save קיים מגרסה קודמת + סשן משחק קצר.

- **פאזה 0 — baseline:** הרצת כל הבדיקות ותיעוד התנהגות (כבר קיימות 8 בדיקות על טלרים/שומר — הן רשת הביטחון המרכזית של פאזות 1–2).
- **פאזה 1 — GuardController.** הקוד הכי מבודד (בלוק אחד רציף ב-update). סיכון נמוך.
- **פאזה 2 — CustomerFlowController.** תלוי ב-reward formula — לוודא ש-`finalRewardForTick` מחושב פעם אחת ומועבר, לא מחושב פעמיים.
- **פאזה 3 — PrestigeController.** נוגע באיפוס state — לבדוק ידנית פרסטיז' מלא + מעבר סניף.
- **פאזה 4 (אופציונלי) — ShopController.** הרבה מתודות אבל כולן דפוס זהה (בדיקת מחיר → חיוב → עדכון level).

## 5. סיכונים ומענה

| סיכון | מענה |
|---|---|
| שבירת סדר טעינה (ReferenceError בעלייה) | הקונטרולרים לא רצים בבנאי — רק נרשמים; game.js נטען אחרון ומחבר הכל |
| `this` binding שגוי אחרי ההעברה | הקונטרולר מחזיק `this.game`; גישה ל-state דרך `this.game.state` בלבד |
| UI קורא למתודה שהוזזה | ה-facade נשאר — grep על `game.<method>` ב-ui/ לפני כל פאזה |
| שבירת save ישן | אסור לגעת ב-initDefaultState/validateAndHealState בפאזות 1–2; פאזה 3 בבדיקה ידנית |
| SW cache ישן אצל שחקנים | bump ‎?v= לכל הסקריפטים החדשים + `npm run build` בכל פאזה |

## 6. מה מחוץ לתחום (לא נוגעים)

שינויי balance, שיפורי ביצועים, שינוי פורמט save, שכתוב ה-UI, TypeScript.
כל אחד מאלה — אם רוצים — הוא פרויקט נפרד אחרי שהפיצול מתייצב.

## 7. קריטריוני קבלה

- כל הבדיקות (unit + e2e + lint) ירוקות בכל פאזה.
- save מגרסה 1.0.135 נטען ללא אזהרות והמשחק ממשיך כרגיל.
- diff התנהגותי: אפס. שחקן לא יכול להבחין שמשהו השתנה.
- game.js מתחת ל-750 שורות בסוף פאזה 3.
