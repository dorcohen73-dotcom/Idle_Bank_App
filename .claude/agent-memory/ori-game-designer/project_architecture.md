---
name: project-architecture
description: ארכיטקטורה מלאה של Idle Bank — ישויות, מנהלים, prestige, אירועים
metadata:
  type: project
---

## ישויות מרכזיות
- tellers: עד 4+branch כספרים, unlock costs exponential, capacity 150*1.35^(lvl-1), speed 5.0*0.93^(lvl-1)
- guards: 3 guards, capacity 250*1.4^(lvl-1), speed 8.0*0.92^(lvl-1)
- vault: 1 vault, capacity 1500*1.45^(lvl-1)
- queue: max level 6, base 5 slots + 5 per level + 5 per branch

## מנהלים (6 קיימים)
customer, operations, finance, service, vip, marketing — כל אחד עד רמה 5, עם skill slot נוסף

## מחלקות (5 קיימות)
id=0 קופה, id=1 הלוואות, id=2 VIP, id=3 מניות/קריפטו, id=4 הלבנת הון
baseReward: 10, 60, 450, 3500, 30000

## Prestige
- נוסחה: rawGain = 10 * sqrt(lifetimeCash / 30000)
- cap per event: 1000 shares (לפני כפל 3x = cap ב-1000 אחרי)
- total shares cap: 3000
- multiplier: 1 + shares * (0.05 + shareEfficiency*0.01)

## Events קיימים (5)
crowd, security, rescue, rush_hours, investor — כל אחד עם 2-3 אפשרויות

## Fortune Wheel (7 פרסים)
cash_small(35%), cash_big(20%), boost_2x(20%), gold_1(12%), gold_2(6%), shares_1(5%), shares_3(2%)

## Gold Upgrades (9 סוגים)
startingCash(max4), guardSpeed, premiumYield, shareEfficiency(max4), offlineEarnings, tellerCapacityBoost, vaultCapacityBoost, eventBonus, managerDiscount(max4)

## branches (4)
Citibank x1 ($30K), HSBC x5 ($1M), JPMorgan x30 ($50M), Goldman Sachs x200 ($1B)
