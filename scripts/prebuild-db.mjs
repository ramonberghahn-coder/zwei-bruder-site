import { execSync } from "child_process";

const url = process.env.DATABASE_URL?.trim() ?? "";

if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
  console.log("Running prisma db push for production database...");
  execSync("npx prisma db push", { stdio: "inherit", env: process.env });
} else {
  console.log("Skipping prisma db push (DATABASE_URL is not PostgreSQL).");
}
