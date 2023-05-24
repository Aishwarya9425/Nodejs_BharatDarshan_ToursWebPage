const fs = require('fs');

//get the updated tours json from the file -- will later use mongo db
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAlltours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedTime: req.requestedTime,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
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

exports.deleteTour = (req, res) => {
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
