"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { QuotePanel, type QuoteState } from "@/components/QuotePanel";
import { TapeTable, type PriceMap } from "@/components/TapeTable";
import type { PricesPayload, TapePrice } from "@/lib/dexscreener";
import type { UltraQuote } from "@/lib/quote";
import { formatPubkey } from "@/lib/format";
import { TAPE_MINTS, type TapeMint } from "@/lib/registry";

const WalletButton = dynamic(
  () => import("@/components/WalletButton").then((m) => m.WalletButton),
  { ssr: false }
);

const DEFAULT_ID = "TSLA:xstocks";
const FALLBACK_IDS = ["TSLA:xstocks", "NVDA:xstocks", "SPCX:backpack"] as const;

function mintById(id: string): TapeMint {
  return TAPE_MINTS.find((row) => row.id === id) ?? TAPE_MINTS[0];
}

async function loadQuote(outputMint: string, taker?: string): Promise<UltraQuote> {
  const params = new URLSearchParams({ outputMint });
  if (taker) params.set("taker", taker);
  const res = await fetch(`/api/ultra/order?${params.toString()}`);
  return (await res.json()) as UltraQuote;
}

export default function Page() {
  const { publicKey } = useWallet();
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const [prices, setPrices] = useState<PriceMap>({});
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [quote, setQuote] = useState<UltraQuote | null>(null);
  const [quoteState, setQuoteState] = useState<QuoteState>("IDLE");
  const fallbackTried = useRef(false);

  const selected = useMemo(() => mintById(selectedId), [selectedId]);
  const taker = publicKey?.toBase58();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/prices", { cache: "no-store" });
        const body = (await res.json()) as PricesPayload | TapePrice[];
        const rows = Array.isArray(body) ? body : body.prices;
        const at = Array.isArray(body) ? Date.now() : body.fetchedAt;
        if (cancelled || !Array.isArray(rows)) return;
        const map: PriceMap = {};
        for (const row of rows) map[row.mint] = row;
        setPrices(map);
        setFetchedAt(at);
      } catch {
        /* rows still render from the registry */
      } finally {
        if (!cancelled) setPricesLoaded(true);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const quoteSelected = useCallback(
    async (row: TapeMint) => {
      setQuoteState("QUOTING");
      try {
        const next = await loadQuote(row.mint, taker);
        if (next.outAmount) {
          setQuote(next);
          setQuoteState("OK");
          return next;
        }
        setQuote(next);
        setQuoteState(next.error && next.error !== "NO ROUTE" ? "ERROR" : "NO ROUTE");
        return next;
      } catch (err) {
        const message = err instanceof Error ? err.message : "quote failed";
        setQuote({
          outAmount: null,
          outUi: null,
          priceImpactPct: null,
          slippageBps: null,
          routeLabel: null,
          requestId: null,
          error: message,
          usingLite: false,
          needsApiKey: false,
        });
        setQuoteState("ERROR");
        return null;
      }
    },
    [taker]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const row = mintById(selectedId);
      const next = await quoteSelected(row);
      if (cancelled || fallbackTried.current) return;
      if (next?.outAmount) {
        fallbackTried.current = true;
        return;
      }
      fallbackTried.current = true;
      for (const id of FALLBACK_IDS) {
        if (id === row.id) continue;
        const alt = mintById(id);
        const quoted = await loadQuote(alt.mint, taker);
        if (cancelled) return;
        if (quoted.outAmount) {
          setSelectedId(id);
          setQuote(quoted);
          setQuoteState("OK");
          return;
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedId, taker, quoteSelected]);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="wordmark">TAPE</span>
          <span className="stocklana">STOCKLANA</span>
        </div>
        <div className="wallet-slot">
          {publicKey ? (
            <span className="num pubkey" title={publicKey.toBase58()}>
              {formatPubkey(publicKey.toBase58())}
            </span>
          ) : null}
          <WalletButton />
        </div>
      </header>

      <p className="subhead">
        Issuer-aware tape · xStocks + Backpack/Sunrise · quotes via Jupiter Ultra.
      </p>

      <TapeTable
        prices={prices}
        pricesLoaded={pricesLoaded}
        selectedId={selectedId}
        fetchedAt={fetchedAt}
        onSelect={(row) => setSelectedId(row.id)}
      />

      <QuotePanel
        mint={selected}
        state={quoteState}
        quote={quote}
        premBps={prices[selected.mint]?.premBps ?? null}
        stale={prices[selected.mint]?.stale ?? false}
      />

      <p className="disclaimer">
        Not available to US persons. Tokens are not the listed share. Not financial advice.
      </p>
    </main>
  );
}
