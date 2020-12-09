const mongoose = require("mongoose");
const validator = require('validator');

const loginModel = mongoose.Schema({
  email: {
    type: String,
    required: [true,'Lütfen Geçerli Bir Email Adresi Giriniz.'],
  },
  password: {
    type: String,
    required: [true,'Lütfen Parola Giriniz.'],
  },
});

module.exports = mongoose.model('Login' , loginModel);