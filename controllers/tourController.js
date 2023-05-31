const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

//middlewares
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,difficulty';
  next();
};

//get all tours by find()
exports.getAlltours = async (req, res) => {
  try {
    //------ execute query ------
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err);
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
      runValidators: true, //even while updating check for validations
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

exports.getTourStats = async (req, res) => {
  try {
    //we pass in the stages for aggregate
    //w/o await just the query is returned, with await the result is returned
    //can repeat stages
    const stats = await Tour.aggregate([
      //stage 1 - match
      {
        $match: { ratingAverage: { $gte: 3 } },
      },
      //stage 2 - group
      {
        $group: {
          _id: '$difficulty', //group based on difficulty
          numOfTours: { $sum: 1 }, //every time it is incr by 1
          numRatings: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      //stage 3 - sort
      {
        $sort: { avgPrice: 1 }, //1 for asc
      },
      //stage 4
      {
        $match: { _id: { $ne: 'easy' } }, //exclude
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

//get the busiest month, which month has the most tours???
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; //2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', //one document for each year, not just 2021
      },
      {
        $match: {
          //get only 2021 among these results
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          //gets only the month from the startDates from match
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }, //get tour names, array because many tours in same month, so use push for arr;
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1, //desc
        },
      },
      {
        $limit: 6, //top 6 
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
