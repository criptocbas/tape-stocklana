import "server-only";

import {
  SEP10_BATCH,
  SEP10_SOURCE,
  type ListingRow,
  type ListingsPayload,
} from "./listings";

type SunriseToken = {
  address?: string;
  symbol?: string;
  issuer?: string;
  assetClass?: string;
};

type SunriseBody = {
  success?: boolean;
  data?: { tokens?: SunriseToken[] };
};

export async function loadListings(): Promise<ListingsPayload> {
  let tokens: SunriseToken[] = [];
  let sunriseOk = false;
  try {
    const res = await fetch("https://api.sunrise.xyz/v1/tokens?limit=200", {
      cache: "no-store",
      headers: { accept: "application/json", "user-agent": "tape/0.1" },
    });
    if (res.ok) {
      const body = (await res.json()) as SunriseBody;
      const list = body.data?.tokens;
      if (Array.isArray(list)) {
        tokens = list;
        sunriseOk = true;
      }
    }
  } catch {
    /* batch still renders from the announcement */
  }

  const byMint = new Map<string, SunriseToken>();
  const bySym = new Map<string, SunriseToken[]>();
  for (const t of tokens) {
    const addr = typeof t.address === "string" ? t.address : "";
    const sym = typeof t.symbol === "string" ? t.symbol.toUpperCase() : "";
    if (!addr) continue;
    byMint.set(addr, t);
    byMint.set(addr.toLowerCase(), t);
    if (!sym) continue;
    const arr = bySym.get(sym) ?? [];
    arr.push(t);
    bySym.set(sym, arr);
  }

  const rows: ListingRow[] = SEP10_BATCH.map((row) => {
    const hit = byMint.get(row.mint) ?? byMint.get(row.mint.toLowerCase());
    const others = (bySym.get(row.symbol.toUpperCase()) ?? []).filter((t) => {
      const addr = typeof t.address === "string" ? t.address : "";
      return addr && addr.toLowerCase() !== row.mint.toLowerCase();
    });
    return {
      ...row,
      onSunrise: Boolean(hit),
      spoof: others.length > 0,
    };
  });

  return {
    listed: "2026-09-10",
    source: SEP10_SOURCE,
    fetchedAt: Date.now(),
    sunriseOk,
    rows,
  };
}
