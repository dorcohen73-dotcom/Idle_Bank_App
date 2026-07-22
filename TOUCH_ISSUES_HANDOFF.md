# TOUCH_ISSUES_HANDOFF — לְ‑Antigravity: כפתורים/גרירה לא מגיבים במגע

## תסמין
במובייל, חלק מהכפתורים לא מגיבים למגע — כולל כפתור **גלגל המזל** בהדר (`#fortune-wheel-btn`, 🎡), וגם גרירת ה‑**slider** (קמפיין פרסום). חלק אחר של האפליקציה עובד.

## חשודים שכבר נשללו (נבדק בקוד ה‑committed דרך git — אל תבזבז עליהם זמן)
- `.floating-container` (שכבת מספרים מעופפים) → `pointer-events: none`, ובמובייל `z-index: 0`. לא חוסם.
- `#toast-container` → `pointer-events: none`, `width: max-content` (לא מלא‑מסך). לא חוסם.
- `#splash-screen.luxury-splash` (z-index 9999) → נמחק ב‑`splashScreen.remove()` (app.js ~414) אחרי טעינה.
- אין מאזין `touchmove/touchstart` גלובלי עם `preventDefault` שחוסם (רק `touchstart` חד‑פעמי לזיהוי אינטראקציה ראשונה, שמוסר מיד).
- `#fortune-wheel-btn` **מחווט** נכון: מאזין click ב‑`ui/events/index.js:118` → `openFortuneWheel()`. הבעיה אינה בהיעדר handler.

> הערה: קלוד לא יכול לבדוק בזמן ריצה (סביבתו לא מריצה דפדפן, וחלק מקריאות הקבצים שלו חתוכות). הסתמך על בדיקת הריצה שלך.

## שלב 1 — לזהות מי חוסם (מכריע, 1 דקה)
`chrome://inspect` על המכשיר (או DevTools במצב מכשיר), במצב משחק רגיל. הרץ בקונסול:
```js
function who(el){const r=el.getBoundingClientRect();const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const top=document.elementFromPoint(cx,cy);
  console.log(el.id||el.className, '=> topElement:', top?.id||top?.className, '| same?', top===el||el.contains(top));}
who(document.getElementById('fortune-wheel-btn'));
const slider=document.querySelector('input[type=range]'); if(slider) who(slider);
```
- אם `topElement` **שונה** מהכפתור ולא מוכל בו → זהו האלמנט שחוסם. רשום את ה‑id/class שלו — זה מקור הבעיה. בדוק אותו: הוא כנראה `position:fixed/absolute` מעל ההדר עם `pointer-events:auto` וללא צורך (glow/הילה/באנר/מודאל שלא נסגר). התיקון: `pointer-events:none` עליו (אם דקורטיבי) או תיקון ה‑z-index/מיקום.

## שלב 2 — אם `topElement` הוא הכפתור עצמו (לא מכוסה)
אז הבעיה היא edge-to-edge: ההדר יושב מתחת לסטטוס בר והמערכת חוטפת את המגע.
- ודא שבזמן ריצה `StatusBar.setOverlaysWebView({overlay:false})` באמת נכנס (app.js) — **ושה‑`capacitor.config.json` תואם** (`overlaysWebView:false`). כרגע יש חוסר התאמה אפשרי: הקונפיג הוגדר overlay בזמן שהקוד קורא false → תקן שיהיו זהים (שניהם `false`).
- ודא של‑`header`/שורת הכפתורים העליונה יש `padding-top: calc(... + env(safe-area-inset-top))`.

## שלב 3 — ה‑slider (גרירה)
אם ה‑slider לא נגרר אבל לא מכוסה (שלב 1 החזיר אותו עצמו):
- ודא `touch-action: none` (או `pan-x`) על `input[type=range]` הרלוונטי — בלי זה, הדפדפן עלול לפרש את הגרירה כגלילה ולבטל אותה.
- ודא שאין אב עם `touch-action: manipulation`/`pan-y` שחוסם את הגרירה האופקית.

## שלב 4 — אימות
על מכשיר: כפתור גלגל המזל פותח את המודאל, כל כפתורי ההדר מגיבים, וה‑slider נגרר חלק. חזור על שלב 1 עד ש‑`same? true` לכל אלמנט.

## אזהרה
שנה `scss/*` + `npm run build` (אל תיגע ב‑`style.css`/`www/`/`app.bundle.js` ידנית). בדוק תמיד עם `who()` אחרי כל שינוי.
