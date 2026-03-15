import { parse } from "node-html-parser";
import { writeFileSync } from "fs";
import { join } from "path";

interface Route {
  origin: string;
  destination: string;
  route: string;
  category: "civilian" | "military";
  aircraftType: string;
  notes: string;
}

async function scrape() {
  const url = "https://sops.vhcf.net/references/Preferred%20Routing/";
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  const html = await res.text();
  const root = parse(html);

  const tables = root.querySelectorAll("table");
  // Table 0 = civilian, Table 1 = military, Table 2 = ordnance (skip)
  const routes: Route[] = [];

  for (let tableIdx = 0; tableIdx < Math.min(tables.length, 2); tableIdx++) {
    const category: "civilian" | "military" = tableIdx === 0 ? "civilian" : "military";
    const rows = tables[tableIdx].querySelectorAll("tbody tr");

    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 6) continue;

      const origin = cells[0].text.trim();
      const destination = cells[1].text.trim();
      const aircraftType = cells[2].text.trim() || "ALL";
      const altitude = cells[3].text.trim();
      const otherRestrictions = cells[4].text.trim();
      const route = cells[5].text.trim();

      if (!origin || !destination || !route) continue;

      // Combine altitude and other restrictions into notes
      const noteParts = [altitude, otherRestrictions].filter(Boolean);
      const notes = noteParts.join(", ");

      routes.push({
        origin,
        destination,
        route,
        category,
        aircraftType,
        notes,
      });
    }
  }

  const outPath = join(new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"), "..", "app", "data", "routes.json");
  writeFileSync(outPath, JSON.stringify(routes, null, 2));
  console.log(`Wrote ${routes.length} routes to ${outPath}`);
}

scrape().catch((err) => {
  console.error("Scrape failed:", err);
  process.exit(1);
});
