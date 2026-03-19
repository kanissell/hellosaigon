#!/usr/bin/env node
/**
 * Reads personal-data.csv and updates matching fields in lib/data/places.ts.
 * Usage: node scripts/sync-personal-data.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = process.env.HOME || process.env.USERPROFILE;
const DESKTOP_CSV = resolve(HOME, "Desktop/personal-data.csv");
const PROJECT_CSV = resolve(__dirname, "../personal-data.csv");
const PLACES_PATH = resolve(__dirname, "../lib/data/places.ts");

// Use Desktop CSV if it exists, otherwise fall back to project CSV
const CSV_PATH = existsSync(DESKTOP_CSV) ? DESKTOP_CSV : PROJECT_CSV;
console.log(`Reading from: ${CSV_PATH}`);

const csv = readFileSync(CSV_PATH, "utf-8");
const [headerLine, ...rows] = csv.trim().split("\n");

// Auto-detect delimiter (semicolon or comma)
const delimiter = headerLine.includes(";") ? ";" : ",";
const headers = headerLine.split(delimiter).map((h) => h.trim());

const updates = [];
for (const row of rows) {
  if (!row.trim()) continue;
  const cols = row.split(delimiter);
  const entry = {};
  headers.forEach((h, i) => (entry[h.trim()] = (cols[i] || "").trim()));

  const id = entry["id"];
  if (!id) continue;

  const rating = entry["personalRating (1-10)"];
  const notes = entry["personalNotes"];
  const signature = entry["signatureItem"];
  const tip = entry["insiderTip"];
  const visits = entry["timesVisited"];

  // Only include if at least one field has data
  if (rating || notes || tip || visits) {
    updates.push({ id, rating, notes, signature, tip, visits });
  }
}

if (updates.length === 0) {
  console.log("No personal data to sync. Fill in personal-data.csv first.");
  process.exit(0);
}

let ts = readFileSync(PLACES_PATH, "utf-8");
let count = 0;

for (const u of updates) {
  // Find the place block by its id
  const idPattern = new RegExp(`id:\\s*"${u.id}"`);
  if (!idPattern.test(ts)) {
    console.warn(`⚠ Place "${u.id}" not found in places.ts, skipping`);
    continue;
  }

  // Find the index of this id in the file
  const idMatch = ts.match(idPattern);
  const idIndex = idMatch.index;

  // Get the block — find the place-level closing "},\n" (not nested objects)
  // Place objects close with "\n  }," (2-space indent closing brace)
  let blockEnd = -1;
  let searchFrom = idIndex;
  while (true) {
    const next = ts.indexOf("\n  },", searchFrom);
    if (next === -1) break;
    blockEnd = next + 4; // include the "},"
    break;
  }
  if (blockEnd === -1) continue;

  let block = ts.substring(idIndex, blockEnd);
  let changed = false;

  if (u.rating) {
    const newBlock = block.replace(
      /personalRating:\s*\d+/,
      `personalRating: ${parseInt(u.rating)}`
    );
    if (newBlock !== block) { block = newBlock; changed = true; }
  }

  if (u.notes) {
    const newBlock = block.replace(
      /personalNotes:\s*"[^"]*"/,
      `personalNotes: "${u.notes.replace(/"/g, '\\"')}"`
    );
    if (newBlock !== block) { block = newBlock; changed = true; }
  }

  if (u.signature) {
    const newBlock = block.replace(
      /signatureItem:\s*"[^"]*"/,
      `signatureItem: "${u.signature.replace(/"/g, '\\"')}"`
    );
    if (newBlock !== block) { block = newBlock; changed = true; }
  }

  if (u.tip) {
    // If insiderTip exists, update it; otherwise we'd need to add it (skip for now)
    const tipRegex = /insiderTip:\s*"[^"]*"/;
    if (tipRegex.test(block)) {
      const newBlock = block.replace(
        tipRegex,
        `insiderTip: "${u.tip.replace(/"/g, '\\"')}"`
      );
      if (newBlock !== block) { block = newBlock; changed = true; }
    } else {
      // Insert insiderTip after personalNotes
      const newBlock = block.replace(
        /(personalNotes:\s*"[^"]*")/,
        `$1\n    insiderTip: "${u.tip.replace(/"/g, '\\"')}",`
      );
      if (newBlock !== block) { block = newBlock; changed = true; }
    }
  }

  if (u.visits) {
    const newBlock = block.replace(
      /timesVisited:\s*\d+/,
      `timesVisited: ${parseInt(u.visits)}`
    );
    if (newBlock !== block) { block = newBlock; changed = true; }
  }

  if (changed) {
    ts = ts.substring(0, idIndex) + block + ts.substring(blockEnd);
    count++;
  }
}

writeFileSync(PLACES_PATH, ts, "utf-8");
console.log(`✓ Synced ${count} place(s) from personal-data.csv → places.ts`);
