/**
 *User Controller for endpoint '/api/users/ POST/GET
 */
//=================Load all required module=============================================================
var User = require('../models/user');
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
                var user = new User();
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.email = req.body.email;
				user.username = req.body.username;
                user.password = req.body.password;
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

    /**
     * Register a user with application on end point '/api/users'
     *
     * @param  {req as json} x-access-token to get access of API
     * @return {res as json} success as false(failure) or true(success), status code and data as list of all available users in system.
     */

    getAllUsers: function (req, res) {
        User.find({"email:": req.query.email}, function (err, users) {
            //If there is any error connecting with database or fetching result, send error message as response.
            if (err) {
                res.json({success: false, statusCode: 500, errorMessage: err});
            }
            //If able to fetch all users then send them in response in data key.
            res.json({success: true, statusCode: 200, data: users});
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
						username: user.username
					}						
				});
			})			
            
        })

    },
	
	deleteUser: function (req, res) {
        User.remove({"id":req.id}, function (err, user) {
            //If there is any error connecting with database or fetching result, send error message as response.
            if (err) {
                res.json({success: false, statusCode: 500, errorMessage: err});
            }
            //If able to fetch all users then send them in response in data key.
            res.json({success: true, statusCode: 200});
        })

    }
};
