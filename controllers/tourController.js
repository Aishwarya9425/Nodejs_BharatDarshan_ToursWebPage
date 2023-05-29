const Tour = require('./../models/tourModel'); //model created from schema

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

//get all tours by find()
exports.getAlltours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Failed getting all tours!!',
      message: err,
    });
  }
};

//get a specific tour by _id using findById()
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Failed getting specific tour by id!!',
      message: err,
    });
  }
};

//create a new tour using create() with req body
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
      status: 'Failed creating new tour',
      message: err,
    });
  }
};

//update tour by sending modified body, but check for validations
exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Updated tour successfully',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed updating tour',
      message: err,
    });
  }
};

//delete tour using findByIdAndDelete()
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    //204 - no content
    res.status(204).json({
      status: 'Deleted!!',
      data: null, //we dont send any data back
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed deleting the tour',
      message: err,
    });
  }
};
