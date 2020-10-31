import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

dotenv.config();
global.Headers = global.Headers || Headers;

const directoryPath = path.join(__dirname, "./../projects");

const changedFiles = process.argv.slice(2);

fs.readdir(directoryPath, (err, _) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  const validatedValues = changedFiles.map((dir) => {
    const dirChange = dir.split("/", 3);
    if (dir.includes("projects") && dir.includes("json")) {
      const filePath = directoryPath + "/" + dirChange[1] + "/info.json";
      return new Promise((resolve, _) => {
        fs.readFile(filePath, "utf8", (_, data) => {
          const parsed = JSON.parse(data);
          resolve({
            ...parsed,
            asset_id: dirChange[1],
          });
        });
      });
    }
  });
  const filterNull = validatedValues.filter((data) => data);
  Promise.all(filterNull)
    .then(async (values) => {
      const endpoint = process.env.MAIN_API_ENDPOINT as string;
      if (!endpoint) {
        throw new Error("API endpoint invalid");
      }
      const graphQLClient = new GraphQLClient(endpoint);
      graphQLClient.setHeaders({
        authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
      });

      const mutation = gql`
        mutation CrateAsset($data: [AssetGithub!]) {
          updateOrCreateAssetFromGithub(data: { assets: $data }) {
            id
          }
        }
      `;

      const variables = {
        data: values,
      };

      const response = await graphQLClient.request(mutation, variables);
      console.log(response);
      if (!response) process.exit(1);
    })
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });
});
