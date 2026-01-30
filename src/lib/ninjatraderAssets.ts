/**
 * NinjaTrader Asset Database
 * Based on official NinjaTrader margin requirements
 * https://ninjatrader.com/pricing/margins/
 */

export interface NinjaTraderAsset {
  symbol: string;
  name: string;
  exchange: string;
  group: string;
  dayMargin: number;        // Day trading margin (USD)
  initialMargin: number;    // Overnight/initial margin (USD)
  tickSize: number;         // Minimum price movement
  tickValue: number;        // Value per tick (USD)
  pointValue: number;       // Value per point (USD)
  currency: 'USD' | 'EUR';
}

export const NINJATRADER_ASSETS: NinjaTraderAsset[] = [
  // Micro Index Futures
  {
    symbol: 'MES',
    name: 'Micro E-mini S&P 500',
    exchange: 'CME',
    group: 'Micro Indices',
    dayMargin: 50,
    initialMargin: 2498.60,
    tickSize: 0.25,
    tickValue: 1.25,
    pointValue: 5,
    currency: 'USD',
  },
  {
    symbol: 'MNQ',
    name: 'Micro E-mini NASDAQ-100',
    exchange: 'CME',
    group: 'Micro Indices',
    dayMargin: 100,
    initialMargin: 3686.57,
    tickSize: 0.25,
    tickValue: 0.50,
    pointValue: 2,
    currency: 'USD',
  },
  {
    symbol: 'M2K',
    name: 'Micro E-mini Russell 2000',
    exchange: 'CME',
    group: 'Micro Indices',
    dayMargin: 50,
    initialMargin: 1045.02,
    tickSize: 0.10,
    tickValue: 0.50,
    pointValue: 5,
    currency: 'USD',
  },
  {
    symbol: 'MYM',
    name: 'Micro E-mini Dow',
    exchange: 'CME',
    group: 'Micro Indices',
    dayMargin: 50,
    initialMargin: 1567.71,
    tickSize: 1.00,
    tickValue: 0.50,
    pointValue: 0.50,
    currency: 'USD',
  },
  
  // E-Mini Index Futures
  {
    symbol: 'ES',
    name: 'E-Mini S&P 500',
    exchange: 'CME',
    group: 'E-Mini Indices',
    dayMargin: 500,
    initialMargin: 24985.95,
    tickSize: 0.25,
    tickValue: 12.50,
    pointValue: 50,
    currency: 'USD',
  },
  {
    symbol: 'NQ',
    name: 'E-Mini NASDAQ 100',
    exchange: 'CME',
    group: 'E-Mini Indices',
    dayMargin: 1000,
    initialMargin: 36865.75,
    tickSize: 0.25,
    tickValue: 5.00,
    pointValue: 20,
    currency: 'USD',
  },
  {
    symbol: 'RTY',
    name: 'E-Mini Russell 2000',
    exchange: 'CME',
    group: 'E-Mini Indices',
    dayMargin: 500,
    initialMargin: 10450.22,
    tickSize: 0.10,
    tickValue: 5.00,
    pointValue: 50,
    currency: 'USD',
  },
  {
    symbol: 'YM',
    name: 'E-Mini Dow',
    exchange: 'CBOT',
    group: 'E-Mini Indices',
    dayMargin: 500,
    initialMargin: 15674.35,
    tickSize: 1.00,
    tickValue: 5.00,
    pointValue: 5,
    currency: 'USD',
  },
  
  // Energy Futures
  {
    symbol: 'MCL',
    name: 'Micro Crude Oil',
    exchange: 'NYMEX',
    group: 'Energy',
    dayMargin: 100,
    initialMargin: 470.99,
    tickSize: 0.01,
    tickValue: 1.00,
    pointValue: 100,
    currency: 'USD',
  },
  {
    symbol: 'CL',
    name: 'Crude Oil',
    exchange: 'NYMEX',
    group: 'Energy',
    dayMargin: 1000,
    initialMargin: 4687.83,
    tickSize: 0.01,
    tickValue: 10.00,
    pointValue: 1000,
    currency: 'USD',
  },
  {
    symbol: 'NG',
    name: 'Natural Gas',
    exchange: 'NYMEX',
    group: 'Energy',
    dayMargin: 1000,
    initialMargin: 12697.00,
    tickSize: 0.001,
    tickValue: 10.00,
    pointValue: 10000,
    currency: 'USD',
  },
  
  // Metals Futures
  {
    symbol: 'MGC',
    name: 'E-Micro Gold',
    exchange: 'COMEX',
    group: 'Metals',
    dayMargin: 200,
    initialMargin: 2917.20,
    tickSize: 0.10,
    tickValue: 1.00,
    pointValue: 10,
    currency: 'USD',
  },
  {
    symbol: 'GC',
    name: 'Gold',
    exchange: 'COMEX',
    group: 'Metals',
    dayMargin: 2000,
    initialMargin: 29169.80,
    tickSize: 0.10,
    tickValue: 10.00,
    pointValue: 100,
    currency: 'USD',
  },
  {
    symbol: 'SIL',
    name: 'Micro Silver',
    exchange: 'COMEX',
    group: 'Metals',
    dayMargin: 300,
    initialMargin: 3424.00,
    tickSize: 0.005,
    tickValue: 5.00,
    pointValue: 1000,
    currency: 'USD',
  },
  {
    symbol: 'SI',
    name: 'Silver',
    exchange: 'COMEX',
    group: 'Metals',
    dayMargin: 4000,
    initialMargin: 68464.00,
    tickSize: 0.005,
    tickValue: 25.00,
    pointValue: 5000,
    currency: 'USD',
  },
  
  // Currency Futures
  {
    symbol: '6E',
    name: 'Euro FX',
    exchange: 'CME',
    group: 'Currencies',
    dayMargin: 500,
    initialMargin: 3190.00,
    tickSize: 0.00005,
    tickValue: 6.25,
    pointValue: 125000,
    currency: 'USD',
  },
  {
    symbol: '6B',
    name: 'British Pound',
    exchange: 'CME',
    group: 'Currencies',
    dayMargin: 500,
    initialMargin: 2200.00,
    tickSize: 0.0001,
    tickValue: 6.25,
    pointValue: 62500,
    currency: 'USD',
  },
  {
    symbol: '6J',
    name: 'Japanese Yen',
    exchange: 'CME',
    group: 'Currencies',
    dayMargin: 500,
    initialMargin: 2900.00,
    tickSize: 0.0000005,
    tickValue: 6.25,
    pointValue: 12500000,
    currency: 'USD',
  },
  {
    symbol: '6A',
    name: 'Australian Dollar',
    exchange: 'CME',
    group: 'Currencies',
    dayMargin: 400,
    initialMargin: 1700.00,
    tickSize: 0.0001,
    tickValue: 10.00,
    pointValue: 100000,
    currency: 'USD',
  },
  
  // Cryptocurrency Futures
  {
    symbol: 'MBT',
    name: 'Micro Bitcoin',
    exchange: 'CME',
    group: 'Crypto',
    dayMargin: 100,
    initialMargin: 2351.80,
    tickSize: 5.00,
    tickValue: 0.50,
    pointValue: 0.10,
    currency: 'USD',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    exchange: 'CME',
    group: 'Crypto',
    dayMargin: 1000,
    initialMargin: 117590.00,
    tickSize: 5.00,
    tickValue: 25.00,
    pointValue: 5,
    currency: 'USD',
  },
  {
    symbol: 'MET',
    name: 'Micro Ether',
    exchange: 'CME',
    group: 'Crypto',
    dayMargin: 50,
    initialMargin: 471.97,
    tickSize: 0.05,
    tickValue: 0.25,
    pointValue: 5,
    currency: 'USD',
  },
  
  // Agricultural Futures
  {
    symbol: 'ZC',
    name: 'Corn',
    exchange: 'CBOT',
    group: 'Agriculture',
    dayMargin: 500,
    initialMargin: 1540.00,
    tickSize: 0.25,
    tickValue: 12.50,
    pointValue: 50,
    currency: 'USD',
  },
  {
    symbol: 'ZS',
    name: 'Soybeans',
    exchange: 'CBOT',
    group: 'Agriculture',
    dayMargin: 700,
    initialMargin: 2420.00,
    tickSize: 0.25,
    tickValue: 12.50,
    pointValue: 50,
    currency: 'USD',
  },
  {
    symbol: 'ZW',
    name: 'Wheat',
    exchange: 'CBOT',
    group: 'Agriculture',
    dayMargin: 600,
    initialMargin: 1815.00,
    tickSize: 0.25,
    tickValue: 12.50,
    pointValue: 50,
    currency: 'USD',
  },
];

// Group assets by category
export const NINJATRADER_ASSET_GROUPS = [
  'Micro Indices',
  'E-Mini Indices',
  'Energy',
  'Metals',
  'Currencies',
  'Crypto',
  'Agriculture',
] as const;

// Helper function to get asset by symbol
export function getAssetBySymbol(symbol: string): NinjaTraderAsset | undefined {
  return NINJATRADER_ASSETS.find((a) => a.symbol === symbol);
}

// Helper function to get assets by group
export function getAssetsByGroup(group: string): NinjaTraderAsset[] {
  return NINJATRADER_ASSETS.filter((a) => a.group === group);
}

// Default exchange rate USD/BRL (user can update)
export const DEFAULT_EXCHANGE_RATE = 5.50;
