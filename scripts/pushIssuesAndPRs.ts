import fs from "fs";
import dotenv from "dotenv";
import { GraphQLClient, gql } from "graphql-request";

dotenv.config();

async function main() {
  const authToken = process.env.MAIN_API_TOKEN as string;
  if (!authToken) {
    throw new Error("API token invalid");
  }

  const endpoint = process.env.MAIN_API_ENDPOINT as string;
  if (!endpoint) {
    throw new Error("API endpoint invalid");
  }

  const graphQLClient = new GraphQLClient(endpoint);
  graphQLClient.setHeaders({ authorization: `Bearer ${authToken}` });

  const path = process.env.GITHUB_EVENT_PATH as string;
  const body = fs.readFileSync(path, "utf8");
  const event = JSON.parse(body);

  console.log(body as string);

  const mutation = gql`
    mutation upsert($issue: IssueInput!) {
      upsertIssue(data: $issue) {
        _id
        created_at
        updated_at
        labels
        github_id
        title
        url
      }
    }
  `;
//random change to test PR
  
  let data;
  if (event.issue) {
    data = event.issue;
  } else if (event.pull_request && event.pull_request.merged) {
    data = event.pull_request;
  }

  if (!data) {
    console.log("No valid issue or pull request. Exiting...")
    return
  }

  const issue = {
    github_id: data.id.toString(),
    github_user_login: data.user.login,
    title: data.title,
    labels: data.labels.map((label) => label.name),
    url: data.url,
  };

  const response = await graphQLClient.request(mutation, { issue });
  if (!response) {
    throw new Error("No response from mutation call");
  }

  console.log("Response: ", response);
}

main();
