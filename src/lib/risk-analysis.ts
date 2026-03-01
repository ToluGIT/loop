// ============================================================
// Boundary Risk Analysis
// ============================================================
// Calculates safety margins relative to classification
// boundaries and determines how much room a student has
// before dropping to a lower classification tier.
// ============================================================

// Inline interface to avoid circular dependency with classification.ts
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

export interface RiskAnalysisResult {
  currentBoundary: number;
  distanceAbove: number;
  riskLevel: "safe" | "watch" | "danger";
  dropThreshold: number | null;
  message: string;
}

const CLASSIFICATION_SHORT: Record<string, string> = {
  First: "First",
  "Upper Second (2:1)": "2:1",
  "Lower Second (2:2)": "2:2",
  Third: "Third",
  Fail: "Fail",
};

/**
 * Get the boundary value for a given classification string.
 */
function getBoundaryForClassification(classification: string): number {
  switch (classification) {
    case "First":
      return 70;
    case "Upper Second (2:1)":
      return 60;
    case "Lower Second (2:2)":
      return 50;
    case "Third":
      return 40;
    case "Fail":
      return 0;
    default:
      return 0;
  }
}

/**
 * Determine the risk level based on how far above the boundary the student is.
 * - safe: >10 percentage points above
 * - watch: 5-10 percentage points above
 * - danger: <5 percentage points above
 */
function determineRiskLevel(
  distanceAbove: number
): "safe" | "watch" | "danger" {
  if (distanceAbove >= 10) return "safe";
  if (distanceAbove >= 5) return "watch";
  return "danger";
}

/**
 * Calculate what average a student would need on remaining assessments
 * to drop below their current classification boundary.
 *
 * Returns null if there are no remaining assessments.
 */
function calculateDropThreshold(
  modules: ModuleWithGrades[],
  currentBoundary: number
): number | null {
  let currentWeightedScore = 0;
  let completedWeight = 0;
  let remainingWeight = 0;

  for (const mod of modules) {
    const levelMultiplier = mod.level === 6 ? 2 / 3 : 1 / 3;
    const creditWeight = mod.credits * levelMultiplier;

    for (const assessment of mod.assessments) {
      const assessmentWeight = assessment.weight * creditWeight;
      if (assessment.grade?.score != null) {
        currentWeightedScore += assessment.grade.score * assessmentWeight;
        completedWeight += assessmentWeight;
      } else {
        remainingWeight += assessmentWeight;
      }
    }
  }

  if (remainingWeight === 0) return null;

  const totalWeight = completedWeight + remainingWeight;

  // Find the grade on remaining assessments that would put the student
  // exactly at the boundary:
  // (currentWeightedScore + dropThreshold * remainingWeight) / totalWeight = boundary
  // dropThreshold = (boundary * totalWeight - currentWeightedScore) / remainingWeight
  const dropGrade =
    (currentBoundary * totalWeight - currentWeightedScore) / remainingWeight;

  // Clamp to 0-100 range
  return Math.round(Math.max(0, Math.min(100, dropGrade)) * 10) / 10;
}

/**
 * Analyze the risk of dropping to a lower classification.
 *
 * Examines the student's current weighted average, determines how far
 * they are from the boundary of their current classification, and
 * calculates what score on remaining work would cause a drop.
 *
 * @param modules - All modules with their assessments and grades
 * @param currentClassification - The current classification string (e.g. "Upper Second (2:1)")
 * @param weightedAverage - The current overall weighted average
 */
export function analyzeRisk(
  modules: ModuleWithGrades[],
  currentClassification: string,
  weightedAverage: number
): RiskAnalysisResult {
  const currentBoundary = getBoundaryForClassification(currentClassification);
  const distanceAbove =
    Math.round((weightedAverage - currentBoundary) * 10) / 10;
  const riskLevel = determineRiskLevel(distanceAbove);
  const dropThreshold = calculateDropThreshold(modules, currentBoundary);

  const shortLabel =
    CLASSIFICATION_SHORT[currentClassification] || currentClassification;

  // Build a human-readable message
  let message: string;

  if (currentClassification === "Fail" || currentClassification === "Insufficient Data") {
    message =
      "You are currently below the Third class boundary. Focus on maximising your remaining assessment scores to improve your classification.";
  } else if (dropThreshold === null) {
    // No remaining assessments
    if (riskLevel === "safe") {
      message = `You're ${distanceAbove}% above the ${shortLabel} boundary. All assessments are graded - your classification is secure.`;
    } else {
      message = `You're ${distanceAbove}% above the ${shortLabel} boundary. All assessments are graded - this is your final result.`;
    }
  } else {
    const dropMessage =
      dropThreshold <= 0
        ? `Even scoring 0% on remaining assessments won't drop you below your ${shortLabel}.`
        : `You can score as low as ${dropThreshold}% on remaining assessments and still keep your ${shortLabel}.`;

    switch (riskLevel) {
      case "safe":
        message = `You're ${distanceAbove}% above the ${shortLabel} boundary. You have a comfortable margin. ${dropMessage}`;
        break;
      case "watch":
        message = `You're ${distanceAbove}% above the ${shortLabel} boundary. This is a reasonable margin but don't let up. ${dropMessage}`;
        break;
      case "danger":
        message = `You're only ${distanceAbove}% above the ${shortLabel} boundary. This is tight - every assessment counts. ${dropMessage}`;
        break;
    }
  }

  return {
    currentBoundary,
    distanceAbove,
    riskLevel,
    dropThreshold,
    message,
  };
}
