//starting file - relating to server, listen to the server, db, config
//since this is the starting file, need to run from here not app.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' }); //1st read the env file
const app = require('./app'); //then require app file

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
//connect to mongo, it returns a promise ;
mongoose
  //.connect(process.env.DATABASE_LOCAL, { //connect to local db
  .connect(DB, {
    //connect to cluster
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('Connected to mongo db successfully!!');
  });

console.log(app.get('env')); //development or production
//console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
