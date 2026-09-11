# TAPE

TAPE is a live issuer-aware terminal for tokenized US equities on Solana. Same ticker can be two different claims — xStocks (Backed) and Backpack Securities / Sunrise — so every row is keyed by canonical mint, never by ticker search.

**Live URL:** https://tape-stocklana.vercel.app

Tape is a market terminal, not a broker. Tokens are issuer-specific claims, not the listed share. Not available to US persons. Not financial advice. Features are frozen.

## 90s demo script

Record this. Do not say “we built an AMM”, “you own the stock”, “Ondo is deep on Solana”, or “Ultra API v1”.

| t | On screen | Say |
|---|---|---|
| 0–8s | Board: TSLAx (xStocks, amber) and MU (Backpack, violet) | Same market, two legal wrappers. Tape prices the claim, not the ticker. |
| 8–22s | **PREM** on TSLAx, then MU | On-chain vs the issuer mark (`stockData.price`). This is the number desks trade. STALE means the mark is older than 120s — we do not invent a print. |
| 22–35s | Click TSLAx, then MU. Quote claim line | xStocks is a Backed tracker certificate. Backpack via Sunrise is a UCC-8 entitlement path. Neither is the listed share. |
| 35–48s | Backpack Sep 10 listing panel, a canonical mint | Sunrise list, paste mint. We never search the ticker on a DEX. |
| 48–75s | Connect Phantom/Backpack/Solflare → **Swap 10 USDC** → confirm (size, mint, issuer, prem, impact) | Ten USDC, mainnet, one sign. If the wallet has USDC, land and open Solscan. If not, stop on the dialog — do not fake a receipt. |
| 75–90s | Disclaimer, live URL | Not available to US persons. Market terminal, not a broker. End on tape-stocklana.vercel.app. |

Demo names: **TSLAx** `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` and **MU** `MUxEsUKSMACyw5fZf68wxf5FLnZVhtU9CwH8uNNGay1`.

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

## Data sources

| What | Where |
|---|---|
| Tape registry (10) | `lib/registry.ts` only. No DEX ticker search. |
| Token last / vol / liq | DexScreener `GET /tokens/v1/solana/{mints}` |
| Underlying + prem | Jupiter `GET /price/v3?ids=` → `usdPrice` vs `stockData.price` |
| Quote + execute | Jupiter Ultra `/order` + `/execute` (or Swap v2 fallback). Server `x-api-key`. Taker = connected wallet. |
| Sep 10 listings | Vendored batch + Sunrise `GET /v1/tokens?limit=200` on-list check |

## What Tape is not

No AMM. No extra mints on the tape. No Ondo. No charts. No auth wall. No Dark Tape. Swap is 10 USDC on mainnet after confirm, or it does not send.

## Disclaimer

Not available to US persons. Tokens are not the listed share. Not financial advice. TAPE is a market terminal, not a broker.
