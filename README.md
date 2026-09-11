# TAPE

TAPE is a live issuer-aware terminal for tokenized US equities on Solana. Same ticker can be two different claims — xStocks (Backed) and Backpack Securities / Sunrise — so every row is keyed by canonical mint, never by ticker search. Tape: 10 rows, prem/disc vs the issuer mark, Jupiter Ultra quote for 10 USDC, then a confirm dialog and one signature on mainnet.

**Live URL:** https://tape-stocklana.vercel.app

## Judge path (60s)

1. Open the live URL. Ten rows, two issuer badges (xStocks amber, Backpack violet).
2. Read **PREM** on TSLAx: basis points vs Jupiter `stockData` (issuer mark, not “you own Tesla”). STALE means the mark is older than 120s — we do not invent a print.
3. Click TSLAx. Quote panel: 10 USDC → TSLAx, human out, impact, route, issuer claim line. Swap is disabled (quote only).
4. Connect Phantom / Backpack / Solflare. Pubkey shows. **Swap 10 USDC** opens a confirm (size, mint, issuer, prem, impact). One signature. Solscan link after land. Mainnet only. Tiny size.
5. Scroll to **Backpack Sep 10 batch**. Twenty canonical mints, Sunrise on-list check. Not on the tape. Never search the ticker on a DEX.

## Run

```bash
cp .env.example .env.local
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect Phantom, Backpack, or Solflare. TSLAx is selected on load and auto-quotes 10 USDC → TSLAx.

## Env

| Variable | Client? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_RPC_URL` | yes | Solana RPC for the wallet adapter. Defaults to `https://api.mainnet-beta.solana.com`. |
| `JUPITER_API_KEY` | **no** — route handler only | Optional. Set in `.env.local` and Vercel project env (Production + Preview). Never `NEXT_PUBLIC_*`. If unset, quotes use `https://lite-api.jup.ag/ultra/v1/order` and the panel shows `USING LITE API`. |
| `BIRDEYE_API_KEY` | **no** — route handler only | Optional. Overlay DexScreener prices when set. Milestone 1 does not require it. |

`JUPITER_API_KEY` is read only on the server: `app/api/ultra/order`, `app/api/ultra/execute` (`lib/jupiter.ts`), and `/api/prices` (`lib/stockdata.ts`). Do not put it or `BIRDEYE_API_KEY` in `NEXT_PUBLIC_*` vars. Signed transactions are posted to Jupiter `/execute`; they are not logged.

## Mint registry (10)

Demo mint: **TSLAx** (`TSLA:xstocks`).

| Symbol | Issuer | Mint |
|---|---|---|
| TSLAx | xStocks | `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` |
| AAPLx | xStocks | `XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp` |
| NVDAx | xStocks | `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh` |
| SPYx | xStocks | `XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W` |
| MSTRx | xStocks | `XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ` |
| SPCX | Backpack | `SPCXxcqXj6e5dJDVNovHN8744zkbhM2bYudU45BimGb` |
| MU | Backpack | `MUxEsUKSMACyw5fZf68wxf5FLnZVhtU9CwH8uNNGay1` |
| SNDK | Backpack | `SNDKbwMUQvZhnLnxLduradgLHG5KrPuKwpnrkkGRhfH` |
| BOT | Backpack | `BoTx8y9ynfdxf5ZjWtCoBVkff52qKA82ysaLU8ZM6d8T` |
| GRND | Backpack | `GRNDYDpqwpCm6jVxpbh4xT5AM4r3p391qYsKTHqgaET2` |

Source of truth: `lib/registry.ts`.

**PREM** = `1e4 × (Jupiter usdPrice − stockData.price) / stockData.price`. Tape last (PX / VOL / LIQ) is DexScreener (highest `liquidity.usd`). If `stockData` is missing, PREM is `—`. Never a fake mark.

## Disclaimer

Not available to US persons. Tokens are not the listed share. Not financial advice. TAPE is a market terminal, not a broker.
