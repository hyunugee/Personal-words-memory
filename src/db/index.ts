import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { users, words } from "./schema";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export const db = drizzle(pool, {
    schema: { users, words }
});
