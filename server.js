//starting file - relating to server, listen to the server, db, config
//since this is the starting file, need to run from here not app.js
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); //1st read the env file
const app = require('./app'); //then require app file

console.log(app.get('env')); //development or production
//console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
