const express = require('express');

const app = express();

app.get('/', (req, res) => {
  //   res
  //     .status(200)
  //     .json({ msg: 'this is a get request', type: 'this is json!!' });
  res.status(404).json('I dont have that');
});

app.post('/', (req, res) => {
  res.status(200).send('Post method');
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});
