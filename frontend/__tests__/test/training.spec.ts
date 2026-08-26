import { describe, it, expect, beforeEach } from "vitest";
import {
  TRAINING_CURRICULUM,
  activeUnit,
  activeStage,
  isTrainingActive,
  selectTrainingStage,
  advanceNextTrainingDrill,
  exitTraining,
} from "../../src/ts/states/training";

describe("training state and drill progression", () => {
  beforeEach(() => {
    exitTraining();
  });

  it("should have valid curriculum units and stages", () => {
    expect(TRAINING_CURRICULUM.length).toBeGreaterThan(0);
    for (const unit of TRAINING_CURRICULUM) {
      expect(unit.stages.length).toBeGreaterThan(0);
      for (const stage of unit.stages) {
        expect(stage.drillText.length).toBeGreaterThan(0);
      }
    }
  });

  it("should select training stage correctly", () => {
    const firstUnit = TRAINING_CURRICULUM[0];
    if (!firstUnit) throw new Error("Unit 0 not found");
    const firstStage = firstUnit.stages[0];
    if (!firstStage) throw new Error("Stage 0 not found");

    selectTrainingStage(firstUnit, firstStage);

    expect(isTrainingActive()).toBe(true);
    expect(activeUnit().unitId).toBe(firstUnit.unitId);
    expect(activeStage().id).toBe(firstStage.id);
  });

  it("should advance to next training stage in same unit", () => {
    const firstUnit = TRAINING_CURRICULUM[0];
    if (!firstUnit) throw new Error("Unit 0 not found");
    const firstStage = firstUnit.stages[0];
    const secondStage = firstUnit.stages[1];
    if (!firstStage || !secondStage) throw new Error("Stages not found");

    selectTrainingStage(firstUnit, firstStage);
    advanceNextTrainingDrill();

    expect(isTrainingActive()).toBe(true);
    expect(activeStage().id).toBe(secondStage.id);
  });

  it("should advance to next unit when completing last stage of a unit", () => {
    const firstUnit = TRAINING_CURRICULUM[0];
    const secondUnit = TRAINING_CURRICULUM[1];
    if (!firstUnit || !secondUnit) throw new Error("Units not found");
    const lastStageOfFirstUnit = firstUnit.stages[firstUnit.stages.length - 1];
    const firstStageOfSecondUnit = secondUnit.stages[0];
    if (!lastStageOfFirstUnit || !firstStageOfSecondUnit) {
      throw new Error("Stages not found");
    }

    selectTrainingStage(firstUnit, lastStageOfFirstUnit);
    advanceNextTrainingDrill();

    expect(isTrainingActive()).toBe(true);
    expect(activeUnit().unitId).toBe(secondUnit.unitId);
    expect(activeStage().id).toBe(firstStageOfSecondUnit.id);
  });
});
