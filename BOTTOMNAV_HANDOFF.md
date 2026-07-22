# BOTTOMNAV_HANDOFF — לְ‑Antigravity: הפס התחתון לא נראה במשחק

## עובדות מאומתות (דרך git, אמין)
בקומיט `560fe78` (v1.0.139), **כל הקבצים כבר מכילים את התיקון הנכון**:
- `scss/_dashboard-glass.scss` → `.bottom-nav` בתוך `@media (max-width:950px),(max-height:500px),(pointer:coarse)` עם `display:flex; position:fixed; bottom:max(15px, env(safe-area-inset-bottom,15px)); z-index:1000`.
- `style.css` (מקומפל) → מכיל את אותו כלל fixed + `pointer:coarse`.
- `www/style.css` (מה שאפליקציית האנדרואיד מגישה) → מכיל אותו דבר.

מסקנה: **הבעיה אינה בקוד המקור.** הקוד תקין.

> הערה: קלוד לא יכול לאמת/לבנות מהצד שלו — סביבת הקריאה שלו מציגה כמה מקבצי הפרויקט חתוכים (ארטיפקט מאונט). לכן ההנחיות כאן מסתמכות על בדיקת ריצה אמיתית שרק אתה יכול לעשות. אל תבנה על קריאות הקבצים של קלוד; בנה על מה שאתה רואה בדיסק ובדפדפן.

## התסמין
הפס נראה כשמודאל פתוח (דף קצר — צילום מסך בחירת שפה) אך **לא במהלך משחק** (דף ארוך). זו החתימה הקלאסית של `position:fixed` שלא נכנס לתוקף בפועל, כלומר: או ש‑CSS ישן מוגש (קאש), או override בזמן ריצה. (ייתכן גם שהוא כן עובד וזה ארטיפקט של צילום גלילה — לכן שלב 1 חשוב.)

## שלב 1 — בדיקת ריצה מכריעה
פתח את הגרסה שנכשלת (מקומי ו/או המכשיר עם `chrome://inspect`), **במצב משחק רגיל (לא מודאל)**, והרץ בקונסול:
```js
const n=document.getElementById('bottom-nav');const s=getComputedStyle(n);const r=n.getBoundingClientRect();
console.log('position:',s.position,'display:',s.display,'zIndex:',s.zIndex);
console.log('rectTop:',Math.round(r.top),'rectBottom:',Math.round(r.bottom),'winH:',innerHeight);
console.log('coveredBy:', document.elementFromPoint(r.left+r.width/2, r.top+r.height/2)?.id || document.elementFromPoint(r.left+r.width/2, r.top+r.height/2)?.className);
```
פענוח:
- `position: fixed` ו‑`rectTop ≈ winH-85` → **הוא שם ועובד** — ההיעלמות הייתה ארטיפקט צילום. אמת בעין על המכשיר וסגור.
- `position` ≠ `fixed` (למשל `static`/`relative`) → הכלל שמנצח אינו כלל ה‑fixed → **CSS מוגש ישן**. עבור לשלב 2.
- `position: fixed` אבל `rectTop > winH` → הוא מתחת למסך → בדוק אב עם `transform/filter/contain` שנוסף, או ערך `bottom` חריג.
- `coveredBy` מחזיר אלמנט אחר → overlay חוסם (חשוד: `#splash-screen` שלא נסגר בגלל `launchAutoHide:false`, או `#floating-container`). ודא `pointer-events:none`/`display:none` אחרי טעינה.

## שלב 2 — אם ה‑CSS המוגש ישן (הכי סביר)
המקור תקין, אז צריך לוודא שמה שנטען בפועל הוא המקור המעודכן:
1. `npm run build` — מקמפל מחדש `style.css` **וגם** מרענן את `CACHE_NAME` ב‑`sw.js`.
2. `npm run cap-build && npx cap sync` — מרענן `www/`.
3. העלה גרסה (1.0.140) ב‑`package.json`, `index.html` (`data-version`), `build.gradle`.
4. מקומי: hard reload `Ctrl+Shift+R` (או פתח באינקוגניטו). מכשיר: **הסר והתקן מחדש** (לא עדכון) כדי לרוקן את ה‑WebView cache.
5. הרץ שוב את בדיקת שלב 1 עד `position:fixed` + `rectTop≈winH-85`.

## שלב 3 — אימות סופי
במצב משחק רגיל, על מכשיר: הפס קבוע בתחתית תמיד, לא נעלם בגלילה, 5 הכפתורים לחיצים ומחליפים טאבים, ולא נחתך ע"י סרגל המערכת.

## אזהרה
אין לערוך ידנית `style.css`/`www/`/`app.bundle.js` — מיוצרים. שנה `scss/*` והרץ `npm run build`.
```
```
