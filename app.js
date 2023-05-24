//app.js has only express related code..
const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middleware -- stands b/w req and response
app.use(express.json());

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

module.exports = app;
