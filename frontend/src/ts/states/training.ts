import { createSignal } from "solid-js";
import { setConfig } from "../config/setters";
import { restartTestEvent } from "../events/test";
import { setCustomTextIndicator } from "./core";
import { hideModal } from "./modals";
import * as CustomText from "../test/custom-text";
import { FaSolidIcon } from "../types/font-awesome";

export type TrainingStage = {
  id: string;
  stageNumber: string;
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
  {
    unitNumber: 1,
    unitId: "unit-1",
    title: "Lesson 1: Home Row Foundations",
    subtitle: "Basic Horizontal Combinations (a-s-d-f-g & ;-l-k-j-h)",
    icon: "fa-seedling",
    stages: [
      {
        id: "1.1",
        stageNumber: "1.1",
        title: "Left Hand Sweep (a-s-d-f-g)",
        shortTitle: "Left Hand Sweep",
        drillText:
          "asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg",
        description:
          "Strike a-s-d-f with left fingers, extend index to g, snap instantly back to f. Space with thumb.",
        masteryTarget: "99% accuracy on left hand sweep",
      },
      {
        id: "1.2",
        stageNumber: "1.2",
        title: "Right Hand Sweep (;-l-k-j-h)",
        shortTitle: "Right Hand Sweep",
        drillText:
          ";lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh",
        description:
          "Strike ;-l-k-j with right fingers, extend index to h, snap instantly back to j. Space with thumb.",
        masteryTarget: "99% accuracy on right hand sweep",
      },
      {
        id: "1.3",
        stageNumber: "1.3",
        title: "Alternating Hands Cadence",
        shortTitle: "Alternating Cadence",
        drillText:
          "asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh",
        description:
          "Alternate left then right hand with steady thumb spacing. Hold metronomic rhythm.",
        masteryTarget: "Steady uninterrupted flow across 4 lines",
      },
      {
        id: "1.4",
        stageNumber: "1.4",
        title: "Scrambled Home Row Sentences",
        shortTitle: "Home Row Sentences",
        drillText:
          "a lad has a glad dad; dad had half a shad salad; all lads fall as a glad lad falls; a flask has a fall; asks a lad; glass flask falls; flag has a fall; dad adds a flag;",
        description:
          "Real home row words and sentences without looking at keys or screen.",
        masteryTarget: "98%+ accuracy on pure home row words",
      },
    ],
  },
  {
    unitNumber: 2,
    unitId: "unit-2",
    title: "Lesson 2: Diagonal Reaches",
    subtitle: "Full 10-Channel Vertical Reaches across all 3 letter rows",
    icon: "fa-layer-group",
    stages: [
      {
        id: "2.1",
        stageNumber: "2.1",
        title: "Left Hand Diagonals (aqaz, swsx, dedc, frfv, gtgb)",
        shortTitle: "Left Diagonals",
        drillText:
          "aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb",
        description:
          "Reach up and out, down and in. Pinky: aqaz, Ring: swsx, Middle: dedc, Index: frfv, Ext. Index: gtgb.",
        masteryTarget: "Flawless left diagonal channel muscle memory",
      },
      {
        id: "2.2",
        stageNumber: "2.2",
        title: "Right Hand Diagonals (;p;/, lol., kik,, jujm, hyhn)",
        shortTitle: "Right Diagonals",
        drillText:
          ";p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn",
        description:
          "Reach up and in, down and out. Pinky: ;p;/, Ring: lol., Middle: kik,, Index: jujm, Ext. Index: hyhn.",
        masteryTarget: "Flawless right diagonal channel muscle memory",
      },
      {
        id: "2.3",
        stageNumber: "2.3",
        title: "Multi-Row Transition Words",
        shortTitle: "Diagonal Vocabulary",
        drillText:
          "jazz quick lazy wax zoom view much play slow time next form drop park jump quick zebra flask build track sweet voice power claim",
        description:
          "Integrate diagonal reaches into continuous vocabulary across top, home, and bottom rows.",
        masteryTarget: "98%+ accuracy across 3-row vocabulary",
      },
    ],
  },
  {
    unitNumber: 3,
    unitId: "unit-3",
    title: "Lesson 3: Complete Alphabet & Suffixes",
    subtitle: "Continuous A-Z sequence & high-frequency word endings",
    icon: "fa-font",
    stages: [
      {
        id: "3.1",
        stageNumber: "3.1",
        title: "A to Z Continuous Sequence",
        shortTitle: "A-Z Sequence",
        drillText:
          "a b c d e f g h i j k l m n o p q r s t u v w x y z abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
        description:
          "Connect all 26 letters in forward and reverse sequence without pauses.",
        masteryTarget: "Zero hunting pause on any letter",
      },
      {
        id: "3.2",
        stageNumber: "3.2",
        title: "High-Frequency Suffix Motor Chunks",
        shortTitle: "Suffix Chunks",
        drillText:
          "running marking playing mention action station wanted typed player writer payment movement goodness kindness reliable capable",
        description:
          "Automate common English word terminations (-ing, -tion, -ed, -er, -ment, -ness, -able).",
        masteryTarget: "45+ WPM on suffix chunks",
      },
      {
        id: "3.3",
        stageNumber: "3.3",
        title: "Alphabetical Word Chains",
        shortTitle: "A-Z Word Chains",
        drillText:
          "ask bed cat dog ear fox gun hat ice jam kid log man net owl pen qua red sun top urn van wax yet zip",
        description:
          "Words progressing systematically through each letter of the alphabet.",
        masteryTarget: "98%+ accuracy across all letters",
      },
    ],
  },
  {
    unitNumber: 4,
    unitId: "unit-4",
    title: "Lesson 4: Shift Keys & Mechanics",
    subtitle: "Opposite Shift Key coordination, punctuation spacing & cadence",
    icon: "fa-keyboard",
    stages: [
      {
        id: "4.1",
        stageNumber: "4.1",
        title: "Opposite-Hand Shift Coordination",
        shortTitle: "Shift Coordination",
        drillText:
          "John Mary Paul Ruth Frank David Sarah Alice London Paris Rome New York Chicago Boston Tokyo Berlin Madrid Cairo Sydney Toronto",
        description:
          "Hold left Shift for right-hand keys; hold right Shift for left-hand keys. Never use the same hand for shift and letter.",
        masteryTarget: "100% correct opposite-shift execution",
      },
      {
        id: "4.2",
        stageNumber: "4.2",
        title: "Punctuation Spacing Discipline",
        shortTitle: "Punctuation Rules",
        drillText:
          "No one is so old as to think he cannot live one more year. It is work which gives flavor to life. After a comma, space once. After a period, space twice. Are you practicing with steady rhythm?",
        description:
          "Master automatic spacing: space once after commas, space twice after full stops.",
        masteryTarget: "Zero punctuation spacing defects",
      },
      {
        id: "4.3",
        stageNumber: "4.3",
        title: "Staccato Stroke Mastery",
        shortTitle: "Staccato Touch",
        drillText:
          "Posture is important in typing. Keep your feet flat on the floor and your wrists relaxed. Sharp, light, staccato strokes produce clear, fast, and clean typing.",
        description:
          "Strike keys with a sharp staccato snap. Keep wrists hovering loosely without resting on the table.",
        masteryTarget: "Clean, light, relaxed touch",
      },
    ],
  },
  {
    unitNumber: 5,
    unitId: "unit-5",
    title: "Lesson 5: Numbers & Currency Symbols",
    subtitle: "Top row reach integration (1-0, $, %, &, #, @, *)",
    icon: "fa-hashtag",
    stages: [
      {
        id: "5.1",
        stageNumber: "5.1",
        title: "Top Row Numbers (1 through 0)",
        shortTitle: "Number Row",
        drillText:
          "1 2 3 4 5 6 7 8 9 0 10 20 30 40 50 60 70 80 90 100 12345 67890 1945 1963 2026 8492 7301",
        description:
          "Reach up from home keys to the top number row. Return finger immediately to home position.",
        masteryTarget: "Blind number row reach confidence",
      },
      {
        id: "5.2",
        stageNumber: "5.2",
        title: "Commercial Symbols & Currency",
        shortTitle: "Symbols & Currency",
        drillText:
          "$10.00 $25.50 $100.00 15% 25% 100% #42 #99 Jones & Smith Co. rate @ 5% total = $1,250.75 discount = 10% net = $1,125.68",
        description:
          "Hold opposite Shift for symbols: $ (Shift+4), % (Shift+5), & (Shift+7), # (Shift+3), @ (Shift+2).",
        masteryTarget: "97%+ accuracy on symbol combinations",
      },
      {
        id: "5.3",
        stageNumber: "5.3",
        title: "Dense Alphanumeric Invoices",
        shortTitle: "Dense Alphanumerics",
        drillText:
          "Order #4829: 25 items @ $14.50 = $362.50 less 10% discount ($36.25); Invoice #8921 total $1,450.00 due on 12/15/2026 for Dept #07.",
        description:
          "High-density alphanumeric typing with rapid shifts between numbers, letters, and punctuation.",
        masteryTarget: "Flawless invoice data typing",
      },
    ],
  },
  {
    unitNumber: 6,
    unitId: "unit-6",
    title: "Lesson 6: Paragraph Flow & Pangrams",
    subtitle: "Metronomic rhythm, pangrams & continuous prose stamina",
    icon: "fa-book-open",
    stages: [
      {
        id: "6.1",
        stageNumber: "6.1",
        title: "All-Letter Pangram Workouts",
        shortTitle: "Pangram Drills",
        drillText:
          "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. A quick movement of the enemy will jeopardize six gunboats. How vexingly quick daft zebras jump! Sphinx of black quartz judge my vow.",
        description:
          "Pangrams containing all 26 letters of the English alphabet. Maintain continuous cadence.",
        masteryTarget: "40+ WPM on pangrams with 98% accuracy",
      },
      {
        id: "6.2",
        stageNumber: "6.2",
        title: "Continuous Prose Rhythm Flow",
        shortTitle: "Continuous Prose",
        drillText:
          "To become an expert typist you must acquire rhythm and accuracy before speed. Speed is a natural result of continued accurate practice. If you strike every key with a clean, light touch and keep your eyes on the copy, you will rapidly develop both speed and endurance.",
        description:
          "Continuous multi-line paragraph typing without stopping for mistakes or glancing away.",
        masteryTarget: "Sustained 45+ WPM with under 2 mistakes",
      },
    ],
  },
  {
    unitNumber: 7,
    unitId: "unit-7",
    title: "Lesson 7: Pinky & Ring Finger Conditioning",
    subtitle: "Isolation workouts for weak fingers (Q, Z, P, /, W, X, O, .)",
    icon: "fa-hand-sparkles",
    stages: [
      {
        id: "7.1",
        stageNumber: "7.1",
        title: "Left Pinky & Ring Isolation (Q, Z, W, X)",
        shortTitle: "Left Pinky & Ring",
        drillText:
          "aqaz swsx qaz wsx zaza xaxa quiz quit quiet zero zone zinc quick wax wrap write wrist xylem zero zeal zest zigzag quote query quest quartz squawk squeak",
        description:
          "Strengthen left pinky and ring fingers. Eliminate hesitation on q, z, w, and x reaches.",
        masteryTarget: "98%+ accuracy on left pinky drills",
      },
      {
        id: "7.2",
        stageNumber: "7.2",
        title: "Right Pinky & Ring Isolation (P, /, O, L, .)",
        shortTitle: "Right Pinky & Ring",
        drillText:
          ";p;/ lol. pop plot pool loop polo plump polar pompous pulpit pupil pillow poison policy populate postpone propel prospect proxy pull puppy plot",
        description:
          "Condition right pinky and ring fingers for rapid p, o, l, period, and semicolon coordination.",
        masteryTarget: "98%+ accuracy on right pinky drills",
      },
      {
        id: "7.3",
        stageNumber: "7.3",
        title: "Dual-Pinky Cross-Keyboard Acrobats",
        shortTitle: "Pinky Crossfire",
        drillText:
          "quartz zip zero pizza prize puzzle plaza pique prequel opaque qualify sequel quizmaster jeopardy topaz panzer paprika phosphor paparazzi plaza",
        description:
          "High-intensity words combining left and right pinky reaches simultaneously.",
        masteryTarget: "40+ WPM on dual pinky vocabulary",
      },
    ],
  },
  {
    unitNumber: 8,
    unitId: "unit-8",
    title: "Lesson 8: Tricky Bigrams & Awkward Jumps",
    subtitle: "Same-finger jumps, reverse rolls & anti-muscle-memory hurdles",
    icon: "fa-bolt",
    stages: [
      {
        id: "8.1",
        stageNumber: "8.1",
        title: "Same-Finger Jump Workouts (ED, CE, UN, NY, RV)",
        shortTitle: "Same-Finger Jumps",
        drillText:
          "decide deceive exceed excel under unique runway nylon curve carve serve nerve verify reverse derive direct deduct detect defect reduce deduce",
        description:
          "Overcome the hardest same-finger reaches where one finger must jump across multiple tiers.",
        masteryTarget: "Zero hesitation on same-finger transitions",
      },
      {
        id: "8.2",
        stageNumber: "8.2",
        title: "Awkward Lateral Strains & Roll Reversals",
        shortTitle: "Awkward Bigrams",
        drillText:
          "minimum monopoly pulp opinion union onion canyon autumn column rhythm physical symptom hymn system myth gypsy crypt cycle flyby lynx rhythm",
        description:
          "Tricky letter clusters with repeated single-hand patterns and lateral finger reaches.",
        masteryTarget: "Fluid tempo on awkward syllable clusters",
      },
      {
        id: "8.3",
        stageNumber: "8.3",
        title: "High-Collision Tongue Twisters",
        shortTitle: "Finger Twisters",
        drillText:
          "six slippery snails slid slowly southward; Peter Piper picked a peck of pickled peppers; which wristwatches are Swiss wristwatches; unique New York; flash message froth",
        description:
          "Complex acoustic and physical finger twisters designed to test finger independence.",
        masteryTarget: "50+ WPM without finger entanglement",
      },
    ],
  },
  {
    unitNumber: 9,
    unitId: "unit-9",
    title: "Lesson 9: Code & Developer Syntax",
    subtitle:
      "Brackets, braces, operators, boolean logic & symbols ({}, [], =>, &&, ||)",
    icon: "fa-code",
    stages: [
      {
        id: "9.1",
        stageNumber: "9.1",
        title: "Enclosures & Paired Brackets ({}, [], (), <>, \"\", '')",
        shortTitle: "Brackets & Enclosures",
        drillText:
          'const items = [1, 2, 3]; function getKeys({ id, name }: User): string[] { return ["#" + id, `@${name}`]; } if (count > 0 && total <= 100) { items.push(total); }',
        description:
          "Automate quick reach to curly braces, square brackets, parentheses, quotes, and backticks.",
        masteryTarget: "98%+ accuracy on bracketed code syntax",
      },
      {
        id: "9.2",
        stageNumber: "9.2",
        title: "Logic Operators & Arrows (=>, !==, ===, &&, ||, +=)",
        shortTitle: "Operators & Logic",
        drillText:
          "const filterData = (arr: number[]) => arr.filter((x) => x !== null && x >= 0 || x === -1); count += 1; isValid = (status === 200 && !hasError);",
        description:
          "Rapid typing of programming assignment, arrow functions, equality, and logical operators.",
        masteryTarget: "Fluid operator syntax typing",
      },
      {
        id: "9.3",
        stageNumber: "9.3",
        title: "CLI Commands & Regex Syntax",
        shortTitle: "CLI & Regex Paths",
        drillText:
          "git commit -m \"fix: resolve /api/v1/auth/token path\" --no-verify; npm run build:prod -- --config ./vite.config.ts; sed -E 's/([a-z]+)@([0-9]+)/\\1_\\2/g'",
        description:
          "Developer command-line arguments, file paths, flags, pipes, and regular expressions.",
        masteryTarget: "Zero error rate on CLI syntax",
      },
    ],
  },
  {
    unitNumber: 10,
    unitId: "unit-10",
    title: "Lesson 10: Speed Sprints & Endurance",
    subtitle: "100-word sprints, rapid vocabulary bursts & master benchmarks",
    icon: "fa-trophy",
    stages: [
      {
        id: "10.1",
        stageNumber: "10.1",
        title: "1-Minute High-Velocity Sprint",
        shortTitle: "1-Min Speed Burst",
        drillText:
          "the of and to a in that is was he for it with as his on be at by this have from or one had by word but not what all were we when your can said there each which she do how their if will about many then them these so some her would make like him into time has look two more write go see",
        description:
          "Push for maximum raw velocity on top 100 most common English words.",
        masteryTarget: "60+ WPM raw velocity",
      },
      {
        id: "10.2",
        stageNumber: "10.2",
        title: "100-Word Endurance Test",
        shortTitle: "100-Word Endurance",
        drillText:
          "The art of typewriting requires not only mechanical precision but also mental stamina. When typing long documents, maintain relaxed posture and keep your breathing steady. Do not allow errors to disturb your poise. If a mistake occurs, continue smoothly without tensing up. Rhythm and relaxation are the true secrets of rapid and tireless typing. By following these principles every day, you will build remarkable speed and confidence in all your professional and personal writing.",
        description:
          "Sustained 100-word sprint maintaining uniform cadence and zero muscle fatigue.",
        masteryTarget: "55+ WPM with 98%+ accuracy across 100 words",
      },
      {
        id: "10.3",
        stageNumber: "10.3",
        title: "Master Certification Exam",
        shortTitle: "Master Exam",
        drillText:
          "Congratulations on completing the ten comprehensive lessons of touch typing mastery! You have strengthened your weak fingers, conquered awkward bigrams, automated complex developer syntax, and established effortless speed. Practice daily with calm confidence, always prioritizing accuracy over haste. Your keyboard is now an extension of your mind.",
        description:
          "Comprehensive graduation examination combining letters, numbers, punctuation, and complex reaches.",
        masteryTarget: "65+ WPM at 99%+ accuracy",
      },
    ],
  },
];

const defaultUnit: TrainingUnit = TRAINING_CURRICULUM[0] ?? {
  unitId: "unit-1",
  unitNumber: 1,
  title: "Lesson 1: Home Row Foundations",
  subtitle: "Basic Horizontal Combinations",
  icon: "fa-seedling",
  stages: [],
};

const defaultStage: TrainingStage = defaultUnit.stages[0] ?? {
  id: "1.1",
  stageNumber: "1.1",
  title: "Left Hand Sweep (a-s-d-f-g)",
  shortTitle: "Left Hand Sweep",
  drillText:
    "asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg",
  description:
    "Strike a-s-d-f with left fingers, extend index to g, snap instantly back to f. Space with thumb.",
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
