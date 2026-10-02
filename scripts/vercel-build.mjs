import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const appDir = path.join(publicDir, "app");
const contentSource = path.join(root, "content");
const contentTarget = path.join(publicDir, "content");

const staticFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "command-palette.js",
  "curriculum.js",
  "rooms.js",
  "act-reference.js",
  "rules-reference.js",
  "api-client.js",
  "supabase-config.js",
  "supabase-auth-v2.js",
  "supabase-sync.js",
  "supabase-recovery.js",
  "admin-ui.js",
  "certificate-ui.js",
  "badge-ui.js",
  "404.html",
  "og-preview.png"
];

await mkdir(publicDir, { recursive: true });

if (!existsSync(appDir)) {
  throw new Error("Expected Vite output at public/app, but it was not found. Run npm run build first.");
}

for (const file of staticFiles) {
  const source = path.join(root, file);
  const target = path.join(publicDir, file);

  if (!existsSync(source)) {
    throw new Error(`Required DPDP static file is missing: ${file}`);
  }

  await cp(source, target, { recursive: true });
}

if (!existsSync(contentSource)) {
  throw new Error("Required content directory is missing.");
}

await rm(contentTarget, { recursive: true, force: true });
await cp(contentSource, contentTarget, { recursive: true });

console.log(
  `Vercel dual-frontend assembly complete. Preserved ${appDir} and copied the DPDP static frontend plus content/ into ${publicDir}.`
);
