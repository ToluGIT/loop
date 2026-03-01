import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 120;

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users, {
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  });
}
