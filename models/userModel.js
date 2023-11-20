const mongoose = require('mongoose');

const primaryAddressSchema = new mongoose.Schema({
  userName:{
    type:String,
    default:""
  },
  houseName: {
    type: String,
    default:""
  },
  postOffice: {
    type: String,
    default:""
  },
  landmark: {
    type: String,
    default:""
  },
  district: {
    type: String,
    default:""
  },
  state: {
    type: String,
    default:""
  },
  country: {
    type: String,
    default:""
  },
  pin: {
    type: String,
    default:""
  },
  contactNumber: {
    type: String,
    default:""
  },
  makeDefault:{
    type:Date,
    default:Date.now()
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: [primaryAddressSchema],
    default: [] // Default to an empty object
  },
  is_verified: {
    type: Number,
    default: 0
  },
  active: {
    type: String,
    default: 'active'
  },
  token: {
    type: String,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  walletBalance:{
    type:Number,
    default:0
  },
  rewardBalance:{
    type:Number,
    default:0
  },
  referCode:{
    type:String,
    unique:true
  }
});

module.exports = mongoose.model('User', userSchema);
