import fs from "fs";
import path from "path";
import validate from "./schema.validator";

const directoryPath = path.join(__dirname, "../projects");

fs.readdir(directoryPath, (err, fodlers) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  fodlers.forEach((subfolder) => {
    const filePath = directoryPath + "/" + subfolder + "/info.json";
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) throw err;
      try {
        if (validate(JSON.parse(data))) {
          console.log(`validated: ${filePath} is successfully`);
        }
      } catch (err) {
          console.log(err)
      }
    });
  });
});
