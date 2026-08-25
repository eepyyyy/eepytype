#!/usr/bin/env python3
"""
Generates comprehensive Training & Drills dataset for eepytype based on typing.com pedagogy.
Includes Home Row, Alphabet Reaches, Words, Punctuation, Numbers, Symbols, Coding syntax, and Benchmarks.
Appends or updates frontend/static/practice/practice_texts.json and PRACTICE_CATALOG.md.
"""

import json
import os
import re
from typing import Any, Dict, List

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
PRACTICE_FILE_PATH = os.path.join(
    ROOT_DIR, "frontend", "static", "practice", "practice_texts.json"
)
CATALOG_FILE_PATH = os.path.join(ROOT_DIR, "PRACTICE_CATALOG.md")

TRAINING_DRILLS: List[Dict[str, Any]] = [
    # ==========================================
    # UNIT 1: BEGINNER (Home Row & Alphabet)
    # ==========================================
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Home Row Anchor - J, F, and Space",
        "text": "j j j f f f j f j f fj jf j f jf jj ff jf jf j j f f jj ff jf fj j j f f j f jf fj j f jj ff jf jf jj ff fj jf j f j f fj jf jf jj ff j j f f j f jf fj",
        "author": "Typing.com Lesson 1",
        "source": "Home Row Anchor Drill",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Home Row Core - D, K, S, and L",
        "text": "d d d k k k s s s l l l dk dk sl sl dk sl asdf jkl; asdf jkl; a s d f j k l ; fj dk sl a; sad dad lad ask fall flask salad fad fall dad ask",
        "author": "Typing.com Lesson 2",
        "source": "Home Row Full Sequence",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Top Row Index & Middle - U, R, E, and I",
        "text": "u r k u r k u r u r fur jug kid run red rid due die ire dirk rue rude duel duke fire ride fried dike curd dirk rude rider furred dried druid kid",
        "author": "Typing.com Lesson 3",
        "source": "Top Row Reaches (U R E I)",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Bottom Row Index & Middle - C, G, and N",
        "text": "c g n c g n can gun gin dig ice nice rain gain cane grain ring cling dance grace cage race curd grind clang glance grand crane fence candid glance dancing",
        "author": "Typing.com Lesson 4",
        "source": "Middle & Bottom Reaches (C G N)",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Beginner Review 1 - Reaches & High Frequency Words",
        "text": "j f u r k d e i c g n run far duck ring fire dine grain crane duke cage curb grind dance curd candid dark rain drain deck funk nice kind deck grid",
        "author": "Typing.com Review 1",
        "source": "Review Lessons 1-4",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Top & Bottom Outer Reaches - T, S, L, O, B, and A",
        "text": "t s l o b a the that this to at is as so boat bold ball able back about task blast float table toast stable blast boast afloat ballot total salt",
        "author": "Typing.com Lesson 5",
        "source": "Outer Reaches (T S L O B A)",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Diagonal Reaches - V, H, and M Keys",
        "text": "v h m view home move have them much vote helm cave move match math valve hover venom volume mobile harvest mammoth hammer vanish haven shove",
        "author": "Typing.com Lesson 6",
        "source": "Diagonal Reaches (V H M)",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Period and Comma Punctuation Reaches",
        "text": "This, that. Here, there. Small, fast, accurate. Step by step, word by word. Practice daily, type cleanly. Focus on accuracy, speed will follow naturally.",
        "author": "Typing.com Lesson 7",
        "source": "Period & Comma Punctuation",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Outer Reaches - W, X, Q, Y, and P Keys",
        "text": "w x ; q y p wax web mix fix text box six quit play pay quick party reply quiet proxy pixel poetry expect quality oxygen rhythm power expand",
        "author": "Typing.com Lesson 8",
        "source": "Outer Key Drills (W X Q Y P)",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Pinky Reaches - Z and Enter Keys",
        "text": "z zip zone zero zoom amaze breeze freeze bronze quartz zealot puzzle wizard citizen bronze glaze frozen ablaze horizon zero zigzag zinc zenith",
        "author": "Typing.com Lesson 9",
        "source": "Pinky Key Drill (Z & Enter)",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 1: Beginner",
        "stage": 1,
        "title": "Beginner Milestone - The Quick Brown Fox Pangram",
        "text": "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump sphinx of black quartz judge my vow",
        "author": "Classic Typing Milestone",
        "source": "Full Alphabet Pangram Drill",
        "difficulty": "easy"
    },

    # ==========================================
    # UNIT 2: INTERMEDIATE (Words & Punctuation)
    # ==========================================
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "Easy Home Row Word Fluency",
        "text": "sad ask all fall flask dad lad salad add salsa fall salads dads flasks flask falls adds sad lad all salad fall dad asks all lads fall sad flasks",
        "author": "Typing.com Intermediate",
        "source": "Home Row Word Mastery",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "Top Row Word Fluency",
        "text": "quip wire tree root pour write power quiet write route territory report peer quote purity writer pretty equip require rewrite tower typewriter properly",
        "author": "Typing.com Intermediate",
        "source": "Top Row Word Mastery",
        "difficulty": "medium"
    },
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "Bottom Row Word Fluency",
        "text": "zippy xylophone clap valley main zero zinc cave max mix van cabin cabin calm zinc voice climb comb vanish mimic civic victim dynamic maximum",
        "author": "Typing.com Intermediate",
        "source": "Bottom Row Word Mastery",
        "difficulty": "medium"
    },
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "The 50 Most Common English Words",
        "text": "the of and a to in is you that it he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if",
        "author": "Oxford English Corpus",
        "source": "Top 50 English Words",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "The Next 50 Common English Words",
        "text": "will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part",
        "author": "Oxford English Corpus",
        "source": "Top 51-100 English Words",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "Opposite-Hand Shift Key Capitalization",
        "text": "The Quick Brown Fox Jumps Over The Lazy Dog. Typing Is A Valuable Skill. Practice Creates Precision And Speed. Always Return Your Fingers To Home Row.",
        "author": "Typing.com Intermediate",
        "source": "Shift Key Coordination",
        "difficulty": "medium"
    },
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "Apostrophes, Quotations, and Question Marks",
        "text": "What's that over there? \"I haven't seen it yet,\" she replied. Let's check the student's report: it's accurate, well-formatted, and completely on time. Isn't that wonderful?",
        "author": "Typing.com Intermediate",
        "source": "Punctuation & Dialogue",
        "difficulty": "medium"
    },
    {
        "unit": "Unit 2: Intermediate",
        "stage": 2,
        "title": "Rhythm and Flow - Sentence Cadence",
        "text": "Touch typing is an automatic sensory habit where muscles remember key locations. By avoiding glancing down at your hands, your eyes stay focused on the text ahead, creating continuous flow without interruptions.",
        "author": "Typing Methodology Guide",
        "source": "Typing Cadence Drill",
        "difficulty": "medium"
    },

    # ==========================================
    # UNIT 3: ADVANCED (Numbers & Symbols)
    # ==========================================
    {
        "unit": "Unit 3: Advanced",
        "stage": 3,
        "title": "Number Row Left Hand - 1, 2, 3, 4, and 5",
        "text": "1 2 3 4 5 15 24 35 42 123 451 234 512 11 22 33 44 55 142 531 245 135 421 352 14 25 31 42 53 12345 54321 13524 24153 15243",
        "author": "Typing.com Numbers",
        "source": "Number Row Left Reaches",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 3: Advanced",
        "stage": 3,
        "title": "Number Row Right Hand - 6, 7, 8, 9, and 0",
        "text": "6 7 8 9 0 68 79 80 96 70 890 678 901 66 77 88 99 00 687 908 769 807 690 789 67890 09876 68079 79680 80976",
        "author": "Typing.com Numbers",
        "source": "Number Row Right Reaches",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 3: Advanced",
        "stage": 3,
        "title": "Mixed Alphanumeric & Calendar Dates",
        "text": "On July 20, 1969, Apollo 11 landed on the Moon. In 2026, over 5,000 exoplanets were cataloged across 365 days. The server returned HTTP 200 on port 8080 after 145 ms.",
        "author": "Typing.com Advanced",
        "source": "Alphanumeric Prose",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 3: Advanced",
        "stage": 3,
        "title": "Commercial & Logic Symbols ($ % & @ # /)",
        "text": "The total cost was $150.00 with a 15% discount. Send the confirmation to admin@eepytype.org & support#104 / dept-alpha. Use coupon code #SAVE20 for $25.50 off.",
        "author": "Typing.com Advanced",
        "source": "Commercial Symbols Drill",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 3: Advanced",
        "stage": 3,
        "title": "Mathematical Operators & Equations (+ - = * ^ < >)",
        "text": "f(x) = x^2 + 2*x - 5; if (a + b >= c * 10) { return (x > y) ? x : y; } total_sum = 100 - 25 + 50 * 2 = 175; speed_limit <= 65 && speed >= 45;",
        "author": "Typing.com Advanced",
        "source": "Math & Operator Drill",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 3: Advanced",
        "stage": 3,
        "title": "Brackets, Parentheses, and Enclosures (( ) [ ] { })",
        "text": "function init(config = {}) { const data = [1, 2, [3, 4]]; return { status: 200, items: data.map((item) => (item * 2)) }; }",
        "author": "Typing.com Advanced",
        "source": "Bracket & Enclosure Mastery",
        "difficulty": "expert"
    },
    {
        "unit": "Unit 3: Advanced",
        "stage": 3,
        "title": "Special Code Symbols (! | \\ ~ _ : ; `)",
        "text": "cat ~/logs/*.log | grep -E '^ERROR:' || echo \"Pipeline failed!\" ; export PATH=\"$HOME/.bin:$PATH\" && chmod +x ./script.sh && ./script.sh --verbose",
        "author": "Typing.com Advanced",
        "source": "Special CLI Symbols",
        "difficulty": "expert"
    },

    # ==========================================
    # UNIT 4: DEVELOPER & CODING KEYBOARDING
    # ==========================================
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "HTML & Web Structure Tags",
        "text": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"/><title>Eepytype</title></head><body><main class=\"container\"><h1 id=\"title\">Touch Typing</h1></main></body></html>",
        "author": "Developer Drills",
        "source": "HTML Structural Syntax",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "CSS Styling & Flexbox Properties",
        "text": ".card { display: flex; flex-direction: column; justify-content: space-between; padding: 1.5rem; border-radius: 0.75rem; background-color: #1e1e2e; transition: all 150ms ease-in-out; }",
        "author": "Developer Drills",
        "source": "CSS Rules & Selectors",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "TypeScript Interfaces & Generic Types",
        "text": "export interface UserProfile<T> { id: string; email: string; isActive: boolean; metadata: Record<string, T>; createdTimestamp: number; }",
        "author": "Developer Drills",
        "source": "TypeScript Generic Types",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "JavaScript Async / Await & Promises",
        "text": "async function fetchLibraryData(endpoint: string): Promise<PracticeTextEntry[]> { const response = await fetch(endpoint); if (!response.ok) throw new Error(`HTTP error: ${response.status}`); return await response.json(); }",
        "author": "Developer Drills",
        "source": "JavaScript Async Fetch",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "Python List Comprehensions & Dictionaries",
        "text": "def process_metrics(scores: list[float]) -> dict[str, float]: return { 'average': sum(scores) / len(scores), 'peak': max(scores), 'filtered': [s for s in scores if s >= 90.0] }",
        "author": "Developer Drills",
        "source": "Python Idiomatic Syntax",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "SQL Relational Queries & Joins",
        "text": "SELECT u.username, COUNT(t.test_id) AS total_tests, AVG(t.wpm) AS avg_speed FROM users u LEFT JOIN typing_results t ON u.user_id = t.user_id WHERE t.accuracy >= 95.0 GROUP BY u.username ORDER BY avg_speed DESC LIMIT 50;",
        "author": "Developer Drills",
        "source": "SQL Query Syntax",
        "difficulty": "hard"
    },
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "Git Workflow & Branch Operations",
        "text": "git checkout -b feature/training-drills && git add . && git commit -m \"feat: implement interactive training timeline\" && git push origin feature/training-drills",
        "author": "Developer Drills",
        "source": "Git CLI Workflow",
        "difficulty": "medium"
    },

    # ==========================================
    # UNIT 5: SPEED & ENDURANCE CONDITIONING
    # ==========================================
    {
        "unit": "Unit 5: Speed & Endurance",
        "stage": 5,
        "title": "Double-Letter Precision Sprint",
        "text": "coffee bubble little letter grass happen collect pressure address account succeed trigger official barrier shuffle grammar immediate classic blossom corridor difficult banner",
        "author": "Speed Conditioning",
        "source": "Double Letter Rapid Fire",
        "difficulty": "medium"
    },
    {
        "unit": "Unit 4: Developer",
        "stage": 4,
        "title": "Rust Ownership & Pattern Matching",
        "text": "pub fn parse_input(input: &str) -> Result<Config, ParseError> { match input.trim().parse::<usize>() { Ok(val) if val > 0 => Ok(Config { limit: val }), _ => Err(ParseError::InvalidFormat), } }",
        "author": "Developer Drills",
        "source": "Rust Pattern Matching",
        "difficulty": "expert"
    },
    {
        "unit": "Unit 5: Speed & Endurance",
        "stage": 5,
        "title": "Frequent English Trigrams & Smooth Cadence",
        "text": "the and ing ion ent tio for nde has nce tis oft men ead res sta are ear her ate pro con int all ter est ers out per eve are his com ist",
        "author": "Speed Conditioning",
        "source": "N-gram Acceleration",
        "difficulty": "easy"
    },
    {
        "unit": "Unit 5: Speed & Endurance",
        "stage": 5,
        "title": "1-Minute Speed Benchmark Prose",
        "text": "True velocity on the keyboard is not born of frantic effort, but of relaxed economy of motion. When every finger stays poised closely above its home position and strikes each key with clean mechanical rhythm, high typing speeds emerge effortlessly and accurately without mental strain.",
        "author": "Typing Championship Guide",
        "source": "1-Minute Benchmark Test",
        "difficulty": "medium"
    },
    {
        "unit": "Unit 5: Speed & Endurance",
        "stage": 5,
        "title": "3-Minute Endurance Marathon Benchmark",
        "text": "Mastering the keyboard is one of the most compounding cognitive skills in modern computing. Every document written, every line of software compiled, and every idea articulated flows directly through the fingertips. By treating typing as an athletic instrument requiring posture, dexterity, and steady metronomic focus, one transforms the physical keyboard from a bottleneck into a seamless extension of human thought.",
        "author": "Typing Championship Guide",
        "source": "3-Minute Marathon Benchmark",
        "difficulty": "hard"
    }
]

def calculate_difficulty(text: str) -> Dict[str, Any]:
    words = re.findall(r"\b\w+\b", text)
    word_count = len(words)
    char_count = len(text)
    if word_count == 0:
        return {"wordCount": 0, "charCount": char_count, "avgWordLength": 0.0, "difficulty": "easy"}

    avg_len = sum(len(w) for w in words) / word_count
    if avg_len < 5.0:
        difficulty = "easy"
    elif avg_len < 5.7:
        difficulty = "medium"
    elif avg_len < 6.3:
        difficulty = "hard"
    else:
        difficulty = "expert"

    return {
        "wordCount": word_count,
        "charCount": char_count,
        "avgWordLength": round(avg_len, 1),
        "difficulty": difficulty
    }

def update_library() -> None:
    if os.path.exists(PRACTICE_FILE_PATH):
        with open(PRACTICE_FILE_PATH, "r", encoding="utf-8") as f:
            existing = json.load(f)
    else:
        existing = []

    # Remove previous training drills if any to avoid duplication
    non_training = [e for e in existing if e.get("category") != "training"]

    training_entries = []
    for drill in TRAINING_DRILLS:
        title = drill["title"]
        metrics = calculate_difficulty(drill["text"])
        slug_id = re.sub(r"[^a-z0-9]+", "-", f"training-{title}".lower()).strip("-")
        entry = {
            "id": slug_id,
            "title": title,
            "category": "training",
            "unit": drill.get("unit", "Unit 1: Beginner"),
            "stage": drill.get("stage", 1),
            "difficulty": drill.get("difficulty") or metrics["difficulty"],
            "wordCount": metrics["wordCount"],
            "charCount": metrics["charCount"],
            "avgWordLength": metrics["avgWordLength"],
            "author": drill.get("author", "Typing.com Drill"),
            "source": drill.get("source", "Training Curriculum"),
            "text": drill["text"]
        }
        training_entries.append(entry)

    # Put training entries in library
    final_list = non_training + training_entries

    with open(PRACTICE_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2, ensure_ascii=False)

    print(f"Updated library with {len(training_entries)} Training Drills. Total sections: {len(final_list)}")

if __name__ == "__main__":
    update_library()
