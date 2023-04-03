const express = require("express")
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

async function hehe() {
  const hashedPassword = await bcrypt.hash('myPassword', 10);
  // Compare a password with a hash
  const result = await bcrypt.compare('myPassword', hashedPassword);
  console.log(result);
}

const model = require('./model/model')
const bookRoute = require('./routes/bookRoute')
const categoryRoute = require('./routes/categoryRoute')
const orderRoute = require('./routes/orderRoute')
const userRoute = require('./routes/userRoute')
require('dotenv/config');
const PORT = 5000

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

app.use('/book', bookRoute);
app.use('/category', categoryRoute);
app.use('/order', orderRoute)

app.get('/', (req, res) => {
  res.send('Hello world.');
})

app.post('/user/add', async (req, res) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const newUser = new model.User(req.body);
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
})

app.post('/login', async (req, res) => {

})

app.get('/dashboard', async (req, res) => {
  const numOfBooks = await model.Book.count()
  const numOfOrderPerWeek = await model.Order.find().where({ date: "2023-03-30T15:15:08.402Z" });

  const startOfWeek = new Date();
  startOfWeek.setHours(startOfWeek.getHours() - 2);

  const endOfWeek = new Date();
  endOfWeek.setHours(endOfWeek.getHours() - 1);

  const count = await model.Order.find({
    date: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  });

  const listOfBookOutOfStock = await model.Book.find({
    stock: {
      $lte: 5
    }
  }).limit(5);

  console.log(listOfBookOutOfStock);
  res.status(200).json(listOfBookOutOfStock)
})

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database successfully!!');
  })
  .catch((err) => {
    console.error('Failed to connect to database', err);
  });

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`)
})