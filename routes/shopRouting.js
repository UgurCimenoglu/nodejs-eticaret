const express = require("express");
const router = express.Router();

const ShopController = require("../controllers/shop");

const isAuthenticated = require('../middleware/authentication');

const csrf = require('../middleware/csrfToken');

router.get("/", csrf, ShopController.getIndex);

router.get("/products", csrf, ShopController.getProducts);

router.get("/products/:productid", ShopController.getProduct);

router.get("/categories/:categoryid", ShopController.getProductsByCategoryId);

// router.get("/details", ShopController.getProductDetails);

router.get("/cart",csrf, isAuthenticated, ShopController.getCart);

router.post("/cart", csrf, isAuthenticated, ShopController.postCart);

router.post('/delete-cartitem' ,csrf, isAuthenticated, ShopController.deleteCartItem);

router.get("/orders", isAuthenticated, ShopController.getOrders);

router.post("/create-order",csrf, isAuthenticated, ShopController.postOrders);

module.exports = router;
