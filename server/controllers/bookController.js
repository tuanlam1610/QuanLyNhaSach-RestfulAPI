const model = require('../model/model')

const bookController = {
    addBook: async (req, res) => {
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
    },
    searchBook: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const itemPerPage = req.query.itemPerPage || 10;
            const nameToSearch = req.query.name || "";
            const minPrice = req.query.minPrice || 0;
            const maxPrice = req.query.maxPrice || 100000000;
            const listOfBook = await model.Book.find({ category: req.params.id })
                .where({
                    name: { $regex: nameToSearch }
                },{
                    price: {
                        $lte: maxPrice,
                        $gte: minPrice
                    }
                })
                .sort({ name: 1 })
                .skip((req.query.page - 1) * req.query.itemPerPage)
                .limit(itemPerPage);
            res.status(200).json(listOfBook);
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    }
}

module.exports = bookController;