const nodemailer = require("nodemailer");
 require('dotenv').config;
const transporter = nodemailer.createTransport({
    service:"Gmail", 
    auth:{
      user:process.env.USER,
      pass:process.env.PASS
    }   
  })
  
module.exports = transporter  