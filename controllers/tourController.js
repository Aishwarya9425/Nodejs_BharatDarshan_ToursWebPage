const Tour = require('./../models/tourModel');

//get the updated tours json from the file -- will later use mongo db
/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

//check id - use middleware -- not needed because mongoose will generate unique id
/* exports.checkID = (req, res, next, value) => {
  console.log(`---Param Middleware checkID running--`);
  console.log(`Tour id is: ${value}`);
  if (req.params.id > tours.length) {
    return res.status(404).json({ status: 'Failed', message: 'Invalid id' });
  }
  next();
}; */

//checkBody -  middleware
//use req.param for param md, otherwise req.body -- post req,
/* exports.checkBody = (req, res, next) => {
  console.log(`---Middleware checkBody running--`);
  if (!req.body.price || !req.body.name) {
    return res.status(400).json({
      status: 'bad request',
      message: 'Request does not contain name or/and price!',
    });
  }
  next(); //if everything is fine, move on to the next middleware ie createTour
}; */

exports.getAlltours = (req, res) => {
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    // requestedTime: req.requestedTime,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params); //all params
  //req.param originally string
  const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour, //get the specific tour by id
  //   },
  // });
};

//post req.body
exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()
    //Creates a new document - returns a promise
    const newTour = await Tour.create(req.body);
    //201 req created
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    //if we create without a required field, the promise is rejected
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour.... ',
    },
  });
};

exports.deleteTour = (req, res) => {
  //204 - no content
  res.status(204).json({
    status: 'success',
    data: null, //we dont send any data back
  });
};
