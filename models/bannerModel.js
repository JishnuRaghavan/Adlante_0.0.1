const mongoose  = require('mongoose');

const bannerSchema  = new mongoose.Schema({
  shopBannerImage:{
    type:String,
    default:""
  },
  singleProductBannerImage:{
    type:String,
    default:""
  },
  cartPageBannerImage:{
    type:String,
    default:""
  },
  checkoutBannerImage:{
    type:String,
    default:""
  }
});

module.exports  = mongoose.model('Banner',bannerSchema);