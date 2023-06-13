const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router.use('/:tourId/reviews', reviewRouter);

//param middleware
//router.param('id', tourController.checkID);

//alias, get top 5 cheapest tours??
//run a middleware first
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAlltours);

//router for aggregation query
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//before user visits protected routes- jwt ,auth using middleware
router
  .route('/')
  .get(authController.protect, tourController.getAlltours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
