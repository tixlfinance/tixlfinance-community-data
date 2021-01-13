import { pushProjects } from './pushProjects';

pushProjects(true)
  .then(() => {
    console.log('Pushing Projects for Preview to server');
  })
  .catch((err) => {
    console.log(err);
  });
