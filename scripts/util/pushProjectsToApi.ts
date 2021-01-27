import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GraphQLClient, gql } from 'graphql-request';
import { Headers } from 'cross-fetch';

export const pushProjects = async (isPreview?: boolean) => {
  dotenv.config();
  global.Headers = global.Headers || Headers;

  const directoryPath = path.join(__dirname, './../../projects');

  const changedFiles = process.argv.slice(2);

  fs.readdir(directoryPath, (err, _) => {
    if (err) {
      throw err;
    }

    console.log('changedFiles', JSON.stringify(changedFiles));
    const updatedProjects = changedFiles
      .map((dir) => {
        const dirChange = dir.split('/', 3);
        if (dir.includes('projects')) {
          const filePath = directoryPath + '/' + dirChange[1] + '/info.json';
          const logoPath = '/projects/' + dirChange[1] + '/logo.png';
          const descriptionPath =
            directoryPath + '/' + dirChange[1] + '/description.md';

          return new Promise((resolve, _) => {
            fs.readFile(filePath, 'utf8', (_, data) => {
              fs.readFile(descriptionPath, 'utf8', (_, descriptionData) => {
                if (data) {
                  const parsed = {
                    ...JSON.parse(data),
                    isPreview: isPreview ?? false,
                  };
                  resolve({
                    ...parsed,
                    logo: parsed.logo || logoPath,
                    asset_id: dirChange[1],
                    isPreview,
                    description_markdown:
                      parsed.description_markdown || descriptionPath,
                    description_markdown_text:
                      parsed.description_markdown_text || descriptionData,
                  });
                }
              });
            });
          });
        }
      })
      .filter((file) => !!file);

    if (updatedProjects.length > 0) {
      Promise.all(updatedProjects)
        .then(async (projects: any[]) => {
          for (const project of projects) {
            console.log('Processing project', JSON.stringify(project));
            delete project.__triggerUpdate;

            const endpoint = process.env.MAIN_API_ENDPOINT as string;
            if (!endpoint) {
              throw new Error('API endpoint invalid');
            }
            const graphQLClient = new GraphQLClient(endpoint);
            graphQLClient.setHeaders({
              authorization: `Bearer ${process.env.API_ASSETS_KEY}`,
            });

            const existsQuery = !isPreview
              ? gql`
            query {assetByAssetId(asset_id: "${project.asset_id}") {id}}
          `
              : gql`
            query {assetByAssetId(asset_id: "${project.asset_id}-preview") {id}}
          `;

            // looking, if the asset already exists
            const existsResponse = await graphQLClient.request(existsQuery);
            let alreadyExists = existsResponse.assetByAssetId !== null;

            // if it does and it is a preview asset, removing it to delete outdated data
            if (isPreview && alreadyExists) {
              const removePreviousPreviewBuildQuery = gql`
              mutation {deletePreviewAsset(asset_id: "${project.asset_id}-preview") {id}}
            `;
              const removeResponse = await graphQLClient.request(
                removePreviousPreviewBuildQuery
              );
              console.log('removeResponse', removeResponse);
              alreadyExists = false;
            }

            const mutationToUse = alreadyExists
              ? 'updateAssetFromGithub'
              : 'createAssetFromGithub';

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
              throw new Error('No response from mutation call');
            }

            console.info(
              `${alreadyExists ? 'Updated' : 'Created'} project ${
                project.asset_id
              }${isPreview ? '-preview' : ''}`
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
