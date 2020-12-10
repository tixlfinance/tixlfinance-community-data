import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";
import { Headers } from "cross-fetch";

dotenv.config();
global.Headers = global.Headers || Headers;

const directoryPath = path.join(__dirname, "./../blogs");

const changedFiles = process.argv.slice(2);

fs.readdir(directoryPath, (err, _) => {
  if (err) {
    throw err;
  }

  console.log("changedFiles", JSON.stringify(changedFiles));
  const updatedBlogs = changedFiles
    .map((dir) => {
      const dirChange = dir.split("/", 3);
      if (dir.includes("blogs") && dir.includes("json")) {
        const filePath = directoryPath + "/" + dirChange[1] + "/info.json";
        const logoPath = "/exchanges/" + dirChange[1] + "/preview_image.png";
        return new Promise((resolve, _) => {
          fs.readFile(filePath, "utf8", (_, data) => {
            const parsed = JSON.parse(data);
            resolve({
              ...parsed,
              logo: parsed.logo || logoPath,
            });
          });
        });
      }
    })
    .filter((file) => !!file);

  if (updatedBlogs.length > 0) {
    Promise.all(updatedBlogs)
      .then(async (blogs: any[]) => {
        for (const blog of blogs) {
          console.log("Processing blog", JSON.stringify(blog));
          delete blog.__triggerUpdate;

          const endpoint = process.env.MAIN_API_ENDPOINT as string;
          if (!endpoint) {
            throw new Error("API endpoint invalid");
          }
          const graphQLClient = new GraphQLClient(endpoint);
          graphQLClient.setHeaders({
            authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
          });

          const existsQuery = gql`
            query {blogByBlogId(blog_id: "${blog.blog_id}") {id}}
          `;

          const existsResponse = await graphQLClient.request(existsQuery);
          const alreadyExists = existsResponse.blogByBlogId !== null;
          const mutationToUse = alreadyExists
            ? "updateBlogFromGithub"
            : "createBlogFromGithub";

          const mutation = gql`
            mutation CreateBlog($data: BlogInput!) {
              ${mutationToUse}(data: $data) {
                id
              }
            }
          `;

          const variables = {
            data: blog,
          };

          const response = await graphQLClient.request(mutation, variables);
          if (!response) {
            throw new Error("No response from mutation call");
          }
          console.info(
            `${alreadyExists ? "Updated" : "Created"} blog ${
              blog.blog_id
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
