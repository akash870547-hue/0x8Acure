import { PrismaClient } from "@prisma/client";

let client;
export function getPrisma(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the Cyber Lab API.");
  if(!client) client=new PrismaClient({log:process.env.NODE_ENV==="development"?["warn","error"]:["error"]});
  return client;
}
