import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string(),

  SITE_URL: z.string(),

  DATABASE_URL: z.string(),

  ACCESS_TOKEN_EXPIRES: z.string(),
  JWT_ACCESS_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
