import json
from pathlib import Path

# Load extracted curriculum
with open("ben_ary_ten_lessons_curriculum.json", "r", encoding="utf-8") as f:
    curriculum = json.load(f)

unit_icons = {
    0: "fa-info-circle",
    1: "fa-seedling",
    2: "fa-layer-group",
    3: "fa-font",
    4: "fa-keyboard",
    5: "fa-hashtag",
    6: "fa-book-open",
    7: "fa-stopwatch",
    8: "fa-bolt",
    9: "fa-envelope",
    10: "fa-award",
}

ts_units = []

for u in curriculum["units"]:
    stages_ts = []
    for l in u["lessons"]:
        # generate short title
        short_t = l["title"].split("(")[0].replace("Practice Model", "Model").strip()
        stages_ts.append({
            "id": l["lessonId"],
            "stageNumber": l["lessonNumber"],
            "title": l["title"],
            "shortTitle": short_t,
            "description": l["instructions"],
            "drillText": l["drillText"],
            "masteryTarget": l["masteryCriteria"]
        })
    
    ts_units.append({
        "unitId": u["unitId"],
        "unitNumber": u["unitNumber"],
        "title": f"Lesson {u['unitNumber']}: {u['title']}" if u['unitNumber'] > 0 else u['title'],
        "subtitle": u["subtitle"],
        "icon": unit_icons.get(u["unitNumber"], "fa-book"),
        "stages": stages_ts
    })

# Format as TypeScript code
ts_code = '''import { createSignal } from "solid-js";
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

export const TRAINING_CURRICULUM: TrainingUnit[] = ''' + json.dumps(ts_units, indent=2) + ''';

const defaultUnit: TrainingUnit = TRAINING_CURRICULUM[1] ?? TRAINING_CURRICULUM[0];
const defaultStage: TrainingStage = defaultUnit.stages[0];

const [isTrainingActive, setIsTrainingActive] = createSignal<boolean>(false);
const [activeUnit, setActiveUnit] = createSignal<TrainingUnit>(defaultUnit);
const [activeStage, setActiveStage] = createSignal<TrainingStage>(defaultStage);

export { isTrainingActive, activeUnit, activeStage };

export function selectTrainingStage(unit: TrainingUnit, stage: TrainingStage): void {
  setActiveUnit(unit);
  setActiveStage(stage);
  setIsTrainingActive(true);

  let clean = stage.drillText.normalize();
  clean = clean.replace(/[\\u2000-\\u200A\\u202F\\u205F\\u00A0]/g, " ");
  clean = clean.replace(/ +/gm, " ");
  clean = clean.replace(/( *(\\r\\n|\\r|\\n) *)/g, "\\n ");

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
  const stageIdx = currentUnit.stages.findIndex((s) => s.id === currentStage.id);

  if (stageIdx !== -1 && stageIdx < currentUnit.stages.length - 1) {
    const nextStage = currentUnit.stages[stageIdx + 1];
    if (nextStage) {
      selectTrainingStage(currentUnit, nextStage);
    }
  } else {
    const unitIdx = TRAINING_CURRICULUM.findIndex((u) => u.unitId === currentUnit.unitId);
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
'''

# Write to frontend/src/ts/states/training.ts
training_ts_path = Path("frontend/src/ts/states/training.ts")
training_ts_path.write_text(ts_code, encoding="utf-8")
print(f"Updated {training_ts_path} with {len(ts_units)} lessons from Ben'Ary book.")

# Also update frontend/static/practice/practice_texts.json
practice_path = Path("frontend/static/practice/practice_texts.json")
if practice_path.exists():
    with open(practice_path, "r", encoding="utf-8") as f:
        practice_data = json.load(f)
    
    # Filter out existing ben-ary / training entries if any
    filtered = [p for p in practice_data if not p.get("id", "").startswith("benary-")]
    
    new_entries = []
    for u in ts_units:
        for s in u["stages"]:
            new_entries.append({
                "id": f"benary-{s['id']}",
                "title": f"Lesson {u['unitNumber']}.{s['stageNumber']}: {s['title']}",
                "category": "training",
                "difficulty": "medium" if u["unitNumber"] > 4 else "easy",
                "text": s["drillText"],
                "unit": u["unitNumber"],
                "unitTitle": u["title"],
                "tags": ["touch-typing", f"lesson-{u['unitNumber']}", "ben-ary-method"]
            })
    
    # Prepend new training lessons
    updated_practice = new_entries + filtered
    with open(practice_path, "w", encoding="utf-8") as f:
        json.dump(updated_practice, f, indent=2, ensure_ascii=False)
    print(f"Updated {practice_path} (Total entries: {len(updated_practice)})")
