import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

dotenv.config();
global.Headers = global.Headers || Headers;

const directoryPath = path.join(__dirname, "./../exchanges");

const changedFiles = process.argv.slice(2);

fs.readdir(directoryPath, (err, _) => {
  if (err) {
    throw err;
  }

  console.log("changedFiles", JSON.stringify(changedFiles));
  const updatedExchanges = changedFiles
    .map((dir) => {
      const dirChange = dir.split("/", 3);
      if (dir.includes("exchanges") && dir.includes("json")) {
        const filePath = directoryPath + "/" + dirChange[1] + "/info.json";
        const logoPath = directoryPath + "/" + dirChange[1] + "/logo.png";
        return new Promise((resolve, _) => {
          fs.readFile(filePath, "utf8", (_, data) => {
            const parsed = JSON.parse(data);
            resolve({
              ...parsed,
              logo: logoPath,
              exchange_id: dirChange[1],
            });
          });
        });
      }
    })
    .filter((file) => !!file);

  if (updatedExchanges.length > 0) {
    Promise.all(updatedExchanges)
      .then(async (exchanges: any[]) => {
        for (const exchange of exchanges) {
          console.log("Processing exchange", JSON.stringify(exchange));
          delete exchange.__triggerUpdate;

          const endpoint = process.env.MAIN_API_ENDPOINT as string;
          if (!endpoint) {
            throw new Error("API endpoint invalid");
          }
          const graphQLClient = new GraphQLClient(endpoint);
          graphQLClient.setHeaders({
            authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
          });

          const existsQuery = gql`
            query {exchangeByExchangeId(exchange_id: "${exchange.exchange_id}") {id}}
          `;

          const existsResponse = await graphQLClient.request(existsQuery);
          const alreadyExists = existsResponse.exchangeByExchangeId !== null;
          const mutationToUse = alreadyExists
            ? "updateExchangeFromGithub"
            : "createExchangeFromGithub";

          const mutation = gql`
            mutation CreateExchange($data: ExchangeGithubInput!) {
              ${mutationToUse}(data: $data) {
                id
              }
            }
          `;

          const variables = {
            data: exchange,
          };

          const response = await graphQLClient.request(mutation, variables);
          if (!response) {
            throw new Error("No response from mutation call");
          }
          console.info(
            `${alreadyExists ? "Updated" : "Created"} exchange ${
              exchange.exchange_id
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
