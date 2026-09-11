import { loadListings } from "@/lib/sunrise";

export const dynamic = "force-dynamic";

type CacheBox = { at: number; data: unknown };
const TTL_MS = 60_000;
let cache: CacheBox | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return Response.json(cache.data);
  }
  const data = await loadListings();
  cache = { at: Date.now(), data };
  return Response.json(data, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
