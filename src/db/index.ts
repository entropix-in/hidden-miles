import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  hiddenMilesDb?: AppDb;
};

export type AppDb = MySql2Database<typeof schema>;

export function isDbConfigured() {
  return Boolean(process.env.DB_HOST?.trim());
}

export function getDb(): AppDb | null {
  if (!isDbConfigured()) return null;
  if (globalForDb.hiddenMilesDb) return globalForDb.hiddenMilesDb;

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? "hiddenmiles",
    user: process.env.DB_USER ?? "hiddenmiles",
    password: process.env.DB_PASSWORD ?? "",
    waitForConnections: true,
    connectionLimit: 8,
    connectTimeout: 5000,
    charset: "utf8mb4",
  });

  const db = drizzle(pool, { schema, mode: "default" });
  globalForDb.hiddenMilesDb = db;
  return db;
}

export function dbErrorMessage(error: unknown) {
  const candidate = error as { code?: string; message?: string };

  if (candidate.code === "ER_DUP_ENTRY") {
    return "That URL slug is already in use. Choose another one.";
  }

  if (
    candidate.code === "ECONNREFUSED" ||
    candidate.code === "ETIMEDOUT" ||
    candidate.code === "PROTOCOL_CONNECTION_LOST"
  ) {
    return "The database is not reachable. Check MySQL and your DB settings.";
  }

  if (candidate.code === "ER_NO_SUCH_TABLE") {
    return "The database tables are missing. Run `pnpm db:migrate` to create them.";
  }

  return candidate.message || "Something went wrong with the database.";
}
