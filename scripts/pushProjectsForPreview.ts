import { pushProjects } from "./util/pushProjectsToApi";

pushProjects(true)
  .then(() => {
    console.log('Pushing Projects for Preview to server');
  })
  .catch((err) => {
    console.log(err);
  });
