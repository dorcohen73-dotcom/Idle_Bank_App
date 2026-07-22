# MOBILE_BOTTOMNAV_FIX_SPEC — סרגל הניווט לא מופיע בטלפון

## תסמין
בטלפון לא מופיע שום סרגל טאבים; במחשב הפס העליון (`.tabs-nav`) מופיע כרגיל.

## רקע (חשוב — לא באג במקום שחושבים)
במובייל **בכוונה** מוסתר `.tabs-nav` (`scss/_dashboard-glass.scss`: `@media (max-width:950px){ .tabs-nav{display:none} }`, הערה: "מוחלפים ע\"י bottom nav"). המחליף הוא `#bottom-nav` — `<nav class="bottom-nav" id="bottom-nav">` ב‑`index.html:706`, 5 כפתורים (עמדות/מנהלים/מחלקות/משימות/סניפים).

בבדיקת ה‑CSS המקומפל: הכלל `.bottom-nav{display:none}` (דסקטופ) נמצא **לפני** `@media (max-width:950px),(max-height:500px){ .bottom-nav{display:flex;position:fixed;bottom:calc(15px+env(safe-area-inset-bottom))...} }` — כך שבמובייל ה‑`display:flex` גובר והפס **אמור להופיע**. גם אין ancestor עם `transform/filter/contain` ששובר את ה‑`position:fixed`.

**מסקנה:** לפי המקור הנוכחי אין באג CSS שמסביר את ההיעלמות. לכן האבחון חייב לרוץ על המכשיר.

---

## שלב 1 — לשלול קאש ישן (הכי סביר, עשה קודם)
זה ה‑gotcha מס' 1 ב‑CLAUDE.md: בילד לא מגיע לקליינט עד ש‑`?v=` וה‑SW cache עולים. "עובד בדפדפן במחשב (טעינה טרייה) אבל לא באפליקציה המותקנת (assets בקאש)" הוא בדיוק החתימה של קאש.
1. העלה את `?v=` בכל התגיות ב‑`index.html` (script/link) וודא `data-version` עלה.
2. `npm run build` (מחדש את שם ה‑SW cache) → `npm run cap-build && npx cap sync`.
3. במכשיר: הסר והתקן מחדש את האפליקציה (או נקה app data) — כדי לוודא שה‑WebView לא מגיש assets ישנים.
4. בדוק שוב אם הפס הופיע.

## שלב 2 — Remote debugging (הבדיקה המכריעה)
חבר את הטלפון, פתח במחשב `chrome://inspect` → inspect ל‑WebView של האפליקציה. ב‑Console הרץ:
```js
const n = document.getElementById('bottom-nav');
console.log('exists:', !!n);
console.log('display:', n && getComputedStyle(n).display);      // מצופה: "flex"
console.log('innerWidth:', window.innerWidth);                   // מצופה: <= 950
console.log('rect:', n && JSON.stringify(n.getBoundingClientRect()));
console.log('coveredBy:', document.elementFromPoint(window.innerWidth/2, window.innerHeight - 40));
```
פענוח:
- `exists:false` → הפס לא ב‑DOM כלל (בעיית build/HTML) → שלב 1 או ודא ש‑`index.html` בטלפון מכיל את ה‑`<nav>`.
- `display:"none"` → יש כלל שמנצח את המובייל, או שה‑media query לא נתפס.
- `innerWidth > 950` → **הסיבה**: ה‑WebView מדווח רוחב גדול מ‑950 (viewport/DPI/UA לא נכון), אז `@media (max-width:950px)` לא מתקיים והפס נשאר `display:none`. תיקון: ראה שלב 3א.
- `rect` עם `top` גדול מגובה המסך או `height:0` → הפס קיים אבל דחוף מחוץ למסך → שלב 3ב.
- `coveredBy` מחזיר אלמנט אחר (לא כפתור הנאב) → overlay חוסם מעליו → z-index/pointer-events.

## שלב 3 — תיקון לפי הממצא
**3א — ה‑media query לא נתפס (innerWidth > 950):**
- ודא ש‑`index.html` מכיל `<meta name="viewport" content="width=device-width, initial-scale=1.0, ...">` (קיים — אבל ודא שלא נדרס).
- כחגורת ביטחון, הרחב את סף המובייל או הפוך את הצגת ה‑bottom-nav ללא תלויה רק ב‑`max-width` — למשל הצג אותה גם ב‑pointer גס:
  `@media (max-width: 950px), (pointer: coarse) { .bottom-nav{ display:flex; ... } }`

**3ב — הפס מחוץ למסך (קשור ל‑edge-to-edge שהוספנו):**
- `bottom: calc(15px + env(safe-area-inset-bottom))` — אם משום מה ה‑inset ענק/שגוי, הפס עף למעלה. הצמד תקרה: `bottom: max(15px, env(safe-area-inset-bottom, 15px))` או פשוט `bottom: calc(12px + env(safe-area-inset-bottom, 0px))` ובדוק.
- ודא של‑ancestor של `#bottom-nav` אין `transform`/`filter`/`will-change`/`contain` שנוסף לאחרונה (שובר `position:fixed`).

**3ג — overlay חוסם:**
- ודא שמסך הפתיחה נסגר (הרי שינינו ל‑`launchAutoHide:false` — אם ה‑`hide()` לא רץ, overlay נשאר). ודא ש‑DOM `#splash-screen` מקבל `display:none` אחרי טעינה.
- כל אלמנט דקורטיבי מלא‑מסך חייב `pointer-events:none` ו‑z-index נמוך מ‑1000.

## שלב 4 — אימות
בנה, `cap sync`, התקן מחדש, ובדוק: הפס התחתון מופיע בפורטרייט, 5 הכפתורים לחיצים ומחליפים טאבים, ולא נחתך ע"י סרגל הניווט של המערכת. חזור על שלב 2 עד ש‑`display:"flex"`, `innerWidth<=950`, ו‑`coveredBy` מחזיר את כפתור הנאב.

## אזהרה
אין לערוך ידנית `app.bundle.js`, `style.css`, `www/`. CSS דרך `scss/*`+`npm run css`; קוד דרך `ui/*`/`app.js`+`npm run bundle`. חובה `?v=` + `npm run build` אחרי כל שינוי כדי שהטלפון יקבל אותו.
