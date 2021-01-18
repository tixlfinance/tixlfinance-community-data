import fs from "fs";
import path from "path";
import validateProject from "../projects/0-schema/project.schema.validator";
import validateExchange from "../exchanges/0-schema/exchange.schema.validator";
import validateInfluencer from "../influencers/0-schema/influencer.schema.validator";
import validateCategories from "../categories/0-schema/categories.schema.validator";
import validateBlogs from "../blogs/0-schema/blog.schema.validator";

// should be "projects" or "exchanges"
const type = process.argv[2];
if (!["projects", "exchanges", "influencers", "categories", "blogs"].includes(type)) {
  throw new Error("Unsupported type");
}

const validateFunctions = {
  blogs: validateBlogs,
  categories: validateCategories,
  exchanges: validateExchange,
  projects: validateProject,
  influencers: validateInfluencer,
};

const directoryPath = path.join(__dirname, `./../${type}`);
fs.readdir(directoryPath, (err, dirsAndFiles) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  const dirs = dirsAndFiles.filter((dirOrFile) => {
    return (
      fs.lstatSync(`${directoryPath}/${dirOrFile}`).isDirectory() &&
      !dirOrFile.startsWith("0-")
    );
  });

  const validatedValues = dirs.map((subDirs) => {
    const filePath = directoryPath + "/" + subDirs + "/info.json";
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err;
        try {
          if (validateFunctions[type](JSON.parse(data))) {
            if (type === "influencers") {
              const obj: any = JSON.parse(data);
              if (
                !obj.twitter_username &&
                !obj.facebook_username &&
                !obj.youtube_username &&
                !obj.instagram_username
              ) {
                reject(
                  "At least one social username should be available Twitter, YouTube, Facebook or Instagram."
                );
              } else {
                resolve(`Successfully validated: ${filePath}`);
              }
            } else {
              resolve(`Successfully validated: ${filePath}`);
            }
          }
        } catch (err) {
          console.info(`Current file path ${filePath}`);
          reject(err);
        }
      });
    });
  });
  Promise.all(validatedValues)
    .then(() => null)
    .catch((err) => {
      console.log(err);
    });
});
