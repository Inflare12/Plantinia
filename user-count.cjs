const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.user.count()
  .then(count => console.log("Users:", count))
  .catch(error => console.error(error))
  .finally(() => prisma.$disconnect());
