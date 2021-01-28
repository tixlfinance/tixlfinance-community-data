import { removeProjects } from './util/removeProject';

removeProjects(true)
  .then(() => {
    console.log('Removing Preview Assets from server');
  })
  .catch((err) => {
    console.log(err);
  });
