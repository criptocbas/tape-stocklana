"use client";

import { formatImpactPct } from "@/lib/format";
import type { UltraQuote } from "@/lib/quote";
import type { TapeMint } from "@/lib/registry";

export type QuoteState = "IDLE" | "QUOTING" | "OK" | "NO ROUTE" | "ERROR";

export function QuotePanel({
  mint,
  state,
  quote,
}: {
  mint: TapeMint;
  state: QuoteState;
  quote: UltraQuote | null;
}) {
  const outUi = quote?.outUi ?? "—";
  const impact = formatImpactPct(quote?.priceImpactPct);
  const route = quote?.routeLabel ?? "—";
  const banner = quote?.needsApiKey
    ? "Set JUPITER_API_KEY"
    : quote?.usingLite
      ? "USING LITE API"
      : null;

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
