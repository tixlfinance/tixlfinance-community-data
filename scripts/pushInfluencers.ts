import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

dotenv.config();
global.Headers = global.Headers || Headers;

const directoryPath = path.join(__dirname, "./../influencers");

const changedFiles = process.argv.slice(2);

fs.readdir(directoryPath, (err, _) => {
  if (err) {
    throw err;
  }

  console.log("changedFiles", JSON.stringify(changedFiles));
  const updatedInfluencers = changedFiles
    .map((dir) => {
      const dirChange = dir.split("/", 3);
      if (dir.includes("influencers")) {
        const filePath = directoryPath + "/" + dirChange[1] + "/info.json";
        return new Promise((resolve, _) => {
          fs.readFile(filePath, "utf8", (_, data) => {
            if (data) {
              const parsed = JSON.parse(data);
              parsed.influencer_id = dirChange[1]
                ?.toLowerCase()
                ?.replace(" ", "_");
              resolve({ ...parsed });
            }
          });
        });
      }
    })
    .filter((file) => !!file);

  if (updatedInfluencers.length > 0) {
    Promise.all(updatedInfluencers)
      .then(async (influencers: any[]) => {
        for (const influencer of influencers) {
          console.log("Processing influencer", JSON.stringify(influencer));
          delete influencer.__triggerUpdate;

          const endpoint = process.env.MAIN_API_ENDPOINT as string;
          if (!endpoint) {
            throw new Error("API endpoint invalid");
          }
          const graphQLClient = new GraphQLClient(endpoint);
          graphQLClient.setHeaders({
            authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
          });

          const existsQuery = gql`
            query {influencerById(influencer_id: "${influencer.influencer_id}") {_id}}
          `;

          const existsResponse = await graphQLClient.request(existsQuery);
          const alreadyExists = existsResponse.influencerById !== null;
          const mutationToUse = alreadyExists
            ? "updateInfluencerFromGithub"
            : "createInfluencerFromGithub";

          const mutation = gql`
            mutation CreateInfluencer($data: InfluencerInput!) {
              ${mutationToUse}(data: $data) {
                influencer_id
              }
            }
          `;

          const variables = {
            data: influencer,
          };

          const response = await graphQLClient.request(mutation, variables);
          if (!response) {
            throw new Error("No response from mutation call");
          }
          console.info(
            `${alreadyExists ? "Updated" : "Created"} influencer ${
              influencer.influencer_id
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
