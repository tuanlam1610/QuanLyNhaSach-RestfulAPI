const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    author: {
        type: String,
        required: true
    },
    publishedYear: {
        type: Number,
        min: 1600
    },
    imagePath: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
})

const stationerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    imagePath: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
})

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    type: {
        type: String,
        enum: ["Book", "Stationery"],
        required: true
    },
    listOfItems: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: "listOfItems.type"
    }]
})

const orderSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    listOfItems: {
        type: [{
            type: {
                type: String,
                enum: ["Book", "Stationery"],
                required: true
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "listOfItems.type",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }],
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true
    }
})

let User = mongoose.model("User", userSchema);
let Book = mongoose.model("Book", bookSchema);
let Stationery = mongoose.model("Stationery", stationerySchema)
let Category = mongoose.model("Category", categorySchema);
let Order = mongoose.model("Order", orderSchema);

module.exports = { User, Book, Stationery, Category, Order }