const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const product = require("../models/product");
const Order = require("../models/orders");

exports.getIndex = (req, res) => {
  Product.find()
    .then((products) => {
      Category.find().then((categories) => {
        res.render("shop/index", {
          title: "Shopping",
          products: products,
          categories: categories,
          isAuthenticated: req.session.isAuthenticated,
          path: "/",
        });
      });
    })

    // Category.getCategory()
    // .then(categories=>{
    //     res.render('shop/index' , {
    //         title : 'Shopping',
    //         products : products,
    //         categories : categories,
    //         path : '/'
    //     })
    // })

    .catch((err) => {
      next(err);
    });
};

exports.getProducts = (req, res) => {
  Product.find()
    .then((products) => {
      Category.find().then((categories) => {
        res.render("shop/products", {
          title: "Products",
          products: products,
          categories: categories,
          isAuthenticated: req.session.isAuthenticated,
          path: "/products",
        });
      });
    })
    .catch((err) => {
      next(err);
    });
  // Category.getCategory()
  // .then(categories =>{
  //     res.render('shop/products' , {
  //         title : 'Products',
  //         products : products,
  //         categories : categories,
  //         path : '/products'
  //     })
  // })
};

exports.getProductsByCategoryId = (req, res) => {
  const categoryid = req.params.categoryid;
  Product.find({ categories: categoryid }).then((products) => {
    Category.find().then((categories) => {
      res.render("shop/products", {
        categories: categories,
        products: products,
        selectedCategory: categoryid,
        isAuthenticated: req.session.isAuthenticated,
        title: "Product",
        path: "/shop/products",
      });
    });
  });
};

exports.getProduct = (req, res) => {
  const productid = req.params.productid;
  Product.findById(productid)
    .then((product) => {
      res.render("shop/product-detail", {
        title: product.name,
        product: product,
        path: "/products",
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCart = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      res.render("shop/cart", {
        title: "Cart",
        products: user.cart.items,
        isAuthenticated: req.session.isAuthenticated,
        path: "/cart",
      });
    });

  // req.user.getCart()
  //   .then(products =>{
  //     console.log(products)
  //     res.render("shop/cart", {
  //       title: "Cart",
  //       products: products,
  //       path: "/cart",
  //     });
  //   })
  //   .catch(err=> console.log(err))
};

exports.postCart = (req, res) => {
  const productid = req.body.productid;
  Product.findById(productid)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCartItem = (req, res) => {
  const productid = req.body.productid;
  req.user
    .deleteCartItem(productid)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getOrders = (req, res) => {
  Order.find({ "user.userId": req.user._id })
    .sort({ date: -1 })
    .then((orders) => {
      res.render("shop/orders", {
        orders: orders,
        isAuthenticated: req.session.isAuthenticated,
        path: "/orders",
        title: "Orders",
      });
    });
};

exports.postOrders = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      let order = new Order({
        user: {
          userId: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        items: user.cart.items.map((p) => {
          return {
            product: {
              _id: p.productId._id,
              name: p.productId.name,
              price: p.productId.price,
              imageURL: p.productId.imageURL,
            },
            quantity: p.quantity,
          };
        }),
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      next(err);
    });
};
