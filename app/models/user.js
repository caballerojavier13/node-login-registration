//==============LOAD ALL REQUIRED MODULES========================================
//Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var uniqueValidator = require('mongoose-unique-validator');
var SALT_WORK_FACTOR = 10;
var UserSchema = new mongoose.Schema({
    firstName: String,  //String type
    lastName: String,  //String type
	is_admin: {type: Boolean, default: false },
	active: {type: Boolean, default: false },
	token_activation: String,
	deleted: {type: Boolean, default: false },
    email: {type: String, required: true, unique: true},  //String type and required
	username: {type: String, required: true, unique: true},  //String type and required
    password: {type: String, required: true}, //Number type and required
});

// Bcrypt middleware on UserSchema
UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

//Password verification
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// make this available to our users in our Node applications
module.exports = mongoose.model('User', UserSchema);
