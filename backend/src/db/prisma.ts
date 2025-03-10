import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

const prismaClient = {
  async fetch(db: D1Database) {
    const adapter = new PrismaD1(db);
    const prisma = new PrismaClient({ adapter });
    return prisma;
  },
};

export default prismaClient;
