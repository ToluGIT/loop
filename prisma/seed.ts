import { PrismaClient } from "@prisma/client";
import { DEMO_STUDENTS, PULSE_DATA, RGU_MODULES, STUDY_SPOTS } from "../src/lib/mock-data";

const prisma = new PrismaClient();

const moodMap = {
  confident: "confident",
  okay: "okay",
  struggling: "struggling",
  overwhelmed: "overwhelmed",
} as const;

function shuffle<T>(input: T[]): T[] {
  const items = [...input];
  for (let index = items.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

async function main() {
  await prisma.spotCheckIn.deleteMany();
  await prisma.pulseCheckIn.deleteMany();
  await prisma.studySpot.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.skillProfile.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding demo data...");

  for (const student of DEMO_STUDENTS) {
    const user = await prisma.user.create({
      data: {
        name: student.name,
        email: student.email,
        course: student.course,
        year: student.year,
        avatar: student.avatar,
      },
    });

    for (const moduleCode of student.modules) {
      const moduleTemplate = RGU_MODULES.find((m) => m.code === moduleCode);
      if (!moduleTemplate) continue;

      const mod = await prisma.module.create({
        data: {
          code: moduleTemplate.code,
          name: moduleTemplate.name,
          credits: moduleTemplate.credits,
          level: moduleTemplate.level,
          userId: user.id,
          assessments: {
            create: moduleTemplate.assessments.map((a) => ({
              name: a.name,
              weight: a.weight,
              dueDate: a.dueDate ? new Date(a.dueDate) : null,
            })),
          },
        },
        include: { assessments: true },
      });

      const studentGrades =
        student.grades[moduleCode as keyof typeof student.grades] || {};
      for (const [assessmentName, score] of Object.entries(studentGrades)) {
        const assessment = mod.assessments.find((a) => a.name === assessmentName);
        if (assessment && typeof score === "number") {
          await prisma.grade.create({
            data: {
              score,
              assessmentId: assessment.id,
              userId: user.id,
            },
          });
        }
      }
    }

    if (student.skillProfile) {
      await prisma.skillProfile.create({
        data: {
          userId: user.id,
          canTeach: JSON.stringify(student.skillProfile.canTeach),
          needsHelp: JSON.stringify(student.skillProfile.needsHelp),
          bio: student.skillProfile.bio,
          contact: student.skillProfile.contact,
        },
      });
    }

    console.log(`  Seeded: ${student.name}`);
  }

  for (const spot of STUDY_SPOTS) {
    await prisma.studySpot.create({
      data: {
        id: spot.id,
        name: spot.name,
        type: spot.type,
        floor: spot.floor,
        capacity: spot.capacity,
        activeGroups: spot.activeGroups,
        topSkills: JSON.stringify(spot.topSkills),
        noiseLevel: spot.noiseLevel,
        lat: spot.lat,
        lng: spot.lng,
      },
    });

    for (let peerIndex = 0; peerIndex < spot.peersNow; peerIndex++) {
      await prisma.spotCheckIn.create({
        data: {
          spotId: spot.id,
          clientId: `seed_spot_${spot.id}_${peerIndex}`,
        },
      });
    }
  }

  const moodKeys = Object.keys(moodMap) as Array<keyof typeof moodMap>;
  for (const modulePulse of PULSE_DATA.modules) {
    const moodSequence: string[] = [];
    for (const mood of moodKeys) {
      const count = modulePulse.moods[mood];
      for (let countIndex = 0; countIndex < count; countIndex++) {
        moodSequence.push(moodMap[mood]);
      }
    }

    const randomized = shuffle(moodSequence);
    for (let responseIndex = 0; responseIndex < randomized.length; responseIndex++) {
      const weeksAgo = Math.floor(responseIndex / Math.max(1, randomized.length / 8));
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - weeksAgo * 7);

      await prisma.pulseCheckIn.create({
        data: {
          moduleCode: modulePulse.code,
          moduleName: modulePulse.name,
          mood: randomized[responseIndex],
          clientId: `seed_pulse_${modulePulse.code}_${responseIndex}`,
          createdAt,
          updatedAt: createdAt,
        },
      });
    }
  }

  console.log("Done! Seeded 5 demo students, pulse data, and study spots.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
