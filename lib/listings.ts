/** Backpack Securities / Sunrise batch announced 2026-09-10. Not tape rows. */
export type ListingMint = {
  symbol: string;
  name: string;
  mint: string;
};

export const SEP10_SOURCE =
  "https://learn.backpack.exchange/blog/20-new-tokenized-stocks-solana";

export const SEP10_BATCH: ListingMint[] = [
  {
    symbol: "BA",
    name: "The Boeing Company — Backpack Securities",
    mint: "BArimz1PcKZr8PcPh3tcZ2dg4S7FJLk3cw6R5F8GsHKg",
  },
  {
    symbol: "BABA",
    name: "Alibaba Group Holding — Backpack Securities",
    mint: "BABANGA4JE7Kkam4nTrALAwAVgsNJUuFJnnkF7S16BZp",
  },
  {
    symbol: "BULL",
    name: "Webull Corporation — Backpack Securities",
    mint: "BULL151gUXcFV5wXEUqu9Am2L7Qt4bTJRLRuAUjkcspC",
  },
  {
    symbol: "COST",
    name: "Costco Wholesale — Backpack Securities",
    mint: "CZEB3WNZuF2Yz1z2H81RcCk8T7fsw82KB33zqamASVsg",
  },
  {
    symbol: "DELL",
    name: "Dell Technologies — Backpack Securities",
    mint: "DELL2aRKQz7DMq5DrKLtkn47ZCnbxXPZXrSGbkmd13wy",
  },
  {
    symbol: "DJT",
    name: "Trump Media & Technology Group — Backpack Securities",
    mint: "DJTu7vi8norVzdVAffgvb39VP7wjKeTsgaMBJrzfxvoF",
  },
  {
    symbol: "HIMS",
    name: "Hims & Hers Health — Backpack Securities",
    mint: "HiMSSzzwkZkrXJ4PGVJRdtfLaANeAztjjcgk5Dxe7Lwx",
  },
  {
    symbol: "IBM",
    name: "International Business Machines — Backpack Securities",
    mint: "BMKdM4yUxX12moFqVk195k7coMbaybd4RUKCUdm7D1Sk",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson — Backpack Securities",
    mint: "JNJg1znKdF712Phe7L7z52AATAvEjEytBdN2w8Lnh1Y",
  },
  {
    symbol: "LMT",
    name: "Lockheed Martin — Backpack Securities",
    mint: "LMT3i1BHgixFqPUgcyteJhnEz2dpy9i3cYy4pi9BoeV",
  },
  {
    symbol: "LULU",
    name: "lululemon athletica — Backpack Securities",
    mint: "LULUmT9VMttkfAJE236LXJcYJ2tTP7nunrSWR5G1BdS",
  },
  {
    symbol: "MGM",
    name: "MGM Resorts International — Backpack Securities",
    mint: "MGMuubtUEirmkhfEQdmGUh4pr7HuUdMWcZXFtpPbVJD",
  },
  {
    symbol: "PFE",
    name: "Pfizer — Backpack Securities",
    mint: "PFER6ENqP8r8NF3CqVt4mFowxsin3V5MLidBNQFCC3x",
  },
  {
    symbol: "QUBT",
    name: "Quantum Computing — Backpack Securities",
    mint: "QUBTAD8C9bMU9LvmMNgKPhrmBGbHvxpu6vfWQtThxxw",
  },
  {
    symbol: "RBLX",
    name: "Roblox — Backpack Securities",
    mint: "RBLXDGRD64AtRamHMFVcjqne3Ar7NLWtFtYNtsrf1cE",
  },
  {
    symbol: "RDDT",
    name: "Reddit — Backpack Securities",
    mint: "RDDTGbhHwVXfyCvQMXzzowKjf5qrYBZAnehoXW83ooh",
  },
  {
    symbol: "RIVN",
    name: "Rivian Automotive — Backpack Securities",
    mint: "RcZmt84VMJv9bDhKqmw1uWDahYrUT468VwAChTnfD8p",
  },
  {
    symbol: "SHOP",
    name: "Shopify — Backpack Securities",
    mint: "SH55hfaipFAbwT42nQYhRoM5o5t61QpkmJ6p62vXB3m",
  },
  {
    symbol: "SNAP",
    name: "Snap — Backpack Securities",
    mint: "SNAPcESrvnH8yUdgeMF6xm1hym9b6hW6s8YeqeHdZFz",
  },
  {
    symbol: "UPS",
    name: "United Parcel Service — Backpack Securities",
    mint: "UPSqUeMHcWbkdg784XuBUEF9DtySSnW9ur5LAVdcuB9",
  },
];

export type ListingRow = ListingMint & {
  onSunrise: boolean;
  spoof: boolean;
};

export type ListingsPayload = {
  listed: string;
  source: string;
  fetchedAt: number;
  sunriseOk: boolean;
  rows: ListingRow[];
};
