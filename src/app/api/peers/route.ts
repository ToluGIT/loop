import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moduleFilter = searchParams.get("module");

  const profiles = await prisma.skillProfile.findMany({
    include: { user: true },
  });

  const parsed = profiles.map((profile) => {
    const canTeach: string[] = JSON.parse(profile.canTeach);
    const needsHelp: string[] = JSON.parse(profile.needsHelp);
    return {
      id: profile.id,
      userId: profile.userId,
      canTeach,
      needsHelp,
      bio: profile.bio,
      contact: profile.contact,
      user: {
        id: profile.user.id,
        name: profile.user.name,
        email: profile.user.email,
        course: profile.user.course,
        year: profile.user.year,
      },
    };
  });

  if (moduleFilter) {
    const filtered = parsed.filter((p) =>
      p.canTeach.some(
        (skill) => skill.toLowerCase() === moduleFilter.toLowerCase()
      )
    );
    return NextResponse.json(filtered);
  }

  return NextResponse.json(parsed);
}
