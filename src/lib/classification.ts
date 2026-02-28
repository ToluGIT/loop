// ============================================================
// UK Honours Degree Classification Algorithm
// ============================================================
// Based on standard UK university regulations:
// - Level 5 (Year 2) modules: weighted at 1/3
// - Level 6 (Year 3/4 Honours) modules: weighted at 2/3
// - Classification boundaries: First ≥70, 2:1 ≥60, 2:2 ≥50, Third ≥40
// ============================================================

import type {
  Classification,
  ClassificationResult,
} from "@/types";

interface ModuleWithGrades {
  id: string;
  code: string;
  name: string;
  credits: number;
  level: number;
  assessments: {
    id: string;
    name: string;
    weight: number;
    grade?: { score: number } | null;
  }[];
}

/**
 * Calculate the weighted average for a single module based on its assessments.
 * Only includes assessments that have grades.
 */
export function calculateModuleAverage(
  module: ModuleWithGrades
): { average: number; completionRatio: number } | null {
  const gradedAssessments = module.assessments.filter((a) => a.grade?.score != null);
  if (gradedAssessments.length === 0) return null;

  const totalWeight = gradedAssessments.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return null;

  const weightedSum = gradedAssessments.reduce(
    (sum, a) => sum + (a.grade!.score * a.weight),
    0
  );

  return {
    average: weightedSum / totalWeight,
    completionRatio: totalWeight / module.assessments.reduce((s, a) => s + a.weight, 0),
  };
}

/**
 * Classify a weighted average into a UK degree classification.
 */
export function getClassification(average: number): Classification {
  if (average >= 70) return "First";
  if (average >= 60) return "Upper Second (2:1)";
  if (average >= 50) return "Lower Second (2:2)";
  if (average >= 40) return "Third";
  return "Fail";
}

/**
 * Get the color associated with a classification for UI rendering.
 */
export function getClassificationColor(classification: Classification): string {
  switch (classification) {
    case "First":
      return "#f59e0b"; // gold
    case "Upper Second (2:1)":
      return "#22c55e"; // green
    case "Lower Second (2:2)":
      return "#f97316"; // amber/orange
    case "Third":
      return "#ef4444"; // red
    case "Fail":
      return "#991b1b"; // dark red
    default:
      return "#6b7280"; // grey
  }
}

/**
 * Get short label for classification.
 */
export function getClassificationShort(classification: Classification): string {
  switch (classification) {
    case "First": return "1st";
    case "Upper Second (2:1)": return "2:1";
    case "Lower Second (2:2)": return "2:2";
    case "Third": return "3rd";
    case "Fail": return "Fail";
    default: return "N/A";
  }
}

/**
 * Calculate the full degree classification result from a set of modules.
 *
 * UK Honours Classification:
 * - Level 5 modules contribute 1/3 of the final mark
 * - Level 6 modules contribute 2/3 of the final mark
 * - Weighted by credits within each level
 */
export function calculateClassification(
  modules: ModuleWithGrades[]
): ClassificationResult {
  const level5Modules = modules.filter((m) => m.level === 5);
  const level6Modules = modules.filter((m) => m.level === 6);

  // Calculate credit-weighted average for each level
  function levelAverage(levelModules: ModuleWithGrades[]): {
    average: number | null;
    totalCredits: number;
    completedCredits: number;
  } {
    let totalWeightedScore = 0;
    let totalCredits = 0;
    let completedCredits = 0;
    let gradedModuleCredits = 0;

    for (const mod of levelModules) {
      const result = calculateModuleAverage(mod);
      totalCredits += mod.credits;
      if (result) {
        totalWeightedScore += result.average * mod.credits;
        gradedModuleCredits += mod.credits;
        completedCredits += mod.credits * result.completionRatio;
      }
    }

    return {
      average: gradedModuleCredits > 0 ? totalWeightedScore / gradedModuleCredits : null,
      totalCredits,
      completedCredits,
    };
  }

  const l5 = levelAverage(level5Modules);
  const l6 = levelAverage(level6Modules);

  // Calculate overall weighted average
  let weightedAverage: number;
  let totalCredits = l5.totalCredits + l6.totalCredits;
  let completedCredits = l5.completedCredits + l6.completedCredits;

  if (l5.average !== null && l6.average !== null) {
    // Standard: 1/3 Level 5 + 2/3 Level 6
    weightedAverage = (l5.average * 1) / 3 + (l6.average * 2) / 3;
  } else if (l6.average !== null) {
    weightedAverage = l6.average;
  } else if (l5.average !== null) {
    weightedAverage = l5.average;
  } else {
    return {
      classification: "Insufficient Data",
      weightedAverage: 0,
      level5Average: null,
      level6Average: null,
      creditsCompleted: 0,
      totalCredits,
      confidence: 0,
    };
  }

  const confidence = totalCredits > 0 ? completedCredits / totalCredits : 0;

  return {
    classification: getClassification(weightedAverage),
    weightedAverage: Math.round(weightedAverage * 10) / 10,
    level5Average: l5.average !== null ? Math.round(l5.average * 10) / 10 : null,
    level6Average: l6.average !== null ? Math.round(l6.average * 10) / 10 : null,
    creditsCompleted: Math.round(completedCredits),
    totalCredits,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Calculate what grade is needed on remaining assessments to achieve a target classification.
 */
export function calculateGradeNeeded(
  modules: ModuleWithGrades[],
  targetClassification: Classification
): number | null {
  const thresholds: Record<string, number> = {
    "First": 70,
    "Upper Second (2:1)": 60,
    "Lower Second (2:2)": 50,
    "Third": 40,
  };

  const target = thresholds[targetClassification];
  if (target === undefined) return null;

  // Get current state
  let totalWeightedScore = 0;
  let completedWeight = 0;
  let remainingWeight = 0;

  for (const mod of modules) {
    const levelMultiplier = mod.level === 6 ? 2 / 3 : 1 / 3;
    const creditWeight = mod.credits * levelMultiplier;

    for (const assessment of mod.assessments) {
      const assessmentWeight = assessment.weight * creditWeight;
      if (assessment.grade?.score != null) {
        totalWeightedScore += assessment.grade.score * assessmentWeight;
        completedWeight += assessmentWeight;
      } else {
        remainingWeight += assessmentWeight;
      }
    }
  }

  if (remainingWeight === 0) return null;

  const totalWeight = completedWeight + remainingWeight;
  const neededTotal = target * totalWeight;
  const neededFromRemaining = neededTotal - totalWeightedScore;
  const gradeNeeded = neededFromRemaining / remainingWeight;

  return Math.round(Math.max(0, Math.min(100, gradeNeeded)) * 10) / 10;
}
