import { request, gql } from "graphql-request";

import { CoinGecko } from "./../services/coingecko";
import { IAsset } from "./../dao/IAssetGecko";
import { IAssets } from "./../dao/IAssetGecko";
import { ICoinsId } from "./../dao/ICoinGecko";
import { ICoinCompare } from "./../dao/IAssetGecko";
import PromisePool from "@supercharge/promise-pool";

function checkRangeValue(source: number, target: number): boolean {
  return source * 0.98 >= target && source * 1.02 <= target;
}

async function getAllAssetFormBlockfyre(): Promise<IAsset[]> {
  const query = gql`
    {
      assets {
        coingecko_id
        market_cap_usd
        price_usd
      }
    }
  `;

  const result: IAssets = await request(
    "https://blockfyre-main-api-staging.herokuapp.com/graphql",
    query
  );

  return result.assets;
}

async function main(): Promise<ICoinCompare[]> {
  const assets: IAsset[] = await getAllAssetFormBlockfyre();
  const coinGecko = new CoinGecko();
  const { results } = await PromisePool.withConcurrency(10)
    .for(assets)
    .process(async (item: IAsset) => {
      const result: ICoinsId = await coinGecko.getCoinDetail(item.coingecko_id);
      return {
        id: item._id,
        coingecko_id: item.coingecko_id,
        priceIsWithIn: checkRangeValue(
          Number(result.market_data.current_price),
          item.price_usd
        ),
        marketCapIsWithIn: checkRangeValue(
          Number(result.market_data.market_cap),
          item.market_cap_usd
        ),
      };
    });
  console.log("results: ", results);
  return results;
}

main();
