const mongoose = require('mongoose');

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
    required: [true, 'A tour must have a price'],
  },
});

//model created from schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
