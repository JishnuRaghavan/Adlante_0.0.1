const mongoose  = require('mongoose');
mongoose.connect("mongodb+srv://jishnu18js:Hza7NZ7qmkFCIrE0@cluster0.em8ux52.mongodb.net/vetkot?retryWrites=true&w=majority");

const express = require('express');
const app     = express();

const session = require('express-session');
const config  = require('./config/config');

app.use(
  session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true

  })
)

app.use(express.static('public'));

const userRoute  = require('./routes/userRoute');
app.use('/',userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(7000,()=>{
  console.log("server is running...");
})