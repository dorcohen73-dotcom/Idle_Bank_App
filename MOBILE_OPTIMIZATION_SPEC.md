# MOBILE_OPTIMIZATION_SPEC — התאמת האפליקציה לטלפון

מפרט משימות לביצוע. המשחק רץ בעיקר כאפליקציית אנדרואיד (Capacitor) + PWA.
`targetSdk = 36`, `minSdk = 24`, Capacitor 8. אורientation: portrait בלבד.

## כללי עבודה (מ‑CLAUDE.md — חובה)

- **אין לערוך ידנית** `app.bundle.js`, `style.css`, או `www/`. הם מיוצרים.
- CSS נכתב ב‑`scss/*` ומקומפל עם `npm run css`.
- קוד UI נכתב ב‑`ui/*` / `app.js` ומחובר עם `npm run bundle`.
- אחרי כל שינוי מקור: `npm run build` (verify + bundle + css + SW hash) ואז `npm run cap-build` ל‑`www/` ו‑`npx cap sync` לאנדרואיד.
- כשמשנים סקריפטים מרכזיים או קונפיג — צריך **להעלות את `?v=` ב‑index.html** ואת גרסת האפליקציה, אחרת קליינטים לא יקבלו את השינוי (service worker cache).
- כסף מעוגל לסנטים; סגנון NaN‑defensive; כל מחרוזת למשתמש ב‑`locales.js` (עברית ראשית).

הרשימה מסודרת לפי עדיפות. בצע 1→5. אחרי כל סעיף — build + sync ובדיקה על מכשיר/אמולטור.

---

## 1. Edge‑to‑edge + Status Bar (קריטי)

**בעיה:** `targetSdk 36` (אנדרואיד 15+) כופה edge‑to‑edge — הסטטוס בר וסרגל הניווט הופכים שקופים והתוכן נמשך מתחתיהם. כרגע `@capacitor/status-bar` **לא מותקן**, אז אין שליטה על צבע/סגנון הסטטוס בר, ועלול להיווצר טקסט כהה על רקע כהה או חפיפה עם ההדר.

**לבצע:**

1. התקנה:
   ```
   npm i @capacitor/status-bar @capacitor/app
   ```
2. ב‑`capacitor.config.json` הוסף בלוק `StatusBar` תחת `plugins`:
   ```json
   "StatusBar": {
     "style": "DARK",
     "backgroundColor": "#03050a",
     "overlaysWebView": true
   }
   ```
   (`style: "DARK"` = אייקונים בהירים על רקע כהה. `overlaysWebView: true` מתאים ל‑edge‑to‑edge — התוכן מאחורי הסטטוס בר, וה‑CSS insets מטפלים ב‑padding.)
3. אתחול בזמן ריצה — ב‑`app.js`, בתוך הבלוק שרץ כש‑`isNativePlatform()` (ליד אתחול ה‑SplashScreen סביב שורה 369), הוסף:
   ```js
   const SB = window.Capacitor?.Plugins?.StatusBar;
   if (SB) {
     SB.setOverlaysWebView({ overlay: true }).catch(() => {});
     SB.setStyle({ style: 'DARK' }).catch(() => {});   // אייקונים בהירים
   }
   ```
   עטוף ב‑try/catch — אסור שכשל של פלאגין יפיל את האתחול.
4. **ודא שכל האלמנטים הצמודים לקצה העליון/תחתון משתמשים ב‑`env(safe-area-inset-*)`.** כבר קיים טיפול נרחב (`_dashboard-glass.scss`, `_settings-a11y.scss`, `_responsive.scss`), אבל בדוק ספציפית:
   - ההדר העליון — `padding-top` כולל `env(safe-area-inset-top)`.
   - סרגל הניווט התחתון (bottom nav) — `padding-bottom` כולל `env(safe-area-inset-bottom)`.
   - מודאלים במסך מלא — `env(safe-area-inset-top/bottom)`.
   הוסף `env()` בכל מקום צמוד‑קצה שחסר בו, עם fallback: `env(safe-area-inset-top, 0px)`.

**בדיקת קבלה:** על אנדרואיד 15+ — ההדר לא נחתך מתחת לשעון/סוללה, ה‑bottom nav לא נחתך מתחת לפס הניווט, אייקוני הסטטוס בר קריאים.

---

## 2. כפתור "חזור" הפיזי של אנדרואיד (קריטי)

**בעיה:** `@capacitor/app` לא מותקן ואין מאזין ל‑`backButton`. לחיצה על "חזור" בזמן שמודאל פתוח **סוגרת את כל האפליקציה** במקום לסגור את המודאל.

**לבצע:** (`@capacitor/app` כבר הותקן בסעיף 1)

1. ב‑`app.js` (או מודול events מתאים ב‑`ui/events/`) הוסף מאזין אחרי האתחול:
   ```js
   const CapApp = window.Capacitor?.Plugins?.App;
   if (CapApp) {
     CapApp.addListener('backButton', ({ canGoBack }) => {
       // 1) אם יש מודאל פתוח — סגור אותו בלבד
       const openModal = document.querySelector('.modal.active, .modal:not([hidden]).show, [data-modal-open="true"]');
       if (openModal) { closeTopModal(openModal); return; }
       // 2) אחרת — התנהגות ברירת מחדל: יציאה מהאפליקציה
       CapApp.exitApp();
     });
   }
   ```
2. **התאם את הסלקטור** למבנה המודאלים בפועל. בדוק ב‑`ui/events/index.js` איך מודאלים נפתחים/נסגרים (יש שם המון `addEventListener('click')` לכפתורי close) והשתמש באותה פונקציית סגירה קיימת במקום `closeTopModal` דמיוני. אם יש מחסנית מודאלים — סגור רק את העליון.
3. אם פתוח מודאל onboarding/הדרכה — כדאי לחסום יציאה בטעות (return בלי exit).

**בדיקת קבלה:** "חזור" סוגר מודאל פתוח; "חזור" במסך הראשי (בלי מודאל) יוצא מהאפליקציה; אין יציאה בטעות באמצע הדרכה.

---

## 3. Splash Screen (קריטי‑בינוני)

**בעיה:** `capacitor.config.json` מגדיר קונפיג ל‑`SplashScreen` וה‑JS קורא ל‑`SplashScreen.hide()`, אבל `@capacitor/splash-screen` **לא ברשימת התלויות** — הקונפיג עלול להיות מתעלם. בנוסף `launchShowDuration: 3500` (3.5ש קבועות) ארוך מדי ולא רספונסיבי לזמן טעינה אמיתי.

**לבצע:**

1. התקן: `npm i @capacitor/splash-screen`
2. ב‑`capacitor.config.json` שנה ל‑hide ידני (מהיר יותר, נעלם ברגע שהמשחק מוכן):
   ```json
   "SplashScreen": {
     "launchShowDuration": 0,
     "launchAutoHide": false,
     "backgroundColor": "#020617",
     "androidSplashResourceName": "splash",
     "androidScaleType": "CENTER_CROP"
   }
   ```
3. ודא שהקריאה הקיימת `window.Capacitor.Plugins.SplashScreen.hide()` נקראת **רק אחרי** שהמשחק אותחל וה‑DOM צויר (כבר קיימת ב‑`app.js` ~שורות 369, 460 — ודא שהיא רצה בסוף האתחול, לא לפניו). אם `launchAutoHide:false`, חובה שה‑hide ייקרא, אחרת ה‑splash נתקע.
4. שמור fallback: אם האתחול נכשל, קרא `hide()` בכל מקרה (ב‑catch) כדי לא לתקוע מסך פתיחה.

**בדיקת קבלה:** מסך הפתיחה נעלם מיד כשהמשחק מוכן (לא 3.5ש קבועות), ולעולם לא נתקע.

---

## 4. `100vh` → `100dvh` (בינוני)

**בעיה:** `100vh` במובייל נחתך על ידי סרגלי הדפדפן (רלוונטי למצב PWA/דפדפן). יש 4 מופעים.

**לבצע — ב‑`scss/`, לכל מופע החלף עם fallback:**

- `scss/_base.scss:95` — `min-height: 100vh;`
- `scss/_layout.scss:188` — `min-height: 100vh;`
- `scss/_responsive.scss:916` — `height: 100vh;`
- `scss/_security-vault.scss:590` — `height: 100vh;`

תבנית החלפה (fallback קודם, dvh אחריו):
```scss
min-height: 100vh;      /* fallback לדפדפנים ישנים */
min-height: 100dvh;
```
(ל‑`height` בהתאמה: `height: 100vh; height: 100dvh;`)

אחרי השינוי הרץ `npm run css` וודא שאין רגרסיה בגובה המסכים.

**בדיקת קבלה:** אין חיתוך תחתון של תוכן בדפדפן מובייל כשסרגל הכתובת גלוי.

---

## 5. יעדי מגע (touch targets) — בינוני

**בעיה:** מספר כפתורים קטנים מ‑44×44px (המינימום המומלץ ל‑touch).

**לבצע — הגדל ל‑44px (או לפחות 40px אם 44 שובר פריסה):**

- `scss/_responsive.scss:404` — `min-width: 24px !important;` → העלה ל‑`44px` (בדוק שלא שובר את השורה; אם צר, לפחות `40px`).
- `scss/_missions-achievements.scss:744` — `min-width: 30px;` → `44px`.
- `scss/_upgrade-cards-v3.scss:501` — `.upg-v2-buy-btn { ... min-height: 32px !important; }` → `min-height: 44px !important;` (זה כפתור הקנייה הראשי — חשוב במיוחד).

לכפתורים קטנים שאסור להגדיל ויזואלית, אפשר להשאיר גודל ויזואלי קטן ולהוסיף אזור מגע גדול יותר עם `::before` שקוף בגודל 44px, או `padding` שקוף.

**בדיקת קבלה:** כל כפתור אינטראקטיבי לפחות ~44px בציר הקצר; קל ללחוץ על כפתורי הקנייה באגודל.

---

## סדר סגירה (checklist ל‑Antigravity)

1. `npm i @capacitor/status-bar @capacitor/app @capacitor/splash-screen`
2. עריכות: `capacitor.config.json`, `app.js` (+ מודול events למודאלים), `scss/_base.scss`, `scss/_layout.scss`, `scss/_responsive.scss`, `scss/_security-vault.scss`, `scss/_missions-achievements.scss`, `scss/_upgrade-cards-v3.scss`.
3. `npm run build` (ודא ש‑verify עובר).
4. העלה `?v=` ב‑`index.html` ואת הגרסה ב‑`package.json` + `data-version` ב‑`<html>`.
5. `npm run cap-build && npx cap sync`.
6. `npm run lint` + `npm test` — ודא שהכל ירוק.
7. בנייה/הרצה על אנדרואיד 15+ ובדיקת כל 5 קריטריוני הקבלה.

## מה **לא** לגעת בו

- `app.bundle.js`, `style.css`, `www/` — מיוצרים, אין לערוך ידנית.
- אין לשנות לוגיקת כלכלה/שמירה — זה מפרט UI/פלטפורמה בלבד.
