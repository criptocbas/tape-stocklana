export function formatUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  if (abs >= 1) return `${sign}$${abs.toFixed(2)}`;
  if (abs === 0) return "$0.00";
  return `${sign}$${abs.toPrecision(3)}`;
}

export function truncateMint(mint: string): string {
  if (mint.length <= 10) return mint;
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export function formatRawAmount(raw: string, decimals: number): string {
  try {
    const value = BigInt(raw);
    if (decimals < 0) return raw;
    const base = 10n ** BigInt(decimals);
    const whole = value / base;
    const frac = value % base;
    if (frac === 0n) return whole.toString();
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${whole.toString()}.${fracStr}`;
  } catch {
    return "—";
  }
}

export function premBps(
  tokenUsd: number | null | undefined,
  underlyingUsd: number | null | undefined
): number | null {
  if (tokenUsd == null || underlyingUsd == null) return null;
  if (!Number.isFinite(tokenUsd) || !Number.isFinite(underlyingUsd) || underlyingUsd === 0) {
    return null;
  }
  return (1e4 * (tokenUsd - underlyingUsd)) / underlyingUsd;
}

export function formatBps(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${Math.abs(n).toFixed(1)} bps`;
}

export function formatImpactPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const pct = Math.abs(n) <= 1 ? n * 100 : n;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(4)}%`;
}

export function formatPubkey(pk: string): string {
  if (pk.length <= 8) return pk;
  return `${pk.slice(0, 4)}…${pk.slice(-4)}`;
}

export function formatPremBps(bps: number | null | undefined): {
  text: string;
  kind: "prem" | "disc" | "flat" | "none";
} {
  if (bps == null || !Number.isFinite(bps)) {
    return { text: "—", kind: "none" };
  }
  if (Math.abs(bps) < 0.05) {
    return { text: "0.0 bps", kind: "flat" };
  }
  const kind = bps > 0 ? "prem" : "disc";
  const label = bps > 0 ? "PREM" : "DISC";
  const sign = bps > 0 ? "+" : "";
  return { text: `${sign}${bps.toFixed(1)} bps ${label}`, kind };
}

export function formatUtc(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toISOString().replace(".000Z", "Z").slice(11, 19) + " UTC";
}
