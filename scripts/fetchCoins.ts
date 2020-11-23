import fs from "fs";
import path from "path";
import PromisePool from "@supercharge/promise-pool";
import InformationTokenSchema from "../projects/0-schema/project.schema";
import { ICoinsId } from "./../dao/ICoinGecko";
import { ICoinsListItem } from "./../dao/ICoinGecko";
import { CoinGecko } from "./../services/coingecko";
import axios, { AxiosResponse } from "axios";

const projectDirectoryPath = path.join(__dirname, "./../projects");

const main = async () => {
  const coinGecko = new CoinGecko();
  const listCoin: ICoinsListItem[] = await coinGecko.getCoinList();
  await PromisePool.withConcurrency(4)
    .for(listCoin)
    .process(async (item) => {
      const coinDetail: ICoinsId = await coinGecko.getCoinDetail(item.id);
      const coin: InformationTokenSchema = {
        name: coinDetail.name,
        symbol: coinDetail.symbol,
        website: coinDetail.links.homepage[0],
        coingecko_id: item.id,
        coin_api_id: item.id.toUpperCase(),
        socials: [],
        trading_pairs: [],
        tokenomics: {
          max_supply: coinDetail.market_data.max_supply ?? 0,
          total_supply: coinDetail.market_data.total_supply ?? 0,
          circulating_supply: coinDetail.market_data.circulating_supply ?? 0,
        },
      };

      if (coinDetail.links.facebook_username) {
        coin.socials.push({
          name: "Facebook",
          url: `https://www.facebook.com/${coinDetail.links.facebook_username}`,
        });
      }

      if (coinDetail.links.subreddit_url) {
        coin.socials.push({
          name: "Reddit",
          url: `${coinDetail.links.subreddit_url}`,
        });
      }

      coinDetail.tickers.forEach((item) => {
        coin.trading_pairs.push({
          base: item.base,
          quote: item.target,
          pair_id: `${item.base}_${item.target}`,
          exchange_id: item.market.identifier,
        });
      });

      const coinDirectoryPath = `${projectDirectoryPath}/${item.id}`;
      if (!fs.existsSync(coinDirectoryPath)) {
        fs.mkdirSync(coinDirectoryPath);
      }

      if (coinDetail.image.small) {
        const res: AxiosResponse = await axios.get(coinDetail.image.small, {
          responseType: "stream",
        });

        const writer = fs.createWriteStream(`${coinDirectoryPath}/logo.png`);
        res.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      }

      fs.writeFileSync(
        `${coinDirectoryPath}/info.json`,
        JSON.stringify(coin, null, 2),
        "utf8"
      );
      return;
    });

  process.exit(0);
};

main();
