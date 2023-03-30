const express = require("express")
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');
const PORT = 5000

const model = require('./model/model')

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello world.');
})

app.post('/category/add', async (req, res) => {
  try {
    const newCategory = new model.Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(200).json(savedCategory);
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
})

app.post('/book/add', async (req, res) => {
  try {
    let msg;

    if (req.body.category_Name) {
      const category = await model.Category.findOne({ name: req.body.category_Name });
      if (!(await category)) {
        msg = "Thể loại này không tồn tại.!\n"
      }
      else {
        req.body.category = category._id;
        const newBook = new model.Book(req.body);
        const savedBook = await newBook.save();
        await category.updateOne({ $push: { listOfBook: savedBook._id } });
        msg = "Add success!!!"
      }
    }
    res.send(msg);
  } catch (err) {
    res.status(500).json(err);
  }
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