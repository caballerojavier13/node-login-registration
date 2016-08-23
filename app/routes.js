/** /app/route.js
 *route.js has deified all end points and forward request fr corresponding controller.
 * @type {*|exports|module.exports as route}
 */
var express = require('express');  //load express module to crate instance of app
var jwt = require('jsonwebtoken'); //load json eb token to verify token in endpoints
var config = require('./config/index'); //get secret key from configuration parameters
//The express.Router class can be used to create modular mountable route handlers.
// A Router instance is a complete middleware and routing system;
var router = express.Router();
//express-validation is a middleware that validates the body, params, query,
// headers and cookies of a request and returns a response with errors;
//we have used it for contact request parameters validation with JOI.
var validate = require('express-validation');
//Index controller to handle all(get, post, delete, put) route "/" requests.
var IndexController = require('./controllers/IndexController');
//ContactRequest controller to handle all(get, post, delete, put) route "/contactRequest" requests.
var UserController = require('./controllers/UserController');

//Login controller to check user name and password and return user ID with token

var LoginController = require('./controllers/LoginController');
//load validation module to validate input requests parameter.
var validation = require('./utils/validation');

var Session = require('./models/session'); //Session model so

//============MIDDLEWARE TO CHECK TOKEN IS PROVIDED TO ACCESS END POINTS===================
// route middleware to verify a token
router.use(function (req, res, next) {
    console.log(req.originalUrl);
    if (req.originalUrl === '/api/login' || req.originalUrl === '/api/register') {
        return next();
    } else {
		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];

		// decode token
		if (token) {

			// verifies secret and checks exp
			jwt.verify(token, config.secret, function (err, decoded) {
				if (err) {
					Session.remove({
						token: token
					}, function (err, session) {

						return res.json({
							success: false,
							statusCode: 401,
							errMessage: 'Unauthorized Access: Failed to authenticate token.'
						});
						
					})
					
				} else {
					// if everything is good, save to request for use in other routes
					
					Session.find({"token":token}, function (err, session) {
						//If there is any error connecting with database or fetching result, send error message as response.
						if (err) {
							return res.json({
								success: false,
								statusCode: 401,
								errMessage: 'Unauthorized Access: Failed to authenticate token.'
							});
						}else{
							if(session.length){
								req.decoded = decoded;
						
								next();
							}else{
								return res.json({
									success: false,
									statusCode: 401,
									errMessage: 'Unauthorized Access: Failed to authenticate token.'
								});
							}
							
						}
						
					})
					
				}
			});

		} else {

			// if there is no token
			// return an error
			return res.json({success: false, statusCode: 403, errMessage: 'Unauthorized Access: No token provided'});

		}
	
    }


});
//===============================MIDDLEWARE DONE===========================================================

//get Route API to just check route end point is working fine.
router.route('/')
    .get(IndexController.getWelcomeMessage);

//all request received at /conatctRequest end point would be received here and would be
// transfer to corresponding controller as per operation method.
router.route('/api/users')
    .get(UserController.user.getAllUsers)
router.route('/api/user')
    .get(UserController.user.getUser)
	.delete(UserController.user.deleteUser)
router.route('/api/register')
    .post(validate(validation.register), UserController.user.register);

//==========Login end point('/api/login')===========================================
router.route('/api/login')
    .post(LoginController.session.login);
router.route('/api/logout')
    .delete(LoginController.session.logout);
router.route('/api/logout/all')
    .delete(LoginController.session.logoutAll);
router.route('/api/sessions')
    .get(LoginController.session.getMySessions);
router.route('/api/sessions/all')
    .get(LoginController.session.getAllSessions);
//export router module.
module.exports = router;
