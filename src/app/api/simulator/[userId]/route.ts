import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // If userId is "first", grab the first user in the database
    let targetUserId = userId;
    if (userId === "first") {
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
      });
      if (!firstUser) {
        return NextResponse.json({ error: "No users found" }, { status: 404 });
      }
      targetUserId = firstUser.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        modules: {
          include: {
            assessments: {
              include: {
                grades: {
                  where: { userId: targetUserId },
                  take: 1,
                },
              },
            },
          },
          orderBy: [{ level: "asc" }, { code: "asc" }],
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform into the shape the client needs
    const modules = user.modules.map((mod) => ({
      id: mod.id,
      code: mod.code,
      name: mod.name,
      credits: mod.credits,
      level: mod.level,
      assessments: mod.assessments.map((a) => ({
        id: a.id,
        name: a.name,
        weight: a.weight,
        grade: a.grades.length > 0 ? { score: a.grades[0].score } : null,
      })),
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        course: user.course,
        year: user.year,
      },
      modules,
    });
  } catch (error) {
    console.error("Simulator API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
