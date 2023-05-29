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
    //------------ build query -----------

    //1A. Filtering
    //filter based on queries for example - { duration: '7', maxGroupSize: '15', price: '497' }
    //some filters like page has to be excluded
    //create shallow copy
    console.log('req.query', req.query);
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log('queryObj after removing excludedFields is ', queryObj);

    //1B. Advanced filtering to use operators lte, gte...
    //{ difficulty: 'easy', duration: { gte: '9' } }, only $ is missing
    //convert obj to str, replace with adding $
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //convert back to obj
    console.log(JSON.parse(queryStr));

    //if these operaters are not present, it wont affect the query
    //Tour.find() returns a query, we can keep chaining many methods to this query
    let query = Tour.find(JSON.parse(queryStr));

    //2. SORTING ----- req.query { sort: 'price' }
    //this is after finding the query, we use sort function
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      // if user does not specify sort function
      query = query.sort('-createdAt');
    }

    //------ execute query ------
    const tours = await query;

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
