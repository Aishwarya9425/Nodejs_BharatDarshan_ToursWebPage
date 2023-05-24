const express = require('express');
const fs = require('fs');

const app = express();

//middleware -- stands b/w req and response
app.use(express.json());

//order matters in express - define before all route handlers..
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next(); // req-res passes through many middleware stages through next and finally res.send
});

//own middleware
app.use((req, res, next) => {
  console.log('Middleware -- trying to get requested time');
  req.requestedTime = new Date().toISOString();
  next(); // req-res passes through many middleware stages through next and finally res.send
});

//get the updated tours json from the file -- will later use mongo db
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAlltours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedTime: req.requestedTime,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params); //all params
  //req.param originally string
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  // if (id > tours.length)
  if (!tour) {
    return res.status(404).json({ status: 'Failed', message: 'Invalid id' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour, //get the specific tour by id
    },
  });
};

const createTour = (req, res) => {
  //now to temp save in tours json create id, else mongo db will take care of id automatically
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  console.log('newTour', newTour);
  tours.push(newTour);
  //push into file
  //we are inside callback fun already and we cant block the event loop
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      //201 req created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id > tours.length) {
    return res.status(404).json({ status: 'Failed', message: 'Invalid id' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Updated tour.... ',
    },
  });
};

const deleteTour = (req, res) => {
  //trying to delete an id which doesnt exist will give 404
  if (req.params.id > tours.length) {
    return res.status(404).json({ status: 'Failed', message: 'Invalid id' });
  }
  //204 - no content
  res.status(204).json({
    status: 'success',
    data: null, //we dont send any data back
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented',
  });
};

//get all tours
// app.get('/api/v1/tours', getAlltours);

//create a new tour
// app.post('/api/v1/tours', createTour);

//get specific tour by id
//app.get('/api/v1/tours/:id', getTour);

//patch -- update only a part of the json
//app.patch('/api/v1/tours/:id', updateTour);

//delete
//app.delete('/api/v1/tours/:id', deleteTour);

//create different routers for different resources - tours, users
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAlltours).post(createTour);

//this middleware wont be called because req res cycle is already completed with the above route handler
// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next(); // req-res passes through many middleware stages through next and finally res.send
// });

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

//users routes
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
