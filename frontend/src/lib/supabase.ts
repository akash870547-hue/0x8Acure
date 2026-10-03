import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "./supabaseClient";
export const supabase = supabaseClient;
export type AppRole="admin"|"user";
export type AppUser={id:string;email:string;username:string;role:AppRole;xp:number;avatarUrl?:string|null};
export type AuthSession=Session|null;
