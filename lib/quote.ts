export type OrderHost = "ultra" | "lite" | "swapv2";

export type UltraQuote = {
  outAmount: string | null;
  outUi: string | null;
  priceImpactPct: number | null;
  slippageBps: number | null;
  routeLabel: string | null;
  requestId: string | null;
  transaction: string | null;
  ticket: string | null;
  orderHost: OrderHost | null;
  error: string | null;
  usingLite: boolean;
  needsApiKey: boolean;
};

export type UltraExecuteResult = {
  status: "Success" | "Failed" | "ERROR";
  signature: string | null;
  error: string | null;
  code: number | null;
};
