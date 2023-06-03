//app.js has only express related code..
const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//middleware -- stands b/w req and response
app.use(express.json());

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
  res.status(404).json({
    status: 'Fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});
module.exports = app;
