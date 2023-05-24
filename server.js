//starting file - relating to server, listen to the server, db, config
//since this is the starting file, need to run from here not app.js
const app = require('./app');
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
