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

require('dotenv/config');
const PORT = 5000

const model = require('./model/model')

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());


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

app.post('/order/add', async (req, res) => {

  try {
    // Tính tổng giá trị đơn hàng
    var total = 0;
    for (i in req.body.listOfBook) {
      const price = (await model.Book.findById(req.body.listOfBook[i].book)).price;
      console.log(price)
      total += req.body.listOfBook[i].quantity * price;
    }
    console.log(total);
    //Tạo đối tượng đơn hàng
    const order = new model.Order({
      listOfBook: req.body.listOfBook,
      totalPrice: total
    });

    // Lưu đơn hàng vào database
    await order.save();

    // Trả về kết quả thành công
    res.status(201).json(order);
  } catch (error) {
    // Trả về thông báo lỗi nếu có lỗi xảy ra
    res.status(500).json({ error: error.message });
  }
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
    stock:{
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