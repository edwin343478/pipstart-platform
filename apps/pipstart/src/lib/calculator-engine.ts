import { instruments } from "../app/tools/position-size-calculator/instruments";

export type TradeDirection = "long" | "short";
export type DrawdownUnit = "amount" | "percent";
export type ContributionTiming = "end" | "start";

function getInstrument(instrumentLabel: string) {
  const instrument = instruments.find(
    (candidate) => candidate.label === instrumentLabel,
  );

  if (!instrument) {
    throw new Error("Unsupported instrument.");
  }

  return instrument;
}

export function calculateRiskReward(
  direction: TradeDirection,
  entryPrice: number,
  stopLossPrice: number,
  targetPrice: number,
) {
  const riskDistance = Math.abs(entryPrice - stopLossPrice);
  const rewardDistance = Math.abs(targetPrice - entryPrice);
  const ratio = rewardDistance / riskDistance;

  return {
    breakEvenWinRate: 100 / (1 + ratio),
    direction,
    ratio,
    rewardDistance,
    riskDistance,
  };
}

export function calculatePositionSize(
  balance: number,
  riskPercent: number,
  stopLoss: number,
  conversionRate: number,
  instrumentLabel: string,
  accountCurrency: string,
) {
  const instrument = getInstrument(instrumentLabel);
  const riskAmount = balance * (riskPercent / 100);
  const riskPerUnit = stopLoss * instrument.pipSize * conversionRate;
  const positionSize = Math.floor(riskAmount / riskPerUnit);

  return {
    accountCurrency,
    balance,
    positionSize,
    riskAmount,
    lots: positionSize / instrument.contractSize,
  };
}

export function calculatePipValue(
  instrumentLabel: string,
  lots: number,
  conversionRate: number,
  accountCurrency: string,
) {
  const instrument = getInstrument(instrumentLabel);

  return {
    accountCurrency,
    instrument: instrument.label,
    lots,
    pipSize: instrument.pipSize,
    positionSize: lots * instrument.contractSize,
    valuePerPip:
      lots * instrument.contractSize * instrument.pipSize * conversionRate,
  };
}

export function calculateProfitLoss(
  direction: TradeDirection,
  instrumentLabel: string,
  lots: number,
  entryPrice: number,
  exitPrice: number,
  conversionRate: number,
  accountCurrency: string,
) {
  const instrument = getInstrument(instrumentLabel);
  const rawMovement = exitPrice - entryPrice;
  const priceMovement = direction === "long" ? rawMovement : -rawMovement;
  const positionSize = lots * instrument.contractSize;

  return {
    accountCurrency,
    direction,
    instrument: instrument.label,
    lots,
    pipMovement: priceMovement / instrument.pipSize,
    positionSize,
    priceMovement,
    profitLoss: priceMovement * positionSize * conversionRate,
  };
}

export function calculateMargin(
  instrumentLabel: string,
  lots: number,
  marketPrice: number,
  leverage: number,
  conversionRate: number,
  accountCurrency: string,
) {
  const instrument = getInstrument(instrumentLabel);
  const positionSize = lots * instrument.contractSize;
  const notionalValue = positionSize * marketPrice * conversionRate;

  return {
    accountCurrency,
    instrument: instrument.label,
    leverage,
    lots,
    marginRate: 100 / leverage,
    notionalValue,
    positionSize,
    requiredMargin: notionalValue / leverage,
  };
}

export function calculateDrawdown(
  startingBalance: number,
  drawdown: number,
  drawdownUnit: DrawdownUnit,
  accountCurrency: string,
) {
  const amountLost =
    drawdownUnit === "percent" ? startingBalance * (drawdown / 100) : drawdown;
  const remainingBalance = startingBalance - amountLost;

  return {
    accountCurrency,
    amountLost,
    drawdownPercent: (amountLost / startingBalance) * 100,
    recoveryPercent: (amountLost / remainingBalance) * 100,
    remainingBalance,
    startingBalance,
  };
}

export function calculateGainRecovery(
  currentBalance: number,
  recoveryTarget: number,
  gainPerPeriod: number,
  accountCurrency: string,
) {
  const rate = gainPerPeriod / 100;
  const periods = Math.ceil(
    Math.log(recoveryTarget / currentBalance) / Math.log(1 + rate),
  );

  return {
    accountCurrency,
    currentBalance,
    gainPerPeriod,
    periods,
    projectedBalance: currentBalance * (1 + rate) ** periods,
    recoveryTarget,
    totalGainNeeded: (recoveryTarget / currentBalance - 1) * 100,
  };
}

export function calculateCryptoPositionSize(
  balance: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number,
  asset: string,
  accountCurrency: string,
) {
  const riskAmount = balance * (riskPercent / 100);
  const riskPerCoin = Math.abs(entryPrice - stopLossPrice);
  const positionQuantity = riskAmount / riskPerCoin;

  return {
    accountCurrency,
    asset,
    balance,
    positionQuantity,
    positionValue: positionQuantity * entryPrice,
    riskAmount,
    riskPerCoin,
    stopDistancePercent: (riskPerCoin / entryPrice) * 100,
  };
}

export function calculateDollarCostAveraging(
  accountCurrency: string,
  assetSymbol: string,
  investmentPerPurchase: number,
  purchasesPerMonth: number,
  purchaseFrequency: string,
  durationMonths: number,
  startingPrice: number,
  endingPrice: number,
) {
  const purchaseCount = durationMonths * purchasesPerMonth;
  let units = 0;

  for (let index = 0; index < purchaseCount; index += 1) {
    const progress = purchaseCount === 1 ? 0 : index / (purchaseCount - 1);
    const price = startingPrice + (endingPrice - startingPrice) * progress;
    units += investmentPerPurchase / price;
  }

  const totalContributed = investmentPerPurchase * purchaseCount;
  const endingValue = units * endingPrice;

  return {
    accountCurrency,
    assetSymbol,
    averageCost: totalContributed / units,
    endingValue,
    illustratedDifference: endingValue - totalContributed,
    investmentPerPurchase,
    purchaseCount,
    purchaseFrequency,
    totalContributed,
    units,
  };
}

export function calculateCompoundGrowth(
  accountCurrency: string,
  startingAmount: number,
  contributionPerPeriod: number,
  periods: number,
  growthPerPeriod: number,
  contributionTiming: ContributionTiming,
) {
  const rate = growthPerPeriod / 100;
  let endingBalance = startingAmount;

  for (let index = 0; index < periods; index += 1) {
    if (contributionTiming === "start") {
      endingBalance += contributionPerPeriod;
    }
    endingBalance *= 1 + rate;
    if (contributionTiming === "end") {
      endingBalance += contributionPerPeriod;
    }
  }

  const addedContributions = contributionPerPeriod * periods;
  const totalContributed = startingAmount + addedContributions;

  return {
    accountCurrency,
    addedContributions,
    endingBalance,
    growthPerPeriod,
    illustratedGrowth: endingBalance - totalContributed,
    periods,
    startingAmount,
    totalContributed,
  };
}

export type RiskRewardResult = ReturnType<typeof calculateRiskReward>;
export type PositionSizeResult = ReturnType<typeof calculatePositionSize>;
export type PipValueResult = ReturnType<typeof calculatePipValue>;
export type ProfitLossResult = ReturnType<typeof calculateProfitLoss>;
export type MarginResult = ReturnType<typeof calculateMargin>;
export type DrawdownResult = ReturnType<typeof calculateDrawdown>;
export type GainRecoveryResult = ReturnType<typeof calculateGainRecovery>;
export type CryptoPositionSizeResult = ReturnType<
  typeof calculateCryptoPositionSize
>;
export type DollarCostAveragingResult = ReturnType<
  typeof calculateDollarCostAveraging
>;
export type CompoundGrowthResult = ReturnType<typeof calculateCompoundGrowth>;
