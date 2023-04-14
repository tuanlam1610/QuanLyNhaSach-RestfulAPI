const model = require('../model/model')

const orderController = {
    addOrder: async (req, res) => {
        try {
            // Tính tổng giá trị đơn hàng
            var total = 0;
            for (i in req.body.listOfItems) {
                var product;
                if (req.body.listOfItems[i].type === "Book") {
                    product = await model.Book.findById(req.body.listOfItems[i].product);
                }
                else {
                    product = await model.Stationery.findById(req.body.listOfItems[i].product)
                }
                if (product.stock < req.body.listOfItems[i].quantity) {
                    res.status(400).json(`Sách ${product.name} không đủ số lượng yêu cầu của order!`);
                }

                total += req.body.listOfItems[i].quantity * product.price;
                console.log(product.price)
            }

            for (i in req.body.listOfItems) {
                if (req.body.listOfItems[i].type === "Book") {
                    await model.Book.updateOne({ _id: req.body.listOfItems[i].product }, { $inc: { stock: - req.body.listOfItems[i].quantity } });
                }
                else {
                    await model.Stationery.updateOne({ _id: req.body.listOfItems[i].product }, { $inc: { stock: - req.body.listOfItems[i].quantity } });
                }
            }

            console.log(total);
            //Tạo đối tượng đơn hàng
            const order = new model.Order({
                listOfItems: req.body.listOfItems,
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
            const minDate = req.query.minDate ? new Date(req.query.minDate) : null;
            const maxDate = req.query.maxDate ? new Date(req.query.maxDate) : Date(Date.now());
            console.log(minDate);
            console.log(maxDate);
            const listOfOrder = await model.Order.find({
                date: {
                    $lte: maxDate,
                    $gte: minDate
                }
            }).sort({ date: -1 }).skip((req.query.page - 1) * req.query.itemPerPage).limit(itemPerPage);
            res.status(200).json(listOfOrder);
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    },
    getAnOrder: async (req, res) => {
        try {
            const orderSearch = await model.Order.findById(req.params.id).populate({
                path: "listOfItems.product",
                collection: (doc) => {
                    if (doc.type === "Book") {
                        return Book;
                    } else if (doc.type === "Stationnery") {
                        return Stationnery;
                    } else {
                        return null;
                    }
                },
                populate: {
                    path: "category",
                    collection: "Category",
                    select: "name"
                }
            });
            res.status(200).json(orderSearch);
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    },
    deleteAnOrder: async (req, res) => {
        try {
            await model.Order.findByIdAndDelete(req.params.id);
            res.status(200).json("Xóa đơn hàng thành công.")
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    },
    updateAnOrder: async (req, res) => {
        try {
            const orderToUpdate = await model.Order.findById(req.params.id).populate({
                path: "listOfItems.product",
                collection: (doc) => {
                    if (doc.type === "Book") {
                        return Book;
                    } else if (doc.type === "Stationnery") {
                        return Stationnery;
                    } else {
                        return null;
                    }
                }
            });

            if (!orderToUpdate) res.status(400).json("Không tìm thấy order");
            for (let i = 0; i < orderToUpdate.listOfItems.length; i++) {
                const originalItem = orderToUpdate.listOfItems[i];
                const product = await originalItem.product.constructor.findById(originalItem.product);
                product.stock += originalItem.quantity;
                product.save();
            }
            var total = 0;
            for (i in req.body.listOfItems) {
                var product;
                if (req.body.listOfItems[i].type === "Book") {
                    product = await model.Book.findById(req.body.listOfItems[i].product);
                }
                else {
                    product = await model.Stationery.findById(req.body.listOfItems[i].product)
                }
                if (product.stock < req.body.listOfItems[i].quantity) {
                    res.status(400).json(`Sách ${product.name} không đủ số lượng yêu cầu của order!`);
                }

                total += req.body.listOfItems[i].quantity * product.price;
                console.log(product.price)
            }

            for (i in req.body.listOfItems) {
                if (req.body.listOfItems[i].type === "Book") {
                    await model.Book.updateOne({ _id: req.body.listOfItems[i].product }, { $inc: { stock: - req.body.listOfItems[i].quantity } });
                }
                else {
                    await model.Stationery.updateOne({ _id: req.body.listOfItems[i].product }, { $inc: { stock: - req.body.listOfItems[i].quantity } });
                }
            }

            console.log(total);
            //Tạo đối tượng đơn hàng
            orderToUpdate.listOfItems = req.body.listOfItems
            orderToUpdate.totalPrice = total

            orderToUpdate.save();
            res.status(200).json(orderToUpdate)
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    },
    incomeReport: async (req, res) => {
        try {
            const modeReport = req.query.mode;
            const start = new Date(req.query.minDate);
            const end = req.query.maxDate ? new Date(req.query.maxDate) : Date(Date.now());
            console.log(start);
            console.log(end);

            const filter = {
                date: { $gte: start, $lte: end }
            };

            let aggregateQuery = [
                { $match: filter },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                        },
                        totalIncome: { $sum: "$totalPrice" }
                    }
                }
            ];

            if (modeReport === "month") {
                aggregateQuery[1].$group._id = { $dateToString: { format: "%Y-%m", date: "$date" } };
            } else if (modeReport === "year") {
                aggregateQuery[1].$group._id = { $dateToString: { format: "%Y", date: "$date" } };
            }

            const incomeReport = await model.Order.aggregate(aggregateQuery);

            res.status(200).json(incomeReport); 
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    }
}

module.exports = orderController;