const AppError = require('./../utils/appError');

//mongoose operational errors
//functions receive the errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //could have many validation errors
  //get all the messages
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

//development
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      //send as many as details as possible about error in dev - cuz only developers will know
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack, //print error stack
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

//production
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational error: send message to client
    //in prod, send error only if operational not program error
    if (err.isOperational) {
      // a lot of details are not required for prod error??
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error so developers can know, but dont tell the client
    console.error('ERROR 💥', err);
    // 2) Send generic message to other errors except op errors
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

//error handling middleware
module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //for production and development errors
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
    //no need to handle mongoose errors here in dev cuz
    //developers we can see the actual error msg but for client we need to send proper err msg
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    //mongoose operational errors, give meaningful error message to client

    //cast to objectID failed for value _id or anything else
    //pass the mongoose err into these functions, this will return a new error using apperror class

    //issue with error.name -- not found!!
    //use err only instead of error

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    //duplicate key error
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    //validation erorrs from schema
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    //call sendErrorProd
    sendErrorProd(error, req, res);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
