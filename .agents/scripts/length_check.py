#!/usr/bin/env python3
"""
length_check.py — בודק מגבלות אורך תרגומים לעמית
שימוש: python length_check.py
       הכנס Keys ותרגומים כשתתבקש, או העבר JSON.
"""
import json, sys

LIMITS = {
    "btn":         25,   # כפתורים
    "button":      25,
    "title":       50,   # כותרות אירועים
    "event_title": 50,
    "desc":        120,  # תיאורי אירועים
    "event_desc":  120,
    "bio":         200,  # ביוגרפיות מנהלים
    "manager_bio": 200,
}

LANGS = ["he", "en", "es", "ru"]
LANG_NAMES = {"he": "עברית", "en": "אנגלית", "es": "ספרדית", "ru": "רוסית"}

def get_limit(key: str) -> int | None:
    for kw, lim in LIMITS.items():
        if kw in key.lower():
            return lim
    return None

def check_entry(key: str, lang: str, text: str) -> str | None:
    limit = get_limit(key)
    if limit is None:
        return None
    length = len(text)
    if length > limit:
        return f"⚠️  [{LANG_NAMES.get(lang, lang)}] {key}: {length}/{limit} תווים"
    return None

def check_all(data: dict) -> list[str]:
    """data = {lang: {key: text}}"""
    warnings = []
    for lang, keys in data.items():
        for key, text in keys.items():
            w = check_entry(key, lang, text)
            if w:
                warnings.append(w)
    return warnings

def interactive_mode():
    print("🌐 Length Checker — עמית")
    print("הכנס תרגומים לבדיקה. Enter ריק = סיים.\n")

    data = {lang: {} for lang in LANGS}
    while True:
        key = input("Key name (או Enter לסיום): ").strip()
        if not key:
            break
        for lang in LANGS:
            text = input(f"  {LANG_NAMES[lang]}: ").strip()
            if text:
                data[lang][key] = text

    warnings = check_all(data)
    print()
    if warnings:
        print("⚠️  נמצאו חריגות:")
        for w in warnings:
            print(f"   {w}")
        print("\n→ החזר לגיל לקצר את הטקסט העברי המקורי.")
    else:
        print("✅ כל התרגומים בגבולות — מוכן לרננה.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # JSON mode: python length_check.py translations.json
        with open(sys.argv[1], encoding="utf-8") as f:
            data = json.load(f)
        warnings = check_all(data)
        if warnings:
            for w in warnings:
                print(w)
        else:
            print("✅ כל התרגומים בגבולות")
    else:
        interactive_mode()
