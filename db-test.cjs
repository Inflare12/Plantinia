const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.$queryRawUnsafe("SELECT 1")
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => prisma.$disconnect());
