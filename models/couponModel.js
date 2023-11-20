const mongoose  = require('mongoose');

const couponSchema  = new mongoose.Schema({

  code:{
    type:String,
    required:true
  },
  type:{
    type:String,
    required:true
  },
  discountValue:{
    type:Number,
    required:true
  },
  usageLimit:{
    type:Number,
    required:true
  },
  status:{
    type:String,
    default:'disabled'
  },
  discountLimit:{
    type:Number,
    default:20000
  },
  startDate:{
    type:Date,
    required:true
  },
  endDate:{
    type:Date,
    required:true
  }

})

module.exports  = mongoose.model('Coupon',couponSchema);