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
    const event = JSON.parse(fs.readFileSync(path, "utf8"));

    console.log(event);

    // A little change to test the PR workflow

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
                user_id
                transaction_id
            }
        }
    `;

    const issue = {
        github_id: event.issue.id.toString(),
        title: event.issue.title,
        labels: event.issue.labels.map((label) => label.name),
        url: event.issue.url,
    };

    const response = await graphQLClient.request(mutation, { issue });
    if (!response) {
        throw new Error("No response from mutation call");
    }

    console.log("It worked!: ", response);
}

main();
