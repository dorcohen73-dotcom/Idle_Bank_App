#!/usr/bin/env python3
"""
raf_audit.py — סורק Game Loop לרפאל
מחפש בעיות ביצועים בתוך requestAnimationFrame.
שימוש: python raf_audit.py ui-events.js game.js [קבצים נוספים...]
"""
import re, sys
from pathlib import Path

# דפוסים בעייתיים + חומרה + הסבר
PATTERNS = [
    (r'\bnew\s+\w+\s*\(',        "🔴", "Object Creation — יוצר לחץ על Garbage Collector"),
    (r'\[\s*\]',                  "🔴", "Array literal [] — Object Creation"),
    (r'\{\s*\w+\s*:',             "🔴", "Object literal {} — Object Creation"),
    (r'document\.(querySelector|getElementById|getElementsBy\w+)', "🔴", "DOM Query — איטי מאוד ב-RAF"),
    (r'for\s*\(.*offline',        "🔴", "Offline Loop — O(N), crash פוטנציאלי"),
    (r'console\.(log|warn|error)','🟡', "Console statement — יש למחוק לפני production"),
    (r'setInterval\s*\(',         "🟡", "setInterval — ודא שיש clearInterval בהרס"),
    (r'setTimeout\s*\(',          "🟡", "setTimeout — ודא שיש clearTimeout בהרס"),
    (r'addEventListener\s*\(',    "🟡", "addEventListener — ודא שיש removeEventListener"),
]

def audit_file(path: str) -> list[dict]:
    try:
        code = Path(path).read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"❌ קובץ לא נמצא: {path}")
        return []

    lines = code.splitlines()
    in_raf_block = False
    brace_depth = 0
    raf_start = -1
    issues = []

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        # זיהוי כניסה ל-RAF
        if "requestAnimationFrame" in stripped or re.search(r'function\s+gameLoop', stripped):
            in_raf_block = True
            raf_start = i
            brace_depth = 0

        if in_raf_block:
            brace_depth += stripped.count('{') - stripped.count('}')
            if brace_depth < 0:
                in_raf_block = False
                continue

            for pattern, severity, explanation in PATTERNS:
                if re.search(pattern, stripped):
                    issues.append({
                        "severity": severity,
                        "file": path,
                        "line": i,
                        "code": stripped[:70],
                        "explanation": explanation
                    })

    return issues

def print_report(all_issues: list[dict]):
    if not all_issues:
        print("✅ לא נמצאו בעיות ב-Game Loop")
        return

    red   = [i for i in all_issues if i["severity"] == "🔴"]
    yellow= [i for i in all_issues if i["severity"] == "🟡"]

    if red:
        print(f"\n🔴 קריטי — חוסם Merge ({len(red)} ממצאים):")
        for iss in red:
            print(f"  {iss['file']}:{iss['line']} — {iss['explanation']}")
            print(f"    קוד: {iss['code']}")

    if yellow:
        print(f"\n🟡 אזהרה ({len(yellow)} ממצאים):")
        for iss in yellow:
            print(f"  {iss['file']}:{iss['line']} — {iss['explanation']}")

    verdict = "❌ נדרש תיקון לפני Merge" if red else "⚠️  אזהרות בלבד — שקול לטפל"
    print(f"\n🔚 מסקנה: {verdict}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("שימוש: python raf_audit.py ui-events.js [קבצים נוספים...]")
        sys.exit(1)

    print("⚡ RAF Audit — רפאל")
    print("=" * 50)

    all_issues = []
    for filepath in sys.argv[1:]:
        issues = audit_file(filepath)
        all_issues.extend(issues)
        if not issues:
            print(f"✅ {filepath} — נקי")

    print_report(all_issues)
