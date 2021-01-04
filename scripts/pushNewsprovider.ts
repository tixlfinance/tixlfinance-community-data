import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

dotenv.config();
global.Headers = global.Headers || Headers;

const directoryPath = path.join(__dirname, "./../newsprovider");

const changedFiles = process.argv.slice(2);

fs.readdir(directoryPath, (err, _) => {
  if (err) {
    throw err;
  }

  console.log("changedFiles", JSON.stringify(changedFiles));
  const updatedNewsprovider = changedFiles
    .map((dir) => {
      const dirChange = dir.split("/", 3);
      if (dir.includes("newsprovider")) {
        const filePath = directoryPath + "/" + dirChange[1] + "/info.json";
        const logoPath = "/newsprovider/" + dirChange[1] + "/logo.png";
        return new Promise((resolve, _) => {
          fs.readFile(filePath, "utf8", (_, data) => {
            if (data) {
              const parsed = JSON.parse(data);
              resolve({
                ...parsed,
                logo: parsed.logo || logoPath,
              });
            }
          });
        });
      }
    })
    .filter((file) => !!file);

  if (updatedNewsprovider.length > 0) {
    Promise.all(updatedNewsprovider)
      .then(async (newsproviders: any[]) => {
        for (const newsprovider of newsproviders) {
          console.log("Processing category", JSON.stringify(newsprovider));
          delete newsprovider.__triggerUpdate;

          const endpoint = process.env.MAIN_API_ENDPOINT as string;
          if (!endpoint) {
            throw new Error("API endpoint invalid");
          }
          const graphQLClient = new GraphQLClient(endpoint);
          graphQLClient.setHeaders({
            authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
          });

          const existsQuery = gql`
                    query {newsProviderById(news_provider_id: "${newsprovider.url}") {_id}}
                `;

          const existsResponse = await graphQLClient.request(existsQuery);
          const alreadyExists = existsResponse.newsProviderById !== null;
          const mutationToUse = alreadyExists
            ? "updateNewsProviderFromGithub"
            : "createNewsProviderFromGithub";

          const mutation = gql`
                    mutation CreateNewsprovider($data: NewsProviderInput!) {
                        ${mutationToUse}(data: $data) {
                          newsprovider_id
                    }
                    }
                `;

          const variables = {
            data: newsprovider,
          };

          const response = await graphQLClient.request(mutation, variables);
          if (!response) {
            throw new Error("No response from mutation call");
          }
          console.info(
            `${alreadyExists ? "Updated" : "Created"} category ${
              newsprovider.url
            }`
          );
        }
      })
      .catch((err) => {
        console.log(err.message);
        process.exit(1);
      });
  }
});
