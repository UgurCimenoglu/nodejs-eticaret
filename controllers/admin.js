const Product = require("../models/product");
const Category = require("../models/category");
const { default: validator } = require("validator");
const mongoose = require("mongoose");
const fs = require("fs");
const product = require("../models/product");

exports.getProducts = (req, res) => {
  Product.find({ userId: req.user._id })
    .populate("userId", "name -_id")

    .then((products) => {
      res.render("admin/products", {
        title: "Admin Products",
        products: products,
        path: "/admin/products",
        action: req.query.action, //??
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAddProduct = (req, res) => {
  Category.find({}).then((categories) => {
    res.render("admin/add-product", {
      categories: categories,
      title: "Add a New Product",
      path: "/admin/add-product",
    });
  });
};

exports.postAddProduct = (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const file = req.file;
  const description = req.body.description;
  const categoryid = req.body.categoryid;
  const id = req.user;

  console.log(file);

  if (file) {
    const newProduct = new Product({
      name: name,
      price: price,
      imageURL: file.filename,
      description: description,
      categories: categoryid,
      userId: id,
      isActive: false,
      tags: ["Akıllı Telefon"],
    });
    newProduct
      .save()
      .then((result) => {
        res.redirect("/admin/add-product");
      })
      .catch((err) => {
        console.log(err);
        let message = "";
        if (err.name == "ValidationError") {
          for (field in err.errors) {
            message += err.errors[field].message + "<br>";
          }
          Category.find({}).then((categories) => {
            res.render("admin/add-product", {
              errorMessage: message,
              categories: categories,
              title: "Add a New Product",
              path: "/admin/add-product",
              inputs: {
                name: name,
                price: price,
                imageURL: file.originalname,
                description: description,
              },
            });
          });
        } else {
          next(err);
        }
      });
  } else {
    Category.find({})
      .then((categories) => {
        return res.render("admin/add-product", {
          errorMessage: "Lütfen Bir Görsel Seçiniz...",
          categories: categories,
          title: "Add a New Product",
          path: "/admin/add-product",
          inputs: {
            name: name,
            price: price,
            description: description,
          },
        });
      })
      .catch((err) => {
        next(err);
      });
  }
};

exports.getEditProduct = (req, res) => {
  Product.findOne({ _id: req.params.productid, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      return product;
    })
    .then((product) => {
      Category.find().then((categories) => {
        categories = categories.map((category) => {
          if (product.categories) {
            product.categories.find((item) => {
              if (item.toString() === category._id.toString()) {
                category.selected = true;
              }
            });
          }

          return category;
        });

        res.render("admin/edit-product", {
          title: "Edit Product",
          path: "/admin/products",
          product: product,
          categories: categories,
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postEditProduct = (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const price = req.body.price;
  const file = req.file;
  const description = req.body.description;
  const categories = req.body.categoryids;
  // const userId = req.user._id;

  const product = {
    name: name,
    price: price,
    description: description,
    categories: categories,
  };

  if (file) {
    Product.findById(id).then((product) => {
      fs.unlink("public/img/" + product.imageURL, (err) => {
        if (err) console.log(err);
      });
    });
    product.imageURL = file.filename;
    console.log(file);
  }

  Product.updateOne(
    { _id: id, userId: req.user._id },
    {
      $set: product,
    }
  )
    .then((result) => {
      res.redirect("/admin/products?action=edit");
    })
    .catch((err) => {
      console.log(err);
    });

  // Product.findById(id)
  //   .then((product) => {
  //     product.name = name;
  //     product.price = price;
  //     product.imageURL = imageURL;
  //     product.description = description;
  //     product.categories = categories;

  //     product.save().then(() => {
  //       res.redirect("/admin/products?action=edit");
  //     });
  //   })
  //   .catch((err) => {
  //     next(err);
  //   });
};

exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.productid;
  Product.findOne({ _id: id, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return next(new Error("Silmek istediğiniz ürün bulunamadı..."));
      }
      fs.unlink("public/img/" + product.imageURL, (err) => {
        if (err) {
          console.log(err);
        } else {
          return Product.deleteOne({ _id: id, userId: req.user._id }).then(
            (result) => {
              if (result.deletedCount === 0) {
                return res.redirect("/");
              } else {
                return res.redirect("/admin/products?action=delete");
              }
            }
          );
        }
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCategory = (req, res) => {
  Category.find()
    .then((categories) => {
      res.render("admin/category", {
        title: "category",
        path: "/admin/category",
        categories: categories,
        action: req.query.action,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAddCategory = (req, res) => {
  res.render("admin/add-category", {
    title: "Add Category",
    path: "/admin/add-category",
  });
};

exports.postAddCategory = (req, res) => {
  const name = req.body.categoryname;
  const description = req.body.description;

  const category = new Category({
    name: name,
    description: description,
  });

  category
    .save()
    .then((category) => {
      res.redirect("/admin/category?action=success");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEditCategory = (req, res) => {
  const categoryid = req.params.categoryid;
  Category.findById(categoryid)
    .then((category) => {
      res.render("admin/edit-category", {
        category: category,
        path: "/admin/edit-category",
        title: "Edit Category",
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postEditCategory = (req, res) => {
  const name = req.body.categoryname;
  const description = req.body.description;
  const categoryid = req.body.categoryid;

  const category = new Category(name, description, categoryid);

  return category
    .save()
    .then((result) => {
      res.redirect("/admin/category?action=edit");
    })
    .catch((err) => {
      next(err);
    });
};

exports.postDeleteCategory = (req, res) => {
  const categoryid = req.body.categoryid;
  Category.findByIdAndRemove(categoryid)
    .then((result) => {
      res.redirect("/admin/category?action=delete");
    })
    .catch((err) => {
      next(err);
    });
};
