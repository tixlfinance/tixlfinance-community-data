// trigger action comment 3

import { assertType } from 'graphql';

// const to play around with
const FACTOR_VOLUME = 1;
const FACTOR_LIQUIDITY = 2;
const FACTOR_EXCHANGES = 1;
const FACTOR_SUPPLY = 1;
const FACTOR_SOCIAL = 2;

const SCORE_UNDEFINED = 0;
const SCORE_MAX_VALUE = 100;

interface Tokenomics {
  circulating_supply?: number;
  total_supply?: number;
}

interface Asset {
  asset_id: string;
  exchanges_data: AssetExchangeData[];
  tokenomics: Tokenomics;
  market_cap_usd?: number;
  volume_24h_usd?: number;
  slippage_100USD: number;
  slippage_1000USD: number;
  slippage_10000USD: number;
  slippage_100000USD: number;
}

interface AssetExchangeData {
  exchange: Exchange;
  quality_score?: 'green' | 'yellow' | 'red';
  slippage_100000USD?: number;
}

interface ExchangeScore {
  total_score?: number;
}

interface Exchange {
  coingecko_trust_score?: number;
  exchange_score?: ExchangeScore;
  quality_score?: number;
}

interface Score {
  total_score: number;
  volume_score: number;
  real_liquidity_score: number;
  exchanges_score: number;
  supply_score: number;
  sentiment_score: number;
}

interface SentimentData {
  socialVolumeNormalizationFactor: number;
  weightedSentiment: number;
}

const getSlippage = (asset: Asset, usd: number) =>
  Math.min(
    ...asset.exchanges_data
      .filter((el) => !!el[`slippage_${usd}USD`])
      .map((el) => el[`slippage_${usd}USD`] || 1)
  );

const getLiquidityScoreFromSlippage = (slippage100000Usd: number) => {
  let liquidityScore = SCORE_UNDEFINED;

  if (slippage100000Usd) {
    liquidityScore =
      SCORE_MAX_VALUE - (slippage100000Usd || 1) * SCORE_MAX_VALUE;
    if (liquidityScore < 0) {
      liquidityScore = 0;
    }
  }

  return liquidityScore;
};

export const calcLiquidityScore = (assetExchangeData: AssetExchangeData): number => {
  return getLiquidityScoreFromSlippage(assetExchangeData.slippage_100000USD!);
}

export function calcScore(asset: Asset, sentimentData: SentimentData): Score {
  let volumeScore = SCORE_UNDEFINED;
  let liquidityScore = SCORE_UNDEFINED;
  let exchangesScore = SCORE_UNDEFINED;
  let socialScore = SCORE_UNDEFINED;
  let supplyScore = SCORE_UNDEFINED;

  console.log('calc for', asset.asset_id);

  // the volume score is defined by
  if (asset.market_cap_usd && asset.volume_24h_usd) {
    let volumeScoreRatio = asset.volume_24h_usd / asset.market_cap_usd;

    if (volumeScoreRatio > 1) {
      volumeScoreRatio = 1;
    }

    volumeScore = volumeScoreRatio * SCORE_MAX_VALUE;
  }

  if (asset.exchanges_data?.length > 0) {
    // calculate the exchange score according to the quality of exchanges a project is listed on
    exchangesScore = 0;
    asset.exchanges_data
      .filter((exchangeData) => !!exchangeData?.exchange?.exchange_score?.total_score)
      .forEach((exchangeData: AssetExchangeData) => {
        console.log('# forEach', exchangeData.quality_score);
        exchangesScore += exchangeData.exchange?.exchange_score?.total_score!;
      });
    exchangesScore = exchangesScore / asset.exchanges_data.length;
    console.log('exchangesScore', exchangesScore);

    // now lets calculate the liquidity score according to the slippage
    liquidityScore = getLiquidityScoreFromSlippage(asset.slippage_100000USD);
  }

  // the social score is calculated by sentiment and reach of this messages - normalized again bitcoin
  if (sentimentData) {
    const baseValue = SCORE_MAX_VALUE / 2;
    const rangeFactor = baseValue / 10;

    // sentiment is a value between -1 and 1
    const sentiment = sentimentData.weightedSentiment;

    // normalizationFactor is a value between 0 and 10
    const normalizationFactor = sentimentData.socialVolumeNormalizationFactor;

    socialScore = baseValue + sentiment * normalizationFactor * rangeFactor;
  }

  // the supply score is determined by comparing the circulating vs the total supply
  if (asset.tokenomics?.circulating_supply && asset.tokenomics?.total_supply) {
    supplyScore =
      (asset.tokenomics?.circulating_supply / asset.tokenomics?.total_supply) *
      SCORE_MAX_VALUE;
  }

  const factorSum =
    FACTOR_VOLUME +
    FACTOR_LIQUIDITY +
    FACTOR_EXCHANGES +
    FACTOR_SUPPLY +
    FACTOR_SOCIAL;
  const totalScore =
    (FACTOR_VOLUME * volumeScore +
      FACTOR_LIQUIDITY * liquidityScore +
      FACTOR_EXCHANGES * exchangesScore +
      FACTOR_SUPPLY * supplyScore +
      FACTOR_SOCIAL * socialScore) /
    factorSum;

  // use Math.round(value * 100) / 100 to ensure 2 decimals
  return {
    total_score: Math.round(totalScore * 100) / 100,
    volume_score: Math.round(volumeScore * 100) / 100,
    real_liquidity_score: Math.round(liquidityScore * 100) / 100,
    exchanges_score: Math.round(exchangesScore * 100) / 100,
    supply_score: Math.round(supplyScore * 100) / 100,
    sentiment_score: Math.round(socialScore * 100) / 100,
  };
}
