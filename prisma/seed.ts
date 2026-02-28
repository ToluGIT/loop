import { PrismaClient } from "@prisma/client";
import { DEMO_STUDENTS, RGU_MODULES } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
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

  console.log("Done! Seeded 5 demo students.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
