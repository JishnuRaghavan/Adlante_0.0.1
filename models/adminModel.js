const mongoose  = require('mongoose');

const adminSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  mobile:{
    type:Number,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  is_employee:{
    type:Number,
    required:true
  },
  is_admin:{
    type:String,
    default:0
  },
  is_verified:{
    type:Number,
    default:0
  },
  token:{
    type:String,
    default:''
  }
});

module.exports = mongoose.model('Admin',adminSchema);