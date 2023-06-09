//app.js has only express related code..
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const app = express();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//Helmet helps secure Express apps by setting HTTP response headers.
//adds extra security headers
//now we have 21 headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//max 100 requests from the same ip address in 1 hour windo
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP address, please try again sometime later!!',
});

// Apply the rate limiting middleware to all requests starting from /api
app.use('/api', limiter);

//middleware -- stands b/w req and response
//body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

//after body parsing, data sanitisation
//clean all data from malicious code
//data sanitization against noSQL query injection
//data sanitization against XSS
// {
//   "email":{"$gt" : ""}, --> instead of giving actual value, attacker just writes a query which is evaluated to true
//   "password" :"simple123"
// }

//This module searches for any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params and removes them
app.use(mongoSanitize());

app.use(xss()); //clean malicious html code

//prevent http parameter pollution
//it just selects the last parameter value
//if u want to duplicate the query param then add to whitelist
app.use(
  hpp({
    whitelist: ['duration', 'difficulty'],
  })
);

//serve static file
app.use(express.static(`${__dirname}/public`));

// ----- middleware example  -----
/* //order matters in express - define before all route handlers..
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next(); // req-res passes through many middleware stages through next and finally res.send
});

//own middleware
app.use((req, res, next) => {
  console.log('Middleware -- trying to get requested time');
  req.requestedTime = new Date().toISOString();
  next(); // req-res passes through many middleware stages through next and finally res.send
}); */

//middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
//middleware runs according to the order defined
//middleware to handle all undefined routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail'; //not found routes
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
