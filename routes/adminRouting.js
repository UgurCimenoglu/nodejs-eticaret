const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");

const isAuthenticated = require('../middleware/authentication');

const csrf = require('../middleware/csrfToken');

const isAdmin = require('../middleware/isAdmin');

router.get('/products' ,csrf, isAdmin, isAuthenticated , adminController.getProducts);

router.get("/add-product",csrf, isAdmin, isAuthenticated ,adminController.getAddProduct);

router.post("/add-product",csrf, isAdmin, isAuthenticated ,adminController.postAddProduct);

router.get("/products/:productid",csrf, isAdmin, isAuthenticated ,adminController.getEditProduct);

router.post("/products",csrf, isAdmin, isAuthenticated ,adminController.postEditProduct);

router.post("/delete-product" ,csrf, isAdmin, isAuthenticated ,adminController.postDeleteProduct);

router.get("/category" ,csrf, isAdmin, isAuthenticated ,adminController.getCategory);

router.get('/add-category' ,csrf, isAdmin, isAuthenticated ,adminController.getAddCategory);

router.post('/add-category' ,csrf, isAdmin, isAuthenticated ,adminController.postAddCategory);

router.get('/category/:categoryid' ,csrf, isAdmin, isAuthenticated ,adminController.getEditCategory);

router.post("/category" ,csrf, isAdmin, isAuthenticated ,adminController.postEditCategory);

router.post("/delete-category" ,csrf, isAdmin, isAuthenticated ,adminController.postDeleteCategory);

module.exports = router;
