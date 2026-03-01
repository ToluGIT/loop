import { calculateClassification } from "@/lib/classification";

interface GradeRecord {
  score: number;
}

interface AssessmentRecord {
  id: string;
  name: string;
  weight: number;
  grades: GradeRecord[];
}

interface ModuleRecord {
  id: string;
  code: string;
  name: string;
  credits: number;
  level: number;
  assessments: AssessmentRecord[];
}

interface UserRecord {
  id: string;
  modules: ModuleRecord[];
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function seededTrend(baseAverage: number) {
  const clamped = Math.max(40, Math.min(80, baseAverage));
  return [
    { week: "W1", avgConfidence: round1(Math.min(80, clamped + 6)) },
    { week: "W2", avgConfidence: round1(Math.min(80, clamped + 4)) },
    { week: "W3", avgConfidence: round1(Math.min(80, clamped + 2)) },
    { week: "W4", avgConfidence: round1(clamped) },
    { week: "W5", avgConfidence: round1(Math.max(40, clamped - 3)) },
    { week: "W6", avgConfidence: round1(Math.max(40, clamped - 5)) },
    { week: "W7", avgConfidence: round1(Math.max(40, clamped - 2)) },
    { week: "W8", avgConfidence: round1(clamped + 1) },
  ];
}

export function buildCampusStats(users: UserRecord[]) {
  const moduleMap = new Map<
    string,
    { code: string; name: string; scores: number[] }
  >();

  const classificationCounts = {
    first: 0,
    upperSecond: 0,
    lowerSecond: 0,
    third: 0,
    fail: 0,
  };

  const userAverages: number[] = [];

  for (const user of users) {
    const modulesForClassification = user.modules.map((mod) => ({
      ...mod,
      assessments: mod.assessments.map((assessment) => ({
        id: assessment.id,
        name: assessment.name,
        weight: assessment.weight,
        grade:
          assessment.grades.length > 0
            ? { score: assessment.grades[0].score }
            : null,
      })),
    }));

    const result = calculateClassification(modulesForClassification);
    userAverages.push(result.weightedAverage);

    switch (result.classification) {
      case "First":
        classificationCounts.first++;
        break;
      case "Upper Second (2:1)":
        classificationCounts.upperSecond++;
        break;
      case "Lower Second (2:2)":
        classificationCounts.lowerSecond++;
        break;
      case "Third":
        classificationCounts.third++;
        break;
      default:
        classificationCounts.fail++;
        break;
    }

    for (const mod of user.modules) {
      let weighted = 0;
      let totalWeight = 0;
      for (const assessment of mod.assessments) {
        if (assessment.grades.length > 0) {
          weighted += assessment.grades[0].score * assessment.weight;
          totalWeight += assessment.weight;
        }
      }

      if (totalWeight > 0) {
        const average = weighted / totalWeight;
        const existing = moduleMap.get(mod.code);
        if (existing) {
          existing.scores.push(average);
        } else {
          moduleMap.set(mod.code, {
            code: mod.code,
            name: mod.name,
            scores: [average],
          });
        }
      }
    }
  }

  const totalStudents = users.length;
  const moduleStats = Array.from(moduleMap.values()).map((entry) => {
    const avg = entry.scores.reduce((sum, score) => sum + score, 0) / entry.scores.length;
    const firstCount = entry.scores.filter((score) => score >= 70).length;

    return {
      code: entry.code,
      name: entry.name,
      avg: round1(avg),
      students: entry.scores.length,
      firstPct: entry.scores.length > 0 ? firstCount / entry.scores.length : 0,
    };
  });

  moduleStats.sort((a, b) => b.avg - a.avg);

  const denominator = Math.max(totalStudents, 1);
  const overallBreakdown = {
    first: classificationCounts.first / denominator,
    upperSecond: classificationCounts.upperSecond / denominator,
    lowerSecond: classificationCounts.lowerSecond / denominator,
    third: classificationCounts.third / denominator,
    fail: classificationCounts.fail / denominator,
  };

  const averageAcrossStudents =
    userAverages.length > 0
      ? userAverages.reduce((sum, value) => sum + value, 0) / userAverages.length
      : 60;

  return {
    totalStudents,
    overallBreakdown,
    moduleStats,
    weeklyTrend: seededTrend(averageAcrossStudents),
  };
}
