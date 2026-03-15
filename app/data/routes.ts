import routesJson from "./routes.json";

export interface Route {
  origin: string;
  destination: string;
  route: string;
  category: "civilian" | "military";
  aircraftType: string;
  notes: string;
}

export const AIRPORT_NAMES: Record<string, string> = {
  HNL: "Daniel K. Inouye Intl",
  LIH: "Lihue Airport",
  MKK: "Molokai Airport",
  LNY: "Lanai Airport",
  OGG: "Kahului Airport",
  JHM: "Kapalua Airport",
  ITO: "Hilo Intl",
  KOA: "Ellison Onizuka Kona Intl",
  MUE: "Waimea-Kohala Airport",
  HNM: "Hana Airport",
  LUP: "Kalaupapa Airport",
  BKH: "Barking Sands PMRF",
  HHI: "Wheeler Army Airfield",
  NGF: "Kaneohe Bay MCAS",
  JRF: "Kalaeloa Airport",
};

// FAA (used in routes) -> ICAO mapping
export const FAA_TO_ICAO: Record<string, string> = {
  HNL: "PHNL",
  LIH: "PHLI",
  MKK: "PHMK",
  LNY: "PHNY",
  OGG: "PHOG",
  JHM: "PHJH",
  ITO: "PHTO",
  KOA: "PHKO",
  MUE: "PHMU",
  HNM: "PHHN",
  LUP: "PHLU",
  BKH: "PHBK",
  HHI: "PHHI",
  NGF: "PHNG",
  JRF: "PHJR",
};

export const ICAO_TO_FAA: Record<string, string> = Object.fromEntries(
  Object.entries(FAA_TO_ICAO).map(([faa, icao]) => [icao, faa])
);

export const routes: Route[] = routesJson as Route[];

export function getUniqueAirports(): string[] {
  const airports = new Set<string>();
  routes.forEach((r) => {
    airports.add(r.origin);
    airports.add(r.destination);
  });
  return Array.from(airports).sort();
}
