"use client";

import { useEffect, useRef, useState } from "react";
import { formatImpactPct, formatPremBps, isSolscanSig, truncateMint } from "@/lib/format";
import type { UltraQuote } from "@/lib/quote";
import type { TapeMint } from "@/lib/registry";

export type QuoteState = "IDLE" | "QUOTING" | "OK" | "NO ROUTE" | "ERROR";
export type SwapState = "IDLE" | "SIGNING" | "EXECUTING" | "LANDED" | "ERROR";

export function QuotePanel({
  mint,
  state,
  quote,
  premBps,
  stale,
  connected,
  swapState,
  signature,
  swapError,
  onExecute,
}: {
  mint: TapeMint;
  state: QuoteState;
  quote: UltraQuote | null;
  premBps: number | null;
  stale: boolean;
  connected: boolean;
  swapState: SwapState;
  signature: string | null;
  swapError: string | null;
  onExecute: () => void;
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
  const issuer = mint.issuer === "xstocks" ? "xStocks" : "Backpack";
  const claim =
    mint.issuer === "xstocks"
      ? "xStocks is a Backed tracker certificate. Not the listed share."
      : "Backpack Securities via Sunrise. Not the listed share.";
  const busy = swapState === "SIGNING" || swapState === "EXECUTING";
  const canSwap =
    connected &&
    state === "OK" &&
    Boolean(quote?.outAmount && quote.transaction && quote.requestId && quote.ticket) &&
    !busy;
  const swapLabel = !connected
    ? "Connect wallet to swap"
    : swapState === "SIGNING"
      ? "Sign in wallet…"
      : swapState === "EXECUTING"
        ? "Landing…"
        : state !== "OK"
          ? "Swap — no quote"
          : "Swap 10 USDC";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (confirmOpen) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [confirmOpen]);

  return (
    <section className="quote-panel" aria-live="polite">
      <header className="quote-head">
        <div>
          <p className="quote-kicker">Ultra quote</p>
          <h2>10 USDC → {mint.symbol}</h2>
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

      <button
        type="button"
        className={canSwap ? "swap-btn is-ready" : "swap-btn"}
        disabled={!canSwap}
        onClick={() => setConfirmOpen(true)}
      >
        {swapLabel}
      </button>

      {swapError && swapState === "ERROR" ? (
        <p className="quote-error">{swapError}</p>
      ) : null}

      {signature && isSolscanSig(signature) ? (
        <p className="swap-sig">
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noreferrer"
            title={signature}
          >
            Solscan {truncateMint(signature)}
          </a>
        </p>
      ) : null}

      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        onClose={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      >
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            setConfirmOpen(false);
            onExecute();
          }}
        >
          <p className="quote-kicker">Confirm swap</p>
          <h2>10 USDC → {mint.symbol}</h2>
          <p className="quote-claim">{claim} Mainnet. One signature.</p>
          <dl className="confirm-grid">
            <div>
              <dt>size</dt>
              <dd className="num">10 USDC</dd>
            </div>
            <div>
              <dt>mint</dt>
              <dd className="num" title={mint.mint}>
                {mint.symbol} {truncateMint(mint.mint)}
              </dd>
            </div>
            <div>
              <dt>issuer</dt>
              <dd>{issuer}</dd>
            </div>
            <div>
              <dt>prem</dt>
              <dd className={`num prem is-${prem.kind}`}>
                {prem.text}
                {stale ? <span className="stale-tag">STALE</span> : null}
              </dd>
            </div>
            <div>
              <dt>impact</dt>
              <dd className="num">{impact}</dd>
            </div>
            <div>
              <dt>out</dt>
              <dd className="num">{outUi}</dd>
            </div>
          </dl>
          <div className="confirm-actions">
            <button
              type="button"
              className="swap-btn"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="swap-btn is-ready">
              Sign and swap
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
