import fs from "fs";
import path from "path";

const directoryPath = path.join(__dirname, "./../projects");

fs.readdir(directoryPath, (err, dirs) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }
  const validatedValues = dirs.map((subDirs) => {
    const filePath = directoryPath + "/" + subDirs + "/info.json";
    return new Promise((resolve, _) => {
      fs.readFile(filePath, "utf8", (_, data) => {
        resolve(JSON.parse(data));
      });
    });
  });
  Promise.all(validatedValues)
    .then((values) => {
      // TODO: request api to update token
      console.log(values);
    })
    .catch((err) => {
      console.log(err);
    });
});
