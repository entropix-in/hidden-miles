import mysql, {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  hiddenMilesPool?: Pool;
};

export function isDbConfigured() {
  return Boolean(process.env.DB_HOST?.trim());
}

export function getPool(): Pool | null {
  if (!isDbConfigured()) return null;
  if (globalForDb.hiddenMilesPool) return globalForDb.hiddenMilesPool;

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
    jsonStrings: true,
  });

  globalForDb.hiddenMilesPool = pool;
  return pool;
}

export async function dbQuery<T = RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const pool = getPool();
  if (!pool) throw new Error("The database is not configured.");
  const [rows] = await pool.query(sql, params);
  return rows as T;
}

export async function dbExecute(
  sql: string,
  params: unknown[] = [],
): Promise<ResultSetHeader> {
  const pool = getPool();
  if (!pool) throw new Error("The database is not configured.");
  const [result] = await pool.query(sql, params);
  return result as ResultSetHeader;
}

export async function dbPing() {
  await dbQuery("SELECT 1 AS ok");
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
    return "The database tables are missing. Restart the stack so the schema can run.";
  }

  return candidate.message || "Something went wrong with the database.";
}
