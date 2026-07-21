# NOTIFICATIONS_SPEC.md — התראות דחיפה מקומיות (Local Notifications)

**מסמך מפרט לביצוע ע"י Antigravity.** נכתב ע"י Claude לאחר סקירת הקוד. מיועד לאישור דור לפני ביצוע.

## 1. מטרה

להחזיר שחקנים למשחק כשהם מחוץ לו, ע"י תזמון התראות מקומיות (local notifications)
שקופצות על מסך הטלפון גם כשהאפליקציה סגורה. ההתראות מתחברות למערכות retention
שכבר קיימות (רווחי offline, streak יומי) — לא נבנית שום כלכלה חדשה.

**עיקרון מנחה:** אנדרואיד-נייטיב בלבד. בדפדפן / PWA הכל no-op שקט (בדיוק כמו AdMob ו-Crashlytics
היום). אפס שינוי התנהגות למשתמשי web.

## 2. אילוצים ותאימות

- Capacitor 8 (core/android/cli כולם `^8.4.1`). התוסף חייב להיות גרסת major תואמת: `@capacitor/local-notifications@^8`.
- גישה לתוסף דרך `window.Capacitor.Plugins.LocalNotifications`, עם אותו guard שקיים כבר:
  `if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) { ... }`.
- זיהוי נייטיב: `window.Capacitor?.isNativePlatform?.()` (כמו ב-app.js שורה 24).
- כל המחרוזות למשתמש נכנסות ל-`locales.js` (he, en, es, ru — 4 שפות קיימות). אין טקסט hard-coded.
- הקוד ל-UI הוא ES-modules שנבנים ל-`app.bundle.js` ע"י esbuild — **לא לערוך את app.bundle.js ידנית.** לבנות מחדש עם `npm run build`.
- `www/` נוצר אוטומטית — לא לערוך ידנית.

## 3. התקנה והגדרה

1. `npm install @capacitor/local-notifications@^8`
2. ב-`capacitor.config.json`, תחת `plugins`, להוסיף בלוק (אופציונלי — לאייקון/צבע קטן):
   ```json
   "LocalNotifications": {
     "smallIcon": "ic_stat_icon",
     "iconColor": "#020617"
   }
   ```
   אם אין אייקון ייעודי — להשמיט את הבלוק, ברירת המחדל תעבוד.
3. אנדרואיד 13+ דורש הרשאת `POST_NOTIFICATIONS`. לוודא שהיא ב-`android/app/src/main/AndroidManifest.xml`:
   `<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>`
   (התוסף בד"כ מוסיף אוטומטית ב-`cap sync`, אך לוודא ידנית.)

## 4. מודול חדש: `ui/events/notifications.js`

מודול ES בסגנון `ui/events/ads.js` (אובייקט `NotificationService`). מיוצא דרך `ui/events/index.js`.
כל המתודות אסינכרוניות ועטופות ב-guard נייטיב + try/catch — כישלון אף פעם לא מפיל את המשחק.

מתודות:
- `init()` — נקרא פעם אחת מאתחול ה-UI. בודק זמינות תוסף, מסמן `available = true/false`.
- `async requestPermission()` — קורא ל-`LocalNotifications.requestPermissions()`. מחזיר boolean.
- `async scheduleReminders(game)` — **נקרא כשהמשחק עובר לרקע.** מבטל התראות קודמות ואז מתזמן מחדש 3 התראות (ראה §6) לפי המצב הנוכחי. לא עושה כלום אם `game.state.notificationsEnabled === false` או אין הרשאה.
- `async cancelAll()` — **נקרא כשהמשחק חוזר לפוקוס.** מבטל את כל ההתראות המתוזמנות (ע"י ה-IDs הקבועים) כדי שלא תקפוץ התראה בזמן שהשחקן כבר בפנים.

IDs קבועים (מספרים שלמים) כדי שביטול יעבוד: `OFFLINE_FULL = 101`, `DAILY_REWARD = 102`, `COMEBACK = 103`.

## 5. חיווט לאירועי רקע/חזרה (app.js)

כבר קיים ב-`app.js` (~שורה 288) מאזין:
```js
document.addEventListener('visibilitychange', () => {
    if (document.hidden) { /* שמירה כבר קורית כאן */ }
    else { /* חזרה לפוקוס */ }
});
```
להוסיף שם:
- בענף `document.hidden` (יציאה לרקע): `NotificationService.scheduleReminders(game);`
- בענף else (חזרה): `NotificationService.cancelAll();`

זהו הזמן הנכון — היציאה לרקע היא בדיוק הרגע שבו יודעים שהשחקן עזב.

## 6. שלוש ההתראות (מחוברות למערכות קיימות)

| ID | מתי קופצת | כותרת (he לדוגמה) | טקסט |
|---|---|---|---|
| 101 offlineFull | כשמגיעים לגבול ה-offline **האמיתי לפי רמת המנהל** (ראה §6.1) | "🏦 הכספת עולה על גדותיה!" | "רווחי ה-offline שלך הגיעו למקסימום — בוא לאסוף אותם" |
| 102 dailyReward | בחצות הבא / +~20-24 שעות | "🎁 התגמול היומי מחכה לך" | "שמור על רצף הכניסות שלך וקבל את הבונוס" |
| 103 comeback | +24 שעות מרגע היציאה | "😴 הבנק שלך מתגעגע" | "העובדים משתעממים בלעדיך — חזרה מהירה?" |

הערות מימוש:
- אם אחת ההתראות בעבר (למשל dailyReward שכבר נגבה היום) — לדלג עליה, לא לתזמן.
- `schedule` מקבל `at: new Date(Date.now() + ms)`.
- שלוש ההתראות עצמאיות; comeback (24ש') תקפוץ גם אם offlineFull כבר קפצה קודם — זה בסדר, הן משרתות מטרות שונות (איסוף מול נטישה).

### 6.1 התראה 1 — זמן דינמי לפי רמת המנהל (חשוב)

גבול ה-offline **אינו קבוע** — הוא תלוי ברמת המנהלים של השחקן. הלוגיקה כבר קיימת בתוך
`calculateOfflineEarnings()` ב-save-manager.js: בסיס 2 שעות, ‎+2 שעות לכל רמת מנהל **accountant**,
‎+1 שעה לכל רמת מנהל **marketing**, ‎+2 שעות לכל רמת שדרוג-זהב `offlineEarnings`, עם תקרה של 12 שעות.

**כדי שההתראה תתוזמן לזמן הנכון בדיוק — לא לשכפל את החישוב.** לחלץ את חישוב הגבול
למתודה חוזרת אחת ב-`SaveManager`, למשל `getOfflineLimitHours()`, ו:
1. `calculateOfflineEarnings()` תקרא לה במקום לחשב inline (אפס שינוי התנהגות — אותו ערך).
2. `NotificationService.scheduleReminders()` תקרא לה כדי לתזמן את התראה 101 ל-`getOfflineLimitHours() * 3600 * 1000` מילישניות מרגע היציאה.

כך שחקן עם accountant ברמה 3 יקבל את ההתראה אחרי ‎8 שעות (2 + 2×3), ולא אחרי שעתיים — בדיוק כשהכספת שלו באמת מתמלאת.

### 6.2 שפת ההתראות — לפי בחירת השחקן

ההתראות חייבות להופיע בשפה שהשחקן בחר במשחק, לא בשפת ברירת המחדל של הטלפון.
השפה שמורה ב-`game.state.language` (ברירת מחדל `'en'`), ואובייקט המחרוזות הוא `translations[lang]`.

ב-`NotificationService`, לפני התזמון:
```js
const lang = (game.state && game.state.language) || 'en';
const t = translations[lang] || translations['en'];
// כותרת/טקסט מתוך t.notifOfflineTitle וכו'
```
כיוון שהתזמון קורה ברגע היציאה לרקע, הוא תמיד משתמש בשפה העדכנית שהשחקן הגדיר.
אם השחקן משנה שפה תוך כדי משחק — בפעם הבאה שייצא, ההתראות יתוזמנו מחדש בשפה החדשה.

### 6.3 מרווח מינימלי ומניעת כפילות (חשוב מאוד — נגד נטישה)

**הבעיה:** אם שתי התראות קופצות קרוב מדי זו לזו (למשל התגמול היומי ב-24ש' וה"מתגעגע" ב-25ש'),
זה מרגיש כמו ספאם והשחקן פשוט מכבה את כל ההתראות. חייבים **לפחות 3 שעות בין כל שתי התראות**,
ואף פעם לא שתי התראות באותו זמן.

לפני התזמון, לעבד את רשימת ההתראות דרך פונקציית ריווח:
1. לבנות את המערך עם הזמן ה"רצוי" של כל התראה (offline לפי `getOfflineLimitHours()`, daily ב-24ש', comeback ב-24ש').
2. **למיין** לפי זמן עולה.
3. לעבור בסדר ולאכוף מרווח: `MIN_GAP = 3 * 3600 * 1000` (3 שעות).
   ```js
   const MIN_GAP = 3 * 3600 * 1000;
   list.sort((a, b) => a.atMs - b.atMs);
   let lastAt = -Infinity;
   for (const n of list) {
       if (n.atMs < lastAt + MIN_GAP) n.atMs = lastAt + MIN_GAP; // דחיפה קדימה
       lastAt = n.atMs;
       n.schedule = { at: new Date(n.atMs) };
   }
   ```
4. כך מובטח: אף שתי התראות לא קרובות מ-3 שעות, אין כפילויות, והסדר הלוגי נשמר
   (offline → daily → comeback). לדוגמה offline ב-2ש', daily ב-24ש', comeback נדחף אוטומטית ל-27ש'.
5. `cancelAll()` שרץ לפני כל תזמון כבר מונע כפל מהרצות קודמות (אותם 3 IDs קבועים) — לשמר את זה.

**להסיר** את ה"25ש' כדי לא להתנגש" הנוכחי — הריווח האוטומטי מחליף את הפתרון הידני הזה.

## 7. הסכמה (Opt-in/out)

- להוסיף ל-state ב-`game.js` (initDefaultState): `notificationsEnabled: true`.
- להוסיף NaN/heal ל-`save-manager.js` validateAndHealState: אם לא boolean → `true`.
- בקשת ההרשאה (`requestPermission`) — **לא בטעינה הראשונה.** לבקש בפעם הראשונה שהשחקן יוצא לרקע *אחרי* שסיים tutorial, או בכניסה השנייה. (בקשה מוקדמת מדי = שחקנים מסרבים.)
- להוסיף toggle ב-settings (יש כבר `_settings-a11y.scss` ומנגנון perfMode כדוגמה) שמכבה/מדליק את `state.notificationsEnabled`. כשמכבים — לקרוא `cancelAll()`.

## 8. locales.js — מחרוזות להוספה

להוסיף לכל 4 השפות (he/en/es/ru), בבלוק `Object.assign(translations.XX, {...})` מתאים:
`notifOfflineTitle`, `notifOfflineBody`, `notifDailyTitle`, `notifDailyBody`,
`notifComebackTitle`, `notifComebackBody`, `settingsNotifLabel` (לטוגל).

## 9. Build & Sync

לאחר שינויי הקוד:
1. `npm run build` (bundle + css + SW hash)
2. `npm run cap-build` (מייצר www)
3. `npx cap sync` (מסנכרן לאנדרואיד + מתקין את התוסף הנייטיב)
4. בנייה/בדיקה במכשיר אמיתי (אמולטור לא תמיד מציג התראות מתוזמנות אמין).

## 10. קריטריוני קבלה (Acceptance)

- [ ] במכשיר אנדרואיד: יציאה מהמשחק → אחרי הזמן המתוזמן קופצת התראה על המסך. לחיצה פותחת את המשחק.
- [ ] **התראה 1 (offline) מתוזמנת לפי הגבול האמיתי:** שחקן עם accountant ברמה גבוהה מקבל אותה מאוחר יותר (למשל 8ש' ברמה 3), לא קבוע שעתיים. `getOfflineLimitHours()` מחזיר את אותו ערך שבו משתמש חישוב הרווחים.
- [ ] **התראה 3 (comeback) רצויה ב-24 שעות**, אך נדחפת אוטומטית כדי לשמור מרווח (ראה למטה).
- [ ] **מרווח מינימלי:** אין שתי התראות במרחק של פחות מ-3 שעות זו מזו, ואין שתי התראות באותו זמן (בדיקה: daily ב-24ש' + comeback → comeback ב-27ש' לפחות).
- [ ] **שפה:** אם השחקן הגדיר עברית — ההתראה בעברית; שינה לאנגלית ויצא — ההתראה הבאה באנגלית. אף פעם לא לפי שפת ברירת-המחדל של הטלפון.
- [ ] חזרה למשחק לפני שההתראה קפצה → ההתראה **לא** קופצת (בוטלה).
- [ ] כיבוי הטוגל ב-settings → לא מתוזמנות התראות חדשות, וקיימות מבוטלות.
- [ ] בדפדפן / PWA: אפס שגיאות בקונסול, אפס שינוי התנהגות (no-op).
- [ ] סירוב להרשאה → המשחק ממשיך רגיל בלי קריסות.
- [ ] אין מחרוזת hard-coded — הכל דרך locales.

## 11. מחוץ לסקופ (לגרסה ראשונה)

- Rich notifications / תמונות.
- התאמת שעות "נעימות" (למנוע התראה ב-3 לפנות בוקר) — שיפור עתידי.
- iOS (הפרויקט אנדרואיד-בלבד כרגע).
