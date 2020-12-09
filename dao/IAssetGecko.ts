export interface IAsset {
  id: string;
  name: string;
  coingecko_id: string;
  market_cap_usd: number;
  price_usd: number;
}

export interface IAssets {
  assets: IAsset[];
}

export interface ICoinCompare {
  id: string;
  priceIsWithIn: boolean;
  marketCapIsWithIn: boolean;
}
