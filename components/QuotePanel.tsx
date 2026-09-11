"use client";

import { formatImpactPct, formatPremBps } from "@/lib/format";
import type { UltraQuote } from "@/lib/quote";
import type { TapeMint } from "@/lib/registry";

export type QuoteState = "IDLE" | "QUOTING" | "OK" | "NO ROUTE" | "ERROR";

export function QuotePanel({
  mint,
  state,
  quote,
  premBps,
  stale,
}: {
  mint: TapeMint;
  state: QuoteState;
  quote: UltraQuote | null;
  premBps: number | null;
  stale: boolean;
}) {
  const outUi = quote?.outUi ?? "—";
  const impact = formatImpactPct(quote?.priceImpactPct);
  const route = quote?.routeLabel ?? "—";
  const banner = quote?.needsApiKey
    ? "Set JUPITER_API_KEY"
    : quote?.usingLite
      ? "USING LITE API"
      : null;
  const prem = formatPremBps(premBps);
  const claim =
    mint.issuer === "xstocks"
      ? "xStocks is a Backed tracker certificate. Not the listed share."
      : "Backpack Securities via Sunrise. Not the listed share.";

  return (
    <section className="quote-panel" aria-live="polite">
      <header className="quote-head">
        <div>
          <p className="quote-kicker">Ultra quote</p>
          <h2>
            10 USDC → {mint.symbol}
          </h2>
        </div>
        <span className={`quote-state is-${state.replace(/\s+/g, "-").toLowerCase()}`}>
          {state}
        </span>
      </header>

      {banner ? <p className="quote-banner">{banner}</p> : null}

      <p className="quote-claim">{claim}</p>

      <dl className="quote-grid">
        <div>
          <dt>out</dt>
          <dd className="num">{state === "QUOTING" ? "…" : outUi}</dd>
        </div>
        <div>
          <dt>impact</dt>
          <dd className="num">{state === "QUOTING" ? "…" : impact}</dd>
        </div>
        <div>
          <dt>route</dt>
          <dd className="num">{state === "QUOTING" ? "…" : route}</dd>
        </div>
        <div>
          <dt>prem vs mark</dt>
          <dd className={`num prem is-${prem.kind}`}>
            {prem.text}
            {stale ? <span className="stale-tag">STALE</span> : null}
          </dd>
        </div>
      </dl>

      {quote?.error && state !== "OK" ? (
        <p className="quote-error">{quote.error}</p>
      ) : null}

      <button type="button" className="swap-btn" disabled>
        Swap — quote only
      </button>
    </section>
  );
}
