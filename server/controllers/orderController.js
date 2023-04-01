const model = require('../model/model')

const orderController = {
    addOrder: async (req, res) => {
        try {
            // Tính tổng giá trị đơn hàng
            var total = 0;
            for (i in req.body.listOfBook) {
                const book = (await model.Book.findById(req.body.listOfBook[i].book));
                if (book.stock < req.body.listOfBook[i].quantity) {
                    res.status(400).json(`Sách ${book.name} không đủ số lượng yêu cầu của order!`);
                }

                total += req.body.listOfBook[i].quantity * book.price;
            }

            for (i in req.body.listOfBook) {
                await model.Book.updateOne({ _id: req.body.listOfBook[i].book }, { $inc: { stock: - req.body.listOfBook[i].quantity } });
            }

            console.log(total);
            //Tạo đối tượng đơn hàng
            const order = new model.Order({
                date: Date(Date.now()),
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
    },
    searchOrder: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const itemPerPage = req.query.itemPerPage || 10;
            const minDate = req.query.minDate || "";
            const maxDate = req.query.maxDate || Date(Date.now());
            console.log(maxDate);
            const listOfOrder = await model.Order.find().sort({ date: 1 }).skip((req.query.page - 1) * req.query.itemPerPage).limit(itemPerPage);
            res.status(200).json(listOfOrder);
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    }
}

module.exports = orderController;