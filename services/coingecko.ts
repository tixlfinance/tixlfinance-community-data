import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ICoinsListItem } from "./../dao/ICoinGecko";
import { ICoinsId } from "./../dao/ICoinGecko";

export class CoinGecko {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL: "https://api.coingecko.com/api/v3",
    });
  }

  async getCoinList(): Promise<[ICoinsListItem]> {
    const result: AxiosResponse = await this.client.get("/coins/list");
    if (result.status != 200) throw Error(`Can't get list coin from CoinGecko`);
    return result.data;
  }

  async getCoinDetail(id: string): Promise<ICoinsId> {
    const result: AxiosResponse = await this.client.get(`/coins/${id}`);
    if (result.status != 200)
      throw Error(`Can't get coin detail from CoinGecko`);
    return result.data;
  }
}
