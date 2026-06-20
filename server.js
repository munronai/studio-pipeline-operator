// server.js — the RENDERER HOST.
//
// The agent never watches anything. This process does:
//   agent (or human) writes a file -> chokidar fires -> rebuild -> push over WS.
//
// Two-way editing:
//   - drag/pin/resize  -> writes _layout.json   (renderer + human own layout)
//   - edit a card      -> writes the card's own .md body/title
//   - edit an output   -> writes the real ICM output file the next stage reads
//   - move a card      -> renames/moves the card's .md file between screen folders
//
// Concurrency model is ICM's: sequential, human-in-the-loop, last-write-wins.

import http from "node:http";
import { readFile, readdir, writeFile, stat, mkdir, copyFile, rename, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import util from "node:util";
import chokidar from "chokidar";
import matter from "gray-matter";
import { WebSocketServer } from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SCREENS_DIR = path.join(ROOT, "_tv", "screens");
const PUBLIC = path.join(ROOT, "public");
const PORT = process.env.PORT || 4321;
const TEXT_EXT = new Set([".md", ".markdown", ".txt", ".csv"]);

// Resolve a workspace-relative path and refuse anything escaping ROOT.
function safePath(rel) {
  const p = path.resolve(ROOT, rel);
  if (p !== ROOT && !p.startsWith(ROOT + path.sep)) throw new Error("path escapes workspace");
  return p;
}

// keep card-supplied screen/id from becoming path traversal.
// No dots allowed, so ".." can never form an up-one segment.
const slug = (x) => String(x || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);

// ---------- read the filesystem into a state object ----------
async function readScreen(screenName) {
  const dir = path.join(SCREENS_DIR, screenName);
  const layoutPath = path.join(dir, "_layout.json");
  let layout = {};
  if (existsSync(layoutPath)) {
    try { layout = JSON.parse(await readFile(layoutPath, "utf8")); } catch { layout = {}; }
  }
  const entries = (await readdir(dir)).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  const artifacts = [];
  let i = 0;
  for (const file of entries) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const id = data.id || file.replace(/\.md$/, "");
    const lay = layout[id] || {};
    const col = i % 3, row = Math.floor(i / 3);
    artifacts.push({
      id, file: `_tv/screens/${screenName}/${file}`,
      title: data.title || id, type: data.type || "card",
      stage: data.stage ?? null, status: data.status ?? null, source: data.source ?? null,
      updated: data.updated ?? null,
      pinned: lay.pinned ?? data.pinned ?? false,
      x: lay.x ?? 24 + col * 360, y: lay.y ?? 24 + row * 260,
      w: lay.w ?? 332, h: lay.h ?? 232, z: lay.z ?? i,
      body: content.trim(),
      frontmatter: data // preserve all extra fields
    });
    i++;
  }
  return artifacts;
}

async function buildState() {
  if (!existsSync(SCREENS_DIR)) return { screens: {} };
  const screens = {};
  const entries = await readdir(SCREENS_DIR);
  // Sort screens numerically if they have prefixes
  entries.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  for (const name of entries) {
    const full = path.join(SCREENS_DIR, name);
    if ((await stat(full)).isDirectory()) screens[name] = await readScreen(name);
  }
  return { screens };
}

// rewrite a card's .md, preserving all frontmatter except title/updated and any overrides in frontmatter
async function writeCard(screen, id, { title, body, frontmatter }) {
  const file = path.join(SCREENS_DIR, screen, `${id}.md`);
  const raw = await readFile(file, "utf8");
  const parsed = matter(raw);
  let data = { ...parsed.data };
  if (title != null) data.title = title;
  if (frontmatter != null) data = { ...data, ...frontmatter };
  data.updated = new Date().toISOString().slice(0, 19);
  await writeFile(file, matter.stringify(body ?? parsed.content, data));
}

// ---------- HTTP ----------
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
async function readBody(req) { let b = ""; for await (const c of req) b += c; return b ? JSON.parse(b) : {}; }

const server = http.createServer(async (req, res) => {
  const json = (code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
  try {
    const u = new URL(req.url, "http://x");

    if (req.method === "GET" && u.pathname === "/api/state") return json(200, await buildState());

    if (req.method === "POST" && u.pathname === "/api/layout") {
      const { screen, layout } = await readBody(req);
      const s = slug(screen);
      if (!s) return json(400, { error: "bad screen" });
      await writeFile(path.join(SCREENS_DIR, s, "_layout.json"), JSON.stringify(layout, null, 2));
      return json(200, { ok: true });
    }

    // edit a card's own content
    if (req.method === "POST" && u.pathname === "/api/content") {
      const { screen, id, title, body, frontmatter } = await readBody(req);
      const s = slug(screen), i = slug(id);
      if (!s || !i) return json(400, { error: "bad screen or id" });
      await writeCard(s, i, { title, body, frontmatter });
      return json(200, { ok: true });
    }

    // read a real workspace file into the editor
    if (req.method === "GET" && u.pathname === "/api/file") {
      const rel = u.searchParams.get("path") || "";
      if (!TEXT_EXT.has(path.extname(rel))) return json(400, { error: "unsupported file type" });
      const p = safePath(rel);
      if (!existsSync(p)) return json(404, { error: "not found" });
      return json(200, { path: rel, content: await readFile(p, "utf8") });
    }

    // write a real workspace file back
    if (req.method === "POST" && u.pathname === "/api/file") {
      const { path: rel, content } = await readBody(req);
      if (!TEXT_EXT.has(path.extname(rel))) return json(400, { error: "unsupported file type" });
      await writeFile(safePath(rel), content);
      return json(200, { ok: true });
    }

    // move a card between screen folders
    if (req.method === "POST" && u.pathname === "/api/move-card") {
      const { fromScreen, toScreen, id } = await readBody(req);
      const fs = slug(fromScreen), ts = slug(toScreen), i = slug(id);
      if (!fs || !ts || !i) return json(400, { error: "bad screens or id" });
      const oldPath = path.join(SCREENS_DIR, fs, `${i}.md`);
      const newDir = path.join(SCREENS_DIR, ts);
      const newPath = path.join(newDir, `${i}.md`);
      if (!existsSync(oldPath)) return json(404, { error: "card not found" });
      await mkdir(newDir, { recursive: true });
      
      const raw = await readFile(oldPath, "utf8");
      const parsed = matter(raw);
      const data = { ...parsed.data };
      
      // Update stage if the destination has a numeric stage prefix
      const match = ts.match(/^(\d+)-/);
      if (match) {
        data.stage = parseInt(match[1], 10);
      }
      
      await writeFile(newPath, matter.stringify(parsed.content, data));
      await unlink(oldPath);

      // Clean up layout in old screen
      const oldLayoutPath = path.join(SCREENS_DIR, fs, "_layout.json");
      if (existsSync(oldLayoutPath)) {
        try {
          const layout = JSON.parse(await readFile(oldLayoutPath, "utf8"));
          if (layout[i]) {
            delete layout[i];
            await writeFile(oldLayoutPath, JSON.stringify(layout, null, 2));
          }
        } catch {}
      }
      
      return json(200, { ok: true });
    }

    // create a new card
    if (req.method === "POST" && u.pathname === "/api/create-card") {
      const { screen, id, title, body, status, type, frontmatter } = await readBody(req);
      const s = slug(screen), i = slug(id);
      if (!s || !i) return json(400, { error: "bad screen or id" });
      const dir = path.join(SCREENS_DIR, s);
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, `${i}.md`);
      
      const fm = {
        title: title || i,
        type: type || "card",
        status: status || null,
        updated: new Date().toISOString().slice(0, 19),
        ...frontmatter
      };
      
      const match = s.match(/^(\d+)-/);
      if (match && fm.stage === undefined) {
        fm.stage = parseInt(match[1], 10);
      }

      await writeFile(filePath, matter.stringify(body || "", fm));
      return json(200, { ok: true });
    }

    // an interactive card's answer
    if (req.method === "POST" && u.pathname === "/api/respond") {
      const { screen, id, value } = await readBody(req);
      const s = slug(screen), i = slug(id);
      if (!s || !i) return json(400, { error: "bad screen/id" });
      const dir = path.join(ROOT, "_tv", "responses", s);
      await mkdir(dir, { recursive: true });
      const body = typeof value === "string" ? value : JSON.stringify(value, null, 2);
      await writeFile(path.join(dir, `${i}.md`), body + "\n");
      return json(200, { ok: true, path: `_tv/responses/${s}/${i}.md` });
    }

    // static
    const urlPath = u.pathname === "/" ? "/index.html" : u.pathname;
    const filePath = path.join(PUBLIC, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
    if (existsSync(filePath)) {
      res.writeHead(200, { "content-type": MIME[path.extname(filePath)] || "application/octet-stream" });
      return res.end(await readFile(filePath));
    }
    res.writeHead(404); res.end("not found");
  } catch (err) {
    res.writeHead(500); res.end(String(err));
  }
});

// ---------- WebSocket ----------
const wss = new WebSocketServer({ server });
async function broadcast() {
  const msg = JSON.stringify({ type: "state", ...(await buildState()) });
  for (const c of wss.clients) if (c.readyState === 1) c.send(msg);
}
wss.on("connection", async (ws) => ws.send(JSON.stringify({ type: "state", ...(await buildState()) })));

// ---------- watch loop ----------
let t;
chokidar.watch(SCREENS_DIR, { ignoreInitial: true }).on("all", () => {
  clearTimeout(t); t = setTimeout(broadcast, 80);
});

// ---------- source watch and compilation ----------
const execPromise = util.promisify(exec);

async function buildTailwind() {
  try {
    await execPromise("npx @tailwindcss/cli -i src/styles.css -o public/tailwind-styles.css");
    console.log("  [tailwind] compiled tailwind-styles.css successfully");
  } catch (err) {
    console.error("  [tailwind] compilation error:", err.message);
  }
}

async function buildAll() {
  await mkdir(PUBLIC, { recursive: true });
  await copyFile(path.join(ROOT, "src", "index.html"), path.join(PUBLIC, "index.html"));
  await copyFile(path.join(ROOT, "src", "app.js"), path.join(PUBLIC, "app.js"));
  await buildTailwind();
}

// Watch src/ directory for changes to rebuild source assets automatically
chokidar.watch(path.join(ROOT, "src"), { ignoreInitial: true }).on("all", async (event, filepath) => {
  console.log(`  [src watch] ${event}: ${path.basename(filepath)}`);
  await buildAll();
  broadcast();
});

// Initial compilation
buildAll().then(() => {
  server.listen(PORT, () => {
    console.log(`📡 [icm-cctv] listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Initialization error:", err);
});
