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
