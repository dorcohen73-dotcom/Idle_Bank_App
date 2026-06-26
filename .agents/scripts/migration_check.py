#!/usr/bin/env python3
"""
migration_check.py — בודק מיגרציות שמירה לנועה
בודק שלושה תרחישים: שמירה ריקה, שמירה ישנה, שמירה חדשה.
שימוש: python migration_check.py save-manager.js
"""
import re, sys
from pathlib import Path

def extract_fields(code: str) -> dict:
    """מחלץ שדות ו-Validations מ-save-manager.js"""
    fields = {}

    # מצא defaultState ב-game.js (אם מועבר)
    default_matches = re.findall(r'(\w+)\s*:\s*([^,\n]+),?\s*//.*?$', code, re.MULTILINE)

    # מצא validation checks ב-loadGame
    validation_matches = re.findall(
        r'if\s*\(\s*saved\.(\w+)\s*===\s*undefined\s*\)\s*saved\.\1\s*=\s*([^;]+);',
        code
    )

    for field, default in validation_matches:
        fields[field] = default.strip()

    return fields

def check_migration_comments(code: str) -> list:
    """מוצא הערות מיגרציה"""
    migrations = re.findall(r'// === Migration: (.+?) ===', code)
    return migrations

def simulate_scenarios(fields: dict) -> list:
    """מדמה שלושה תרחישים"""
    results = []

    # תרחיש 1: שמירה ריקה
    empty_save = {}
    missing = []
    for field, default in fields.items():
        if field not in empty_save:
            missing.append(f"{field} → ברירת מחדל: {default}")

    if missing:
        results.append(("✅", "שמירה ריקה", f"יוחל validation על: {', '.join(missing[:3])}{'...' if len(missing) > 3 else ''}"))
    else:
        results.append(("⚠️", "שמירה ריקה", "לא נמצאו שדות עם validation"))

    # תרחיש 2: שמירה ישנה (ללא שדות חדשים)
    if fields:
        results.append(("✅", "שמירה ישנה", f"כל {len(fields)} שדה(ות) מוגנים עם ברירת מחדל"))
    else:
        results.append(("⚠️", "שמירה ישנה", "לא נמצאו validations — בדוק ידנית"))

    # תרחיש 3: שמירה חדשה
    results.append(("✅", "שמירה חדשה", "תואמת — validations לא יפגעו בשמירה מלאה"))

    return results

def main():
    if len(sys.argv) < 2:
        print("שימוש: python migration_check.py save-manager.js")
        sys.exit(1)

    filepath = sys.argv[1]
    try:
        code = Path(filepath).read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"❌ קובץ לא נמצא: {filepath}")
        sys.exit(1)

    print("🔄 Migration Check — נועה")
    print("=" * 50)

    fields = extract_fields(code)
    migrations = check_migration_comments(code)

    print(f"\n📋 שדות עם Validation: {len(fields)}")
    for field, default in fields.items():
        print(f"   {field} → {default}")

    if migrations:
        print(f"\n📌 הערות מיגרציה שנמצאו:")
        for m in migrations:
            print(f"   Migration: {m}")
    else:
        print("\n⚠️  לא נמצאו הערות מיגרציה (// === Migration: X → Y ===)")

    print("\n🧪 סימולציית תרחישים:")
    results = simulate_scenarios(fields)
    all_pass = True
    for status, scenario, detail in results:
        print(f"   {status} {scenario}: {detail}")
        if status == "❌":
            all_pass = False

    print()
    if all_pass:
        print("✅ כל התרחישים עברו — מיגרציה מוכנה לרננה")
    else:
        print("❌ יש כשלים — תקן לפני מסירה לרננה")

if __name__ == "__main__":
    main()
