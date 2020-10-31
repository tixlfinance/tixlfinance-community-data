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

  console.log("changedFiles", JSON.stringify(changedFiles));
  const updatedProjects = changedFiles.map((dir) => {
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

  if (updatedProjects.length > 0) {
    Promise.all(updatedProjects)
      .then(async (projects: any[]) => {
        for (const project of projects) {
          const endpoint = process.env.MAIN_API_ENDPOINT as string;
          if (!endpoint) {
            throw new Error("API endpoint invalid");
          }
          const graphQLClient = new GraphQLClient(endpoint);
          graphQLClient.setHeaders({
            authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
          });

          const existsQuery = gql`
            query {assetByAssetId(asset_id: "${project.asset_id}") {id}}
          `;

          const existsResponse = await graphQLClient.request(existsQuery);
          const alreadyExists = existsResponse.assetByAssetId !== null;
          const mutationToUse = alreadyExists ? 'updateAssetFromGithub' : 'createAssetFromGithub';

          const mutation = gql`
            mutation CreateAsset($data: AssetGithubInput!) {
              ${mutationToUse}(data: $data) {
                id
              }
            }
          `;

          const variables = {
            data: project,
          };

          const response = await graphQLClient.request(mutation, variables);
          if (!response) {
            throw new Error('No response from mutation call');
          }
          console.info(`${alreadyExists ? 'Updated' : 'Created'} project ${project.asset_id}`);
        }
      })
      .catch((err) => {
        console.log(err.message);
        process.exit(1);
      });
  }
});
