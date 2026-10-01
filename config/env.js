import "dotenv/config";
import { z } from "zod";

const schema=z.object({
  NODE_ENV:z.enum(["development","test","production"]).default("development"),
  PORT:z.coerce.number().int().min(1).max(65535).default(8080),
  JWT_SECRET:z.string().optional(),
  CORS_ORIGINS:z.string().optional(),
  DATABASE_URL:z.string().optional(),
  SUPABASE_URL:z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY:z.string().optional(),
  ADMIN_EMAIL:z.string().email().optional(),
  ADMIN_PASSWORD:z.string().optional(),
  ADMIN_USERNAME:z.string().optional(),
  SEED_ADMIN_USER_ID:z.string().uuid().optional()
});
const result=schema.safeParse(process.env);
if(!result.success){
  console.error("Invalid environment configuration:",result.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).join("; "));
  process.exit(1);
}
export const env=result.data;
if(env.NODE_ENV==="production"){
  const missing=[];
  if(!env.JWT_SECRET||env.JWT_SECRET.length<32||/replace|change-this/i.test(env.JWT_SECRET)) missing.push("JWT_SECRET (a unique random secret of 32+ characters)");
  if(!env.DATABASE_URL) missing.push("DATABASE_URL");
  if(!env.CORS_ORIGINS?.trim()) missing.push("CORS_ORIGINS");
  else if(env.CORS_ORIGINS.split(",").some(origin=>!origin.trim().startsWith("https://"))) missing.push("CORS_ORIGINS (HTTPS origins only in production)");
  if(missing.length) throw new Error(`Missing production configuration: ${missing.join(", ")}`);
}
