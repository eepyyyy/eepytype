import json
from pathlib import Path

practice_path = Path("frontend/static/practice/practice_texts.json")
with open(practice_path, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Loaded {len(data)} items from {practice_path}")

fixed_data = []
for item in data:
    text = item.get("text", "")
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    total_word_len = sum(len(w) for w in words)
    avg_word_length = round(total_word_len / max(1, word_count), 1)

    unit_val = item.get("unit")
    if isinstance(unit_val, int):
        unit_str = f"Lesson {unit_val}"
    elif unit_val:
        unit_str = str(unit_val)
    else:
        unit_str = ""

    author = item.get("author") or "Ruth Ben'Ary" if item.get("category") == "training" else item.get("author", "Unknown")
    source = item.get("source") or "Touch Typing in 10 Lessons" if item.get("category") == "training" else item.get("source", "Practice Library")

    fixed_data.append({
        "id": item.get("id", ""),
        "title": item.get("title", ""),
        "category": item.get("category", "training"),
        "unit": unit_str,
        "difficulty": item.get("difficulty", "medium"),
        "wordCount": item.get("wordCount") or word_count,
        "charCount": item.get("charCount") or char_count,
        "avgWordLength": item.get("avgWordLength") or avg_word_length,
        "author": author,
        "source": source,
        "text": text,
        "tags": item.get("tags", [])
    })

with open(practice_path, "w", encoding="utf-8") as f:
    json.dump(fixed_data, f, indent=2, ensure_ascii=False)

print(f"Successfully fixed all {len(fixed_data)} items in {practice_path}!")
