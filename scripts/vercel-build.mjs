import { mkdir, rm, readdir } from "node:fs/promises";
import { cpSync } from "node:fs";
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
  "public-config.js",
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

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else files.push(path.relative(dir, absolute).split(path.sep).join("/"));
  }
  return files.sort();
}

await mkdir(publicDir, { recursive: true });

if (!existsSync(appDir)) {
  throw new Error("Expected Vite output at public/app, but it was not found. Run npm run build first.");
}

const appIndex = path.join(appDir, "index.html");
if (!existsSync(appIndex)) {
  throw new Error("Vercel build did not produce public/app/index.html.");
}
const appFiles = await listFiles(appDir);
const appAssetFiles = appFiles.filter(file => file.startsWith("assets/"));
if (!appAssetFiles.length) {
  throw new Error("Vercel build did not produce public/app/assets/* chunks.");
}
console.log(`[Vercel] verified Cyber Lab bundle: ${appFiles.length} files, ${appAssetFiles.length} asset chunks.`);

for (const file of staticFiles) {
  const source = path.join(root, file);
  const target = path.join(publicDir, file);

  if (!existsSync(source)) {
    throw new Error(`Required DPDP static file is missing: ${file}`);
  }

  cpSync(source, target, { recursive: true, force: true });
  console.log("[Vercel] copied static/" + file + " -> public/" + file);
}

if (!existsSync(contentSource)) {
  throw new Error("Required content directory is missing.");
}

await rm(contentTarget, { recursive: true, force: true });
cpSync(contentSource, contentTarget, { recursive: true });
const copiedAtRoot = await listFiles(contentTarget);
for (const file of copiedAtRoot) console.log("[Vercel] copied content/" + file + " -> public/content/" + file);

const sourceFiles = await listFiles(contentSource);
const copiedFiles = await listFiles(contentTarget);

if (sourceFiles.length !== copiedFiles.length || sourceFiles.some((file, index) => file !== copiedFiles[index])) {
  throw new Error(
    `Content copy verification failed. Source files: ${sourceFiles.length}, copied files: ${copiedFiles.length}`
  );
}

const jsonFiles = sourceFiles.filter(file => file.toLowerCase().endsWith(".json"));
const requiredContent = ["legal-room-content.json","tasks.json","case-studies.json"];
const missingRequired = requiredContent.filter(file => !copiedFiles.includes(file));
if (missingRequired.length) throw new Error(`Required content JSON missing from public/content: ${missingRequired.join(", ")}`);
const missingJson = jsonFiles.filter(file => !copiedFiles.includes(file));
if (missingJson.length) {
  throw new Error(`Content JSON copy verification failed. Missing: ${missingJson.join(", ")}`);
}

console.log(
  `Vercel dual-frontend assembly complete. Copied ${sourceFiles.length} content files, including ${jsonFiles.length} JSON files, into public/content/.`
);
