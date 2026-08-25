import json
import re
import pypdf

reader = pypdf.PdfReader('touchtypinginten00ruth_1.pdf')
pages_text = [page.extract_text() or '' for page in reader.pages]

# Define lesson boundaries
lesson_map = [
    {
        "lessonNumber": 0,
        "title": "Preliminary Instructions & Keyboard Position",
        "start_page": 5,
        "end_page": 11,
        "subtitle": "Typewriter anatomy, posture, home row seating & operation",
    },
    {
        "lessonNumber": 1,
        "title": "Basic Horizontal Combinations",
        "start_page": 12,
        "end_page": 16,
        "subtitle": "Home row foundations: a-s-d-f-g and ;-l-k-j-h, alternating & scrambled",
    },
    {
        "lessonNumber": 2,
        "title": "Basic Diagonal Combinations",
        "start_page": 17,
        "end_page": 23,
        "subtitle": "Diagonal reaches: aqaz, swsx, dedc, frfv, gtgb, ;p;/, lol., kik,, jujm, hyhn",
    },
    {
        "lessonNumber": 3,
        "title": "Typing the Alphabet",
        "start_page": 24,
        "end_page": 27,
        "subtitle": "Full A-Z coordination, alphabetic reaches, word families & endings",
    },
    {
        "lessonNumber": 4,
        "title": "Capital Letters, Punctuation, Abbreviations & Ailments",
        "start_page": 28,
        "end_page": 34,
        "subtitle": "Shift keys, periods, commas, colons, abbreviations & typing remedies",
    },
    {
        "lessonNumber": 5,
        "title": "Numerals, Punctuation and Special Characters",
        "start_page": 35,
        "end_page": 42,
        "subtitle": "Top row numbers 1-0, fractions, currency ($), symbols (%, &, *, #, +, -)",
    },
    {
        "lessonNumber": 6,
        "title": "Paragraph Practice and Alphabetic Sentences",
        "start_page": 43,
        "end_page": 45,
        "subtitle": "Pangrams, continuous prose, line return rhythm & steady cadence",
    },
    {
        "lessonNumber": 7,
        "title": "Skill and Speed Development (Part One)",
        "start_page": 46,
        "end_page": 49,
        "subtitle": "Rhythmic acceleration, 1-minute bursts, error elimination & metronome flow",
    },
    {
        "lessonNumber": 8,
        "title": "Skill and Speed Development (Part Two)",
        "start_page": 50,
        "end_page": 54,
        "subtitle": "Sustained typing endurance, 100-word sprints & fatigue management",
    },
    {
        "lessonNumber": 9,
        "title": "Business and Personal Letters",
        "start_page": 55,
        "end_page": 69,
        "subtitle": "Formal correspondence, block/indented styles, salutations & envelopes",
    },
    {
        "lessonNumber": 10,
        "title": "Tricks of the Trade",
        "start_page": 70,
        "end_page": 84,
        "subtitle": "Centering, tabulation, carbon copies, error correction & practical office skills",
    },
]

structured_lessons = []

for linfo in lesson_map:
    sp = linfo["start_page"] - 1
    ep = linfo["end_page"]
    combined_raw = "\n\n".join([f"[Page {p+1}]\n" + pages_text[p] for p in range(sp, min(ep, len(pages_text)))])
    
    structured_lessons.append({
        "lessonNumber": linfo["lessonNumber"],
        "title": linfo["title"],
        "subtitle": linfo["subtitle"],
        "pageRange": f"Pages {linfo['start_page']}-{linfo['end_page']}",
        "rawContent": combined_raw
    })

print(f"Parsed {len(structured_lessons)} lessons from book.")
