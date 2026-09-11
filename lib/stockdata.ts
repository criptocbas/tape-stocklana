import "server-only";

import type { TapePrice } from "./dexscreener";

const PRICE_V3 = "https://api.jup.ag/price/v3";
const PRICE_V3_LITE = "https://lite-api.jup.ag/price/v3";
export const STALE_MS = 120_000;

type StockData = {
  id?: string;
  price?: number;
  updatedAt?: string;
};

type PriceV3Row = {
  usdPrice?: number;
  stockData?: StockData;
};

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function premBps(tokenUsd: number, underlyingUsd: number): number | null {
  if (!Number.isFinite(tokenUsd) || !Number.isFinite(underlyingUsd) || underlyingUsd === 0) {
    return null;
  }
  return (1e4 * (tokenUsd - underlyingUsd)) / underlyingUsd;
}

function isStale(updatedAt: string | null, now: number): boolean {
  if (!updatedAt) return true;
  const t = Date.parse(updatedAt);
  if (!Number.isFinite(t)) return true;
  return now - t > STALE_MS;
}

function applyMark(
  row: TapePrice,
  tokenUsd: number | null,
  underlyingUsd: number | null,
  updatedAt: string | null,
  now: number
): TapePrice {
  const prem =
    tokenUsd != null && underlyingUsd != null ? premBps(tokenUsd, underlyingUsd) : null;
  return {
    ...row,
    priceUsd: row.priceUsd ?? tokenUsd,
    underlyingUsd,
    premBps: prem,
    stockUpdatedAt: updatedAt,
    stale: underlyingUsd != null ? isStale(updatedAt, now) : false,
  };
}

async function fetchPriceV3(mints: string[]): Promise<Record<string, PriceV3Row> | null> {
  const ids = mints.join(",");
  const key = process.env.JUPITER_API_KEY?.trim();
  const headers: Record<string, string> = {
    accept: "application/json",
    "user-agent": "tape/0.1",
  };
  if (key) headers["x-api-key"] = key;
  const urls = key
    ? [`${PRICE_V3}?ids=${encodeURIComponent(ids)}`, `${PRICE_V3_LITE}?ids=${encodeURIComponent(ids)}`]
    : [`${PRICE_V3_LITE}?ids=${encodeURIComponent(ids)}`];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store", headers });
      if (!res.ok) continue;
      const body: unknown = await res.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) continue;
      return body as Record<string, PriceV3Row>;
    } catch {
      /* try next host */
    }
  }
  return null;
}

export async function overlayStockData(rows: TapePrice[]): Promise<TapePrice[]> {
  if (rows.length === 0) return rows;
  const payload = await fetchPriceV3(rows.map((r) => r.mint));
  const now = Date.now();
  const byLower = new Map<string, PriceV3Row>();
  if (payload) {
    for (const [mint, row] of Object.entries(payload)) {
      byLower.set(mint.toLowerCase(), row);
    }
  }

  return rows.map((row) => {
    const hit = payload?.[row.mint] ?? byLower.get(row.mint.toLowerCase());
    const stock = hit?.stockData;
    const underlyingUsd = num(stock?.price);
    const jupUsd = num(hit?.usdPrice);
    const updatedAt = typeof stock?.updatedAt === "string" ? stock.updatedAt : null;
    return applyMark(row, jupUsd ?? row.priceUsd, underlyingUsd, updatedAt, now);
  });
}
