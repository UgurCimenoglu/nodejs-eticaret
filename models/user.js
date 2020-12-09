const Product = require("./product");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password : {
    type : String,
    required : true
  },
  resetToken : String,
  resetTokenExpiration : Date,
  isAdmin : {
    type: Boolean,
    default: false
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const index = this.cart.items.findIndex((index) => {
    return index.productId.toString() === product._id.toString();
  });

  const updatedCartItems = [...this.cart.items];
  let itemQuantity = 1;

  if (index >= 0) {
    itemQuantity = this.cart.items[index].quantity + 1;
    updatedCartItems[index].quantity = itemQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: itemQuantity,
    });
  }

  this.cart = {
    items: updatedCartItems,
  };

  return this.save();
};

userSchema.methods.getCart = function () {
  const ids = this.cart.items.map((item) => {
    return item.productId;
  });

  return Product.find({
    _id: {
      $in: ids,
    },
  })
    .then((products) => {
      return products.map((p) => {
        return {
          name: p.name,
          price: p.price,
          imageURL: p.imageURL,
          quantity: this.cart.items.find((i) => {
            return i.productId.toString() === p._id.toString();
          }).quantity,
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

userSchema.methods.deleteCartItem = function(productid){
  const index = this.cart.items.findIndex(item=>{
    return item.productId == productid
  })
  
  const userCartItems = [...this.cart.items]
  userCartItems.splice(index,1)

  this.cart.items = userCartItems;

  return this.save();
}

userSchema.methods.clearCart = function(){
  this.cart.items = [];
  return this.save();
}

module.exports = mongoose.model("User", userSchema);
