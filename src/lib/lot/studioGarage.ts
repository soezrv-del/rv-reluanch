/**
 * Coaches saved from Search. Only stock numbers are stored.
 * Names, prices, and photos are read back from the lot snapshot.
 */
const KEY = "rvfox-studio-garage-v1";
const EVENT = "rvfox-studio-garage";
const CAP = 12;

let cacheRaw = "[]";
let cacheStocks: string[] = [];

function parseStocks(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const stocks: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const stock = item.trim();
      if (!stock || seen.has(stock)) continue;
      seen.add(stock);
      stocks.push(stock);
      if (stocks.length >= CAP) break;
    }
    return stocks;
  } catch {
    return [];
  }
}

export function readGarageStocks(): string[] {
  if (typeof localStorage === "undefined") return cacheStocks;
  const raw = localStorage.getItem(KEY) ?? "[]";
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheStocks = parseStocks(raw);
  }
  return cacheStocks;
}

export function writeGarageStocks(stocks: string[]) {
  const next = parseStocks(JSON.stringify(stocks));
  const raw = JSON.stringify(next);
  cacheRaw = raw;
  cacheStocks = next;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(KEY, raw);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function toggleGarageStock(stock: string): string[] {
  const id = stock.trim();
  const current = readGarageStocks();
  if (!id) return current;
  const next = current.includes(id)
    ? current.filter((row) => row !== id)
    : [id, ...current].slice(0, CAP);
  writeGarageStocks(next);
  return next;
}

export function subscribeGarage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
