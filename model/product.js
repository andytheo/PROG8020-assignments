const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    quantity: Number,
    total: Number
    });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
