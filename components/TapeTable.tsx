"use client";

import { IssuerBadge } from "@/components/IssuerBadge";
import { formatUsd, truncateMint } from "@/lib/format";
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
  onSelect,
}: {
  prices: PriceMap;
  pricesLoaded: boolean;
  selectedId: string;
  onSelect: (row: TapeMint) => void;
}) {
  return (
    <div className="tape-wrap">
      <table className="tape-table">
        <thead>
          <tr>
            <th>SYM</th>
            <th>NAME</th>
            <th>ISSUER</th>
            <th>MINT</th>
            <th className="num">PX</th>
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
            return (
              <tr
                key={row.id}
                className={selected ? "is-selected" : undefined}
                onClick={() => onSelect(row)}
                tabIndex={0}
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
                <td className="num">{formatUsd(px?.volume24h)}</td>
                <td className="num">{formatUsd(px?.liquidityUsd)}</td>
                <td className="venue">{venue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
