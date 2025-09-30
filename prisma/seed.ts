import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("creating roles");
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    }),
    prisma.role.upsert({
      where: { name: "instructor" },
      update: {},
      create: { name: "instructor" },
    }),
    prisma.role.upsert({
      where: { name: "learner" },
      update: {},
      create: { name: "learner" },
    }),
    prisma.role.upsert({
      where: { name: "guest" },
      update: {},
      create: { name: "guest" },
    }),
  ]);

  console.log("creating admin user");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@cyberyearn.com" },
    update: {},
    create: {
      email: "admin@cyberyearn.com",
      passwordHash: "temp_hash_to_be_Changed",
      username: "admin",
      status: "active",
    },
  });

  console.log("assining role to admin user");
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: roles.find((r) => r.name === "admin")!.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: roles.find((r) => r.name === "admin")!.id,
    },
  });

  console.log(" future flags coming soon...");
  // const metricsVisibility = await Promise.all([
  //   prisma.metricsVisibility.upsert({
  //     where: { key: 'registrations' },
  //     update: {},
  //     create: { key: 'registrations', visible: true },
  //   }),
  //   prisma.metricsVisibility.upsert({
  //     where: { key: 'wau_mau' },
  //     update: {},
  //     create: { key: 'wau_mau', visible: true },
  //   }),
  // ])
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
