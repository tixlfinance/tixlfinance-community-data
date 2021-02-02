import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

export const pushProjects = async (isPreview?: boolean) => {
  dotenv.config();
  global.Headers = global.Headers || Headers;

  const directoryPath = path.join(__dirname, "./../../projects");
  const changedFiles = process.argv.slice(2);

  fs.readdir(directoryPath, (err, _) => {
    if (err) {
      throw err;
    }

    console.log("changedFiles", JSON.stringify(changedFiles));
    const updatedProjects = changedFiles
      .map((dir) => {
        const dirChange = dir.split("/", 3);
        if (dir.includes("projects")) {
          const filePath = directoryPath + "/" + dirChange[1] + "/info.json";
          const fileRoadmapPath =
            directoryPath + "/" + dirChange[1] + "/roadmap.json";
          const fileTokenPath =
            directoryPath + "/" + dirChange[1] + "/token.json";
          const logoPath = "/projects/" + dirChange[1] + "/logo.png";
          const descriptionPath =
            directoryPath + "/" + dirChange[1] + "/description.md";
          return new Promise((resolve, _) => {
            const data = fs.readFileSync(filePath).toString();
            let roadmap: string = "";
            let token: string = "";
            let descriptionData: string = "";
            if (fs.existsSync(fileRoadmapPath)) {
              roadmap = fs.readFileSync(fileRoadmapPath).toString();
            }
            if (fs.existsSync(fileRoadmapPath)) {
              token = fs.readFileSync(fileTokenPath).toString();
            }
            if (fs.existsSync(descriptionPath)) {
              descriptionData = fs.readFileSync(descriptionPath).toString();
            }
            if (data) {
              const tokenData = JSON.parse(data);
              if (roadmap) {
                tokenData.roadmap = JSON.parse(roadmap.toString()).roadmap;
              }
              if (token) {
                tokenData.token = JSON.parse(token.toString()).token;
              }
              const parsed = {
                ...tokenData,
                isPreview: isPreview ?? false,
              };
              resolve({
                ...parsed,
                logo: parsed.logo || logoPath,
                asset_id: `${dirChange[1]}${isPreview ? "-preview" : ""}`,
                isPreview,
                description_markdown:
                  parsed.description_markdown || descriptionData
                    ? descriptionPath
                    : "",
                description_markdown_text:
                  parsed.description_markdown_text || descriptionData,
              });
            }
          });
        }
      })
      .filter((file) => !!file);

    if (updatedProjects.length > 0) {
      Promise.all(updatedProjects)
        .then(async (projects: any[]) => {
          for (const project of projects) {
            console.log("Processing project", JSON.stringify(project, null, 2));
            delete project.__triggerUpdate;

            const endpoint = process.env.MAIN_API_ENDPOINT as string;
            if (!endpoint) {
              throw new Error("API endpoint invalid");
            }
            const graphQLClient = new GraphQLClient(endpoint);
            graphQLClient.setHeaders({
              authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
            });

            const existsQuery = gql`
                  query {assetByAssetId(asset_id: "${project.asset_id}") {id coingecko_id}}
                `;

            // looking, if the asset already exists
            const existsResponse = await graphQLClient.request(existsQuery);
            let alreadyExists = existsResponse.assetByAssetId !== null;

            const historicalDataChangeNecessary =
              project?.coingecko_id !==
              existsResponse?.assetByAssetId?.coingecko_id;

            // if it does and it is a preview asset and a historicaldata-change is necessary, removing it to delete outdated data
            if (isPreview && alreadyExists && historicalDataChangeNecessary) {
              const removePreviousPreviewBuildQuery = gql`
                    mutation {deletePreviewAsset(asset_id: "${project.asset_id}") {id}}
                  `;

              const removeResponse = await graphQLClient.request(
                removePreviousPreviewBuildQuery
              );
              console.log("removeResponse", removeResponse);
              alreadyExists = false;
            }

            const mutationToUse = alreadyExists
              ? "updateAssetFromGithub"
              : "createAssetFromGithub";

            const mutation = gql`
                    mutation CreateAsset($data: AssetInput!) {
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
              throw new Error("No response from mutation call");
            }

            console.info(
              `${alreadyExists ? "Updated" : "Created"} project ${
                project.asset_id
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
};
