const express = require('express');
const user_route = express();

const bodyParser  = require('body-parser');

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

user_route.use(express.static('public'));

const multer  = require("multer");
const path    = require("path");

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../public/productimg'))
  },
  filename:function(req,file,cb){
    const name  = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
})

const upload  = multer({
  storage:storage,
});

const cpupload  = upload.fields([{name:'defaultImage',maxCount:1},{name:'galleryImage',maxCount:10}]);
const session = require('express-session');

const userController  = require('../controllers/userController');
const authentication  = require('../middlewares/userAuthentication');

const easyInvoice     = require('../middlewares/easyInvoice');

user_route.set('view engine','ejs');
user_route.set('views','./views/users')

user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.loadOtpVerification);

user_route.get('/forgot',userController.loadForgot);
user_route.post('/forgot',userController.forgotPassword);
user_route.get('/resetPassword',userController.resetPassword);
user_route.post('/resetPassword',userController.resetPasswordbyForgot);

user_route.get('/verification',userController.resend);
user_route.post('/verification',userController.insertUser);

user_route.get('/',authentication.isLoggedout,userController.loadLogin);
user_route.post('/',userController.verifyLogin);
user_route.get('/login',(req,res)=>{
  res.redirect('/');
}); 
user_route.post('/login',userController.verifyLogin);

user_route.get('/homepage',authentication.isLoggedin,userController.loadHome);
user_route.get('/loadCategoryOfferPage/:category',userController.loadCategoryOfferPage);

user_route.get('/myProfile',authentication.isLoggedin,userController.myProfileLoad);
user_route.post('/editProfile',authentication.isLoggedin,userController.editProfile);
user_route.get('/wallet',authentication.isLoggedin,userController.walletLoad);

user_route.post('/addaddress',userController.addAddress);
user_route.post('/editaddress',userController.editAddress);
user_route.post('/deleteAddress',userController.deleteAddress);
user_route.post('/makeDefaultAddress',userController.makeDefaultAddress);
user_route.get('/loadChangePassword',authentication.isLoggedin,userController.loadChangePassword);
user_route.post('/changePassword',userController.changePassword);
user_route.post('/newPassword',userController.newPassword);

user_route.post('/productDetails',userController.productDetails);
user_route.get('/loadProductDetails',authentication.isLoggedin,userController.loadProductDetails);
user_route.post('/addToCart',userController.addToCart);
user_route.get('/cartPage',authentication.isLoggedin,userController.loadCartPage);
user_route.post('/updateCart',userController.updateCart);
user_route.post('/applyCoupon',userController.applyCoupon);
user_route.post('/removeCoupon',userController.removeCoupon);
user_route.post('/deleteFromCart',userController.deleteFromCart);

user_route.get('/logout',userController.logout);
user_route.post('/proceedToCheckout',userController.proceedToCheckout);
user_route.post('/confirmOrder',userController.confirmOrder,easyInvoice);
user_route.post('/updateOrderPaymentSuccess',userController.updateOrderPaymentSuccess);
user_route.post('/updateOrderPaymentFailure',userController.updateOrderPaymentFailure);
user_route.post('/orderDetails',userController.orderDetails);
user_route.post('/cancelOrder',userController.cancelOrder);
user_route.get('/shop',authentication.isLoggedin,cpupload,upload.single('shopBannerImage'),authentication.isLoggedin,userController.loadShop);
user_route.post('/shop',cpupload,upload.single('shopBannerImage'),authentication.isLoggedin,userController.loadShop);
user_route.post('/searchProduct',userController.searchProduct);
user_route.post('/applyPriceFilter', userController.applyPriceFilter);
user_route.post('/applyFilter',userController.applyFilter);
user_route.get('/sort/priceLowToHigh',userController.priceLowToHigh);
user_route.get('/sort/priceHighToLow',userController.priceHighToLow);
user_route.get('/ordersuccess',authentication.isLoggedin,userController.ordersuccessPage);
user_route.get('/invoiceDownload/:fileName',userController.invoiceDownload);
user_route.get('/orderFailure',authentication.isLoggedin,userController.orderFailurePage);
user_route.post('/loadCardPay',userController.loadCardPay);
user_route.post('/addWalletBalance',userController.addWalletBalance);


module.exports  = user_route;