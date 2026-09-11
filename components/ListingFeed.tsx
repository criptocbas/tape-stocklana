"use client";

import { truncateMint } from "@/lib/format";
import { SEP10_BATCH, type ListingsPayload } from "@/lib/listings";

export function ListingFeed({
  data,
  loaded,
}: {
  data: ListingsPayload | null;
  loaded: boolean;
}) {
  const rows =
    data?.rows ??
    SEP10_BATCH.map((row) => ({ ...row, onSunrise: false, spoof: false }));
  const on = rows.filter((r) => r.onSunrise).length;
  const spoof = rows.some((r) => r.spoof);
  const asOf = data
    ? new Date(data.fetchedAt).toISOString().slice(11, 19) + " UTC"
    : "—";

  return (
    <section className="listing-panel">
      <header className="listing-head">
        <div>
          <p className="quote-kicker">New listings</p>
          <h2>Backpack Sep 10 batch</h2>
        </div>
        <span className="quote-state">{loaded ? `${on}/${rows.length || 20} Sunrise` : "…"}</span>
      </header>
      <p className="quote-claim">
        Canonical mint only. Never search the ticker on a DEX. Not on the 10-row tape — no
        quote from this panel. Tokens are not the listed share.
      </p>
      <div className="tape-wrap listing-wrap">
        <table className="tape-table listing-table">
          <thead>
            <tr>
              <th>SYM</th>
              <th>NAME</th>
              <th>MINT</th>
              <th>SUNRISE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.mint}>
                <td className="sym">{row.symbol}</td>
                <td className="name">{row.name}</td>
                <td className="mint">
                  <a
                    href={`https://solscan.io/token/${row.mint}`}
                    target="_blank"
                    rel="noreferrer"
                    title={row.mint}
                  >
                    {truncateMint(row.mint)}
                  </a>
                </td>
                <td className="venue">
                  {!loaded ? (
                    "…"
                  ) : row.onSunrise ? (
                    "ON-LIST"
                  ) : data?.sunriseOk ? (
                    "MISSING"
                  ) : (
                    "—"
                  )}
                  {row.spoof ? (
                    <span className="stale-tag" title="Another mint on Sunrise uses this ticker">
                      SPOOF
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tape-meta">
        announced {data?.listed ?? "2026-09-10"} · checked {asOf}
        {spoof ? " · ticker collision on Sunrise" : ""}
        {" · "}
        {data?.source ? (
          <a href={data.source} target="_blank" rel="noreferrer">
            Backpack post
          </a>
        ) : (
          "Backpack post"
        )}
      </p>
    </section>
  );
}
