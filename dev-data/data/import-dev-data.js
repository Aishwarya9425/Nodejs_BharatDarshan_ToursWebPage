const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' }); //1st read the env file

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to mongo db successfully!!');
  });

//read tourjson file, convert json into obj
const tourObj = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

//import data into db
const importData = async () => {
  try {
    await Tour.create(tourObj);
    console.log('Tour data created successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//delete all data from db
const deleteData = async () => {
  try {
    await Tour.deleteMany(); //delet all documents
    console.log('Deleted all documents!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//via cli command, depending on what you specify
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
