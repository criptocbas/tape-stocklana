import { formatRawAmount } from "./format";
import { QUOTE_USDC_RAW, TAPE_MINTS_BY_MINT, USDC_MINT } from "./registry";

const ULTRA_ORDER = "https://api.jup.ag/ultra/v1/order";
const LITE_ORDER = "https://lite-api.jup.ag/ultra/v1/order";
const SWAP_V2_ORDER = "https://api.jup.ag/swap/v2/order";

export type UltraQuote = {
  outAmount: string | null;
  outUi: string | null;
  priceImpactPct: number | null;
  slippageBps: number | null;
  routeLabel: string | null;
  requestId: string | null;
  error: string | null;
  usingLite: boolean;
  needsApiKey: boolean;
};

function emptyQuote(partial: Partial<UltraQuote> = {}): UltraQuote {
  return {
    outAmount: null,
    outUi: null,
    priceImpactPct: null,
    slippageBps: null,
    routeLabel: null,
    requestId: null,
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

function mapOrder(
  data: Record<string, unknown>,
  outputMint: string,
  usingLite: boolean
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
    error: outAmount ? null : apiError ?? "NO ROUTE",
    usingLite,
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

  if (first.json && typeof first.json === "object" && !Array.isArray(first.json)) {
    const mapped = mapOrder(
      first.json as Record<string, unknown>,
      outputMint,
      usingLite
    );
    if (mapped.outAmount) return mapped;
    if (!is5xx && !isGone) return mapped;
  }

  if (is5xx || isGone) {
    const second = await getJson(buildUrl(SWAP_V2_ORDER, outputMint, taker), headers);
    if (second.json && typeof second.json === "object" && !Array.isArray(second.json)) {
      return mapOrder(second.json as Record<string, unknown>, outputMint, false);
    }
    return emptyQuote({
      error: `Ultra ${first.status}`,
      usingLite,
    });
  }

  if (first.json && typeof first.json === "object" && !Array.isArray(first.json)) {
    return mapOrder(first.json as Record<string, unknown>, outputMint, usingLite);
  }

  return emptyQuote({
    error: `HTTP ${first.status}`,
    usingLite,
  });
}
