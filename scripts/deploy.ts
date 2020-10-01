import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

dotenv.config();
global.Headers = global.Headers || Headers;

const directoryPath = path.join(__dirname, "./../projects");

fs.readdir(directoryPath, (err, dirs) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  const validatedValues = dirs.map((subDirs) => {
    const filePath = directoryPath + "/" + subDirs + "/info.json";
    return new Promise((resolve, _) => {
      fs.readFile(filePath, "utf8", (_, data) => {
        resolve(JSON.parse(data));
      });
    });
  });
  Promise.all(validatedValues)
    .then(async (values) => {
      const endpoint = process.env.MAIN_API_URL as string;
      const graphQLClient = new GraphQLClient(endpoint);
      graphQLClient.setHeaders({
        authorization: `Bearer ${process.env.API_ASSETS_KET}`,
      });

      // const mutation = gql`
      //   mutation CrateAsset($data: [AssetInput]) {
      //     createAsset(CreateAssetInput: { assets: $value }) {
      //       [id]
      //     }
      //   }
      // `;

      const mutation = gql`
        mutation CrateAsset($data: String) {
          createAsset(
            CreateAssetInput: { asset_id: $value, coingecko_asset_id: "ididid" }
          ) {
            id
            coingecko_asset_id
          }
        }
      `;

      const variables = {
        data: "test",
      };

      const response = await graphQLClient.request(mutation, variables);
      console.log(response);
      if (!response) process.exit(1);
    })
    .catch((err) => {
      console.log(err);
    });
});
