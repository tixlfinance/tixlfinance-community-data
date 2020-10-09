interface SocialSchema {
  name: "Twitter" | "Telegram" | "Medium" | "Reddit" | "Youtube";
  /**
   * @format url
   */
  url: string;
  handle: string;
}

interface BlockchainSchema {
  name: string;
  /**
   * @format url
   */
  explorer: string;
}

interface TokenomicsSchema {
  max_supply?: string;
  total_supply?: string;
  circulating_supply?: string;
}

export default interface InformationTokenSchema {
  name: string;
  symbol: string;
  coingecko_asset_id?: string;
  coin_api_asset_id?: string;
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
  white_paper: string;
  /**
   * @minimum 1
   * @maximum 100
   */
  short_description: string;
  /**
   * @minimum 1
   * @maximum 100
   */
  description: string;
  /**
   * @minItems 1
   */
  socials: SocialSchema[];
  /**
   * @minItems 1
   */
  blockchains: BlockchainSchema[];
  tokenomics: TokenomicsSchema;
}
