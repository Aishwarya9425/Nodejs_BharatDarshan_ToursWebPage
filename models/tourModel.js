const mongoose = require('mongoose');

//schema with validations, required etc
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a Group Size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingAverage: {
    type: Number,
    default: 3,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a image Cover'],
  },
  images: [String], //arr of strings
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // to hide sensitive fields, exclude this from results?? can be used for passwords
  },
  startDates: [Date], // arr of dates
});

//model created from schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
