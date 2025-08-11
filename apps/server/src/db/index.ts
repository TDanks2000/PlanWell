import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export * from "./schema";

const client = createClient({
	url: process.env.DATABASE_URL || "",
});

export const db = drizzle({ client });
