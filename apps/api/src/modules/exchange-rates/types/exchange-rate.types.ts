export type HomepagePairConfig = {
  baseCurrency: string;
  providerQuoteCurrency: 'IRR';
  displayQuoteCurrency: 'TOMAN';
  sourceKeys: string[];
};

export type ProviderRate = {
  baseCurrency: string;
  quoteCurrency: 'IRR';
  marketRateIrr: number | null;
  sourceKey: string | null;
  sourceTimestamp: Date | null;
  sourceDate?: string | null;
  providerChangeAmount?: number | null;
  unavailable: boolean;
};

export type PublicExchangeRate = {
  baseCurrency: string;
  quoteCurrency: 'TOMAN';
  marketRateToman: number | null;
  buyRateToman: number | null;
  sellRateToman: number | null;
  source: string;
  sourceKey: string | null;
  updatedAt: string;
  stale: boolean;
  unavailable: boolean;
  direction: 'up' | 'down' | 'stable' | 'unknown';
};

export type PublicCatalogRate = {
  code: string;
  marketRateToman: number;
  changeAmountToman: number | null;
  sourceKey: string;
  sourceTimestamp: string | null;
  sourceDate: string | null;
  assetType: 'currency' | 'digital' | 'gold';
};

export const HOMEPAGE_PAIRS: HomepagePairConfig[] = [
  { baseCurrency: 'USD', providerQuoteCurrency: 'IRR', displayQuoteCurrency: 'TOMAN', sourceKeys: ['harat_naghdi_sell', 'harat_naghdi_buy', 'dollar_sell', 'dollar_buy', 'dollar', 'dollar_rate'] },
  { baseCurrency: 'CAD', providerQuoteCurrency: 'IRR', displayQuoteCurrency: 'TOMAN', sourceKeys: ['cad', 'dollar_canada', 'canada_dollar'] },
  { baseCurrency: 'AUD', providerQuoteCurrency: 'IRR', displayQuoteCurrency: 'TOMAN', sourceKeys: ['aud', 'dollar_australia', 'australia_dollar'] },
  { baseCurrency: 'EUR', providerQuoteCurrency: 'IRR', displayQuoteCurrency: 'TOMAN', sourceKeys: ['eur', 'euro', 'euro_sell', 'euro_buy'] },
  { baseCurrency: 'AED', providerQuoteCurrency: 'IRR', displayQuoteCurrency: 'TOMAN', sourceKeys: ['dirham_dubai', 'dirham', 'dirham_sell', 'dirham_buy', 'aed'] },
  { baseCurrency: 'OMR', providerQuoteCurrency: 'IRR', displayQuoteCurrency: 'TOMAN', sourceKeys: ['omr', 'rial_omani', 'omani_rial'] },
  { baseCurrency: 'TRY', providerQuoteCurrency: 'IRR', displayQuoteCurrency: 'TOMAN', sourceKeys: ['try', 'lira_turkey', 'turkey_lira', 'lira'] }
];

export const CURATED_CATALOG_KEYS = new Map([
  ['usd', { code: 'USD', assetType: 'currency' }],
  ['eur', { code: 'EUR', assetType: 'currency' }],
  ['gbp', { code: 'GBP', assetType: 'currency' }],
  ['aed', { code: 'AED', assetType: 'currency' }],
  ['try', { code: 'TRY', assetType: 'currency' }],
  ['jpy', { code: 'JPY', assetType: 'currency' }],
  ['btc', { code: 'BTC', assetType: 'digital' }],
  ['eth', { code: 'ETH', assetType: 'digital' }],
  ['xrp', { code: 'XRP', assetType: 'digital' }],
  ['bch', { code: 'BCH', assetType: 'digital' }],
  ['ltc', { code: 'LTC', assetType: 'digital' }],
  ['bnb', { code: 'BNB', assetType: 'digital' }],
  ['usdt', { code: 'USDT', assetType: 'digital' }],
  ['doge', { code: 'DOGE', assetType: 'digital' }],
  ['18ayar', { code: '18AYAR', assetType: 'gold' }],
  ['sekkeh', { code: 'SEKKEH', assetType: 'gold' }],
  ['bahar', { code: 'BAHAR', assetType: 'gold' }],
  ['nim', { code: 'NIM', assetType: 'gold' }],
  ['rob', { code: 'ROB', assetType: 'gold' }]
] as const);
