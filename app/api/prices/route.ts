import { fetchDexPrices, overlayBirdeye, type PricesPayload } from "@/lib/dexscreener";
import { TAPE_MINTS } from "@/lib/registry";
import { overlayStockData } from "@/lib/stockdata";

export const dynamic = "force-dynamic";

type CacheBox = { at: number; data: PricesPayload };
const TTL_MS = 15_000;
let cache: CacheBox | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return Response.json(cache.data);
  }

  const mints = TAPE_MINTS.map((row) => row.mint);
  let rows = await fetchDexPrices(mints);
  rows = await overlayBirdeye(rows);
  rows = await overlayStockData(rows);
  const data: PricesPayload = { prices: rows, fetchedAt: Date.now() };
  cache = { at: Date.now(), data };
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
  });
}
