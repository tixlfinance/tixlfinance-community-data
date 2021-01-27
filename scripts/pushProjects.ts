import { pushProjects } from './util/pushProjectsToApi';

pushProjects()
  .then(() => {
    console.log('Pushing Projects to server');
  })
  .catch((err) => {
    console.log(err);
  });
