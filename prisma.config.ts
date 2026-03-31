import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `postgresql://postgres.baitjcvflgbzvqxfaffr:${process.env["DB_PASSWORD"]}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`,
  },
});
