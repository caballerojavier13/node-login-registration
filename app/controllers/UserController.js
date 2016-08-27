/**
 *User Controller for endpoint '/api/users/ POST/GET
 */
//=================Load all required module=============================================================
var User = require('../models/user');
var crypto = require('crypto');
var base64url = require('base64url');
var Session = require('../models/session'); //Session model so

exports.user = {
    /**
     * Register a user with application on end point '/api/users'
     *
     * @param  {req as json} firstName, lastName, email(username), password
     * @return {res as json} success as false(failure) or true(success), status code and message of success or failure
     */
    register: function (req, res) {
        //check whether email ID is unique or not, if not then ask user to register with a email which does not already exist.
        User.findOne({username: req.body.email}, function (err, user) {
            //If there is any error connecting with database or fetching result, send error message as response.
            if (err) {
                return res.json({success: false, statusCode: 500, errorMessage: err});
            }
            //check if user found in system with sam email ID, send response as email already exist in application.
            if (user) {
                return res.json({success: false, statusCode: 302, errorMessage: 'Email ID is already exist in system'});
            }

            //if email is unique then process further and register user with application,
            // save all user information in User collection.

            else {
				var token_activation = base64url(crypto.randomBytes(10))
                var user = new User();
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.email = req.body.email;
				user.username = req.body.username;
                user.password = req.body.password;
				user.token_activation = token_activation;
                user.save(function (err) {
                    if (err) {
                        return res.json({success: false, statusCode: 500, errorMessage: err});
                    }
                    //If execution is success then send response as user is registered successfully.

                    return res.json({success: true, statusCode: 200, message: "User has been registered successfully"});

                });
            }
        });


    },
	
	activate: function (req, res) {

		User.findOne({"_id": req.query.id, 'token_activation' : req.query.token_activation},function(err,user){

			if (err) {
				
				return res.json({success: false, statusCode: 500, errorMessage: err});
				
			}else {
				
				if(user){
					user.active = true;
					user.save(function (err) {
						if (err) {
							return res.json({success: false, statusCode: 500, errorMessage: err});
						}

						return res.json({
							success: true,
							statusCode: 200,
							message: "User has edited successfully",
							user: {
								id: user._id,
								firstName: user.firstName,
								lastName: user.lastName,
								is_admin: user.is_admin,
								email: user.email,
								username: user.username,
							deleted: user.deleted
							}
						});

					});
				}else{
					return res.json({success: false, statusCode: 404, errorMessage: 'User not found'});
				}
				
			}
				
		})

    },

	editAsAdmin: function (req, res) {

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

					User.findById(req.params.id, function (err, user) {

						if (err) {
							return res.json({success: false, statusCode: 500, errorMessage: err});
						}else {
							user.firstName = req.body.firstName;
							user.lastName = req.body.lastName;
							user.email = req.body.email;
							user.username = req.body.username;
							user.save(function (err) {
								if (err) {
									return res.json({success: false, statusCode: 500, errorMessage: err});
								}

								return res.json({
									success: true,
									statusCode: 200,
									message: "User has edited successfully",
									user: {
										id: user._id,
										firstName: user.firstName,
										lastName: user.lastName,
										is_admin: user.is_admin,
										email: user.email,
										username: user.username,
										deleted: user.deleted
									}
								});

							});
						}
					});

				}else{

					return res.json({success: false, statusCode: 403, errMessage: 'Unauthorized Access: No admin user'});

				}
			})

		})


    },

	makeAdmin: function (req, res) {

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

					User.findOne({"_id": req.params.id}, function (err, user) {

						if (err) {
							return res.json({success: false, statusCode: 500, errorMessage: err});
						}else {

							user.is_admin = true;
							user.save(function (err) {
								if (err) {
									return res.json({success: false, statusCode: 500, errorMessage: err});
								}

								return res.json({
									success: true,
									statusCode: 200,
									message: "User has edited successfully",
									user: {
										id: user._id,
										firstName: user.firstName,
										lastName: user.lastName,
										is_admin: user.is_admin,
										email: user.email,
										username: user.username,
										deleted: user.deleted
									}
								});

							});
						}
					});

				}else{

					return res.json({success: false, statusCode: 403, errMessage: 'Unauthorized Access: No admin user'});

				}
			})

		})


    },

    /**
     * Register a user with application on end point '/api/users'
     *
     * @param  {req as json} x-access-token to get access of API
     * @return {res as json} success as false(failure) or true(success), status code and data as list of all available users in system.
     */

    getAllUsers: function (req, res) {
		
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

					User.find({
						'firstName' : new RegExp(req.query.firstname, 'i'),
						'lastName' : new RegExp(req.query.lastname, 'i'),
						'email' : new RegExp(req.query.email, 'i'),
						'username' : new RegExp(req.query.username, 'i'),
						'is_admin' : req.query.is_admin == null ? {$in: [true, false]} : {$in: [req.query.is_admin]}
						}, function (err, users) {
						//If there is any error connecting with database or fetching result, send error message as response.
						if (err) {
							res.json({success: false, statusCode: 500, errorMessage: err});
						}
						//If able to fetch all users then send them in response in data key.
						res.json({success: true, statusCode: 200, data: users});
					})

				}else{

					return res.json({success: false, statusCode: 403, errMessage: 'Unauthorized Access: No admin user'});

				}
			})

		})

    },
	
	

	/**
     * Register a user with application on end point '/api/user/:id'
     *
     * @param  {req as json} x-access-token to get access of API
     * @return {res as json} success as false(failure) or true(success), status code and data of a user in system.
     */

	getUser: function (req, res) {

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

      				//If able to fetch all users then send them in response in data key.
      				res.json({
      					success: true,
      					statusCode: 200,
      					data: {
      						id: user._id,
      						firstName: user.firstName,
      						lastName: user.lastName,
      						is_admin: user.is_admin,
      						email: user.email,
      						username: user.username,
							deleted: user.deleted							
      					}
      				});
      			})

          })

    },

    editUser: function (req, res) {

      var token = req.body.token || req.query.token || req.headers['x-access-token'];

          Session.findOne({"token":token}, function (err, session) {
              //If there is any error connecting with database or fetching result, send error message as response.
              if (err) {
                  res.json({success: false, statusCode: 500, errorMessage: err});
              }
				User.findOne({"_id": session.user_id},function(err,user){

					if (err) {
					  res.json({success: false, statusCode: 500, errorMessage: err});
					}else {
						user.firstName = req.body.firstName;
						user.lastName = req.body.lastName;
						user.email = req.body.email;
						user.username = req.body.username;
						user.save(function (err) {
							if (err) {
								return res.json({success: false, statusCode: 500, errorMessage: err});
							}

							return res.json({
								success: true,
								statusCode: 200,
								message: "User has edited successfully",
								user: {
									id: user._id,
									firstName: user.firstName,
									lastName: user.lastName,
									is_admin: user.is_admin,
									email: user.email,
									username: user.username,
									deleted: user.deleted
								}
							});

						});
					}				
				});
              })

      },

	deleteUser: function (req, res) {
        User.findOne({"id":req.id}, function (err, user) {
            //If there is any error connecting with database or fetching result, send error message as response.
            if (err) {
                res.json({success: false, statusCode: 500, errorMessage: err});
            }
            //If able to fetch all users then send them in response in data key.
            if(user){
				user.deleted = true;
				user.save(function (err) {
					if (err) {
						return res.json({success: false, statusCode: 500, errorMessage: err});
					}

					return res.json({
						success: true,
						statusCode: 200,
						message: "User has edited successfully",
						user: {
							id: user._id,
							firstName: user.firstName,
							lastName: user.lastName,
							is_admin: user.is_admin,
							email: user.email,
							username: user.username,
							deleted: user.deleted
						}
					});

				});
			}
        })

    }
	
	deleteUser: function (req, res) {
		
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

					User.remove({"id":req.id}, function (err, user) {
					//If there is any error connecting with database or fetching result, send error message as response.
					if (err) {
						res.json({success: false, statusCode: 500, errorMessage: err});
					}
					
					res.json({success: true, statusCode: 200});
					
				})

				}else{

					return res.json({success: false, statusCode: 403, errMessage: 'Unauthorized Access: No admin user'});

				}
			})

		})

    }
};
