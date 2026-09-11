import { fetchDexPrices, overlayBirdeye } from "@/lib/dexscreener";
import { TAPE_MINTS } from "@/lib/registry";

export const dynamic = "force-dynamic";

type CacheBox = { at: number; data: unknown };
const TTL_MS = 15_000;
let cache: CacheBox | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return Response.json(cache.data);
  }

  const mints = TAPE_MINTS.map((row) => row.mint);
  let rows = await fetchDexPrices(mints);
  rows = await overlayBirdeye(rows);
  cache = { at: Date.now(), data: rows };
  return Response.json(rows);
}
