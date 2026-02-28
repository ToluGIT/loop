// ============================================================
// Smart Insights Engine
// ============================================================
// Generates personalized, actionable text insights from grade
// data and classification results. Each insight includes a
// lucide-react icon name, a title, description, and type.
// ============================================================

import type { ClassificationResult, Classification } from "@/types";

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

export interface Insight {
  icon: string;
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "action";
}

const CLASSIFICATION_THRESHOLDS: { name: string; boundary: number }[] = [
  { name: "First", boundary: 70 },
  { name: "2:1", boundary: 60 },
  { name: "2:2", boundary: 50 },
  { name: "Third", boundary: 40 },
];

/**
 * Calculate average grade for a single module (graded assessments only).
 */
function moduleAverage(mod: ModuleWithGrades): number | null {
  const graded = mod.assessments.filter((a) => a.grade?.score != null);
  if (graded.length === 0) return null;

  const totalWeight = graded.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return null;

  const weightedSum = graded.reduce(
    (sum, a) => sum + a.grade!.score * a.weight,
    0
  );
  return weightedSum / totalWeight;
}

/**
 * Calculate what grade is needed on remaining assessments to hit a target average.
 */
function gradeNeededForTarget(
  modules: ModuleWithGrades[],
  targetAverage: number
): number | null {
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
  const neededTotal = targetAverage * totalWeight;
  const neededFromRemaining = neededTotal - totalWeightedScore;
  const gradeNeeded = neededFromRemaining / remainingWeight;

  return Math.round(Math.max(0, Math.min(100, gradeNeeded)) * 10) / 10;
}

/**
 * Calculate overall completion percentage across all assessments.
 */
function completionPercentage(modules: ModuleWithGrades[]): number {
  let totalAssessments = 0;
  let gradedAssessments = 0;

  for (const mod of modules) {
    for (const a of mod.assessments) {
      totalAssessments++;
      if (a.grade?.score != null) {
        gradedAssessments++;
      }
    }
  }

  return totalAssessments > 0
    ? Math.round((gradedAssessments / totalAssessments) * 100)
    : 0;
}

/**
 * Get the next classification tier above the current one.
 */
function getNextTier(
  currentClassification: Classification
): { name: string; boundary: number } | null {
  switch (currentClassification) {
    case "Fail":
      return { name: "Third", boundary: 40 };
    case "Third":
      return { name: "2:2", boundary: 50 };
    case "Lower Second (2:2)":
      return { name: "2:1", boundary: 60 };
    case "Upper Second (2:1)":
      return { name: "First", boundary: 70 };
    case "First":
      return null; // Already at the top
    default:
      return null;
  }
}

/**
 * Get short label for a classification.
 */
function classificationShort(c: Classification): string {
  switch (c) {
    case "First":
      return "First";
    case "Upper Second (2:1)":
      return "2:1";
    case "Lower Second (2:2)":
      return "2:2";
    case "Third":
      return "Third";
    case "Fail":
      return "Fail";
    default:
      return "N/A";
  }
}

/**
 * Generate personalized insights from module grades and classification data.
 *
 * Produces actionable insights covering:
 * 1. Strongest module (highest average)
 * 2. Weakest module (lowest average)
 * 3. Grade needed for next classification tier
 * 4. Modules closest to boundary crossings
 * 5. Completion percentage
 * 6. Congratulatory message if projected First
 * 7. Outlier detection (module significantly below others)
 */
export function generateInsights(
  modules: ModuleWithGrades[],
  classificationResult: ClassificationResult
): Insight[] {
  const insights: Insight[] = [];

  // Calculate per-module averages
  const moduleAverages: { mod: ModuleWithGrades; avg: number }[] = [];
  for (const mod of modules) {
    const avg = moduleAverage(mod);
    if (avg !== null) {
      moduleAverages.push({ mod, avg });
    }
  }

  // --- 1. Strongest module ---
  if (moduleAverages.length > 0) {
    const strongest = moduleAverages.reduce((best, curr) =>
      curr.avg > best.avg ? curr : best
    );
    insights.push({
      icon: "TrendingUp",
      title: "Strongest Module",
      description: `${strongest.mod.name} (${strongest.mod.code}) is your top performer at ${Math.round(strongest.avg * 10) / 10}%. Keep up this standard across your other modules.`,
      type: "success",
    });
  }

  // --- 2. Weakest module ---
  if (moduleAverages.length > 1) {
    const weakest = moduleAverages.reduce((worst, curr) =>
      curr.avg < worst.avg ? curr : worst
    );
    insights.push({
      icon: "AlertTriangle",
      title: "Module Needing Attention",
      description: `${weakest.mod.name} (${weakest.mod.code}) is your lowest at ${Math.round(weakest.avg * 10) / 10}%. Focusing here could improve your overall classification.`,
      type: "warning",
    });
  }

  // --- 3. Grade needed for next classification tier ---
  const nextTier = getNextTier(classificationResult.classification);
  if (nextTier) {
    const gradeNeeded = gradeNeededForTarget(modules, nextTier.boundary);
    if (gradeNeeded !== null) {
      if (gradeNeeded <= 100) {
        insights.push({
          icon: "Target",
          title: `Path to a ${nextTier.name}`,
          description: `You need an average of ${gradeNeeded}% on your remaining assessments to reach a ${nextTier.name} classification.`,
          type: "action",
        });
      } else {
        insights.push({
          icon: "Target",
          title: `${nextTier.name} Out of Reach`,
          description: `Reaching a ${nextTier.name} would require over 100% on remaining assessments. Focus on securing your current ${classificationShort(classificationResult.classification)}.`,
          type: "info",
        });
      }
    }
  }

  // --- 4. Modules closest to boundary crossings ---
  for (const { mod, avg } of moduleAverages) {
    for (const { name, boundary } of CLASSIFICATION_THRESHOLDS) {
      const distance = avg - boundary;
      // Flag modules within 3 points above or below a boundary
      if (distance >= 0 && distance < 3) {
        insights.push({
          icon: "AlertTriangle",
          title: `${mod.code} Near ${name} Boundary`,
          description: `${mod.name} is only ${Math.round(distance * 10) / 10}% above the ${name} boundary (${boundary}%). A small dip in remaining assessments could affect this module's classification band.`,
          type: "warning",
        });
        break; // Only flag the closest boundary per module
      }
      if (distance < 0 && distance > -3) {
        insights.push({
          icon: "Target",
          title: `${mod.code} Just Below ${name}`,
          description: `${mod.name} is ${Math.round(Math.abs(distance) * 10) / 10}% below the ${name} boundary (${boundary}%). A strong result on the next assessment could push it over.`,
          type: "action",
        });
        break;
      }
    }
  }

  // --- 5. Completion percentage ---
  const completion = completionPercentage(modules);
  if (completion < 100) {
    let completionMessage: string;
    if (completion < 25) {
      completionMessage = `You've completed ${completion}% of your assessments. Your classification will become more accurate as more grades come in.`;
    } else if (completion < 75) {
      completionMessage = `You're ${completion}% through your assessments. Your current projection is based on a solid foundation but can still shift.`;
    } else {
      completionMessage = `You've completed ${completion}% of your assessments. Your projected classification is fairly reliable at this stage.`;
    }
    insights.push({
      icon: "PieChart",
      title: `${completion}% Complete`,
      description: completionMessage,
      type: "info",
    });
  } else {
    insights.push({
      icon: "CheckCircle",
      title: "All Assessments Graded",
      description:
        "All your assessments have been graded. Your classification is final based on these results.",
      type: "success",
    });
  }

  // --- 6. Congratulatory message if projected First ---
  if (classificationResult.classification === "First") {
    insights.push({
      icon: "Award",
      title: "On Track for a First!",
      description: `With a weighted average of ${classificationResult.weightedAverage}%, you're projected for a First Class Honours. Outstanding work - keep it up!`,
      type: "success",
    });
  }

  // --- 7. Outlier detection (module significantly below others) ---
  if (moduleAverages.length >= 3) {
    const overallModuleAvg =
      moduleAverages.reduce((sum, m) => sum + m.avg, 0) / moduleAverages.length;

    for (const { mod, avg } of moduleAverages) {
      const deviation = overallModuleAvg - avg;
      // Flag if a module is 15+ points below the average of all modules
      if (deviation >= 15) {
        insights.push({
          icon: "AlertTriangle",
          title: `${mod.code} Significantly Below Average`,
          description: `${mod.name} is ${Math.round(deviation)}% below your average module performance. This is dragging down your overall classification. Consider seeking help or extra revision here.`,
          type: "warning",
        });
      }
    }
  }

  return insights;
}
