"use client";

import { IssuerBadge } from "@/components/IssuerBadge";
import { formatPremBps, formatUsd, formatUtc, truncateMint } from "@/lib/format";
import { TAPE_MINTS, type TapeMint, type Venue } from "@/lib/registry";
import type { TapePrice } from "@/lib/dexscreener";

export type PriceMap = Record<string, TapePrice>;

function venueFor(row: TapeMint, price: TapePrice | undefined, loaded: boolean): Venue {
  if (!loaded || !price) return row.venueHint;
  if (price.priceUsd == null && price.liquidityUsd == null) return "NONE";
  return row.venueHint;
}

export function TapeTable({
  prices,
  pricesLoaded,
  selectedId,
  fetchedAt,
  onSelect,
}: {
  prices: PriceMap;
  pricesLoaded: boolean;
  selectedId: string;
  fetchedAt: number | null;
  onSelect: (row: TapeMint) => void;
}) {
  const rows = TAPE_MINTS.map((row) => prices[row.mint]);
  const marked = rows.filter((p) => p?.underlyingUsd != null).length;
  const stale = rows.some((p) => p?.stale);
  const latestMark = rows
    .map((p) => p?.stockUpdatedAt)
    .filter((v): v is string => Boolean(v))
    .sort()
    .at(-1) ?? null;

  return (
    <div>
      <div className="tape-wrap">
        <table className="tape-table">
          <thead>
            <tr>
              <th>SYM</th>
              <th>NAME</th>
              <th>ISSUER</th>
              <th>MINT</th>
              <th className="num">PX</th>
              <th
                className="num"
                title="1e4 × (Jupiter usdPrice − stockData.price) / stockData.price. Issuer mark, not a claim the token is the listed share."
              >
                PREM
              </th>
              <th className="num">VOL 24H</th>
              <th className="num">LIQ</th>
              <th>VENUE</th>
            </tr>
          </thead>
          <tbody>
            {TAPE_MINTS.map((row) => {
              const px = prices[row.mint];
              const selected = row.id === selectedId;
              const venue = venueFor(row, px, pricesLoaded);
              const prem = formatPremBps(px?.premBps);
              return (
                <tr
                  key={row.id}
                  className={selected ? "is-selected" : undefined}
                  onClick={() => onSelect(row)}
                  tabIndex={0}
                  aria-selected={selected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(row);
                    }
                  }}
                >
                  <td className="sym">{row.symbol}</td>
                  <td className="name">{row.name}</td>
                  <td>
                    <IssuerBadge issuer={row.issuer} />
                  </td>
                  <td className="mint">
                    <a
                      href={`https://solscan.io/token/${row.mint}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={row.mint}
                    >
                      {truncateMint(row.mint)}
                    </a>
                  </td>
                  <td className="num">{formatUsd(px?.priceUsd)}</td>
                  <td className={`num prem is-${prem.kind}`}>
                    <span>{prem.text}</span>
                    {px?.stale ? (
                      <span className="stale-tag" title={px.stockUpdatedAt ?? "issuer mark is stale"}>
                        STALE
                      </span>
                    ) : null}
                  </td>
                  <td className="num">{formatUsd(px?.volume24h)}</td>
                  <td className="num">{formatUsd(px?.liquidityUsd)}</td>
                  <td className="venue">{venue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="tape-meta">
        {fetchedAt
          ? `tape ${new Date(fetchedAt).toISOString().slice(11, 19)} UTC`
          : "tape —"}
        {" · "}
        issuer mark {formatUtc(latestMark)}
        {` · ${marked}/${TAPE_MINTS.length} marks`}
        {" · "}
        Jupiter stockData
        {stale ? " · STALE (>120s)" : ""}
      </p>
    </div>
  );
}
