---
name: missions-reward-architecture
description: מבנה פרסי missions — cash (מספר) לעומת shares (אובייקט). שינויים נדרשים בכל layer.
metadata:
  type: project
---

מאז יוני 2026 — פרסי missions יכולים להיות שני סוגים:
- **cash** (legacy): `m.reward` הוא מספר. `claimMissionReward` מוסיף ל-`state.cash` ו-`state.lifetimeCash`.
- **shares/gold** (חדש): `m.reward` הוא אובייקט `{ type: 'shares'|'gold', amount: N }`. `claimMissionReward` מוסיף ל-`state.shares`.

**Why:** 7 missions חדשות נוספו (יוני 2026) שחלקן פורסות shares כפרס (vip_marathon, manager_hire, all_managers, teller_max, guard_trips).

**How to apply:**
- `claimMissionReward` מחזיר `{ type, amount }` — לא מספר. כל UI שקוראת לו חייבת לבדוק `collected.type !== 'none'` ולא `collected > 0`.
- `save-manager.js` healing של `m.reward` חייב לבדוק אם הוא אובייקט לפני שמחליף ב-100.
- `ui-tabs.js` — badge פרס ואנימציה מטפלים בשני הסוגים.

**שדות tracking חדשים ב-state:**
- `state.guardTripsTotal` — מספר נסיעות guard שהושלמו (depositing -> idle עם loadedCash=0)
- `state.boost2xUsedEver` — האם boost2x הופעל אי פעם
- `m.consecutiveVip` — על מיסיון vip_marathon: ספירה רצופה של VIP שנשרתו
- `m.boostCashAccumulator` — על מיסיון boost_run: סכום שהורווח בזמן boost
