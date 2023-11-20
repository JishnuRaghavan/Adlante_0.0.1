const easyinvoice = require('easyinvoice');
const fs  = require('fs');
const path  = require('path');
const Product = require('../models/productModel');
const Order   = require('../models/orderModel');
let imgPath = path.resolve('public/img','adlante (1).png');
//console.log(imgPath);
function base64_encode(imgPath){
  let png = fs.readFileSync(imgPath);
  return Buffer.from(png).toString('base64');
}


const easyInvoice = async(req,res)=>{
console.log('loading easyinvoice');
  try {
    
    const { shippingAddress,discountValue } = req.body;
    console.log(discountValue)
    const orderId = req.session.orderId;
    const parsedShippingAddress = JSON.parse(shippingAddress);
    const currentDate = new Date();
    const dueDate = new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    const formattedDueDate = dueDate.toLocaleDateString('en-GB');

    const orderItems = [];

    for (let key in req.body) {
      if (key.startsWith('quantity_')) {
        const productId = key.replace('quantity_', '');
        const quantity = parseInt(req.body[key], 10);

        const product = await Product.findById(productId);

        if (product) {
          orderItems.push({
            quantity: quantity,
            description:product.title,
            price: product.saleprice,
            "tax-rate":0,
          });
        }
      }
    }

    const shippingFee = 50;

      let data = {
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        
        "images": {
            // The logo on top of your invoice
            "logo": `${base64_encode(imgPath)}`,
        },
        // Your own data
        "sender": {
            "company": "Vetkot PVT LTD",
            "address": "North Paravoor",
            "zip": "683514",
            "city": "Ernakulam",
            "country": "Kerala"
            //"custom1": "custom value 1",
            //"custom2": "custom value 2",
            //"custom3": "custom value 3"
        },
        // Your recipient
        "client": {
            "company": parsedShippingAddress.userName,
            "address": parsedShippingAddress.houseName,
            "zip": parsedShippingAddress.pin,
            "city": parsedShippingAddress.district,
            "country": parsedShippingAddress.state
            // "custom1": "custom value 1",
            // "custom2": "custom value 2",
            // "custom3": "custom value 3"
        },
        "information": {
            // Invoice number
            "number": Date.now()+parseInt(orderId.substring(1),10),
            // Invoice data
            "date": new Date().toISOString().substring(0,10),
            // Invoice due date
            "due-date": formattedDueDate
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        "products": [...orderItems,{quantity:1,description:"shipping fee",price:shippingFee,"tax-rate":0},{quantity:1,description:"discount",price:discountValue*(-1),"tax-rate":0}],
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Kindly pay your invoice within 15 days.",
        // Settings to customize your invoice
        "settings": {
            "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
             "margin-top": 25, // Defaults to '25'
             "margin-right": 25, // Defaults to '25'
             "margin-left": 25, // Defaults to '25'
             "margin-bottom": 25, // Defaults to '25'
             "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
             "height": "1000px", // allowed units: mm, cm, in, px
             "width": "500px", // allowed units: mm, cm, in, px
            // "orientation": "landscape", // portrait or landscape, defaults to portrait
        },
    };
    //Create your invoice! Easy!
    const outputDirectory = path.resolve(__dirname, '../public/invoice');
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    const fileName  = `invoice${Date.now()}.pdf`;
    const filePath  = `${outputDirectory}/${fileName}`;

    const result  = await easyinvoice.createInvoice(data);
    fs.writeFileSync(filePath,result.pdf,'base64');

    await Order.findOneAndUpdate(
      {orderId:orderId},
      {$set:{invoice:fileName}},
      {new:true}
    );

  } catch (error) {
    console.log(error.message);
  }

}

module.exports  = easyInvoice;