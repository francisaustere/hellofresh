// Copies the parents' recipe data built by ../scripts/build-parents.mjs into public/.
import { cpSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "../site-parents");

if (!existsSync(resolve(source, "data.json"))) {
  console.error(`[sync-data] ${source}/data.json not found. Run the build chain first (see README).`);
  process.exit(1);
}

cpSync(resolve(source, "data.json"), resolve(root, "public/data.json"));
cpSync(resolve(source, "img"), resolve(root, "public/img"), { recursive: true });
console.log("[sync-data] public/data.json and public/img updated");
