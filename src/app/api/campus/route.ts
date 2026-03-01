import { buildCampusStats } from "@/lib/campus-stats";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      modules: {
        include: {
          assessments: {
            include: {
              grades: {
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  const stats = buildCampusStats(users);
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  });
}
