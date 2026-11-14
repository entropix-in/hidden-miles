import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/db/schema";
import {
  markContentSeeded,
  seedSampleActivity,
  seedStaticContent,
  type SeedCount,
} from "@/lib/seed";
import { experiences } from "@/data/experiences";
import { tours } from "@/data/tours";

function loadEnv() {
  try {
    const contents = readFileSync(resolve(process.cwd(), ".env"), "utf8");

    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // No .env file: rely on environment variables already being set.
  }
}

function line(label: string, count: SeedCount) {
  return `${label.padEnd(14)} added ${String(count.added).padStart(3)}   updated ${String(
    count.updated,
  ).padStart(3)}   skipped ${String(count.skipped).padStart(3)}`;
}

async function main() {
  loadEnv();

  if (!process.env.DB_HOST) {
    console.error(
      "DB_HOST is not set. Add your MySQL credentials to .env before seeding.",
    );
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const port = Number(process.env.DB_PORT ?? 3306);

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port,
    database: process.env.DB_NAME ?? "hiddenmiles",
    user: process.env.DB_USER ?? "hiddenmiles",
    password: process.env.DB_PASSWORD ?? "",
    waitForConnections: true,
    connectionLimit: 4,
    charset: "utf8mb4",
  });

  try {
    const db = drizzle(pool, { schema, mode: "default" });

    console.log(
      `Seeding hard-coded content into MySQL at ${process.env.DB_HOST}:${port} (${process.env.DB_NAME ?? "hiddenmiles"})`,
    );
    console.log(
      force
        ? "Mode: force — existing starter rows will be overwritten.\n"
        : "Mode: safe — only missing rows will be added.\n",
    );

    const summary = await seedStaticContent(db, { force });
    await markContentSeeded(db);
    const activity = await seedSampleActivity(db, { force });

    console.log(line("Tours", summary.tours));
    console.log(line("Destinations", summary.destinations));
    console.log(line("Experiences", summary.experiences));
    console.log(line("Reviews", summary.testimonials));
    console.log(line("Departures", activity.departures));
    console.log(line("Bookings", activity.bookings));
    console.log(line("Enquiries", activity.enquiries));

    const specialityCoverage = experiences.map((experience) => ({
      label: experience.shortTitle,
      count: tours.filter((tour) =>
        tour.experiences.includes(experience.slug),
      ).length,
    }));
    console.log(
      `\nSpeciality coverage: ${specialityCoverage
        .map((item) => `${item.label} ${item.count}`)
        .join(" · ")}`,
    );
    const sparse = specialityCoverage.filter((item) => item.count < 8);
    if (sparse.length) {
      console.warn(
        `Warning: ${sparse
          .map((item) => `${item.label} has only ${item.count}`)
          .join(", ")}. Each speciality should have at least 8 tours.`,
      );
    }

    console.log("\nDone. Starter content is ready in the database.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\nSeeding failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
