import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tape-stocklana.vercel.app"),
  title: "TAPE — issuer-aware tape",
  description:
    "xStocks vs Backpack on Solana. Prem/disc vs issuer mark. Jupiter Ultra quote for 10 USDC. Quote only.",
  openGraph: {
    title: "TAPE — issuer-aware tape",
    description:
      "Same ticker, two claims. Prem/disc vs issuer mark. Jupiter Ultra fill — no fake mint.",
    url: "https://tape-stocklana.vercel.app",
    siteName: "TAPE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TAPE — issuer-aware tape",
    description: "Issuer-aware tape for tokenized equities on Solana.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} ${display.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
