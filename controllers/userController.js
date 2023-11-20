const User       = require('../models/userModel');

const bcrypt     =  require('bcrypt');

const bodyParser = require('body-parser');

const Product = require('../models/productModel');

const Cart      = require('../models/cartModel');

const Order     = require('../models/orderModel');

const Coupon    = require('../models/couponModel');

const Banner    = require('../models/bannerModel');

const Category  = require('../models/categoryModel');

const Referal   = require('../models/referalModel');

const Brand     = require('../models/brandModel');

const Offer     = require('../models/offerModel');

const path      = require('path');

const fs        = require('fs');

const Razorpay  = require('razorpay');

const moment    = require('moment');

const dotenv    = require('dotenv');

dotenv.config();

const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_KEY }  = process.env;

const razorpayInstance  = new Razorpay({
  key_id:RAZORPAY_KEY_ID,
  key_secret:RAZORPAY_SECRET_KEY
})

function generateReferalCode(){
  const charactors  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const codeLength  = 8;

  let referalCode = '';
  
  for(let i=0;i<codeLength;i++){
    
    const randomIndex = Math.floor(Math.random() * charactors.length);
    referalCode += charactors.charAt(randomIndex);
  }
  return referalCode;
}


const securePassword  = async(password)=>{

  try {
    
    const hashedPassword  = await bcrypt.hash(password,10);
    return hashedPassword;

  } catch (error) {
    console.log(error.message);
  }

}

const nodemailer = require('nodemailer');

const config     = require('../config/config');

const otpObj = {
  otp:()=>{
    const otp = Math.floor(1000+Math.random()*9000);
    console.log(3);
    return otp.toString();
  }
}

const sendOtp = async(email,otp)=>{
  try {
    console.log(4);
    
    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:config.emailUser,
        pass:config.emailPassword
      }
    });

    console.log(5);
    const mailOption = {
      from:'vishnu18js@gmail.com',
      to:email,
      subject:"Otp for verification",
      html:'<p>your otp for creating account in adlante is '+otp+' . please copy and paste it in the otp box.</p>'
    }

    transporter.sendMail(mailOption,(error,info)=>{
      if(error){
        console.log(error);
      }
      else{
        console.log("otp has been sent : ",info.response);
      }
    })

  } catch (error) {
    console.log(error.message);
  }
}

const loadLogin = async(req,res)=>{
  try {
    
    res.render('login',{message:''});

  } catch (error) {
    console.log(error.message);
  }
}

const loadRegister  = async(req,res)=>{

  try {
    
    res.render('registration',{message:''});

  } catch (error) {
    console.log(error.message);
  }

}

const loadOtpVerification = async(req,res)=>{

  try {
    const { name,email,mobile,password } = req.body;
    const checkMail = await User.findOne({email:email});
    const checkNum  = await User.findOne({mobile:mobile});
    
    req.session.email=email;
    req.session.mobile=mobile;
    req.session.name=name;
    req.session.password=password;
    req.session.referCode = req.body.referCode;

    if(checkMail){
      res.render('registration',{message:"Email already used"});
      req.session.destroy();
    }
    else if(checkNum){
      res.render('registration',{message:"phone number already used"});
      req.session.destroy();
    }
    else{

      const otp = otpObj.otp();
      console.log(otp);
      sendOtp(email,otp);
      req.session.otp = otp;
      res.render('verification',{message:''});
    }

  } catch (error) {
    console.log(error.message);
    res.render('registration',{message:"invalid input"});
  }

}

const resend  = async(req,res)=>{
  try {
    const email=req.session.email;
    res.render('verification',{message:''});
    const otp = otpObj.otp();
    req.session.otp = otp;
    sendOtp(email,otp);

  } catch (error) {
    console.log(error.message);
  }
}


const insertUser  = async(req,res)=>{

  try {
    
    const {number1,number2,number3,number4} = req.body;
    const enteredNumber = `${number1}${number2}${number3}${number4}`;
    const { otp:storedOtp, name:storedName, email:storedEmail, mobile:storedMobile, password:storedPassword } = req.session;
    const referCode = req.session.referCode;
    const referCodeExist  = await Referal.find({referalCode:referCode});

    const referalBalance  = referCodeExist !== 0 ? 50 : 0;

    const sPassword = await securePassword(storedPassword);
    const referalCode = generateReferalCode();

    if(enteredNumber === storedOtp){
      const user  = new User({
        name: storedName,
        email:storedEmail,
        mobile:storedMobile,
        password:sPassword,
        referCode:referalCode,
        rewardBalance:referalBalance,
        is_verified:1
      })

      const userData  = await user.save();
      if(userData){
        res.render('verification',{message:"Registration successfull. Please login"});
      }

      const referalCodes  = new Referal({
        referalCode:referalCode
      })

      await referalCodes.save();
    }
    
  } catch (error) {
    console.log(error.message);
  }

}

const verifyLogin = async(req,res)=>{

  try {
    
    const {emailOrPhone,password} = req.body;
    
    const userData  = await User.findOne({email:emailOrPhone});
    const secur = await securePassword(password);

    if(userData){
      
      const passwordMatch = await bcrypt.compare(password,userData.password);
      if(passwordMatch){

        if(userData.active !== 'blocked'){
          req.session.user_id = userData._id;
          res.redirect('/homepage');
        }
        else{
          res.render('login',{message:"you are currently blocked. Try again later."});
        }
      }
      else{
        res.render('login',{message:"incorrect credentials"});
      }

    }
    else{
      res.render('login',{message:"incorrect credentials"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const loadForgot  = async(req,res)=>{

  try {
    
    res.render('forgot');

  } catch (error) {
    console.log(error.message);
  }

}

const forgotPassword  = async(req,res)=>{

  try {
    
    const { email:enteredMail } = req.body;
    const userData  = await User.findOne({email:enteredMail});

    if(userData){
      req.session.enteredMail = enteredMail;
      sendMail(enteredMail,userData.name);
      res.render('forgot',{alertmessage:"a password resetting link has been sent to your mail."})
    }
    else{
      res.render('forgot',{alertmessage:"enter a valid email"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const sendMail = async(email,name)=>{
  
  try {
    const transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:config.emailUser,
        pass:config.emailPassword
      }
    });

    const mailOption = {
      from:'vetkot pvt ltd',
      to:email,
      subject:"Password reset link",
      html: `<p> Hi ${name}, for resetting password click <a href="http://127.0.0.1:7000/resetPassword?email=${email}">here</a></p>`
    }

    transporter.sendMail(mailOption,(error,info)=>{
      if(error){
        console.log(error);
      }
      else{
        console.log("reset link has been sent : ",info.response);
      }
    })

  } catch (error) {
    console.log(error.message);
  }
}

const resetPassword = async(req,res)=>{

  try {

    req.session.email = req.query.email;

    res.render('resetPassword');
    
  } catch (error) {
    console.log(error.message);
  }

}

const resetPasswordbyForgot = async(req,res)=>{

  try {
    
    const email = req.session.email;
    const { password:newPassword } = req.body;
    const sPassword = await securePassword(newPassword);

    const updatedData = await User.updateOne({email:email},{$set:{password:sPassword}});
    req.session.destroy();
    if(updatedData.modifiedCount === 1){
      res.redirect('/');
    }
    else{
      res.redirect('/');
    }


  } catch (error) {
    console.log(error.message);
  }

}

const loadHome  = async(req,res)=>{

  try {
    
    const userID  = req.session.user_id;
    const user    = await User.findById({_id:userID});
    const cart    = await Cart.findOne({userID:userID});
    const products= await Product.find();
    const offer = await Offer.findOne({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
    
    
    if(user.active !== 'blocked'){
      res.render('homepage',{cart:cart,products:products,offer:offer});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }
}

const logout  = async(req,res)=>{

  try {
    req.session.destroy();
    res.redirect('/');

  } catch (error) {
    console.log(error.message);
  }

}

const loadShop  = async(req,res)=>{

  try {
    
    delete req.session.productID;
    const brands  = await Brand.find();
    var page  = 1;
    if(req.query.page){
      page  = req.query.page;
    }

    const { limit }  = req.body;
    const { currentLimit }  = req.query;

    let product;

    if(currentLimit !== undefined){

      product = await Product.find()
      .limit(currentLimit * 1)
      .skip((page - 1) * currentLimit)
      .exec();
    }
    else{
      product = await Product.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    }
    const count   = await Product.find()
    .countDocuments();
    const banner  = await Banner.findOne();
    const category= await Category.find();

    const userID  = req.session.user_id;
    const cart    = await Cart.findOne({userID:userID});
    const user    = await User.findById({_id:userID});
    if(user.active !== 'blocked'){
      const offer = await Offer.find();
      res.render('shop',{offer,banner:banner,products:product,user:user,categories:category,brands:brands,cart:cart,totalPages:Math.ceil(count/limit)||Math.ceil(count/currentLimit),currentPage:page,currentLimit:limit||currentLimit});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const myProfileLoad = async(req,res)=>{

  try {
    
    const userID = req.session.user_id;
    const user = await User.findById({_id:userID});
    const orders = await Order.find({userId:userID});
    const cart   =  await Cart.findOne({userID:userID});
    const date   = moment(user.joinedDate).format("DD MM YYYY")

    if(user.active !== 'blocked'){
      res.render('myProfile',{user:user,orders:orders,cart,date});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const loadChangePassword  = async(req,res)=>{

  try {
    
    res.render('changePassword');

  } catch (error) {
    console.log(error.message);
  }

}

const changePassword  = async(req,res)=>{

  try {
    
    const { password }  = req.body;
    const userId  = req.session.user_id;
    const user  = await User.findOne({_id:userId});
    const passwordMatch = await bcrypt.compare(password,user.password);

    if(passwordMatch){
      res.render('newPassword');
    }
    else{
      res.render('changePassword',{message:'incorrect password. please try again.'});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const newPassword = async(req,res)=>{
  console.log('changing...');

  try {
    
    const userId  = req.session.user_id;
    const {password}  = req.body;
    const user  = await User.findOne({_id:userId});
    if(user){
      const userData  = await User.updateOne({
        $set:{password:password}
      });

      if(userData.modifiedCount===1){
        res.redirect('/myProfile');
      }
    }

  } catch (error) {
    console.log(error.message);
  }

}

const addAddress  = async(req,res)=>{

  try {
    
    const{ userName,houseName,postOffice,landmark,district,state,country,pin,contactNumber } = req.body;
    const userID  = req.session.user_id;

    const user  = await User.findById({_id:userID});

    const newAddress  = {
      userName,
      houseName,
      postOffice,
      landmark,
      district,
      state,
      country,
      pin,
      contactNumber,
      makeDefault:Date.now()
    }

    user.address.push(newAddress);

    await user.save();

    res.redirect('/myProfile');

  } catch (error) {
    console.log(error.message);
  }

}


const editAddress = async (req, res) => {
  try {
    const { houseName, postOffice, landmark, district, state, country, pin, contactNumber } = req.body;
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });

    // Find the index of the document with the lowest makeDefault value
    const index = user.address.reduce((minIndex, currentAddress, currentIndex, addresses) => {
      const currentMakeDefault = currentAddress.makeDefault || 0;
      const minMakeDefault = addresses[minIndex].makeDefault || 0;

      return currentMakeDefault < minMakeDefault ? currentIndex : minIndex;
    }, 0);

    // Update only the provided data in the document at the found index
    const updateData = { $set: {} };

    const trimAndCheck = (value) => {
      const trimmedValue = value.trim();
      return trimmedValue !== '';
    };

    if (trimAndCheck(houseName)) {
      updateData.$set[`address.${index}.houseName`] = houseName.trim();
    }
    if (trimAndCheck(postOffice)) {
      updateData.$set[`address.${index}.postOffice`] = postOffice.trim();
    }
    if (trimAndCheck(landmark)) {
      updateData.$set[`address.${index}.landmark`] = landmark.trim();
    }
    if (trimAndCheck(district)) {
      updateData.$set[`address.${index}.district`] = district.trim();
    }
    if (trimAndCheck(state)) {
      updateData.$set[`address.${index}.state`] = state.trim();
    }
    if (trimAndCheck(country)) {
      updateData.$set[`address.${index}.country`] = country.trim();
    }
    if (trimAndCheck(pin)) {
      updateData.$set[`address.${index}.pin`] = pin.trim();
    }
    if (trimAndCheck(contactNumber)) {
      updateData.$set[`address.${index}.contactNumber`] = contactNumber.trim();
    }

    const userData = await User.updateOne({ _id: userID }, updateData);

    if (userData.modifiedCount === 1) {
      res.redirect('/myProfile');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  console.log('deleting');

  try {
    
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });
    const { makeDefault } = req.body;
    const formattedDate = new Date(Date.parse(makeDefault));

    const index = user.address.reduce((index, currentAddress, currentIndex, addresses) => {
      const currentMakeDefault = currentAddress.makeDefault || 0;

      return currentMakeDefault.toISOString().substring(0,19) === formattedDate.toISOString().substring(0,19) ? currentIndex : index;
    }, -1);

    if (index !== -1) {

      user.address.splice(index,1);

      const userData  = await user.save();

      if (userData) {
        res.redirect('/myProfile');
      } else {
        console.log('userdata not updated');
      }
    }

  } catch (error) {
    console.log(error.message);
  }
};

const makeDefaultAddress  = async(req,res)=>{
console.log('making default');
  try {
    
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });
    const { makeDefault } = req.body;
    const formattedDate = new Date(Date.parse(makeDefault));

    const index = user.address.reduce((index,currentAddress,currentIndex,addresses)=>{

      const currentMakeDefault  = currentAddress.makeDefault;

      return currentMakeDefault.toISOString().substring(0,19) === formattedDate.toISOString().substring(0,19) ? currentIndex : index ;
    },-1);

    user.address[index].makeDefault = Date.now();
    
    const userData  = await user.save();
    if(userData){
      res.redirect('/myProfile');
    }
    else{
      console.log('not set default');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const productDetails  = async(req,res)=>{

  try {
    
    const { productID } = req.body;

    req.session.productID = productID;
    
    res.redirect('/loadProductDetails');

  } catch (error) {
    console.log(error.message);
  }

}

const loadProductDetails  = async(req,res)=>{

  try {
    
    const productID = req.session.productID;
    const userID    = req.session.user_id;
    const user  = await User.findById({_id: userID});
    const banner  = await Banner.findOne();
    const offer   = await Offer.find();

    const product = await Product.findOne({_id:productID});
    const cart    = await Cart.findOne({userID:userID})

    if(user.active !== 'blocked'){
    
      if(product){

        res.header('Cache-Control','no-store , no-cache , must-revalidate');
        res.render('productDetails',{offer,banner:banner,product:product,cart:cart});
        delete req.session.productID;
        
      }
      else{
        console.log('product not found');
      }
    }
  } catch (error) {
    console.log(error.message);
  }

}

const addToCart = async(req,res)=>{

  try {
    
    const { productID,quantity } = req.body;
    const userID  = req.session.user_id;
    const user = await User.findById({_id:userID});
    req.session.productID = productID;

    const CartFound = await Cart.findOne({userID:userID});

    if(user.active !== 'blocked'){
      if(!CartFound){

        const cart  = new Cart({
          userID:userID,
          items:[
            {productId:productID,
            quantity:parseInt(quantity)}
          ]
        });
  
        cart.save();
        res.redirect('/loadProductDetails');
  
      }
      else{
  
        const cart  = await Cart.findOne({userID:userID});
  
        const productIds  = cart.items.map(item=>item.productId);
  
        const productExist  = productIds.includes(productID);
  
        if(productExist){
  
          const existingItem  = cart.items.find((item)=>item.productId === productID);
          existingItem.quantity += parseInt(quantity);
          await cart.save();
          res.redirect('/loadProductDetails');
  
        }
        else{
  
          cart.items.push({productId:productID,quantity:parseInt(quantity)});
          await cart.save();
          res.redirect('/loadProductDetails');
  
        }
      } 
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const loadCartPage  = async(req,res)=>{

  try {
    
    const userID  = req.session.user_id;
    const userCart    = await Cart.findOne({userID:userID});
    const banner      = await Banner.findOne();
    const offer       = await Offer.find();

    const productIds  = userCart.items.map(item=>item.productId);

    const products    = await Product.find({_id:{$in:productIds}});
    const user = await User.findById({_id:userID});

    const initialSubtotal = userCart.items.reduce((total, item) => {
      const product = products.find(p => p._id.toString() === item.productId.toString());
    
      // Check if there is an offer for the category
      const categoryOffer = offer.find(offer => offer.category == product.category);
    
      if (categoryOffer) {
        // Apply offer based on the offer type
        switch (categoryOffer.offerType) {
          case 'percentage':
            // Subtract percentage from regular price
            total += (product.saleprice - (product.saleprice * categoryOffer.offerValue / 100)) * item.quantity;
            break;
          case 'fixed':
            // Subtract fixed amount from sale price
            total += (product.saleprice - categoryOffer.offerValue) * item.quantity;
            break;
          // Add more cases for other offer types if needed
        }
      } else {
        // No offer for the category, use the regular calculation
        total += product.saleprice * item.quantity;
      }
    
      return total;
    }, 0);
    

    if(user.active !== 'blocked'){

      if(userCart.items.length !== 0){

        res.render('cartPage',{offer,products,cart:userCart,initialSubtotal,message:"",banner:banner});

      }
      else{
        res.render('cartPage',{offer,message:"Cart is empty. Add products",banner:banner});
      }
      
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const updateCart  = async(req,res)=>{

  try {

    const updatedQuantity = {};

    for(let key in req.body){
      
      if(key.startsWith('quantity_')){

        const productID = key.replace('quantity_','');
        const quantity  = parseInt(req.body[key],10);
        updatedQuantity[productID]  = quantity;

      }
    }

    const userID    = req.session.user_id;
    const userCart  = await Cart.findOne({userID:userID});

    userCart.items.forEach((item)=>{

      if(updatedQuantity[item.productId]){
        
        item.quantity = updatedQuantity[item.productId];

      }
    });

    const cartUpdated = await userCart.save();

    if(cartUpdated){
      
      res.redirect('/cartPage');

    }
    else{
      console.log('not updated');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const applyCoupon = async(req,res)=>{

  try {
    
    const { couponCode } = req.body;
    const validCoupon = await Coupon.findOne({code:couponCode});
    const userID  = req.session.user_id;
    const userCart    = await Cart.findOne({userID:userID});

    const productIds  = userCart.items.map(item=>item.productId);
    const banner      = await Banner.findOne();

    const products    = await Product.find({_id:{$in:productIds}});
    const user = await User.findById({_id:userID});

    const initialSubtotal = userCart.items.reduce((total, item) => {
      const product = products.find(p => p._id.toString() === item.productId.toString());
      return total + (product.saleprice * item.quantity);
    }, 0);
    req.session.initialSubtotal = initialSubtotal;
    const subTotal  = initialSubtotal-(initialSubtotal*(validCoupon.discountValue/100));
    
    if(Date.now() > validCoupon.endDate.getTime()){
      res.render('cartPage',{products,cart:userCart,initialSubtotal,banner:banner,message:"coupon expired"});
    }
    else{
      if(user.active !== 'blocked'){

        if(userCart.items.length !== 0){
  
          res.render('cartPage',{coupon:validCoupon,products,cart:userCart,initialSubtotal:subTotal,message:"coupon added",banner:banner});
  
        }
        else{
          res.render('cartPage',{message:"Cart is empty. Add products",banner:banner});
        }
        
      }
      else{
        res.redirect('/');
      }
    }
  } catch (error) {
    console.log(error.message);
  }

}

const removeCoupon  = async(req,res)=>{

  try {
    
    const initialSubtotal = req.session.initialSubtotal;
    const userID  = req.session.user_id;
    const userCart  = await Cart.findOne({userID:userID});
    const productIds  = userCart.items.map(item=>item.productId);
    const banner      = await Banner.findOne();
    const user        = await User.findById({_id:userID});
    const products    = await Product.find({_id:{$in:productIds}});

    if(user.active  !== 'blocked'){
      res.render('cartPage',{message:"coupon removed",products,cart:userCart,banner:banner,initialSubtotal});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }

}


const deleteFromCart  = async(req,res)=>{
  console.log('item deleting..');

  try {

    const { deleteProductId } = req.body;

    const userID    = req.session.user_id;
    const userCart  = await Cart.findOne({userID:userID});

    userCart.items  = userCart.items.filter(item=>item.productId !== deleteProductId);

    const itemDeleted = await userCart.save();

    if(itemDeleted){
      res.redirect('/cartPage');
      console.log('item deleted');
    }
    else{
      console.log('item not deleted');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const proceedToCheckout  = async(req,res)=>{
  console.log('loading proceed to checkout');

  try {

    const { subTotal }  = req.body;
    const banner  = await Banner.findOne();
    const userID  = req.session.user_id;
    const user    = await User.findById({_id:userID});
    const userCart  = await Cart.findOne({userID:userID});
    const userOrders= await Order.find({userId:userID});

    const productIds  = userCart.items.map((item)=>item.productId);
    const products     = await Product.find({_id:{$in:productIds}});
    const discount  = (parseFloat(subTotal)- parseFloat(req.session.initialSubtotal))||0;

    if(user.active !== 'blocked'){
      res.render('checkoutPage',{orders:userOrders,cart:userCart,products:products,subTotal:Math.round(subTotal),user:user,discount:Math.round(discount),banner:banner});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }

}



const confirmOrder = async (req, res,next) => {
  console.log('order saving...');

  try {
    const userId = req.session.user_id;
    const user = await User.findById({ _id: userId });
    const { userName, total, paymentOption,billingAndShipping,shippingAddress,billingAddress,discountValue } = req.body;
    const parsedShippingAddress = JSON.parse(shippingAddress);

    const orderItems = [];

    // Extract quantities and totals from request body
    for (let key in req.body) {
      if (key.startsWith('quantity_')) {
        const productId = key.replace('quantity_', '');
        const quantity = parseInt(req.body[key], 10);

        // Find the latest product details using productId
        const product = await Product.findById(productId);

        if (product) {
          orderItems.push({
            productId: productId,
            quantity: quantity,
            price: product.saleprice,
            total: quantity * product.saleprice,
            title: product.title, // Add the product title
          });
        }
      }
    }

    const latestOrder = await Order.findOne().sort({ createdAt: -1 });

    let latestCount;
    if (latestOrder) {
      latestCount = latestOrder.orderCount + 1;
    }

    const newCount = latestCount === undefined ? orderCount : latestCount;

    // Update the orderCount for the latestOrder if it exists
    if (latestOrder) {
      latestOrder.orderCount = newCount;
      await latestOrder.save();
    }

    const orderId = '#' + newCount.toString().padStart(10, '0');
    req.session.orderId = orderId;

    const order = new Order({
      userId: userId,
      orderId: orderId,
      userName: userName,
      paymentStatus: paymentOption,
      items: orderItems,
      subtotal: parseFloat(total),
      discountValue:parseFloat(discountValue)||0,
      orderCount: newCount,
      shippingAddress:parsedShippingAddress,
      billingAndShipping:billingAndShipping,
      billingAddress:billingAddress||{}
    });

    const newOrder = await order.save();

    if (newOrder) {
      console.log('order created');


      const razorpayOrders = await Promise.all(orderItems.map(async (item) => {
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: parseFloat(total)*100, // amount in paise
          currency: 'INR',
          receipt: `${orderId}-${item.productId}`,
        });
      
        return {
          order_id: razorpayOrder.id,
          amount: item.total,
          product: {
            title: item.title,
            // Add other product details if needed
          },
        };
      }));
      
      const razorpayTotalAmount = total;
      console.log(discountValue)

      // Return details for each Razorpay order
      res.status(200).json({
        key_id: RAZORPAY_KEY_ID,
        success: true,
        orders: razorpayOrders,
        contact: user.address[0].contactNumber,
        email: user.email,
        total:parseFloat(razorpayTotalAmount),
      });

      next();
    } else {
      res.status(400).json({ success: false, msg: 'Order not confirmed' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, msg: 'Error confirming order' });
  }
}

const updateOrderPaymentSuccess = async(req,res)=>{

  console.log("successing");
  try {

    const orderId = req.session.orderId;
    // Update the order payment status to 'success' in the database
    const updatedOrder = await Order.updateOne({orderId:orderId},{$set:{paymentStatus:"success"}});

    const userID  = req.session.user_id;
    const user  = await User.findByIdAndUpdate({_id:userID},{$set:{rewardBalance:0}});

    res.json({ success: true, updatedOrder });
    res.session.orderId.delete();
  } catch (error) {
    console.log(error.message);
  }

}

const updateOrderPaymentFailure = async(req,res)=>{

  console.log("failing");
  try {
    const orderId = req.session.orderId;
    // Update the order payment status to 'failure' in the database
    const updatedOrder = await Order.updateOne({orderId:orderId},{$set:{paymentStatus:"failed"}});
    res.json({ success: true, updatedOrder });
    delete req.session.orderId;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: 'Error updating order payment status' });
  }

}




const orderDetails  = async(req,res)=>{

  try {
    
    const { orderId } = req.body;
    const userId = req.session.user_id;
    const order = await Order.findOne({orderId:orderId});
    const productIds  = order.items.flat().map(item=>item.productId);
    const products  = await Product.find({_id:{$in:productIds}});
    const cart = await Cart.findOne({userID:userId});
    if(order){
      res.render('orderDetails',{order:order,products:products,cart});
    }
    else{
      res.redirect('/myProfile');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const cancelOrder = async(req,res)=>{
  console.log('order deleting...');

  try {
    
    const { orderId } = req.body;
    const order = await Order.findOne({orderId:orderId});
    
    if(order){

      await order.deleteOne({orderId:orderId});
      setTimeout(()=>{
        res.redirect('/shop');
      },2000)
    }

  } catch (error) {
    console.log(error.message);
  }

}

const searchProduct = async (req, res) => {
  const { searchQuery } = req.body;

  try {
    let product;

    delete req.session.productID;
    const brands  = await Brand.find();
    const category = await Category.find();
    const banner = await Banner.findOne();
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });
    const cart    = await Cart.findOne({userID:userID});
    const offer  = await Offer.find();

    var page  = 1;
    if(req.query.page){
      page  = req.query.page;
    }

    const { limit }  = req.body;
    const { currentLimit }  = req.query;

    if(currentLimit !== undefined){

      product = await Product.find({
        $or:[
          { title: { $regex: '.*' + searchQuery.replace(/\s+/g, '.*') + '.*', $options: 'i' }},
          { brand: { $regex: '.*' + searchQuery.replace(/\s+/g, '.*') + '.*', $options: 'i' }},
          { category: { $regex: '.*' + searchQuery.replace(/\s+/g, '.*')+'.*', $options: 'i' }}
        ]
      })
      .limit(currentLimit * 1)
      .skip((page - 1) * currentLimit)
      .exec();
    }
    else{
      product = await Product.find({
        $or:[
          { title: { $regex: '.*' + searchQuery.replace(/\s+/g, '.*') + '.*', $options: 'i' }},
          { brand: { $regex: '.*' + searchQuery.replace(/\s+/g, '.*') + '.*', $options: 'i' }},
          { category: { $regex: '.*' + searchQuery.replace(/\s+/g, '.*')+'.*', $options: 'i' }}
        ]
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    }
    const count   = await Product.find()
    .countDocuments();

    if(user.active !== 'blocked'){
      req.session.filteredProducts  = product;
      res.render('shop',{offer,banner:banner,products:product,user:user,categories:category,brands:brands,cart:cart,totalPages:Math.ceil(count/limit)||Math.ceil(count/currentLimit),currentPage:page,currentLimit:limit||currentLimit});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }
}

const applyPriceFilter = async (req, res) => {
  console.log('price filter loading');
  const { minPrice, maxPrice } = req.body;
  const productsData  = req.session.filteredProducts;
  const category = await Category.find();

  try {
    let products;

    if (productsData) {
      // If productsData is provided, filter based on it
      const productIds = productsData.map(product => product._id);
      products = await Product.find({
        _id: { $in: productIds },
        saleprice: { $gte: minPrice, $lte: maxPrice },
      });
    } else {
      // Otherwise, filter all products
      products = await Product.find({
        saleprice: { $gte: minPrice, $lte: maxPrice },
      });
    }

    req.session.priceFilteredProducts = products;
    res.json({ success: true, products, categories: category });
  } catch (error) {
    console.error('Error applying price filter:', error);
    res.json({ success: false, error: error.message });
  }
}


const applyFilter = async (req, res) => {
  console.log('filtering');
  try {
    const { category, brand, size } = req.body;

    const brands = await Brand.find();
    const categories = await Category.find();
    const banner = await Banner.findOne();
    const userID = req.session.user_id;
    const user = await User.findById({ _id: userID });
    const cart = await Cart.findOne({ userID: userID });
    const offer= await Offer.find();
    let products;

    var page  = 1;
    if(req.query.page){
      page  = req.query.page;
    }

    const { limit }  = req.body;
    const { currentLimit }  = req.query;

    const conditions = {};

    if (category && category!== "allCategory") {
      conditions.category = category;
    }

    if (brand && brand !== "allBrand") {
      conditions.brand = brand;
    }

    if (size && size !== "allSize") {
      conditions.size = size;
    }
    if(currentLimit !== undefined){

      products = await Product.find(conditions)
      .limit(currentLimit * 1)
      .skip((page - 1) * currentLimit)
      .exec();
    }
    else{
      products = await Product.find(conditions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    }
    const count   = await Product.find(conditions)
    .countDocuments();
    
    if(user.active !== 'blocked'){
      req.session.filteredProducts = products;
      res.render('shop',{offer,banner:banner,products:products,user:user,categories:categories,brands:brands,cart:cart,totalPages:Math.ceil(count/limit)||Math.ceil(count/currentLimit),currentPage:page,currentLimit:limit||currentLimit});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.error('Error applying filters:', error); // Log the detailed error
    res.json({ success: false, error: error.message });
  }
}

const ordersuccessPage  = async(req,res)=>{

  try {
    
    res.render('ordersuccess');

  } catch (error) {
    console.log(error.message);
  }

}

const orderFailurePage  = async(req,res)=>{

  try {
    
    res.render('orderFailure');

  } catch (error) {
    console.log(error.message);
  }

}

const walletLoad  = async(req,res)=>{

  try {

    const userId= req.session.user_id;
    const cart  = await Cart.findOne({userID:userId});
    const user  = await User.findById({_id:userId});
    res.render('wallet',{cart:cart,user:user});

  } catch (error) {
    console.log(error.message);
  }

}

const invoiceDownload = async(req,res)=>{

  try {
    
    const fileName  = req.params.fileName;
    const filePath  = path.resolve(__dirname,`../public/invoice/${fileName}`);

    if(!fs.existsSync(filePath)){
      return res.status(404).send('Invoice not found');
    }
    const fileStream  = fs.createReadStream(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type','application/pdf');
    fileStream.pipe(res);

  } catch (error) {
    console.log(error.message);
  }

}

const loadCardPay = async (req, res) => {
  console.log('wallet pay loading');

  try {
    const { addBalance } = req.body;
    console.log(addBalance);
    const userId = req.session.user_id;
    const user = await User.findById({ _id: userId });

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: parseFloat(addBalance) * 100,
      currency: 'INR',
      receipt: "aoend12223",
    });

    const razorpayTotalAmount = addBalance;
    console.log(razorpayTotalAmount);

    res.status(200).json({
      key_id: RAZORPAY_KEY_ID,
      success: true,
      order_id: razorpayOrder.id,
      contact: user.address[0].contactNumber,
      email: user.email,
      total: parseFloat(razorpayTotalAmount),
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, msg: 'Error loading wallet pay' });
  }
}


const addWalletBalance  = async(req,res)=>{

  try {
    
    const { addBalance }  = req.body;
    const userId  = req.session.user_id;
    const updatedBalance = await User.findByIdAndUpdate({
      _id:userId
    },
    {
      $inc:{
        walletBalance:addBalance
      }
    },
    {
      new:true
    })
    
    if(updatedBalance.modifiedCount === 1){
      console.log("wallet balance added");
    }
    res.json({success:true});

  } catch (error) {
    console.log(error.message);
  }

}

const priceLowToHigh  = async(req,res)=>{

  console.log('price low to high')

  try {
    
    const productsData = req.session.priceFilteredProducts !== undefined ? req.session.priceFilteredProducts:req.session.filteredProducts;
    const category    = await Category.find();

    let products;

    if (productsData) {
      // If productsData is provided, filter based on it
      const productIds = productsData.map(product => product._id);
      products = await Product.find({
        _id: { $in: productIds },
      }).sort({ saleprice: 1 }); // Sort in ascending order
    } else {
      // Otherwise, get all products and sort by sale price
      products = await Product.find({}).sort({ saleprice: 1 }); // Sort in ascending order
    }    

    res.json({ success: true, products, categories: category });

  } catch (error) {
    console.log(error.message);
  }

}

const priceHighToLow  = async(req,res)=>{

  try {
    
    const productsData = req.session.priceFilteredProducts !== undefined ? req.session.priceFilteredProducts:req.session.filteredProducts;
    const category    = await Category.find();

    let products;

    if (productsData) {
      // If productsData is provided, filter based on it
      const productIds = productsData.map(product => product._id);
      products = await Product.find({
        _id: { $in: productIds },
      }).sort({ saleprice: -1 }); // Sort in ascending order
    } else {
      // Otherwise, get all products and sort by sale price
      products = await Product.find({}).sort({ saleprice: -1 }); // Sort in ascending order
    }    

    res.json({ success: true, products, categories: category });

  } catch (error) {
    console.log(error.message);
  }

}

const loadCategoryOfferPage = async(req,res)=>{

  try {
    
    const offerCategory  = req.params.category;
    delete req.session.productID;
    const brands  = await Brand.find();
    var page  = 1;
    if(req.query.page){
      page  = req.query.page;
    }

    const { limit }  = req.body;
    const { currentLimit }  = req.query;

    let product;

    if(currentLimit !== undefined){

      product = await Product.find({category:offerCategory})
      .limit(currentLimit * 1)
      .skip((page - 1) * currentLimit)
      .exec();
    }
    else{
      product = await Product.find({category:offerCategory})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    }
    const count   = await Product.find()
    .countDocuments();
    const banner  = await Banner.findOne();
    const category= await Category.find();

    const userID  = req.session.user_id;
    const cart    = await Cart.findOne({userID:userID});
    const user    = await User.findById({_id:userID});
    if(user.active !== 'blocked'){
      const offer = await Offer.find();
      res.render('shop',{offer,banner:banner,products:product,user:user,categories:category,brands:brands,cart:cart,totalPages:Math.ceil(count/limit)||Math.ceil(count/currentLimit),currentPage:page,currentLimit:limit||currentLimit});
    }
    else{
      res.redirect('/');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const editProfile = async(req,res)=>{

  try {
    
    const {userName,userMobile }  = req.body;
    console.log(userName,userMobile);
    const userId  = req.session.user_id;
    const orders= await Order.find();
    const cart  = await Cart.find({userID:userId});
    
    if(userName && userMobile){
      await User.findByIdAndUpdate({_id:userId},{$set:{name:userName,mobile:userMobile}});
      const user  = await User.findById({_id:userId});

      console.log("both updated");
      res.json({success:true,user,orders,cart});
    }
    else if(userName || userMobile){

      if(userName){
    
        await User.findByIdAndUpdate({_id:userId},{$set:{name:userName}});
        
      }
      if(userMobile){

        await User.findByIdAndUpdate({_id:userId},{$set:{mobile:userMobile}});

      }

      console.log("either one updated");
      const user = await User.findById({_id:userId});
      res.json({success:true,user,orders,cart});

    }
    else{
      const user = await User.findById({_id:userId});
      console.log("nothing updated");
      res.json({success:false,user,orders,cart});
    }

  } catch (error) {
    console.log(error.message);
  }

}

module.exports  = {
  loadLogin,
  loadRegister,
  loadOtpVerification,
  resend,
  insertUser,
  verifyLogin,
  loadForgot,
  forgotPassword,
  sendMail,
  loadHome,
  logout,
  loadShop,
  resetPassword,
  resetPasswordbyForgot,
  myProfileLoad,
  loadChangePassword,
  changePassword,
  newPassword,
  addAddress,
  editAddress,
  deleteAddress,
  makeDefaultAddress,
  productDetails,
  loadProductDetails,
  addToCart,
  loadCartPage,
  updateCart,
  applyCoupon,
  removeCoupon,
  deleteFromCart,
  proceedToCheckout,
  updateOrderPaymentSuccess,
  updateOrderPaymentFailure,
  confirmOrder,
  orderDetails,
  cancelOrder,
  searchProduct,
  applyPriceFilter,
  applyFilter,
  priceLowToHigh,
  priceHighToLow,
  ordersuccessPage,
  orderFailurePage,
  walletLoad,
  invoiceDownload,
  loadCardPay,
  addWalletBalance,
  loadCategoryOfferPage,
  editProfile,
}