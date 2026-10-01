import { createClient, type Session } from "@supabase/supabase-js";

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const anonKey=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
export const supabase=url&&anonKey?createClient(url,anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export type AppRole="admin"|"user";
export type AppUser={id:string;email:string;username:string;role:AppRole;xp:number;avatarUrl?:string|null};
export type AuthSession=Session|null;
