const mongoose  = require('mongoose');


const subcategorySchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    default:""
  },
  visibility:{
    type:String,
    default:"visible"
  }
})

const categorySchema  = new mongoose.Schema({

  maincategory:{
    type:String,
    required:true,
  },
  subcategory:[subcategorySchema],
  description:{
    type:String,
    default:""
  },
  visibility:{
    type:String,
    default:"visible"
  }

});

module.exports  = mongoose.model('Category',categorySchema);
