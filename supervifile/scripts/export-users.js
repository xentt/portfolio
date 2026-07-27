const { PrismaClient } = require("@prisma/client");

const localPrisma = new PrismaClient({
  datasources: { db: { url: "mysql://root:jirafasss07@localhost:3306/gestor_drive" } },
});

async function main() {
  try {
    const users = await localPrisma.user.findMany();
    console.log(JSON.stringify(users));
  } catch (e) {
    console.error("Local DB not accessible:", e.message);
  } finally {
    await localPrisma.$disconnect();
  }
}
main();
