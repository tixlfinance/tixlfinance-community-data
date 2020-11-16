interface ExchangeScoreSchema {
  decentralization_score?: number;
  regulation_score?: number;
  adoption_score?: number;
  total_score: number;
  wash_trading_score?: number;
}

export default interface ExchangeSchema {
  exchange_id: string;
  name: string;
  coingecko_id?: string;
  coin_api_id?: string;
  /**
   * @format url
   */
  website: string;
  exchange_score: ExchangeScoreSchema;
}
