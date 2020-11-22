# Collaborate by adding or updating project information

## How to add a project

1. Fork the repository and create a branch named `add-<project-name>-<project-symbol>`. For example, a branch for adding Ethereum should be named `add-ethereum-eth`. 

2. To add a new project, add a sub-folder below `/projects`. The folder should be named by concatinating the name and the symbol of the project with a dash. Examples: `bitcoin-btc` or `ethereum-eth`. 

3. In that directory, create a file named `info.json`. The file should be structured like the schema defined in [this schema](./0-schema/project.schema.ts). 

4. Optionally, add a logo of the project in PNG format and with the name `logo.png` to the directory next to the `info.json` file.

5. To avoid errors in the pull request, run the validation script locally first by executing `npm run validate`.

6. Create a pull request. 

