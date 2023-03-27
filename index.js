const express = require("express")
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Thêm middleware body-parser để xử lý dữ liệu từ client
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Danh sách sinh viên
const students = [
  { id: 1, name: 'John', age: 20 },
  { id: 2, name: 'Jane', age: 21 },
  { id: 3, name: 'Bob', age: 22 }
];

// API trả về danh sách sinh viên
app.get('/students', (req, res) => {

  res.json(students);
});

app.listen(port, () =>{
    console.log(`Server is listening on port ${port}`)
})