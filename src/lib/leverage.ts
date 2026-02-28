// ============================================================
// Grade Leverage Algorithm
// ============================================================
// Ranks ungraded assessments by their mathematical impact on
// overall degree classification. Higher leverage = more influence
// on the final weighted average per 1% change in that assessment.
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

export interface LeverageResult {
  assessmentId: string;
  assessmentName: string;
  moduleName: string;
  moduleCode: string;
  leverage: number;
  description: string;
  crossesBoundary: boolean;
  boundaryDetail: string | null;
}

const CLASSIFICATION_BOUNDARIES = [70, 60, 50, 40] as const;

const BOUNDARY_LABELS: Record<number, string> = {
  70: "First",
  60: "2:1",
  50: "2:2",
  40: "Third",
};

/**
 * Calculate the total weighted credit denominator for the degree.
 * This accounts for the UK Honours weighting scheme:
 * - Level 5 modules contribute 1/3
 * - Level 6 modules contribute 2/3
 * Each module's contribution is scaled by its credit value.
 */
function getTotalWeightedCredits(modules: ModuleWithGrades[]): number {
  let total = 0;
  for (const mod of modules) {
    const levelMultiplier = mod.level === 6 ? 2 / 3 : 1 / 3;
    total += mod.credits * levelMultiplier;
  }
  return total;
}

/**
 * Calculate the current weighted average from all graded assessments,
 * plus the total weight already locked in and remaining.
 */
function getCurrentState(modules: ModuleWithGrades[]): {
  currentWeightedScore: number;
  completedWeight: number;
  totalWeight: number;
} {
  let currentWeightedScore = 0;
  let completedWeight = 0;
  let totalWeight = 0;

  for (const mod of modules) {
    const levelMultiplier = mod.level === 6 ? 2 / 3 : 1 / 3;
    const creditWeight = mod.credits * levelMultiplier;

    for (const assessment of mod.assessments) {
      const assessmentWeight = assessment.weight * creditWeight;
      totalWeight += assessmentWeight;

      if (assessment.grade?.score != null) {
        currentWeightedScore += assessment.grade.score * assessmentWeight;
        completedWeight += assessmentWeight;
      }
    }
  }

  return { currentWeightedScore, completedWeight, totalWeight };
}

/**
 * Check if changing an assessment's grade by its leverage amount
 * causes the overall average to cross a classification boundary.
 */
function detectBoundaryCrossing(
  currentAverage: number,
  leverage: number
): { crosses: boolean; detail: string | null } {
  // Simulate a +1% and -1% change in this assessment's grade
  const avgUp = currentAverage + leverage;
  const avgDown = currentAverage - leverage;

  for (const boundary of CLASSIFICATION_BOUNDARIES) {
    const label = BOUNDARY_LABELS[boundary];

    // Check if going up crosses a boundary upward
    if (currentAverage < boundary && avgUp >= boundary) {
      return {
        crosses: true,
        detail: `A 1% increase could push you above the ${label} boundary (${boundary}%)`,
      };
    }

    // Check if going down crosses a boundary downward
    if (currentAverage >= boundary && avgDown < boundary) {
      return {
        crosses: true,
        detail: `A 1% decrease could drop you below the ${label} boundary (${boundary}%)`,
      };
    }
  }

  return { crosses: false, detail: null };
}

/**
 * Calculate leverage for all ungraded assessments across all modules.
 *
 * Leverage represents the percentage-point change in the final weighted
 * average per 1% change in that assessment's grade.
 *
 * Formula:
 *   leverage = assessmentWeight * (moduleCredits / totalWeightedCredits) * levelMultiplier
 *
 * Where:
 *   - assessmentWeight: the proportion of the module mark (0-1)
 *   - moduleCredits: credit value of the module
 *   - totalWeightedCredits: sum of (credits * levelMultiplier) across all modules
 *   - levelMultiplier: 1/3 for Level 5, 2/3 for Level 6
 *
 * Returns assessments sorted by leverage descending (highest impact first).
 */
export function calculateLeverage(
  modules: ModuleWithGrades[]
): LeverageResult[] {
  const totalWeightedCredits = getTotalWeightedCredits(modules);

  if (totalWeightedCredits === 0) {
    return [];
  }

  const { currentWeightedScore, completedWeight, totalWeight } =
    getCurrentState(modules);

  // Calculate current average for boundary detection
  // Use total weight as denominator (assumes 0 for ungraded)
  const currentAverage =
    totalWeight > 0 ? currentWeightedScore / totalWeight : 0;

  const results: LeverageResult[] = [];

  for (const mod of modules) {
    const levelMultiplier = mod.level === 6 ? 2 / 3 : 1 / 3;

    for (const assessment of mod.assessments) {
      // Only consider ungraded assessments
      if (assessment.grade?.score != null) {
        continue;
      }

      // Leverage: how much the final average moves per 1% change in this assessment
      // = assessmentWeight * (credits * levelMultiplier) / totalWeightedCredits
      const leverage =
        (assessment.weight * mod.credits * levelMultiplier) /
        totalWeightedCredits;

      const { crosses, detail } = detectBoundaryCrossing(
        currentAverage,
        leverage
      );

      const leverageRounded = Math.round(leverage * 1000) / 1000;
      const leveragePercent = Math.round(leverage * 100 * 10) / 10;

      let description: string;
      if (leveragePercent >= 1) {
        description = `High impact: each 1% here shifts your final average by ~${leverageRounded.toFixed(3)} points`;
      } else if (leveragePercent >= 0.3) {
        description = `Moderate impact: each 1% here shifts your final average by ~${leverageRounded.toFixed(3)} points`;
      } else {
        description = `Lower impact: each 1% here shifts your final average by ~${leverageRounded.toFixed(3)} points`;
      }

      results.push({
        assessmentId: assessment.id,
        assessmentName: assessment.name,
        moduleName: mod.name,
        moduleCode: mod.code,
        leverage: leverageRounded,
        description,
        crossesBoundary: crosses,
        boundaryDetail: detail,
      });
    }
  }

  // Sort by leverage descending - highest impact first
  results.sort((a, b) => b.leverage - a.leverage);

  return results;
}
