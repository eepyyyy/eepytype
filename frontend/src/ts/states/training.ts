import { createSignal } from "solid-js";
import { setConfig } from "../config/setters";
import { restartTestEvent } from "../events/test";
import { setCustomTextIndicator } from "./core";
import { hideModal } from "./modals";
import * as CustomText from "../test/custom-text";
import { FaSolidIcon } from "../types/font-awesome";

export type TrainingStage = {
  id: string;
  stageNumber: string; // e.g. "1.1", "2.2"
  title: string;
  shortTitle: string;
  drillText: string;
  description: string;
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
    unitId: "unit-1",
    unitNumber: 1,
    title: "Mastering the Home Row",
    subtitle: "Finger placement & anchor key reaches",
    icon: "fa-seedling" as const,
    stages: [
      {
        id: "1.1",
        stageNumber: "1.1",
        title: "Positioning & Anchors",
        shortTitle: "Positioning",
        description:
          "Left index on F, right index on J. Thumbs rest on spacebar.",
        drillText:
          "j j j f f f j f j f fj jf j f jf jj ff jf jf j j f f jj ff jf fj j j f f j f jf fj",
      },
      {
        id: "1.2",
        stageNumber: "1.2",
        title: "Home Row Core",
        shortTitle: "Home Row",
        description: "Practice D, K, S, and L keys without looking down.",
        drillText:
          "fj fj dk dk sl sl a; a; fjdk sla; gh gh asdf jkl; asdf jkl; sad dad lad ask fall flask salad",
      },
      {
        id: "1.3",
        stageNumber: "1.3",
        title: "Top Row Index & Middle",
        shortTitle: "Top Row Reaches",
        description:
          "Reaches for U, R, E, and I keys returning to home position.",
        drillText:
          "u r k u r k u r u r fur jug kid run red rid due die ire dirk rue rude duel duke fire ride fried",
      },
      {
        id: "1.4",
        stageNumber: "1.4",
        title: "Bottom Row Index & Middle",
        shortTitle: "Bottom Row",
        description: "Reaches for C, G, and N keys returning to home position.",
        drillText:
          "c g n can gun gin dig ice nice rain gain cane grain ring cling dance grace cage race curd grind",
      },
      {
        id: "1.5",
        stageNumber: "1.5",
        title: "Speed Drill & Review",
        shortTitle: "Speed Drill",
        description: "High-frequency word combinations on learned reaches.",
        drillText:
          "j f u r k d e i c g n run far duck ring fire dine grain crane duke cage curb grind dance curd",
      },
      {
        id: "1.6",
        stageNumber: "1.6",
        title: "Outer Reaches & Punctuation",
        shortTitle: "Outer Keys & Punc",
        description: "T, S, L, O, B, A, comma and period keys.",
        drillText:
          "This, that. Here, there. Small, fast, accurate. Step by step, word by word. Practice daily, type cleanly.",
      },
      {
        id: "1.7",
        stageNumber: "1.7",
        title: "Pinky Keys & Pangram Milestone",
        shortTitle: "Full Pangram",
        description: "Full alphabet coordination with the classic pangram.",
        drillText:
          "the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump",
      },
    ],
  },
  {
    unitId: "unit-2",
    unitNumber: 2,
    title: "Word & Sentence Fluency",
    subtitle: "High frequency words, capitalization & punctuation",
    icon: "fa-layer-group" as const,
    stages: [
      {
        id: "2.1",
        stageNumber: "2.1",
        title: "Home Row Word Mastery",
        shortTitle: "Home Row Words",
        description:
          "Fluid English vocabulary constructed solely from home row keys.",
        drillText:
          "sad ask all fall flask dad lad salad add salsa fall salads dads flasks flask falls adds sad lad all salad",
      },
      {
        id: "2.2",
        stageNumber: "2.2",
        title: "Top & Bottom Row Words",
        shortTitle: "Multi-Row Words",
        description:
          "Reaching between top, home, and bottom rows with smooth transitions.",
        drillText:
          "quip wire tree root pour write power quiet route report peer quote purity writer pretty zippy clap valley",
      },
      {
        id: "2.3",
        stageNumber: "2.3",
        title: "Top 50 English Words",
        shortTitle: "Common Words",
        description: "The 50 most frequently used English vocabulary words.",
        drillText:
          "the of and a to in is you that it he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said",
      },
      {
        id: "2.4",
        stageNumber: "2.4",
        title: "Opposite-Hand Shift Key Capitalization",
        shortTitle: "Capitalization",
        description:
          "Use left Shift for right-hand keys and right Shift for left-hand keys.",
        drillText:
          "The Quick Brown Fox Jumps Over The Lazy Dog. Typing Is A Valuable Skill. Practice Creates Precision And Speed.",
      },
      {
        id: "2.5",
        stageNumber: "2.5",
        title: "Dialogue & Punctuation Marks",
        shortTitle: "Dialogue & Quotes",
        description: "Quotes, apostrophes, colons, and question marks.",
        drillText:
          "What's that over there? \"I haven't seen it yet,\" she replied. Let's check the student's report: it's accurate and on time.",
      },
      {
        id: "2.6",
        stageNumber: "2.6",
        title: "Sentence Cadence & Rhythm",
        shortTitle: "Flow & Rhythm",
        description:
          "Develop steady metronome cadence without hesitation pauses.",
        drillText:
          "Touch typing is an automatic sensory habit where muscles remember key locations. By avoiding looking at your hands, your eyes stay focused on the text ahead.",
      },
    ],
  },
  {
    unitId: "unit-3",
    unitNumber: 3,
    title: "Numbers & Special Symbols",
    subtitle: "Number row, commercial symbols & operators",
    icon: "fa-bolt" as const,
    stages: [
      {
        id: "3.1",
        stageNumber: "3.1",
        title: "Number Row Left Hand (1-5)",
        shortTitle: "Numbers 1-5",
        description: "Left hand reaches to the top number row.",
        drillText:
          "1 2 3 4 5 15 24 35 42 123 451 234 512 11 22 33 44 55 142 531 245 135 421 352 14 25 31 42 53",
      },
      {
        id: "3.2",
        stageNumber: "3.2",
        title: "Number Row Right Hand (6-0)",
        shortTitle: "Numbers 6-0",
        description: "Right hand reaches to the top number row.",
        drillText:
          "6 7 8 9 0 68 79 80 96 70 890 678 901 66 77 88 99 00 687 908 769 807 690 789 67890 09876",
      },
      {
        id: "3.3",
        stageNumber: "3.3",
        title: "Commercial Symbols ($ % & @ # /)",
        shortTitle: "Commercial Symbols",
        description: "Shift symbols used in currency, emails, and commerce.",
        drillText:
          "The total cost was $150.00 with a 15% discount. Send the confirmation to admin@eepytype.org & support#104 / dept-alpha.",
      },
      {
        id: "3.4",
        stageNumber: "3.4",
        title: "Mathematical Operators (+ - = * ^ < >)",
        shortTitle: "Math Operators",
        description:
          "Calculations, comparison operators, and algebraic expressions.",
        drillText:
          "f(x) = x^2 + 2*x - 5; if (a + b >= c * 10) { return (x > y) ? x : y; } total_sum = 100 - 25 + 50 * 2 = 175;",
      },
      {
        id: "3.5",
        stageNumber: "3.5",
        title: "Brackets & Enclosures (( ) [ ] { })",
        shortTitle: "Brackets & Arrays",
        description: "Parentheses, square brackets, and curly braces.",
        drillText:
          "function init(config = {}) { const data = [1, 2, [3, 4]]; return { status: 200, items: data.map((item) => (item * 2)) }; }",
      },
    ],
  },
  {
    unitId: "unit-4",
    unitNumber: 4,
    title: "Developer & Code Syntax",
    subtitle: "Real-world HTML, CSS, JS, Python, and Git",
    icon: "fa-code" as const,
    stages: [
      {
        id: "4.1",
        stageNumber: "4.1",
        title: "HTML Structure & Tags",
        shortTitle: "HTML Tags",
        description: "Tags, attributes, and element hierarchies.",
        drillText:
          '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Eepytype</title></head><body><main class="container"><h1 id="title">Touch Typing</h1></main></body></html>',
      },
      {
        id: "4.2",
        stageNumber: "4.2",
        title: "CSS Selectors & Rules",
        shortTitle: "CSS Rules",
        description: "Classes, braces, colons, and semicolon formatting.",
        drillText:
          ".card { display: flex; flex-direction: column; justify-content: space-between; padding: 1.5rem; border-radius: 0.75rem; background-color: #1e1e2e; transition: all 150ms ease-in-out; }",
      },
      {
        id: "4.3",
        stageNumber: "4.3",
        title: "JavaScript & TypeScript Functions",
        shortTitle: "JS / TS Functions",
        description: "Arrow functions, generics, interfaces, and async calls.",
        drillText:
          "export async function fetchLibraryData(endpoint: string): Promise<PracticeTextEntry[]> { const response = await fetch(endpoint); if (!response.ok) throw new Error(`HTTP error: ${response.status}`); return await response.json(); }",
      },
      {
        id: "4.4",
        stageNumber: "4.4",
        title: "Python Indentation & Dictionaries",
        shortTitle: "Python Syntax",
        description: "Indented blocks, lists, and dictionary returns.",
        drillText:
          "def process_metrics(scores: list[float]) -> dict[str, float]: return { 'average': sum(scores) / len(scores), 'peak': max(scores), 'filtered': [s for s in scores if s >= 90.0] }",
      },
      {
        id: "4.5",
        stageNumber: "4.5",
        title: "Git & Terminal Commands",
        shortTitle: "Git Workflow",
        description: "CLI flags, branch operations, and command chaining.",
        drillText:
          'git checkout -b feature/training-drills && git add . && git commit -m "feat: implement interactive training timeline" && git push origin feature/training-drills',
      },
    ],
  },
  {
    unitId: "unit-5",
    unitNumber: 5,
    title: "Speed & Endurance Mastery",
    subtitle: "Trigrams, double letters & benchmark tests",
    icon: "fa-stopwatch" as const,
    stages: [
      {
        id: "5.1",
        stageNumber: "5.1",
        title: "Double-Letter Rapid Fire",
        shortTitle: "Double Letters",
        description: "High speed muscle recovery on repeated keys.",
        drillText:
          "coffee bubble little letter grass happen collect pressure address account succeed trigger official barrier shuffle grammar immediate classic blossom corridor difficult banner",
      },
      {
        id: "5.2",
        stageNumber: "5.2",
        title: "Frequent English Trigrams",
        shortTitle: "Trigram Combos",
        description:
          "The most common 3-letter sequences in the English language.",
        drillText:
          "the and ing ion ent tio for nde has nce tis oft men ead res sta are ear her ate pro con int all ter est ers out per eve are his com ist",
      },
      {
        id: "5.3",
        stageNumber: "5.3",
        title: "1-Minute Speed Benchmark",
        shortTitle: "1-Min Benchmark",
        description: "Sustained accuracy and speed benchmark prose.",
        drillText:
          "True velocity on the keyboard is not born of frantic effort, but of relaxed economy of motion. When every finger stays poised closely above its home position and strikes each key with clean mechanical rhythm, high typing speeds emerge effortlessly and accurately without mental strain.",
      },
      {
        id: "5.4",
        stageNumber: "5.4",
        title: "3-Minute Endurance Marathon",
        shortTitle: "Endurance Marathon",
        description: "Long sustained typing test measuring focus and stamina.",
        drillText:
          "Mastering the keyboard is one of the most compounding cognitive skills in modern computing. Every document written, every line of software compiled, and every idea articulated flows directly through the fingertips. By treating typing as an athletic instrument requiring posture, dexterity, and steady metronomic focus, one transforms the physical keyboard from a bottleneck into a seamless extension of human thought.",
      },
    ],
  },
];

const defaultUnit: TrainingUnit = TRAINING_CURRICULUM[0] ?? {
  unitId: "unit-1",
  unitNumber: 1,
  title: "Mastering the Home Row",
  subtitle: "Finger placement & anchor key reaches",
  icon: "fa-seedling" as const,
  stages: [],
};

const defaultStage: TrainingStage = defaultUnit.stages[0] ?? {
  id: "1.1",
  stageNumber: "1.1",
  title: "Positioning & Anchors",
  shortTitle: "Positioning",
  description: "Left index on F, right index on J. Thumbs rest on spacebar.",
  drillText:
    "j j j f f f j f j f fj jf j f jf jj ff jf jf j j f f jj ff jf fj j j f f j f jf fj",
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
