import {
  BeamItem,
  CommunityData,
  DeveloperData,
  Image,
  LocalizedNames,
  PublicInterestStats,
  Rates,
  Ticker,
  TrustScore,
} from "@coingecko/cg-api-ts/dist/types/model/type";

export interface LinksData {
  homepage: [string];
  blockchain_site: [string];
  official_forum_url: [string];
  chat_url: [string];
  announcement_url: [string];
  twitter_screen_name: string;
  facebook_username: string;
  bitcointalk_thread_identifier: number;
  telegram_channel_identifier: string;
  subreddit_url: string;
}

export interface MarketData {
  ath: Rates;
  ath_change_percentage: Rates;
  ath_date: {
    [date: string]: string;
  };
  atl: Rates;
  atl_change_percentage: Rates;
  atl_date: {
    [date: string]: string;
  };
  market_cap_rank: number;
  fully_diluted_valuation: Rates | {};
  current_price: Rates;
  market_cap: Rates;
  total_volume: Rates;
  high_24h: Rates;
  low_24h: Rates;
  price_change_percentage_24h_in_currency: Rates;
  price_change_percentage_7d_in_currency: Rates;
  price_change_percentage_14d_in_currency: Rates;
  price_change_percentage_30d_in_currency: Rates;
  price_change_percentage_60d_in_currency: Rates;
  price_change_percentage_200d_in_currency: Rates;
  price_change_percentage_1y_in_currency: Rates;
  market_cap_change_24h: string;
  market_cap_change_percentage_24h: string;
  volume_change_24h: string;
  volume_change_percentage_24h: string;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
}

export interface ICoinsId {
  id: string;
  symbol: string;
  name: string;
  public_notice: string | null;
  additional_notices: string[] | undefined;
  contract_address?: string;
  asset_platform_id?: string | null | undefined;
  localization: LocalizedNames;
  description: LocalizedNames;
  image: Image;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  public_interest_score: number;
  genesis_date: string;
  sentiment_votes_up_percentage: number | null;
  sentiment_votes_down_percentage: number | null;
  market_data: MarketData;
  community_data: CommunityData;
  developer_data: DeveloperData;
  public_interest_stats: PublicInterestStats;
  status_updates: BeamItem[];
  last_updated: Date;
  tickers: Ticker[];
  links: LinksData;
}

export interface ICoinsListItem {
  id: string;
  name: string;
  symbol: string;
}
