const model = require('../model/model')

const orderController = {
    addOrder: async (req, res) => {
        try {
            // Tính tổng giá trị đơn hàng
            var total = 0;
            for (i in req.body.listOfBook) {
                const book = (await model.Book.findById(req.body.listOfBook[i].book));
                if (book.stock < req.body.listOfBook[i].quantity){
                    res.status(400).json(`Sách ${book.name} không đủ số lượng yêu cầu của order!`);
                }

                total += req.body.listOfBook[i].quantity * book.price;
            }

            for (i in req.body.listOfBook) {
                await model.Book.updateOne({_id: req.body.listOfBook[i].book}, {$inc : {stock: - req.body.listOfBook[i].quantity}});
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
    }
}

module.exports = orderController;