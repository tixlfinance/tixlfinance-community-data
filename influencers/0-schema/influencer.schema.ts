export default interface InfluencerSchema {
  /**
   * @minLength 1
   */
  name: string;
  description?: string;
  twitter_username?: string;
  twitter_user_id?: string;
  youtube_username?: string;
  facebook_username?: string;
  instagram_username?: string;
}
