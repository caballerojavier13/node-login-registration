/**
 * Index controller for end point "/"
 * @param request and response object, request object would have all http input request parameters.
 * @returns response(object) a welcome message as response to API caller.
 */
exports.getWelcomeMessage = function(req, res) {
	
    res.json({statusCode: 200, success: true, message:"Autenticated!"});

};
