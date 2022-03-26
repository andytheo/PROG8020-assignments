const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Product = require('./model/product');

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// Database connection
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/onlineStoreDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
		console.log('MongoDB connected')})

// Calculate total cart items and subtotal of products
let total = Product.aggregate([{
    $group: {
        _id: null,
        totalProducts: { $sum: '$quantity' },
        subTotal: { $sum: '$total' }
    }
    }, {
      $project: {
           _id: 0
     } }])

app.get("/", (req, res) => {
  total.exec((error, products) => {
    if (error) {
      console.log(error);
    } else {
      let cart = products[0].totalProducts;
      res.render("index", {totalCartItems: cart}); 
    }
  });
})

app.post("/", (req, res) => {
  let name = req.body.name;
  let quantity = req.body.quantity;
  let amount = req.body.amount;
  let total = Number(quantity * amount);

  var productDetail = {
                name: name,
                quantity: quantity,
                amount: amount,
                total: total
            }
  var newProduct = new Product(productDetail)
            newProduct.save().then(function(){
                console.log("Data saved in DB!");
            })

  res.send(productDetail);
});

const PORT = 3000 || 4000;
app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
})