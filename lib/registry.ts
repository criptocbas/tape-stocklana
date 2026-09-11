export type Issuer = "xstocks" | "backpack";
export type Venue = "DEX" | "CLOB" | "RFQ" | "NONE";
export type TokenProgram = "token-2022" | "token";

export type TapeMint = {
  id: string;              // "TSLA:xstocks"
  underlying: string;      // "TSLA"
  symbol: string;          // "TSLAx"
  name: string;
  issuer: Issuer;
  mint: string;
  decimals: number;
  tokenProgram: TokenProgram;
  venueHint: Venue;
  quoteEnabled: boolean;
};

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_DECIMALS = 6;
export const QUOTE_USDC_RAW = 10_000_000; // 10 USDC

export const TAPE_MINTS: TapeMint[] = [
  {
    id: "TSLA:xstocks",
    underlying: "TSLA",
    symbol: "TSLAx",
    name: "Tesla xStock",
    issuer: "xstocks",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    decimals: 8,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "AAPL:xstocks",
    underlying: "AAPL",
    symbol: "AAPLx",
    name: "Apple xStock",
    issuer: "xstocks",
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    decimals: 8,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "NVDA:xstocks",
    underlying: "NVDA",
    symbol: "NVDAx",
    name: "NVIDIA xStock",
    issuer: "xstocks",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    decimals: 8,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "SPY:xstocks",
    underlying: "SPY",
    symbol: "SPYx",
    name: "SP500 xStock",
    issuer: "xstocks",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
    decimals: 8,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "MSTR:xstocks",
    underlying: "MSTR",
    symbol: "MSTRx",
    name: "MicroStrategy xStock",
    issuer: "xstocks",
    mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
    decimals: 8,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "SPCX:backpack",
    underlying: "SPCX",
    symbol: "SPCX",
    name: "SpaceX — Backpack Securities",
    issuer: "backpack",
    mint: "SPCXxcqXj6e5dJDVNovHN8744zkbhM2bYudU45BimGb",
    decimals: 6,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "MU:backpack",
    underlying: "MU",
    symbol: "MU",
    name: "Micron — Backpack Securities",
    issuer: "backpack",
    mint: "MUxEsUKSMACyw5fZf68wxf5FLnZVhtU9CwH8uNNGay1",
    decimals: 6,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "SNDK:backpack",
    underlying: "SNDK",
    symbol: "SNDK",
    name: "SanDisk — Backpack Securities",
    issuer: "backpack",
    mint: "SNDKbwMUQvZhnLnxLduradgLHG5KrPuKwpnrkkGRhfH",
    decimals: 6,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "BOT:backpack",
    underlying: "BOT",
    symbol: "BOT",
    name: "RoboStrategy — Backpack Securities",
    issuer: "backpack",
    mint: "BoTx8y9ynfdxf5ZjWtCoBVkff52qKA82ysaLU8ZM6d8T",
    decimals: 6,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
  {
    id: "GRND:backpack",
    underlying: "GRND",
    symbol: "GRND",
    name: "Grindr — Backpack Securities",
    issuer: "backpack",
    mint: "GRNDYDpqwpCm6jVxpbh4xT5AM4r3p391qYsKTHqgaET2",
    decimals: 6,
    tokenProgram: "token-2022",
    venueHint: "DEX",
    quoteEnabled: true,
  },
];

export const TAPE_MINTS_BY_MINT: Record<string, TapeMint> = Object.fromEntries(
  TAPE_MINTS.map((row) => [row.mint, row])
);
