/**
 *User Controller for endpoint '/api/login' POST request
 */
//=======================Load all the required module.==============================================
var jwt = require('jsonwebtoken');  //generate a access token so all other end points can be secure.
var User = require('../models/user'); //User model so
var Session = require('../models/session'); //Session model so
var config = require('../config/index');  //load configuration parameters.

/**
 * Register a user with application on end point '/api/users'
 *
 * @param  {req as json} user name and password.
 * @return {res as json} success as false(failure) or true(success), status code and access token to geet access of all other end points..
 */

exports.session = {

	login: function (req, res) {
		// find the user in database
		User.findOne({
			"username": req.body.username,
			deleted: {$ne: true}
		}, function (err, user) {

			//If there is any error is finding or doing operation in database
			if (err) {
				res.json({success: false, statusCode: 500, errorMessage: err});
			}

			//if does not find username in database then return error
			if (!user) {
				res.json({success: false, statusCode: 403, errorMessage: 'Authentication failed. User not found.'});
			} else if (user) {

				// check if password matches
				if (!user.comparePassword(req.body.password)) {
					res.json({success: false, statusCode: 403, errorMessage: 'Authentication failed. Wrong password.'});
				} else {
					
					if(!user.active){
						
						// if user is found and password is right
						// create a token
						var token = jwt.sign(user, config.secret, {
							"expiresIn": 1440 * 60// expires in 24 hours
						});
						
						var session = new Session();
						
						session.user_id = user.id;
						session.token = token;
						session.app_name = req.body.app_name;
						
						session.save(function (err) {
							if (err) {
								return res.json({success: false, statusCode: 500, errorMessage: err});
							}
							// return the information including token as JSON
							return res.json({
								success: true,
								statusCode: 200,
								message: 'You are logged in successfully!',
								user: {
									id: user._id,
									firstName: user.firstName,
									lastName: user.lastName,
									is_admin: user.is_admin,
									email: user.email,
									username: user.username
								},
								token: token
							});

						});
						
					}else{

						return res.json({success: false, statusCode: 403, errorMessage: 'Account not activated. Please check your email'});
						
					}
					
				}

			}

		})
	},
	logout: function (req, res) {
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		
		Session.remove({
			token: token
		}, function (err, session) {

			//If there is any error is finding or doing operation in database
			if (err) {
				res.json({success: false, statusCode: 500, errorMessage: err});
			}
			
			res.json({success: true, statusCode: 200});
		})
		
	},
	
	logoutAll: function (req, res) {
		
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		
		Session.findOne({
			token: token
		}, function (err, session) {

			//If there is any error is finding or doing operation in database
			if (err) {
				res.json({success: false, statusCode: 500, errorMessage: err});
			}
			
			Session.remove({
				"user_id": session.user_id
			}, function (err, session) {

				//If there is any error is finding or doing operation in database
				if (err) {
					res.json({success: false, statusCode: 500, errorMessage: err});
				}
				
				res.json({success: true, statusCode: 200});
			})
		})
		
	},
	
	getAllSessions: function (req, res) {
        
		
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		
        Session.findOne({"token":token}, function (err, session) {
            //If there is any error connecting with database or fetching result, send error message as response.
            if (err) {
                res.json({success: false, statusCode: 500, errorMessage: err});
            }
			User.findOne({"_id": session.user_id},function(err,user){
				if (err) {
					res.json({success: false, statusCode: 500, errorMessage: err});
				}
				if(user.is_admin){
					Session.find({}, function (err, sessions) {
						//If there is any error connecting with database or fetching result, send error message as response.
						if (err) {
							res.json({success: false, statusCode: 500, errorMessage: err});
						}
						
						res.json({success: true, statusCode: 200, data: sessions});
					})
				}else{
					
					return res.json({success: false, statusCode: 403, errMessage: 'Unauthorized Access: No admin user'});
					
				}
			})			
            
		})
	},
	
	getMySessions: function (req, res) {
        
		
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		
        Session.findOne({"token":token}, function (err, session) {
            //If there is any error connecting with database or fetching result, send error message as response.
            if (err) {
                res.json({success: false, statusCode: 500, errorMessage: err});
            }
			User.findOne({"_id": session.user_id},function(err,user){
				if (err) {
					res.json({success: false, statusCode: 500, errorMessage: err});
				}
				
				Session.find({"user_id": user._id}, function (err, sessions) {
					//If there is any error connecting with database or fetching result, send error message as response.
					if (err) {
						res.json({success: false, statusCode: 500, errorMessage: err});
					}
					
					res.json({success: true, statusCode: 200, data: sessions});
					
				})	
            
			})

		})
	}
};