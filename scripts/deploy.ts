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
      const endpoint = process.env.MAIN_API_ENDPOINT as string;
      if (!endpoint) {
        throw new Error("Endpint API invalid")
      }
      const graphQLClient = new GraphQLClient(endpoint);
      graphQLClient.setHeaders({
        authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
      });

      const mutation = gql`
        mutation CrateAsset($data: [AssetGithub!]) {
          createAssetFromGithub(data: { assets: $data }) {
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
