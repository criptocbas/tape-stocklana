import { NextRequest } from "next/server";
import { fetchUltraOrder } from "@/lib/jupiter";
import type { UltraQuote } from "@/lib/quote";
import { TAPE_MINTS_BY_MINT } from "@/lib/registry";

export const dynamic = "force-dynamic";

function unknownMint(): UltraQuote {
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
    error: "unknown mint",
    usingLite: false,
    needsApiKey: false,
  };
}

export async function GET(req: NextRequest) {
  const outputMint = req.nextUrl.searchParams.get("outputMint") ?? "";
  const taker = req.nextUrl.searchParams.get("taker") || undefined;

  if (!TAPE_MINTS_BY_MINT[outputMint]) {
    return Response.json(unknownMint(), { status: 400 });
  }

  const quote = await fetchUltraOrder(outputMint, taker);
  return Response.json(quote);
}
