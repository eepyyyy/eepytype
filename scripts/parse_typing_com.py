import urllib.request
import re
import json

req = urllib.request.Request(
    'https://www.typing.com/bootstrap/typing/en/bootstrap.742.js',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
with urllib.request.urlopen(req) as resp:
    content = resp.read().decode('utf-8')

assignments = re.findall(r"window\.bootstrapGlobals\['([^']+)'\]\s*=\s*(.+?);(?=\n\s*window\.bootstrapGlobals|\n\s*function|\Z)", content, re.DOTALL)

data = {}
for key, val in assignments:
    try:
        data[key] = json.loads(val)
    except Exception:
        pass

units = data['units']
lessons_raw = data['lessons']
lessons_fields = data['lessons_fields']
screens_raw = data['all_screens']
screens_fields = data['all_screens_fields']

print("Lessons fields:", lessons_fields)
print("Screens fields:", screens_fields)

# Map raw arrays to dicts
lessons = []
for row in lessons_raw:
    lessons.append(dict(zip(lessons_fields, row)))

screens = []
for row in screens_raw:
    screens.append(dict(zip(screens_fields, row)))

print(f"\nParsed {len(units)} Units, {len(lessons)} Lessons, {len(screens)} Screens/Drills!")

# Show sample of lessons per unit
for u in units:
    u_lessons = [l for l in lessons if l['unit_id'] == u['unit_id']]
    print(f"\n=== Unit {u['unit_id']}: {u['name']} ({len(u_lessons)} lessons) ===")
    for l in u_lessons[:5]:
        print(f"  - Lesson: {l.get('name')} (id: {l.get('lesson_id')}, target keys: {l.get('keys')})")
    if len(u_lessons) > 5:
        print(f"  ... + {len(u_lessons)-5} more lessons")
