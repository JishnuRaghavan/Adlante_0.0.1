const mongoose  = require('mongoose');

const referalSchema  = new mongoose.Schema({
  referalCode:{
    type:String,
    required:true
  }
})

module.exports  = mongoose.model('Referal',referalSchema);