# מדריך לוקליזציה — Idle Bank Empire

## מבנה `locales.js`

```javascript
const translations = {
    he: { /* עברית — שפת מקור */ },
    en: { /* אנגלית */ },
    es: { /* ספרדית */ },
    ru: { /* רוסית */ }
};
// + Object.assign(translations.he, { ... }) לתכונות מורחבות
```

---

## שפות וכיוון טקסט

| שפה | קוד | כיוון | הערות |
|-----|-----|-------|-------|
| עברית | `he` | RTL | שפת מקור, בדוק תמיד ראשון |
| אנגלית | `en` | LTR | שפת ייחוס לתרגום |
| ספרדית | `es` | LTR | Latin American Spanish |
| רוסית | `ru` | LTR | — |

RTL מופעל על `<html dir="rtl">` רק לעברית. **אל תשבור את זה.**

---

## מיפוי מפתחות נפוצים

### מנהלים
```javascript
translations.he.managers.names.{key}   // שם המנהל
translations.he.managers.descs.{key}   // תיאור קצר
```
**מפתחות קיימים:** customer, finance, operations, service, vip, marketing, logistics, risk, tech, compliance

### אירועים
```javascript
translations.he.events.{type}.title    // כותרת
translations.he.events.{type}.desc     // תיאור
translations.he.events.{type}.optA(cost)  // אפשרות A (פונקציה)
translations.he.events.{type}.optADesc    // תת-תיאור A
translations.he.events.{type}.optB        // אפשרות B
translations.he.events.{type}.optBDesc
translations.he.events.{type}.optC        // אפשרות C (פרסומת)
translations.he.events.{type}.optCDesc
```
**סוגים קיימים:** crowd, security, rescue, rush_hours, investor

### שדרוגים זהב
```javascript
translations.he.goldUpgrades.{key}.title
translations.he.goldUpgrades.{key}.desc   // פונקציה: (lvl) => string
```

---

## כללי תרגום

1. **עברית קודם תמיד** — כתוב עברית ואז תרגם
2. **פונקציות → פונקציות** — אם `he` משתמש ב-`(cost) => ...`, כל שפה חייבת אותו חתימה
3. **אל תשנה מפתחות** — רק ערכים. שינוי מפתח שובר את כל הרינדור
4. **בדוק Object.assign** — חלק מהמפתחות ב-`translations.he` מוגדרים אחרי ה-object הראשי
5. **formatMoney** — מפתח קיים, השתמש בו. אל תכתוב "$" בהארד-קוד

---

## תבנית להוספת מנהל חדש

```javascript
// he
managers: { names: { new_mgr: "מנהל חדש" }, descs: { new_mgr: "+X% אפקט (לכל רמה)" } }

// en
managers: { names: { new_mgr: "New Manager" }, descs: { new_mgr: "+X% effect (per level)" } }

// es
managers: { names: { new_mgr: "Nuevo Gerente" }, descs: { new_mgr: "+X% efecto (por nivel)" } }

// ru
managers: { names: { new_mgr: "Новый менеджер" }, descs: { new_mgr: "+X% эффект (за уровень)" } }
```

---

## בדיקת שלמות — לאחר כל הוספה

הרץ בקונסול הדפדפן:
```javascript
const keys = Object.keys(translations.he.managers.names);
['en','es','ru'].forEach(lang => {
    keys.forEach(k => {
        if (!translations[lang].managers.names[k])
            console.warn(`Missing: ${lang}.managers.names.${k}`);
    });
});
```
