import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

dotenv.config();
global.Headers = global.Headers || Headers;

const directoryPath = path.join(__dirname, "./../categories");

const changedFiles = process.argv.slice(2);

fs.readdir(directoryPath, (err, _) => {
  if (err) {
    throw err;
  }

  console.log("changedFiles", JSON.stringify(changedFiles));
  const updatedCategories = changedFiles
    .map((dir) => {
      const dirChange = dir.split("/", 3);
      if (dir.includes("categories")) {
        const filePath = directoryPath + "/" + dirChange[1] + "/info.json";
        const logoPath = "/blogs/" + dirChange[1] + "/logo.png";
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

  if (updatedCategories.length > 0) {
    Promise.all(updatedCategories)
      .then(async (categories: any[]) => {
        for (const category of categories) {
          console.log("Processing category", JSON.stringify(category));
          delete category.__triggerUpdate;

          const endpoint = process.env.MAIN_API_ENDPOINT as string;
          if (!endpoint) {
            throw new Error("API endpoint invalid");
          }
          const graphQLClient = new GraphQLClient(endpoint);
          graphQLClient.setHeaders({
            authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
          });

          const existsQuery = gql`
                    query {categoryByCategoryId(category_id: "${category.category_id}") {_id}}
                `;

          const existsResponse = await graphQLClient.request(existsQuery);
          const alreadyExists = existsResponse.blogByBlogId !== null;
          const mutationToUse = alreadyExists
            ? "updateCategoryFromGithub"
            : "createCategoryFromGithub";

          const mutation = gql`
                    mutation CreateCategory($data: CategoryInput!) {
                        ${mutationToUse}(data: $data) {
                        category_id
                    }
                    }
                `;

          const variables = {
            data: category,
          };

          const response = await graphQLClient.request(mutation, variables);
          if (!response) {
            throw new Error("No response from mutation call");
          }
          console.info(
            `${alreadyExists ? "Updated" : "Created"} category ${
              category.category_id
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
