const mongoose  = require('mongoose');

const orderSchema = new mongoose.Schema({

  userId:{
    type:String,
    required:true
  },
  orderId:{
    type:String,
    required:true
  },
  userName:{
    type:String,
    required:true
  },
  date:{
    type:Date,
    default:Date.now()
  },
  items:{
    type:Array,
    default:[]
  },
  paymentStatus:{
    type:String,
    default:""
  },
  subtotal:{
    type:Number,
    required:true
  },
  discountValue:{
    type:Number,
    default:0
  },
  orderStatus:{
    type:String,
    default:"order placed"
  },
  orderCount:{
    type:Number,
    required:true
  },
  shippingAddress:{
    type:Object,
    default:{}
  },
  billingAndShipping:{
    type:Boolean,
    default:true
  },
  billingAddress:{
    type:Object,
    default:{}
  },
  invoice:{
    type:String,
    default:""
  }
});

module.exports  = mongoose.model('Order',orderSchema);