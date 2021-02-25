# Collaborate by adding or updating influencer information

## How to add an influencer

1. Fork the repository and create a branch named `add-<influencer-name>`. For example, a branch for adding Ivan on Tech should be named `add-ivan-on-tech`.

2. To add a new influencer, add a sub-folder below `/influencers`. The folder should be named by the name of the influencer. Examples: `ivan-on-tech`.

3. In that directory, create a file named `info.json`. The file should be structured like the schema defined in [this schema](./0-schema/influencer.schema.ts). Hint: The `twitter_user_id` is very important because of its uniqueness. You can generate it [here](https://tweeterid.com/) by adding the twitter username. For example for Ivan on Tech it's `IvanOnTech`, which gets you the result `390627208`.

4. To avoid errors in the pull request, run the validation script locally first by executing `npm run validate`.

5. Create a pull request. 

