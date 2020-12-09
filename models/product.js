const mongoose = require("mongoose");
const {isMongoId} = require('validator');
const idValidator = require('mongoose-id-validator');
const Category = require('../models/category');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true,"Lütfen ürün ismi için 5-200 karakter aralıgında bir değer girin."],
    minlength: [5,"Lütfen ürün ismi için 5-200 karakter aralıgında bir değer girin."],
    maxlength: [255,"Lütfen ürün ismi için 5-200 karakter aralıgında bir değer girin."],
  },
  price: {
    type: Number,
    required: function () {
      return this.isActive;
    },
    min: 0,
    max: 10000,
  },
  description: {
    type: String,
    minlength: [10,'Lütfen Minimum 200 Karakterlik bir Açıklama Giriniz...'],
  },
  imageURL: String,
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  ],

  tags: {
    type: Array,
    validate: {
      validator: function (value) {
        return value && value.length > 0;
      },
      message: "Ürün için en az bir etiket ekleyiniz...",
    },
  },
  isActive: Boolean,
});



//databasede oluşturduğumuz isimlere s takısı ekleniyor ve bütün harfleri küçük harfe dönüyor.
//Burada ben Model ismini Product verdim ama databasede products olacak.
module.exports = mongoose.model("Product", productSchema);

