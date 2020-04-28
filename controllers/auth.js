const User = require('../models/user');
const { check, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt')


///////////// SIGN UP ROUTE //////////////
exports.signup = (req, res) => {
	const errors = validationResult(req)

	if(!errors.isEmpty()){
		return res.status(400).json({
			error: errors.array()[0].msg
		})
	}

	const user = new User(req.body);
	user.save((err, user) => {
		if(err){
			res.status(400).json({
				err: 'NOT ABLE TO SAVE USER IN DB'
			})
		}
		res.json({
			name: user.name,
			email: user.email,
			id: user._id
		});
	})
}


///////////// SIGN IN ROUTE //////////////
exports.signin = (req, res) => {
	const errors = validationResult(req)
	const {email, password} = req.body;

	if(!errors.isEmpty()){
		return res.status(400).json({
			error: errors.array()[0].msg
		})
	}

	User.findOne({email}, (err, user) => {
		if(err || !user) {
			return res.status(400).json({
				error: 'USER email does not exist'
			})
		}
		if(!user.authenticate(password)){
			return res.status(401).json({
				error: 'Email and password do not match'
			})
		}

		//create token
		const token = jwt.sign({_id: user._id}, process.env.SECRET);
		//put token in cookie
		res.cookie('token', token, {expire: new Date() + 9999});
		//send response to frontend
		const {_id, name, role} = user;
		return res.json({
			token,
			user: {
				_id,
				name,
				email,
				role
			}
		})
	})


}


///////////// SIGN OUT ROUTE //////////////
exports.signout = (req, res) => {
	res.clearCookie()
	res.json({
		message: 'User signout'
	});
}


///////////// AUTHENTICATED ROUTES //////////////
exports.isSignedIn = expressJwt({
	secret: process.env.SECRET,
	userProperty: 'auth'
})

exports.isAuthenticated = (req, res, next) => {
	let checker = req.profile && req.auth && req.profile._id == req.auth._id
	if(!checker){
		return res.status(403).json({
			error: 'Access Denied'
		})
	}
	next();
}

exports.isAdmin = (req, res, next) => {
	if(req.profile.role === 0) {
		return res.status(403).json({
			error: 'Only admins are allowed'
		})
	}
	next();
}
