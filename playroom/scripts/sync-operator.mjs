// Mirrors the operator folder (one level up) into ./.operator so the deployed
// serverless function is self-contained. Runs on predev + prebuild.
//
// Why: the API route feeds the operator's markdown to Claude as the system
// prompt. Locally we could read ../ directly, but on Vercel the project root is
// `playroom/` and files outside it aren't bundled into the function. Copying
// them in at build time keeps the deploy working AND preserves the semantics:
// every push rebuilds, so the deployed app always reflects the current folder.

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLAYROOM = path.resolve(__dirname, "..");
const SRC = path.resolve(PLAYROOM, ".."); // the operator folder
const DEST = path.join(PLAYROOM, ".operator");

const FILES = ["CLAUDE.md", "identity.md", "rules.md", "anti-examples.md"];
const DIRS = ["reference"];

async function copyFile(rel) {
  const from = path.join(SRC, rel);
  const to = path.join(DEST, rel);
  try {
    const data = await fs.readFile(from);
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.writeFile(to, data);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(rel) {
  const from = path.join(SRC, rel);
  let entries = [];
  try {
    entries = await fs.readdir(from);
  } catch {
    return 0;
  }
  let n = 0;
  for (const e of entries) {
    if (e.endsWith(".md")) {
      if (await copyFile(path.join(rel, e))) n += 1;
    }
  }
  return n;
}

async function sourcePresent() {
  // Only refresh if the source folder is actually there (local dev / full-repo
  // build). On a playroom-only deploy the committed .operator is the source of
  // truth — we must NOT wipe it.
  try {
    await fs.access(path.join(SRC, "rules.md"));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await sourcePresent())) {
    console.log(
      "[sync-operator] source folder not present — keeping the committed .operator/ mirror as-is."
    );
    return;
  }
  await fs.rm(DEST, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(DEST, { recursive: true });
  let count = 0;
  for (const f of FILES) if (await copyFile(f)) count += 1;
  for (const d of DIRS) count += await copyDir(d);
  console.log(`[sync-operator] mirrored ${count} files into .operator/`);
}

main();
