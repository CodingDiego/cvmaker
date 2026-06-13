import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Neon HTTP driver — ideal for serverless / edge-friendly request lifecycles.
const sql = neon(env.databaseUrl());

export const db = drizzle(sql, { schema });
export { schema };
