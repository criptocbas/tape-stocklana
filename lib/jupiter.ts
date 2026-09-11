import "server-only";

import { formatRawAmount } from "./format";
import type { OrderHost, UltraExecuteResult, UltraQuote } from "./quote";
import { QUOTE_USDC_RAW, TAPE_MINTS_BY_MINT, USDC_MINT } from "./registry";
import { issueTicket } from "./ticket";

export type { UltraExecuteResult, UltraQuote } from "./quote";

const ULTRA_ORDER = "https://api.jup.ag/ultra/v1/order";
const LITE_ORDER = "https://lite-api.jup.ag/ultra/v1/order";
const SWAP_V2_ORDER = "https://api.jup.ag/swap/v2/order";
const ULTRA_EXECUTE = "https://api.jup.ag/ultra/v1/execute";
const LITE_EXECUTE = "https://lite-api.jup.ag/ultra/v1/execute";
const SWAP_V2_EXECUTE = "https://api.jup.ag/swap/v2/execute";

function emptyQuote(partial: Partial<UltraQuote> = {}): UltraQuote {
  return {
    outAmount: null,
    outUi: null,
    priceImpactPct: null,
    slippageBps: null,
    routeLabel: null,
    requestId: null,
    transaction: null,
    ticket: null,
    orderHost: null,
    error: null,
    usingLite: false,
    needsApiKey: false,
    ...partial,
  };
}

function buildUrl(base: string, outputMint: string, taker?: string): string {
  const u = new URL(base);
  u.searchParams.set("inputMint", USDC_MINT);
  u.searchParams.set("outputMint", outputMint);
  u.searchParams.set("amount", String(QUOTE_USDC_RAW));
  if (taker) u.searchParams.set("taker", taker);
  return u.toString();
}

function parseImpact(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseSlippage(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function routeLabel(data: Record<string, unknown>): string | null {
  if (typeof data.router === "string" && data.router) return data.router;
  if (typeof data.swapType === "string" && data.swapType) return data.swapType;
  const plan = data.routePlan;
  if (Array.isArray(plan) && plan[0] && typeof plan[0] === "object") {
    const first = plan[0] as { swapInfo?: { label?: string }; label?: string };
    const label = first.swapInfo?.label ?? first.label;
    if (label) return label;
  }
  if (typeof data.mode === "string" && data.mode) return data.mode;
  return null;
}

function outAmountOf(data: Record<string, unknown>): string | null {
  const v = data.outAmount;
  if (typeof v === "string" && v.length > 0) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function transactionOf(data: Record<string, unknown>): string | null {
  const v = data.transaction;
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

function mapOrder(
  data: Record<string, unknown>,
  outputMint: string,
  host: OrderHost
): UltraQuote {
  const row = TAPE_MINTS_BY_MINT[outputMint];
  const outAmount = outAmountOf(data);
  const apiError =
    typeof data.errorMessage === "string"
      ? data.errorMessage
      : typeof data.error === "string"
        ? data.error
        : null;
  return emptyQuote({
    outAmount,
    outUi: outAmount && row ? formatRawAmount(outAmount, row.decimals) : null,
    priceImpactPct: parseImpact(data.priceImpactPct ?? data.priceImpact),
    slippageBps: parseSlippage(data.slippageBps),
    routeLabel: routeLabel(data),
    requestId: typeof data.requestId === "string" ? data.requestId : null,
    transaction: transactionOf(data),
    ticket:
      typeof data.requestId === "string" && data.requestId
        ? issueTicket(data.requestId, outputMint)
        : null,
    orderHost: host,
    error: outAmount ? null : apiError ?? "NO ROUTE",
    usingLite: host === "lite",
    needsApiKey: false,
  });
}

async function getJson(
  url: string,
  headers: Record<string, string>
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { error: text.slice(0, 400) };
    }
  }
  return { ok: res.ok, status: res.status, json };
}

export async function fetchUltraOrder(
  outputMint: string,
  taker?: string
): Promise<UltraQuote> {
  const key = process.env.JUPITER_API_KEY?.trim();
  const headers: Record<string, string> = {
    accept: "application/json",
    "user-agent": "tape/0.1",
  };
  if (key) headers["x-api-key"] = key;

  const usingLite = !key;
  const primary = key ? ULTRA_ORDER : LITE_ORDER;
  const first = await getJson(buildUrl(primary, outputMint, taker), headers);

  if (first.status === 401 && usingLite) {
    return emptyQuote({
      error: "Set JUPITER_API_KEY",
      usingLite: true,
      needsApiKey: true,
    });
  }

  const is5xx = first.status >= 500;
  const isGone = first.status === 404 || first.status === 410;

  const host: OrderHost = usingLite ? "lite" : "ultra";

  if (first.json && typeof first.json === "object" && !Array.isArray(first.json)) {
    const mapped = mapOrder(first.json as Record<string, unknown>, outputMint, host);
    if (mapped.outAmount) return mapped;
    if (!is5xx && !isGone) return mapped;
  }

  if (is5xx || isGone) {
    const second = await getJson(buildUrl(SWAP_V2_ORDER, outputMint, taker), headers);
    if (second.json && typeof second.json === "object" && !Array.isArray(second.json)) {
      return mapOrder(second.json as Record<string, unknown>, outputMint, "swapv2");
    }
    return emptyQuote({
      error: `Ultra ${first.status}`,
      usingLite,
    });
  }

  if (first.json && typeof first.json === "object" && !Array.isArray(first.json)) {
    return mapOrder(first.json as Record<string, unknown>, outputMint, host);
  }

  return emptyQuote({
    error: `HTTP ${first.status}`,
    usingLite,
  });
}

function executeUrl(host: OrderHost): string {
  if (host === "lite") return LITE_EXECUTE;
  if (host === "swapv2") return SWAP_V2_EXECUTE;
  return ULTRA_EXECUTE;
}

function emptyExecute(partial: Partial<UltraExecuteResult> = {}): UltraExecuteResult {
  return {
    status: "ERROR",
    signature: null,
    error: "execute failed",
    code: null,
    ...partial,
  };
}

function mapExecute(json: unknown, httpStatus: number): UltraExecuteResult {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return emptyExecute({ error: `execute HTTP ${httpStatus}` });
  }
  const o = json as Record<string, unknown>;
  const signature = typeof o.signature === "string" && o.signature ? o.signature : null;
  const code = typeof o.code === "number" && Number.isFinite(o.code) ? o.code : null;
  const err =
    typeof o.error === "string"
      ? o.error
      : typeof o.errorMessage === "string"
        ? o.errorMessage
        : null;
  if (o.status === "Success" && signature) {
    return { status: "Success", signature, error: null, code: code ?? 0 };
  }
  if (code === 0 && signature) {
    return { status: "Success", signature, error: null, code: 0 };
  }
  return emptyExecute({
    status: o.status === "Failed" ? "Failed" : "ERROR",
    signature,
    error: err ?? `execute HTTP ${httpStatus}`,
    code,
  });
}

export async function executeUltraOrder(args: {
  signedTransaction: string;
  requestId: string;
  host: OrderHost | null;
}): Promise<UltraExecuteResult> {
  const key = process.env.JUPITER_API_KEY?.trim();
  const headers: Record<string, string> = {
    accept: "application/json",
    "user-agent": "tape/0.1",
  };
  if (key) headers["x-api-key"] = key;

  const preferred: OrderHost = args.host ?? (key ? "ultra" : "lite");
  const fallback: OrderHost | null =
    preferred === "swapv2" ? (key ? "ultra" : "lite") : "swapv2";
  const hosts: OrderHost[] = fallback && fallback !== preferred ? [preferred, fallback] : [preferred];

  const body = {
    signedTransaction: args.signedTransaction,
    requestId: args.requestId,
  };

  let last: UltraExecuteResult = emptyExecute({ error: "execute failed" });
  for (const host of hosts) {
    try {
      const res = await fetch(executeUrl(host), {
        method: "POST",
        cache: "no-store",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json: unknown = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = { error: text.slice(0, 400) };
        }
      }
      last = mapExecute(json, res.status);
      if (last.status === "Success") return last;
      if (res.status === 401 && host === "lite" && !key) {
        return emptyExecute({
          error: "Set JUPITER_API_KEY",
          code: 401,
        });
      }
      if (res.status !== 404 && res.status !== 410 && res.status < 500) return last;
    } catch {
      last = emptyExecute({ error: "execute network error" });
    }
  }
  return last;
}
