export type TapePrice = {
  mint: string;
  priceUsd: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  underlyingUsd: number | null;
  premBps: number | null;
  stockUpdatedAt: string | null;
  stale: boolean;
};

export type PricesPayload = {
  prices: TapePrice[];
  fetchedAt: number;
};

type DexPair = {
  baseToken?: { address?: string };
  quoteToken?: { address?: string };
  priceUsd?: string | number;
  volume?: { h24?: number };
  liquidity?: { usd?: number };
};

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function empty(mints: string[]): TapePrice[] {
  return mints.map((mint) => ({
    mint,
    priceUsd: null,
    volume24h: null,
    liquidityUsd: null,
    underlyingUsd: null,
    premBps: null,
    stockUpdatedAt: null,
    stale: false,
  }));
}

export async function fetchDexPrices(mints: string[]): Promise<TapePrice[]> {
  if (mints.length === 0) return [];
  const url = `https://api.dexscreener.com/tokens/v1/solana/${mints.join(",")}`;
  let pairs: DexPair[] = [];
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json", "user-agent": "tape/0.1" },
    });
    if (!res.ok) return empty(mints);
    const data: unknown = await res.json();
    pairs = Array.isArray(data) ? (data as DexPair[]) : [];
  } catch {
    return empty(mints);
  }

  const best = new Map<
    string,
    { liq: number; priceUsd: number | null; volume24h: number | null }
  >();

  for (const pair of pairs) {
    const liq = num(pair.liquidity?.usd) ?? 0;
    const priceUsd = num(pair.priceUsd);
    const volume24h = num(pair.volume?.h24);
    for (const addr of [pair.baseToken?.address, pair.quoteToken?.address]) {
      if (!addr) continue;
      const prev = best.get(addr);
      if (!prev || liq > prev.liq) {
        best.set(addr, { liq, priceUsd, volume24h });
      }
    }
  }

  const lower = new Map<string, (typeof best extends Map<string, infer V> ? V : never)>();
  for (const [k, v] of best) lower.set(k.toLowerCase(), v);

  return mints.map((mint) => {
    const hit = best.get(mint) ?? lower.get(mint.toLowerCase());
    if (!hit) {
      return {
        mint,
        priceUsd: null,
        volume24h: null,
        liquidityUsd: null,
        underlyingUsd: null,
        premBps: null,
        stockUpdatedAt: null,
        stale: false,
      };
    }
    return {
      mint,
      priceUsd: hit.priceUsd,
      volume24h: hit.volume24h,
      liquidityUsd: hit.liq > 0 ? hit.liq : null,
      underlyingUsd: null,
      premBps: null,
      stockUpdatedAt: null,
      stale: false,
    };
  });
}

type BirdeyeBody = {
  data?: Record<string, { value?: number } | undefined>;
};

export async function overlayBirdeye(rows: TapePrice[]): Promise<TapePrice[]> {
  const key = process.env.BIRDEYE_API_KEY?.trim();
  if (!key || rows.length === 0) return rows;
  try {
    const list = rows.map((r) => r.mint).join(",");
    const res = await fetch(
      `https://public-api.birdeye.so/defi/multi_price?list_address=${encodeURIComponent(list)}`,
      {
        cache: "no-store",
        headers: {
          "X-API-KEY": key,
          "x-chain": "solana",
          accept: "application/json",
        },
      }
    );
    if (!res.ok) return rows;
    const body = (await res.json()) as BirdeyeBody;
    const data = body.data ?? {};
    const byLower = new Map<string, number>();
    for (const [addr, entry] of Object.entries(data)) {
      const v = entry?.value;
      if (typeof v === "number" && Number.isFinite(v)) {
        byLower.set(addr.toLowerCase(), v);
      }
    }
    return rows.map((row) => {
      if (row.priceUsd != null) return row;
      const v = byLower.get(row.mint.toLowerCase());
      return v == null ? row : { ...row, priceUsd: v };
    });
  } catch {
    return rows;
  }
}
