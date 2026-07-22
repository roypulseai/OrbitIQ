import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default organization
  const org = await prisma.organization.create({
    data: {
      name: "OrbitIQ Demo",
      region: "eu-west-1",
      compliancePackId: "gdpr",
    },
  });

  console.log(`✅ Created organization: ${org.name} (${org.id})`);

  // Create default roles
  const adminRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: "admin",
      permissions: {
        workspaces: ["create", "read", "update", "delete"],
        connections: ["create", "read", "update", "delete"],
        dashboards: ["create", "read", "update", "delete"],
        users: ["create", "read", "update", "delete"],
        settings: ["read", "update"],
      },
    },
  });

  const editorRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: "editor",
      permissions: {
        workspaces: ["read"],
        connections: ["read"],
        dashboards: ["create", "read", "update"],
        users: ["read"],
      },
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      orgId: org.id,
      name: "viewer",
      permissions: {
        workspaces: ["read"],
        connections: ["read"],
        dashboards: ["read"],
        users: ["read"],
      },
    },
  });

  console.log(`✅ Created roles: ${adminRole.name}, ${editorRole.name}, ${viewerRole.name}`);

  // Create default workspace
  const workspace = await prisma.workspace.create({
    data: {
      orgId: org.id,
      name: "Default Workspace",
      description: "Main workspace for demo data",
    },
  });

  console.log(`✅ Created workspace: ${workspace.name} (${workspace.id})`);

  // Create demo user
  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      email: "admin@orbitiq.dev",
      name: "Admin User",
      ssoSubject: "admin-orbitiq",
      attributes: {
        role: "GlobalAdmin",
        region: "global",
        department: "engineering",
      },
    },
  });

  // Assign admin role
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ Created user: ${user.email} (${user.id})`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
