const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.diagnosis.findMany({
  orderBy: { createdAt: "desc" },
  take: 5
})
.then(results => console.log(JSON.stringify(results, null, 2)))
.catch(error => console.error(error))
.finally(() => prisma.$disconnect());
