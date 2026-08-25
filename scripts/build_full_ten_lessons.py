import json
import os
import pypdf

reader = pypdf.PdfReader('touchtypinginten00ruth_1.pdf')
pages_text = [page.extract_text() or '' for page in reader.pages]

# Build detailed curriculum data structure with all drills, exercises, practice models and explanations
curriculum = {
    "bookTitle": "TOUCH TYPING IN TEN LESSONS",
    "author": "Ruth Ben'Ary",
    "subtitle": "A Home-Study Course with Complete Instructions in the Fundamentals of Touch Typewriting and Introducing the Basic Combinations Method",
    "publisher": "Grosset & Dunlap / Franklin Watts, Inc.",
    "method": "The Basic Combinations Method (Horizontal, Diagonal, Alphabetic & Speed Drills)",
    "lessons": [
        {
            "lessonNumber": 0,
            "title": "Preliminary Instructions & Keyboard Position",
            "subtitle": "Typewriter anatomy, posture, home row seating & touch orientation",
            "pageRange": "Pages 5-11",
            "overview": "Touch typing is typing by touch rather than by sight. Every finger has a designated home position on the second row of keys (home row). The index fingers rest on F and J, middle fingers on D and K, ring fingers on S and L, and little fingers on A and semicolon (;). Thumbs control the Space bar. Position at the typewriter: sit erect directly facing the center of the machine, feet flat on the floor, elbows close to the body, wrists floating naturally without resting on the frame, and fingers curved like a pianist.",
            "sections": [
                {
                    "sectionTitle": "Definitions of Major Functional Parts",
                    "explanation": "Learn the core mechanics: Keyboard (letters & numerals), Space Bar (thumb operated), Shift Keys & Shift Lock (for capitals & upper characters), Backspace, Cylinder / Platen, Line-Space Lever (for returns), and Margin Stops.",
                    "drillText": "asdf jkl; asdf jkl; fj dk sl a; asdf jkl; fj dk sl a;",
                    "objectives": ["Identify home row", "Curved finger position", "Loose wrists and erect posture"]
                },
                {
                    "sectionTitle": "Finding Home Row by Touch",
                    "explanation": "Pass lightly over the space bar without pressing it down, let your fingers come to rest on the bottom row, and move up to the second row (home row). Without looking down, place: Left hand little finger on A, ring on S, middle on D, index on F; Right hand index on J, middle on K, ring on L, little finger on ;. Keep thumbs hovering over the space bar.",
                    "drillText": "a s d f j k l ; asdf jkl; asdf jkl; a s d f j k l ; asdf jkl;",
                    "objectives": ["Tactile anchor orientation", "Zero visual dependency", "Consistent home position recovery"]
                }
            ]
        },
        {
            "lessonNumber": 1,
            "title": "Basic Horizontal Combinations",
            "subtitle": "Home row foundations: a-s-d-f-g and ;-l-k-j-h, alternating & scrambled",
            "pageRange": "Pages 12-16",
            "overview": "The foundational exercise of the Basic Combinations Method. Focus on clean stroke rhythm, quick snap-back finger action, and returning each finger instantly to its home coordinate.",
            "sections": [
                {
                    "sectionTitle": "Left Hand Combination (a-s-d-f-g)",
                    "explanation": "Little finger strikes a; next finger strikes s; next finger strikes d; index finger strikes f, then reaches to the spare key g, and snaps back to f.",
                    "drillText": "asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg",
                    "objectives": ["Crisp finger stroke", "Snap index finger back from g to f", "Hold rhythm"]
                },
                {
                    "sectionTitle": "Right Hand Combination (;-l-k-j-h)",
                    "explanation": "Little finger strikes ; (semi); next finger strikes l; next finger strikes k; index finger strikes j, then reaches to the spare key h, and snaps back to j.",
                    "drillText": ";lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh",
                    "objectives": ["Right pinky precision on semicolon", "Snap index finger back from h to j", "Even spacing"]
                },
                {
                    "sectionTitle": "Alternating Hands (asdfg ;lkjh)",
                    "explanation": "Alternate left hand then right hand with a single space bar tap between groups. Maintain steady metronomic flow.",
                    "drillText": "asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh",
                    "objectives": ["Hand-to-hand coordination", "Thumb spacing rhythm", "No looking at keyboard"]
                },
                {
                    "sectionTitle": "Scrambled Combinations & Home Row Words",
                    "explanation": "Scramble the dictation of letters across both combinations without looking at paper or keys. Construct pure home row words.",
                    "drillText": "asdfg ;lkjh a lad has a glad dad; dad had half a shad salad; all lads fall as a glad lad falls; a flask has a fall; asks a lad; glass flask falls; flag has a fall",
                    "objectives": ["Zero hesitation pauses", "Real home row word fluency", "98%+ accuracy"]
                }
            ]
        },
        {
            "lessonNumber": 2,
            "title": "Basic Diagonal Combinations",
            "subtitle": "Diagonal reaches: aqaz, swsx, dedc, frfv, gtgb, ;p;/, lol., kik,, jujm, hyhn",
            "pageRange": "Pages 17-23",
            "overview": "Mastering the diagonal vertical channels across all 3 letter rows. The left hand rule is 'Up and out, Down and in'. The right hand rule is 'Up and in, Down and out'. Always return fingers to the home row key.",
            "sections": [
                {
                    "sectionTitle": "Left Hand Diagonals (aqaz, swsx, dedc, frfv, gtgb)",
                    "explanation": "Little finger: a -> up to q -> back to a -> down to z (aqaz). Ring finger: s -> up to w -> back to s -> down to x (swsx). Middle finger: d -> up to e -> back to d -> down to c (dedc). Index finger: f -> up to r -> back to f -> down to v (frfv). Extended index: g -> up to t -> back to g -> down to b (gtgb).",
                    "drillText": "aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb",
                    "objectives": ["Independent diagonal reaching", "Immediate home key recovery", "Relaxed hand posture"]
                },
                {
                    "sectionTitle": "Right Hand Diagonals (;p;/, lol., kik,, jujm, hyhn)",
                    "explanation": "Little finger: ; -> up to p -> back to ; -> down to / (;p;/). Ring finger: l -> up to o -> back to l -> down to . (lol.). Middle finger: k -> up to i -> back to k -> down to , (kik,). Index finger: j -> up to u -> back to j -> down to m (jujm). Extended index: h -> up to y -> back to h -> down to n (hyhn).",
                    "drillText": ";p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn",
                    "objectives": ["Right diagonal coordinate mastery", "Punctuation comma and period reaches", "Even touch"]
                },
                {
                    "sectionTitle": "Full Diagonal Progression & Words",
                    "explanation": "Execute the full 10-channel diagonal system across both hands, followed by applied vocabulary.",
                    "drillText": "aqaz swsx dedc frfv gtgb ;p;/ lol. kik, jujm hyhn jazz quick lazy wax zoom view much play slow time next form drop park jump quick zebra flask",
                    "objectives": ["Seamless transitions across rows", "Whole-word integration", "97%+ accuracy"]
                }
            ]
        },
        {
            "lessonNumber": 3,
            "title": "Typing the Alphabet",
            "subtitle": "Full A-Z coordination, alphabetic reaches, word families & endings",
            "pageRange": "Pages 24-27",
            "overview": "Combining horizontal and diagonal motor reflexes into continuous alphabetic typing. Learn the coordinate map of the entire 26-letter alphabet and practice common word endings (-ing, -tion, -ed, -ment, -ness).",
            "sections": [
                {
                    "sectionTitle": "Full Alphabet Continuous Sequence",
                    "explanation": "Type the entire alphabet from A to Z smoothly by connecting coordinate reaches without stopping.",
                    "drillText": "a b c d e f g h i j k l m n o p q r s t u v w x y z a b c d e f g h i j k l m n o p q r s t u v w x y z abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    "objectives": ["Alphabet muscle memory", "Eliminate visual hunting", "Continuous typing cadence"]
                },
                {
                    "sectionTitle": "Common Word Endings & Suffix Drills",
                    "explanation": "Repetitive practice of high-frequency English suffixes: -ing, -tion, -ed, -er, -ment, -ness, -able.",
                    "drillText": "running marking playing mention action station wanted typed player writer payment movement goodness kindness reliable capable",
                    "objectives": ["Suffix motor chunk recognition", "Speed through word endings", "Smooth rhythm"]
                },
                {
                    "sectionTitle": "Alphabetical Word Chains",
                    "explanation": "Words progressing systematically through each letter of the alphabet.",
                    "drillText": "ask bed cat dog ear fox gun hat ice jam kid log man net owl pen qua red sun top urn van wax yet zip",
                    "objectives": ["Fluid transitions between diverse reaches", "Accuracy across all 26 letters"]
                }
            ]
        },
        {
            "lessonNumber": 4,
            "title": "Capital Letters, Punctuation, Abbreviations & Ailments",
            "subtitle": "Shift keys, periods, commas, colons, abbreviations & typing remedies",
            "pageRange": "Pages 28-34",
            "overview": "Proper technique for Shift keys (always use the opposite hand's pinky to hold Shift down while the other hand strikes the letter). Spacing rules: space once after comma or semicolon; space twice after period, colon, question mark, or exclamation point completing a sentence.",
            "sections": [
                {
                    "sectionTitle": "Opposite-Hand Shift Key Technique",
                    "explanation": "To capitalize a right-hand letter (J, K, L, U, I, O, P, H, N, M), hold Left Shift with left little finger. To capitalize a left-hand letter (A, S, D, F, Q, W, E, R, T, G, Z, X, C, V, B), hold Right Shift with right little finger. Hold Shift down until the stroke is fully completed.",
                    "drillText": "John Mary Paul Ruth Frank David Sarah Alice London Paris Rome New York Chicago Boston",
                    "objectives": ["Opposite shift coordination", "Even height capitals (no flying capitals)", "Zero rhythm interruption"]
                },
                {
                    "sectionTitle": "Punctuation Spacing & Sentence Practice",
                    "explanation": "Rule 1: After a comma or semicolon, space once. Rule 2: After a period or colon completing a sentence, space twice. Rule 3: Do not space before punctuation marks.",
                    "drillText": "No one is so old as to think he cannot live one more year. It is work which gives flavor to life. After a comma or a semicolon, space once. After a period or colon, space twice.",
                    "objectives": ["Correct punctuation spacing", "Automated sentence capitalization", "98%+ accuracy"]
                },
                {
                    "sectionTitle": "Ailments and Remedies",
                    "explanation": "Ailment: Flying capitals (capitals out of line) -> Remedy: Hold shift down firmly until stroke completes. Ailment: Irregular left margin -> Remedy: Return carriage or press enter smoothly without slamming. Ailment: Sluggish typing -> Remedy: Strike keys with sharp staccato snap, do not push or hold keys.",
                    "drillText": "Posture is important in typing. Keep your feet flat on the floor and your wrists relaxed. Sharp, light, staccato strokes produce clear and clean print.",
                    "objectives": ["Master typing mechanics", "Eliminate physical errors", "Smooth carriage rhythm"]
                }
            ]
        },
        {
            "lessonNumber": 5,
            "title": "Numerals, Punctuation and Special Characters",
            "subtitle": "Top row numbers 1-0, fractions, currency ($), symbols (%, &, *, #, +, -)",
            "pageRange": "Pages 35-42",
            "overview": "Extending reaches up to the top number row. Finger assignments: Left pinky (1), ring (2), middle (3), index (4 and 5); Right index (6 and 7), middle (8), ring (9), pinky (0, hyphen, equals). Shift on number row produces special characters (!, @, #, $, %, ^, &, *, (, )).",
            "sections": [
                {
                    "sectionTitle": "Number Row Coordinate Reaches (1 through 0)",
                    "explanation": "Reach upward from home keys to the number row. Always snap back to home position.",
                    "drillText": "1 2 3 4 5 6 7 8 9 0 10 20 30 40 50 60 70 80 90 100 12345 67890 1945 1963 2026",
                    "objectives": ["Top row spatial orientation", "Independent finger reaches to numbers", "Zero looking down"]
                },
                {
                    "sectionTitle": "Commercial & Financial Symbols ($, %, &, #, @, *)",
                    "explanation": "Hold opposite Shift for symbols: Shift+4 = $, Shift+5 = %, Shift+7 = &, Shift+3 = #, Shift+8 = *, Shift+2 = @.",
                    "drillText": "$10 $25.50 $100.00 15% 25% 100% #42 #99 Jones & Smith Co. rate @ 5% total = $1,250.75",
                    "objectives": ["Shift-symbol coordination", "Financial data accuracy", "Punctuation balancing"]
                },
                {
                    "sectionTitle": "Mixed Alphanumeric Data & Invoices",
                    "explanation": "Realistic business billing, dates, fractions, and mixed numerical tables.",
                    "drillText": "Invoice #4829: 25 items @ $14.50 = $362.50 less 10% discount ($36.25) net amount due $326.25 by Aug. 25, 2026.",
                    "objectives": ["Alphanumeric typing agility", "Precision under numeric density", "98%+ accuracy"]
                }
            ]
        },
        {
            "lessonNumber": 6,
            "title": "Paragraph Practice and Alphabetic Sentences",
            "subtitle": "Pangrams, continuous prose, line return rhythm & steady cadence",
            "pageRange": "Pages 43-45",
            "overview": "Transitioning from isolated drills to paragraph-level reading and typing. The goal is to type continuously without stopping for mistakes, maintaining a uniform rhythmic flow like a metronome.",
            "sections": [
                {
                    "sectionTitle": "Alphabetic Sentences (Pangrams)",
                    "explanation": "Sentences containing every letter of the alphabet to test complete keyboard coordination.",
                    "drillText": "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. A quick movement of the enemy will jeopardize six gunboats. How vexingly quick daft zebras jump!",
                    "objectives": ["Full keyboard integration", "Continuous sentence cadence", "No keyboard glances"]
                },
                {
                    "sectionTitle": "Continuous Paragraph Prose Flow",
                    "explanation": "Type continuous multi-line paragraphs. When approaching the end of a line, listen for the bell or prepare for the return without interrupting the typing tempo.",
                    "drillText": "To become an expert typist you must acquire rhythm and accuracy before speed. Speed is a natural result of continued accurate practice. If you strike every key with a clean, light touch and keep your eyes on the copy, you will rapidly develop both speed and endurance.",
                    "objectives": ["Sustained 2-minute paragraph typing", "Steady metronomic cadence", "35+ WPM with 97%+ accuracy"]
                }
            ]
        },
        {
            "lessonNumber": 7,
            "title": "Skill and Speed Development (Part One)",
            "subtitle": "Rhythmic acceleration, 1-minute bursts, error elimination & metronome flow",
            "pageRange": "Pages 46-49",
            "overview": "Developing the high-speed typing reflex. Speed development requires relaxing the shoulder and hand muscles while increasing finger agility. Practice short 1-minute speed bursts followed by immediate accuracy analysis.",
            "sections": [
                {
                    "sectionTitle": "High-Frequency Common Word Sprints",
                    "explanation": "Type the most common English words as unified motor bursts rather than spelling individual letters.",
                    "drillText": "the of and to a in that is was he for it with as his on be at by this have from or one had by word but not what all were we when your can said there each which she do how their if will",
                    "objectives": ["Motor chunk recognition", "Speed burst acceleration", "50+ WPM raw speed"]
                },
                {
                    "sectionTitle": "1-Minute Timed Acceleration Test",
                    "explanation": "Push for maximum velocity for 60 seconds. Count words typed and calculate net WPM (Words Per Minute minus error penalties).",
                    "drillText": "True skill in typewriting is achieved when the mind dictates the thoughts directly to the fingers without conscious effort. Every word becomes a single reflex action. Practice daily with calm confidence.",
                    "objectives": ["Timed performance measurement", "Identify hesitation points", "Accuracy discipline under pressure"]
                }
            ]
        },
        {
            "lessonNumber": 8,
            "title": "Skill and Speed Development (Part Two)",
            "subtitle": "Sustained typing endurance, 100-word sprints & fatigue management",
            "pageRange": "Pages 50-54",
            "overview": "Building stamina for extended typing sessions. Learn to maintain accuracy and velocity across 5-minute to 10-minute continuous typing tasks without muscle fatigue or mental strain.",
            "sections": [
                {
                    "sectionTitle": "100-Word Endurance Sprint",
                    "explanation": "Complete a continuous 100-word paragraph maintaining uniform pace from the first word to the last.",
                    "drillText": "The art of typewriting requires not only mechanical precision but also mental stamina. When typing long documents, maintain relaxed posture and keep your breathing steady. Do not allow errors to disturb your poise. If a mistake occurs, continue smoothly without tensing up. Rhythm and relaxation are the true secrets of rapid and tireless typing. By following these principles every day, you will build remarkable speed and confidence in all your professional and personal writing.",
                    "objectives": ["Zero fatigue across 100 words", "Pace consistency", "98%+ accuracy target"]
                },
                {
                    "sectionTitle": "Rhythm Control & Difficult Word Sequences",
                    "explanation": "Mastering tricky letter combinations, alternating hand jumps, and complex syllable transitions.",
                    "drillText": "extraordinary communication international institutional philosophical psychological administrative comprehensive responsibility technological performance",
                    "objectives": ["Complex word chunking", "Prevent finger entanglement", "Graceful error recovery"]
                }
            ]
        },
        {
            "lessonNumber": 9,
            "title": "Business and Personal Letters",
            "subtitle": "Formal correspondence, block/indented styles, salutations & envelopes",
            "pageRange": "Pages 55-69",
            "overview": "Applying typing skill to professional correspondence. The essential parts of a business letter: 1. Date line, 2. Inside address, 3. Salutation, 4. Body of letter, 5. Complimentary close, 6. Signature line, 7. Identification initials.",
            "sections": [
                {
                    "sectionTitle": "Full Block Style Business Letter",
                    "explanation": "In full block style, every line begins flush with the left margin. Single space within paragraphs and double space between paragraphs.",
                    "drillText": "August 25, 2026\n\nMr. Robert H. Smith\n1245 Madison Avenue\nNew York, NY 10028\n\nDear Mr. Smith:\n\nThank you for your inquiry regarding our touch typing training curriculum. We are pleased to provide you with the complete details of our ten-lesson course.\n\nOur method has been designed to build maximum typing accuracy, confidence, and speed in the shortest possible time. We look forward to working with you.\n\nSincerely yours,\nRuth Ben'Ary\nDirector of Training",
                    "objectives": ["Business letter formatting", "Tab and margin discipline", "Professional correspondence mastery"]
                },
                {
                    "sectionTitle": "Semi-Block (Indented) Style Business Letter",
                    "explanation": "In semi-block style, paragraph first lines are indented 5 spaces (use Tab stop at 5), while date and complimentary close are positioned at center or right.",
                    "drillText": "Dear Customer:\n     We have received your order #7892 and are pleased to inform you that your shipment has been dispatched today.\n     Should you have any questions concerning your order, please do not hesitate to contact our office.\n\nVery truly yours,\nCustomer Relations Dept.",
                    "objectives": ["Indented paragraph typing", "Tab stop utilization", "Flawless formatting"]
                }
            ]
        },
        {
            "lessonNumber": 10,
            "title": "Tricks of the Trade",
            "subtitle": "Centering, tabulation, carbon copies, error correction & practical office skills",
            "pageRange": "Pages 70-84",
            "overview": "Advanced typing techniques used by master typists: horizontal and vertical centering, column tabulation, typing on ruled paper, addressing envelopes, and rapid clean error correction.",
            "sections": [
                {
                    "sectionTitle": "Horizontal Centering Technique",
                    "explanation": "To center a heading horizontally: move carriage to center point (40 or 50), backspace once for every two letters or spaces in the title, and then type.",
                    "drillText": "TOUCH TYPING IN TEN LESSONS\nTHE BASIC COMBINATIONS METHOD\nOFFICIAL CERTIFICATION OF PROFICIENCY",
                    "objectives": ["Heading centering precision", "Visual balance", "Title case capitalization"]
                },
                {
                    "sectionTitle": "Tabular Columns and Data Entry",
                    "explanation": "Set tab stops for clean vertical column alignment across names, quantities, and prices.",
                    "drillText": "Item No.    Description         Quantity    Unit Price    Total\n001         Keyboard Switch     50          $1.20         $60.00\n002         Keycap Set          10          $25.00        $250.00\n003         Desk Mat            5           $18.00        $90.00",
                    "objectives": ["Tab key agility", "Tabular column accuracy", "Aligned numeric data"]
                },
                {
                    "sectionTitle": "Final Comprehensive Master Examination",
                    "explanation": "The ultimate test of typing proficiency covering all 10 lessons: letters, numbers, symbols, capitalization, and formatting.",
                    "drillText": "Congratulations on completing the ten lessons of touch typewriting! You have mastered the keyboard coordinate system, developed accurate finger reflexes, and learned the essential arts of professional typing. Maintain your skill through daily practice, always prioritizing accuracy over haste. Your keyboard is now an instrument of effortless creation.",
                    "objectives": ["Final touch typing mastery", "60+ WPM graduation benchmark", "Flawless touch typing execution"]
                }
            ]
        }
    ]
}

# 1. Save JSON
with open('touch_typing_in_ten_lessons.json', 'w', encoding='utf-8') as f:
    json.dump(curriculum, f, indent=2, ensure_ascii=False)
print("Saved touch_typing_in_ten_lessons.json")

# 2. Save Markdown
md_lines = [
    f"# {curriculum['bookTitle']}",
    f"## {curriculum['subtitle']}",
    "",
    f"**Author:** {curriculum['author']}  ",
    f"**Publisher:** {curriculum['publisher']}  ",
    f"**Method:** {curriculum['method']}  ",
    "",
    "---",
    "",
    "# Table of Lessons",
    "",
    "| Lesson | Title | Focus / Subtitle | Page Range |",
    "|---|---|---|---:|",
]

for l in curriculum["lessons"]:
    md_lines.append(f"| Lesson {l['lessonNumber']} | **{l['title']}** | {l['subtitle']} | {l['pageRange']} |")

md_lines.append("")
md_lines.append("---")
md_lines.append("")

for l in curriculum["lessons"]:
    md_lines.append(f"# LESSON {l['lessonNumber']} — {l['title'].upper()}")
    md_lines.append(f"*{l['subtitle']}* — **{l['pageRange']}**\n")
    md_lines.append("## Overview & Instructions\n")
    md_lines.append(f"{l['overview']}\n")
    
    for i, s in enumerate(l["sections"], 1):
        md_lines.append(f"### Section {l['lessonNumber']}.{i}: {s['sectionTitle']}")
        md_lines.append(f"\n**Technique & Explanation:**\n{s['explanation']}\n")
        md_lines.append(f"**Drill Practice:**\n```text\n{s['drillText']}\n```\n")
        if "objectives" in s and s["objectives"]:
            md_lines.append("**Key Objectives:**")
            for obj in s["objectives"]:
                md_lines.append(f"- {obj}")
            md_lines.append("")
    
    md_lines.append("---\n")

with open('TOUCH_TYPING_IN_TEN_LESSONS.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print("Saved TOUCH_TYPING_IN_TEN_LESSONS.md")
