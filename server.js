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

//schema with validations, required etc
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 3,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a name'],
  },
});

//model created from schema
const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'test111',
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('ERROR', err);
  });

console.log(app.get('env')); //development or production
//console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
