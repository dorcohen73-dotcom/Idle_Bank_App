#!/usr/bin/env python3
"""
balance_calc.py — כלי חישוב כלכלה לאורי
מחשב טבלת ערכים לפי נוסחת Idle Game סטנדרטית.
שימוש: python balance_calc.py
"""

def calculate_table(base_cost, factor, base_reward, reward_factor, levels=10):
    print(f"\n📐 טבלת ערכים")
    print(f"   נוסחת עלות:   Cost(n) = {base_cost:,} × {factor}^(n-1)")
    print(f"   נוסחת תגמול:  Reward(n) = {base_reward} × {reward_factor}^(n-1)")
    print()
    print(f"{'שלב':<6} {'עלות':>14} {'תגמול/שנ':>12} {'זמן החזר':>12} {'EPS%':>8}")
    print("─" * 56)

    for n in range(1, levels + 1):
        cost = base_cost * (factor ** (n - 1))
        reward = base_reward * (reward_factor ** (n - 1))
        payback = cost / reward if reward > 0 else float('inf')
        eps_pct = (reward / base_reward - 1) * 100

        cost_str = f"${cost:>13,.0f}"
        payback_str = f"{payback:>10.0f}s"
        print(f"{n:<6} {cost_str} {reward:>11.2f}/s {payback_str} {eps_pct:>7.0f}%")

    print()
    total_reward = sum(base_reward * (reward_factor ** (n - 1)) for n in range(1, levels + 1))
    print(f"✅ EPS כולל אחרי {levels} שלבים: {total_reward:.2f}/s")

def format_number(n):
    if n >= 1e12: return f"{n/1e12:.1f}T"
    if n >= 1e9:  return f"{n/1e9:.1f}B"
    if n >= 1e6:  return f"{n/1e6:.1f}M"
    if n >= 1e3:  return f"{n/1e3:.1f}K"
    return str(n)

if __name__ == "__main__":
    print("📐 Blueprint Calculator — אורי")
    print("=" * 40)

    try:
        base_cost   = float(input("BaseCost (עלות שלב 1):          "))
        factor      = float(input("Growth Factor (למשל 1.15):       "))
        base_reward = float(input("BaseReward/s (תגמול שלב 1):      "))
        r_factor    = float(input("Reward Factor (למשל 1.10):       "))
        levels      = int(input  ("כמה שלבים (Enter = 10):          ") or "10")
    except ValueError:
        print("❌ קלט לא תקין")
        exit(1)

    calculate_table(base_cost, factor, base_reward, r_factor, levels)

    # Progression check
    print("\n⚖️  בדיקת Progression")
    early_cost = base_cost
    early_reward = base_reward
    if early_reward > 0:
        payback_early = early_cost / early_reward
        print(f"   שחקן שלב 1 — זמן החזר: {payback_early:.0f}s ({payback_early/60:.1f} דקות)")
        if payback_early > 300:
            print("   ⚠️  Early Game איטי מדי — שקול להוריד BaseCost")
        else:
            print("   ✅ Early Game תקין")
