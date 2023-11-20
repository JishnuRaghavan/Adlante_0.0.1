const mongoose  = require('mongoose');

const offerSchema = new mongoose.Schema({

  category:{
    type:String,
    required:true
  },
  startDate:{
    type:Date,
    required:true
  },
  endDate:{
    type:Date,
    required:true
  },
  usageLimit:{
    type:Number,
    required:true
  },
  offerType:{
    type:String,
    required:true
  },
  offerValue:{
    type:Number,
    default:1
  },
  offerStatus:{
    type:String,
    required:true
  }

});

module.exports  = mongoose.model('Offer',offerSchema);