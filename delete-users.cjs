const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.user.deleteMany({})
  .then(result => console.log("Deleted users:", result.count))
  .catch(error => console.error(error))
  .finally(() => prisma.$disconnect());
