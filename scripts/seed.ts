import prisma from "@/lib/db";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@valet.local" },
    create: { email: "demo@valet.local", name: "Demo User", role: "admin" as any },
    update: {},
  });
  await prisma.task.create({ data: { userId: user.id, text: "Try Valet chat", dueAt: null } });
  // eslint-disable-next-line no-console
  console.log("Seeded user:", user.email);
}

main().finally(() => prisma.$disconnect());

