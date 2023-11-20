const Admin = require('../models/adminModel');
const Product= require('../models/productModel');
const User  = require('../models/userModel');
const bcrypt= require('bcrypt');
const session = require('express-session');
const Category= require('../models/categoryModel');
const Order = require('../models/orderModel');
const Coupon  = require('../models/couponModel');
const Banner  = require('../models/bannerModel');
const Brand   = require('../models/brandModel');
const cache   = require('memory-cache');
const Offer   = require('../models/offerModel');
const moment  = require('moment');

const securePassword  = async(password)=>{

  try {
    
    const hashedPassword  = await bcrypt.hash(password,10);
    return hashedPassword;

  } catch (error) {
    console.log(error.message);
  }

}

const loadLogin = async(req,res)=>{

  try {
    
    res.render('signin',{message:''});

  } catch (error) {
    console.log(error.message);
  }

}

const verifyLogin = async(req,res)=>{

  try {
    
    const { name,password } = req.body;
    const adminData = await Admin.findOne({name:name});
    
    if(adminData){
      const passwordCheck = await bcrypt.compare(password,adminData.password);
      if(passwordCheck){
        req.session.admin_id = adminData._id;
        res.redirect('/admin/adminhome');
      }
      else{
        res.render('signin',{message:"invalid credentials"});
      }
    }
    else{
      res.render('signin',{message:"admin not found"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const loadDashboard = async(req,res)=>{

  try {
    
    res.render('adminhome');

  } catch (error) {
    console.log(error.message);
  }

}

const signout = async(req,res)=>{

  try {
    req.session.destroy();
    res.redirect('/admin/signin');

  } catch (error) {
    console.log(error.message);
  }

}

const ecommerceCustomer = async(req,res)=>{

  try {
    
    const users = await User.find();
    res.render('ecommerce-customer',{customeradd:"",users:users});
  } catch (error) {
    console.log(error.message);
  }

}

const addCustomer = async(req,res)=>{

  try {
    
    const { name,email,mobile,joinedDate }  = req.body;
    const updatedEmail  = email.toLowerCase()
    const UserData  = await User.findOne({email:updatedEmail});
    if(UserData){
      res.render('ecommerce-customer',{customeradd:"user already exists"});
    }
    else{
      const user  = new User({
        name:name,
        email:updatedEmail,
        mobile:mobile,
        password:"12345",
        is_verified:0,
        joinedDate:joinedDate
      })
      const userDataAdded = await user.save();
      if(userDataAdded){
        console.log(userDataAdded);
        res.redirect('/admin/ecommerce-customer');
      }
      else{
        res.render('ecommerce-customer',{customeradd:"failed"});
      }
    }

  } catch (error) {
    console.log(error.message);
  }
}

const blockUser  = async(req,res)=>{

  try {
    
    const { selectedEmails } = req.body

    const updated = await User.updateMany({email:{$in:selectedEmails}},{$set:{active:"blocked"}});
    console.log("data updated");
    res.render('ecommerce-customer',{customeradd:"user blocked"});

    

  } catch (error) {
    console.log(error.message);
  }

}

const loadProductList = async(req,res)=>{

  try {
    
    delete req.session.productId;
    const products = await Product.find();
    res.render('productList',{products:products});

  } catch (error) {
    console.log(error.message);
  }

}

const unblockUser = async(req,res)=>{

  try {
    
    const{ selectedEmails } = req.body;

    const updated = await User.updateMany({email:{$in:selectedEmails}},{$set:{active:"active"}});

    res.render('ecommerce-customer',{customeradd:"user unblocked"});

  } catch (error) {
    console.log(error.message);
  }

}

const productEditLoad = async(req,res)=>{

  try {
    
    const brands  = await Brand.find();
    const categories  = await Category.find();
    res.render('productEdit',{brands:brands,alertMessage:"",categories:categories});

  } catch (error) {
    console.log(error.message);
  }

}

const addProduct  = async(req,res)=>{

  try {
    
    const categories  = await Category.find();
    const brands  = await Brand.find();
    const {stock,title,description,brand,category,subcategory,gender,tags,size,width,height,depth,weight,quality,freshness,packeting,regularprice,saleprice,date, } = req.body;

    const publish= req.body.publish === 'on';
    const priceincludestaxes  = req.body.priceincludestaxes === 'on';


    const productData = await Product.findOne({title:title,brand:brand,category:category,subcategory:subcategory,size:size,gender:gender});

    
    if(productData){
      res.render('productEdit',{brands:brands,categories:categories,alertMessage:"same product exists"});
    }
    else{
      const product = new Product({
        title:title,
        description:description,
        brand:brand,
        defaultimage:req.files.defaultImage[0].filename,
        galleryimage:req.files.galleryImage.map(file=>file.filename),
        category:category,
        subcategory:subcategory,
        stock:stock,
        gender:gender,
        tag:tags,
        size:size,
        width:width,
        height:height,
        depth:depth,
        weight:weight,
        quality:quality,
        freshness:freshness,
        packeting:packeting,
        regularprice:regularprice,
        saleprice:saleprice,
        priceincludestaxes:priceincludestaxes,
        date:date,
        publish:publish

      });

      const productDataAdded  = await product.save();
      if(productDataAdded){
        res.render('productEdit',{alertMessage:"successfull",brands:brands,categories:categories});
      }
      else{
        res.render('productEdit',{alertMessage:"product add failed",brands:brands,categories:categories})
      }
    }

  } catch (error) {
    console.log(error.message);
  }

}

const categorylistLoad  = async(req,res)=>{

  try {
    
    const categories  = await Category.find();
    res.render('categoryList',{categories:categories});
    delete req.session.maincategory;

  } catch (error) {
    console.log(error.message);
  }

}

const addCategoryload = async(req,res)=>{

  try {
    
    const categories  = await Category.find();
    res.render('addCategorypage',{categories:categories,categoryMessage:""});

  } catch (error) {
    console.log(error.message);
  }

}

const addCategoryPage = async(req,res)=>{

  try {
    
    const { maincategory,description,visibility } = req.body;
    const categories  = await Category.find();
    const category  = await Category.findOne({maincategory:new RegExp(maincategory,'i')});

    if(!category){
      const newCategory = new Category({
        maincategory:maincategory,
        description:description,
        visibility:visibility
      })

      const categoryUpdated = await newCategory.save();

      if(categoryUpdated){
        res.redirect('/admin/categoryList');
      }
      else{
        res.render('addCategorypage',{alert:"no category added"});
      }
    }
    else{
      res.render('addCategorypage',{categories:categories,categoryMessage:"item already exists"});
    }

  } catch (error) {
    console.log(error.message);
  }

}


const subcategoryListLoad = async (req, res) => {
  try {
    const { mainCategory } = req.body;
    req.session.maincategory = mainCategory;

    const category = await Category.findOne({ maincategory: mainCategory });
    res.render('subcategoryList', { mainCategory: category });
  } catch (error) {
    console.error(error.message);
    res.render('errorPage', { error: 'An error occurred while loading subcategory list' });
  }

}


const editSubcategoryLoad = async(req,res)=>{

  try {
    
    const { subcategory}  = req.body;
    res.render('editSubcategoryPage');

  } catch (error) {
    console.log(error.message);
  }

}

const addSubcategoryPage = async (req, res) => {
  try {
    const { subcategoryName, description, visibility } = req.body;
    const mainCategory = req.session.maincategory;

    const category = await Category.findOne({ maincategory: mainCategory });

    const subcategoryExist = category.subcategory.some((subcategory) => subcategory.name === new RegExp(subcategoryName,'i'));
    if (!subcategoryExist) {
      category.subcategory.push({
        name: subcategoryName,
        description: description,
        visibility: visibility,
      });

      await category.save(); // Save changes to the database
      console.log(5);
      res.redirect('/admin/subcategoryList');
      console.log(6);
    } else {
      res.redirect('/admin/subcategoryList');
    }
  } catch (error) {
    console.error(error.message);
    res.render('subcategoryList', { alert: 'Error adding subcategory' });
  }

}

const updatedSubcategoryList  = async(req,res)=>{

  try {
    
    const mainCategory  = req.session.maincategory;
    const category  = await Category.findOne({maincategory:mainCategory});
    res.render('subcategoryList',{mainCategory:category});

  } catch (error) {
    console.log(error.message);
  }

}

const addSubcategoryLoad  = async(req,res)=>{

  try {
    
    res.render('addSubcategoryPage');

  } catch (error) {
    console.log(error.message);
  }
  
}

const orderListLoad = async(req,res)=>{

  try {
    
    delete req.session.orderId;
    const orders = await Order.find();
    res.render('orderList',{orders:orders});

  } catch (error) {
    console.log(error.message);
  }

}

const placeOrder  = async(req,res)=>{

  try {
    
    const { selectedOrders }  = req.body;
    const orderUpdated  = await Order.updateMany({orderId:{$in:selectedOrders}},{$set:{orderStatus:'order placed'}});
    if(orderUpdated.modifiedCount === 1){
      res.render('orderList',{orerMessage:"order status updated"});
    }


  } catch (error) {
    console.log(error.message);
  }

}

const shipOrder = async(req,res)=>{
  console.log('shipping');

  try {
    
    const { selectedOrders }  = req.body;
    const orderUpdated  = await Order.updateMany({orderId:{$in:selectedOrders}},{$set:{orderStatus:'order has been shipped'}});
    if(orderUpdated.modifiedCount === 1){
      res.render('orderList',{orderMessage:"order status updated"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const deliverOrder  = async(req,res)=>{

  try {
    
    const { selectedOrders }  = req.body;
    const orderUpdated  = await Order.updateMany({orderId:{$in:selectedOrders}},{$set:{orderStatus:"order has been delivered"}});
    if(orderUpdated.modifiedCount === 1){
      res.render('orderList',{orderMessage:"order status updated"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const orderDetailsLoad  = async(req,res)=>{

  try {
  
    const { orderId } = req.body;
    console.log(orderId);
    req.session.orderId = orderId;
    const order = await Order.findOne({orderId:orderId});
    console.log(order);
    const userId= order.userId;
    const itemTotal = order.items.reduce((acc,curr)=>{
      return acc+curr.total;
    },0)
    const productIds  = order.items.map((item)=>item.productId);
    const products  = await Product.find({_id:{$in:productIds}});
    console.log(products);
    const user  = await User.findById({_id:userId});
    console.log(user);

    res.render('orderDetailsPage',{order:order,user:user,products:products,itemTotal:itemTotal});
    
  } catch (error) {
    console.log(error.message);
  }

}

const editProductLoad = async(req,res)=>{

  try {

    const brands  = await Brand.find();
    const categories  = await Category.find();
    const { productId } = req.body;
    req.session.productId = productId;
    const product = await Product.findById({_id:productId});
    res.render('editProduct',{product:product,categories:categories,brands:brands,alertMessage:""});

  } catch (error) {
    console.log(error.message);
  }

}

const addCouponLoad  = async(req,res)=>{

  try {
    
    res.render('addCoupon',{alertMessage:"none"});

  } catch (error) {
    console.log(error.message);
  }

}

const addCoupon = async(req,res)=>{

  try {
    
    const { code, type, discountValue, usageLimit, status, startDate, endDate } =  req.body;
    const couponExist = await Coupon.findOne({code: new RegExp(code,'i')});

    if(!couponExist){
      const newCoupon = new Coupon({
        code:code,
        type:type,
        discountValue:discountValue,
        usageLimit:usageLimit,
        status:status,
        startDate:startDate,
        endDate:endDate
      })

      const couponSaved = newCoupon.save();

      if(couponSaved){
        res.render('addCoupon',{alertMessage:"new coupon added"});
      }
    }
    else{
      res.render('addCoupon',{alertMessage:"coupon already exists"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const couponListLoad  = async(req,res)=>{

  try {
    
    const coupons = await Coupon.find();
    res.render('couponList',{coupons:coupons});

  } catch (error) {
    console.log(error.message);
  }

}

const bannerManagementLoad  = async(req,res)=>{

  try {
    
    const banner = await Banner.findOne();
    res.render('bannerManagementPage',{banner:banner});

  } catch (error) {
    console.log(error.message);
  }

}

const addCheckoutBanner = async(req,res)=>{

  try {
    
    const checkoutBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({checkoutBannerImage});
      await newBanner.save();
    }
    else{
      banner.checkoutBannerImage  = checkoutBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

const addShopBanner = async(req,res)=>{

  try {
    
    const shopBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({shopBannerImage});
      await newBanner.save();
    }
    else{
      banner.shopBannerImage  = shopBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

const addProductDetailBanner = async(req,res)=>{

  try {
    
    const singleProductBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({singleProductBannerImage});
      await newBanner.save();
    }
    else{
      banner.singleProductBannerImage  = singleProductBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

const addCartBanner = async(req,res)=>{

  try {
    
    const cartPageBannerImage = req.file.filename;
    
    const banner  = await Banner.findOne();
    
    if(!banner){
      const newBanner = new Banner({cartPageBannerImage});
      await newBanner.save();
    }
    else{
      banner.cartPageBannerImage  = cartPageBannerImage;
      await banner.save();
    }

    res.render('bannerManagementPage',{banner:banner,message:"checkout banner added successfully"});

  } catch (error) {
    console.log(error.message);
  }

}

const firstColumnChange = async(req,res)=>{
  console.log('changing');

  try {
    
    const brands  = await Brand.find();
    const productId = req.session.productId;
    const categories  = await Category.find();
    const { stock, gender, category, subcategory, size, width , height, depth, weight, quality, freshness, packeting } = req.body;

    const productUpdate = await Product.findByIdAndUpdate({_id:productId},{$set:
      {
        stock:stock,
        gender:gender,
        category:category,
        subcategory:subcategory,
        size:size,
        width:width,
        height:height,
        depth:depth,
        weight:weight,
        quality:quality,
        freshness:freshness,
        packeting:packeting
      }});

      const firstColumnUpdated = await productUpdate.save();
      cache.clear();
      if(firstColumnUpdated){
        const product = await Product.findById({_id:productId});
        res.render('editProduct',{alertMessage:"product data updated",product:product,categories:categories,brands:brands});
      }

  } catch (error) {
    console.log(error.message);
  }

}

const secondColumnChange  = async(req,res)=>{

  try {
    
    const { title, description,brand,tags }  = req.body;
    const productId  = req.session.productId;
    const productUpdate = await Product.findByIdAndUpdate({_id:productId},{$set:{
      title:title,
      description:description,
      brand:brand,
      tag:tags
    }});

    await productUpdate.save();
    const product = await Product.findById({_id:productId});
    const categories  = await Category.find();
    const brands  = await Brand.find();
    res.render('editProduct',{alertMessage:"product data updated",brands:brands,categories:categories,product:product});

  } catch (error) {
    console.log(error.message);
  }

}

const brandManagementLoad = async(req,res)=>{

  try {
    
    const brands  = await Brand.find();
    res.render('brandManagement',{brands:brands});

  } catch (error) {
    console.log(error.message);
  }

}

const brandManagement = async(req,res)=>{

  try {
    
    const { title }  = req.body;
    const logo    = req.file.filename;
    const brands =  await Brand.find();
    const description = req.body.description !== undefined ? req.body.description:"";
    const brandExist  = await Brand.findOne({title:new RegExp(title,'i')});
    if(!brandExist){
      const newBrand  = new Brand({
        logo:logo,
        title:title,
        description:description
      });
      await newBrand.save();

      res.render('brandManagement',{brands:brands,alertMessage:"brand saved"});
    }
    else{
      res.render('brandManagement',{brands:brands,alertMessage:"brand already exists"});
    }

  } catch (error) {
    console.log(error.message);
  }

}

const deleteOneImage  = async(req,res)=>{

  try {
    
    const { index } = req.body;
    const productId = req.session.productId;
    let product   = await Product.findById({_id:productId});
    const productUpdate = product.galleryimage.splice(index,1);
    await product.save();
    product = await Product.findById({_id:productId});
    const categories  = await Category.find();
    const brands      = await Brand.find();
    res.render('editProduct',{alertMessage:"",brands:brands,categories:categories,product:product})

  } catch (error) {
    console.log(error.message);
  }

}

const productImageUpdate = async (req, res) => {
  try {
    const { defaultImage, galleryImage } = req.files;

    const productId = req.session.productId;
    let product = await Product.findById({ _id: productId });

    if (defaultImage && defaultImage[0].filename !== product.defaultimage) {
      await Product.findByIdAndUpdate({ _id: productId }, { $set: { defaultimage: defaultImage[0].filename } });
    }

    if (galleryImage && galleryImage.length > 0) {
      const galleryImages = galleryImage.map(image => image.filename);
      await Product.findByIdAndUpdate({ _id: productId }, { $push: { galleryimage: { $each: galleryImages } } });
    }

    await product.save();
    product = await Product.findById({_id:productId});
    const categories  = await Category.find();
    const brands  = await Brand.find();
    res.render('editProduct',{alertMessage:"image updated",brands:brands,categories:categories,product:product});
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
}

const priceUpdate = async(req,res)=>{

  try {
    
    const { regularprice, saleprice } = req.body;
    const productId = req.session.productId;
    console.log(productId);
    const productUpdate = await Product.findByIdAndUpdate({_id:productId},{$set:{
      regularprice:regularprice,
      saleprice:saleprice
    }})

    await productUpdate.save();
    const product = await Product.findById({_id:productId});
    const categories  = await Category.find();
    const brands  = await Brand.find();

    res.render('editProduct',{alertMessage:"updation completed",brands:brands,categories:categories,product:product});

  } catch (error) {
    console.log(error.message);
  }

}

const offerManagement = async(req,res)=>{

  try {
    
    const categories  = await Category.find();
    const brands      = await Brand.find();
    const products    = await Product.find();
    res.render('offerManagement',{categories,brands,products});

  } catch (error) {
    console.log(error.message);
  }

}

const dashboardLoad = async(req,res)=>{

  try {
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Find orders for the current day
    const dailyReport = await Order.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    // Calculate total earnings for the day
    const totalEarnings = dailyReport.reduce((total, order) => total + order.subtotal, 0);

    // Find orders for the previous day
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    const yesterdayReport = await Order.find({
      date: {
        $gte: startOfYesterday,
        $lt: endOfYesterday,
      },
    });

    // Calculate total earnings for the previous day
    const totalEarningsYesterday = yesterdayReport.reduce((total, order) => total + order.subtotal, 0);

    // Calculate the percentage change
    const percentChange = calculatePercentChange(totalEarningsYesterday, totalEarnings);

    dailyReport.period = "daily";
    dailyReport.totalEarnings = totalEarnings.toFixed(2);
    dailyReport.percentChange = percentChange.toFixed(2);
    res.render('dashboard',{dailyReport});


  } catch (error) {
    console.log(error.message);
  }

}

const dailySaleReport = async(req, res)=> {
  try {
    // Your logic to fetch daily sale report from the database
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const dailyReport = await Order.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    const totalEarnings = dailyReport.reduce((total, order) => total + order.subtotal, 0);

    // Find orders for the previous day
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    const yesterdayReport = await Order.find({
      date: {
        $gte: startOfYesterday,
        $lt: endOfYesterday,
      },
    });

    const totalEarningsYesterday = yesterdayReport.reduce((total, order) => total + order.subtotal, 0);

    const percentChange = calculatePercentChange(totalEarningsYesterday, totalEarnings);

    const response = {
      period: 'daily',
      totalEarnings: totalEarnings.toFixed(2),
      percentChange: percentChange.toFixed(2),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching daily sale report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const monthlySaleReport = async (req, res) => {
  console.log('monthlysale report');
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyReport = await Order.find({
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    });

    const totalEarnings = monthlyReport.length > 0 ? monthlyReport.reduce((total, order) => total + order.subtotal, 0) : 0;

    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    const previousMonthReport = await Order.find({
      date: {
        $gte: startOfPreviousMonth,
        $lt: endOfPreviousMonth,
      },
    });

    const totalEarningsPreviousMonth = previousMonthReport.length > 0 ? previousMonthReport.reduce((total, order) => total + order.subtotal, 0) : 0;

    const percentChange = calculatePercentChange(totalEarningsPreviousMonth, totalEarnings);

    const response = {
      period: 'monthly',
      totalEarnings: totalEarnings.toFixed(2),
      percentChange: percentChange.toFixed(2),
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching monthly sale report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const weeklySaleReport = async (req, res) => {
  console.log('weekly report');
  try {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()), 23, 59, 59, 999);

    const weeklyReport = await Order.find({
      date: {
        $gte: startOfWeek,
        $lt: endOfWeek,
      },
    });

    const totalEarnings = weeklyReport.length > 0 ? weeklyReport.reduce((total, order) => total + order.subtotal, 0) : 0;

    const startOfPreviousWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7);
    const endOfPreviousWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 1, 23, 59, 59, 999);

    const previousWeekReport = await Order.find({
      date: {
        $gte: startOfPreviousWeek,
        $lt: endOfPreviousWeek,
      },
    });

    const totalEarningsPreviousWeek = previousWeekReport.length > 0 ? previousWeekReport.reduce((total, order) => total + order.subtotal, 0) : 0;
    const percentChange = calculatePercentChange(totalEarningsPreviousWeek, totalEarnings);

    const response = {
      period: 'weekly',
      totalEarnings: totalEarnings.toFixed(2),
      percentChange: percentChange.toFixed(2),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching weekly sale report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const yearlySaleReport = async (req, res) => {
  console.log('yearly report');
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    const yearlyReport = await Order.find({
      date: {
        $gte: startOfYear,
        $lt: endOfYear,
      },
    });

    const totalEarnings = yearlyReport.length > 0 ? yearlyReport.reduce((total, order) => total + order.subtotal, 0) : 0;

    const startOfPreviousYear = new Date(today.getFullYear() - 1, 0, 1);
    const endOfPreviousYear = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    const previousYearReport = await Order.find({
      date: {
        $gte: startOfPreviousYear,
        $lt: endOfPreviousYear,
      },
    });

    const totalEarningsPreviousYear = previousYearReport.length > 0 ? previousYearReport.reduce((total, order) => total + order.subtotal, 0) : 0;
    const percentChange = calculatePercentChange(totalEarningsPreviousYear, totalEarnings);

    const response = {
      period: 'yearly',
      totalEarnings: totalEarnings.toFixed(2),
      percentChange: percentChange.toFixed(2),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching yearly sale report:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

function calculatePercentChange(previousValue, currentValue) {
  if (previousValue === 0) {
    return 100; // Avoid division by zero
  }
  return ((currentValue - previousValue) / previousValue) * 100;
}

const dailySaleChart = async (req, res) => {
  console.log('daily chart');
  try {
    const today = new Date(); // Add this line to define today
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const totalEarningsArray = [];
    const dateArray = [];

    for (let currentDate = startOfMonth; currentDate < endOfDay; currentDate.setDate(currentDate.getDate() + 1)) {
      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

      const dailyReport = await Order.find({
        date: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      });

      const totalEarnings = dailyReport.reduce((total, order) => total + order.subtotal, 0);

      totalEarningsArray.push(totalEarnings);
      dateArray.push(currentDate.toISOString().substring(0,10));
    }
    
    res.json({
      totalEarningsArray,
      dateArray,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const monthlySaleChart = async (req, res) => {
  console.log('monthly chart');
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const totalEarningsArray = [];
    const monthArray = [];

    for (let currentMonth = startOfYear; currentMonth < endOfMonth; currentMonth.setMonth(currentMonth.getMonth() + 1)) {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const monthlyReport = await Order.find({
        date: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      });

      const totalEarnings = monthlyReport.reduce((total, order) => total + order.subtotal, 0);

      totalEarningsArray.push(totalEarnings);
      monthArray.push(currentMonth.toISOString().substring(0,10));
    }

    res.json({
      totalEarningsArray,
      monthArray,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const yearlySaleChart = async (req, res) => {
  console.log('yearly chart');
  try {
    const startYear = 2010; // Set the starting year
    const currentYear = new Date().getFullYear();
    const endOfYear = new Date(currentYear + 1, 0, 0);

    const totalEarningsArray = [];
    const yearArray = [];

    for (let year = startYear; year <= currentYear; year++) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year + 1, 0, 0);

      const yearlyReport = await Order.find({
        date: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      });

      const totalEarnings = yearlyReport.reduce((total, order) => total + order.subtotal, 0);

      totalEarningsArray.push(totalEarnings);
      yearArray.push(year); // Use 'year' directly without converting to a string
    }

    res.json({
      totalEarningsArray,
      yearArray,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const calculateTotalForSuccessOrders = (orders) => {
  // Filter orders with "success" payment status
  const successOrders = orders.filter((order) => order.paymentStatus.toLowerCase() === "success");

  // Calculate the total
  const total = successOrders.reduce((acc, order) => acc + order.subtotal, 0);

  return total;
}

const salesReportDay = async (req, res) => {
  console.log('salesreport table day');
  try {
    const orders = await Order.find({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0)), // Start of the day
        $lt: new Date(new Date().setHours(23, 59, 59)), // End of the day
      },
    });

    const total = calculateTotalForSuccessOrders(orders);
    res.render('salesReport', { orders,total });
  } catch (error) {
    console.log(error.message);
  }
};

const salesReportMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const orders = await Order.find({
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    });

    const total = calculateTotalForSuccessOrders(orders);
    res.render('salesReport', { orders,total });
  } catch (error) {
    console.log(error.message);
  }
};

const salesReportYear = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear() + 1, 0, 0);

    const orders = await Order.find({
      date: {
        $gte: startOfYear,
        $lt: endOfYear,
      },
    });

    const total = calculateTotalForSuccessOrders(orders);
    res.render('salesReport', { orders,total });
  } catch (error) {
    console.log(error.message);
  }
};

const salesReportWeek = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const orders = await Order.find({
      date: {
        $gte: startOfWeek,
        $lt: endOfWeek,
      },
    });

    const total = calculateTotalForSuccessOrders(orders);
    res.render('salesReport', { orders,total });
  } catch (error) {
    console.log(error.message);
  }
}

const addCategoryOffer = async (req, res) => {
  console.log('category offer creating');
  try {
    const { maincategory, startDate, endDate, usageLimit, offerType, offerValue, active } = req.body;

    const existingOffer = await Offer.findOne({ category: maincategory });

    if (existingOffer) {
      const currentDate = new Date();
      const existingEndDate = new Date(existingOffer.endDate.$date);

      if (currentDate <= existingEndDate) {
        // Offer for the category is still active
        return res.status(400).json({ success: false, message: 'Category offer already exists and is still active.' });
      } else {
        // Existing offer is expired, delete it
        await Offer.deleteOne({ category: maincategory });
      }
    }

    const newOffer = new Offer({
      category: maincategory,
      startDate: startDate,
      endDate: endDate,
      usageLimit: usageLimit,
      offerType: offerType,
      offerValue: offerValue,
      offerStatus: active
    });

    await newOffer.save();

    const categories = await Category.find();
    res.render('offerManagement', { categories, alertMessage: 'Offer added successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const yearlyCategoryChart = async (req, res) => {
  console.log("yearly category chart is loading");
  try {
    const orders = await Order.find();
    const chartData = [];

    for (const order of orders) {
      const innerchartData = [];

      for (const product of order.items) {
        const soldProduct = await Product.findById(product.productId);
        const soldCategory = soldProduct.category;

        console.log(`Sold Category: ${soldCategory}`);
        console.log(`Quantity: ${product.quantity}`);

        const categorySale = { x: soldCategory, y: product.quantity };
        innerchartData.push(categorySale);
      }

      for (const category of innerchartData) {
        console.log(`Sold Category: ${category.x}`);
        console.log(`Quantity: ${category.y}`);

        const existingCategory = chartData.find((soldCategory) => soldCategory.x === category.x);

        if (existingCategory) {
          // Update existing category quantity
          existingCategory.y += category.y;
        } else {
          // Add new category to chartData
          chartData.push({ x: category.x, y: category.y });
        }
      }
    }

    console.log("ChartData:", chartData);

    res.json(chartData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const monthlyCategoryChart = async (req, res) => {
  console.log("monthly category chart is loading");
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({
      date: {
        $gte: thirtyDaysAgo,
        $lt: today,
      },
    });

    const chartData = [];

    for (const order of orders) {
      const innerchartData = [];

      for (const product of order.items) {
        const soldProduct = await Product.findById(product.productId);
        const soldCategory = soldProduct.category;

        console.log(`Sold Category: ${soldCategory}`);
        console.log(`Quantity: ${product.quantity}`);

        const categorySale = { x: soldCategory, y: product.quantity };
        innerchartData.push(categorySale);
      }

      for (const category of innerchartData) {
        console.log(`Sold Category: ${category.x}`);
        console.log(`Quantity: ${category.y}`);

        const existingCategory = chartData.find((soldCategory) => soldCategory.x === category.x);

        if (existingCategory) {
          // Update existing category quantity
          existingCategory.y += category.y;
        } else {
          // Add new category to chartData
          chartData.push({ x: category.x, y: category.y });
        }
      }
    }

    console.log("ChartData:", chartData);

    res.json(chartData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const dailyCategoryChart = async (req, res) => {
  console.log("daily category chart is loading");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set the time to the beginning of the next day

    const orders = await Order.find({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const chartData = [];

    for (const order of orders) {
      const innerchartData = [];

      for (const product of order.items) {
        const soldProduct = await Product.findById(product.productId);
        const soldCategory = soldProduct.category;

        console.log(`Sold Category: ${soldCategory}`);
        console.log(`Quantity: ${product.quantity}`);

        const categorySale = { x: soldCategory, y: product.quantity };
        innerchartData.push(categorySale);
      }

      for (const category of innerchartData) {
        console.log(`Sold Category: ${category.x}`);
        console.log(`Quantity: ${category.y}`);

        const existingCategory = chartData.find((soldCategory) => soldCategory.x === category.x);

        if (existingCategory) {
          // Update existing category quantity
          existingCategory.y += category.y;
        } else {
          // Add new category to chartData
          chartData.push({ x: category.x, y: category.y });
        }
      }
    }

    console.log("ChartData:", chartData);

    res.json(chartData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports  = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  signout,
  ecommerceCustomer,
  addCustomer,
  blockUser,
  unblockUser,
  loadProductList,
  productEditLoad,
  addProduct,
  categorylistLoad,
  addCategoryload,
  addCategoryPage,
  subcategoryListLoad,
  addSubcategoryLoad,
  addSubcategoryPage,
  editSubcategoryLoad,
  updatedSubcategoryList,
  orderListLoad,
  placeOrder,
  shipOrder,
  deliverOrder,
  orderDetailsLoad,
  editProductLoad,
  addCouponLoad,
  addCoupon,
  couponListLoad,
  bannerManagementLoad,
  addCheckoutBanner,
  addShopBanner,
  addProductDetailBanner,
  addCartBanner,
  firstColumnChange,
  secondColumnChange,
  brandManagementLoad,
  brandManagement,
  deleteOneImage,
  productImageUpdate,
  priceUpdate,
  offerManagement,
  dashboardLoad,
  dailySaleReport,
  monthlySaleReport,
  weeklySaleReport,
  yearlySaleReport,
  dailySaleChart,
  monthlySaleChart,
  yearlySaleChart,
  salesReportDay,
  salesReportMonth,
  salesReportYear,
  salesReportWeek,
  addCategoryOffer,
  yearlyCategoryChart,
  monthlyCategoryChart,
  dailyCategoryChart
}