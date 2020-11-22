interface SocialSchema {
  name: "Twitter" | "Telegram" | "Medium" | "Reddit" | "Youtube";
  /**
   * @format url
   */
  url: string;
}

interface TokenomicsSchema {
  max_supply?: number;
  total_supply?: number;
  circulating_supply?: number;
}

export default interface ProjectSchema {
  name: string;
  symbol: string;
  coingecko_id?: string;
  coin_api_id?: string;
  /**
   * @format url
   */
  website: string;
  /**
   * @format url
   */
  source_code?: string;
  /**
   * @format url
   */
  white_paper?: string;
  /**
   * @minItems 1
   */
  socials: SocialSchema[];
  tokenomics: TokenomicsSchema;
}
