// import dependencies you will use
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
//setting up Express Validator
const {check, validationResult} = require('express-validator'); // ES6 standard for destructuring an object

// setup databse connection - to connect front end application with back end database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mystore',{
    useNewUrlParser: true,
    useUnifiedTopology: true   
});

// set up the model for the order 
const Order = mongoose.model('Order',{
            name : String,
            email : String,
            phone : String, 
            postcode : String,
            product1 : Number,
            product2 : Number,
            product3 : Number,
            subTotal : Number,
            tax : Number,
            total : Number,
            shipping : Number
});

// set up variables to use packages
var myApp = express();
myApp.use(bodyParser.urlencoded({extended:false}));

// set path to public folders and view folders

myApp.set('views', path.join(__dirname, 'views'));
//use public folder for CSS etc.
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');
// set up different routes (pages) of the website

//home page
myApp.get('/', function(req, res){
    res.render('form'); // no need to add .ejs to the file name
});

//defining regular expressions
var phoneRegex = /^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
var postalCodeRegex = /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/;

//function to check a value using regular expression
function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    else{
        return false;
    }
}
// Custom phone validation function
function customPhoneValidation(value){
    if(!checkRegex(value, phoneRegex)){
        throw new Error('Phone should be in the format xxx-xxx-xxxx');
    }
    return true;
}
//function to check postalcode validation
function customPostalCodeValidation(value)
{
    if(!checkRegex(value, postalCodeRegex))
    {
        throw new Error('postal code format is A2A 2A2')
    }
    return true;
}
//function to ask user buy at least one product
function customProductValidation(value1, value2, value3){
     
    if (value1 < 1 && value2 < 1 && value3 < 1){
       throw new Error('You should choose at least one product');
    }
    return true;
}

//form submission handler
myApp.post('/', [
   check('name', 'Must have a name').notEmpty(),
   check('email', 'Must have an email').isEmail(),
   check('phone').custom(customPhoneValidation),
   check('address', 'must have an address').notEmpty(),
   check('city', 'Please fill up city').notEmpty(),
   check('postcode').custom(customPostalCodeValidation),
   check('province', 'Please choose between provinces').notEmpty(),
   check('product1', 'you should type a number for products number').isInt(),
   check('product2', 'you should type a number for products number').isInt(),
   check('product3', 'you should type a number for products number').isInt(),
   check('product1', 'product2', 'product3').custom(customProductValidation)
    
],function(req, res){

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        //console.log(errors); // check what is the structure of errors
        res.render('form', {
            errors:errors.array()
        });
    }
    else{
        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;
        var address = req.body.address;
        var city = req.body.city;
        var postcode = req.body.postcode;
        var province = req.body.province;
        var product1 = req.body.product1;
        var product2 = req.body.product2;
        var product3 = req.body.product3;
        var deliveryTime = req.body.deliveryTime;
        var shipping = req.body.shipping;
        
        

        var subTotal = 0;
        subTotal += product1 * 10;
        subTotal += product2 *20;
        subTotal += product3 *30;
        var shipping = 0;
        if(deliveryTime == '1'){
            shipping = 30;
        }
        if(deliveryTime == '2'){
            shipping = 25;
        }
        if(deliveryTime == '3'){
            shipping = 20;
        }
        if(deliveryTime == '4'){
            shipping = 15;
        }
        if(province = 'ON'){
            var tax = (subTotal+ shipping) * 0.13;
        }
        if(province = 'QC'){
            var tax = (subTotal+ shipping) * 0.15;
        }
        if(province = 'NY'){
            var tax = (subTotal+ shipping) * 0.14;
        }
        
        
        var total = subTotal + shipping +tax;

        var pageData = {
            name : name,
            email : email,
            phone : phone, 
            address : address,
            city : city,
            province : province,
            postcode : postcode,
            product1$10 : product1,
            product2$20 : product2,
            product3$30 : product3,
            subTotal : subTotal,
            tax : tax,
            total : total,
            shipping : shipping
        }

        // Create an object for the model Order,
        
        var myOrder = new Order(pageData);
        
        // save this order

        myOrder.save().then( ()=>{
            console.log('New order information saved in database');
        });
        
        res.render('form', pageData);
    }
});

// This is express route for all orders with data retrival procedure 
myApp.get('/allorders',function(req,res){
    Order.find({}).exec(function(err,orders){
        res.render('allorders',{orders:orders});
    });
});



//author page
myApp.get('/author',function(req,res){
    res.render('author',{
        name : 'Negin BZ',
        studentNumber : '8743698'
    }); 
});

// start the server and listen at a port
myApp.listen(8080);

//tell everything was ok
console.log('Everything executed fine.. website at port 8080....');


