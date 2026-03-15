"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  routes,
  AIRPORT_NAMES,
  FAA_TO_ICAO,
  ICAO_TO_FAA,
  getUniqueAirports,
  type Route,
} from "./data/routes";

const categoryConfig: Record<string, { color: string; border: string; label: string; icon: string }> = {
  civilian: { color: "text-emerald-600", border: "border-emerald-400", label: "CIVILIAN", icon: "bg-emerald-100 text-emerald-600 border-emerald-300" },
  military: { color: "text-amber-600", border: "border-amber-400", label: "MILITARY", icon: "bg-amber-100 text-amber-600 border-amber-300" },
};

const aircraftConfig: Record<string, { color: string; border: string; icon: string }> = {
  ALL: { color: "text-gray-600", border: "border-gray-300", icon: "bg-gray-100 text-gray-500 border-gray-300" },
  JETS: { color: "text-blue-600", border: "border-blue-400", icon: "bg-blue-100 text-blue-600 border-blue-300" },
  PROPS: { color: "text-purple-600", border: "border-purple-400", icon: "bg-purple-100 text-purple-600 border-purple-300" },
  C208: { color: "text-orange-600", border: "border-orange-400", icon: "bg-orange-100 text-orange-600 border-orange-300" },
};

function resolveToFaa(input: string): string {
  const upper = input.toUpperCase().trim();
  if (ICAO_TO_FAA[upper]) return ICAO_TO_FAA[upper];
  return upper;
}

function AirportInput({
  label,
  value,
  onChange,
  airports,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  airports: string[];
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = inputValue.toUpperCase().trim();
    if (!q) return airports;
    return airports.filter(
      (code) =>
        code.includes(q) ||
        (AIRPORT_NAMES[code] || "").toUpperCase().includes(q) ||
        (FAA_TO_ICAO[code] || "").includes(q)
    );
  }, [inputValue, airports]);

  const handleChange = (val: string) => {
    setInputValue(val);
    const resolved = resolveToFaa(val);
    if (airports.includes(resolved)) {
      onChange(resolved);
    } else if (val === "") {
      onChange("");
    }
  };

  const selectAirport = (code: string) => {
    setInputValue(code);
    onChange(code);
    setFocused(false);
  };

  return (
    <div className="flex-1 w-full relative" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-navy mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-navy font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ocean focus:border-ocean uppercase"
      />
      {focused && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((code) => (
            <button
              key={code}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectAirport(code)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm flex justify-between items-center"
            >
              <span className="font-mono font-bold text-navy">
                {code}
                <span className="text-gray-400 font-normal ml-1.5">
                  {FAA_TO_ICAO[code] || ""}
                </span>
              </span>
              <span className="text-gray-400 text-xs truncate ml-2">
                {AIRPORT_NAMES[code] || ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("all");
  const airports = useMemo(() => getUniqueAirports(), []);

  const results = useMemo(() => {
    if (!origin && !destination) return [];
    return routes.filter((r) => {
      if (origin && r.origin !== origin) return false;
      if (destination && r.destination !== destination) return false;
      if (category !== "all" && r.category !== category) return false;
      return true;
    });
  }, [origin, destination, category]);

  const hasSearch = origin || destination;

  const swapAirports = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-dark via-navy to-navy-light text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-0">
          <div className="flex items-center gap-5 h-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/vhcf-logo.png`}
              alt="vHCF Logo"
              width={44}
              height={44}
              className="shrink-0 drop-shadow-md"
            />
            <div className="h-8 w-px bg-white/20" />
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight leading-tight">
                Preferred Route Database
              </h1>
              <p className="text-blue-300/80 text-xs tracking-wide">
                Honolulu Control Facility
              </p>
            </div>
            <a
              href="https://vhcf.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-300/70 hover:text-white transition-colors hidden sm:block"
            >
              vhcf.net
            </a>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <AirportInput
              label="Origin"
              value={origin}
              onChange={setOrigin}
              airports={airports}
              placeholder="e.g. HNL or PHNL"
            />

            {/* Swap Button */}
            <button
              onClick={swapAirports}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-navy transition-colors shrink-0"
              title="Swap origin and destination"
            >
              &#8646;
            </button>

            <AirportInput
              label="Destination"
              value={destination}
              onChange={setDestination}
              airports={airports}
              placeholder="e.g. OGG or PHOG"
            />

            {/* Category Filter */}
            <div className="w-full md:w-40 shrink-0">
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-ocean focus:border-ocean"
              >
                <option value="all">All</option>
                <option value="civilian">Civilian</option>
                <option value="military">Military</option>
              </select>
            </div>

            {/* Clear */}
            <button
              onClick={() => {
                setOrigin("");
                setDestination("");
                setCategory("all");
              }}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-navy text-sm font-medium transition-colors shrink-0"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {!hasSearch ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">&#9992;</p>
            <p className="text-lg font-medium text-gray-500">
              Type an airport code to search preferred routes
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {routes.length} routes across {airports.length} airports &mdash; search by FAA or ICAO code
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium text-gray-500">
              No preferred routes found for this pair
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {results.length} route{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {results.map((r, i) => (
                <RouteCard key={i} route={r} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>
            Data sourced from{" "}
            <a
              href="https://sops.vhcf.net/references/Preferred%20Routing/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean hover:underline"
            >
              vHCF SOPs
            </a>
            . For use on the VATSIM network only. Not for real-world navigation.
          </p>
        </footer>
      </main>
    </div>
  );
}

function CopyableRoute({ route }: { route: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(route);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 w-fit max-w-full">
      <code className="text-sm font-mono text-gray-800 break-all">{route.replace(/\./g, " ")}</code>
      <button
        onClick={handleCopy}
        className="shrink-0 p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
        title="Copy route"
      >
        {copied ? (
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
        )}
      </button>
    </div>
  );
}

function RouteCard({ route }: { route: Route }) {
  const cat = categoryConfig[route.category];
  const acft = aircraftConfig[route.aircraftType] || aircraftConfig.ALL;
  return (
    <div className="flex gap-3">
      {/* Route info box */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4 flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Route</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-navy">{route.origin}</span>
          <span className="text-gray-300">&rarr;</span>
          <span className="text-lg font-bold text-navy">{route.destination}</span>
          <span className="text-xs text-gray-400 ml-1">
            {AIRPORT_NAMES[route.origin]} to {AIRPORT_NAMES[route.destination]}
          </span>
        </div>
        <CopyableRoute route={route.route} />
      </div>

      {/* Notes box */}
      {route.notes && (
        <div className="bg-white rounded-lg border-2 border-sky-300 p-4 w-52 shrink-0 flex flex-col items-center justify-center gap-1.5">
          <div className="w-8 h-8 rounded-full border bg-sky-100 text-sky-600 border-sky-300 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <span className="text-xs font-bold tracking-wider text-sky-600">NOTE:</span>
          <span className="text-xs text-sky-700 text-center leading-snug">{route.notes}</span>
        </div>
      )}

      {/* Category box */}
      <div className={`bg-white rounded-lg border-2 ${cat.border} p-4 w-32 shrink-0 flex flex-col items-center justify-center gap-1.5`}>
        <div className={`w-8 h-8 rounded-full border ${cat.icon} flex items-center justify-center`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {route.category === "military" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            )}
          </svg>
        </div>
        <span className={`text-xs font-bold tracking-wider ${cat.color}`}>{cat.label}</span>
      </div>

      {/* Aircraft type box */}
      <div className={`bg-white rounded-lg border-2 ${acft.border} p-4 w-28 shrink-0 flex flex-col items-center justify-center gap-1.5`}>
        <div className={`w-8 h-8 rounded-full border ${acft.icon} flex items-center justify-center`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </div>
        <span className={`text-xs font-bold tracking-wider ${acft.color}`}>{route.aircraftType}</span>
      </div>
    </div>
  );
}
