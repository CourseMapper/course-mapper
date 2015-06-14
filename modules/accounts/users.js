var mongoose = require('mongoose');
var crypto = require('crypto');
var uuid = require('node-uuid');
var validator = require('validator');

function hash(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
}

function generateActivationCode(salt){
    return crypto.createHmac('sha256', salt).update(uuid.v1()).digest('hex');
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
    role: { type: String, required: true, default: "user"},

    isActivated: {type: Boolean, required: true, default: true},
    activationCode: {type: String, required: true, default: "-"},
    dateUpdated: { type: Date },
    dateAdded: { type: Date }
});

userSchema.pre('save', function(next){
    this.dateUpdated = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = this.dateUpdated;
    }

    next();
});

userSchema.methods.setPassword = function(passwordString) {
    this.password = hash(passwordString, this.salt);
};

userSchema.methods.setActivationCode = function() {
    this.activationCode = generateActivationCode(this.salt);
};

userSchema.methods.activate = function() {
    this.isActivated = true;
};

userSchema.methods.deactivate = function() {
    this.isActivated = false;
};

userSchema.methods.isValidPassword = function(passwordString) {
    return this.password === hash(passwordString, this.salt);
};

var User = mongoose.model('users', userSchema);

module.exports = User;