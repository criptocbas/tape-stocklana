import type { Issuer } from "@/lib/registry";

export function IssuerBadge({ issuer }: { issuer: Issuer }) {
  const label = issuer === "xstocks" ? "xStocks" : "Backpack";
  const tone = issuer === "xstocks" ? "issuer-xstocks" : "issuer-backpack";
  return <span className={`issuer-badge ${tone}`}>{label}</span>;
}
