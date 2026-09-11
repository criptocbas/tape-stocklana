import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 90_000;

function secret(): string {
  return (
    process.env.JUPITER_API_KEY?.trim() ||
    process.env.ORDER_TICKET_SECRET?.trim() ||
    "tape-order-ticket-v1"
  );
}

export function issueTicket(requestId: string, outputMint: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${requestId}.${outputMint}.${exp}`;
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifyTicket(
  ticket: string,
  requestId: string,
  outputMint: string
): boolean {
  const last = ticket.lastIndexOf(".");
  if (last <= 0) return false;
  const payload = ticket.slice(0, last);
  const mac = ticket.slice(last + 1);
  const parts = payload.split(".");
  if (parts.length !== 3) return false;
  const [rid, mint, expRaw] = parts;
  if (rid !== requestId || mint !== outputMint) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}


