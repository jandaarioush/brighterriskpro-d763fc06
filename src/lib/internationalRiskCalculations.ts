/**
 * International Market Risk Calculations
 * For NinjaTrader futures trading
 */

import { NinjaTraderAsset, getAssetBySymbol, DEFAULT_EXCHANGE_RATE } from './ninjatraderAssets';

export interface InternationalTradeResult {
  resultUSD: number;
  resultBRL: number;
  ticks: number;
  grossResultUSD: number;
  commission: number;
}

export interface PositionSizing {
  maxContracts: number;
  contractsByMargin: number;
  contractsByRisk: number;
  marginRequired: number;
  maxLossUSD: number;
  maxLossBRL: number;
  effectiveLeverage: number;
}

/**
 * Calculate trade result from prices
 */
export function calculateInternationalTradeResult(
  entryPrice: number,
  exitPrice: number,
  tickSize: number,
  tickValue: number,
  contracts: number,
  commission: number = 0,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE,
  tradeType: 'long' | 'short' = 'long'
): InternationalTradeResult {
  // Calculate price difference based on trade type
  const priceDiff = tradeType === 'long' 
    ? exitPrice - entryPrice 
    : entryPrice - exitPrice;
  
  // Calculate ticks gained/lost
  const ticks = priceDiff / tickSize;
  
  // Calculate gross result (before commission)
  const grossResultUSD = ticks * tickValue * contracts;
  
  // Calculate total commission
  const totalCommission = commission * contracts;
  
  // Net result
  const resultUSD = grossResultUSD - totalCommission;
  const resultBRL = resultUSD * exchangeRate;
  
  return {
    resultUSD,
    resultBRL,
    ticks,
    grossResultUSD,
    commission: totalCommission,
  };
}

/**
 * Calculate result from ticks directly
 */
export function calculateResultFromTicks(
  ticks: number,
  tickValue: number,
  contracts: number,
  commission: number = 0,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): InternationalTradeResult {
  const grossResultUSD = ticks * tickValue * contracts;
  const totalCommission = commission * contracts;
  const resultUSD = grossResultUSD - totalCommission;
  const resultBRL = resultUSD * exchangeRate;
  
  return {
    resultUSD,
    resultBRL,
    ticks,
    grossResultUSD,
    commission: totalCommission,
  };
}

/**
 * Calculate position sizing based on risk parameters
 */
export function calculatePositionSizing(
  capitalUSD: number,
  asset: NinjaTraderAsset,
  stopLossTicks: number,
  maxRiskPercent: number,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): PositionSizing {
  // Maximum risk value in USD
  const maxRiskValue = capitalUSD * (maxRiskPercent / 100);
  
  // Stop loss value per contract in USD
  const stopLossValuePerContract = stopLossTicks * asset.tickValue;
  
  // Calculate contracts by different constraints
  const contractsByMargin = Math.floor(capitalUSD / asset.dayMargin);
  const contractsByRisk = stopLossValuePerContract > 0 
    ? Math.floor(maxRiskValue / stopLossValuePerContract)
    : 0;
  
  // Take the minimum
  const maxContracts = Math.min(contractsByMargin, contractsByRisk);
  
  // Calculate margin required for max contracts
  const marginRequired = maxContracts * asset.dayMargin;
  
  // Calculate max loss
  const maxLossUSD = maxContracts * stopLossValuePerContract;
  const maxLossBRL = maxLossUSD * exchangeRate;
  
  // Calculate effective leverage
  // Notional value = price * point value * contracts (approximated)
  const effectiveLeverage = marginRequired > 0 
    ? capitalUSD / marginRequired
    : 0;
  
  return {
    maxContracts,
    contractsByMargin,
    contractsByRisk,
    marginRequired,
    maxLossUSD,
    maxLossBRL,
    effectiveLeverage,
  };
}

/**
 * Calculate required margin for given contracts
 */
export function calculateRequiredMargin(
  symbol: string,
  contracts: number
): number {
  const asset = getAssetBySymbol(symbol);
  if (!asset) return 0;
  return asset.dayMargin * contracts;
}

/**
 * Calculate P&L percentage based on margin used
 */
export function calculatePnLPercentage(
  resultUSD: number,
  marginUsed: number
): number {
  if (marginUsed <= 0) return 0;
  return (resultUSD / marginUsed) * 100;
}

/**
 * Format currency values
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format price based on tick size precision
 */
export function formatPrice(price: number, tickSize: number): string {
  const decimals = Math.max(0, -Math.floor(Math.log10(tickSize)));
  return price.toFixed(decimals);
}
