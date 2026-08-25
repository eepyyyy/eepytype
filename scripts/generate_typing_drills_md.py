#!/usr/bin/env python3
"""
Scrapes and generates comprehensive typing curriculum markdown from typing.com.
"""

import json
import os
import re
import urllib.request

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUT_MD_PATH = os.path.join(ROOT_DIR, "TYPING_COM_DRILLS.md")

req = urllib.request.Request(
    'https://www.typing.com/bootstrap/typing/en/bootstrap.742.js',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
with urllib.request.urlopen(req) as resp:
    content = resp.read().decode('utf-8')

assignments = re.findall(
    r"window\.bootstrapGlobals\['([^']+)'\]\s*=\s*(.+?);(?=\n\s*window\.bootstrapGlobals|\n\s*function|\Z)",
    content,
    re.DOTALL
)

data = {}
for key, val in assignments:
    try:
        data[key] = json.loads(val)
    except Exception:
        pass

units = data.get('units', [])
lessons_raw = data.get('lessons', [])
lessons_fields = data.get('lessons_fields', [])
screens_raw = data.get('all_screens', [])
screens_fields = data.get('all_screens_fields', [])

lessons = [dict(zip(lessons_fields, row)) for row in lessons_raw]
screens = [dict(zip(screens_fields, row)) for row in screens_raw]

# Group screens by lesson_id
screens_by_lesson = {}
for s in screens:
    screens_by_lesson.setdefault(s['lesson_id'], []).append(s)

lines = [
    "# Typing.com Complete Curriculum & Drill Catalog",
    "",
    "A comprehensive breakdown of touch-typing fundamentals, pedagogy, and all **10 Units, 106 Lessons, and 1,533 Interactive Drills** sourced from [typing.com](https://www.typing.com/).",
    "",
    "---",
    "",
    "## 1. Touch Typing Fundamentals & Basic Drills",
    "",
    "Touch typing relies on muscle memory rather than visual search. The typing.com curriculum follows a 5-tier pedagogical progression:",
    "",
    "### A. The Home Row Anchor (Foundation)",
    "- **Anchor Position**: Left hand rests on `A S D F` (Index finger on `F` with tactile bump). Right hand rests on `J K L ;` (Index finger on `J` with tactile bump).",
    "- **Thumb Role**: Right or Left thumb rests gently on the `Spacebar`.",
    "- **Core Principle**: After every keystroke to any other row, fingers immediately return to home row positions.",
    "",
    "### B. Finger Reach Zones (QWERTY Standard)",
    "| Finger | Left Hand Keys | Right Hand Keys |",
    "| :--- | :--- | :--- |",
    "| **Index** | `F`, `R`, `V`, `T`, `G`, `B`, `4`, `5` | `J`, `U`, `M`, `Y`, `H`, `N`, `6`, `7` |",
    "| **Middle** | `D`, `E`, `C`, `3` | `K`, `I`, `,`, `8` |",
    "| **Ring** | `S`, `W`, `X`, `2` | `L`, `O`, `.`, `9` |",
    "| **Pinky** | `A`, `Q`, `Z`, `1`, `Tab`, `Caps`, `Shift`, `Ctrl` | `;`, `P`, `/`, `0`, `-`, `=`, `Enter`, `Shift` |",
    "| **Thumbs** | `Spacebar` | `Spacebar` |",
    "",
    "### C. Drill Types in the Curriculum",
    "1. **Key Introduction (Isolated Reaches)**: Teaches 2-3 new keys with single finger reaches (`j j j f f f jf jf`).",
    "2. **Bigram & Trigram Drills**: Pairs new keys with home row keys (`jug`, `fur`, `kid`).",
    "3. **Word Drills**: Reinforces common high-frequency English vocabulary using only learned keys.",
    "4. **Sentence & Punctuation Drills**: Capital letters using opposite-hand Shift keys + full stops, commas, question marks.",
    "5. **Paragraph & Speed Endurance**: Timed continuous prose measuring WPM and minimum accuracy thresholds (typically 90-95%).",
    "",
    "---",
    "",
    "## 2. Curriculum Overview & Unit Summary",
    "",
    f"Total Units: **{len(units)}** | Total Lessons: **{len(lessons)}** | Total Interactive Drills/Screens: **{len(screens)}**",
    "",
    "| Unit ID | Tier / Category | Description | Lessons Count | Drills Count |",
    "| :---: | :--- | :--- | :---: | :---: |"
]

for u in sorted(units, key=lambda x: x.get('display_order', 99)):
    u_id = u['unit_id']
    u_lessons = [l for l in lessons if l['unit_id'] == u_id]
    u_screens_count = sum(len(screens_by_lesson.get(l['lesson_id'], [])) for l in u_lessons)
    desc = u.get('description') or "Custom exercises"
    lines.append(f"| **{u_id}** | **{u['name']}** | {desc} | {len(u_lessons)} | {u_screens_count} |")

lines.append("")
lines.append("---")
lines.append("")
lines.append("## 3. Detailed Lesson & Drill Breakdown")
lines.append("")

for u in sorted(units, key=lambda x: x.get('display_order', 99)):
    u_id = u['unit_id']
    u_lessons = [l for l in lessons if l['unit_id'] == u_id]
    if not u_lessons:
        continue

    lines.append(f"### Unit {u_id}: {u['name']}")
    if u.get('description'):
        lines.append(f"> *{u['description']}*")
    lines.append("")
    lines.append("| Lesson ID | Lesson Title | Type | Min Accuracy | Total Words | Drills / Screens |")
    lines.append("| :---: | :--- | :---: | :---: | :---: | :--- |")

    for l in sorted(u_lessons, key=lambda x: x.get('display_order', 99)):
        l_id = l['lesson_id']
        name = l.get('name', 'Untitled')
        l_type = l.get('type', 'standard')
        min_acc = f"{l.get('min_accuracy')}%" if l.get('min_accuracy') else "N/A"
        words = l.get('total_words') or "-"
        l_screens = screens_by_lesson.get(l_id, [])
        screens_preview = ", ".join(s.get('title', 'Screen') for s in l_screens[:4])
        if len(l_screens) > 4:
            screens_preview += f", +{len(l_screens)-4} more"
        if not screens_preview:
            screens_preview = f"{len(l_screens)} drills"
        lines.append(f"| `{l_id}` | **{name}** | {l_type} | {min_acc} | {words} | {screens_preview} |")

    lines.append("")

with open(OUTPUT_MD_PATH, 'w', encoding='utf-8') as f:
    f.write("\n".join(lines))

print(f"Successfully generated {OUTPUT_MD_PATH} with {len(units)} units, {len(lessons)} lessons, {len(screens)} drills.")
