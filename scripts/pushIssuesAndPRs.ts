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
    console.log(body);
    const event = JSON.parse(body);

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

    const data = event.issue || event.pull_request;
    const issue = {
        github_id: data.id.toString(),
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
