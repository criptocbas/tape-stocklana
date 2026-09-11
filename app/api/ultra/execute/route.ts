import { NextRequest } from "next/server";
import { executeUltraOrder } from "@/lib/jupiter";
import type { OrderHost, UltraExecuteResult } from "@/lib/quote";
import { TAPE_MINTS_BY_MINT } from "@/lib/registry";

export const dynamic = "force-dynamic";

function bad(error: string, status = 400): Response {
  const body: UltraExecuteResult = {
    status: "ERROR",
    signature: null,
    error,
    code: null,
  };
  return Response.json(body, { status });
}

function asHost(v: unknown): OrderHost | null {
  if (v === "ultra" || v === "lite" || v === "swapv2") return v;
  return null;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("invalid json");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return bad("invalid json");
  }
  const o = body as Record<string, unknown>;
  const outputMint = typeof o.outputMint === "string" ? o.outputMint : "";
  const requestId = typeof o.requestId === "string" ? o.requestId.trim() : "";
  const signedTransaction =
    typeof o.signedTransaction === "string" ? o.signedTransaction.trim() : "";

  if (!TAPE_MINTS_BY_MINT[outputMint]) return bad("unknown mint");
  if (!requestId || requestId.length > 200) return bad("missing requestId");
  if (!signedTransaction || signedTransaction.length > 200_000) {
    return bad("missing signedTransaction");
  }

  const result = await executeUltraOrder({
    signedTransaction,
    requestId,
    host: asHost(o.host),
  });
  return Response.json(result);
}
