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
  const validatedValues = dirs.map((projectDir) => {
    const filePath = directoryPath + "/" + projectDir + "/info.json";
    return new Promise((resolve, _) => {
      fs.readFile(filePath, "utf8", (_, data) => {
        const parsed = JSON.parse(data);
        resolve({
          ...parsed,
          asset_id: projectDir,
        });
      });
    });
  });
  Promise.all(validatedValues)
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
        mutation CrateAsset($data: [AssetInput!]) {
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
