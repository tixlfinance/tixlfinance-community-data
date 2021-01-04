export default interface InfluencerSchema {
  /**
   * @minLength 1
   */
  name: string;
  description?: string;
  twitter_username?: string;
  youtube_username?: string;
  facebook_username?: string;
  instagram_username?: string;
}
