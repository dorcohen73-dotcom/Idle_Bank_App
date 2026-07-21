# RATING_SPEC.md — בקשת דירוג בחנות (In-App Review)

**מסמך מפרט לביצוע ע"י Antigravity.** נכתב ע"י Claude לאחר סקירת הקוד. מיועד לאישור דור לפני ביצוע.

## 1. מטרה

להעלות את דירוג המשחק בגוגל פליי (ובכך את הדירוג בחיפוש → יותר התקנות אורגניות)
ע"י בקשת דירוג רשמית **ברגע השיא הרגשי** של השחקן — סיום prestige — כשהוא הכי מרוצה.

**עיקרון מנחה:** אנדרואיד-נייטיב בלבד, no-op שקט בדפדפן / PWA (כמו AdMob, Crashlytics וההתראות).
בקשה **פעם אחת בלבד** בכל התקנה, ורק אחרי רגע חיובי. לעולם לא בכניסה, לא אחרי כישלון, ולא פעמיים.

## 2. אילוצים ותאימות

- תוסף תואם Capacitor 8. מומלץ `@capacitor-community/in-app-review` (לוודא גרסת major תואמת ל-Capacitor 8; אם אין — להשתמש בתוסף In-App Review תואם אחר).
- גישה דרך `window.Capacitor.Plugins.InAppReview` עם אותו guard נהוג בפרויקט:
  `if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.InAppReview) { ... }`.
- זיהוי נייטיב: `window.Capacitor?.isNativePlatform?.()`.
- **הערה על Google Play:** ה-API הרשמי (`requestReview`) שולט בעצמו מתי להציג את הדיאלוג ואם בכלל
  (מכסות פנימיות). אסור להסתמך על כך שהוא תמיד יופיע, ואסור לתמרץ דירוג. פשוט לקרוא לו ברגע הנכון.
- בדפדפן / dev — הדיאלוג לא קיים; הקוד חייב פשוט לצאת בשקט.

## 3. הטריגר — prestige השני

הבקשה תופעל אחרי **ה-prestige השני** של השחקן (לא הראשון — בראשון הוא עוד לומד; בשני הוא כבר "נתפס").

### 3.1 מונה prestige (להוסיף)

אין כרגע שדה שסופר prestige. ב-`prestige-controller.js`, בתוך `prestige()` (אחרי שהאיפוס באמת קרה
והבקשה אושרה, למשל ליד עדכון `game.state.stats.claimedPrestigeShares`), להוסיף:
```js
if (!game.state.stats) game.state.stats = {};
game.state.stats.prestigeCount = (game.state.stats.prestigeCount || 0) + 1;
```
ב-`save-manager.js` (validateAndHealState): אם `stats.prestigeCount` אינו מספר תקין ≥ 0 → 0.

### 3.2 מתי לקרוא לבקשה

טקס ה-prestige כבר קיים: `triggerPrestigeCeremony(sharesGained, branchName, callback)` ב-`ui/events/modals.js`,
ומקבל `callback` שרץ בסיום הטקס. **בתוך ה-callback הזה** (ב-`ui/events/index.js`, בערך שורות 455 ו-477),
אחרי שהזיקוקים נגמרו והשחקן חזר למשחק, להוסיף:
```js
ReviewService.maybeRequest(game);
```
כך הבקשה מופיעה רק אחרי שהשחקן נהנה מהטקס, לא באמצעו.

## 4. מודול חדש: `ui/events/review.js`

אובייקט `ReviewService` בסגנון `ui/events/ads.js`. כל המתודות async + guard נייטיב + try/catch
(כישלון אף פעם לא מפיל את המשחק). מיוצא דרך `ui/events/index.js` ונחשף ל-window כמו שאר השירותים.

```
ReviewService = {
    available: false,
    init(),                       // בודק זמינות תוסף פעם אחת
    async maybeRequest(game) {
        // 1. אם כבר ביקשנו אי-פעם — לצאת (game.state.stats.reviewRequested === true)
        // 2. אם לא נייטיב או התוסף לא זמין — לצאת בשקט
        // 3. אם prestigeCount < 2 — לצאת
        // 4. לסמן game.state.stats.reviewRequested = true ולשמור (game.saveGame())
        // 5. try { await InAppReview.requestReview(); } catch {}
    }
}
```

**חשוב:** לסמן `reviewRequested = true` **לפני/סביב** הקריאה, כך שגם אם ה-API לא הציג כלום —
לא ננסה שוב בהתקנה הזו. (אי אפשר לדעת אם המשתמש דירג; לא מנסים שוב בכל מקרה.)

## 5. State חדש

- `game.state.stats.prestigeCount` — מספר, ברירת מחדל 0 (מתעדכן ב-§3.1).
- `game.state.stats.reviewRequested` — boolean, ברירת מחדל false. heal ב-save-manager: אם לא boolean → false.
- שני השדות חייבים לשרוד prestige (הם תחת `stats`, שכבר נשמר דרך `savedStats` ב-`prestige()`).

## 6. אין UI וטקסט משלנו

הדיאלוג הוא של גוגל — אין מודל משלנו, אין כפתורים, אין מחרוזות ב-locales. לא לבנות "אתה נהנה? דרג אותנו"
מסך-ביניים לפני הבקשה הרשמית (מנוגד למדיניות Google Play). פשוט לקרוא ל-API הרשמי.

## 7. Build & Sync

1. `npm install <תוסף In-App Review תואם>`
2. `npm run build` → `npm run cap-build` → `npx cap sync`
3. בדיקה במכשיר אמיתי עם חשבון Google (בדיבאג הדיאלוג לא תמיד מופיע — זו התנהגות תקינה של Google, לא באג).

## 8. קריטריוני קבלה (Acceptance)

- [ ] אחרי prestige **שני** במכשיר אנדרואיד — נקראת בקשת הדירוג (בדיקה ע"י לוג/מעקב שהפונקציה רצה; הצגת הדיאלוג עצמו בשליטת Google).
- [ ] אחרי prestige **ראשון** — לא נקראת.
- [ ] prestige שלישי ואילך — לא נקראת שוב (`reviewRequested` כבר true).
- [ ] `prestigeCount` ו-`reviewRequested` שורדים prestige ושמירה/טעינה.
- [ ] בדפדפן / PWA — אפס שגיאות, אפס התנהגות (no-op).
- [ ] התוסף לא זמין / הרשאה נכשלת → המשחק ממשיך רגיל בלי קריסה.
- [ ] הבקשה נקראת רק מתוך ה-callback של סיום טקס ה-prestige, לא באמצעו.

## 9. מחוץ לסקופ

- מסך "דרג אותנו" ידני / כפתור בהגדרות (אפשר בהמשך, בזהירות מדיניות).
- iOS (הפרויקט אנדרואיד-בלבד כרגע).
