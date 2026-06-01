import { PrismaClient } from "../../generated/prisma/client.js";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);

let prisma = new PrismaClient({adapter: adapter});

export default prisma;