const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Product = require('./model/product');
const {check, validationResult} = require ('express-validator');

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
		console.log('MongoDB connected')});

let phoneRegex = /^[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}$/; // 123-123-1234 OR 1231231234
let positiveNumber = /^[1-9][0-9]*$/;

function checkRegex(userInput, regex)
{
    if (regex.test(userInput))
        return true;
    else   
        return false;
}

function customPhoneValidation(value)
{
    if (!checkRegex(value, phoneRegex))
    {
        throw new Error ('Please enter correct format: 123-123-1234 OR 1231231234!');
    }
    return true;
}

app.get("/", (req, res) => {
  res.render("index"); 
})

app.post("/", (req, res) => {
  let name = req.body.name;
  let quantity = req.body.quantity;
  let amount = req.body.amount;
  let total = Number(quantity * amount);

  let productDetail = {
                name: name,
                quantity: quantity,
                amount: amount,
                total: total
            }
  let newProduct = new Product(productDetail)
            newProduct.save().then(() => {
              console.log("Data has been saved to database.");
            })
  res.redirect("/");
});

app.get("/checkout", (req, res) => {

// Calculate total cart items and subtotal of products
      res.render("checkout"); 

  
})

let grandTotal;
let subTotal;
let tax = 0.15;

app.post("/checkout", [
  check ('name', 'Name is required!').notEmpty(),
  check ('email', 'Email is required!').notEmpty(),
  check ('email', 'Please enter a valid email address!').isEmail(),
  check ('address', 'Address is required!').notEmpty(),
  check ('city', 'City is required!').notEmpty(),
  check ('province', 'Province is required!').notEmpty(),
  check ('phone', '').custom(customPhoneValidation)
  ], (req, res) => {

    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty())
    {
        res.render('checkout', {errors : errors.array()});
    }

    else 
    {
        // GrandTotal of products 
      // total.exec((error, products) => {
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     subTotal = products[0].subTotal;
      //     grandTotal = subTotal + (subTotal * tax);

      //   }
      // });

      let name = req.body.name;
      let email = req.body.email;
      let phone = req.body.phone;
      let address = req.body.address;
      let city = req.body.city;
      let province = req.body.province;

      let userData = {
          name : name, 
          email : email,
          phone : phone,
          address: address,
          city: city,
          province: province
    }

      let allPurchase;
      Product.find({}).exec((error, products) => {
        if (error) {
          console.log(error);
        } else {
          // allPurchase = products;
          console.log(products);
          console.log(userData);
    res.render('checkout', {
      name: name,
        userData : userData,
        allPurchase: products,
        subTotal: subTotal,
        tax: tax,
        grandTotal: grandTotal
    })
        }
      })

    
  }
})

// app.get("/receipt", (req, res) => {

// let grandTotal;
// let subTotal;
// let tax = 0.15;

//   // GrandTotal of products 
//   total.exec((error, products) => {
//     if (error) {
//       console.log(error);
//     } else {
//       subTotal = products[0].subTotal;
//       grandTotal = subTotal + (subTotal * tax);

//     }
//   });

//   Product.find({}).exec((error, products) => {
//     if (error) {
//       console.log(error);
//     } else {
//       let allPurchase = products;
//       console.log(products);
//       res.render("receipt", {
//         allPurchase: allPurchase,
//         subTotal: subTotal,
//         tax: tax,
//         grandTotal: grandTotal
//       }); 
//     }
//   });
// })

const PORT = 3000 || 4000;
app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
})