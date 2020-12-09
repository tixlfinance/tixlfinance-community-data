import { request, gql } from "graphql-request";

import { CoinGecko } from "./../services/coingecko";
import { IAsset } from "./../dao/IAssetGecko";
import { IAssets } from "./../dao/IAssetGecko";
import { ICoinsId } from "./../dao/ICoinGecko";
import { ICoinCompare } from "./../dao/IAssetGecko";
import PromisePool from "@supercharge/promise-pool";

function checkRangeValue(source: number, target: number): boolean {
  return target >= source * 0.98 && target <= source * 1.02;
}

async function getAllAssetFormBlockfyre(): Promise<IAsset[]> {
  const query = gql`
    {
      assets {
        id
        name
        coingecko_id
        market_cap_usd
        price_usd
      }
    }
  `;

  const result: IAssets = await request(
    "https://tixlfinance-backend-tmfcf.ondigitalocean.app/graphql",
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
        id: item.id,
        name: item.name,
        coingecko_id: item.coingecko_id,
        market_cap_usd: item.market_cap_usd,
        market_cap_usd_coin_gecko: result.market_data.market_cap.usd,
        price_usd: item.price_usd,
        price_usd_coin_gecko: result.market_data.current_price.usd,
        priceIsWithIn: checkRangeValue(
          Number(result.market_data.current_price.usd),
          item.price_usd
        ),
        marketCapIsWithIn: checkRangeValue(
          Number(result.market_data.market_cap.usd),
          item.market_cap_usd
        ),
      };
    });
  console.log("results: ", results);
  return results;
}

main();
