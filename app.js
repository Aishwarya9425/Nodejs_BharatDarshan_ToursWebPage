const express = require('express');
const fs = require('fs');

const app = express();

// app.get('/', (req, res) => {
//   //   res
//   //     .status(200)
//   //     .json({ msg: 'this is a get request', type: 'this is json!!' });
//   res.status(404).json('I dont have that');
// });

// app.post('/', (req, res) => {
//   res.status(200).send('Post method');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
