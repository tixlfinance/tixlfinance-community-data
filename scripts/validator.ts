import fs from "fs";
import path from "path";
import validate from "./schema.validator";
import chalk from "chalk";

const directoryPath = path.join(__dirname, "./../projects");
let isError = false;

fs.readdir(directoryPath, (err, dirs) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  const validatedValues = dirs.map((subDirs) => {
    const filePath = directoryPath + "/" + subDirs + "/info.json";
    return new Promise((resolve, _) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err;
        try {
          if (validate(JSON.parse(data))) {
            resolve({
              message: `validated: ${filePath} is successfully`,
            });
          }
        } catch (err) {
          isError = true;
          resolve({
            message: err,
            isError: true,
          });
        }
      });
    });
  });
  Promise.all(validatedValues)
    .then((values) => {
      values.map((value: any) =>
        console.log(
          value.isError ? chalk.red(value.message) : chalk.green(value.message)
        )
      );
      if (isError) process.exit(1);
    })
    .catch((err) => {
      console.log(err);
    });
});
