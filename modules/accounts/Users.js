var mongoose = require('mongoose');
var crypto = require('crypto');
var uuid = require('node-uuid');
var validator = require('validator');

function hash(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
}

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    salt: { type: String, required: true, default: uuid.v1 },
    password: {type: String, required: true},
    email: {
        type: String,
        required: true,
        trim: true,
        validate: [validator.isEmail, 'invalid email']
    },
    roles: { type: String, required: true, default: "user"}
});

userSchema.methods.setPassword = function(passwordString) {
    this.password = hash(passwordString, this.salt);
};

userSchema.methods.isValidPassword = function(passwordString) {
    return this.password === hash(passwordString, this.salt);
};

var User = mongoose.model('Users', userSchema);

module.exports = User;