const model = require('../model/model')
const mongoose = require('mongoose')

const stationeryController = {
    addStationery: async (req, res) => {
        try {
            let msg;

            if (req.body.category_Name) {
                const category = await model.Category.findOne({ name: req.body.category_Name });
                if (!(await category)) {
                    msg = "Thể loại này không tồn tại.!\n"
                }
                else {
                    req.body.category = category._id;
                    const newStationery = new model.Stationery(req.body);
                    const savedStationery = await newStationery.save();
                    await category.updateOne({
                        $push: {
                            listOfItems: savedStationery._id
                        }
                    });
                    msg = "Add success!!!"
                }
            }
            res.send(msg);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    getAStationery: async (req, res) => {
        const stationerySearch = await model.Stationery.findById(req.params.id).populate("category");
        console.log(bookSearch);
        res.status(200).json(stationerySearch);
    },
    updateStationery: async (req, res) => {
        try {
            const stationeryToUpdate = await model.Stationery.findById(req.params.id);
            if (req.body.category) {
                await model.Category.findByIdAndUpdate(stationeryToUpdate.category, {
                    $pull: {
                        listOfItems: stationeryToUpdate._id
                    }
                })
                await model.Category.findByIdAndUpdate(req.body.category, {
                    $push: {
                        listOfItems: stationeryToUpdate._id
                    }
                })
            }
            const updatedStationery = await model.Stationery.findByIdAndUpdate(req.params.id, { $set: req.body })
            res.status(200).json(updatedBook)
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    },
    deleteStationery: async (req, res) => {
        try {
            const stationeryToDelete = await model.Stationery.findById(req.params.id);
            await model.Category.findByIdAndUpdate(stationeryToDelete.category, {
                $pull: {
                    listOfItems: stationeryToDelete._id
                }
            })
            await model.Stationery.findByIdAndDelete(req.params.id)
            res.status(200).json("Xóa thành công.")
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    },
    searchStationery: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const itemPerPage = req.query.itemPerPage || 10;
            const nameToSearch = req.query.name || "";
            const minPrice = req.query.minPrice || 0;
            const maxPrice = req.query.maxPrice || 100000000;
            console.log(page, itemPerPage, nameToSearch, minPrice, maxPrice);
            const listOfItems = await model.Stationery.find()
                .where({
                    name: { $regex: nameToSearch }
                }).where({
                    price: {
                        $lte: maxPrice,
                        $gte: minPrice
                    }
                })
                .sort({ name: 1 })
                .skip((page - 1) * itemPerPage)
                .limit(itemPerPage);
            res.status(200).json(listOfItems);
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message });
        }
    }
}

module.exports = stationeryController;