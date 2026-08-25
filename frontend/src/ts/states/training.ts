import { createSignal } from "solid-js";
import { setConfig } from "../config/setters";
import { restartTestEvent } from "../events/test";
import { setCustomTextIndicator } from "./core";
import { hideModal } from "./modals";
import * as CustomText from "../test/custom-text";
import { FaSolidIcon } from "../types/font-awesome";

export type TrainingStage = {
  id: string;
  stageNumber: string; // e.g. "0.1", "1.1", "2.1"
  title: string;
  shortTitle: string;
  drillText: string;
  description: string;
  objectives?: string[];
  masteryTarget?: string;
};

export type TrainingUnit = {
  unitId: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  icon: FaSolidIcon;
  stages: TrainingStage[];
};

export const TRAINING_CURRICULUM: TrainingUnit[] = [
  // ==========================================
  // UNIT 0: PRE-KEYBOARDING & SETUP
  // ==========================================
  {
    unitId: "unit-0",
    unitNumber: 0,
    title: "Pre-Keyboarding & Setup",
    subtitle: "Keyboard anatomy, posture & home position",
    icon: "fa-info-circle" as const,
    stages: [
      {
        id: "0.1",
        stageNumber: "0.1",
        title: "Keyboard Anatomy & Spatial Zones",
        shortTitle: "Keyboard Anatomy",
        description:
          "Identify QWERTY rows, modifier keys, spacebar, and index anchor positions.",
        drillText:
          "asdf jkl; qwer uiop zxcv nm,. 12345 67890 Tab Shift Enter Space Backspace",
        masteryTarget: "Locate keys without visual searching",
      },
      {
        id: "0.2",
        stageNumber: "0.2",
        title: "Posture & Neutral Hand Positioning",
        shortTitle: "Posture & Wrists",
        description:
          "Keep wrists floating neutral and fingers gently curved over the home row.",
        drillText:
          "asdf jkl; asdf jkl; fj fj dk dk sl sl a; a; asdf jkl; asdf jkl;",
        masteryTarget: "Relaxed shoulders, curved fingers",
      },
      {
        id: "0.3",
        stageNumber: "0.3",
        title: "The Home Position (A S D F - J K L ;)",
        shortTitle: "Home Position",
        description:
          "Feel the tactile bumps on F and J to orient your hands blindly.",
        drillText:
          "asdf jkl; asdf jkl; asdf jkl; fj fj fj jk jk jk asdf jkl; fj dk sl a;",
        masteryTarget: "Return to home position automatically",
      },
    ],
  },

  // ==========================================
  // UNIT 1: HOME ROW & FUNDAMENTALS
  // ==========================================
  {
    unitId: "unit-1",
    unitNumber: 1,
    title: "Home Row & Touch-Typing Fundamentals",
    subtitle: "Anchors, home keys, words & rhythm",
    icon: "fa-seedling" as const,
    stages: [
      {
        id: "1.1",
        stageNumber: "1.1",
        title: "F and J Tactile Anchors",
        shortTitle: "F & J Anchors",
        description:
          "Index finger tactile landmarks. Tap lightly and return immediately.",
        drillText:
          "f j f j fj jf fff jjj f j f j f j ff jj fj jf f j j f ff jj fj jf",
        masteryTarget: "99% accuracy on anchor taps",
      },
      {
        id: "1.2",
        stageNumber: "1.2",
        title: "Space Bar Consistent Thumb Taps",
        shortTitle: "Space Bar",
        description:
          "Tap Space lightly with either thumb without lifting whole hand.",
        drillText:
          "a a s s d d f f j j k k l l ; ; a s d f j k l ; as df jk l;",
        masteryTarget: "Never use index finger for space",
      },
      {
        id: "1.3",
        stageNumber: "1.3",
        title: "Individual Home Keys (A S D F J K L ;)",
        shortTitle: "Individual Keys",
        description:
          "Independent finger movements on each home row coordinate.",
        drillText:
          "a a a a s s s s d d d d f f f f j j j j k k k k l l l l ; ; ; ;",
        masteryTarget: "Zero hand twisting",
      },
      {
        id: "1.4",
        stageNumber: "1.4",
        title: "Adjacent Finger Combinations",
        shortTitle: "Adjacent Combos",
        description:
          "Roll neighboring fingers smoothly across adjacent home keys.",
        drillText:
          "as sa sd ds df fd jk kj kl lk asdf fdsa jkl; ;lkj asdf jkl; fdsa ;lkj",
        masteryTarget: "Clean continuous rolling rhythm",
      },
      {
        id: "1.5",
        stageNumber: "1.5",
        title: "Home Row Words & Patterns",
        shortTitle: "Home Words",
        description: "Construct pure home row words without looking down.",
        drillText:
          "sad ask dad fad all fall flask salad salsa falls adds sad lad all salad fall dad asks",
        masteryTarget: "97%+ accuracy",
      },
      {
        id: "1.6",
        stageNumber: "1.6",
        title: "Home Row Rhythm & Metronome Flow",
        shortTitle: "Rhythm & Flow",
        description:
          "Keep equal time between keystrokes. Speed arises from rhythm.",
        drillText:
          "asdf jkl; asdf jkl; fj dk sl a; ja sk dl f; sad ask dad fall flask salad salsa",
        masteryTarget: "Smooth metronomic cadence",
      },
    ],
  },

  // ==========================================
  // UNIT 2: FIRST LETTER GROUPS
  // ==========================================
  {
    unitId: "unit-2",
    unitNumber: 2,
    title: "First Letter Groups",
    subtitle: "U/R/K, D/E/I, C/G/N & weak key isolation",
    icon: "fa-layer-group" as const,
    stages: [
      {
        id: "2.1",
        stageNumber: "2.1",
        title: "J, F, and Space Fluency",
        shortTitle: "J / F / Space",
        description: "Combine index anchors with full home row keys.",
        drillText:
          "j f j f f j f j j j f f fj jf ff jj a f j s j f d f j k j f l j f",
        masteryTarget: "Natural anchor recovery",
      },
      {
        id: "2.2",
        stageNumber: "2.2",
        title: "Top Row Reaches — U, R, and K",
        shortTitle: "U, R, K Reaches",
        description:
          "Index reaches upward to U and R; middle finger stays on K.",
        drillText:
          "r f r f u j u j r u r u k j k f k d k s r u k f j k r f u j fur jug kid run red rid",
        masteryTarget: "Immediate return to home row",
      },
      {
        id: "2.3",
        stageNumber: "2.3",
        title: "Top & Home Reaches — D, E, and I",
        shortTitle: "D, E, I Reaches",
        description: "Middle fingers reaching upward to E and I.",
        drillText:
          "e d e d e f e f i k i k i j i j d f d s d e d e i f r j u k i r die red kid feed dire",
        masteryTarget: "Independent middle finger control",
      },
      {
        id: "2.4",
        stageNumber: "2.4",
        title: "Bottom & Center Reaches — C, G, and N",
        shortTitle: "C, G, N Reaches",
        description: "Middle finger to C; index stretches sideways to G and N.",
        drillText:
          "c d c d g f g f n j n j c g n d f j c n g can gun gin dig ice nice rain gain cane grain ring",
        masteryTarget: "Smooth diagonal reach",
      },
      {
        id: "2.5",
        stageNumber: "2.5",
        title: "Beginner Letter Group Review",
        shortTitle: "Review 1",
        description: "Mixed combinations of all 11 keys learned so far.",
        drillText:
          "j f u r k d e i c g n run far duck ring fire dine grain crane duke cage curb grind dance curd",
        masteryTarget: "95%+ accuracy across mixed keys",
      },
      {
        id: "2.6",
        stageNumber: "2.6",
        title: "Adaptive Weak-Key Targeted Drill",
        shortTitle: "Weak-Key Drill",
        description: "Isolate common trouble pairs: R/U, N/C, and E/I.",
        drillText:
          "r r u r u n n c n c e e i e i run urn can ice nice curd ring drain deck grid nice kind deck",
        masteryTarget: "Zero hesitation pauses",
      },
    ],
  },

  // ==========================================
  // UNIT 3: COMPLETING THE ALPHABET
  // ==========================================
  {
    unitId: "unit-3",
    unitNumber: 3,
    title: "Completing the Alphabet",
    subtitle: "T/S/L, O/B/A, V/H/M, W/X, Q/Y/P, Z/Enter & Pangram",
    icon: "fa-font" as const,
    stages: [
      {
        id: "3.1",
        stageNumber: "3.1",
        title: "Reaches for T, S, and L",
        shortTitle: "T, S, L Reaches",
        description: "Left index reach to T; ring fingers on S and L.",
        drillText:
          "t f t f t g t g s a s a l k l k t s l last salt list tell let fast still salt late task",
        masteryTarget: "Clean outer reaches",
      },
      {
        id: "3.2",
        stageNumber: "3.2",
        title: "Reaches for O, B, and A",
        shortTitle: "O, B, A Reaches",
        description:
          "Right ring finger to O; left index diagonal to B; left pinky on A.",
        drillText:
          "o l o l o k o k b f b f b g b g a s a s a d a d boat ball book also about bold back table",
        masteryTarget: "Smooth diagonal stretch",
      },
      {
        id: "3.3",
        stageNumber: "3.3",
        title: "Reaches for V, H, and M",
        shortTitle: "V, H, M Reaches",
        description: "Bottom row reaches: left index V, right index H and M.",
        drillText:
          "v f v f v d v d h g h g h j h j m j m j m k m k have home move make time view much vote valve",
        masteryTarget: "No wrist dropping",
      },
      {
        id: "3.4",
        stageNumber: "3.4",
        title: "Reaches for W, X, and Semicolon",
        shortTitle: "W, X, Semicolon",
        description: "Left ring finger to W and X; right pinky to semicolon.",
        drillText:
          "w a w a w s w s x s x s x d x d ; l ; l ; k ; k wax west six mix text box web fix next",
        masteryTarget: "Isolated ring finger agility",
      },
      {
        id: "3.5",
        stageNumber: "3.5",
        title: "Outer Reaches for Q, Y, and P",
        shortTitle: "Q, Y, P Reaches",
        description: "Left pinky Q, right index Y, right pinky P.",
        drillText:
          "q a q a q w q w y h y h y j y j p ; p ; p l p l type play query happy quick party reply quiet",
        masteryTarget: "Stable pinky reaches",
      },
      {
        id: "3.6",
        stageNumber: "3.6",
        title: "Pinky Reaches for Z and Enter",
        shortTitle: "Z & Enter Keys",
        description: "Left pinky reach down to Z; right pinky reach to Enter.",
        drillText:
          "z a z a z s z s zip zone zero zoom amaze breeze freeze bronze quartz zealot puzzle wizard",
        masteryTarget: "Return fingers to home row immediately",
      },
      {
        id: "3.7",
        stageNumber: "3.7",
        title: "Full Alphabet Coordinate Progression",
        shortTitle: "A-Z Alphabet",
        description: "Forward and reverse full alphabet sequence.",
        drillText:
          "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba qaz wsx edc rfv tgb yhn ujm ik ol p",
        masteryTarget: "Smooth continuous alphabet flow",
      },
      {
        id: "3.8",
        stageNumber: "3.8",
        title: "The Classic Quick Brown Fox Pangram",
        shortTitle: "Pangram Milestone",
        description:
          "Full alphabet coordination across every key in the English language.",
        drillText:
          "the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump sphinx of black quartz judge my vow",
        masteryTarget: "97%+ accuracy without looking",
      },
    ],
  },

  // ==========================================
  // UNIT 4: WORDS, PATTERNS & SENTENCE FLUENCY
  // ==========================================
  {
    unitId: "unit-4",
    unitNumber: 4,
    title: "Words, Patterns & Sentence Fluency",
    subtitle: "Bigrams, trigrams, alternating hands & sentence flow",
    icon: "fa-book-open" as const,
    stages: [
      {
        id: "4.1",
        stageNumber: "4.1",
        title: "High-Frequency Two-Letter Bigrams",
        shortTitle: "Bigram Drills",
        description: "Learn recurring letter pairs as unified motor bursts.",
        drillText:
          "th he er re in it ti is an on no at to ot th th th he he he in in in at at at to to to",
        masteryTarget: "Motor chunk recognition",
      },
      {
        id: "4.2",
        stageNumber: "4.2",
        title: "The Top 50 English Common Words",
        shortTitle: "Top 50 Words",
        description: "The core words that make up over 50% of written English.",
        drillText:
          "the of and a to in is you that it he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said",
        masteryTarget: "Instant whole-word typing",
      },
      {
        id: "4.3",
        stageNumber: "4.3",
        title: "Word Families & Suffix Patterns",
        shortTitle: "Word Families",
        description: "Practice root words with -s, -ed, -er, and -ing endings.",
        drillText:
          "play plays played player playing type typed typing typer read reader reading write writer writing",
        masteryTarget: "Smooth suffix transitions",
      },
      {
        id: "4.4",
        stageNumber: "4.4",
        title: "Alternating-Hand Rhythm Practice",
        shortTitle: "Alternating Hands",
        description:
          "Balance left and right hand keystrokes for peak velocity.",
        drillText:
          "left right later water paper write world people island chair problem visual audit handle island",
        masteryTarget: "Smooth hand-to-hand ping-pong cadence",
      },
      {
        id: "4.5",
        stageNumber: "4.5",
        title: "Same-Hand Challenge Sequences",
        shortTitle: "Same-Hand Control",
        description:
          "Control same-hand letter clusters without tensing the fingers.",
        drillText:
          "were tree free ever very type state create agree refer trade grade treat feast dwarf sweet",
        masteryTarget: "Zero finger collision or tension",
      },
      {
        id: "4.6",
        stageNumber: "4.6",
        title: "Multi-Syllable Long Word Chunking",
        shortTitle: "Long Words",
        description: "Mental chunking of long professional vocabulary.",
        drillText:
          "information communication organization development technology keyboard experience professional performance infrastructure",
        masteryTarget: "Fluid chunk-by-chunk execution",
      },
      {
        id: "4.7",
        stageNumber: "4.7",
        title: "Continuous Sentence Cadence",
        shortTitle: "Sentence Cadence",
        description: "Full sentences with spaces, maintaining steady pace.",
        drillText:
          "The keyboard is a tool for communication. Accuracy creates the foundation for speed. Good typing technique reduces unnecessary movement.",
        masteryTarget: "35+ WPM with 97%+ accuracy",
      },
    ],
  },

  // ==========================================
  // UNIT 5: CAPITALIZATION & MECHANICS
  // ==========================================
  {
    unitId: "unit-5",
    unitNumber: 5,
    title: "Capitalization & Mechanics",
    subtitle: "Opposite-hand shift, punctuation & dialogue",
    icon: "fa-keyboard" as const,
    stages: [
      {
        id: "5.1",
        stageNumber: "5.1",
        title: "Left Shift (Right-Hand Capitals)",
        shortTitle: "Left Shift",
        description:
          "Hold left Shift with left pinky while typing right hand keys.",
        drillText:
          "J K L U I O Y H N M P India Japan Korea London New York Tokyo United Kingdom",
        masteryTarget: "Opposite hand shift coordination",
      },
      {
        id: "5.2",
        stageNumber: "5.2",
        title: "Right Shift (Left-Hand Capitals)",
        shortTitle: "Right Shift",
        description:
          "Hold right Shift with right pinky while typing left hand keys.",
        drillText:
          "A S D F Q W E R Z X C V America France Germany Spain Canada Rome Berlin Zurich",
        masteryTarget: "Opposite hand shift coordination",
      },
      {
        id: "5.3",
        stageNumber: "5.3",
        title: "Period and Comma Punctuation Flow",
        shortTitle: "Period & Comma",
        description: "Integrate periods and commas into the sentence rhythm.",
        drillText:
          "Hello, world. Yes, please. Typing, practice, accuracy. Small, steady, focused. Learn well, type fast.",
        masteryTarget: "Punctuation without hesitation stops",
      },
      {
        id: "5.4",
        stageNumber: "5.4",
        title: "Basic Punctuation (. , ? !)",
        shortTitle: "Basic Punctuation",
        description: "Question marks, exclamation points, periods, and commas.",
        drillText:
          "What are you doing? Stop! Hello, how are you? Is everything ready? Yes! Let's begin immediately.",
        masteryTarget: "98% punctuation accuracy",
      },
      {
        id: "5.5",
        stageNumber: "5.5",
        title: "Intermediate Punctuation (: ; ' \" - _)",
        shortTitle: "Colons & Quotes",
        description: "Colons, semicolons, quotes, hyphens, and apostrophes.",
        drillText:
          'Time: 10:30; The word "typing" is useful. This is a well-known rule. It\'s ready. User-defined settings.',
        masteryTarget: "Flawless quote balancing",
      },
      {
        id: "5.6",
        stageNumber: "5.6",
        title: "Dialogue & Quotation Mechanics",
        shortTitle: "Dialogue Prose",
        description:
          "Realistic narrative dialogue with full capitalization and punctuation.",
        drillText:
          '"Are you ready?" asked Sam. "Yes," she replied. "Let\'s begin!" "I\'m sure it\'s going to work," he added.',
        masteryTarget: "97%+ accuracy on narrative text",
      },
    ],
  },

  // ==========================================
  // UNIT 6: NUMBERS
  // ==========================================
  {
    unitId: "unit-6",
    unitNumber: 6,
    title: "Numbers & Numerical Data",
    subtitle: "Number row reaches, pairs, sequences & real data",
    icon: "fa-hashtag" as const,
    stages: [
      {
        id: "6.1",
        stageNumber: "6.1",
        title: "Number Row Left Hand (1, 2, 3, 4, 5)",
        shortTitle: "Numbers 1-5",
        description: "Left hand reaches up to the number row coordinates.",
        drillText:
          "1 2 3 4 5 15 24 35 42 123 451 234 512 11 22 33 44 55 142 531 245 135 421",
        masteryTarget: "Reach up and return without visual search",
      },
      {
        id: "6.2",
        stageNumber: "6.2",
        title: "Number Row Right Hand (6, 7, 8, 9, 0)",
        shortTitle: "Numbers 6-0",
        description: "Right hand reaches up to the number row coordinates.",
        drillText:
          "6 7 8 9 0 68 79 80 96 70 890 678 901 66 77 88 99 00 687 908 769 807 690",
        masteryTarget: "Return fingers to home row immediately",
      },
      {
        id: "6.3",
        stageNumber: "6.3",
        title: "Number Pairs (81, 94, 05, 73, 62)",
        shortTitle: "Number Pairs",
        description:
          "Paired coordinate muscle memory based on Typing.com method.",
        drillText:
          "81 18 81 81 94 49 94 94 05 50 05 05 73 37 73 73 62 26 62 62 81 94 05 73 62",
        masteryTarget: "Instant pair recognition",
      },
      {
        id: "6.4",
        stageNumber: "6.4",
        title: "Ascending, Descending & Step Sequences",
        shortTitle: "Number Sequences",
        description: "Full sequence rolls across the top row.",
        drillText:
          "1234567890 0987654321 135790 24680 102030 405060 708090 12345 67890 54321 09876",
        masteryTarget: "Smooth top row sweeping",
      },
      {
        id: "6.5",
        stageNumber: "6.5",
        title: "Real Numeric & Calendar Data",
        shortTitle: "Real Numeric Data",
        description: "Dates, prices, timestamps, and measurements.",
        drillText:
          "In 2026, on 25.08.2026, the report recorded 12,345 users with 987,654 requests across 100,000 servers at 42.75 ms latency.",
        masteryTarget: "Alphanumeric fluency",
      },
    ],
  },

  // ==========================================
  // UNIT 7: ADVANCED SYMBOLS
  // ==========================================
  {
    unitId: "unit-7",
    unitNumber: 7,
    title: "Advanced Symbols & Special Characters",
    subtitle: "Currency, math, web symbols & brackets",
    icon: "fa-bolt" as const,
    stages: [
      {
        id: "7.1",
        stageNumber: "7.1",
        title: "Currency & Percent ($ % /)",
        shortTitle: "Currency & %",
        description: "Shift reaches to the top row for commercial symbols.",
        drillText:
          "$10 $25.50 15% 99% $1,250 $450.00 / 25% discount on $99.99 = $74.99 total cost",
        masteryTarget: "Clean shift coordination",
      },
      {
        id: "7.2",
        stageNumber: "7.2",
        title: "File Paths & Slashes (/ \\)",
        shortTitle: "Slashes & Paths",
        description: "Forward slashes and backslashes in directory paths.",
        drillText:
          "/ / \\ \\ /home/user /var/log/app.log C:\\Users\\Name\\Documents\\project\\data.json",
        masteryTarget: "Accurate pinky reach to slash",
      },
      {
        id: "7.3",
        stageNumber: "7.3",
        title: "Parentheses & Enclosures (( ) [ ] { })",
        shortTitle: "Brackets & Enclosures",
        description: "Parentheses, brackets, and braces.",
        drillText:
          "() (10) (hello) (a + b) [1, 2, 3] { key: 'value' } array[index] (x * (y + z))",
        masteryTarget: "Balanced enclosure accuracy",
      },
      {
        id: "7.4",
        stageNumber: "7.4",
        title: "Mathematical Operators (+ - = * ^ < >)",
        shortTitle: "Math Operators",
        description: "Formulas, equations, and logic comparison operators.",
        drillText:
          "2 + 2 = 4; 10 * 5 = 50; 100 / 4 = 25; f(x) = x^2 - 5*x + 10; a + b >= c * 2; x != y;",
        masteryTarget: "98% mathematical precision",
      },
      {
        id: "7.5",
        stageNumber: "7.5",
        title: "Email Addresses & URLs (@ & # ~ _)",
        shortTitle: "Email & Web URLs",
        description: "Web addresses, email handles, hashtags, and underscores.",
        drillText:
          "user_name@example.com https://example.com/search?q=typing #developer & admin@eepytype.org ~/config",
        masteryTarget: "Smooth web data typing",
      },
      {
        id: "7.6",
        stageNumber: "7.6",
        title: "Code Structure & Syntax Patterns",
        shortTitle: "Code Syntax",
        description:
          "Braces, semicolons, and indentation in standard programming.",
        drillText:
          "if (x == 10) { print(x); } const calculate = (a, b) => { return (a + b) * 2; };",
        masteryTarget: "Accurate programming syntax",
      },
    ],
  },

  // ==========================================
  // UNIT 8: NUMERIC KEYPAD
  // ==========================================
  {
    unitId: "unit-8",
    unitNumber: 8,
    title: "Numeric Keypad",
    subtitle: "Keypad home row, numbers & operations",
    icon: "fa-calculator" as const,
    stages: [
      {
        id: "8.1",
        stageNumber: "8.1",
        title: "Keypad Home Row (4, 5, 6 and Enter)",
        shortTitle: "Keypad 4-5-6",
        description:
          "Establish right-hand middle finger anchor on 5 with bump.",
        drillText: "456 654 45 56 64 44 55 66 456 654 456 654 546 645 465 564",
        masteryTarget: "Keypad tactile orientation",
      },
      {
        id: "8.2",
        stageNumber: "8.2",
        title: "Top Keypad Row (7, 8, 9 and Plus)",
        shortTitle: "Keypad 7-8-9",
        description: "Reach upward from 4-5-6 home to 7-8-9 and + operator.",
        drillText:
          "789 987 78 89 97 77 88 99 789 + 987 + 789 + 789 987 879 978",
        masteryTarget: "Quick top keypad reaches",
      },
      {
        id: "8.3",
        stageNumber: "8.3",
        title: "Bottom Keypad Row (1, 2, 3 and 0)",
        shortTitle: "Keypad 1-2-3-0",
        description: "Reach down from 4-5-6 home to 1-2-3 and thumb/pinky 0.",
        drillText:
          "123 321 10 20 30 11 22 33 00 123 321 102030 302010 1230 3210",
        masteryTarget: "Consistent bottom reach recovery",
      },
      {
        id: "8.4",
        stageNumber: "8.4",
        title: "Keypad Operation Calculations (+ - * / .)",
        shortTitle: "Keypad Calculations",
        description: "Full keypad arithmetic expressions.",
        drillText:
          "25 + 10 = 35; 50 - 25 = 25; 10 * 5 = 50; 100 / 4 = 25; 12.50 + 87.50 = 100.00; 45.99 * 2 = 91.98;",
        masteryTarget: "99% numeric accuracy",
      },
    ],
  },

  // ==========================================
  // UNIT 9: ACCURACY ENGINEERING
  // ==========================================
  {
    unitId: "unit-9",
    unitNumber: 9,
    title: "Accuracy Engineering",
    subtitle: "Error awareness, perfect typing & blind typing",
    icon: "fa-bullseye" as const,
    stages: [
      {
        id: "9.1",
        stageNumber: "9.1",
        title: "Slow Perfect Typing (Zero Error Discipline)",
        shortTitle: "Zero Error Drill",
        description:
          "Deliberate slow speed targeting 100% accuracy. Speed grows from reliability.",
        drillText:
          "The goal is not to type quickly. The goal is to type correctly. Speed grows naturally from reliable movement.",
        masteryTarget: "99%+ accuracy target",
      },
      {
        id: "9.2",
        stageNumber: "9.2",
        title: "Error Recovery & Rhythm Maintenance",
        shortTitle: "Error Recovery",
        description:
          "When a typo occurs, backspace once cleanly and continue in rhythm.",
        drillText:
          "Stay calm when an error occurs. Tap backspace once cleanly. Resume the rhythm without rushing or panicking.",
        masteryTarget: "Zero backspace mashing",
      },
      {
        id: "9.3",
        stageNumber: "9.3",
        title: "Blind Touch Typing (No Visual Aid)",
        shortTitle: "Blind Typing",
        description:
          "Rely completely on finger muscle memory and tactile bumps.",
        drillText:
          "The quick brown fox jumps over the lazy dog. Touch typing requires faith in your finger coordinates.",
        masteryTarget: "Zero glances at keyboard",
      },
      {
        id: "9.4",
        stageNumber: "9.4",
        title: "Consistency Endurance (5-Sprint Average)",
        shortTitle: "Consistency Drill",
        description:
          "Maintain uniform accuracy across five consecutive 60-second sprints.",
        drillText:
          "Mastery is proven by consistency across multiple trials. Maintain high standards across every paragraph typed.",
        masteryTarget: "Under 2% variance across trials",
      },
    ],
  },

  // ==========================================
  // UNIT 10: SPEED DEVELOPMENT
  // ==========================================
  {
    unitId: "unit-10",
    unitNumber: 10,
    title: "Speed Development",
    subtitle: "Speed bursts, cruise velocity & sprint recovery",
    icon: "fa-stopwatch" as const,
    stages: [
      {
        id: "10.1",
        stageNumber: "10.1",
        title: "15-Second High Velocity Speed Bursts",
        shortTitle: "15s Speed Bursts",
        description:
          "Push finger cadence to maximum velocity for short 15-second intervals.",
        drillText:
          "the quick brown fox jumps over the lazy dog they were with us for a long time before moving on to new heights",
        masteryTarget: "Elevate peak raw burst speed",
      },
      {
        id: "10.2",
        stageNumber: "10.2",
        title: "Cruise Speed (Relaxed Sustainable Pace)",
        shortTitle: "Cruise Speed",
        description:
          "Effortless, low-tension typing pace that can be maintained for hours.",
        drillText:
          "True velocity on the keyboard is not born of frantic effort, but of relaxed economy of motion. Fingers stay poised closely.",
        masteryTarget: "Zero wrist or shoulder strain",
      },
      {
        id: "10.3",
        stageNumber: "10.3",
        title: "Sprint + Recovery Interval Cadence",
        shortTitle: "Interval Training",
        description:
          "Alternate 30 seconds fast with 30 seconds controlled cruise pace.",
        drillText:
          "Sprint fast through familiar words and then settle into controlled rhythm for complex sentences with punctuation.",
        masteryTarget: "Active speed gear shifting",
      },
      {
        id: "10.4",
        stageNumber: "10.4",
        title: "High-Frequency English at Speed",
        shortTitle: "High-Speed Words",
        description: "Common words typed at accelerated motor burst rates.",
        drillText:
          "the and for that with you this have from they there their where when what which would could should people about",
        masteryTarget: "60+ WPM benchmark",
      },
      {
        id: "10.5",
        stageNumber: "10.5",
        title: "Speed with Punctuation & Complex Syntax",
        shortTitle: "Speed & Punctuation",
        description:
          "Sustained high speed while handling capitalization and punctuation marks.",
        drillText:
          "When the work is finished, review it carefully. If something looks wrong, correct it before moving on to the next task.",
        masteryTarget: "50+ WPM at 98% accuracy",
      },
    ],
  },

  // ==========================================
  // UNIT 11: PROBLEM-KEY & ADAPTIVE PRACTICE
  // ==========================================
  {
    unitId: "unit-11",
    unitNumber: 11,
    title: "Problem-Key & Adaptive Practice",
    subtitle: "Identify weak keys, isolate & eliminate hesitation",
    icon: "fa-wrench" as const,
    stages: [
      {
        id: "11.1",
        stageNumber: "11.1",
        title: "Outer Pinky Reaches (P, Q, Z, /)",
        shortTitle: "Pinky Mastery",
        description: "Target the most common error keys on the outer edges.",
        drillText:
          "p q z / qaz pq zq qp z p quick pizza quiz people prepare papers properly popular quality quartz zero zealot",
        masteryTarget: "Eliminate pinky hesitation",
      },
      {
        id: "11.2",
        stageNumber: "11.2",
        title: "Confusing Adjacent Keys (B/V, N/M, E/R)",
        shortTitle: "Neighbor Keys",
        description:
          "Untangle adjacent coordinates that cause finger collision errors.",
        drillText:
          "bv vb nm mn er re brave member verb never number remember every river brave volume mammoth banner",
        masteryTarget: "Sharp spatial separation",
      },
      {
        id: "11.3",
        stageNumber: "11.3",
        title: "Double-Letter Rapid Fire Recovery",
        shortTitle: "Double Letters",
        description: "Rapid repeat keystrokes without hesitation pauses.",
        drillText:
          "coffee bubble little letter grass happen collect pressure address account succeed trigger official barrier shuffle",
        masteryTarget: "Clean spring recoil on repeated keys",
      },
    ],
  },

  // ==========================================
  // UNIT 12: REAL-WORLD TYPING
  // ==========================================
  {
    unitId: "unit-12",
    unitNumber: 12,
    title: "Real-World Typing",
    subtitle: "Chat, emails, forms, URLs, code & long-form writing",
    icon: "fa-briefcase" as const,
    stages: [
      {
        id: "12.1",
        stageNumber: "12.1",
        title: "Chat & Instant Messaging",
        shortTitle: "Chat Messaging",
        description:
          "Conversational cadence, contractions, and modern communication.",
        drillText:
          "Hey, are you free later? I'll send the updated file when I'm done. Can you check this for me? Sounds great, talk soon!",
        masteryTarget: "Natural conversational flow",
      },
      {
        id: "12.2",
        stageNumber: "12.2",
        title: "Professional Email Correspondence",
        shortTitle: "Email Writing",
        description: "Formal greetings, structured paragraphs, and sign-offs.",
        drillText:
          "Subject: Project Milestone Update\n\nHello Team,\n\nThe work is progressing well. I have completed the first stage and will deploy to staging today.\n\nRegards,\nAlex",
        masteryTarget: "Flawless workplace formatting",
      },
      {
        id: "12.3",
        stageNumber: "12.3",
        title: "Alphanumeric IDs & Data Entry Fields",
        shortTitle: "Data Entry IDs",
        description: "Mixed case codes, invoice numbers, and database keys.",
        drillText:
          "INV-2026-001 USR_4589 AB12CD34 KAR26-104 REF#98721-X $1,249.99 2026-08-25T19:30:00Z",
        masteryTarget: "99% alphanumeric accuracy",
      },
      {
        id: "12.4",
        stageNumber: "12.4",
        title: "Web URLs, Queries & Hyperlinks",
        shortTitle: "URLs & Queries",
        description: "HTTPS URLs, parameters, and web query strings.",
        drillText:
          "https://example.com/products?id=42&sort=desc https://eepytype.org/training/home-row?mode=mastery",
        masteryTarget: "Seamless URL typing",
      },
      {
        id: "12.5",
        stageNumber: "12.5",
        title: "Software Code & Function Definition",
        shortTitle: "Code Functions",
        description: "Real-world programming function declarations.",
        drillText:
          "function processUserInput(data = {}) { const { id, score } = data; return { success: true, timestamp: Date.now() }; }",
        masteryTarget: "Developer typing fluidity",
      },
      {
        id: "12.6",
        stageNumber: "12.6",
        title: "Long-Form Thought Articulation",
        shortTitle: "Long-Form Prose",
        description: "Extended continuous prose without looking down.",
        drillText:
          "Mastering the keyboard is one of the most compounding cognitive skills in modern computing. Every line of software compiled, every document drafted, and every idea articulated flows directly through the fingertips into the digital realm.",
        masteryTarget: "Transform keyboard into direct extension of thought",
      },
    ],
  },

  // ==========================================
  // UNIT 13: ASSESSMENTS & CERTIFICATION
  // ==========================================
  {
    unitId: "unit-13",
    unitNumber: 13,
    title: "Assessments & Certification",
    subtitle: "Bronze, Silver, Gold, Platinum & Elite milestones",
    icon: "fa-award" as const,
    stages: [
      {
        id: "13.1",
        stageNumber: "13.1",
        title: "Beginner Milestone Benchmark (Bronze)",
        shortTitle: "Bronze Assessment",
        description:
          "Evaluate home row, alphabet, space, and basic punctuation.",
        drillText:
          "The beginner touch typing journey starts with consistent posture, tactile anchor recognition on F and J, and returning fingers to the home row after every keystroke.",
        masteryTarget: "30+ WPM with 95%+ accuracy (Bronze)",
      },
      {
        id: "13.2",
        stageNumber: "13.2",
        title: "Intermediate Fluency Benchmark (Silver)",
        shortTitle: "Silver Assessment",
        description:
          "Words, sentences, opposite-hand Shift capitalization, and punctuation.",
        drillText:
          "Fluency emerges when words are typed as unified motor reflexes rather than individual letter searches. Accuracy creates the bedrock upon which high typing velocity is constructed.",
        masteryTarget: "45+ WPM with 97%+ accuracy (Silver)",
      },
      {
        id: "13.3",
        stageNumber: "13.3",
        title: "Advanced Alphanumeric Benchmark (Gold)",
        shortTitle: "Gold Assessment",
        description: "Punctuation, numbers, symbols, and technical data.",
        drillText:
          "In 2026, professional keyboarding requires fluid mastery of numbers, commercial symbols ($ % &), brackets, and complex punctuation across all 4 keyboard rows with 98% accuracy.",
        masteryTarget: "60+ WPM with 98%+ accuracy (Gold)",
      },
      {
        id: "13.4",
        stageNumber: "13.4",
        title: "Platinum Velocity Benchmark (80+ WPM)",
        shortTitle: "Platinum Benchmark",
        description:
          "High velocity continuous typing test with minimal hesitation.",
        drillText:
          "True velocity on the keyboard is not born of frantic effort, but of relaxed economy of motion. When every finger stays poised closely above its home position, high typing speeds emerge effortlessly.",
        masteryTarget: "80+ WPM with 98%+ accuracy (Platinum)",
      },
      {
        id: "13.5",
        stageNumber: "13.5",
        title: "Elite Master Benchmark (100+ WPM)",
        shortTitle: "Elite Benchmark",
        description: "Comprehensive championship-level typing challenge.",
        drillText:
          "Mastering the keyboard transforms the physical interface from a bottleneck into a seamless extension of human thought. By treating typing as an athletic instrument requiring posture, dexterity, and steady metronomic focus, one achieves elite keyboard mastery.",
        masteryTarget: "100+ WPM with 98%+ accuracy (Elite)",
      },
    ],
  },
];

const defaultUnit: TrainingUnit = TRAINING_CURRICULUM[0] ?? {
  unitId: "unit-0",
  unitNumber: 0,
  title: "Pre-Keyboarding & Setup",
  subtitle: "Keyboard anatomy, posture & home position",
  icon: "fa-info-circle" as const,
  stages: [],
};

const defaultStage: TrainingStage = defaultUnit.stages[0] ?? {
  id: "0.1",
  stageNumber: "0.1",
  title: "Keyboard Anatomy & Spatial Zones",
  shortTitle: "Keyboard Anatomy",
  description:
    "Identify QWERTY rows, modifier keys, spacebar, and index anchor positions.",
  drillText:
    "asdf jkl; qwer uiop zxcv nm,. 12345 67890 Tab Shift Enter Space Backspace",
};

const [isTrainingActive, setIsTrainingActive] = createSignal<boolean>(false);
const [activeUnit, setActiveUnit] = createSignal<TrainingUnit>(defaultUnit);
const [activeStage, setActiveStage] = createSignal<TrainingStage>(defaultStage);

export { isTrainingActive, activeUnit, activeStage };

export function selectTrainingStage(
  unit: TrainingUnit,
  stage: TrainingStage,
): void {
  setActiveUnit(unit);
  setActiveStage(stage);
  setIsTrainingActive(true);

  let clean = stage.drillText.normalize();
  clean = clean.replace(/[\u2000-\u200A\u202F\u205F\u00A0]/g, " ");
  clean = clean.replace(/ +/gm, " ");
  clean = clean.replace(/( *(\r\n|\r|\n) *)/g, "\n ");

  const words = clean.split(" ").filter((w) => w !== "");

  CustomText.setCustomText(stage.title, stage.drillText, true);
  CustomText.setMode("repeat");
  CustomText.setPipeDelimiter(false);
  CustomText.setText(words);
  CustomText.setLimitMode("word");
  CustomText.setLimitValue(words.length);
  setCustomTextIndicator({
    name: `${stage.stageNumber} ${stage.shortTitle}`,
    isLong: true,
  });
  setConfig("mode", "custom");
  restartTestEvent.dispatch();
  hideModal("TrainingModal");
}

export function advanceNextTrainingDrill(): void {
  const currentUnit = activeUnit();
  const currentStage = activeStage();
  const stageIdx = currentUnit.stages.findIndex(
    (s) => s.id === currentStage.id,
  );

  if (stageIdx !== -1 && stageIdx < currentUnit.stages.length - 1) {
    const nextStage = currentUnit.stages[stageIdx + 1];
    if (nextStage) {
      selectTrainingStage(currentUnit, nextStage);
    }
  } else {
    // Next unit
    const unitIdx = TRAINING_CURRICULUM.findIndex(
      (u) => u.unitId === currentUnit.unitId,
    );
    if (unitIdx !== -1 && unitIdx < TRAINING_CURRICULUM.length - 1) {
      const nextUnit = TRAINING_CURRICULUM[unitIdx + 1];
      if (nextUnit && nextUnit.stages.length > 0 && nextUnit.stages[0]) {
        selectTrainingStage(nextUnit, nextUnit.stages[0]);
      }
    }
  }
}

export function exitTraining(): void {
  setIsTrainingActive(false);
}
