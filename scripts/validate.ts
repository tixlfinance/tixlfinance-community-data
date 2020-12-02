import fs from "fs";
import path from "path";
import validateProject from "../projects/0-schema/project.schema.validator";
import validateExchange from "../exchanges/0-schema/exchange.schema.validator";

// should be "projects" or "exchanges"
const type = process.argv[2];
if (!["projects", "exchanges"].includes(type)) {
  throw new Error("Unsupported type");
}

const validateFunctions = {
  exchanges: validateExchange,
  projects: validateProject,
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
            resolve(`Successfully validated: ${filePath}`);
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
