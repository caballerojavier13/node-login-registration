//==============LOAD ALL REQUIRED MODULES========================================
//Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
var mongoose = require('mongoose');

var SessionSchema = new mongoose.Schema({
    token: {type: String, required: true},  //String type
    user_id: {type: mongoose.Schema.Types.ObjectId, required: true},
	app_name: {type: String, required: false, default: ''},
});
// make this available to our users in our Node applications
module.exports = mongoose.model('Session', SessionSchema);
