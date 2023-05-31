const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

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

router
  .route('/')
  .get(tourController.getAlltours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
