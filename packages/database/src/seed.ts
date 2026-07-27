import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organization.upsert({
    where: { id: "org-default" },
    update: {},
    create: {
      id: "org-default",
      name: "OrbitIQ Demo",
      region: "us-east-1",
    },
  });
  console.log(`  Organization: ${org.name}`);

  const workspace = await prisma.workspace.upsert({
    where: { id: "ws-default" },
    update: {},
    create: {
      id: "ws-default",
      orgId: org.id,
      name: "Default Workspace",
      description: "Main workspace for development",
    },
  });
  console.log(`  Workspace: ${workspace.name}`);

  const user = await prisma.user.upsert({
    where: { email: "admin@orbitiq.dev" },
    update: {},
    create: {
      orgId: org.id,
      email: "admin@orbitiq.dev",
      name: "Admin",
      attributes: JSON.stringify({ department: "engineering", region: "us-east-1" }),
    },
  });
  console.log(`  User: ${user.email}`);

  const role = await prisma.role.upsert({
    where: { id: "role-admin" },
    update: {},
    create: {
      id: "role-admin",
      orgId: org.id,
      name: "Admin",
      permissions: JSON.stringify({ all: true }),
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  console.log("  Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
