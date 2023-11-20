const express = require('express');
const admin_route = express();

const session     = require('express-session');
const config      = require('../config/config');
admin_route.use(session({secret:config.sessionSecret}));

const bodyParser  = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");

admin_route.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/productimg'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if the file type is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

const cpupload = upload.fields([{ name: 'defaultImage', maxCount: 1 }, { name: 'galleryImage', maxCount: 10 }]);


admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const adminController = require('../controllers/adminController');
const auth  = require('../middlewares/adminAuthentication.js');


admin_route.get('/',auth.isLoggedout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.post('/signin',adminController.verifyLogin);
admin_route.get('/signin',auth.isLoggedout,(req,res)=>{
  res.redirect('/admin');
});
admin_route.get('/adminhome',auth.isLoggedin,adminController.loadDashboard);
admin_route.get('/signout',adminController.signout);

admin_route.get('/ecommerce-customer',auth.isLoggedin,adminController.ecommerceCustomer);

admin_route.post('/customeradd',adminController.addCustomer);

admin_route.post('/block-users',adminController.blockUser);
admin_route.post('/unblock-users',adminController.unblockUser);

admin_route.get('/productList',auth.isLoggedin,adminController.loadProductList);
admin_route.get('/productEdit',auth.isLoggedin,adminController.productEditLoad);
admin_route.post('/addProduct',cpupload,adminController.addProduct);
admin_route.get('/categoryList',auth.isLoggedin,adminController.categorylistLoad);
admin_route.get('/addCategorypage',auth.isLoggedin,adminController.addCategoryload);
admin_route.get('/subcategoryList',auth.isLoggedin,adminController.updatedSubcategoryList);
admin_route.post('/addCategoryPage',adminController.addCategoryPage);
admin_route.post('/subcategoryList',adminController.subcategoryListLoad);
admin_route.get('/addSubcategoryPage',auth.isLoggedin,adminController.addSubcategoryLoad);
admin_route.post('/addSubcategoryPage',adminController.addSubcategoryPage)
admin_route.post('/editSubcategoryPage',adminController.editSubcategoryLoad);
admin_route.get('/orderList',auth.isLoggedin,adminController.orderListLoad);
admin_route.post('/order-placed',adminController.placeOrder);
admin_route.post('/order-shipped',adminController.shipOrder);
admin_route.post('/order-delivered',adminController.deliverOrder);
admin_route.post('/orderDetails',adminController.orderDetailsLoad);
admin_route.post('/editProduct',adminController.editProductLoad);
admin_route.get('/addCoupon',auth.isLoggedin,adminController.addCouponLoad);
admin_route.post('/addCoupon',adminController.addCoupon);
admin_route.get('/couponList',auth.isLoggedin,adminController.couponListLoad);

admin_route.get('/bannerManagement',auth.isLoggedin,adminController.bannerManagementLoad);
admin_route.post('/addShopBanner',upload.single('shopBannerImage'),adminController.addShopBanner);
admin_route.post('/addProductDetailBanner',upload.single('singleProductBannerImage'),adminController.addProductDetailBanner);
admin_route.post('/addCartBanner',upload.single('cartPageBannerImage'),adminController.addCartBanner);
admin_route.post('/addCheckoutBanner',upload.single('checkoutBannerImage'),adminController.addCheckoutBanner);

admin_route.post('/firstColumnChanges',adminController.firstColumnChange);
admin_route.post('/secondColumnChanges',adminController.secondColumnChange);
admin_route.get('/brandManagement',auth.isLoggedin,adminController.brandManagementLoad);
admin_route.post('/brandManagement',upload.single('logo'),adminController.brandManagement);
admin_route.post('/deleteOneImage',adminController.deleteOneImage);
admin_route.post('/productImageUpdate',cpupload,adminController.productImageUpdate);
admin_route.post('/priceUpdate',adminController.priceUpdate);

admin_route.get('/offerManagement',auth.isLoggedin,adminController.offerManagement);

admin_route.get('/dashboard',auth.isLoggedin,adminController.dashboardLoad);
admin_route.get('/dailySale',adminController.dailySaleReport);
admin_route.get('/monthlySale',adminController.monthlySaleReport);
admin_route.get('/weeklySale',adminController.weeklySaleReport);
admin_route.get('/yearlySale',adminController.yearlySaleReport);
admin_route.get('/dailyChart',adminController.dailySaleChart);
admin_route.get('/monthlyChart',adminController.monthlySaleChart);
admin_route.get('/yearlyChart',adminController.yearlySaleChart);
admin_route.get('/salesReportDay',adminController.salesReportDay);
admin_route.get('/salesReportMonth',adminController.salesReportMonth);
admin_route.get('/salesReportYear',adminController.salesReportMonth);
admin_route.get('/salesReportWeek',adminController.salesReportWeek);
admin_route.get('/yearlyCategoryChart',adminController.yearlyCategoryChart);
admin_route.get('/monthlyCategoryChart',adminController.monthlyCategoryChart);
admin_route.get('/dailyCategoryChart',adminController.dailyCategoryChart);

admin_route.post('/categoryOffer',adminController.addCategoryOffer);
admin_route.get('*',auth.isLoggedin,(req,res)=>{
  res.redirect('/admin');
})

module.exports = admin_route;