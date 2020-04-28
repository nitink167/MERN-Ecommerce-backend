const express = require('express');
const router = express.Router();

const { getProductById, createProduct, getProduct, photo, removeProduct, updateProduct, getAllProducts, getAllUniqueCategories } = require('../controllers/product');
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { getUserById } = require('../controllers/user');

//All Params
router.param('userId', getUserById);
router.param('productId', getProductById);

//CreateRoute
router.post('/product/create/:userId', isSignedIn, isAuthenticated, isAdmin, createProduct);

//ReadRoute
router.get('/product/:productId', getProduct);
router.get('/product/photo/:productId', photo);

//Delete Route
router.delete('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, removeProduct);

//Update Route
router.put('/product/:productId/:userId', isSignedIn, isAuthenticated, isAdmin, updateProduct);

//Listing Route
router.get('/products', getAllProducts);
router.get('/products/categories', getAllUniqueCategories);

module.exports = router;
