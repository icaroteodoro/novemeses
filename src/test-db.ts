import { prisma } from "./infra/db/prisma";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Connection successful, users found:", users.length);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
