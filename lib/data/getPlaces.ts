import fs from "fs";
import path from "path";
import { PLACES, type Place } from "./places";

const CSV_PATH = path.join(process.cwd(), "personal-data.csv");

let cache: { places: Place[]; mtime: number } | null = null;

function parseCsv(content: string): Map<string, Record<string, string>> {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return new Map();

  const headers = lines[0].split(";").map((h) => h.trim());
  const map = new Map<string, Record<string, string>>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const id = cols[0]?.trim();
    if (!id) continue;

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cols[j]?.trim() ?? "";
    }
    map.set(id, row);
  }

  return map;
}

export function getPlaces(): Place[] {
  if (!fs.existsSync(CSV_PATH)) return PLACES;

  const stat = fs.statSync(CSV_PATH);
  const mtime = stat.mtimeMs;

  if (cache && cache.mtime === mtime) {
    return cache.places;
  }

  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const csvData = parseCsv(content);

  const enriched = PLACES.map((place) => {
    const row = csvData.get(place.id);
    if (!row) {
      return { ...place, personalRating: 0, verifiedByYou: false };
    }

    const rating = parseFloat(row["personalRating (1-10)"] ?? "0") || 0;
    const timesVisited = parseInt(row["timesVisited"] ?? "0", 10) || 0;

    return {
      ...place,
      personalRating: rating,
      personalNotes: row["personalNotes"] || place.personalNotes,
      signatureItem: row["signatureItem"] || place.signatureItem,
      insiderTip: row["insiderTip"] || place.insiderTip,
      timesVisited,
      verifiedByYou: rating > 0,
    };
  });

  cache = { places: enriched, mtime };
  return enriched;
}
