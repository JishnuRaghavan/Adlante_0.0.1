const mongoose  = require('mongoose');

const categoryOfferSchema = new mongoose.Schema({

  category:{
    type:String,
  },
  subCategory:{
    type:String,
  },
  offerType: {
    type: String,
  },
  discount: {
    type: Number,
  },
  offerStatus: {
    type: String,
    default: "disabled",
  },
  usageLimit:{
    type:Number
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },

})

module.exports  = mongoose.model('Offer',categoryOfferSchema);