import { prisma } from "@/lib/db";
import { ALLOWED_MOODS, MOOD_KEYS, PULSE_TREND_WEEKS, type MoodKey } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

interface ModuleMood {
  code: string;
  name: string;
  responses: number;
  moods: Record<MoodKey, number>;
  trend: "improving" | "stable" | "declining";
}

function emptyMoodCounts(): Record<MoodKey, number> {
  return {
    confident: 0,
    okay: 0,
    struggling: 0,
    overwhelmed: 0,
  };
}

function toMoodKey(mood: string): MoodKey | null {
  if (!ALLOWED_MOODS.has(mood)) return null;
  return mood as MoodKey;
}

function startOfWeek(date: Date): Date {
  const next = new Date(date);
  const day = next.getDay();
  const diff = (day + 6) % 7;
  next.setDate(next.getDate() - diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function buildWeeklyMood(checkIns: { mood: string; createdAt: Date }[]) {
  const now = new Date();
  const weekBuckets = Array.from({ length: 8 }, (_, index) => {
    const start = startOfWeek(now);
    start.setDate(start.getDate() - (7 - index) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return {
      label: PULSE_TREND_WEEKS[index],
      start,
      end,
      moods: emptyMoodCounts(),
    };
  });

  for (const entry of checkIns) {
    const mood = toMoodKey(entry.mood);
    if (!mood) continue;

    const bucket = weekBuckets.find(
      (candidate) => entry.createdAt >= candidate.start && entry.createdAt < candidate.end
    );
    if (!bucket) continue;
    bucket.moods[mood] += 1;
  }

  return weekBuckets.map((bucket) => {
    const total = MOOD_KEYS.reduce((sum, key) => sum + bucket.moods[key], 0);
    if (total === 0) {
      return { week: bucket.label, avgMood: 2.5 };
    }

    const weighted =
      bucket.moods.confident * 4 +
      bucket.moods.okay * 3 +
      bucket.moods.struggling * 2 +
      bucket.moods.overwhelmed;

    return {
      week: bucket.label,
      avgMood: Math.round((weighted / total) * 10) / 10,
    };
  });
}

function trendFromHistory(weeklyMood: { week: string; avgMood: number }[]) {
  if (weeklyMood.length < 2) return "stable" as const;
  const firstHalf = weeklyMood.slice(0, 4);
  const secondHalf = weeklyMood.slice(4);
  const firstAvg = firstHalf.reduce((sum, item) => sum + item.avgMood, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item.avgMood, 0) / secondHalf.length;

  if (secondAvg - firstAvg >= 0.2) return "improving" as const;
  if (firstAvg - secondAvg >= 0.2) return "declining" as const;
  return "stable" as const;
}

export async function GET() {
  const [checkIns, users] = await Promise.all([
    prisma.pulseCheckIn.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.user.count(),
  ]);

  const moduleMap = new Map<string, ModuleMood>();
  for (const entry of checkIns) {
    const mood = toMoodKey(entry.mood);
    if (!mood) continue;

    if (!moduleMap.has(entry.moduleCode)) {
      moduleMap.set(entry.moduleCode, {
        code: entry.moduleCode,
        name: entry.moduleName,
        responses: 0,
        moods: emptyMoodCounts(),
        trend: "stable",
      });
    }

    const current = moduleMap.get(entry.moduleCode)!;
    current.responses += 1;
    current.moods[mood] += 1;
  }

  const weeklyMood = buildWeeklyMood(checkIns);
  const overallTrend = trendFromHistory(weeklyMood);

  const modules = Array.from(moduleMap.values())
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((module) => ({ ...module, trend: overallTrend }));

  return NextResponse.json({
    currentWeek: PULSE_TREND_WEEKS[PULSE_TREND_WEEKS.length - 1],
    totalResponses: checkIns.length,
    totalStudents: users,
    modules,
    weeklyMood,
  }, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const moduleCode = typeof body?.moduleCode === "string" ? body.moduleCode.trim().toUpperCase() : "";
  const moduleName = typeof body?.moduleName === "string" ? body.moduleName.trim() : "";
  const mood = typeof body?.mood === "string" ? body.mood.trim().toLowerCase() : "";
  const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";

  if (!moduleCode || !moduleName || !clientId || !ALLOWED_MOODS.has(mood)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const saved = await prisma.pulseCheckIn.upsert({
    where: {
      moduleCode_clientId: {
        moduleCode,
        clientId,
      },
    },
    update: {
      mood,
      moduleName,
    },
    create: {
      moduleCode,
      moduleName,
      mood,
      clientId,
    },
  });

  return NextResponse.json({ ok: true, id: saved.id });
}
