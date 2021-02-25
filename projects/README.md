# Collaborate by adding or updating project information

## How to add a project

1. Fork the repository and create a branch named `add-<project-name>-<project-symbol>`. For example, a branch for adding Ethereum should be named `add-ethereum-eth`. 

2. To add a new project, add a sub-folder below `/projects`. The folder should be named by concatinating the name and the symbol of the project with a dash. Examples: `bitcoin-btc` or `ethereum-eth`. 

3. In that directory, create a file named `info.json`. The file should be structured like the schema defined in [this schema](./0-schema/project.schema.ts). Hint: In case you are adding social network entries, please add handle values for Medium, Twitter and Telegram. These are for example for Twitter the @ name without @ sign, sof e.g. TixlOrg for Tixl, for Telegram and Medium it's the last bit of the grouplink, so for https://t.me/tixlorg it's tixlorg or for https://medium.com/tixlorg it's tixlorg as well. 

4. Optionally, you can add more details, for example a logo of the project in PNG format and with the name `logo.png` to the directory next to the `info.json` file, or a `description.md` with a short personal project description. As well, you can add a roadmap with a `roadmap.json` file and a tokenomics overview with a `token.json` file. A valid example to get some inspiration is the `tixl-txl` project.

5. To avoid errors in the pull request, run the validation script locally first by executing `npm run validate`.

6. Create a pull request. 

