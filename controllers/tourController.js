const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//handler functions
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//middlewares
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,difficulty';
  next();
};

//aggregation --
exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

//get the busiest month, which month has the most tours???
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});
