import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !secretKey) {
    return new Response(JSON.stringify({ error: "Server deletion configuration is missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const admin = createClient(url, secretKey);
  const token = authHeader.slice(7);
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return new Response(JSON.stringify({ error: "Account deletion failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
