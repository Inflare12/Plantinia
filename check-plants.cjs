const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.plant.findMany({
  orderBy: { createdAt: "desc" },
  take: 10
})
.then(results => console.log(JSON.stringify(results, null, 2)))
.catch(error => console.error(error))
.finally(() => prisma.$disconnect());
