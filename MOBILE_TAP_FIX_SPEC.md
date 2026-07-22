# MOBILE_TAP_FIX_SPEC — כפתורים בקצות המסך לא מגיבים ללחיצה

## תסמין
אחרי מעבר ל‑edge‑to‑edge (StatusBar `overlaysWebView: true`, targetSdk 36), רוב האפליקציה עובדת, אבל **כפתורים ספציפיים בקצוות** (עליון/תחתון, ולעיתים פינות) לא מגיבים למגע.

## אבחון (סיבת שורש סבירה ביותר)
עם `overlaysWebView: true` ה‑WebView מצייר על כל המסך — **כולל מתחת לסטטוס בר וסרגל הניווט**. כפתור שממוקם `top: 0` / `bottom: 0` (או קרוב) יושב פיזית מתחת לסרגל המערכת, והמערכת חוטפת את המגע לפני שהוא מגיע ל‑WebView. הכפתור *נראה* (מצויר מתחת לסרגל שקוף) אבל **לא ניתן ללחיצה**. זה מסביר בדיוק "כפתורים בקצוות בלבד".

חשודים משניים: (א) overlay שקוף שנשאר עם `pointer-events` מעל אזור הקצה; (ב) `padding` של safe-area שהוזז לקונטיינר אבל כפתור בן ממוקם absolute בקואורדינטה קבועה שלא כוללת inset.

---

## שלב 0 — לזהות מהר את הכפתורים הבעייתיים (5 דק')
1. חבר את המכשיר, פתח ב‑Chrome במחשב את `chrome://inspect` ובחר את ה‑WebView של האפליקציה (remote debugging).
2. ב‑DevTools, רחף מעל הכפתורים שלא עובדים ובדוק ב‑Elements/Computed:
   - `position`, `top`/`bottom`, ואם ה‑bounding box נכנס לתוך אזור הסטטוס בר/נאב בר.
   - האם יש אלמנט אחר מעליו ב‑`elementFromPoint` (ב‑Console: `document.elementFromPoint(x, y)` בקואורדינטות הכפתור — אם מוחזר אלמנט אחר, יש overlay חוסם).
3. רשום את רשימת הכפתורים המדויקת. חשודים עיקריים לפי הקוד:
   - **הדר עליון**: כפתורי הגדרות/שפה/mute/analytics/דיילי — מוגדרים `position: absolute` ב‑`scss/_theme-header-v2.scss` (שורות 216, 234, 260, 275, 306, 321, 442, 462...).
   - **סרגל ניווט תחתון + כפתורים צפים** (boost, vault-mini, גלגל מזל) — `scss/_dashboard-glass.scss` ו‑`scss/_control-panel.scss`.

---

## שלב 1 — לאשר שזו בעיית edge‑to‑edge (2 דק')
בדיקה מהירה: ב‑`app.js`, במקום `SB.setOverlaysWebView({ overlay: true })` שנה זמנית ל‑`false`. בנה, הרץ. אם הכפתורים בקצוות **חוזרים לעבוד** — אושר: זו בעיית insets. אם לא — עבור לחשוד ה‑overlay (שלב 3).

---

## שלב 2 — התיקון (בחר מסלול)

### מסלול A (מומלץ, robust) — לוודא safe‑area insets על כל אלמנט צמוד‑קצה
עבור על **כל** אלמנט אינטראקטיבי עם `position: fixed`/`absolute` שצמוד לקצה, והוסף את ה‑inset לקואורדינטה עצמה (לא רק padding לקונטיינר):

- כפתורי הדר עליון — במקום `top: X` השתמש ב‑`top: calc(X + env(safe-area-inset-top))`.
- סרגל ניווט/כפתורים תחתונים — `bottom: calc(X + env(safe-area-inset-bottom))`.
- כפתורים בפינה ימנית/שמאלית — הוסף `env(safe-area-inset-right/left)` בהתאמה.
- תמיד עם fallback: `env(safe-area-inset-top, 0px)`.

קבצים לעבור עליהם: `scss/_theme-header-v2.scss`, `scss/_dashboard-glass.scss`, `scss/_control-panel.scss`, `scss/_settings-a11y.scss` (חלק כבר מטופל שם — השלם את מה שחסר).

> חשוב: ודא שגם ל‑**קונטיינר של ההדר** יש `padding-top` הכולל `env(safe-area-inset-top)` **וגם** גובה שמכיל את הכפתורים אחרי ההזחה — אחרת הכפתורים ידחפו החוצה מהאזור הלחיץ.

### מסלול B (פרגמטי, פשוט) — לבטל overlay של הסטטוס בר
אם מסלול A מסובך מדי, פשוט אל תמשוך את התוכן מתחת לסרגלים:
1. ב‑`capacitor.config.json` → `StatusBar`: `"overlaysWebView": false`, והשאר `"backgroundColor"` צבע מלא (למשל `#03050a`).
2. ב‑`app.js`: `SB.setOverlaysWebView({ overlay: false })` + `SB.setBackgroundColor({ color: '#03050a' })`.
3. כך הסטטוס בר מקבל רקע מלא והתוכן מתחיל *מתחתיו* — כפתורי הקצה העליונים כבר לא מתחת לסרגל. (על אנדרואיד 15/SDK35+ ה‑edge‑to‑edge נכפה חלקית; `setOverlaysWebView(false)` גורם ל‑Capacitor להוסיף padding כך שהתוכן לא נחתך.)

הטרייד‑אוף: מראה קצת פחות "immersive", אבל אמינות מגע מלאה. לאפליקציית idle זה בדרך כלל שווה את זה.

---

## שלב 3 — אם זה overlay חוסם (לא insets)
- ודא שמסך הפתיחה נסגר לגמרי: גם ה‑native (`SplashScreen.hide()` נקרא) וגם ה‑DOM `#splash-screen` (z-index 9999, position fixed, מסך מלא) — הוסף לו `display: none` / הסר מה‑DOM אחרי טעינה. אם הוא נשאר, הוא חוסם את **כל** המגעים, אך אם חלקית שקוף/ממוקם, יכול לחסום רק קצה.
- חפש כל overlay/backdrop של מודאל שנשאר עם `pointer-events: auto` אחרי סגירה (המאזין ל‑backButton שהוספנו מסיר קלאסים ומוסיף `hidden` — ודא שהסגירה הרגילה של המודלים גם מאפסת `pointer-events`).
- כלל אצבע: אלמנט דקורטיבי מלא‑מסך (glow, vignette, particles) חייב `pointer-events: none`.

---

## שלב 4 — אימות (checklist)
בנה והרץ על מכשיר, ובדוק לחיצה על **כל** כפתור קצה:
1. שני מכשירים: אחד עם מחוות ניווט (gesture bar), אחד עם 3 כפתורים.
2. אם יש notch/punch-hole — בדוק גם כפתורים בפינות העליונות.
3. כל כפתורי ההדר (הגדרות/שפה/mute/analytics/דיילי) מגיבים.
4. כל טאבי הניווט התחתונים + כפתורים צפים (boost/vault/גלגל) מגיבים.
5. `document.elementFromPoint()` על מרכז כל כפתור מחזיר את הכפתור עצמו, לא overlay.

## סדר סגירה
`npm run build` → העלה `?v=` ב‑index.html + גרסה ב‑package.json → `npm run cap-build && npx cap sync` → בנייה והרצה על מכשיר → checklist שלב 4.

## אזהרה
אין לערוך ידנית `app.bundle.js`, `style.css`, `www/`. CSS דרך `scss/*` + `npm run css`. קוד דרך `ui/*`/`app.js` + `npm run bundle`.
