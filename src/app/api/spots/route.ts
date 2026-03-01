import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 30;

interface SpotResponse {
  id: string;
  name: string;
  type: string;
  floor: string;
  peersNow: number;
  capacity: number;
  topSkills: string[];
  activeGroups: number;
  noiseLevel: string;
  lat: number;
  lng: number;
}

function toSpotResponse(
  spot: {
    id: string;
    name: string;
    type: string;
    floor: string;
    capacity: number;
    activeGroups: number;
    topSkills: string;
    noiseLevel: string;
    lat: number;
    lng: number;
    checkIns: { id: string }[];
  }
): SpotResponse {
  let parsedSkills: string[] = [];
  try {
    const maybeSkills = JSON.parse(spot.topSkills);
    if (Array.isArray(maybeSkills)) {
      parsedSkills = maybeSkills.filter((item) => typeof item === "string");
    }
  } catch {
    parsedSkills = [];
  }

  return {
    id: spot.id,
    name: spot.name,
    type: spot.type,
    floor: spot.floor,
    peersNow: spot.checkIns.length,
    capacity: spot.capacity,
    topSkills: parsedSkills,
    activeGroups: spot.activeGroups,
    noiseLevel: spot.noiseLevel,
    lat: spot.lat,
    lng: spot.lng,
  };
}

async function getSpots() {
  const spots = await prisma.studySpot.findMany({
    orderBy: { name: "asc" },
    include: {
      checkIns: {
        where: { checkedOutAt: null },
        select: { id: true },
      },
    },
  });

  return spots.map(toSpotResponse);
}

export async function GET() {
  const spots = await getSpots();
  return NextResponse.json({ spots }, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const spotId = typeof body?.spotId === "string" ? body.spotId.trim() : "";
  const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";

  if (!spotId || !clientId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const spot = await prisma.studySpot.findUnique({ where: { id: spotId } });
  if (!spot) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  const existing = await prisma.spotCheckIn.findFirst({
    where: {
      spotId,
      clientId,
      checkedOutAt: null,
    },
  });

  if (!existing) {
    await prisma.spotCheckIn.create({
      data: {
        spotId,
        clientId,
      },
    });
  }

  const spots = await getSpots();
  return NextResponse.json({ spots });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const spotId = typeof body?.spotId === "string" ? body.spotId.trim() : "";
  const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";

  if (!spotId || !clientId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const active = await prisma.spotCheckIn.findFirst({
    where: {
      spotId,
      clientId,
      checkedOutAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (active) {
    await prisma.spotCheckIn.update({
      where: { id: active.id },
      data: { checkedOutAt: new Date() },
    });
  }

  const spots = await getSpots();
  return NextResponse.json({ spots });
}
