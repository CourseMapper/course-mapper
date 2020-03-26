var mongoose = require('mongoose');
var crypto = require('crypto');
var uuid = require('uuid');
var validator = require('validator');
var gravatar = require('gravatar');

function hash(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
}

function generateActivationCode(salt) {
    return crypto.createHmac('sha256', salt).update(uuid.v1()).digest('hex');
}

function generateGravatarImage(email) {
    var url = gravatar.url(email, {s: '200', r: 'pg', d: 'mm'});
    return url;
}

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    facebook: {
        type: mongoose.Schema.Types.Mixed
    },
    l2p: {
        type: mongoose.Schema.Types.Mixed
    },
    displayName: {
        type: String
    },
    l2pUserId: {
        type: String
    },
    image: {
        type: String
    },
    salt: {type: String, required: true, default: uuid.v1},
    password: {type: String, required: true},
    email: {
        type: String,
        trim: true,
        validate: [validator.isEmail, 'invalid email']
    },
    role: {type: String, required: true, default: "user"},

    isActivated: {type: Boolean, required: true, default: true},
    activationCode: {type: String, required: true, default: "-"},
    dateUpdated: {type: Date},
    dateAdded: {type: Date},

    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    usePushEach: true
});

userSchema.pre('save', function (next) {
    this.dateUpdated = new Date();

    if (!this.dateAdded) {
        this.dateAdded = this.dateUpdated;
    }

    var user = this;
    if (!user.isModified('password')) return next();

    next();
});

userSchema.methods.setPassword = function (passwordString) {
    this.password = hash(passwordString, this.salt);
};

userSchema.methods.setImage = function (email) {
    this.image = generateGravatarImage(email);
};

userSchema.methods.setActivationCode = function () {
    this.activationCode = generateActivationCode(this.salt);
};

userSchema.methods.activate = function () {
    this.isActivated = true;
};

userSchema.methods.deactivate = function () {
    this.isActivated = false;
};

userSchema.methods.isValidPassword = function (passwordString) {
    return this.password === hash(passwordString, this.salt);
};

var User = mongoose.model('users', userSchema);

module.exports = User;
