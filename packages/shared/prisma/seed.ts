import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.org.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000001", name: "Acme Corp" },
  });

  const adminEmail = "admin@acme.test";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      orgId: org.id,
    },
  });

  console.log({ org, admin });
}

main().finally(() => prisma.$disconnect());
