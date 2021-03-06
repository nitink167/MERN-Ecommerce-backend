var express = require('express');
var router = express.Router();

const { getCategoryById, createCategory, getCategory, getAllCategory, updateCategory, removeCategory} = require('../controllers/category')
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth')
const { getUserById } = require('../controllers/user')

//Params
router.param('userId', getUserById);
router.param('categoryId', getCategoryById);

//Create Routes
router.post('/category/create/:userId', isSignedIn, isAuthenticated, isAdmin, createCategory);
//Get Requests
router.get('/category/:categoryId', getCategory);
router.get('/categories', getAllCategory);
//Update Requests
router.put('/category/:categoryId/:userId', isSignedIn, isAuthenticated, isAdmin, updateCategory)
//Delete Request
router.delete('/category/:categoryId/:userId', isSignedIn, isAuthenticated, isAdmin, removeCategory)

module.exports = router;
