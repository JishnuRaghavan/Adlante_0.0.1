const mongoose  = require('mongoose');

const brandSchema = new mongoose.Schema({

  logo:{
    type:String,
    required:true
  },
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    default:""
  }

});

module.exports  = mongoose.model('Brand',brandSchema);