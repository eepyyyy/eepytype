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
    unitId: "unit-0",
    unitNumber: 0,
    title: "Preliminary Instructions & Typewriter Mechanics",
    subtitle: "Anatomy, posture, home row seating & touch orientation",
    icon: "fa-info-circle",
    stages: [
      {
        id: "0.1",
        stageNumber: "0.1",
        title: "Definitions of Major Functional Parts",
        shortTitle: "Definitions of Major Functional Parts",
        description:
          "Learn the core mechanics: 1. Keyboard (Letter & figure keys), 2. Space Bar (thumb operated), 3. Shift Keys & Shift Lock (for capitals & upper symbols), 4. Backspace, 5. Cylinder / Platen & Cylinder Knobs, 6. Carriage Release, 7. Line-Space Lever (for returning carriage and advancing lines), 8. Paper Guide & Margin Stops.",
        drillText:
          "asdf jkl; asdf jkl; fj dk sl a; asdf jkl; fj dk sl a; asdf jkl; fj dk sl a;",
        masteryTarget: "Locate home keys by touch without looking",
      },
      {
        id: "0.2",
        stageNumber: "0.2",
        title: "Finding Home Row by Touch",
        shortTitle: "Finding Home Row by Touch",
        description:
          "Pass lightly over the space bar without pressing it down, let your fingers come to rest on the bottom row of keys, then move slowly up to the second row (home row). Without looking down, place: Left hand little finger on A, ring on S, middle on D, index on F; Right hand index on J, middle on K, ring on L, little finger on ;. Keep thumbs hovering over the space bar.",
        drillText:
          "a s d f j k l ; asdf jkl; asdf jkl; a s d f j k l ; asdf jkl;",
        masteryTarget: "100% blind placement on home keys",
      },
    ],
  },
  {
    unitId: "unit-1",
    unitNumber: 1,
    title: "Lesson 1: Basic Horizontal Combinations",
    subtitle:
      "Home row foundations: a-s-d-f-g and ;-l-k-j-h, alternating & scrambled",
    icon: "fa-seedling",
    stages: [
      {
        id: "1.1",
        stageNumber: "1.1",
        title: "Left Hand Horizontal Combination (a-s-d-f-g)",
        shortTitle: "Left Hand Horizontal Combination",
        description:
          "With the little finger of the left hand, strike a. With the next finger, strike s. With the next finger, strike d. With the index finger, strike f. Now extend the 'f' finger to the spare key next to it, strike g, and snap back to f. Space with thumb.",
        drillText:
          "asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg",
        masteryTarget: "99% accuracy on left hand sweep",
      },
      {
        id: "1.2",
        stageNumber: "1.2",
        title: "Right Hand Horizontal Combination (;-l-k-j-h)",
        shortTitle: "Right Hand Horizontal Combination",
        description:
          "With the little finger of the right hand, strike ; (semi). With the next finger, strike l. With the next, strike k. With index finger, strike j. Extend the 'j' finger to the spare key next to it, strike h, and snap back to j. Space with thumb.",
        drillText:
          ";lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh",
        masteryTarget: "99% accuracy on right hand sweep",
      },
      {
        id: "1.3",
        stageNumber: "1.3",
        title: "Alternating Hands Combination (asdfg ;lkjh)",
        shortTitle: "Alternating Hands Combination",
        description:
          "Alternate left hand then right hand with a single space bar tap between groups, saying aloud: asdfg space ;lkjh space asdfg space ;lkjh.",
        drillText:
          "asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh asdfg ;lkjh",
        masteryTarget: "Continuous steady rhythm across 4 lines",
      },
      {
        id: "1.4",
        stageNumber: "1.4",
        title: "Scrambled Combinations & Practice Model 1",
        shortTitle: "Scrambled Combinations & Model 1",
        description:
          "Scramble the dictation of letters across both combinations without looking at your paper. Follow stroke for stroke and space for space. Apply to genuine home row sentences.",
        drillText:
          "asdfg ;lkjh asdfg ;lkjh a lad has a glad dad; dad had half a shad salad; all lads fall as a glad lad falls; a flask has a fall; asks a lad; glass flask falls; flag has a fall",
        masteryTarget: "Type Practice Model 1 with 0 errors",
      },
    ],
  },
  {
    unitId: "unit-2",
    unitNumber: 2,
    title: "Lesson 2: Basic Diagonal Combinations",
    subtitle:
      "Diagonal reaches: aqaz, swsx, dedc, frfv, gtgb, ;p;/, lol., kik,, jujm, hyhn",
    icon: "fa-layer-group",
    stages: [
      {
        id: "2.1",
        stageNumber: "2.1",
        title: "Left Hand Diagonals (aqaz, swsx, dedc, frfv, gtgb)",
        shortTitle: "Left Hand Diagonals",
        description:
          "Little finger: a -> up to q -> back to a -> down to z -> space (aqaz). Ring finger: s -> up to w -> back to s -> down to x -> space (swsx). Middle finger: d -> up to e -> back to d -> down to c -> space (dedc). Index finger: f -> up to r -> back to f -> down to v -> space (frfv). Extended index: g -> up to t -> back to g -> down to b -> space (gtgb).",
        drillText:
          "aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb aqaz swsx dedc frfv gtgb",
        masteryTarget: "Recite and type left diagonals without hesitation",
      },
      {
        id: "2.2",
        stageNumber: "2.2",
        title: "Right Hand Diagonals (;p;/, lol., kik,, jujm, hyhn)",
        shortTitle: "Right Hand Diagonals",
        description:
          "Little finger: ; -> up to p -> back to ; -> down to / -> space (;p;/). Ring finger: l -> up to o -> back to l -> down to . -> space (lol.). Middle finger: k -> up to i -> back to k -> down to , -> space (kik,). Index finger: j -> up to u -> back to j -> down to m -> space (jujm). Extended index: h -> up to y -> back to h -> down to n -> space (hyhn).",
        drillText:
          ";p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn ;p;/ lol. kik, jujm hyhn",
        masteryTarget: "Recite and type right diagonals without hesitation",
      },
      {
        id: "2.3",
        stageNumber: "2.3",
        title: "Full Diagonal Channels & Practice Model 2",
        shortTitle: "Full Diagonal Channels & Model 2",
        description:
          "Type the full 10-channel diagonal system across both hands, alternating smoothly. Then practice applied vocabulary.",
        drillText:
          "aqaz swsx dedc frfv gtgb ;p;/ lol. kik, jujm hyhn jazz quick lazy wax zoom view much play slow time next form drop park jump quick zebra flask a lad has a glad dad; dad had half a shad salad;",
        masteryTarget: "Type Practice Model 2 with 0 errors",
      },
    ],
  },
  {
    unitId: "unit-3",
    unitNumber: 3,
    title: "Lesson 3: Typing the Alphabet",
    subtitle:
      "Full A-Z coordination, alphabetic reaches, word families & endings",
    icon: "fa-font",
    stages: [
      {
        id: "3.1",
        stageNumber: "3.1",
        title: "Full Alphabet Continuous Sequence",
        shortTitle: "Full Alphabet Continuous Sequence",
        description:
          "Type the entire alphabet from A to Z smoothly by connecting coordinate reaches without stopping: a b c d e f g h i j k l m n o p q r s t u v w x y z.",
        drillText:
          "a b c d e f g h i j k l m n o p q r s t u v w x y z abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
        masteryTarget: "Continuous error-free alphabet sequence",
      },
      {
        id: "3.2",
        stageNumber: "3.2",
        title: "Practice Model 3A \u2014 Common Words & Sentences",
        shortTitle: "Model 3A \u2014 Common Words & Sentences",
        description:
          "Type structured sentences exercising diverse reaches across the entire keyboard without looking down.",
        drillText:
          "asdfg ;lkjh asdfg ;lkjh aqaz swsx dedc frfv gtgb ;p;/ lol. kik, jujm hyhn the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs",
        masteryTarget: "Flawless Practice Model 3A execution",
      },
      {
        id: "3.3",
        stageNumber: "3.3",
        title: "Practice Model 3B \u2014 Common Word-Endings",
        shortTitle: "Model 3B \u2014 Common Word-Endings",
        description:
          "Practice high-frequency English suffixes: -ing, -tion, -ed, -er, -ment, -ness, -able.",
        drillText:
          "running marking playing mention action station wanted typed player writer payment movement goodness kindness reliable capable",
        masteryTarget: "Rapid suffix typing without hesitation",
      },
    ],
  },
  {
    unitId: "unit-4",
    unitNumber: 4,
    title: "Lesson 4: Capital Letters, Punctuation, Abbreviations & Ailments",
    subtitle:
      "Shift keys, periods, commas, colons, abbreviations & typing remedies",
    icon: "fa-keyboard",
    stages: [
      {
        id: "4.1",
        stageNumber: "4.1",
        title: "Opposite-Hand Shift Key Technique",
        shortTitle: "Opposite-Hand Shift Key Technique",
        description:
          "To capitalize a right-hand letter (J, K, L, U, I, O, P, H, N, M), hold Left Shift with left little finger. To capitalize a left-hand letter (A, S, D, F, Q, W, E, R, T, G, Z, X, C, V, B), hold Right Shift with right little finger. Hold Shift down until the stroke is fully completed.",
        drillText:
          "John Mary Paul Ruth Frank David Sarah Alice London Paris Rome New York Chicago Boston",
        masteryTarget: "100% correct opposite-hand shift execution",
      },
      {
        id: "4.2",
        stageNumber: "4.2",
        title: "Punctuation Spacing & Practice Models 4A & 4B",
        shortTitle: "Punctuation Spacing & Models 4A & 4B",
        description:
          "Rule 1: After a comma or semicolon, space once. Rule 2: After a period or colon completing a sentence, space twice. Rule 3: Do not space before punctuation marks.",
        drillText:
          "No one is so old as to think he cannot live one more year. It is work which gives flavor to life. After a comma or a semicolon, space once. After a period or colon which completes a sentence, space twice. Would you remember to shift for the colon?",
        masteryTarget: "Type Practice Model 4B with zero spacing errors",
      },
      {
        id: "4.3",
        stageNumber: "4.3",
        title: "Ailments and Remedies & Practice Model 4C",
        shortTitle: "Ailments and Remedies & Model 4C",
        description:
          "Ailment: Flying capitals -> Remedy: Hold shift down firmly until stroke completes. Ailment: Irregular left margin -> Remedy: Return carriage or press enter smoothly without slamming. Ailment: Sluggish typing -> Remedy: Strike keys with sharp staccato snap.",
        drillText:
          "Posture is important in typing. Keep your feet flat on the floor and your wrists relaxed. Sharp, light, staccato strokes produce clear and clean print. Hold the shift key down firmly until the stroke has been completed.",
        masteryTarget: "Clean, even print without flying capitals",
      },
    ],
  },
  {
    unitId: "unit-5",
    unitNumber: 5,
    title: "Lesson 5: Numerals, Punctuation and Special Characters",
    subtitle:
      "Top row numbers 1-0, fractions, currency ($), symbols (%, &, *, #, +, -)",
    icon: "fa-hashtag",
    stages: [
      {
        id: "5.1",
        stageNumber: "5.1",
        title: "Number Row Coordinate Reaches (1 through 0)",
        shortTitle: "Number Row Coordinate Reaches",
        description:
          "Reach upward from home keys to the number row. Always snap back to home position: 1 2 3 4 5 6 7 8 9 0.",
        drillText:
          "1 2 3 4 5 6 7 8 9 0 10 20 30 40 50 60 70 80 90 100 12345 67890 1945 1963 2026",
        masteryTarget: "Blind number row accuracy",
      },
      {
        id: "5.2",
        stageNumber: "5.2",
        title: "Commercial & Financial Symbols ($, %, &, #, @, *)",
        shortTitle: "Commercial & Financial Symbols",
        description:
          "Hold opposite Shift for symbols: Shift+4 = $, Shift+5 = %, Shift+7 = &, Shift+3 = #, Shift+8 = *, Shift+2 = @. Practice Models 5A & 5B.",
        drillText:
          "$10 $25.50 $100.00 15% 25% 100% #42 #99 Jones & Smith Co. rate @ 5% total = $1,250.75 1/2 1/4 3/4",
        masteryTarget: "Type symbols with 98% accuracy",
      },
      {
        id: "5.3",
        stageNumber: "5.3",
        title: "Practice Models 5C, 5D & 5E \u2014 Business Invoices & Data",
        shortTitle: "Models 5C, 5D & 5E \u2014 Business Invoices & Data",
        description:
          "Realistic business billing, dates, fractions, and mixed numerical tables.",
        drillText:
          "Invoice #4829: 25 items @ $14.50 = $362.50 less 10% discount ($36.25) net amount due $326.25 by Aug. 25, 2026. Account #9821-B: Credit $500.00; Debit $125.50; Balance $374.50.",
        masteryTarget: "Flawless invoice data typing",
      },
    ],
  },
  {
    unitId: "unit-6",
    unitNumber: 6,
    title: "Lesson 6: Paragraph Practice and Alphabetic Sentences",
    subtitle: "Pangrams, continuous prose, line return rhythm & steady cadence",
    icon: "fa-book-open",
    stages: [
      {
        id: "6.1",
        stageNumber: "6.1",
        title: "Alphabetic Sentences (Pangrams)",
        shortTitle: "Alphabetic Sentences",
        description:
          "Sentences containing every letter of the alphabet to test complete keyboard coordination.",
        drillText:
          "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. A quick movement of the enemy will jeopardize six gunboats. How vexingly quick daft zebras jump! Sphinx of black quartz judge my vow.",
        masteryTarget: "30+ WPM on pangrams with 98% accuracy",
      },
      {
        id: "6.2",
        stageNumber: "6.2",
        title: "Practice Model 6 \u2014 Continuous Paragraph Prose Flow",
        shortTitle: "Model 6 \u2014 Continuous Paragraph Prose Flow",
        description:
          "Type continuous multi-line paragraphs. When approaching the end of a line, listen for the bell or prepare for the return without interrupting the typing tempo.",
        drillText:
          "To become an expert typist you must acquire rhythm and accuracy before speed. Speed is a natural result of continued accurate practice. If you strike every key with a clean, light touch and keep your eyes on the copy, you will rapidly develop both speed and endurance. Do not look at your keyboard or your finished paper while typing.",
        masteryTarget: "Complete Practice Model 6 with under 2 errors",
      },
    ],
  },
  {
    unitId: "unit-7",
    unitNumber: 7,
    title: "Lesson 7: Skill and Speed Development (Part One)",
    subtitle:
      "Rhythmic acceleration, 1-minute bursts, error elimination & metronome flow",
    icon: "fa-stopwatch",
    stages: [
      {
        id: "7.1",
        stageNumber: "7.1",
        title: "High-Frequency Common Word Sprints",
        shortTitle: "High-Frequency Common Word Sprints",
        description:
          "Type the most common English words as unified motor bursts rather than spelling individual letters.",
        drillText:
          "the of and to a in that is was he for it with as his on be at by this have from or one had by word but not what all were we when your can said there each which she do how their if will about many then them these so some her would make like him into time has look two more write go see",
        masteryTarget: "50+ WPM on common words",
      },
      {
        id: "7.2",
        stageNumber: "7.2",
        title: "1-Minute Timed Acceleration Test",
        shortTitle: "1-Minute Timed Acceleration Test",
        description:
          "Push for maximum velocity for 60 seconds. Count words typed and calculate net WPM (Words Per Minute minus error penalties).",
        drillText:
          "True skill in typewriting is achieved when the mind dictates the thoughts directly to the fingers without conscious effort. Every word becomes a single reflex action. Practice daily with calm confidence. Relax your shoulders and keep your wrists hovering lightly.",
        masteryTarget: "45+ net WPM with 98% accuracy",
      },
    ],
  },
  {
    unitId: "unit-8",
    unitNumber: 8,
    title: "Lesson 8: Skill and Speed Development (Part Two)",
    subtitle:
      "Sustained typing endurance, 100-word sprints & fatigue management",
    icon: "fa-bolt",
    stages: [
      {
        id: "8.1",
        stageNumber: "8.1",
        title: "100-Word Endurance Sprint",
        shortTitle: "100-Word Endurance Sprint",
        description:
          "Complete a continuous 100-word paragraph maintaining uniform pace from the first word to the last.",
        drillText:
          "The art of typewriting requires not only mechanical precision but also mental stamina. When typing long documents, maintain relaxed posture and keep your breathing steady. Do not allow errors to disturb your poise. If a mistake occurs, continue smoothly without tensing up. Rhythm and relaxation are the true secrets of rapid and tireless typing. By following these principles every day, you will build remarkable speed and confidence in all your professional and personal writing.",
        masteryTarget: "50+ WPM sustained across 100 words",
      },
      {
        id: "8.2",
        stageNumber: "8.2",
        title: "Rhythm Control & Difficult Word Sequences",
        shortTitle: "Rhythm Control & Difficult Word Sequences",
        description:
          "Mastering tricky letter combinations, alternating hand jumps, and complex syllable transitions.",
        drillText:
          "extraordinary communication international institutional philosophical psychological administrative comprehensive responsibility technological performance specification infrastructure configuration administration",
        masteryTarget: "Zero stumble on multi-syllable vocabulary",
      },
    ],
  },
  {
    unitId: "unit-9",
    unitNumber: 9,
    title: "Lesson 9: Business and Personal Letters",
    subtitle:
      "Formal correspondence, block/indented styles, salutations & envelopes",
    icon: "fa-envelope",
    stages: [
      {
        id: "9.1",
        stageNumber: "9.1",
        title: "Full Block Style Business Letter",
        shortTitle: "Full Block Style Business Letter",
        description:
          "In full block style, every line begins flush with the left margin. Single space within paragraphs and double space between paragraphs.",
        drillText:
          "August 25, 2026\n\nMr. Robert H. Smith\n1245 Madison Avenue\nNew York, NY 10028\n\nDear Mr. Smith:\n\nThank you for your inquiry regarding our touch typing training curriculum. We are pleased to provide you with the complete details of our ten-lesson course.\n\nOur method has been designed to build maximum typing accuracy, confidence, and speed in the shortest possible time. We look forward to working with you.\n\nSincerely yours,\nRuth Ben'Ary\nDirector of Training",
        masteryTarget: "Flawless full-block letter formatting",
      },
      {
        id: "9.2",
        stageNumber: "9.2",
        title: "Semi-Block (Indented) Style Business Letter",
        shortTitle: "Semi-Block",
        description:
          "In semi-block style, paragraph first lines are indented 5 spaces (use Tab stop at 5), while date and complimentary close are positioned at center or right.",
        drillText:
          "Dear Customer:\n     We have received your order #7892 and are pleased to inform you that your shipment has been dispatched today.\n     Should you have any questions concerning your order, please do not hesitate to contact our office.\n\nVery truly yours,\nCustomer Relations Dept.",
        masteryTarget: "Flawless semi-block letter formatting",
      },
    ],
  },
  {
    unitId: "unit-10",
    unitNumber: 10,
    title: "Lesson 10: Tricks of the Trade",
    subtitle:
      "Centering, tabulation, carbon copies, error correction & practical office skills",
    icon: "fa-award",
    stages: [
      {
        id: "10.1",
        stageNumber: "10.1",
        title: "Horizontal Centering Technique",
        shortTitle: "Horizontal Centering Technique",
        description:
          "To center a heading horizontally: move carriage to center point (40 or 50), backspace once for every two letters or spaces in the title, and then type.",
        drillText:
          "TOUCH TYPING IN TEN LESSONS\nTHE BASIC COMBINATIONS METHOD\nOFFICIAL CERTIFICATION OF PROFICIENCY",
        masteryTarget: "Perfect horizontal heading centering",
      },
      {
        id: "10.2",
        stageNumber: "10.2",
        title: "Tabular Columns and Data Entry",
        shortTitle: "Tabular Columns and Data Entry",
        description:
          "Set tab stops for clean vertical column alignment across names, quantities, and prices.",
        drillText:
          "Item No.    Description         Quantity    Unit Price    Total\n001         Keyboard Switch     50          $1.20         $60.00\n002         Keycap Set          10          $25.00        $250.00\n003         Desk Mat            5           $18.00        $90.00",
        masteryTarget: "Clean multi-column data alignment",
      },
      {
        id: "10.3",
        stageNumber: "10.3",
        title: "Final Comprehensive Master Examination",
        shortTitle: "Final Comprehensive Master Examination",
        description:
          "The ultimate test of typing proficiency covering all 10 lessons: letters, numbers, symbols, capitalization, and formatting.",
        drillText:
          "Congratulations on completing the ten lessons of touch typewriting! You have mastered the keyboard coordinate system, developed accurate finger reflexes, and learned the essential arts of professional typing. Maintain your skill through daily practice, always prioritizing accuracy over haste. Your keyboard is now an instrument of effortless creation.",
        masteryTarget: "60+ WPM at 98%+ accuracy across final exam",
      },
    ],
  },
];

const defaultUnit: TrainingUnit = TRAINING_CURRICULUM[1] ??
  TRAINING_CURRICULUM[0] ?? {
    unitId: "unit-1",
    unitNumber: 1,
    title: "Lesson 1: Basic Horizontal Combinations",
    subtitle: "Home row foundations",
    icon: "fa-seedling",
    stages: [],
  };

const defaultStage: TrainingStage = defaultUnit.stages[0] ?? {
  id: "1.1",
  stageNumber: "1.1",
  title: "Left Hand Horizontal Combination (a-s-d-f-g)",
  shortTitle: "Left Hand Horizontal Combination",
  drillText:
    "asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg",
  description:
    "With the little finger of the left hand, strike a. With the next finger, strike s. With the next finger, strike d. With the index finger, strike f.",
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
