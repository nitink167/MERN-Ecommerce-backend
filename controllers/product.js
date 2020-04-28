const Product = require('../models/product');
const formidable= require('formidable');
const _ = require('lodash');
const fs = require('fs');


exports.getProductById = (req, res, next, id) => {
	Product.findById(id)
	.populate('category')
	.exec((err, product) => {
		if(err) {
			return res.status(400).json({
				error: 'Product Not Found'
			})
		}
		req.product = product;
		next()
	})
}

exports.createProduct = (req, res) => {

	let form = new formidable.IncomingForm();
	form.keepExtension = true;

	form.parse(req, (err, fields, file) => {
		if(err) {
			return res.status(400).json({
				error: 'Problem with image'
			})
		}

		//destructure the field
		const {name, description, price, category, stock} = fields

		if( !name || !description || !price || !category ||	!stock ){
			return res.status(400).json({
				error: 'Please include all fields'
			})
		}

		//Restrictions on field
		let product = new Product(fields)

		//Handle File here
		if(file.photo) {
			if(file.photo.size > 3000000) {
				return res.status(400).json({
					error: 'File size too big'
				})
			}
			product.photo.data = fs.readFileSync(file.photo.path)
			product.photo.contentType = file.photo.type
		}

		//Save to the DB
		product.save((err, product) => {
			if(err) {
				return res.status(400).json({
					error: 'Saving failed'
				})
			}
			res.json(product)
		})
	})
}

exports.getProduct = (req, res) => {
	req.product.photo = undefined;
	return res.json(req.product);
}

exports.removeProduct = (req, res) => {
	let product = req.product;
	product.remove((err, deletedProduct) => {
		if(err) {
			return res.status(400).json({
				error: 'Failed to delete'
			})
		}
		res.json({
			message: 'Deletion was successfull',
			deletedProduct
		})
	})
}

exports.updateProduct = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtension = true;

	form.parse(req, (err, fields, file) => {
		if(err) {
			return res.status(400).json({
				error: 'Problem with image'
			})
		}

		//Updation Code
		let product = req.product;
		product = _.extend(product, fields)

		//Handle File here
		if(file.photo) {
			if(file.photo.size > 3000000) {
				return res.status(400).json({
					error: 'File size too big'
				})
			}
			product.photo.data = fs.readFileSync(file.photo.path)
			product.photo.contentType = file.photo.type
		}

		//Save to the DB
		product.save((err, product) => {
			if(err) {
				return res.status(400).json({
					error: 'Updation failed'
				})
			}
			res.json(product)
		})
	})
}

exports.getAllProducts = (req, res) => {
	let limit = req.query.limit ? parseInt(req.query.limit) : 8
	let sortBy = req.query.sortBy ? req.query.sortBy : '_id'

	Product.find()
	.select('-photo')
	.populate('category')
	.sort([[sortBy, 'asc']])
	.limit(limit)
	.exec((err, products) => {
		if(err) {
			return res.status(400).json({
				error: 'No Product found'
			})
		}
		res.json(products)
	})
}

exports.getAllUniqueCategories = (req, res) => {
	Product.distinct('categories', {}, (err, category => {
		if(err) {
			return res.status(400).json({
				error: 'No Category found'
				})
			}
			res.json(category)
		})
	)
}

//Middleware
exports.photo = (req, res, next) => {
	if(req.product.photo.data) {
		res.set('Content-Type', req.product.photo.contentType);
		return res.send(req.product.photo.data)
	}
	next()
}

exports.updateStock = (req, res, next) => {
	let myOperations = req.body.order.products.map(product => {
		return {
			updateOne: {
				filter: {_id: product._id},
				update: {$inc: {stock: -product.countunt, sold: +product.count}}
			}
		}
	})

	Product.bulkWrite(myOperations, {}, (err, products) => {
		if(err) {
			return res.status(400).json({
				error: 'Bulk operaton failed'
			})
		}
		next()
	})
}
